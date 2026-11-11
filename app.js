class TerminalParser {
    constructor(terminalContent) {
        this.terminalContent = terminalContent;
        this.history = [];
        this.historyIndex = -1;
        this.prompt = 'sebastian@adwaita: ~$ ';
        this.init();
    }

    init() {
        this.addCommandOutput('whoami', 'Sebastian Duran Caballero\nDesarrollador Web .NET');
        this.addCommandOutput('neofetch', this.getNeofetch());
        this.createNewInputLine();

        // Ensure clicking anywhere in terminal focuses the input
        this.terminalContent.parentElement.addEventListener('click', () => {
            const input = this.terminalContent.querySelector('.terminal-input:last-of-type');
            if (input) input.focus();
        });
    }

    getNeofetch() {
        return `
       .MMM..:MMMMMMM            \x1b[34mOS:\x1b[0m Adwaita (Web)
      MMMMMMMMMMMMMMMMMM         \x1b[34mHost:\x1b[0m Desarrollador Web
      MMMMMMMMMMMMMMMMMMMM       \x1b[34mUptime:\x1b[0m 24/7 coding
     MMMMMMMMMMMMMMMMMMMMMM      \x1b[34mPackages:\x1b[0m HTML, CSS, JS, .NET, C#
    .MMMMMMMMMMMMMMMMMMMMMM      \x1b[34mShell:\x1b[0m bash 5.1.16
    MMMMMMMMMMMMMMMMMMMMMMMM     \x1b[34mLocation:\x1b[0m Santa Cruz, Bolivia
    MMMMMMM            MMMMM     \x1b[34mEmail:\x1b[0m sd8587793@email.com
    MMMMMMM            MMMMM
    MMMMMMM            MMMMM
    MMMMMMM            MMMMM
     MMMMMM            MMMM
      MMMMMM          MMMM
       MMMMMM        MMMM
        MMMMMMMMMMMMMMMM
         MMMMMMMMMMMMMM
            MMMMMMMM
        `;
    }

    createNewInputLine() {
        const line = document.createElement('div');
        line.className = 'flex items-center mb-1 text-gray-200 font-mono';

        const promptSpan = document.createElement('span');
        promptSpan.className = 'mr-2 whitespace-pre';
        promptSpan.innerHTML = '<span class="text-green-400 font-bold">sebastian@adwaita</span>:<span class="text-blue-400 font-bold">~</span>$';

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'terminal-input bg-transparent border-none outline-none flex-1 text-gray-200 caret-gray-200 font-mono';
        input.setAttribute('spellcheck', 'false');
        input.setAttribute('autocomplete', 'off');

        input.addEventListener('keydown', (e) => this.handleInput(e, input));

        line.appendChild(promptSpan);
        line.appendChild(input);
        this.terminalContent.appendChild(line);

        // Small delay to ensure it's in DOM before focusing
        setTimeout(() => input.focus(), 10);
        this.scrollToBottom();
    }

    handleInput(e, inputElement) {
        if (e.key === 'Enter') {
            const command = inputElement.value.trim();
            inputElement.disabled = true; // Disable current input

            if (command) {
                this.history.push(command);
                this.historyIndex = this.history.length;
                this.executeCommand(command);
            } else {
                this.createNewInputLine();
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (this.historyIndex > 0) {
                this.historyIndex--;
                inputElement.value = this.history[this.historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (this.historyIndex < this.history.length - 1) {
                this.historyIndex++;
                inputElement.value = this.history[this.historyIndex];
            } else {
                this.historyIndex = this.history.length;
                inputElement.value = '';
            }
        }
    }

    executeCommand(command) {
        const parts = command.split(' ');
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        let output = '';

        switch (cmd) {
            case 'help':
                output = 'Comandos disponibles:\n  whoami    - Muestra informacion del usuario\n  neofetch  - Muestra informacion del sistema\n  ls        - Lista de ventanas\n  open      - Abre una ventana (ej. open projects)\n  clear     - Limpia la terminal\n  cat       - Lee un archivo (ej. cat description.txt)\n  help      - Muestra esta ayuda';
                break;
            case 'whoami':
                output = 'Sebastian Duran Caballero\nDesarrollador Web .NET';
                break;
            case 'clear':
                this.terminalContent.innerHTML = '';
                this.createNewInputLine();
                return; // Early return so we don't print output or create another line
            case 'ls':
                output = 'projects  skills  contact  terminal';
                break;
            case 'open':
                if (args.length > 0) {
                    const winId = args[0];
                    if (['projects', 'skills', 'contact', 'terminal'].includes(winId)) {
                        if (window.app) {
                            window.app.openWindow(winId);
                            output = `Abriendo ${winId}...`;
                        } else {
                            output = `Error: Sistema de ventanas no inicializado.`;
                        }
                    } else {
                        output = `Error: Ventana '${winId}' no encontrada.`;
                    }
                } else {
                    output = 'Uso: open <ventana>\nVentanas disponibles: projects, skills, contact, terminal';
                }
                break;
            case 'cat':
                if (args.length > 0 && args[0] === 'description.txt') {
                    output = 'Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.';
                } else {
                    output = `cat: ${args.length > 0 ? args[0] : ''}: No such file or directory`;
                }
                break;
            case 'neofetch':
                output = this.getNeofetch();
                break;
            default:
                output = `Comando no encontrado: ${cmd}. Escribe 'help' para ver la lista de comandos.`;
        }

        this.addOutputLine(output);
        this.createNewInputLine();
    }

    addCommandOutput(command, output) {
        // Mock a user entering a command
        const line = document.createElement('div');
        line.className = 'flex items-center mb-1 text-gray-200 font-mono';
        line.innerHTML = `<span class="mr-2 whitespace-pre"><span class="text-green-400 font-bold">sebastian@adwaita</span>:<span class="text-blue-400 font-bold">~</span>$</span><span>${this.escapeHTML(command)}</span>`;
        this.terminalContent.appendChild(line);
        this.addOutputLine(output);
    }

    addOutputLine(text) {
        const outputDiv = document.createElement('div');
        outputDiv.className = 'mb-4 text-gray-200 whitespace-pre-wrap font-mono';

        // Simple ANSI color parsing for neofetch
        let formattedText = this.escapeHTML(text);
        formattedText = formattedText.replace(/\\x1b\[34m/g, '<span class="text-blue-400 font-bold">')
                                     .replace(/\\x1b\[0m/g, '</span>');

        outputDiv.innerHTML = formattedText;
        this.terminalContent.appendChild(outputDiv);
        this.scrollToBottom();
    }

    escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    scrollToBottom() {
        this.terminalContent.scrollTop = this.terminalContent.scrollHeight;
    }
}

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
        this.setupWindowResizing();
        this.setupWindowClickToFront();
        this.setupLogin();

        const terminalContent = document.getElementById('terminal-content');
        if (terminalContent) {
            this.terminal = new TerminalParser(terminalContent);
        }
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

            // Store offsets on the DOM element for persistence across maximizations
            if (win.dataset.xOffset === undefined) win.dataset.xOffset = 0;
            if (win.dataset.yOffset === undefined) win.dataset.yOffset = 0;

            const dragStart = (e) => {
                if(e.target.closest('button')) return;

                // If dragging a maximized window, unmaximize it
                if(win.classList.contains('maximized')) {
                    win.classList.remove('maximized');
                    win.style.transform = 'none';

                    // Recalculate offset so it jumps to mouse position properly
                    const rect = win.getBoundingClientRect();
                    const desktopRect = document.getElementById('desktop').getBoundingClientRect();

                    // Center the window horizontally on the mouse
                    const targetLeft = e.clientX - (rect.width / 2);
                    // Keep the top of the window near the mouse
                    const targetTop = e.clientY - 20;

                    win.dataset.xOffset = targetLeft - rect.left;
                    win.dataset.yOffset = targetTop - rect.top;

                    win.style.transform = `translate3d(${win.dataset.xOffset}px, ${win.dataset.yOffset}px, 0)`;
                }

                initialX = e.clientX - parseFloat(win.dataset.xOffset);
                initialY = e.clientY - parseFloat(win.dataset.yOffset);

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

                    win.dataset.xOffset = currentX;
                    win.dataset.yOffset = currentY;

                    win.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
                }
            };

            const dragEnd = (e) => {
                if (!isDragging) return;

                initialX = currentX;
                initialY = currentY;
                isDragging = false;

                // Aero snap to top edge
                if (e.clientY <= 28) { // 28px is topbar height
                    this.maximizeWindow(win.dataset.id);
                }
            };

            header.addEventListener('mousedown', dragStart);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);
        });
    }

    setupWindowResizing() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer;
            let initialMouseX, initialMouseY;
            let initialWidth, initialHeight;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    if(win.classList.contains('maximized')) return;

                    isResizing = true;
                    currentResizer = resizer;
                    initialMouseX = e.clientX;
                    initialMouseY = e.clientY;

                    const rect = win.getBoundingClientRect();
                    initialWidth = rect.width;
                    initialHeight = rect.height;

                    this.bringToFront(win);
                });
            });

            document.addEventListener('mousemove', (e) => {
                if (!isResizing) return;
                e.preventDefault();

                if (currentResizer.classList.contains('resizer-r') || currentResizer.classList.contains('resizer-br')) {
                    const newWidth = initialWidth + (e.clientX - initialMouseX);
                    // respect min-w constraints somewhat manually to avoid layout break
                    win.style.width = `${Math.max(newWidth, 300)}px`;
                }

                if (currentResizer.classList.contains('resizer-b') || currentResizer.classList.contains('resizer-br')) {
                    const newHeight = initialHeight + (e.clientY - initialMouseY);
                    win.style.height = `${Math.max(newHeight, 200)}px`;
                }
            });

            document.addEventListener('mouseup', () => {
                isResizing = false;
            });
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

                // Focus terminal input if terminal is opened
                if (id === 'terminal' && this.terminal) {
                    const input = win.querySelector('.terminal-input:last-of-type');
                    if (input) setTimeout(() => input.focus(), 50);
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

            // Reset transform when closed
            win.style.transform = 'none';
            win.dataset.xOffset = 0;
            win.dataset.yOffset = 0;

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
                win.classList.add('maximized');
                // The CSS will handle top/left/width/height 100% and transform: none
            } else {
                win.classList.remove('maximized');
                // Restore transform from data attributes
                win.style.transform = `translate3d(${win.dataset.xOffset || 0}px, ${win.dataset.yOffset || 0}px, 0)`;
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
}

// Initialize the OS and expose it globally
window.app = new LinuxOS();
