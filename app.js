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
        this.setupTerminal();
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

    setupTerminal() {
        const input = document.getElementById('terminal-input');
        const output = document.getElementById('terminal-output');

        if (!input || !output) return;

        // Auto focus when terminal is clicked (already partially handled in html onclick)

        // Command history
        const history = [];
        let historyIndex = -1;

        const printLine = (html, isCommand = false) => {
            const line = document.createElement('div');
            line.className = 'mb-2';
            if (isCommand) {
                line.innerHTML = `<span class="text-green-400 font-bold">sebastian@ubuntu</span>:<span class="text-blue-400 font-bold">~</span>$ ${this.escapeHtml(html)}`;
            } else {
                // For regular output we use innerHTML as some outputs (like neofetch) need HTML structure
                // XSS is prevented by ensuring any user input passed to this function is properly escaped before being included
                line.innerHTML = html;
            }
            output.appendChild(line);

            // Scroll to bottom
            const terminalContent = document.getElementById('terminal-content');
            if (terminalContent) {
                terminalContent.scrollTop = terminalContent.scrollHeight;
            }
        };

        const processCommand = (cmd) => {
            const rawCmd = cmd.trim();
            if (!rawCmd) return;

            const args = rawCmd.split(' ').filter(arg => arg.length > 0);
            const command = args[0].toLowerCase();

            printLine(rawCmd, true);

            switch (command) {
                case 'help':
                    printLine(`
                        <p class="text-gray-100">Comandos disponibles:</p>
                        <ul class="text-gray-300 ml-4 list-disc list-inside">
                            <li><span class="text-[#e95420] font-bold">help</span>    - Muestra este mensaje de ayuda</li>
                            <li><span class="text-[#e95420] font-bold">whoami</span>  - Muestra el usuario actual</li>
                            <li><span class="text-[#e95420] font-bold">clear</span>   - Limpia la terminal</li>
                            <li><span class="text-[#e95420] font-bold">ls</span>      - Lista los archivos en el directorio actual</li>
                            <li><span class="text-[#e95420] font-bold">neofetch</span>- Muestra información del sistema</li>
                            <li><span class="text-[#e95420] font-bold">cat</span>     - Lee el contenido de un archivo (ej. cat description.txt)</li>
                            <li><span class="text-[#e95420] font-bold">open</span>    - Abre una aplicación (ej. open projects)</li>
                        </ul>
                    `);
                    break;
                case 'whoami':
                    printLine('<p class="text-gray-100">Sebastian Duran Caballero</p>');
                    break;
                case 'clear':
                    output.innerHTML = '';
                    break;
                case 'ls':
                    printLine(`
                        <div class="flex space-x-4 text-blue-400 font-bold">
                            <span>projects/</span>
                            <span>skills/</span>
                            <span>contact/</span>
                            <span class="text-gray-100 font-normal">description.txt</span>
                        </div>
                    `);
                    break;
                case 'neofetch':
                    printLine(`
                        <div class="flex flex-col md:flex-row text-gray-100">
                            <div class="mr-6 mb-4 md:mb-0 text-[#e95420] text-xs sm:text-sm font-bold">
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
                                <p><span class="text-[#e95420] font-bold">OS:</span> Ubuntu 22.04 LTS x86_64</p>
                                <p><span class="text-[#e95420] font-bold">Host:</span> Desarrollador Web</p>
                                <p><span class="text-[#e95420] font-bold">Uptime:</span> 24/7 coding</p>
                                <p><span class="text-[#e95420] font-bold">Packages:</span> HTML, CSS, JS, .NET, C#</p>
                                <p><span class="text-[#e95420] font-bold">Shell:</span> bash 5.1.16</p>
                                <p><span class="text-[#e95420] font-bold">Location:</span> Santa Cruz, Bolivia</p>
                                <p><span class="text-[#e95420] font-bold">Email:</span> sd8587793@email.com</p>
                            </div>
                        </div>
                    `);
                    break;
                case 'cat':
                    if (args.length > 1 && args[1] === 'description.txt') {
                        printLine('<p class="text-gray-100">Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.</p>');
                    } else if (args.length > 1) {
                        printLine(`<p class="text-red-400">cat: ${this.escapeHtml(args[1])}: No existe el archivo o directorio</p>`);
                    } else {
                        printLine('<p class="text-red-400">Falta operando de archivo</p>');
                    }
                    break;
                case 'open':
                    if (args.length > 1) {
                        const appName = args[1].toLowerCase();
                        const validApps = ['projects', 'skills', 'contact', 'terminal'];
                        if (validApps.includes(appName)) {
                            this.openWindow(appName);
                            printLine(`<p class="text-gray-100">Abriendo ${this.escapeHtml(appName)}...</p>`);
                        } else {
                            printLine(`<p class="text-red-400">No se encontró la aplicación: ${this.escapeHtml(appName)}</p>`);
                        }
                    } else {
                        printLine('<p class="text-red-400">Especifica una aplicación (ej. open projects)</p>');
                    }
                    break;
                default:
                    printLine(`<p class="text-red-400">Comando no encontrado: ${this.escapeHtml(command)}. Escribe 'help' para ver los comandos disponibles.</p>`);
            }
        };

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = input.value;
                if (cmd.trim() !== '') {
                    history.push(cmd);
                    historyIndex = history.length;
                }
                processCommand(cmd);
                input.value = '';
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (historyIndex > 0) {
                    historyIndex--;
                    input.value = history[historyIndex];
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (historyIndex < history.length - 1) {
                    historyIndex++;
                    input.value = history[historyIndex];
                } else {
                    historyIndex = history.length;
                    input.value = '';
                }
            }
        });

        // Initial welcome message
        processCommand('neofetch');
    }

    escapeHtml(unsafe) {
        return (unsafe || '').toString()
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }

    setupResizableWindows() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer = null;
            let initialWidth = 0;
            let initialHeight = 0;
            let startX = 0;
            let startY = 0;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    if (win.classList.contains('maximized')) return;
                    e.preventDefault();
                    isResizing = true;
                    currentResizer = resizer;
                    startX = e.clientX;
                    startY = e.clientY;

                    const rect = win.getBoundingClientRect();
                    initialWidth = rect.width;
                    initialHeight = rect.height;
                });
            });

            document.addEventListener('mousemove', (e) => {
                if (!isResizing) return;
                e.preventDefault();

                if (currentResizer.classList.contains('right') || currentResizer.classList.contains('bottom-right')) {
                    const width = initialWidth + (e.clientX - startX);
                    win.style.width = `${Math.max(300, width)}px`;
                }

                if (currentResizer.classList.contains('bottom') || currentResizer.classList.contains('bottom-right')) {
                    const height = initialHeight + (e.clientY - startY);
                    win.style.height = `${Math.max(200, height)}px`;
                }
            });

            document.addEventListener('mouseup', () => {
                isResizing = false;
                currentResizer = null;
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
                if(e.target.closest('button')) return;

                if (win.classList.contains('maximized')) {
                    // Restore from maximized gracefully by pulling it down
                    win.classList.remove('maximized');

                    // Recalculate offsets for smooth dragging from current mouse position
                    win.style.transform = 'none';
                    const rect = win.getBoundingClientRect();
                    xOffset = e.clientX - rect.left - (rect.width / 2); // Center horizontally on mouse
                    yOffset = 0; // Header is at top

                    win.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0)`;
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

                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;

                    // Aero snap preview logic
                    const snapPreviewId = 'snap-preview-' + win.dataset.id;
                    let snapPreview = document.getElementById(snapPreviewId);

                    if (e.clientY <= 28) {
                        if (!snapPreview) {
                            snapPreview = document.createElement('div');
                            snapPreview.id = snapPreviewId;
                            snapPreview.className = 'maximized-snap-preview';
                            document.getElementById('desktop').appendChild(snapPreview);
                        }
                    } else if (snapPreview) {
                        snapPreview.remove();
                    }

                    xOffset = currentX;
                    yOffset = currentY;

                    setTranslate(currentX, currentY, win);
                }
            };

            function setTranslate(xPos, yPos, el) {
                el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
            }

            const dragEnd = (e) => {
                if (!isDragging) return;
                initialX = currentX;
                initialY = currentY;
                isDragging = false;

                const snapPreview = document.getElementById('snap-preview-' + win.dataset.id);
                if (snapPreview) {
                    snapPreview.remove();
                    this.maximizeWindow(win.dataset.id);
                }
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

// Initialize the OS
const app = new LinuxOS();