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
        this.terminalParser = new TerminalParser();
    }

    setupWindowResizing() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer = null;
            let startX, startY, startWidth, startHeight;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    if (win.classList.contains('maximized')) return;
                    e.preventDefault();
                    e.stopPropagation();
                    isResizing = true;
                    currentResizer = resizer;
                    startX = e.clientX;
                    startY = e.clientY;
                    startWidth = parseInt(document.defaultView.getComputedStyle(win).width, 10);
                    startHeight = parseInt(document.defaultView.getComputedStyle(win).height, 10);
                    this.bringToFront(win);
                });
            });

            document.addEventListener('mousemove', (e) => {
                if (!isResizing) return;

                if (currentResizer.classList.contains('resizer-r')) {
                    win.style.width = startWidth + (e.clientX - startX) + 'px';
                } else if (currentResizer.classList.contains('resizer-b')) {
                    win.style.height = startHeight + (e.clientY - startY) + 'px';
                } else if (currentResizer.classList.contains('resizer-br')) {
                    win.style.width = startWidth + (e.clientX - startX) + 'px';
                    win.style.height = startHeight + (e.clientY - startY) + 'px';
                }
            });

            document.addEventListener('mouseup', () => {
                isResizing = false;
                currentResizer = null;
            });
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

            const desktopContainer = document.getElementById('desktop');

            function dragStart(e) {
                // Don't drag if maximizing/closing buttons are clicked
                if(e.target.closest('button')) return;

                if (e.target === header || header.contains(e.target)) {
                    if (win.classList.contains('maximized')) {
                        // Restore window size and calculate offset dynamically
                        win.style.transform = 'none';
                        const rect = win.getBoundingClientRect();
                        const desktopRect = desktopContainer.getBoundingClientRect();

                        // Keep mouse relative position during restore
                        const relativeX = e.clientX / window.innerWidth;

                        win.classList.remove('maximized');

                        // Calculate offset from desktop container
                        xOffset = (e.clientX - desktopRect.left) - (win.offsetWidth * relativeX);
                        yOffset = e.clientY - desktopRect.top;

                        setTranslate(xOffset, yOffset, win);
                    }

                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;
                    isDragging = true;
                }
            }

            const maximizeAeroSnap = () => {
                const rect = win.getBoundingClientRect();
                if (rect.top <= 28) {
                     if (!win.classList.contains('maximized')) {
                         this.maximizeWindow(win.dataset.id);
                     }
                }
            };

            const _this = this;
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
                if(isDragging) {
                    initialX = currentX;
                    initialY = currentY;
                    isDragging = false;
                    maximizeAeroSnap();
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

class TerminalParser {
    constructor() {
        this.input = document.getElementById('terminal-input');
        this.output = document.getElementById('terminal-output');
        this.content = document.getElementById('terminal-content');

        if (this.input && this.output) {
            this.init();
        }
    }

    init() {
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = this.input.value.trim();
                this.executeCommand(command);
                this.input.value = '';
            }
        });

        // Pre-populate terminal
        this.executeCommand('whoami');
        this.executeCommand('neofetch');
    }

    escapeHTML(str) {
        return str.replace(/[&<>'"]/g,
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }

    executeCommand(command) {
        const safeCommand = this.escapeHTML(command);
        const promptHTML = `<div class="mt-2"><span class="text-green-400 font-bold mr-1">sebastian@ubuntu</span>:<span class="text-blue-400 font-bold mr-1">~</span>$ ${safeCommand}</div>`;
        this.output.insertAdjacentHTML('beforeend', promptHTML);

        if (!command) {
            this.scrollToBottom();
            return;
        }

        const args = command.split(' ').filter(arg => arg.trim() !== '');
        const cmd = args[0].toLowerCase();

        let responseHTML = '';

        switch (cmd) {
            case 'help':
                responseHTML = `
                    <div class="text-gray-200 mt-1">
                        Comandos disponibles:<br>
                        - <span class="text-blue-300">whoami</span>: Muestra información sobre mi<br>
                        - <span class="text-blue-300">clear</span>: Limpia la terminal<br>
                        - <span class="text-blue-300">ls</span>: Lista los archivos en el directorio actual<br>
                        - <span class="text-blue-300">neofetch</span>: Muestra información del sistema<br>
                        - <span class="text-blue-300">cat [archivo]</span>: Lee el contenido de un archivo<br>
                        - <span class="text-blue-300">open [aplicación]</span>: Abre una aplicación (ej. open projects)<br>
                        - <span class="text-blue-300">help</span>: Muestra este mensaje
                    </div>`;
                break;
            case 'whoami':
                responseHTML = `<div class="text-gray-200 mt-1">Sebastian Duran Caballero</div>`;
                break;
            case 'clear':
                this.output.innerHTML = '';
                this.scrollToBottom();
                return;
            case 'ls':
                responseHTML = `
                    <div class="text-gray-200 mt-1 flex space-x-4">
                        <span class="text-blue-400 font-bold">projects/</span>
                        <span class="text-blue-400 font-bold">skills/</span>
                        <span class="text-white">description.txt</span>
                    </div>`;
                break;
            case 'cat':
                if (args[1] === 'description.txt') {
                    responseHTML = `<div class="text-gray-200 mt-1">Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.</div>`;
                } else {
                    const safeFile = args[1] ? this.escapeHTML(args[1]) : '';
                    responseHTML = `<div class="text-red-400 mt-1">cat: ${safeFile}: No such file or directory</div>`;
                }
                break;
            case 'neofetch':
                responseHTML = `
                    <div class="flex flex-col md:flex-row text-gray-100 mt-2 mb-2">
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
                    </div>`;
                break;
            case 'open':
                const appName = args[1];
                if (['projects', 'skills', 'contact', 'terminal'].includes(appName)) {
                    responseHTML = `<div class="text-green-400 mt-1">Abriendo ${appName}...</div>`;
                    if (window.app) {
                        window.app.openWindow(appName);
                    }
                } else {
                    const safeApp = appName ? this.escapeHTML(appName) : '';
                    responseHTML = `<div class="text-red-400 mt-1">Aplicación no encontrada: ${safeApp}</div>`;
                }
                break;
            default:
                responseHTML = `<div class="text-red-400 mt-1">${safeCommand}: command not found. Escribe 'help' para ver los comandos disponibles.</div>`;
        }

        this.output.insertAdjacentHTML('beforeend', responseHTML);
        this.scrollToBottom();
    }

    scrollToBottom() {
        if (this.content) {
            this.content.scrollTop = this.content.scrollHeight;
        }
    }
}

// Initialize the OS
window.app = new LinuxOS();