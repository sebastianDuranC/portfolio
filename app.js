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
        this.setupTerminal();
    }

    setupTerminal() {
        const input = document.getElementById('terminal-input');
        const output = document.getElementById('terminal-output');
        if (!input || !output) return;

        // Ensure input is always focused when clicking anywhere in terminal
        const terminalWindow = document.getElementById('window-terminal');
        if(terminalWindow) {
            terminalWindow.querySelector('.window-content').addEventListener('click', () => {
                // Use a small timeout to allow text selection without stealing focus instantly
                setTimeout(() => {
                    const selection = window.getSelection();
                    if(selection.toString().length === 0) {
                        input.focus();
                    }
                }, 10);
            });
        }

        const neofetchOutput = `
<div class="flex flex-col md:flex-row text-gray-100 mb-4">
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
`;

        const commands = {
            'help': 'Comandos disponibles: help, whoami, clear, ls, neofetch, cat [archivo], open [aplicacion]',
            'whoami': 'Sebastian Duran Caballero',
            'ls': 'description.txt  projects/  skills/  contact/',
            'neofetch': neofetchOutput,
        };

        const fileSystem = {
            'description.txt': 'Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.'
        };

        const executeCommand = (cmd) => {
            const parts = cmd.trim().split(' ').filter(p => p);
            if (parts.length === 0) return '';

            const baseCmd = parts[0].toLowerCase();
            const args = parts.slice(1);

            if (baseCmd === 'clear') {
                output.innerHTML = '';
                return null; // Return null so we don't print a new line
            }

            if (baseCmd === 'cat') {
                if(args.length === 0) return 'cat: falta un operando de archivo';
                if(fileSystem[args[0]]) {
                    return fileSystem[args[0]];
                }
                return `cat: ${args[0]}: No existe el archivo o el directorio`;
            }

            if (baseCmd === 'open') {
                if(args.length === 0) return 'open: falta el nombre de la aplicacion (terminal, projects, skills, contact)';
                const appName = args[0].toLowerCase();
                if(['terminal', 'projects', 'skills', 'contact'].includes(appName)) {
                    this.openWindow(appName);
                    return `Abriendo ${appName}...`;
                }
                return `open: aplicacion no encontrada: ${appName}`;
            }

            if (commands[baseCmd] !== undefined) {
                return commands[baseCmd];
            }

            return `${baseCmd}: orden no encontrada`;
        };

        const printOutput = (cmd, result) => {
            const promptLine = document.createElement('div');
            promptLine.className = 'mb-1';

            // Re-create the prompt HTML
            const promptSpan = document.createElement('span');
            promptSpan.innerHTML = '<span class="text-green-400 font-bold">sebastian@ubuntu</span>:<span class="text-blue-400 font-bold">~</span>$ ';

            const cmdText = document.createElement('span');
            cmdText.textContent = cmd;

            promptLine.appendChild(promptSpan);
            promptLine.appendChild(cmdText);

            output.appendChild(promptLine);

            if (result !== null && result !== '') {
                const resultLine = document.createElement('div');
                resultLine.className = 'text-gray-100 mb-4 whitespace-pre-wrap';

                // Allow HTML output for neofetch, otherwise use textContent to escape XSS
                if (cmd.trim().toLowerCase() === 'neofetch') {
                    resultLine.innerHTML = result;
                } else {
                    resultLine.textContent = result;
                }
                output.appendChild(resultLine);
            }

            // Scroll to bottom
            const container = output.parentElement;
            container.scrollTop = container.scrollHeight;
        };

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = input.value;
                input.value = '';
                const result = executeCommand(cmd);
                printOutput(cmd, result);
            }
        });

        // Run initial commands to populate terminal
        setTimeout(() => {
            printOutput('whoami', executeCommand('whoami'));
            printOutput('cat description.txt', executeCommand('cat description.txt'));
            printOutput('neofetch', executeCommand('neofetch'));
        }, 100);
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
        const snapPreview = document.getElementById('snap-preview');

        this.windows.forEach(win => {
            const header = win.querySelector('.window-header');
            if (!header) return;

            let isDragging = false;
            let initialX, initialY, startX, startY;
            let rect;

            header.addEventListener('mousedown', (e) => {
                if(e.target.closest('button')) return;

                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;

                if (win.classList.contains('maximized')) {
                    // Temporarily unset transform to get accurate bounding rect
                    win.style.transform = 'none';
                    rect = win.getBoundingClientRect();

                    // Calculate relative offset based on mouse position
                    const mousePercentX = e.clientX / window.innerWidth;

                    // Prepare to unmaximize
                    win.classList.remove('maximized');

                    // Set inline position based on where user grabbed it
                    const newWidth = parseInt(win.style.width) || 700; // fallback width
                    initialX = e.clientX - (newWidth * mousePercentX);
                    initialY = e.clientY - 15; // 15px offset for top header

                    win.style.transform = `translate3d(${initialX}px, ${initialY}px, 0)`;
                } else {
                    const style = window.getComputedStyle(win);
                    const matrix = new WebKitCSSMatrix(style.transform);
                    initialX = matrix.m41;
                    initialY = matrix.m42;
                }

                this.bringToFront(win);
            });

            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                e.preventDefault();

                const dx = e.clientX - startX;
                const dy = e.clientY - startY;

                win.style.transform = `translate3d(${initialX + dx}px, ${initialY + dy}px, 0)`;

                // Aero snap preview logic
                if (e.clientY <= 5) {
                    snapPreview.classList.add('snap-preview-active');
                } else {
                    snapPreview.classList.remove('snap-preview-active');
                }
            });

            document.addEventListener('mouseup', (e) => {
                if (!isDragging) return;
                isDragging = false;

                // Handle Aero snap maximize
                if (e.clientY <= 5) {
                    this.maximizeWindow(win.dataset.id, true);
                }
                snapPreview.classList.remove('snap-preview-active');
            });
        });
    }

    setupWindowResizing() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer;
            let startWidth, startHeight, startX, startY;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    if (win.classList.contains('maximized')) return;
                    isResizing = true;
                    currentResizer = resizer;
                    startX = e.clientX;
                    startY = e.clientY;
                    startWidth = parseInt(document.defaultView.getComputedStyle(win).width, 10);
                    startHeight = parseInt(document.defaultView.getComputedStyle(win).height, 10);

                    this.bringToFront(win);
                    e.preventDefault();
                });
            });

            document.addEventListener('mousemove', (e) => {
                if (!isResizing) return;

                if (currentResizer.classList.contains('right') || currentResizer.classList.contains('bottom-right')) {
                    const newWidth = startWidth + (e.clientX - startX);
                    win.style.width = `${newWidth}px`;
                }

                if (currentResizer.classList.contains('bottom') || currentResizer.classList.contains('bottom-right')) {
                    const newHeight = startHeight + (e.clientY - startY);
                    win.style.height = `${newHeight}px`;
                }
            });

            document.addEventListener('mouseup', () => {
                isResizing = false;
            });
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

    maximizeWindow(id, forceMaximize = false) {
        const win = document.getElementById(`window-${id}`);
        if (win) {
            if (!win.classList.contains('maximized') || forceMaximize) {
                // Save current transform before maximizing
                if(!win.classList.contains('maximized')) {
                     win.dataset.prevTransform = win.style.transform;
                }
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