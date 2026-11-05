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
        this.setupWindowResizing();
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

                if(win.classList.contains('maximized')) {
                    // Restore window on drag
                    win.classList.remove('maximized');
                    win.style.transform = 'none';

                    const rect = win.getBoundingClientRect();
                    // Center the window on the cursor horizontally
                    const newLeft = e.clientX - (rect.width / 2);
                    const targetLeft = Math.max(0, newLeft); // Prevent going off-screen left

                    // Recalculate xOffset based on natural layout position vs target
                    const style = window.getComputedStyle(win);
                    const naturalLeft = parseFloat(style.left) || 0;

                    currentX = targetLeft - naturalLeft;
                    currentY = 0; // Stick to top (header) initially

                    xOffset = currentX;
                    yOffset = currentY;

                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;

                    setTranslate(currentX, currentY, win);
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

                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;

                    // Prevent dragging above top bar
                    const rect = win.getBoundingClientRect();
                    const desktopRect = document.getElementById('desktop').getBoundingClientRect();

                    // Calculate natural top position
                    const style = window.getComputedStyle(win);
                    const naturalTop = parseFloat(style.top) || 0;
                    const desktopTop = desktopRect.top;

                    // If the absolute top of the window goes above desktopTop, constrain currentY
                    const absoluteTargetTop = desktopTop + naturalTop + currentY;

                    if (absoluteTargetTop < desktopTop) {
                         currentY = desktopTop - (desktopTop + naturalTop);
                    }


                    xOffset = currentX;
                    yOffset = currentY;

                    setTranslate(currentX, currentY, win);

                    // Aero snap to top
                    if (e.clientY < desktopTop + 10) {
                        this.maximizeWindow(win.dataset.id);
                        isDragging = false;
                    }
                }
            };

            const setTranslate = (xPos, yPos, el) => {
                el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
            };

            const dragEnd = () => {
                initialX = currentX;
                initialY = currentY;
                isDragging = false;
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
            let originalWidth, originalHeight, originalX, originalY;
            let originalMouseX, originalMouseY;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    isResizing = true;
                    currentResizer = resizer;

                    originalWidth = parseFloat(getComputedStyle(win, null).getPropertyValue('width').replace('px', ''));
                    originalHeight = parseFloat(getComputedStyle(win, null).getPropertyValue('height').replace('px', ''));
                    originalX = win.getBoundingClientRect().left;
                    originalY = win.getBoundingClientRect().top;
                    originalMouseX = e.pageX;
                    originalMouseY = e.pageY;

                    window.addEventListener('mousemove', resize);
                    window.addEventListener('mouseup', stopResize);
                });
            });

            const resize = (e) => {
                if (!isResizing) return;

                if (currentResizer.classList.contains('resizer-br')) {
                    const width = originalWidth + (e.pageX - originalMouseX);
                    const height = originalHeight + (e.pageY - originalMouseY);
                    if (width > 300) win.style.width = width + 'px';
                    if (height > 200) win.style.height = height + 'px';
                } else if (currentResizer.classList.contains('resizer-r')) {
                    const width = originalWidth + (e.pageX - originalMouseX);
                    if (width > 300) win.style.width = width + 'px';
                } else if (currentResizer.classList.contains('resizer-b')) {
                    const height = originalHeight + (e.pageY - originalMouseY);
                    if (height > 200) win.style.height = height + 'px';
                }
            };

            const stopResize = () => {
                isResizing = false;
                currentResizer = null;
                window.removeEventListener('mousemove', resize);
                window.removeEventListener('mouseup', stopResize);
            };
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
        this.commands = {
            'help': this.cmdHelp.bind(this),
            'whoami': this.cmdWhoami.bind(this),
            'clear': this.cmdClear.bind(this),
            'ls': this.cmdLs.bind(this),
            'neofetch': this.cmdNeofetch.bind(this),
            'cat': this.cmdCat.bind(this),
            'open': this.cmdOpen.bind(this)
        };
        this.fileSystem = {
            'description.txt': 'Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.',
            'contact.txt': 'Email: sd8587793@email.com\nLinkedIn: Sebastian Duran Caballero\nGithub: @sebastianDuranC'
        };
        this.init();
    }

    init() {
        if (!this.input || !this.output) return;

        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmdString = this.input.value.trim();
                this.input.value = '';
                this.processCommand(cmdString);
            }
        });

        // Pre-populate terminal
        this.output.innerHTML = '';
        this.processCommand('whoami', true);
        this.processCommand('neofetch', true);
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

    printLine(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        this.output.appendChild(div);

        // Auto scroll to bottom
        const content = document.getElementById('terminal-content');
        if(content) content.scrollTop = content.scrollHeight;
    }

    printPrompt(cmdString) {
        const escapedCmd = this.escapeHTML(cmdString);
        this.printLine(`<div class="mb-1"><span class="text-green-400 font-bold">sebastian@adwaita</span>:<span class="text-adwaita-blue font-bold">~</span>$ ${escapedCmd}</div>`);
    }

    processCommand(cmdString, silentPrompt = false) {
        if (!silentPrompt) {
            this.printPrompt(cmdString);
        } else if (cmdString) {
            this.printPrompt(cmdString);
        }

        if (!cmdString) return;

        const args = cmdString.split(' ').filter(arg => arg.trim() !== '');
        const cmd = args.shift().toLowerCase();

        if (this.commands[cmd]) {
            this.commands[cmd](args);
        } else {
            this.printLine(`<div class="text-red-400 mb-2">bash: ${this.escapeHTML(cmd)}: command not found</div>`);
        }
    }

    cmdHelp() {
        const helpText = `
<div class="mb-2 text-gray-200">
    Available commands:<br>
    <span class="text-adwaita-blue font-bold">help</span>     - Show this help message<br>
    <span class="text-adwaita-blue font-bold">whoami</span>   - Print current user<br>
    <span class="text-adwaita-blue font-bold">neofetch</span> - System information<br>
    <span class="text-adwaita-blue font-bold">ls</span>       - List directory contents<br>
    <span class="text-adwaita-blue font-bold">cat</span>      - Read file content (e.g., cat description.txt)<br>
    <span class="text-adwaita-blue font-bold">open</span>     - Open an application (e.g., open projects)<br>
    <span class="text-adwaita-blue font-bold">clear</span>    - Clear terminal output
</div>`;
        this.printLine(helpText);
    }

    cmdWhoami() {
        this.printLine('<div class="text-gray-100 mb-2">Sebastian Duran Caballero</div>');
    }

    cmdClear() {
        this.output.innerHTML = '';
    }

    cmdLs() {
        const files = Object.keys(this.fileSystem).map(f => `<span class="text-gray-200 mr-4">${f}</span>`).join('');
        this.printLine(`<div class="mb-2">${files}</div>`);
    }

    cmdNeofetch() {
        const neofetchOutput = `
<div class="flex flex-col md:flex-row text-gray-100 mb-4">
    <div class="mr-6 mb-4 md:mb-0 text-adwaita-blue text-xs sm:text-sm font-bold">
<pre>
       _,-/--,-/\\-,
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
        <p><span class="text-adwaita-blue font-bold">OS:</span> Linux OS (Adwaita UI)</p>
        <p><span class="text-adwaita-blue font-bold">Host:</span> Desarrollador Web</p>
        <p><span class="text-adwaita-blue font-bold">Uptime:</span> 24/7 coding</p>
        <p><span class="text-adwaita-blue font-bold">Packages:</span> HTML, CSS, JS, .NET, C#</p>
        <p><span class="text-adwaita-blue font-bold">Shell:</span> bash</p>
        <p><span class="text-adwaita-blue font-bold">Location:</span> Santa Cruz, Bolivia</p>
        <p><span class="text-adwaita-blue font-bold">Email:</span> sd8587793@email.com</p>
    </div>
</div>`;
        this.printLine(neofetchOutput);
    }

    cmdCat(args) {
        if (args.length === 0) {
            this.printLine('<div class="text-red-400 mb-2">cat: missing operand</div>');
            return;
        }

        const fileName = args[0];
        if (this.fileSystem[fileName]) {
            const content = this.escapeHTML(this.fileSystem[fileName]).replace(/\\n/g, '<br>');
            this.printLine(`<div class="text-gray-100 mb-2">${content}</div>`);
        } else {
            this.printLine(`<div class="text-red-400 mb-2">cat: ${this.escapeHTML(fileName)}: No such file or directory</div>`);
        }
    }

    cmdOpen(args) {
        if (args.length === 0) {
            this.printLine('<div class="text-red-400 mb-2">open: missing operand (try: projects, skills, contact)</div>');
            return;
        }

        const appName = args[0].toLowerCase();
        const validApps = ['projects', 'skills', 'contact', 'terminal'];

        if(validApps.includes(appName)) {
            if(window.app) {
                window.app.openWindow(appName);
                this.printLine(`<div class="text-gray-300 mb-2">Opening ${appName}...</div>`);
            } else {
                 this.printLine(`<div class="text-red-400 mb-2">Error: OS not initialized</div>`);
            }
        } else {
             this.printLine(`<div class="text-red-400 mb-2">open: application '${this.escapeHTML(appName)}' not found</div>`);
        }
    }
}

// Initialize the OS
window.app = new LinuxOS();
window.terminalParser = new TerminalParser();