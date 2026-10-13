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
        this.setupResizableWindows();
        this.setupWindowClickToFront();
        this.setupLogin();
    }

    setupLogin() {
        const passwordInput = document.getElementById('login-password');
        if (passwordInput) {
            passwordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.login();
                }
            });
            passwordInput.focus();
        }

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
                this.openWindow('terminal');
            }, 500);
        }
    }

    setupClock() {
        const dateElement = document.getElementById('topbar-date');
        
        const updateClock = () => {
            const now = new Date();
            const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            let dateString = now.toLocaleDateString('es-ES', options).replace(',', '');
            dateString = dateString.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
            dateElement.textContent = dateString;
        };

        updateClock();
        setInterval(updateClock, 1000);
    }

    bringToFront(windowElement) {
        this.highestZIndex++;
        windowElement.style.zIndex = this.highestZIndex;

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

            const dragStart = (e) => {
                if(e.target.closest('button') || e.target.classList.contains('resizer')) return;

                if (win.classList.contains('maximized')) {
                    // Temporarily unset transform to calculate exact offsets when dragging maximized window
                    win.classList.remove('maximized');
                    win.style.transform = 'none';

                    const rect = win.getBoundingClientRect();
                    xOffset = e.clientX - rect.left - (rect.width / 2);
                    yOffset = e.clientY - rect.top;

                    win.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0)`;
                }

                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;
                    this.bringToFront(win);
                }
            };

            const drag = (e) => {
                if (isDragging) {
                    e.preventDefault();

                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;

                    xOffset = currentX;
                    yOffset = currentY;

                    win.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0)`;
                }
            };

            const dragEnd = () => {
                initialX = currentX;
                initialY = currentY;
                isDragging = false;
            };

            header.addEventListener('mousedown', dragStart);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);
        });
    }

    setupResizableWindows() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer;
            let startWidth, startHeight, startX, startY;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    if (win.classList.contains('maximized')) return;
                    e.preventDefault();
                    isResizing = true;
                    currentResizer = resizer;
                    this.bringToFront(win);

                    const rect = win.getBoundingClientRect();
                    startWidth = rect.width;
                    startHeight = rect.height;
                    startX = e.clientX;
                    startY = e.clientY;

                    document.addEventListener('mousemove', resize);
                    document.addEventListener('mouseup', stopResize);
                });
            });

            const resize = (e) => {
                if (!isResizing) return;

                if (currentResizer.classList.contains('resizer-r')) {
                    win.style.width = startWidth + (e.clientX - startX) + 'px';
                } else if (currentResizer.classList.contains('resizer-b')) {
                    win.style.height = startHeight + (e.clientY - startY) + 'px';
                } else if (currentResizer.classList.contains('resizer-br')) {
                    win.style.width = startWidth + (e.clientX - startX) + 'px';
                    win.style.height = startHeight + (e.clientY - startY) + 'px';
                }
            };

            const stopResize = () => {
                isResizing = false;
                document.removeEventListener('mousemove', resize);
                document.removeEventListener('mouseup', stopResize);
            };
        });
    }

    openWindow(id) {
        const win = document.getElementById(`window-${id}`);
        const dot = document.getElementById(`dot-${id}`);
        
        if (win) {
            if (win.classList.contains('hidden') || win.classList.contains('minimized')) {
                win.classList.remove('hidden', 'minimized');
                win.classList.add('window-opening');

                setTimeout(() => {
                    win.classList.remove('window-opening');
                }, 200);

                this.bringToFront(win);
                this.openWindows.add(id);

                if(dot) dot.classList.remove('hidden');

                if (id === 'terminal') {
                    const input = document.getElementById('terminal-input');
                    if(input) input.focus();
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

            // reset transform so it opens in default position next time
            win.style.transform = 'none';

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
                win.dataset.prevTransform = win.style.transform;
                win.dataset.prevWidth = win.style.width;
                win.dataset.prevHeight = win.style.height;

                win.classList.add('maximized');
                win.style.transform = 'none';
                win.style.width = '100%';
                win.style.height = '100%';
            } else {
                win.classList.remove('maximized');
                if (win.dataset.prevTransform) {
                    win.style.transform = win.dataset.prevTransform;
                }
                if (win.dataset.prevWidth) {
                    win.style.width = win.dataset.prevWidth;
                }
                if (win.dataset.prevHeight) {
                    win.style.height = win.dataset.prevHeight;
                }
            }
            this.bringToFront(win);
        }
    }
}

class TerminalParser {
    constructor() {
        this.input = document.getElementById('terminal-input');
        this.output = document.getElementById('terminal-output');
        this.content = document.getElementById('terminal-content');

        if(this.input) {
            this.init();
        }
    }

    init() {
        // Pre-populate neofetch
        this.printPrompt();
        this.printText('neofetch');
        this.executeNeofetch();

        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = this.input.value.trim();
                this.input.value = '';

                this.printPrompt();
                this.printText(cmd);

                this.processCommand(cmd);
                this.scrollToBottom();
            }
        });
    }

    escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    printPrompt() {
        const prompt = document.createElement('div');
        prompt.innerHTML = `<span class="text-[#26a269] font-bold">sebastian@adwaita</span><span class="text-gray-300">:</span><span class="text-[#125997] font-bold">~</span><span class="text-gray-300 mr-2">$</span>`;
        prompt.classList.add('inline-block');
        this.output.appendChild(prompt);
    }

    printText(text) {
        const textNode = document.createElement('span');
        textNode.textContent = text + '\n';
        textNode.classList.add('text-gray-200');
        this.output.appendChild(textNode);
        this.output.appendChild(document.createElement('br'));
    }

    printHTML(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        div.classList.add('mb-2');
        this.output.appendChild(div);
    }

    scrollToBottom() {
        if(this.content) {
            this.content.scrollTop = this.content.scrollHeight;
        }
    }

    processCommand(cmdStr) {
        if(!cmdStr) return;

        const parts = cmdStr.split(' ').filter(Boolean);
        const cmd = parts[0].toLowerCase();

        switch(cmd) {
            case 'help':
                this.printHTML(`
                    <div class="text-gray-300 ml-4">
                        Comandos disponibles:<br>
                        <span class="text-[#3584e4]">whoami</span>   - Muestra el usuario actual<br>
                        <span class="text-[#3584e4]">neofetch</span> - Muestra información del sistema<br>
                        <span class="text-[#3584e4]">clear</span>    - Limpia la terminal<br>
                        <span class="text-[#3584e4]">ls</span>       - Lista archivos en el directorio<br>
                        <span class="text-[#3584e4]">cat</span>      - Lee el contenido de un archivo<br>
                        <span class="text-[#3584e4]">open</span>     - Abre una aplicación (ej: open projects)<br>
                        <span class="text-[#3584e4]">help</span>     - Muestra este mensaje
                    </div>
                `);
                break;
            case 'whoami':
                this.printHTML('<div class="text-gray-300 ml-4">Sebastian Duran Caballero</div>');
                break;
            case 'clear':
                this.output.innerHTML = '';
                break;
            case 'ls':
                this.printHTML(`
                    <div class="flex space-x-4 ml-4">
                        <span class="text-[#3584e4] font-bold">projects/</span>
                        <span class="text-gray-300">description.txt</span>
                        <span class="text-gray-300">contact.txt</span>
                    </div>
                `);
                break;
            case 'cat':
                if (parts.length < 2) {
                    this.printHTML('<div class="text-gray-300 ml-4">cat: falta el operando de archivo</div>');
                } else if (parts[1] === 'description.txt') {
                    this.printHTML('<div class="text-gray-300 ml-4">Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.</div>');
                } else if (parts[1] === 'contact.txt') {
                    this.printHTML('<div class="text-gray-300 ml-4">Email: sd8587793@email.com<br>Github: @sebastianDuranC</div>');
                } else {
                    this.printHTML(`<div class="text-gray-300 ml-4">cat: ${this.escapeHTML(parts[1])}: No existe el archivo o el directorio</div>`);
                }
                break;
            case 'open':
                if (parts.length < 2) {
                    this.printHTML('<div class="text-gray-300 ml-4">open: falta especificar la aplicación</div>');
                } else {
                    const appName = parts[1].toLowerCase();
                    if(['projects', 'skills', 'contact'].includes(appName)) {
                        window.app.openWindow(appName);
                    } else {
                        this.printHTML(`<div class="text-gray-300 ml-4">open: aplicación no encontrada: ${this.escapeHTML(appName)}</div>`);
                    }
                }
                break;
            case 'neofetch':
                this.executeNeofetch();
                break;
            default:
                this.printHTML(`<div class="text-gray-300 ml-4">${this.escapeHTML(cmd)}: orden no encontrada</div>`);
        }
    }

    executeNeofetch() {
        const ascii = `
       _,-/\\--,-/\\-,
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
`;
        this.printHTML(`
            <div class="flex flex-col md:flex-row text-gray-100 mb-4 ml-4 mt-2">
                <div class="mr-6 mb-4 md:mb-0 text-[#3584e4] text-xs sm:text-sm font-bold whitespace-pre">${ascii}</div>
                <div class="text-sm">
                    <p><span class="text-[#3584e4] font-bold">OS:</span> Adwaita OS x86_64</p>
                    <p><span class="text-[#3584e4] font-bold">Host:</span> Desarrollador Web</p>
                    <p><span class="text-[#3584e4] font-bold">Uptime:</span> 24/7 coding</p>
                    <p><span class="text-[#3584e4] font-bold">Packages:</span> HTML, CSS, JS, .NET, C#</p>
                    <p><span class="text-[#3584e4] font-bold">Shell:</span> bash 5.1.16</p>
                    <p><span class="text-[#3584e4] font-bold">Location:</span> Santa Cruz, Bolivia</p>
                    <p><span class="text-[#3584e4] font-bold">Email:</span> sd8587793@email.com</p>
                </div>
            </div>
        `);
    }
}

// Export the OS instance globally
window.app = new LinuxOS();
window.terminal = new TerminalParser();
