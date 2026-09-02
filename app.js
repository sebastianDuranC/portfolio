class LinuxOS {
    constructor() {
        this.windows = document.querySelectorAll('.os-window');
        this.highestZIndex = 100;
        this.openWindows = new Set();
        
        window.app = this;

        this.init();
    }

    init() {
        this.setupClock();
        this.setupDraggableWindows();
        this.setupWindowClickToFront();
        this.setupLogin();
        this.setupResizableWindows();
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
        const desktop = document.getElementById('desktop');

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
                // Don't drag if maximizing/closing buttons are clicked
                if(e.target.closest('button')) return;

                if(win.classList.contains('maximized')) {
                    // Start dragging from maximized state
                    win.classList.remove('maximized');
                    win.style.transform = 'none';

                    const rect = win.getBoundingClientRect();
                    const desktopRect = desktop.getBoundingClientRect();

                    xOffset = rect.left - desktopRect.left;
                    yOffset = rect.top - desktopRect.top;

                    setTranslate(xOffset, yOffset, win);
                }

                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;
                }
            }

            const self = this;
            function drag(e) {
                if (isDragging) {
                    e.preventDefault();

                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;

                    xOffset = currentX;
                    yOffset = currentY;

                    setTranslate(currentX, currentY, win);

                    // Aero snap preview (optional enhancement, but we'll just snap on dragEnd for simplicity)
                }
            }

            function setTranslate(xPos, yPos, el) {
                el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
            }

            function dragEnd(e) {
                if(isDragging) {
                    initialX = currentX;
                    initialY = currentY;
                    isDragging = false;

                    // Aero snap: Maximize if dragged to top
                    if(e.clientY <= 28 + 5) { // 28px top bar + 5px threshold
                        self.maximizeWindow(win.dataset.id, true);
                    }
                }
            }
        });
    }

    setupResizableWindows() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer;
            let initialWidth, initialHeight, initialMouseX, initialMouseY;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', function(e) {
                    if (win.classList.contains('maximized')) return;

                    e.preventDefault();
                    isResizing = true;
                    currentResizer = resizer;

                    // Get computed styles because Tailwind classes might be overriding style.width
                    const rect = win.getBoundingClientRect();
                    initialWidth = rect.width;
                    initialHeight = rect.height;

                    initialMouseX = e.clientX;
                    initialMouseY = e.clientY;

                    document.addEventListener('mousemove', resize);
                    document.addEventListener('mouseup', stopResize);
                });
            });

            function resize(e) {
                if (!isResizing) return;

                if (currentResizer.classList.contains('resizer-r') || currentResizer.classList.contains('resizer-br')) {
                    const width = initialWidth + (e.clientX - initialMouseX);
                    win.style.width = `${Math.max(300, width)}px`;
                }

                if (currentResizer.classList.contains('resizer-b') || currentResizer.classList.contains('resizer-br')) {
                    const height = initialHeight + (e.clientY - initialMouseY);
                    win.style.height = `${Math.max(200, height)}px`;
                }
            }

            function stopResize() {
                isResizing = false;
                document.removeEventListener('mousemove', resize);
                document.removeEventListener('mouseup', stopResize);
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

    maximizeWindow(id, forceMaximize = false) {
        const win = document.getElementById(`window-${id}`);
        if (win) {
            if (!win.classList.contains('maximized') || forceMaximize) {
                if(!forceMaximize || !win.dataset.prevTransform) {
                    // Save current transform before maximizing
                    win.dataset.prevTransform = win.style.transform;
                }
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

        if (!this.output || !this.input) return;

        this.commands = {
            'help': () => this.printHelp(),
            'whoami': () => this.printLine('Sebastian Duran Caballero'),
            'clear': () => this.clear(),
            'ls': () => this.printLine('description.txt  proyectos/  habilidades/  contacto/'),
            'neofetch': () => this.printNeofetch(),
            'cat': (args) => this.catCommand(args),
            'open': (args) => this.openCommand(args)
        };

        this.init();
    }

    init() {
        // Pre-populate terminal
        this.printCommand('whoami');
        this.commands['whoami']();
        this.printCommand('neofetch');
        this.commands['neofetch']();

        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const commandLine = this.input.value.trim();
                if (commandLine) {
                    this.printCommand(commandLine);
                    this.executeCommand(commandLine);
                }
                this.input.value = '';
                this.scrollToBottom();
            }
        });
    }

    printCommand(cmd) {
        const cmdLine = document.createElement('div');
        cmdLine.className = 'mb-1';

        const prompt = document.createElement('span');
        prompt.innerHTML = '<span class="text-green-400 font-bold">sebastian@ubuntu</span>:<span class="text-blue-400 font-bold">~</span>$ ';

        const cmdText = document.createElement('span');
        cmdText.textContent = cmd;

        cmdLine.appendChild(prompt);
        cmdLine.appendChild(cmdText);
        this.output.appendChild(cmdLine);
    }

    printLine(text) {
        const line = document.createElement('div');
        line.className = 'text-gray-100 mb-2';
        line.textContent = text;
        this.output.appendChild(line);
    }

    printHTML(html) {
        const div = document.createElement('div');
        div.className = 'mb-2';
        div.innerHTML = html;
        this.output.appendChild(div);
    }

    executeCommand(commandLine) {
        const parts = commandLine.split(' ').filter(p => p.trim() !== '');
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        if (this.commands[cmd]) {
            this.commands[cmd](args);
        } else {
            this.printLine(`bash: ${cmd}: orden no encontrada`);
        }
    }

    clear() {
        this.output.innerHTML = '';
    }

    printHelp() {
        this.printLine('Comandos disponibles:');
        this.printLine('  help      - Muestra este mensaje');
        this.printLine('  whoami    - Muestra el usuario actual');
        this.printLine('  clear     - Limpia la terminal');
        this.printLine('  ls        - Lista los archivos');
        this.printLine('  neofetch  - Muestra información del sistema');
        this.printLine('  cat       - Muestra el contenido de un archivo (ej. cat description.txt)');
        this.printLine('  open      - Abre una aplicación (ej. open projects, open skills, open contact)');
    }

    printNeofetch() {
        const html = `
            <div class="flex flex-col md:flex-row text-gray-100 mb-2">
                <div class="mr-6 mb-4 md:mb-0 text-[#e95420] text-xs sm:text-sm font-bold">
<pre>
       _,-/\`--,-/\\-,
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
                    <p><span class="text-[#e95420] font-bold">OS:</span> Ubuntu 22.04 LTS x86_64</p>
                    <p><span class="text-[#e95420] font-bold">Host:</span> Desarrollador Web</p>
                    <p><span class="text-[#e95420] font-bold">Uptime:</span> 24/7 coding</p>
                    <p><span class="text-[#e95420] font-bold">Packages:</span> HTML, CSS, JS, .NET, C#</p>
                    <p><span class="text-[#e95420] font-bold">Shell:</span> bash 5.1.16</p>
                    <p><span class="text-[#e95420] font-bold">Location:</span> Santa Cruz, Bolivia</p>
                    <p><span class="text-[#e95420] font-bold">Email:</span> sd8587793@email.com</p>
                </div>
            </div>
        `;
        this.printHTML(html);
    }

    catCommand(args) {
        if (args.length === 0) {
            this.printLine('cat: falta el operando de archivo');
            return;
        }

        if (args[0] === 'description.txt') {
            this.printLine('Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.');
        } else {
            const safeArg = document.createTextNode(args[0]).textContent;
            this.printLine(`cat: ${safeArg}: No existe el archivo o el directorio`);
        }
    }

    openCommand(args) {
        if (args.length === 0) {
            this.printLine('open: falta especificar qué abrir. Ej: open projects');
            return;
        }

        const appName = args[0].toLowerCase();
        const validApps = ['projects', 'skills', 'contact', 'terminal'];

        if (validApps.includes(appName)) {
            this.printLine(`Abriendo ${appName}...`);
            if(window.app) {
                window.app.openWindow(appName);
            }
        } else {
            const safeArg = document.createTextNode(appName).textContent;
            this.printLine(`open: aplicación no encontrada: ${safeArg}`);
        }
    }

    scrollToBottom() {
        const container = document.getElementById('terminal-content');
        if(container) {
            container.scrollTop = container.scrollHeight;
        }
    }
}

// Initialize the OS
const app = new LinuxOS();
// Initialize Terminal
const terminal = new TerminalParser();