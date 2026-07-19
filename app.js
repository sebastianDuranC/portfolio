class LinuxOS {
    constructor() {
        this.windows = document.querySelectorAll('.os-window');
        this.highestZIndex = 100;
        this.openWindows = new Set();
        this.isResizing = false;
        
        // Desktop bounds (excluding top bar)
        this.desktopBounds = {
            top: 0, // Adjusted relative to #desktop
            left: 0,
            width: window.innerWidth,
            height: window.innerHeight - 28
        };

        this.init();
    }

    init() {
        this.setupClock();
        this.setupWindowInteractions();
        this.setupWindowClickToFront();
        this.setupLogin();
        this.setupTerminal();

        window.addEventListener('resize', () => {
            this.desktopBounds = {
                top: 0,
                left: 0,
                width: window.innerWidth,
                height: window.innerHeight - 28
            };
        });
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
                // Simulate running neofetch
                setTimeout(() => {
                    this.executeTerminalCommand('neofetch');
                }, 500);
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

    setupWindowInteractions() {
        this.windows.forEach(win => {
            const header = win.querySelector('.window-header');
            const resizers = win.querySelectorAll('.resizer');
            const snapPreview = document.getElementById('snap-preview');

            if (header) this.makeDraggable(win, header, snapPreview);

            resizers.forEach(resizer => {
                this.makeResizable(win, resizer);
            });
        });
    }

    makeDraggable(win, header, snapPreview) {
        let isDragging = false;
        let startX, startY, initialLeft, initialTop;

        const dragStart = (e) => {
            if (e.target.closest('button')) return;
            if (win.classList.contains('maximized')) {
                // Allow unmaximizing by dragging away from top
                this.maximizeWindow(win.dataset.id);
                // Adjust position so mouse stays on header
                const rect = win.getBoundingClientRect();
                win.style.left = `${e.clientX - (rect.width / 2)}px`;
                win.style.top = `0px`;
            }

            isDragging = true;
            this.bringToFront(win);

            startX = e.clientX;
            startY = e.clientY;

            // Get current absolute position
            const style = window.getComputedStyle(win);
            initialLeft = parseInt(style.left, 10) || 0;
            initialTop = parseInt(style.top, 10) || 0;

            // Remove transform if it exists and convert to absolute positioning
            win.style.transform = 'none';
        };

        const drag = (e) => {
            if (!isDragging) return;
            e.preventDefault();

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            let newLeft = initialLeft + dx;
            let newTop = initialTop + dy;

            // Simple boundary enforcement
            if (newTop < this.desktopBounds.top) newTop = this.desktopBounds.top;

            win.style.left = `${newLeft}px`;
            win.style.top = `${newTop}px`;

            // Aero Snap preview
            if (e.clientY <= 28) {
                snapPreview.classList.add('maximized-snap-preview');
            } else {
                snapPreview.classList.remove('maximized-snap-preview');
            }
        };

        const dragEnd = (e) => {
            if (!isDragging) return;
            isDragging = false;

            if (e.clientY <= 28) {
                snapPreview.classList.remove('maximized-snap-preview');
                if (!win.classList.contains('maximized')) {
                    this.maximizeWindow(win.dataset.id);
                }
            }
        };

        header.addEventListener('mousedown', dragStart);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', dragEnd);
    }

    makeResizable(win, resizer) {
        let startX, startY, startWidth, startHeight;

        const resizeStart = (e) => {
            if(win.classList.contains('maximized')) return;
            this.isResizing = true;
            this.bringToFront(win);

            startX = e.clientX;
            startY = e.clientY;

            const style = window.getComputedStyle(win);
            startWidth = parseInt(style.width, 10);
            startHeight = parseInt(style.height, 10);

            e.preventDefault();
        };

        const resize = (e) => {
            if (!this.isResizing) return;

            // Get min dimensions from classes (e.g. min-w-[300px])
            // Fallback defaults
            let minW = 300;
            let minH = 200;

            const classes = win.className.split(' ');
            classes.forEach(c => {
                if(c.startsWith('min-w-[')) minW = parseInt(c.match(/\d+/)[0]);
                if(c.startsWith('min-h-[')) minH = parseInt(c.match(/\d+/)[0]);
            });

            if (resizer.classList.contains('resizer-r') || resizer.classList.contains('resizer-br')) {
                let newWidth = startWidth + (e.clientX - startX);
                if (newWidth > minW) win.style.width = `${newWidth}px`;
            }
            if (resizer.classList.contains('resizer-b') || resizer.classList.contains('resizer-br')) {
                let newHeight = startHeight + (e.clientY - startY);
                if (newHeight > minH) win.style.height = `${newHeight}px`;
            }
        };

        const resizeEnd = () => {
            this.isResizing = false;
        };

        resizer.addEventListener('mousedown', resizeStart);
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', resizeEnd);
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

                if(id === 'terminal') {
                    const input = document.getElementById('terminal-input');
                    if(input) input.focus();
                }
            } else {
                this.bringToFront(win);
                if(id === 'terminal') {
                    const input = document.getElementById('terminal-input');
                    if(input) input.focus();
                }
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
                // Save current inline styles to restore later
                win.dataset.prevWidth = win.style.width;
                win.dataset.prevHeight = win.style.height;
                win.dataset.prevTop = win.style.top;
                win.dataset.prevLeft = win.style.left;
                win.dataset.prevTransform = win.style.transform;

                win.classList.add('maximized');

                // Clear inline styles that conflict with maximized class !important rules
                // Not strictly necessary due to !important, but cleaner
            } else {
                win.classList.remove('maximized');

                // Restore
                if (win.dataset.prevWidth) win.style.width = win.dataset.prevWidth;
                if (win.dataset.prevHeight) win.style.height = win.dataset.prevHeight;
                if (win.dataset.prevTop) win.style.top = win.dataset.prevTop;
                if (win.dataset.prevLeft) win.style.left = win.dataset.prevLeft;
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

    // Terminal Logic
    setupTerminal() {
        const input = document.getElementById('terminal-input');
        if (!input) return;

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = input.value.trim();
                if (cmd) {
                    this.echoCommand(cmd);
                    this.executeTerminalCommand(cmd);
                } else {
                    this.echoCommand("");
                }
                input.value = '';
            }
        });

        // Keep focus when clicking inside terminal window
        const termContent = document.getElementById('terminal-content');
        if (termContent) {
            termContent.addEventListener('click', () => {
                const selection = window.getSelection();
                if(selection.toString().length === 0) {
                     input.focus();
                }
            });
        }
    }

    echoCommand(cmd) {
        const output = document.getElementById('terminal-output');
        const cmdLine = document.createElement('div');
        cmdLine.className = 'mb-1';

        const prompt = document.createElement('span');
        prompt.innerHTML = '<span class="text-green-400 font-bold">sebastian@ubuntu</span><span class="text-white">:</span><span class="text-blue-400 font-bold">~</span><span class="text-white mr-2">$</span>';

        const text = document.createElement('span');
        text.className = 'text-gray-200';
        text.textContent = cmd; // Prevent XSS

        cmdLine.appendChild(prompt);
        cmdLine.appendChild(text);
        output.appendChild(cmdLine);
        this.scrollToBottom();
    }

    executeTerminalCommand(cmd) {
        const output = document.getElementById('terminal-output');
        const args = cmd.split(' ');
        const command = args[0].toLowerCase();

        let responseNode = document.createElement('div');
        responseNode.className = 'text-gray-200 mb-4';

        switch (command) {
            case 'help':
                responseNode.innerHTML = `
                    <p>Comandos disponibles:</p>
                    <ul class="pl-4">
                        <li><span class="text-green-400">help</span>    - Muestra este mensaje</li>
                        <li><span class="text-green-400">whoami</span>  - Muestra el usuario actual</li>
                        <li><span class="text-green-400">clear</span>   - Limpia la terminal</li>
                        <li><span class="text-green-400">ls</span>      - Lista los archivos del directorio</li>
                        <li><span class="text-green-400">cat</span>     - Muestra el contenido de un archivo</li>
                        <li><span class="text-green-400">neofetch</span>- Muestra información del sistema</li>
                        <li><span class="text-green-400">open</span>    - Abre una aplicación (ej: open projects)</li>
                    </ul>
                `;
                break;
            case 'whoami':
                responseNode.textContent = 'Sebastian Duran Caballero';
                break;
            case 'clear':
                output.innerHTML = '';
                return; // Don't append responseNode
            case 'ls':
                responseNode.innerHTML = '<span class="text-blue-400 mr-4">description.txt</span><span class="text-blue-400 mr-4">projects</span><span class="text-blue-400">skills</span>';
                break;
            case 'cat':
                if (args[1] === 'description.txt') {
                    responseNode.textContent = 'Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.';
                } else if (args[1]) {
                    responseNode.textContent = `cat: ${args[1]}: No existe el archivo o directorio`;
                } else {
                    responseNode.textContent = 'Uso: cat <archivo>';
                }
                break;
            case 'neofetch':
                responseNode.innerHTML = `
                    <div class="flex flex-col md:flex-row text-gray-100 mb-2">
                        <div class="mr-6 mb-4 md:mb-0 text-[#e95420] text-xs sm:text-sm font-bold whitespace-pre">
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
                break;
            case 'open':
                const appToOpen = args[1];
                if (['projects', 'skills', 'contact'].includes(appToOpen)) {
                    this.openWindow(appToOpen);
                    responseNode.textContent = `Abriendo ${appToOpen}...`;
                } else if(appToOpen) {
                    responseNode.textContent = `Aplicación no encontrada: ${appToOpen}`;
                } else {
                    responseNode.textContent = 'Uso: open <aplicación>';
                }
                break;
            default:
                responseNode.textContent = `${command}: comando no encontrado`;
                break;
        }

        output.appendChild(responseNode);
        this.scrollToBottom();
    }

    scrollToBottom() {
        const content = document.getElementById('terminal-content');
        if(content) {
            content.scrollTop = content.scrollHeight;
        }
    }
}

// Initialize the OS
const app = new LinuxOS();