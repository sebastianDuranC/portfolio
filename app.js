class LinuxOS {
    constructor() {
        this.windows = document.querySelectorAll('.os-window');
        this.highestZIndex = 100;
        this.openWindows = new Set();
        
        // Expose globally for terminal access
        window.app = this;

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
            if (dateElement) dateElement.textContent = dateString;
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

            // Store offset state on the element so it persists
            if(win.dataset.xOffset === undefined) win.dataset.xOffset = "0";
            if(win.dataset.yOffset === undefined) win.dataset.yOffset = "0";

            const dragStart = (e) => {
                if(e.target.closest('button')) return;

                // If maximized, clicking header and dragging will un-maximize
                if(win.classList.contains('maximized')) {
                    win.classList.remove('maximized');

                    // Temporarily set transform none to calculate offset relative to mouse
                    win.style.transform = 'none';
                    const rect = win.getBoundingClientRect();

                    // The mouse X relative to the window width
                    const mouseRatioX = e.clientX / window.innerWidth;

                    // Set a sensible starting position
                    const targetLeft = e.clientX - (rect.width * mouseRatioX);

                    // Difference between target physical left and its natural layout left
                    win.dataset.xOffset = (targetLeft - rect.left).toString();
                    win.dataset.yOffset = "0";

                    this.setTranslate(parseFloat(win.dataset.xOffset), parseFloat(win.dataset.yOffset), win);
                }

                initialX = e.clientX - parseFloat(win.dataset.xOffset);
                initialY = e.clientY - parseFloat(win.dataset.yOffset);

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;
                }
            };

            const drag = (e) => {
                if (isDragging) {
                    e.preventDefault();

                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;

                    win.dataset.xOffset = currentX.toString();
                    win.dataset.yOffset = currentY.toString();

                    this.setTranslate(currentX, currentY, win);

                    // Aero snap preview logic could go here if adding a visual overlay
                }
            };

            const dragEnd = (e) => {
                if(isDragging) {
                    initialX = currentX;
                    initialY = currentY;
                    isDragging = false;

                    // Aero snap to top
                    if(e.clientY < 5) {
                        this.maximizeWindow(win.dataset.id);
                    }
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
            let currentResizer = null;
            let initialWidth = 0;
            let initialHeight = 0;
            let initialMouseX = 0;
            let initialMouseY = 0;

            const startResize = (e) => {
                if(win.classList.contains('maximized')) return;
                isResizing = true;
                currentResizer = e.target;

                const rect = win.getBoundingClientRect();
                initialWidth = rect.width;
                initialHeight = rect.height;
                initialMouseX = e.clientX;
                initialMouseY = e.clientY;

                // Temporarily disable transitions during resize
                win.style.transition = 'none';

                this.bringToFront(win);
                e.preventDefault(); // Prevent text selection
            };

            const resize = (e) => {
                if (!isResizing) return;

                if (currentResizer.classList.contains('right') || currentResizer.classList.contains('bottom-right')) {
                    const width = initialWidth + (e.clientX - initialMouseX);
                    win.style.width = `${Math.max(200, width)}px`;
                }

                if (currentResizer.classList.contains('bottom') || currentResizer.classList.contains('bottom-right')) {
                    const height = initialHeight + (e.clientY - initialMouseY);
                    win.style.height = `${Math.max(150, height)}px`;
                }
            };

            const stopResize = () => {
                if (isResizing) {
                    isResizing = false;
                    currentResizer = null;
                    // Restore transitions
                    win.style.transition = 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.2s ease-out';
                }
            };

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', startResize);
            });

            document.addEventListener('mousemove', resize);
            document.addEventListener('mouseup', stopResize);
        });
    }

    setTranslate(xPos, yPos, el) {
        el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
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
                win.dataset.prevTransform = win.style.transform;
                win.classList.add('maximized');
                win.style.transform = 'none';
            } else {
                win.classList.remove('maximized');
                if (win.dataset.prevTransform) {
                    win.style.transform = win.dataset.prevTransform;
                }
            }
            this.bringToFront(win);
        }
    }

    toggleWindow(id) {
        // Obsolete function from Ubuntu design, retained for backwards compatibility
        // The dock icons now explicitly use app.openWindow(id) as per requirements
        this.openWindow(id);
    }
}

class TerminalParser {
    constructor() {
        this.output = document.getElementById('terminal-output');
        this.input = document.getElementById('terminal-input');
        this.container = document.getElementById('terminal-content');

        if(this.input && this.output) {
            this.init();
        }
    }

    init() {
        // Focus input when clicking anywhere in terminal window
        this.container.addEventListener('click', () => {
            this.input.focus();
        });

        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = this.input.value.trim();
                this.echoCmd(cmd);
                this.input.value = '';
                this.processCommand(cmd);
            }
        });

        // Initialize with default commands to show neofetch
        this.processCommand('whoami', false);
        this.processCommand('neofetch', false);
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

    echoCmd(cmd) {
        const line = document.createElement('div');
        line.className = 'mb-1';
        line.innerHTML = `<span class="text-green-400 font-bold mr-2">sebastian@adwaita:</span><span class="text-adwaita-blue font-bold mr-2">~</span>$ ${this.escapeHTML(cmd)}`;
        this.output.appendChild(line);
        this.scrollToBottom();
    }

    printLine(text, isHtml = false) {
        const line = document.createElement('div');
        line.className = 'mb-2 text-adwaita-text';
        if (isHtml) {
            line.innerHTML = text;
        } else {
            line.textContent = text;
        }
        this.output.appendChild(line);
        this.scrollToBottom();
    }

    scrollToBottom() {
        this.container.scrollTop = this.container.scrollHeight;
    }

    processCommand(cmdStr, echo = true) {
        if(echo && cmdStr) this.echoCmd(cmdStr);

        const args = cmdStr.split(' ').filter(Boolean);
        if (args.length === 0) return;

        const cmd = args[0].toLowerCase();

        switch (cmd) {
            case 'help':
                this.printLine(`Comandos disponibles:
  help      - Muestra este mensaje
  whoami    - Muestra el usuario actual
  clear     - Limpia la terminal
  ls        - Lista el contenido del directorio
  neofetch  - Muestra información del sistema
  cat       - Muestra el contenido de un archivo
  open      - Abre una aplicación (ej: open projects)`);
                break;
            case 'whoami':
                this.printLine('Sebastian Duran Caballero');
                break;
            case 'clear':
                this.output.innerHTML = '';
                break;
            case 'ls':
                this.printLine('<span class="text-adwaita-blue font-bold">Proyectos/</span>  <span class="text-adwaita-blue font-bold">Habilidades/</span>  <span class="text-gray-300">description.txt</span>', true);
                break;
            case 'cat':
                if (args[1] === 'description.txt') {
                    this.printLine('Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.');
                } else {
                    this.printLine(`cat: ${args[1] ? this.escapeHTML(args[1]) : ''}: No such file or directory`);
                }
                break;
            case 'open':
                const appName = args[1];
                if (appName && ['projects', 'skills', 'contact'].includes(appName)) {
                    if(window.app) {
                        window.app.openWindow(appName);
                        this.printLine(`Abriendo ${this.escapeHTML(appName)}...`);
                    }
                } else {
                    this.printLine(`Aplicación no encontrada: ${appName ? this.escapeHTML(appName) : ''}. Disponibles: projects, skills, contact`);
                }
                break;
            case 'neofetch':
                const art = `
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
       \`-----'`;

                const info = `
<span class="text-adwaita-blue font-bold">OS:</span> Adwaita OS x86_64
<span class="text-adwaita-blue font-bold">Host:</span> Desarrollador Web
<span class="text-adwaita-blue font-bold">Uptime:</span> 24/7 coding
<span class="text-adwaita-blue font-bold">Packages:</span> HTML, CSS, JS, .NET, C#
<span class="text-adwaita-blue font-bold">Shell:</span> bash 5.1.16
<span class="text-adwaita-blue font-bold">Location:</span> Santa Cruz, Bolivia
<span class="text-adwaita-blue font-bold">Email:</span> sd8587793@email.com`;

                this.printLine(`
<div class="flex flex-col md:flex-row mb-4 mt-2">
    <div class="mr-6 mb-4 md:mb-0 text-adwaita-blue text-[11px] sm:text-xs font-bold leading-tight">
<pre>${art}</pre>
    </div>
    <div class="text-[13px] leading-relaxed">
        ${info}
    </div>
</div>`, true);
                break;
            default:
                this.printLine(`bash: ${this.escapeHTML(cmd)}: command not found`);
        }
    }
}

// Initialize the OS
const app = new LinuxOS();

// Initialize Terminal parser
const terminal = new TerminalParser();