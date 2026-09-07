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
        this.setupResizing();

        // Initialize Terminal Parser
        this.terminalParser = new TerminalParser();
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

    setupDraggableWindows() {
        this.windows.forEach(win => {
            const header = win.querySelector('.window-header');
            if (!header) return;

            let isDragging = false;
            let currentX;
            let currentY;
            let initialX;
            let initialY;
            let xOffset = 0;
            let yOffset = 0;

            header.addEventListener('mousedown', dragStart);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);

            function dragStart(e) {
                if (e.target.closest('button')) return;

                if (win.classList.contains('maximized')) {
                    win.classList.remove('maximized');
                    win.style.transform = 'none';

                    const rect = win.getBoundingClientRect();
                    xOffset = e.clientX - (rect.width / 2);
                    yOffset = e.clientY - (rect.height / 2);

                    if(yOffset < 0) yOffset = 0;

                    setTranslate(xOffset, yOffset, win);

                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;
                    isDragging = true;
                    return;
                }

                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;
                }
            }

            function drag(e) {
                if (isDragging) {
                    e.preventDefault();

                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;

                    xOffset = currentX;
                    yOffset = currentY;

                    setTranslate(currentX, currentY, win);
                }
            }

            function setTranslate(xPos, yPos, el) {
                el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
            }

            function dragEnd(e) {
                initialX = currentX;
                initialY = currentY;
                isDragging = false;
            }
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

    setupResizing() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            if (resizers.length === 0) return;

            let isResizing = false;
            let currentResizer;
            let startWidth, startHeight, startX, startY;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    isResizing = true;
                    currentResizer = resizer;
                    startWidth = parseFloat(getComputedStyle(win).width.replace('px', ''));
                    startHeight = parseFloat(getComputedStyle(win).height.replace('px', ''));
                    startX = e.clientX;
                    startY = e.clientY;

                    // Convert w-[80%] h-[70%] to fixed px for smooth resizing
                    win.style.width = startWidth + 'px';
                    win.style.height = startHeight + 'px';
                });
            });

            document.addEventListener('mousemove', (e) => {
                if (!isResizing) return;

                if (currentResizer.classList.contains('resizer-r')) {
                    const newWidth = startWidth + (e.clientX - startX);
                    if (newWidth > 300) win.style.width = newWidth + 'px';
                } else if (currentResizer.classList.contains('resizer-b')) {
                    const newHeight = startHeight + (e.clientY - startY);
                    if (newHeight > 200) win.style.height = newHeight + 'px';
                } else if (currentResizer.classList.contains('resizer-br')) {
                    const newWidth = startWidth + (e.clientX - startX);
                    const newHeight = startHeight + (e.clientY - startY);
                    if (newWidth > 300) win.style.width = newWidth + 'px';
                    if (newHeight > 200) win.style.height = newHeight + 'px';
                }
            });

            document.addEventListener('mouseup', () => {
                isResizing = false;
            });
        });
    }
}

class TerminalParser {
    constructor() {
        this.input = document.getElementById('terminal-input');
        this.output = document.getElementById('terminal-output');
        this.fileSystem = {
            'description.txt': 'Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.',
            'projects': 'Directorio de proyectos',
            'skills': 'Directorio de habilidades',
            'contact': 'Información de contacto'
        };

        if (this.input) {
            this.input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const command = this.input.value.trim();
                    this.input.value = '';
                    this.execute(command);
                }
            });
            this.populateInitialOutput();
        }
    }

    populateInitialOutput() {
        this.printCommand('whoami');
        this.printOutput('Sebastian Duran Caballero');
        this.printCommand('neofetch');
        this.printNeofetch();
    }

    escapeHTML(str) {
        return str.replace(/[&<>'"]/g,
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag])
        );
    }

    printCommand(cmd) {
        const div = document.createElement('div');
        div.className = 'mb-2';
        div.innerHTML = `<span class="text-green-400 font-bold">sebastian@adwaita</span>:<span class="text-blue-400 font-bold">~</span>$ ${this.escapeHTML(cmd)}`;
        this.output.appendChild(div);
    }

    printOutput(text) {
        const div = document.createElement('div');
        div.className = 'text-gray-100 mb-4 whitespace-pre-wrap';
        div.textContent = text;
        this.output.appendChild(div);
        this.scrollToBottom();
    }

    printHTML(html) {
        const div = document.createElement('div');
        div.className = 'text-gray-100 mb-4';
        div.innerHTML = html;
        this.output.appendChild(div);
        this.scrollToBottom();
    }

    scrollToBottom() {
        const content = document.getElementById('terminal-content');
        if(content) content.scrollTop = content.scrollHeight;
    }

    printNeofetch() {
        this.printHTML(`
        <div class="flex flex-col md:flex-row text-gray-100">
            <div class="mr-6 mb-4 md:mb-0 text-[#3584e4] text-xs sm:text-sm font-bold">
<pre>
       _,-/\`--,-\/\\-,
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
        </div>`);
    }

    execute(commandStr) {
        if (!commandStr) {
            this.printCommand('');
            return;
        }

        this.printCommand(commandStr);
        const args = commandStr.split(' ');
        const cmd = args[0].toLowerCase();

        switch (cmd) {
            case 'help':
                this.printOutput('Comandos disponibles:\n  help      - Muestra esta ayuda\n  whoami    - Muestra el usuario actual\n  clear     - Limpia la terminal\n  ls        - Lista archivos en el directorio actual\n  neofetch  - Muestra información del sistema\n  cat       - Lee el contenido de un archivo (ej: cat description.txt)\n  open      - Abre una ventana (ej: open projects, open skills, open contact)');
                break;
            case 'whoami':
                this.printOutput('Sebastian Duran Caballero');
                break;
            case 'clear':
                this.output.innerHTML = '';
                break;
            case 'ls':
                this.printOutput('description.txt   projects/   skills/   contact/');
                break;
            case 'neofetch':
                this.printNeofetch();
                break;
            case 'cat':
                if (args[1]) {
                    if (this.fileSystem[args[1]]) {
                        this.printOutput(this.fileSystem[args[1]]);
                    } else {
                        this.printOutput(`cat: ${args[1]}: No such file or directory`);
                    }
                } else {
                    this.printOutput('cat: missing operand');
                }
                break;
            case 'open':
                if (args[1]) {
                    const target = args[1].toLowerCase();
                    if (['projects', 'skills', 'contact'].includes(target)) {
                        window.app.openWindow(target);
                        this.printOutput(`Opening ${target}...`);
                    } else {
                        this.printOutput(`open: ${args[1]}: Application not found`);
                    }
                } else {
                    this.printOutput('open: missing application name');
                }
                break;
            default:
                this.printOutput(`${cmd}: command not found`);
                break;
        }
    }
}

// Initialize the OS globally
window.app = new LinuxOS();