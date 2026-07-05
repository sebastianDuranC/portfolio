class LinuxOS {
    constructor() {
        this.windows = document.querySelectorAll('.os-window');
        this.highestZIndex = 100;
        this.openWindows = new Set();
        
        this.init();
    }

    init() {
        this.setupClock();

        // Add aero snap preview element to DOM
        this.snapPreview = document.createElement('div');
        this.snapPreview.className = 'aero-snap-preview';
        document.body.appendChild(this.snapPreview);

        this.setupDraggableWindows();
        this.setupWindowResizing();
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

    setupTerminal() {
        const terminalInput = document.getElementById('terminal-input');
        const terminalOutput = document.getElementById('terminal-output');

        if (!terminalInput || !terminalOutput) return;

        terminalInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const command = terminalInput.value.trim();
                if (command) {
                    this.executeTerminalCommand(command, terminalOutput);
                }
                terminalInput.value = '';
                // Scroll to bottom
                const terminalContent = terminalInput.closest('.window-content');
                if (terminalContent) {
                    terminalContent.scrollTop = terminalContent.scrollHeight;
                }
            }
        });

        // Focus input when clicking anywhere in terminal
        const terminalWindow = document.getElementById('window-terminal');
        if(terminalWindow) {
             terminalWindow.querySelector('.window-content').addEventListener('click', () => {
                 terminalInput.focus();
             });
        }
    }

    executeTerminalCommand(command, outputElement) {
        // Echo the command
        const commandEcho = document.createElement('div');
        commandEcho.className = 'mb-2';
        commandEcho.innerHTML = `<span class="text-green-400 font-bold">sebastian@ubuntu</span>:<span class="text-blue-400 font-bold">~</span>$ <span class="command-text"></span>`;
        commandEcho.querySelector('.command-text').textContent = command; // Prevent XSS
        outputElement.appendChild(commandEcho);

        // Process command
        const responseElement = document.createElement('div');
        responseElement.className = 'text-gray-100 mb-4 whitespace-pre-wrap';

        const cmd = command.toLowerCase();

        if (cmd === 'help') {
            responseElement.textContent = `Comandos disponibles:
  help      - Muestra este mensaje
  whoami    - Muestra información del usuario actual
  clear     - Limpia la terminal
  neofetch  - Muestra información del sistema
  date      - Muestra la fecha y hora actual
  ls        - Lista los directorios principales`;
        } else if (cmd === 'whoami') {
            responseElement.textContent = 'Sebastian Duran Caballero\nDesarrollador Web .NET';
        } else if (cmd === 'clear') {
            outputElement.innerHTML = '';
            return;
        } else if (cmd === 'date') {
            responseElement.textContent = new Date().toString();
        } else if (cmd === 'ls') {
             responseElement.innerHTML = `<span class="text-blue-400 font-bold mr-4">Proyectos</span> <span class="text-blue-400 font-bold mr-4">Habilidades</span> <span class="text-blue-400 font-bold">Contacto</span>`;
        } else if (cmd === 'neofetch') {
             responseElement.innerHTML = `
<div class="flex flex-col md:flex-row text-gray-100">
    <div class="mr-6 mb-4 md:mb-0 text-[#e95420] text-xs sm:text-sm font-bold">
<pre>
       _,-/` + "`" + `--,-/\\-,
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
</div>`;
        } else {
            responseElement.textContent = `bash: ${command}: orden no encontrada. Escribe 'help' para ver los comandos disponibles.`;
        }

        outputElement.appendChild(responseElement);
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
                if (e.target.closest('button') || e.target.closest('.resizer')) return;
                if (win.classList.contains('maximized')) return;

                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;
                    // Ensure window comes to front on drag start
                    app.bringToFront(win);
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

                    // Aero snap preview logic (top edge)
                    if (e.clientY <= 30) {
                        app.snapPreview.classList.add('visible');
                    } else {
                        app.snapPreview.classList.remove('visible');
                    }
                }
            }

            function setTranslate(xPos, yPos, el) {
                el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
            }

            function dragEnd(e) {
                if (isDragging) {
                    // Execute aero snap maximize if dropped near top edge
                    if (e && e.clientY <= 30) {
                        app.snapPreview.classList.remove('visible');

                        // Use the global app instance to call maximize
                        const winId = win.getAttribute('data-id');
                        if(winId && !win.classList.contains('maximized')) {
                            // Reset transform so maximize works cleanly
                            xOffset = 0;
                            yOffset = 0;
                            currentX = 0;
                            currentY = 0;
                            setTranslate(0, 0, win);
                            app.maximizeWindow(winId);
                        }
                    }
                }
                initialX = currentX;
                initialY = currentY;
                isDragging = false;
                app.snapPreview.classList.remove('visible');
            }

            // Store offsets on window object for resizing context
            win.dragOffsets = { getX: () => xOffset, getY: () => yOffset };
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
                    e.preventDefault();
                    isResizing = true;
                    currentResizer = resizer;
                    startX = e.clientX;
                    startY = e.clientY;
                    startWidth = parseInt(document.defaultView.getComputedStyle(win).width, 10);
                    startHeight = parseInt(document.defaultView.getComputedStyle(win).height, 10);

                    this.bringToFront(win);

                    document.addEventListener('mousemove', resize);
                    document.addEventListener('mouseup', stopResize);
                });
            });

            function resize(e) {
                if (!isResizing) return;

                if (win.classList.contains('maximized')) return;

                if (currentResizer.classList.contains('resizer-r')) {
                    win.style.width = startWidth + (e.clientX - startX) + 'px';
                } else if (currentResizer.classList.contains('resizer-b')) {
                    win.style.height = startHeight + (e.clientY - startY) + 'px';
                } else if (currentResizer.classList.contains('resizer-br')) {
                    win.style.width = startWidth + (e.clientX - startX) + 'px';
                    win.style.height = startHeight + (e.clientY - startY) + 'px';
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

    maximizeWindow(id) {
        const win = document.getElementById(`window-${id}`);
        if (win) {
            win.classList.add('window-maximizing');

            if (!win.classList.contains('maximized')) {
                // Save current state before maximizing
                win.dataset.prevTransform = win.style.transform;
                win.dataset.prevWidth = win.style.width;
                win.dataset.prevHeight = win.style.height;

                win.classList.add('maximized');
                win.style.transform = 'none';
                win.style.width = '100%';
                win.style.height = 'calc(100vh - 28px)';
            } else {
                win.classList.remove('maximized');
                // Restore state
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

            setTimeout(() => {
                win.classList.remove('window-maximizing');
            }, 200);
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