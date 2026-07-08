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
                setTimeout(() => {
                    const termInput = document.getElementById('terminal-input');
                    if (termInput) {
                        termInput.value = 'neofetch';
                        termInput.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Enter'}));
                    }
                }, 500);
            }, 500); // Wait for transition to complete
        }
    }

    setupClock() {
        const dateElement = document.getElementById('topbar-date');
        if (!dateElement) return;

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
                if(e.target.closest('button')) return;

                if(win.classList.contains('maximized')) {
                    // Start un-maximizing when dragging down
                    isDragging = true;
                    // Reset offsets since it will snap back
                    xOffset = 0;
                    yOffset = 0;
                } else {
                    isDragging = true;
                }

                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;
            }

            const setTranslate = (xPos, yPos, el) => {
                el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
            }

            function drag(e) {
                if (isDragging) {
                    e.preventDefault();

                    if (win.classList.contains('maximized')) {
                        // Un-maximize if moved away from top
                        if (e.clientY > 10) {
                            win.classList.remove('maximized');

                            // Restore original dimensions if available
                            if (win.dataset.prevWidth) win.style.width = win.dataset.prevWidth;
                            if (win.dataset.prevHeight) win.style.height = win.dataset.prevHeight;

                            xOffset = e.clientX - win.offsetWidth / 2;
                            yOffset = e.clientY - 10;
                            initialX = e.clientX - xOffset;
                            initialY = e.clientY - yOffset;
                        } else {
                            return; // still maximized
                        }
                    }

                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;

                    xOffset = currentX;
                    yOffset = currentY;

                    setTranslate(currentX, currentY, win);

                    // Aero snap detection (top edge)
                    if (e.clientY <= 0) {
                        win.dataset.prevWidth = win.style.width || getComputedStyle(win).width;
                        win.dataset.prevHeight = win.style.height || getComputedStyle(win).height;
                        win.classList.add('maximized');
                        setTranslate(0, 0, win);
                        xOffset = 0;
                        yOffset = 0;
                        isDragging = false;
                    }
                }
            }

            function dragEnd(e) {
                if (!isDragging) return;
                initialX = currentX;
                initialY = currentY;
                isDragging = false;
            }
        });
    }

    setupResizers() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer;
            let initialWidth, initialHeight, initialMouseX, initialMouseY;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    isResizing = true;
                    currentResizer = resizer;
                    initialWidth = parseFloat(getComputedStyle(win).width.replace('px', ''));
                    initialHeight = parseFloat(getComputedStyle(win).height.replace('px', ''));
                    initialMouseX = e.clientX;
                    initialMouseY = e.clientY;

                    this.bringToFront(win);

                    document.addEventListener('mousemove', resize);
                    document.addEventListener('mouseup', stopResize);
                });
            });

            const resize = (e) => {
                if (!isResizing) return;
                if (win.classList.contains('maximized')) return;

                if (currentResizer.classList.contains('resizer-r')) {
                    const width = initialWidth + (e.clientX - initialMouseX);
                    win.style.width = `${Math.max(300, width)}px`;
                } else if (currentResizer.classList.contains('resizer-b')) {
                    const height = initialHeight + (e.clientY - initialMouseY);
                    win.style.height = `${Math.max(200, height)}px`;
                } else if (currentResizer.classList.contains('resizer-br')) {
                    const width = initialWidth + (e.clientX - initialMouseX);
                    const height = initialHeight + (e.clientY - initialMouseY);
                    win.style.width = `${Math.max(300, width)}px`;
                    win.style.height = `${Math.max(200, height)}px`;
                }
            };

            const stopResize = () => {
                isResizing = false;
                document.removeEventListener('mousemove', resize);
                document.removeEventListener('mouseup', stopResize);
            };
        });
    }

    setupTerminal() {
        const termInput = document.getElementById('terminal-input');
        const termHistory = document.getElementById('terminal-history');

        if (!termInput || !termHistory) return;

        termInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = termInput.value.trim();
                if (command) {
                    this.handleTerminalCommand(command, termHistory);
                } else {
                    const cmdLine = document.createElement('div');
                    cmdLine.innerHTML = `<span class="text-green-400 font-bold mr-1">sebastian@ubuntu</span>:<span class="text-blue-400 font-bold ml-1">~</span>$ `;
                    termHistory.appendChild(cmdLine);
                }
                termInput.value = '';

                // Scroll to bottom
                const content = document.getElementById('terminal-content');
                content.scrollTop = content.scrollHeight;
            }
        });
    }

    handleTerminalCommand(command, historyEl) {
        // Echo command securely
        const cmdLine = document.createElement('div');
        cmdLine.innerHTML = `<span class="text-green-400 font-bold mr-1">sebastian@ubuntu</span>:<span class="text-blue-400 font-bold ml-1">~</span>$ <span class="text-white user-cmd"></span>`;
        cmdLine.querySelector('.user-cmd').textContent = command;
        historyEl.appendChild(cmdLine);

        const outputLine = document.createElement('div');
        outputLine.className = 'text-gray-300 mt-1 mb-3 whitespace-pre-wrap';

        const args = command.split(' ').filter(Boolean);
        const cmd = args[0]?.toLowerCase();

        switch (cmd) {
            case 'help':
                outputLine.innerHTML = `Comandos disponibles:
  <span class="text-blue-300">help</span>      - Muestra este mensaje de ayuda
  <span class="text-blue-300">whoami</span>    - Muestra el usuario actual
  <span class="text-blue-300">clear</span>     - Limpia la pantalla del terminal
  <span class="text-blue-300">ls</span>        - Lista el contenido del directorio
  <span class="text-blue-300">neofetch</span>  - Muestra información del sistema
  <span class="text-blue-300">date</span>      - Muestra la fecha y hora del sistema`;
                break;
            case 'whoami':
                outputLine.textContent = 'sebastian';
                break;
            case 'clear':
                historyEl.innerHTML = '';
                return;
            case 'ls':
                outputLine.innerHTML = '<span class="text-blue-400 font-bold">Proyectos/</span>  <span class="text-blue-400 font-bold">Descargas/</span>  <span class="text-blue-400 font-bold">Documentos/</span>  <span class="text-white">curriculum.pdf</span>';
                break;
            case 'date':
                outputLine.textContent = new Date().toString();
                break;
            case 'neofetch':
                outputLine.innerHTML = `
<div class="flex flex-col sm:flex-row mt-2">
<div class="mr-6 text-[#e95420] font-bold font-ubuntu-mono leading-none flex items-center justify-center">
<pre>
         _.-="=-._
       .'         '.
      /  .--. .--.  \\
     |  /    |    \\  |
     | |  o  |  o  | |
     | \\    / \\    / |
      \\ '--'   '--' /
       '.         .'
         '-...-.'
</pre>
</div>
<div>
<span class="text-[#e95420] font-bold">sebastian</span>@<span class="text-[#e95420] font-bold">linux-os</span>
-----------------------
<span class="text-[#e95420] font-bold">OS</span>: Linux OS Desktop Portfolio
<span class="text-[#e95420] font-bold">Host</span>: Sebastian Duran Caballero
<span class="text-[#e95420] font-bold">Kernel</span>: Web 2.0 (HTML/CSS/JS)
<span class="text-[#e95420] font-bold">Uptime</span>: 1 min
<span class="text-[#e95420] font-bold">Shell</span>: bash 5.1.16
<span class="text-[#e95420] font-bold">Resolution</span>: ${window.innerWidth}x${window.innerHeight}
<span class="text-[#e95420] font-bold">DE</span>: GNOME 42 (Adwaita)
<span class="text-[#e95420] font-bold">WM</span>: JavaScript WindowManager
<span class="text-[#e95420] font-bold">Theme</span>: Adwaita-dark [GTK3]
<span class="text-[#e95420] font-bold">Terminal</span>: WebTerm
<span class="text-[#e95420] font-bold">CPU</span>: Intel Core i9-13900K
</div>
</div>`;
                break;
            default:
                outputLine.textContent = `bash: ${cmd}: orden no encontrada`;
        }

        historyEl.appendChild(outputLine);
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

                // Focus terminal if it's the one opening
                if (id === 'terminal') {
                    const input = document.getElementById('terminal-input');
                    if (input) setTimeout(() => input.focus(), 100);
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
                // Save current width/height/transform before maximizing
                win.dataset.prevWidth = win.style.width || getComputedStyle(win).width;
                win.dataset.prevHeight = win.style.height || getComputedStyle(win).height;
                win.dataset.prevTransform = win.style.transform;
                win.classList.add('maximized');
                win.style.transform = 'none';
                win.style.width = '100%';
                win.style.height = 'calc(100vh - 28px)';
            } else {
                win.classList.remove('maximized');
                // Restore width/height/transform
                if (win.dataset.prevWidth) win.style.width = win.dataset.prevWidth;
                if (win.dataset.prevHeight) win.style.height = win.dataset.prevHeight;
                if (win.dataset.prevTransform) win.style.transform = win.dataset.prevTransform;
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

// Initialize the OS
const app = new LinuxOS();
