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
                // Don't drag if maximizing/closing buttons are clicked
                if(e.target.closest('button')) return;

                if (win.classList.contains('maximized')) {
                    // Restore window from maximized state while dragging
                    win.classList.remove('maximized');
                    win.style.transform = 'none'; // Temporarily clear transform for natural position

                    const rect = win.getBoundingClientRect();
                    // We want the mouse to stay roughly in the same spot on the header
                    // Since it drops down from being full width, let's roughly center the drag or maintain relative mouse position
                    // Actually, simpler: calculate xOffset such that mouse is grabbing the center of the header.
                    const naturalWidth = win.offsetWidth;
                    // Try to center window under mouse horizontally
                    let targetLeft = e.clientX - (naturalWidth / 2);

                    xOffset = targetLeft - rect.left;
                    yOffset = e.clientY - rect.top; // Keep window directly under cursor vertically

                    // Adjust initialX and initialY so drag function computes correctly
                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;

                    // Set transform right away to avoid jump
                    win.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0)`;
                } else {
                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;
                }

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;
                }
            };

            const drag = (e) => {
                if (isDragging) {
                    e.preventDefault();
                    // Top snap to maximize
                    if (e.clientY <= 0 && !win.classList.contains('maximized')) {
                        isDragging = false;
                        this.maximizeWindow(win.dataset.id);
                        return;
                    }

                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;

                    xOffset = currentX;
                    yOffset = currentY;

                    win.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0)`;
                }
            };

            const dragEnd = (e) => {
                initialX = currentX;
                initialY = currentY;
                isDragging = false;
            };

            // Double click on header to maximize/restore
            header.addEventListener('dblclick', () => {
                this.maximizeWindow(win.dataset.id);
            });

            header.addEventListener('mousedown', dragStart);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);
        });
    }

    setupResizableWindows() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer = null;
            let startWidth, startHeight, startX, startY;

            const mousedown = (e) => {
                isResizing = true;
                currentResizer = e.target;
                startWidth = win.offsetWidth;
                startHeight = win.offsetHeight;
                startX = e.clientX;
                startY = e.clientY;

                // Disable transform animation during resize
                win.style.transition = 'none';

                // Ensure we use inline pixels for smooth resizing instead of tailwind %
                win.style.width = startWidth + 'px';
                win.style.height = startHeight + 'px';

                this.bringToFront(win);
                e.preventDefault();
            };

            const mousemove = (e) => {
                if (!isResizing) return;

                if (currentResizer.classList.contains('resizer-r') || currentResizer.classList.contains('resizer-br')) {
                    win.style.width = (startWidth + e.clientX - startX) + 'px';
                }

                if (currentResizer.classList.contains('resizer-b') || currentResizer.classList.contains('resizer-br')) {
                    win.style.height = (startHeight + e.clientY - startY) + 'px';
                }
            };

            const mouseup = (e) => {
                if (isResizing) {
                    isResizing = false;
                    currentResizer = null;
                    // Restore animation
                    win.style.transition = 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.2s ease-out';
                }
            };

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', mousedown);
            });
            document.addEventListener('mousemove', mousemove);
            document.addEventListener('mouseup', mouseup);
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

// Terminal Parser class
class TerminalParser {
    constructor() {
        this.input = document.getElementById('terminal-input');
        this.output = document.getElementById('terminal-output');

        if (!this.input || !this.output) return;

        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = this.input.value;
                this.input.value = '';
                this.processCommand(cmd);
            }
        });

        // Initial pre-population
        this.echo('sebastian@adwaita:~$ whoami', true);
        this.processCommand('whoami', true);

        this.echo('sebastian@adwaita:~$ neofetch', true);
        this.processCommand('neofetch', true);
    }

    echo(text, isCommand = false) {
        const div = document.createElement('div');
        div.className = 'mb-2';

        if (isCommand) {
            // Already safely formatted in the caller
            div.innerHTML = text;
        } else {
            // Text content for output to avoid XSS
            div.textContent = text;
        }

        this.output.appendChild(div);
        this.output.parentElement.scrollTop = this.output.parentElement.scrollHeight;
    }

    echoHTML(html) {
        const div = document.createElement('div');
        div.className = 'mb-2 text-gray-100';
        div.innerHTML = html;
        this.output.appendChild(div);
        this.output.parentElement.scrollTop = this.output.parentElement.scrollHeight;
    }

    processCommand(cmd, silentInput = false) {
        const command = cmd.trim();
        if (!silentInput) {
            // Echo the command the user typed safely
            const safeCmd = command.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            this.echo(`<span class="text-green-400 font-bold">sebastian@adwaita</span>:<span class="text-blue-400 font-bold">~</span>$ ${safeCmd}`, true);
        }

        if (command === '') return;

        const parts = command.split(' ');
        const baseCmd = parts[0].toLowerCase();

        switch (baseCmd) {
            case 'help':
                this.echo('Comandos disponibles:');
                this.echo('  whoami    - Muestra el usuario actual');
                this.echo('  neofetch  - Muestra la información del sistema');
                this.echo('  ls        - Lista los archivos en el directorio');
                this.echo('  cat       - Lee un archivo (ej: cat description.txt)');
                this.echo('  open      - Abre una aplicación (ej: open projects)');
                this.echo('  clear     - Limpia la terminal');
                this.echo('  help      - Muestra esta ayuda');
                break;
            case 'whoami':
                this.echo('Sebastian Duran Caballero');
                break;
            case 'clear':
                this.output.innerHTML = '';
                break;
            case 'ls':
                this.echoHTML('<span class="text-blue-400 font-bold mr-4">projects</span><span class="text-gray-300 mr-4">description.txt</span><span class="text-blue-400 font-bold mr-4">skills</span>');
                break;
            case 'cat':
                if (parts[1] === 'description.txt') {
                    this.echo('Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.');
                } else if (!parts[1]) {
                    this.echo('cat: falta el operando de archivo');
                } else {
                    this.echo(`cat: ${parts[1]}: No existe el archivo o el directorio`);
                }
                break;
            case 'open':
                const appName = parts[1];
                if (['projects', 'skills', 'contact'].includes(appName)) {
                    if (window.app) {
                        window.app.openWindow(appName);
                        this.echo(`Abriendo ${appName}...`);
                    }
                } else if (!appName) {
                    this.echo('open: falta el nombre de la aplicación');
                } else {
                    this.echo(`open: aplicación no encontrada: ${appName}`);
                }
                break;
            case 'neofetch':
                this.echoHTML(`
                    <div class="flex flex-col md:flex-row text-gray-100 mb-4 mt-2">
                        <div class="mr-6 mb-4 md:mb-0 text-[#3584e4] text-xs sm:text-sm font-bold font-fira-code leading-tight whitespace-pre">
              .@@@@@@@@@@.
         .@@@@@@@@@@@@@@@@@@.
       .@@@@@@@@@@@@@@@@@@@@@@.
     .@@@@@@@@@@@@@@@@@@@@@@@@@@.
    .@@@@@@@.            .@@@@@@@.
   .@@@@@@@.              .@@@@@@@.
  .@@@@@@@.                .@@@@@@@.
 .@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@.
 .@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@.
  .@@@@@@@.                .@@@@@@@.
   .@@@@@@@.              .@@@@@@@.
    .@@@@@@@.            .@@@@@@@.
     .@@@@@@@@@@@@@@@@@@@@@@@@@@.
       .@@@@@@@@@@@@@@@@@@@@@@.
         .@@@@@@@@@@@@@@@@@@.
              .@@@@@@@@.
                        </div>
                        <div>
                            <p><span class="text-[#3584e4] font-bold">OS:</span> GNOME OS x86_64</p>
                            <p><span class="text-[#3584e4] font-bold">Host:</span> Desarrollador Web</p>
                            <p><span class="text-[#3584e4] font-bold">Uptime:</span> 24/7 coding</p>
                            <p><span class="text-[#3584e4] font-bold">Packages:</span> HTML, CSS, JS, .NET, C#</p>
                            <p><span class="text-[#3584e4] font-bold">Shell:</span> bash 5.1.16</p>
                            <p><span class="text-[#3584e4] font-bold">Location:</span> Santa Cruz, Bolivia</p>
                            <p><span class="text-[#3584e4] font-bold">Email:</span> sd8587793@email.com</p>
                        </div>
                    </div>
                `);
                break;
            default:
                this.echo(`bash: ${baseCmd}: orden no encontrada`);
                break;
        }
    }
}

// Initialize the OS and Terminal
window.app = new LinuxOS();
window.terminalParser = new TerminalParser();
