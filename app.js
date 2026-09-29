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
                // Automatically open terminal on startup
                this.openWindow('terminal');
                // Focus terminal
                setTimeout(() => {
                   const termInput = document.getElementById('terminal-input');
                   if(termInput) termInput.focus();
                }, 100);
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
            let startRect;

            // Get desktop bounds for dragging unmaximized logic
            const desktop = document.getElementById('desktop');

            header.addEventListener('mousedown', dragStart);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);

            const self = this;

            function dragStart(e) {
                // Don't drag if maximizing/closing buttons are clicked
                if(e.target.closest('button')) return;

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;
                    self.bringToFront(win);

                    if (win.classList.contains('maximized')) {
                        // We are dragging a maximized window. Restore it.
                        win.classList.remove('maximized');
                        win.style.transform = 'none';

                        // Recalculate offsets based on where the mouse is relative to the restored window
                        const desktopRect = desktop.getBoundingClientRect();
                        const winRect = win.getBoundingClientRect();

                        const mouseX = e.clientX;
                        const mouseY = e.clientY;

                        // We want to center the window horizontally under the cursor, but offset vertically a bit
                        const targetLeft = mouseX - (winRect.width / 2);
                        const targetTop = mouseY - 15;

                        // Calculate transform values based on current offsetLeft/offsetTop
                        const rectLeft = win.offsetLeft + desktopRect.left;
                        const rectTop = win.offsetTop + desktopRect.top;

                        xOffset = targetLeft - rectLeft;
                        yOffset = targetTop - rectTop;

                        initialX = mouseX - xOffset;
                        initialY = mouseY - yOffset;

                        setTranslate(xOffset, yOffset, win);
                    } else {
                        initialX = e.clientX - xOffset;
                        initialY = e.clientY - yOffset;
                    }
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
                }
            }

            function setTranslate(xPos, yPos, el) {
                el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
            }

            function dragEnd(e) {
                if(!isDragging) return;

                initialX = currentX;
                initialY = currentY;
                isDragging = false;

                // Aero snap to top
                if (e.clientY <= 28) { // 28px is top bar height
                    const winId = win.dataset.id;
                    self.maximizeWindow(winId);
                }
            }
        });
    }

    setupResizers() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    isResizing = true;
                    currentResizer = resizer;
                    this.bringToFront(win);

                    document.addEventListener('mousemove', resize);
                    document.addEventListener('mouseup', stopResize);
                });
            });

            function resize(e) {
                if (!isResizing) return;
                const rect = win.getBoundingClientRect();

                if (currentResizer.classList.contains('resizer-r') || currentResizer.classList.contains('resizer-br')) {
                    win.style.width = e.clientX - rect.left + 'px';
                }

                if (currentResizer.classList.contains('resizer-b') || currentResizer.classList.contains('resizer-br')) {
                    win.style.height = e.clientY - rect.top + 'px';
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

                if (id === 'terminal') {
                    setTimeout(() => {
                        const input = document.getElementById('terminal-input');
                        if (input) input.focus();
                    }, 50);
                }
            } else {
                this.bringToFront(win);
                if (id === 'terminal') {
                     const input = document.getElementById('terminal-input');
                     if (input) input.focus();
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
        this.content = document.getElementById('terminal-content');

        if (this.input && this.content) {
            this.init();
        }
    }

    init() {
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = this.input.value.trim();
                this.processCommand(command);
                this.input.value = '';
            }
        });

        // Keep focus on input when clicking inside terminal
        const terminalWindow = document.getElementById('window-terminal');
        if(terminalWindow) {
             terminalWindow.addEventListener('click', () => {
                 this.input.focus();
             });
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
            }[tag] || tag)
        );
    }

    processCommand(command) {
        // Echo command
        const echoDiv = document.createElement('div');
        echoDiv.className = 'mb-2';
        echoDiv.innerHTML = `<span class="text-green-400 font-bold">sebastian@adwaita</span>:<span class="text-blue-400 font-bold">~</span>$ ${this.escapeHTML(command)}`;

        // Insert before the input container
        const inputContainer = this.input.parentElement;
        this.content.insertBefore(echoDiv, inputContainer);

        if (command === '') {
            this.scrollToBottom();
            return;
        }

        const args = command.split(' ');
        const cmd = args[0].toLowerCase();

        let output = '';

        switch (cmd) {
            case 'help':
                output = `
Comandos disponibles:
  help      - Muestra esta ayuda
  whoami    - Muestra el usuario actual
  clear     - Limpia la terminal
  ls        - Lista el contenido del directorio
  neofetch  - Muestra información del sistema
  cat       - Muestra el contenido de un archivo
  open      - Abre una aplicación (ej: open projects)`;
                break;
            case 'whoami':
                output = 'Sebastian Duran Caballero';
                break;
            case 'clear':
                // Remove all previous output elements except the input container
                const elementsToRemove = Array.from(this.content.children).filter(el => el !== inputContainer);
                elementsToRemove.forEach(el => el.remove());
                return;
            case 'ls':
                output = '<span class="text-blue-400 font-bold">Projects</span>  <span class="text-blue-400 font-bold">Skills</span>  <span class="text-blue-400 font-bold">Contact</span>  description.txt';
                break;
            case 'neofetch':
                output = `
<div class="flex flex-col md:flex-row text-gray-100 mb-4">
    <div class="mr-6 mb-4 md:mb-0 text-[#3584e4] text-xs sm:text-sm font-bold">
<pre>
       _,-/&#x60;--,-/\\-,
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
        <p><span class="text-[#3584e4] font-bold">OS:</span> AdwaitaOS x86_64</p>
        <p><span class="text-[#3584e4] font-bold">Host:</span> Desarrollador Web</p>
        <p><span class="text-[#3584e4] font-bold">Uptime:</span> 24/7 coding</p>
        <p><span class="text-[#3584e4] font-bold">Packages:</span> HTML, CSS, JS, .NET, C#</p>
        <p><span class="text-[#3584e4] font-bold">Shell:</span> bash 5.1.16</p>
        <p><span class="text-[#3584e4] font-bold">Location:</span> Santa Cruz, Bolivia</p>
        <p><span class="text-[#3584e4] font-bold">Email:</span> sd8587793@email.com</p>
    </div>
</div>`;
                break;
            case 'cat':
                if (args[1] === 'description.txt') {
                    output = 'Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.';
                } else if (args[1]) {
                    output = `cat: ${this.escapeHTML(args[1])}: No such file or directory`;
                } else {
                    output = 'cat: missing operand';
                }
                break;
            case 'open':
                const appName = args[1];
                if (appName && ['projects', 'skills', 'contact'].includes(appName.toLowerCase())) {
                    output = `Opening ${this.escapeHTML(appName)}...`;
                    window.app.openWindow(appName.toLowerCase());
                } else {
                    output = `open: command not found or invalid app: ${this.escapeHTML(appName || '')}`;
                }
                break;
            default:
                output = `bash: ${this.escapeHTML(cmd)}: command not found`;
        }

        if (output) {
            const outDiv = document.createElement('div');
            outDiv.className = 'text-gray-100 mb-4 whitespace-pre-wrap';
            // Use innerHTML for predefined safe output (like neofetch and ls)
            // User input inside 'output' was already escaped where needed.
            outDiv.innerHTML = output;
            this.content.insertBefore(outDiv, inputContainer);
        }

        this.scrollToBottom();
    }

    scrollToBottom() {
        this.content.scrollTop = this.content.scrollHeight;
    }
}

// Initialize the OS
window.app = new LinuxOS();
window.terminalParser = new TerminalParser();
