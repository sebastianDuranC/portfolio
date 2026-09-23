class LinuxOS {
    constructor() {
        this.windows = document.querySelectorAll('.os-window');
        this.highestZIndex = 100;
        this.openWindows = new Set();
        
        this.init();
    }

    init() {
        this.setupClock();
        this.setupDraggableWindows();
        this.setupWindowClickToFront();
        this.setupLogin();
        this.setupResizers();
    }

    setupLogin() {
        const passwordInput = document.getElementById('login-password');
        if (passwordInput) {
            passwordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.login();
                }
            });
            // Focus on input
            passwordInput.focus();
        }

        // Also allow enter anywhere to login
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const loginScreen = document.getElementById('login-screen');
                if(loginScreen && loginScreen.style.display !== 'none' && !loginScreen.classList.contains('fade-out')) {
                    this.login();
                }
            }
        });
    }

    login() {
        const loginScreen = document.getElementById('login-screen');
        if (loginScreen) {
            loginScreen.classList.add('fade-out');
            setTimeout(() => {
                loginScreen.style.display = 'none';
                // Automatically open terminal on startup to show neofetch
                this.openWindow('terminal');
                setTimeout(() => {
                    if (window.terminalParser) {
                        window.terminalParser.runCommand('whoami');
                        window.terminalParser.runCommand('neofetch');
                    }
                }, 100);
            }, 500); // Wait for transition to complete
        }
    }

    setupClock() {
        const dateElement = document.getElementById('topbar-date');
        
        const updateClock = () => {
            const now = new Date();
            const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            // Spanish locale matching the html lang
            let dateString = now.toLocaleDateString('es-ES', options).replace(',', '');
            // Capitalize first letter of day and month
            dateString = dateString.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
            dateElement.textContent = dateString;
        };

        updateClock();
        setInterval(updateClock, 1000);
    }

    bringToFront(windowElement) {
        this.highestZIndex++;
        windowElement.style.zIndex = this.highestZIndex;

        // Update active/inactive classes
        this.windows.forEach(win => {
            if (win === windowElement) {
                win.classList.add('window-active');
                win.classList.remove('window-inactive');
            } else {
                win.classList.remove('window-active');
                win.classList.add('window-inactive');
            }
        });
    }

    setupWindowClickToFront() {
        this.windows.forEach(win => {
            win.addEventListener('mousedown', () => {
                this.bringToFront(win);
            });
        });
    }

    setupResizers() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    isResizing = true;
                    currentResizer = resizer;
                    this.bringToFront(win);
                });
            });

            document.addEventListener('mousemove', (e) => {
                if (!isResizing) return;

                if (win.classList.contains('maximized')) return;

                const rect = win.getBoundingClientRect();

                if (currentResizer.classList.contains('right')) {
                    win.style.width = (e.clientX - rect.left) + 'px';
                } else if (currentResizer.classList.contains('bottom')) {
                    win.style.height = (e.clientY - rect.top) + 'px';
                } else if (currentResizer.classList.contains('bottom-right')) {
                    win.style.width = (e.clientX - rect.left) + 'px';
                    win.style.height = (e.clientY - rect.top) + 'px';
                }
            });

            document.addEventListener('mouseup', () => {
                isResizing = false;
            });
        });
    }

    setupDraggableWindows() {
        this.windows.forEach(win => {
            const header = win.querySelector('.window-header');
            if (!header) return;

            let isDragging = false;
            let initialX;
            let initialY;
            let xOffset = 0;
            let yOffset = 0;

            const dragStart = (e) => {
                if(e.target.closest('button')) return;

                if(win.classList.contains('maximized')) {
                    const rect = win.getBoundingClientRect();
                    xOffset = e.clientX - rect.left;
                    yOffset = e.clientY - rect.top;
                } else {
                    const transform = win.style.transform;
                    if (transform && transform !== 'none') {
                        const match = transform.match(/translate3d\(([^px]+)px,\s*([^px]+)px/);
                        if (match) {
                            xOffset = parseFloat(match[1]);
                            yOffset = parseFloat(match[2]);
                        }
                    } else {
                        xOffset = 0;
                        yOffset = 0;
                    }
                }

                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;
                }
            };

            const drag = (e) => {
                if (isDragging) {
                    e.preventDefault();

                    if(win.classList.contains('maximized')) {
                        win.classList.remove('maximized');
                        win.style.transform = 'none';
                        const desktopRect = document.getElementById('desktop').getBoundingClientRect();
                        xOffset = e.clientX - desktopRect.left - (win.offsetWidth / 2);
                        yOffset = e.clientY - desktopRect.top - (header.offsetHeight / 2);
                        initialX = e.clientX - xOffset;
                        initialY = e.clientY - yOffset;
                        setTranslate(xOffset, yOffset, win);
                    } else {
                        let currentX = e.clientX - initialX;
                        let currentY = e.clientY - initialY;

                        xOffset = currentX;
                        yOffset = currentY;

                        setTranslate(currentX, currentY, win);

                        if (e.clientY <= 28) { // Aero snap to top bar
                             this.maximizeWindow(win.dataset.id);
                             isDragging = false;
                        }
                    }
                }
            };

            const setTranslate = (xPos, yPos, el) => {
                el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
            };

            const dragEnd = (e) => {
                isDragging = false;
            };

            header.addEventListener('mousedown', dragStart);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);
        });
    }

    openWindow(id) {
        const win = document.getElementById(`window-${id}`);
        const dot = document.getElementById(`dot-${id}`);
        
        if (win) {
            if (win.classList.contains('hidden') || win.classList.contains('minimized')) {
                win.classList.remove('hidden', 'minimized');
                win.classList.add('window-opening');

                // Remove animation class after it finishes
                setTimeout(() => {
                    win.classList.remove('window-opening');
                }, 200);

                this.bringToFront(win);
                this.openWindows.add(id);

                if(dot) dot.classList.remove('hidden');

                if (id === 'terminal') {
                    const input = document.getElementById('terminal-input');
                    if (input) input.focus();
                }
            } else {
                this.bringToFront(win);
            }
        }
    }

    closeWindow(id) {
        const win = document.getElementById(`window-${id}`);
        const dot = document.getElementById(`dot-${id}`);
        
        if (win) {
            win.classList.add('hidden');
            win.classList.remove('maximized');

            this.openWindows.delete(id);
            if(dot) dot.classList.add('hidden');
        }
    }

    minimizeWindow(id) {
        const win = document.getElementById(`window-${id}`);
        if (win) {
            win.classList.add('minimized');
        }
    }

    maximizeWindow(id) {
        const win = document.getElementById(`window-${id}`);
        if (win) {
            if (!win.classList.contains('maximized')) {
                // Save current transform before maximizing
                win.dataset.prevTransform = win.style.transform;
                win.classList.add('maximized');
                win.style.transform = 'none';
            } else {
                win.classList.remove('maximized');
                // Restore transform
                if (win.dataset.prevTransform) {
                    win.style.transform = win.dataset.prevTransform;
                }
            }
            this.bringToFront(win);
        }
    }

    toggleWindow(id) {
        const win = document.getElementById(`window-${id}`);
        if(win && !win.classList.contains('hidden')) {
            if(win.classList.contains('minimized')) {
                this.openWindow(id);
            } else {
                // If it's the top window, minimize it. Otherwise, bring to front.
                if(parseInt(win.style.zIndex || 0) === this.highestZIndex) {
                    this.minimizeWindow(id);
                } else {
                    this.bringToFront(win);
                }
            }
        } else {
            this.openWindow(id);
        }
    }
}

class TerminalParser {
    constructor() {
        this.output = document.getElementById('terminal-output');
        this.input = document.getElementById('terminal-input');

        if (this.input) {
            this.input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const cmd = this.input.value.trim();
                    this.input.value = '';
                    this.runCommand(cmd);
                }
            });

            document.getElementById('terminal-content').addEventListener('click', () => {
                this.input.focus();
            });
        }
    }

    printLine(html) {
        const p = document.createElement('div');
        p.className = 'mb-2';
        p.innerHTML = html;
        this.output.appendChild(p);
        this.scrollToBottom();
    }

    printText(text, className="text-gray-100 mb-4") {
        const p = document.createElement('div');
        p.className = className;
        p.textContent = text;
        this.output.appendChild(p);
        this.scrollToBottom();
    }

    printHTML(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        this.output.appendChild(div);
        this.scrollToBottom();
    }

    scrollToBottom() {
        const content = document.getElementById('terminal-content');
        if (content) {
            content.scrollTop = content.scrollHeight;
        }
    }

    escapeHTML(str) {
        return str.replace(/[&<>'"]/g,
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }

    runCommand(cmd) {
        this.printLine(`<span class="text-green-400 font-bold">sebastian@adwaita</span>:<span class="text-blue-400 font-bold">~</span>$ ${this.escapeHTML(cmd)}`);

        if (!cmd) return;

        const args = cmd.split(' ');
        const command = args[0].toLowerCase();

        switch (command) {
            case 'help':
                this.printHTML(`
                    <div class="text-gray-100 mb-4">
                        <p>Comandos disponibles:</p>
                        <ul class="list-disc ml-4">
                            <li><span class="text-blue-300">whoami</span> - Muestra el usuario actual</li>
                            <li><span class="text-blue-300">neofetch</span> - Muestra información del sistema</li>
                            <li><span class="text-blue-300">ls</span> - Lista los archivos</li>
                            <li><span class="text-blue-300">cat &lt;file&gt;</span> - Lee el contenido de un archivo</li>
                            <li><span class="text-blue-300">clear</span> - Limpia la terminal</li>
                            <li><span class="text-blue-300">open &lt;app&gt;</span> - Abre una aplicación (projects, skills, contact)</li>
                            <li><span class="text-blue-300">help</span> - Muestra esta ayuda</li>
                        </ul>
                    </div>
                `);
                break;
            case 'whoami':
                this.printText('Sebastian Duran Caballero');
                break;
            case 'clear':
                this.output.innerHTML = '';
                break;
            case 'ls':
                this.printHTML(`
                    <div class="text-blue-300 mb-4 flex space-x-4">
                        <span>description.txt</span>
                        <span>skills.txt</span>
                        <span>projects/</span>
                    </div>
                `);
                break;
            case 'cat':
                if (args[1] === 'description.txt') {
                    this.printText('Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.');
                } else if (args[1] === 'skills.txt') {
                    this.printText('C#, .NET, SQL Server, HTML, CSS, JavaScript, Git');
                } else if (!args[1]) {
                    this.printText('cat: falta el operando de archivo');
                } else {
                    this.printText(`cat: ${this.escapeHTML(args[1])}: No existe el archivo o el directorio`);
                }
                break;
            case 'neofetch':
                this.printHTML(`
                    <div class="flex flex-col md:flex-row text-gray-100 mb-4">
                        <div class="mr-6 mb-4 md:mb-0 text-[#3584e4] text-xs sm:text-sm font-bold">
<pre>
       _,-/&#96;--,-/\\-,
     ,' /   ,-'   ) \\
   ,'  |  ,'     /   \\
  /    | /      /     \\
 /      /      /      |
|      /      /       |
|      |     /        |
|      |    /         |
 \\     |   /         /
  \\    |  /         /
   \`.  | /        ,'
     \`./'      ,-'
       \`-----'
</pre>
                        </div>
                        <div>
                            <p><span class="text-[#3584e4] font-bold">OS:</span> Adwaita 22.04 LTS x86_64</p>
                            <p><span class="text-[#3584e4] font-bold">Host:</span> Desarrollador Web</p>
                            <p><span class="text-[#3584e4] font-bold">Uptime:</span> 24/7 coding</p>
                            <p><span class="text-[#3584e4] font-bold">Packages:</span> HTML, CSS, JS, .NET, C#</p>
                            <p><span class="text-[#3584e4] font-bold">Shell:</span> bash 5.1.16</p>
                            <p><span class="text-[#3584e4] font-bold">Location:</span> Santa Cruz, Bolivia</p>
                            <p><span class="text-[#3584e4] font-bold">Email:</span> sd8587793@email.com</p>
                        </div>
                    </div>
                `);
                break;
            case 'open':
                const appName = args[1];
                if (['projects', 'skills', 'contact'].includes(appName)) {
                    if (window.app) {
                        window.app.openWindow(appName);
                        this.printText(`Abriendo ${appName}...`);
                    }
                } else {
                    this.printText(`open: aplicación '${appName}' no encontrada`);
                }
                break;
            default:
                this.printText(`${this.escapeHTML(command)}: orden no encontrada`);
                break;
        }
    }
}

// Initialize the OS
window.app = new LinuxOS();
window.terminalParser = new TerminalParser();
