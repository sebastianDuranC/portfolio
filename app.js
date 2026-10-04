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
                // Focus terminal input if available
                const terminalInput = document.getElementById('terminal-input');
                if (terminalInput) {
                    terminalInput.focus();
                }
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
                // Don't drag if maximizing/closing buttons are clicked
                if(e.target.closest('button')) return;

                if (win.classList.contains('maximized')) {
                    // Start dragging to restore window
                    win.classList.remove('maximized');
                    win.style.transform = 'none';

                    // Temporarily remove constraints to calculate natural position
                    const rect = win.getBoundingClientRect();
                    const desktopRect = document.getElementById('desktop').getBoundingClientRect();

                    // We want to drag it exactly where the mouse grabbed it
                    // Calculate relative click position on the header
                    const relativeClickX = e.clientX - desktopRect.left;

                    // Set new offset to position the window under the mouse
                    xOffset = e.clientX - rect.left - (rect.width / 2); // Center horizontally on mouse
                    yOffset = e.clientY - rect.top - (header.getBoundingClientRect().height / 2);

                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;
                } else {
                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;
                }

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;
                    // Prevent text selection while dragging
                    e.preventDefault();
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
                if (isDragging) {
                    initialX = currentX;
                    initialY = currentY;
                    isDragging = false;
                }
            }
        });
    }

    setupWindowResizing() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer;
            let startX, startY, startWidth, startHeight;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    if (win.classList.contains('maximized')) return;
                    e.preventDefault();
                    isResizing = true;
                    currentResizer = resizer;
                    startX = e.clientX;
                    startY = e.clientY;
                    startWidth = parseInt(document.defaultView.getComputedStyle(win).width, 10);
                    startHeight = parseInt(document.defaultView.getComputedStyle(win).height, 10);

                    // Add transition none so it's smooth
                    win.style.transition = 'none';

                    document.addEventListener('mousemove', resize);
                    document.addEventListener('mouseup', stopResize);
                });
            });

            function resize(e) {
                if (!isResizing) return;

                if (currentResizer.classList.contains('resizer-r') || currentResizer.classList.contains('resizer-br')) {
                    win.style.width = startWidth + (e.clientX - startX) + 'px';
                }
                if (currentResizer.classList.contains('resizer-b') || currentResizer.classList.contains('resizer-br')) {
                    win.style.height = startHeight + (e.clientY - startY) + 'px';
                }
            }

            function stopResize() {
                isResizing = false;
                // Restore transition
                win.style.transition = 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.2s ease-out';
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

                // If opening terminal, focus input
                if (id === 'terminal') {
                    setTimeout(() => {
                        const terminalInput = document.getElementById('terminal-input');
                        if (terminalInput) terminalInput.focus();
                    }, 50);
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

// Terminal functionality
class TerminalParser {
    constructor() {
        this.container = document.getElementById('terminal-content');
        this.promptStr = 'sebastian@adwaita: ~';
        this.init();
    }

    init() {
        if (!this.container) return;

        // Execute initial commands
        this.addOutputLine(`<span class="text-green-400 font-bold">sebastian@adwaita</span>:<span class="text-blue-400 font-bold">~</span>$ whoami`, true);
        this.addOutputLine('Sebastian Duran Caballero');

        this.addOutputLine(`<span class="text-green-400 font-bold">sebastian@adwaita</span>:<span class="text-blue-400 font-bold">~</span>$ neofetch`, true);
        this.printNeofetch();

        this.createNewInputLine();

        // Focus input when clicking anywhere in terminal
        this.container.addEventListener('click', () => {
            const input = document.getElementById('terminal-input');
            if (input) input.focus();
        });
    }

    printNeofetch() {
        const neofetchHTML = `
            <div class="flex flex-col md:flex-row text-gray-100 mb-4 mt-2">
                <div class="mr-6 mb-4 md:mb-0 text-[#3584e4] text-xs sm:text-sm font-bold">
<pre>
           .
         /   \\
        /     \\
       /       \\
      /_________\\
     /           \\
    /             \\
   /               \\
  /_________________\\
</pre>
                </div>
                <div>
                    <p><span class="text-[#3584e4] font-bold">OS:</span> Linux Adwaita</p>
                    <p><span class="text-[#3584e4] font-bold">Host:</span> Desarrollador Web</p>
                    <p><span class="text-[#3584e4] font-bold">Uptime:</span> 24/7 coding</p>
                    <p><span class="text-[#3584e4] font-bold">Packages:</span> HTML, CSS, JS, .NET, C#</p>
                    <p><span class="text-[#3584e4] font-bold">Shell:</span> bash 5.1.16</p>
                    <p><span class="text-[#3584e4] font-bold">Location:</span> Santa Cruz, Bolivia</p>
                    <p><span class="text-[#3584e4] font-bold">Email:</span> sd8587793@email.com</p>
                </div>
            </div>
        `;
        const div = document.createElement('div');
        div.innerHTML = neofetchHTML;
        this.container.appendChild(div);
    }

    addOutputLine(text, isHTML = false) {
        const p = document.createElement('p');
        p.className = 'mb-1 text-gray-300';
        if (isHTML) {
            p.innerHTML = text;
        } else {
            p.textContent = text;
        }
        this.container.appendChild(p);
    }

    createNewInputLine() {
        // Remove old input if exists
        const oldInputContainer = document.getElementById('active-input-container');
        if (oldInputContainer) {
            const oldInput = document.getElementById('terminal-input');
            const value = oldInput.value;
            oldInputContainer.removeAttribute('id');
            oldInput.remove();

            const textSpan = document.createElement('span');
            textSpan.textContent = value;
            oldInputContainer.appendChild(textSpan);
        }

        const div = document.createElement('div');
        div.id = 'active-input-container';
        div.className = 'terminal-input-container mb-2 mt-2';

        const promptSpan = document.createElement('span');
        promptSpan.innerHTML = `<span class="text-green-400 font-bold">sebastian@adwaita</span>:<span class="text-blue-400 font-bold">~</span>$ `;
        div.appendChild(promptSpan);

        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'terminal-input';
        input.className = 'terminal-input';
        input.setAttribute('autocomplete', 'off');
        input.setAttribute('spellcheck', 'false');

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = input.value.trim();
                if (cmd) {
                    this.processCommand(cmd);
                } else {
                    this.createNewInputLine();
                }
            }
        });

        div.appendChild(input);
        this.container.appendChild(div);

        // Scroll to bottom
        this.container.scrollTop = this.container.scrollHeight;

        // Focus
        setTimeout(() => input.focus(), 10);
    }

    processCommand(cmd) {
        const args = cmd.split(' ').filter(Boolean);
        const command = args[0].toLowerCase();

        switch (command) {
            case 'help':
                this.addOutputLine('Comandos disponibles:');
                this.addOutputLine('  help      - Muestra esta ayuda');
                this.addOutputLine('  whoami    - Muestra el usuario actual');
                this.addOutputLine('  clear     - Limpia la terminal');
                this.addOutputLine('  ls        - Lista los archivos en el directorio actual');
                this.addOutputLine('  neofetch  - Muestra información del sistema');
                this.addOutputLine('  cat       - Muestra el contenido de un archivo (ej: cat description.txt)');
                this.addOutputLine('  open      - Abre una aplicación (ej: open projects)');
                break;
            case 'whoami':
                this.addOutputLine('Sebastian Duran Caballero');
                break;
            case 'clear':
                this.container.innerHTML = '';
                break;
            case 'ls':
                this.addOutputLine('description.txt  projects/  skills/  contact/');
                break;
            case 'neofetch':
                this.printNeofetch();
                break;
            case 'cat':
                if (args.length > 1 && args[1] === 'description.txt') {
                    this.addOutputLine('Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.');
                } else if (args.length > 1) {
                    this.addOutputLine(`cat: ${args[1]}: No existe el archivo o directorio`);
                } else {
                    this.addOutputLine('cat: falta el operando de archivo');
                }
                break;
            case 'open':
                if (args.length > 1) {
                    const appName = args[1].toLowerCase();
                    if (['projects', 'skills', 'contact'].includes(appName)) {
                        if (window.app) {
                            window.app.openWindow(appName);
                            this.addOutputLine(`Abriendo ${appName}...`);
                        }
                    } else {
                        this.addOutputLine(`Aplicación no encontrada: ${appName}`);
                    }
                } else {
                    this.addOutputLine('open: falta el nombre de la aplicación');
                }
                break;
            default:
                this.addOutputLine(`bash: ${command}: orden no encontrada`);
        }

        this.createNewInputLine();
    }
}

// Initialize the OS
window.app = new LinuxOS();
window.terminalParser = new TerminalParser();