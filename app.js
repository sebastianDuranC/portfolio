class LinuxOS {
    constructor() {
        this.windows = document.querySelectorAll('.os-window');
        this.highestZIndex = 100;
        this.openWindows = new Set();
        
        // Expose globally to allow other modules (like TerminalParser) to access window controls
        window.app = this;

        this.init();
    }

    init() {
        this.setupClock();
        this.setupDraggableWindows();
        this.setupWindowClickToFront();
        this.setupResizableWindows();
        this.setupLogin();
    }

    setupResizableWindows() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            if (resizers.length === 0) return;

            let isResizing = false;
            let currentResizer;
            let startX;
            let startY;
            let startWidth;
            let startHeight;
            let winStartLeft;
            let winStartTop;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    if (win.classList.contains('maximized')) return;

                    e.preventDefault();
                    isResizing = true;
                    currentResizer = resizer;

                    startX = e.clientX;
                    startY = e.clientY;

                    // Get current dimensions and position
                    const rect = win.getBoundingClientRect();
                    startWidth = rect.width;
                    startHeight = rect.height;

                    // For position, we need to consider any CSS transforms
                    // Since dragging uses transforms, bounding client rect gives us the absolute position
                    winStartLeft = rect.left;
                    winStartTop = rect.top;

                    document.addEventListener('mousemove', resize);
                    document.addEventListener('mouseup', stopResize);

                    // Temporarily reset transform and use absolute positioning during resize
                    win.style.transform = 'none';
                    win.style.left = `${winStartLeft}px`;
                    win.style.top = `${winStartTop}px`;
                });
            });

            function resize(e) {
                if (!isResizing) return;

                const dx = e.clientX - startX;
                const dy = e.clientY - startY;

                if (currentResizer.classList.contains('right')) {
                    win.style.width = `${startWidth + dx}px`;
                } else if (currentResizer.classList.contains('bottom')) {
                    win.style.height = `${startHeight + dy}px`;
                } else if (currentResizer.classList.contains('bottom-right')) {
                    win.style.width = `${startWidth + dx}px`;
                    win.style.height = `${startHeight + dy}px`;
                }
            }

            function stopResize() {
                isResizing = false;
                document.removeEventListener('mousemove', resize);
                document.removeEventListener('mouseup', stopResize);
            }
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

            const dragStart = (e) => {
                if(e.target.closest('button')) return;

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;

                    if (win.classList.contains('maximized')) {
                        // Unmaximize on drag
                        win.classList.remove('maximized');
                        win.style.transform = 'none';

                        // Calculate new offsets relative to desktop container
                        const desktopRect = document.getElementById('desktop').getBoundingClientRect();
                        const winRect = win.getBoundingClientRect();

                        // Set left/top based on mouse position horizontally, keeping top close to mouse
                        let newLeft = e.clientX - desktopRect.left - (winRect.width / 2);
                        // Prevent dragging out of bounds horizontally
                        if (newLeft < 0) newLeft = 0;
                        if (newLeft + winRect.width > desktopRect.width) newLeft = desktopRect.width - winRect.width;

                        win.style.left = `${newLeft}px`;
                        win.style.top = `${e.clientY - desktopRect.top - 10}px`; // 10px from top of header

                        xOffset = 0;
                        yOffset = 0;
                        initialX = e.clientX;
                        initialY = e.clientY;
                    } else {
                        initialX = e.clientX - xOffset;
                        initialY = e.clientY - yOffset;
                    }
                }
            };

            const drag = (e) => {
                if (isDragging) {
                    e.preventDefault();

                    // Aero snap: Maximize if dragged to top of desktop (Y close to 28px top bar)
                    if (e.clientY <= 30 && !win.classList.contains('maximized')) {
                        const id = win.getAttribute('data-id');
                        this.maximizeWindow(id);
                        isDragging = false;
                        return;
                    }

                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;

                    xOffset = currentX;
                    yOffset = currentY;

                    win.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
                }
            };

            const dragEnd = (e) => {
                if (isDragging) {
                    initialX = currentX;
                    initialY = currentY;
                    isDragging = false;
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
class TerminalParser {
    constructor() {
        this.input = document.getElementById('terminal-input');
        this.output = document.getElementById('terminal-output');
        this.prompt = '<span class="text-green-400 font-bold mr-1">sebastian@adwaita</span>:<span class="text-blue-400 font-bold mr-2">~</span>$ ';

        this.commands = {
            'help': () => `Comandos disponibles:
  help      - Muestra este mensaje
  whoami    - Muestra el usuario actual
  neofetch  - Muestra información del sistema
  clear     - Limpia la terminal
  ls        - Lista archivos
  cat       - Muestra el contenido de un archivo
  open      - Abre una aplicación (ej: open projects)`,
            'whoami': () => 'Sebastian Duran Caballero',
            'ls': () => 'description.txt  projects/  skills/  contact/',
            'clear': () => {
                this.output.innerHTML = '';
                return null;
            },
            'cat': (args) => {
                if (!args || args.length === 0) return 'cat: falta el operando de archivo';
                if (args[0] === 'description.txt') {
                    return 'Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.';
                }
                return `cat: ${this.escapeHTML(args[0])}: No existe el archivo o el directorio`;
            },
            'open': (args) => {
                if (!args || args.length === 0) return 'open: falta el nombre de la aplicación. Usar: terminal, projects, skills, contact';
                const appName = args[0].toLowerCase();
                if (['terminal', 'projects', 'skills', 'contact'].includes(appName)) {
                    if (window.app) window.app.openWindow(appName);
                    return `Abriendo ${appName}...`;
                }
                return `open: aplicación '${this.escapeHTML(appName)}' no encontrada`;
            },
            'neofetch': () => {
                return `<div class="flex flex-col md:flex-row text-gray-100 mb-4">
                        <div class="mr-6 mb-4 md:mb-0 text-[#3584e4] text-xs sm:text-sm font-bold">
<pre>
           .
         / \\
       /___\\
      / . . \\
     / /___\\ \\
    / /     \\ \\
   / /       \\ \\
  / /         \\ \\
 / /           \\ \\
/ /             \\ \\
\\/               \\/
</pre>
                        </div>
                        <div>
                            <p><span class="text-[#3584e4] font-bold">OS:</span> GNOME 40+ Adwaita</p>
                            <p><span class="text-[#3584e4] font-bold">Host:</span> Desarrollador Web</p>
                            <p><span class="text-[#3584e4] font-bold">Uptime:</span> 24/7 coding</p>
                            <p><span class="text-[#3584e4] font-bold">Packages:</span> HTML, CSS, JS, .NET, C#</p>
                            <p><span class="text-[#3584e4] font-bold">Shell:</span> bash 5.1.16</p>
                            <p><span class="text-[#3584e4] font-bold">Location:</span> Santa Cruz, Bolivia</p>
                            <p><span class="text-[#3584e4] font-bold">Email:</span> sd8587793@email.com</p>
                        </div>
                    </div>`;
            }
        };

        this.init();
    }

    init() {
        if (!this.input || !this.output) return;

        // Keep focus on input when clicking terminal content
        const content = document.getElementById('terminal-content');
        if (content) {
            content.addEventListener('click', () => this.input.focus());
        }

        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmdLine = this.input.value.trim();
                this.input.value = '';
                this.processCommand(cmdLine);
            }
        });

        // Pre-populate terminal
        this.processCommand('whoami');
        this.processCommand('neofetch');
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

    processCommand(cmdLine) {
        if (!cmdLine) {
            this.printOutput(this.prompt + '<br>');
            return;
        }

        const args = cmdLine.split(' ').filter(Boolean);
        const cmd = args.shift().toLowerCase();

        this.printOutput(this.prompt + this.escapeHTML(cmdLine) + '<br>');

        if (this.commands[cmd]) {
            const result = this.commands[cmd](args);
            if (result !== null) {
                // If it's a known string or HTML we want to render safely
                // Commands logic returns safe HTML (neofetch) or we escape user input inside logic
                this.printOutput(result + '<br>');
            }
        } else {
            this.printOutput(`bash: ${this.escapeHTML(cmd)}: orden no encontrada<br>`);
        }

        // Auto scroll to bottom
        const content = document.getElementById('terminal-content');
        if (content) {
            content.scrollTop = content.scrollHeight;
        }
    }

    printOutput(htmlString) {
        // We use insertAdjacentHTML since output is controlled or escaped.
        this.output.insertAdjacentHTML('beforeend', htmlString);
    }
}

// Initialize terminal parser
document.addEventListener('DOMContentLoaded', () => {
    window.terminalParser = new TerminalParser();
});
