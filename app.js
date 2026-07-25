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
        const terminalInput = document.getElementById('terminal-input');
        const terminalOutput = document.getElementById('terminal-output');
        const terminalContent = document.getElementById('terminal-content');

        if (!terminalInput || !terminalOutput) return;

        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = terminalInput.value.trim();
                terminalInput.value = '';
                this.processCommand(command, terminalOutput);
                terminalContent.scrollTop = terminalContent.scrollHeight;
            }
        });

        // Initial neofetch
        this.processCommand('neofetch', terminalOutput, true);
    }

    processCommand(command, outputElement, isInitial = false) {
        if (!isInitial) {
            const cmdLine = document.createElement('div');
            cmdLine.className = 'mb-2';
            cmdLine.innerHTML = `<span class="text-green-400 font-bold">sebastian@ubuntu</span><span class="text-gray-100 font-bold">:</span><span class="text-blue-400 font-bold">~</span><span class="text-gray-100 font-bold">$</span> <span class="text-gray-200">${this.escapeHTML(command)}</span>`;
            outputElement.appendChild(cmdLine);
        }

        const args = command.split(' ');
        const cmd = args[0].toLowerCase();

        let response = '';

        switch (cmd) {
            case 'help':
                response = `<p class="text-gray-300 mb-4">Comandos disponibles:<br>
                - <span class="text-green-400 font-bold">whoami</span>: Muestra el usuario actual<br>
                - <span class="text-green-400 font-bold">neofetch</span>: Muestra información del sistema<br>
                - <span class="text-green-400 font-bold">clear</span>: Limpia la terminal<br>
                - <span class="text-green-400 font-bold">ls</span>: Lista los archivos en el directorio actual<br>
                - <span class="text-green-400 font-bold">cat [file]</span>: Muestra el contenido de un archivo<br>
                - <span class="text-green-400 font-bold">open [app]</span>: Abre una aplicación (ej. open projects)<br>
                - <span class="text-green-400 font-bold">help</span>: Muestra este mensaje de ayuda</p>`;
                break;
            case 'whoami':
                response = `<p class="text-gray-300 mb-4">Sebastian Duran Caballero</p>`;
                break;
            case 'clear':
                outputElement.innerHTML = '';
                return;
            case 'ls':
                response = `<p class="text-blue-400 font-bold mb-4">description.txt  projects/  skills/  contact/</p>`;
                break;
            case 'cat':
                if (args[1] === 'description.txt') {
                    response = `<p class="text-gray-300 mb-4">Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.</p>`;
                } else {
                    response = `<p class="text-red-400 mb-4">cat: ${args[1] ? this.escapeHTML(args[1]) : ''}: No existe el archivo o directorio</p>`;
                }
                break;
            case 'open':
                const appName = args[1];
                if (['projects', 'skills', 'contact'].includes(appName)) {
                    this.openWindow(appName);
                    response = `<p class="text-gray-300 mb-4">Abriendo ${appName}...</p>`;
                } else {
                    response = `<p class="text-red-400 mb-4">Aplicación no encontrada: ${appName ? this.escapeHTML(appName) : ''}</p>`;
                }
                break;
            case 'neofetch':
                response = `
                    <div class="flex flex-col md:flex-row text-gray-100 mb-4">
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
                    </div>`;
                break;
            case '':
                break;
            default:
                response = `<p class="text-red-400 mb-4">Comando no encontrado: ${this.escapeHTML(cmd)}. Escribe 'help' para ver los comandos disponibles.</p>`;
        }

        if (response) {
            const respElement = document.createElement('div');
            respElement.innerHTML = response;
            outputElement.appendChild(respElement);
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
            }[tag])
        );
    }

    setupResizableWindows() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer;
            let initialX, initialY, initialWidth, initialHeight;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', function(e) {
                    isResizing = true;
                    currentResizer = e.target;

                    const rect = win.getBoundingClientRect();
                    initialX = e.clientX;
                    initialY = e.clientY;
                    initialWidth = rect.width;
                    initialHeight = rect.height;

                    e.preventDefault();
                });
            });

            document.addEventListener('mousemove', function(e) {
                if (!isResizing) return;

                if (win.classList.contains('maximized')) {
                    win.classList.remove('maximized');
                    win.style.transform = 'none';
                }

                if (currentResizer.classList.contains('resizer-r')) {
                    win.style.width = initialWidth + (e.clientX - initialX) + 'px';
                }
                else if (currentResizer.classList.contains('resizer-b')) {
                    win.style.height = initialHeight + (e.clientY - initialY) + 'px';
                }
                else if (currentResizer.classList.contains('resizer-br')) {
                    win.style.width = initialWidth + (e.clientX - initialX) + 'px';
                    win.style.height = initialHeight + (e.clientY - initialY) + 'px';
                }
            });

            document.addEventListener('mouseup', function(e) {
                isResizing = false;
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
            const self = this;

            header.addEventListener('mousedown', dragStart);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);

            function dragStart(e) {
                if(e.target.closest('button')) return;

                if (win.classList.contains('maximized')) {
                    win.classList.remove('maximized');
                    win.style.transform = 'none';
                    const rect = win.getBoundingClientRect();

                    const ratioX = e.clientX / window.innerWidth;

                    xOffset = e.clientX - (rect.width * ratioX);
                    yOffset = e.clientY - 15;

                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;
                    setTranslate(xOffset, yOffset, win);
                } else {
                    const transform = window.getComputedStyle(win).transform;
                    if (transform !== 'none') {
                        const matrix = new DOMMatrixReadOnly(transform);
                        xOffset = matrix.m41;
                        yOffset = matrix.m42;
                    } else {
                        xOffset = 0;
                        yOffset = 0;
                    }
                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;
                }

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;
                    self.bringToFront(win);
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

                    const snapPreview = document.getElementById('snap-preview');
                    if (e.clientY <= 28) {
                        if (snapPreview) {
                            snapPreview.classList.remove('hidden');
                            snapPreview.classList.add('maximized-snap-preview');
                        }
                    } else {
                        if (snapPreview) {
                            snapPreview.classList.add('hidden');
                            snapPreview.classList.remove('maximized-snap-preview');
                        }
                    }
                }
            }

            function setTranslate(xPos, yPos, el) {
                el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
            }

            function dragEnd(e) {
                if (!isDragging) return;
                initialX = currentX;
                initialY = currentY;
                isDragging = false;

                const snapPreview = document.getElementById('snap-preview');
                if (snapPreview) {
                    snapPreview.classList.add('hidden');
                    snapPreview.classList.remove('maximized-snap-preview');
                }

                if (e.clientY <= 28) {
                    self.maximizeWindow(win.dataset.id);
                }
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