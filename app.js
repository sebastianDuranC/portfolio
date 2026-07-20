class LinuxOS {
    constructor() {
        this.windows = document.querySelectorAll('.os-window');
        this.highestZIndex = 100;
        this.openWindows = new Set();
        
        // Configuration for snapping
        this.snapThreshold = 10;
        this.topBarHeight = 28;

        this.init();
        this.initTerminal();
    }

    init() {
        this.setupClock();
        this.setupDraggableAndResizableWindows();
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

    setupDraggableAndResizableWindows() {
        const snapPreview = document.getElementById('snap-preview');

        this.windows.forEach(win => {
            const header = win.querySelector('.window-header');
            const resizers = win.querySelectorAll('.resizer');

            // --- Dragging ---
            let isDragging = false;
            let dragOffsetX = 0;
            let dragOffsetY = 0;
            let willSnap = false;

            if (header) {
                header.addEventListener('mousedown', (e) => {
                    if (e.target.closest('button')) return;
                    if (win.classList.contains('maximized')) {
                        // Unmaximize on drag
                        const rect = win.getBoundingClientRect();
                        const percentX = (e.clientX - rect.left) / rect.width;

                        this.maximizeWindow(win.dataset.id);

                        // Recalculate offset based on percentage to keep mouse relative to header
                        const newRect = win.getBoundingClientRect();
                        dragOffsetX = newRect.width * percentX;
                        dragOffsetY = e.clientY - newRect.top;

                        // Set immediate position to prevent jumping
                        win.style.left = `${e.clientX - dragOffsetX}px`;
                        win.style.top = `${e.clientY - dragOffsetY}px`;

                        isDragging = true;
                        return;
                    }

                    isDragging = true;
                    const rect = win.getBoundingClientRect();
                    dragOffsetX = e.clientX - rect.left;
                    dragOffsetY = e.clientY - rect.top;
                });
            }

            // --- Resizing ---
            let isResizing = false;
            let currentResizer = null;
            let startWidth, startHeight, startX, startY;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    if (win.classList.contains('maximized')) return;
                    isResizing = true;
                    currentResizer = resizer;
                    startX = e.clientX;
                    startY = e.clientY;
                    const rect = win.getBoundingClientRect();
                    startWidth = rect.width;
                    startHeight = rect.height;
                    e.preventDefault(); // Prevent text selection
                });
            });

            // Global mouse move and up
            document.addEventListener('mousemove', (e) => {
                if (isDragging) {
                    let newX = e.clientX - dragOffsetX;
                    let newY = e.clientY - dragOffsetY;

                    // Ensure window doesn't go above top bar
                    if (newY < this.topBarHeight) {
                        newY = this.topBarHeight;
                    }

                    win.style.left = `${newX}px`;
                    win.style.top = `${newY}px`;

                    // Aero snap preview
                    if (e.clientY <= this.topBarHeight + this.snapThreshold) {
                        willSnap = true;
                        snapPreview.classList.add('visible');
                    } else {
                        willSnap = false;
                        snapPreview.classList.remove('visible');
                    }
                }

                if (isResizing) {
                    let newWidth = startWidth;
                    let newHeight = startHeight;

                    if (currentResizer.classList.contains('resizer-r') || currentResizer.classList.contains('resizer-br')) {
                        newWidth = startWidth + (e.clientX - startX);
                    }
                    if (currentResizer.classList.contains('resizer-b') || currentResizer.classList.contains('resizer-br')) {
                        newHeight = startHeight + (e.clientY - startY);
                    }

                    // Respect min-width/min-height defined in inline styles or fallback
                    const minWidth = parseInt(win.style.minWidth) || 300;
                    const minHeight = parseInt(win.style.minHeight) || 200;

                    win.style.width = `${Math.max(newWidth, minWidth)}px`;
                    win.style.height = `${Math.max(newHeight, minHeight)}px`;
                }
            });

            document.addEventListener('mouseup', () => {
                if (isDragging) {
                    isDragging = false;
                    if (willSnap) {
                        snapPreview.classList.remove('visible');
                        if (!win.classList.contains('maximized')) {
                            this.maximizeWindow(win.dataset.id);
                        }
                        willSnap = false;
                    }
                }

                if (isResizing) {
                    isResizing = false;
                    currentResizer = null;
                }
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

                setTimeout(() => {
                    win.classList.remove('window-opening');
                }, 200);

                this.bringToFront(win);
                this.openWindows.add(id);

                if(dot) dot.classList.remove('hidden');

                // Focus terminal input if opening terminal
                if (id === 'terminal') {
                    const input = document.getElementById('terminal-input');
                    if (input) input.focus();
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
                // Save state
                win.dataset.prevTop = win.style.top;
                win.dataset.prevLeft = win.style.left;
                win.dataset.prevWidth = win.style.width;
                win.dataset.prevHeight = win.style.height;

                win.classList.add('maximized');
            } else {
                win.classList.remove('maximized');
                // Restore state
                if (win.dataset.prevTop) win.style.top = win.dataset.prevTop;
                if (win.dataset.prevLeft) win.style.left = win.dataset.prevLeft;
                if (win.dataset.prevWidth) win.style.width = win.dataset.prevWidth;
                if (win.dataset.prevHeight) win.style.height = win.dataset.prevHeight;
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

    // --- Terminal Logic ---
    initTerminal() {
        this.terminalContent = document.getElementById('terminal-content');
        if (!this.terminalContent) return;

        // Initial text
        this.terminalContent.innerHTML = ''; // Clear html placeholder
        this.printToTerminal('Bienvenido a Ubuntu 22.04 LTS (GNU/Linux 5.15.0-generic x86_64)', '');
        this.printToTerminal(' * Escribe "help" para ver los comandos disponibles.', '');
        this.printToTerminal('', '');

        this.createInputLine();

        // Focus input when clicking anywhere in terminal
        this.terminalContent.parentElement.addEventListener('click', () => {
            const input = document.getElementById('terminal-input');
            if (input) input.focus();
        });
    }

    createInputLine() {
        // Remove old input if exists, turn into text
        const oldInput = document.getElementById('terminal-input');
        if (oldInput) {
            const val = oldInput.value;
            const parent = oldInput.parentElement;
            parent.innerHTML = `<span class="text-green-400 font-bold">sebastian@ubuntu</span>:<span class="text-blue-400 font-bold">~</span>$ ${this.escapeHTML(val)}`;
        }

        const line = document.createElement('div');
        line.className = 'w-full flex mt-1';
        line.innerHTML = `
            <span class="text-green-400 font-bold whitespace-pre">sebastian@ubuntu</span><span class="text-white">:</span><span class="text-blue-400 font-bold whitespace-pre">~</span><span class="text-white mr-2">$</span>
            <input type="text" id="terminal-input" class="flex-1 bg-transparent border-none outline-none text-gray-200 font-ubuntu-mono p-0 m-0" autocomplete="off" spellcheck="false">
        `;
        this.terminalContent.appendChild(line);

        const input = document.getElementById('terminal-input');
        input.focus();

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = input.value.trim();
                this.processCommand(command);
            }
        });

        this.scrollToBottom();
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

    printToTerminal(text, className = 'text-gray-200 mt-1') {
        const div = document.createElement('div');
        div.className = className;
        // Using textContent to prevent XSS
        if (typeof text === 'string' && !text.includes('<pre>')) {
            div.textContent = text;
        } else {
            div.innerHTML = text; // Only for safe predefined html like neofetch
        }
        this.terminalContent.appendChild(div);
        this.scrollToBottom();
    }

    scrollToBottom() {
        this.terminalContent.scrollTop = this.terminalContent.scrollHeight;
    }

    processCommand(cmd) {
        const args = cmd.split(' ');
        const mainCmd = args[0].toLowerCase();

        switch (mainCmd) {
            case '':
                break;
            case 'help':
                this.printToTerminal('Comandos disponibles:');
                this.printToTerminal('  help       - Muestra este mensaje');
                this.printToTerminal('  whoami     - Muestra el usuario actual');
                this.printToTerminal('  clear      - Limpia la terminal');
                this.printToTerminal('  ls         - Lista archivos en el directorio actual');
                this.printToTerminal('  cat [file] - Muestra el contenido de un archivo');
                this.printToTerminal('  neofetch   - Muestra información del sistema');
                this.printToTerminal('  open [app] - Abre una aplicación (projects, skills, contact)');
                break;
            case 'whoami':
                this.printToTerminal('sebastian');
                break;
            case 'clear':
                this.terminalContent.innerHTML = '';
                break;
            case 'ls':
                this.printToTerminal('description.txt  projects/  skills/  contact/', 'text-blue-400 font-bold mt-1');
                break;
            case 'cat':
                if (args[1] === 'description.txt') {
                    this.printToTerminal('Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.');
                } else if (!args[1]) {
                    this.printToTerminal('cat: falta el operando de archivo');
                } else {
                    this.printToTerminal(`cat: ${args[1]}: No existe el archivo o el directorio`);
                }
                break;
            case 'neofetch':
                const neofetchHTML = `
                    <div class="flex flex-col md:flex-row text-gray-100 mt-2 mb-2">
                        <div class="mr-6 mb-4 md:mb-0 text-[#e95420] text-xs font-bold">
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
                this.printToTerminal(neofetchHTML, '');
                break;
            case 'open':
                const appToOpen = args[1];
                if (['projects', 'skills', 'contact'].includes(appToOpen)) {
                    this.openWindow(appToOpen);
                    this.printToTerminal(`Abriendo ${appToOpen}...`);
                } else if (!appToOpen) {
                    this.printToTerminal('open: especifique una aplicación (projects, skills, contact)');
                } else {
                    this.printToTerminal(`open: aplicación '${appToOpen}' no encontrada`);
                }
                break;
            default:
                this.printToTerminal(`${mainCmd}: orden no encontrada`);
                break;
        }

        this.createInputLine();
    }
}

const app = new LinuxOS();