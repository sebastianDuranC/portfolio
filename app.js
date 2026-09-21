class TerminalParser {
    constructor(outputContainerId, inputId) {
        this.outputContainer = document.getElementById(outputContainerId);
        this.input = document.getElementById(inputId);

        if(this.input) {
            this.input.addEventListener('keydown', (e) => this.handleInput(e));
        }

        this.commands = {
            'help': 'Comandos disponibles: help, whoami, clear, ls, neofetch, cat, open',
            'whoami': 'Sebastian Duran Caballero',
            'clear': () => { this.outputContainer.innerHTML = ''; },
            'ls': 'description.txt',
            'cat description.txt': 'Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.',
            'neofetch': this.getNeofetch(),
            'open projects': () => { window.app.openWindow('projects'); return 'Abriendo Proyectos...'; },
            'open skills': () => { window.app.openWindow('skills'); return 'Abriendo Habilidades...'; },
            'open contact': () => { window.app.openWindow('contact'); return 'Abriendo Contacto...'; }
        };

        // Initial run
        this.printLine('sebastian@adwaita:~$ whoami', true);
        this.printLine(this.commands['whoami']);
        this.printLine('sebastian@adwaita:~$ neofetch', true);
        this.printLine(this.getNeofetch(), false, true);
    }

    getNeofetch() {
        return `
<div class="flex flex-col md:flex-row text-gray-100 my-2">
    <div class="mr-6 mb-4 md:mb-0 text-[#3584e4] text-xs sm:text-sm font-bold font-fira-code">
<pre>
         _YYYYYYYYYYYYYYYYYYYYYYYYYYY_
       _YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY_
     _YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY_
    YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
   YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
  YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
 YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
 YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
 YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
 YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
  YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
   YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
    YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
     "YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY"
       "YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY"
         "YYYYYYYYYYYYYYYYYYYYYYYYYYY"
</pre>
    </div>
    <div class="font-fira-code text-sm">
        <p><span class="text-[#3584e4] font-bold">OS:</span> GNOME OS x86_64</p>
        <p><span class="text-[#3584e4] font-bold">Host:</span> Desarrollador Web</p>
        <p><span class="text-[#3584e4] font-bold">Uptime:</span> 24/7 coding</p>
        <p><span class="text-[#3584e4] font-bold">Packages:</span> HTML, CSS, JS, .NET, C#</p>
        <p><span class="text-[#3584e4] font-bold">Shell:</span> bash</p>
        <p><span class="text-[#3584e4] font-bold">Location:</span> Santa Cruz, Bolivia</p>
        <p><span class="text-[#3584e4] font-bold">Email:</span> sd8587793@email.com</p>
    </div>
</div>`;
    }

    handleInput(e) {
        if (e.key === 'Enter') {
            const cmd = this.input.value.trim();
            this.input.value = '';

            if (cmd) {
                this.printLine(`sebastian@adwaita:~$ ${cmd}`, true);
                this.processCommand(cmd);
            } else {
                this.printLine(`sebastian@adwaita:~$ `, true);
            }

            this.scrollToBottom();
        }
    }

    processCommand(cmd) {
        // Simple cat fallback
        if(cmd.startsWith('cat ') && cmd !== 'cat description.txt') {
            this.printLine(`cat: ${cmd.substring(4)}: No such file or directory`);
            return;
        }

        const response = this.commands[cmd];

        if (typeof response === 'function') {
            const res = response();
            if(res) this.printLine(res);
        } else if (response) {
            this.printLine(response, false, cmd === 'neofetch');
        } else {
            this.printLine(`bash: ${cmd}: command not found`);
        }
    }

    printLine(text, isCommand = false, isHtml = false) {
        const div = document.createElement('div');
        div.className = 'mb-1';

        if (isCommand) {
            // Re-style the prompt part safely
            if(text.startsWith('sebastian@adwaita:~$ ')) {
                const parts = text.split('sebastian@adwaita:~$ ');
                div.innerHTML = `<span class="text-[#8ff0a4] font-bold">sebastian@adwaita</span>:<span class="text-[#78aeed] font-bold">~</span>$ `;
                const textNode = document.createTextNode(parts[1]);
                div.appendChild(textNode);
            } else {
                div.textContent = text;
            }
        } else {
            if(isHtml) {
                div.innerHTML = text; // Safe here as we control the HTML in getNeofetch
            } else {
                div.textContent = text;
            }
        }

        this.outputContainer.appendChild(div);
    }

    scrollToBottom() {
        this.outputContainer.scrollTop = this.outputContainer.scrollHeight;
        // Keep focus
        setTimeout(() => this.input.focus(), 10);
    }
}

class LinuxOS {
    constructor() {
        this.windows = document.querySelectorAll('.os-window');
        this.highestZIndex = 100;
        this.openWindows = new Set();
        this.desktop = document.getElementById('desktop');
        
        this.init();
    }

    init() {
        this.setupClock();
        this.setupDraggableWindows();
        this.setupWindowResizing();
        this.setupWindowClickToFront();
        this.setupLogin();

        setTimeout(() => {
            this.terminal = new TerminalParser('terminal-output', 'terminal-input');
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
            if(dateElement) dateElement.textContent = dateString;
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

                // Focus terminal input if terminal is clicked
                if(win.id === 'window-terminal' && this.terminal) {
                    this.terminal.input.focus();
                }
            });
        });
    }

    setupDraggableWindows() {
        const desktopRect = this.desktop.getBoundingClientRect();

        this.windows.forEach(win => {
            const header = win.querySelector('.window-header');
            if (!header) return;

            let isDragging = false;
            let startX, startY;
            // Internal tracking offsets for drag transformation
            win._xOffset = 0;
            win._yOffset = 0;

            header.addEventListener('mousedown', (e) => {
                if(e.target.closest('button')) return;

                // If maximized, clicking header and dragging should restore it
                if(win.classList.contains('maximized')) {
                    win._isDraggingToRestore = true;
                } else {
                    win.style.transition = 'none'; // Disable transition during drag
                }

                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;

                this.bringToFront(win);
            });

            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                e.preventDefault();

                if (win._isDraggingToRestore) {
                    win._isDraggingToRestore = false;
                    win.classList.remove('maximized');

                    // Recalculate relative position
                    win.style.transform = 'none';
                    const rect = win.getBoundingClientRect();
                    const desktopRect = this.desktop.getBoundingClientRect();

                    // Set logical coordinates based on mouse position
                    // Try to keep the mouse in the middle of the header
                    win.style.top = '0px';
                    win.style.left = '0px';

                    const newX = e.clientX - desktopRect.left - (rect.width / 2);
                    const newY = e.clientY - desktopRect.top;

                    win._xOffset = newX;
                    win._yOffset = newY;

                    win.style.transform = `translate3d(${win._xOffset}px, ${win._yOffset}px, 0)`;

                    startX = e.clientX;
                    startY = e.clientY;
                    return;
                }

                const dx = e.clientX - startX;
                const dy = e.clientY - startY;

                win._xOffset += dx;
                win._yOffset += dy;

                win.style.transform = `translate3d(${win._xOffset}px, ${win._yOffset}px, 0)`;

                startX = e.clientX;
                startY = e.clientY;
            });

            document.addEventListener('mouseup', (e) => {
                if(isDragging) {
                    isDragging = false;
                    win.style.transition = ''; // Restore transition

                    // Aero snap to top
                    const desktopRect = this.desktop.getBoundingClientRect();
                    if(e.clientY - desktopRect.top < 10) {
                         this.maximizeWindow(win.dataset.id);
                    }
                }
            });
        });
    }

    setupWindowResizing() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer = null;
            let startX, startY, startWidth, startHeight;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    if(win.classList.contains('maximized')) return;

                    isResizing = true;
                    currentResizer = resizer;
                    startX = e.clientX;
                    startY = e.clientY;

                    const rect = win.getBoundingClientRect();
                    startWidth = rect.width;
                    startHeight = rect.height;

                    win.style.transition = 'none';
                    this.bringToFront(win);
                });
            });

            document.addEventListener('mousemove', (e) => {
                if (!isResizing) return;

                const dx = e.clientX - startX;
                const dy = e.clientY - startY;

                if (currentResizer.classList.contains('right') || currentResizer.classList.contains('bottom-right')) {
                    win.style.width = `${startWidth + dx}px`;
                }
                if (currentResizer.classList.contains('bottom') || currentResizer.classList.contains('bottom-right')) {
                    win.style.height = `${startHeight + dy}px`;
                }
            });

            document.addEventListener('mouseup', () => {
                if(isResizing) {
                    isResizing = false;
                    win.style.transition = '';
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

                if(id === 'terminal' && this.terminal) {
                    setTimeout(() => this.terminal.input.focus(), 50);
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
                // Save previous transform state
                win.dataset.prevXOffset = win._xOffset;
                win.dataset.prevYOffset = win._yOffset;

                win.classList.add('maximized');
                win.style.transform = 'none'; // Overridden by CSS max
            } else {
                win.classList.remove('maximized');
                // Restore transform state
                if(win.dataset.prevXOffset !== undefined) {
                    win._xOffset = parseFloat(win.dataset.prevXOffset);
                    win._yOffset = parseFloat(win.dataset.prevYOffset);
                    win.style.transform = `translate3d(${win._xOffset}px, ${win._yOffset}px, 0)`;
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

// Global initialization
window.app = new LinuxOS();
