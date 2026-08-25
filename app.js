class TerminalParser {
    constructor(outputElement, inputElement) {
        this.output = outputElement;
        this.input = inputElement;
        this.history = [];
        this.historyIndex = -1;

        // Initialize with default commands
        this.commands = {
            'help': this.cmdHelp.bind(this),
            'whoami': this.cmdWhoami.bind(this),
            'clear': this.cmdClear.bind(this),
            'ls': this.cmdLs.bind(this),
            'neofetch': this.cmdNeofetch.bind(this),
            'cat': this.cmdCat.bind(this),
            'open': this.cmdOpen.bind(this)
        };

        this.setupInput();
        this.printStartupMessage();
    }

    setupInput() {
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = this.input.value.trim();
                if (command) {
                    this.history.push(command);
                    this.historyIndex = this.history.length;
                    this.executeCommand(command);
                } else {
                    this.printPrompt();
                }
                this.input.value = '';
                this.scrollToBottom();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (this.historyIndex > 0) {
                    this.historyIndex--;
                    this.input.value = this.history[this.historyIndex];
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (this.historyIndex < this.history.length - 1) {
                    this.historyIndex++;
                    this.input.value = this.history[this.historyIndex];
                } else {
                    this.historyIndex = this.history.length;
                    this.input.value = '';
                }
            }
        });
    }

    printStartupMessage() {
        this.cmdWhoami([]);
        this.cmdNeofetch([]);
    }

    printPrompt(cmd = '') {
        const promptDiv = document.createElement('div');
        promptDiv.className = 'mb-1';
        promptDiv.innerHTML = `<span class="text-green-400 font-bold">sebastian@ubuntu</span><span class="text-white">:</span><span class="text-blue-400 font-bold">~</span><span class="text-white">$ </span><span class="text-gray-200"></span>`;
        promptDiv.querySelector('.text-gray-200').textContent = cmd;
        this.output.appendChild(promptDiv);
    }

    printOutput(html, isError = false, isHtml = false) {
        const div = document.createElement('div');
        div.className = `mb-4 ${isError ? 'text-red-400' : 'text-gray-100'}`;
        if(isHtml) {
            div.innerHTML = html;
        } else {
            div.textContent = html;
        }
        this.output.appendChild(div);
    }

    scrollToBottom() {
        const terminalContent = this.output.parentElement;
        terminalContent.scrollTop = terminalContent.scrollHeight;
    }

    executeCommand(commandString) {
        this.printPrompt(commandString);

        const parts = commandString.split(' ').filter(p => p);
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        if (this.commands[cmd]) {
            this.commands[cmd](args);
        } else {
            this.printOutput(`Command not found: ${cmd}`, true);
        }
    }

    cmdHelp(args) {
        const helpText = `
Available commands:
  help       - Show this help message
  whoami     - Print current user
  clear      - Clear the terminal screen
  ls         - List files in current directory
  neofetch   - Show system information
  cat <file> - Read content of a file
  open <app> - Open a system application (projects, skills, contact)
        `.trim();
        this.printOutput(helpText);
    }

    cmdWhoami(args) {
        this.printOutput('Sebastian Duran Caballero');
    }

    cmdClear(args) {
        this.output.innerHTML = '';
    }

    cmdLs(args) {
        this.printOutput('description.txt  projects/  skills/  contact/');
    }

    cmdNeofetch(args) {
        const neofetchHtml = `
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
        this.printOutput(neofetchHtml, false, true);
    }

    cmdCat(args) {
        if (args.length === 0) {
            this.printOutput('cat: missing operand', true);
            return;
        }

        const file = args[0].toLowerCase();
        if (file === 'description.txt') {
            this.printOutput('Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.');
        } else {
            this.printOutput(`cat: ${args[0]}: No such file or directory`, true);
        }
    }

    cmdOpen(args) {
        if (args.length === 0) {
            this.printOutput('open: missing operand', true);
            return;
        }

        const appName = args[0].toLowerCase();
        const validApps = ['projects', 'skills', 'contact'];

        if (validApps.includes(appName)) {
            this.printOutput(`Opening ${appName}...`);
            // Trigger window open in OS
            if(window.app) {
                window.app.openWindow(appName);
            }
        } else {
            this.printOutput(`open: ${args[0]}: Application not found`, true);
        }
    }
}


class LinuxOS {
    constructor() {
        this.windows = document.querySelectorAll('.os-window');
        this.highestZIndex = 100;
        this.openWindows = new Set();
        this.desktop = document.getElementById('desktop');

        // Aero snap overlay
        this.snapOverlay = document.createElement('div');
        this.snapOverlay.id = 'snap-overlay';
        this.desktop.appendChild(this.snapOverlay);
        
        this.init();
    }

    init() {
        this.setupClock();
        this.setupDraggableWindows();
        this.setupResizableWindows();
        this.setupWindowClickToFront();
        this.setupLogin();
        this.setupTerminal();
        this.setupDesktopSelection();
    }

    setupTerminal() {
        const output = document.getElementById('terminal-output');
        const input = document.getElementById('terminal-input');
        if (output && input) {
            this.terminal = new TerminalParser(output, input);
        }
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
        if(!dateElement) return;
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

    setupDesktopSelection() {
        document.addEventListener('mousedown', (e) => {
            if (!e.target.closest('.desktop-icon')) {
                document.querySelectorAll('.desktop-icon').forEach(icon => {
                    icon.classList.remove('selected');
                });
            }
        });
    }

    selectIcon(iconElement) {
        document.querySelectorAll('.desktop-icon').forEach(icon => {
            icon.classList.remove('selected');
        });
        iconElement.classList.add('selected');
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

            // Handle double click to maximize
            header.addEventListener('dblclick', (e) => {
                 if(e.target.closest('button')) return;
                 const id = win.getAttribute('data-id');
                 this.maximizeWindow(id);
            });

            header.addEventListener('mousedown', dragStart.bind(this));
            document.addEventListener('mousemove', drag.bind(this));
            document.addEventListener('mouseup', dragEnd.bind(this));

            function dragStart(e) {
                if(e.target.closest('button')) return;

                // If maximized, restore and calculate offset based on mouse position
                if(win.classList.contains('maximized')) {
                    win.classList.remove('maximized');
                    win.style.transform = 'none'; // Temporarily clear transform

                    // Get position relative to desktop
                    const desktopRect = this.desktop.getBoundingClientRect();

                    // Center the window on the mouse horizontally, but keep top where it was clicked
                    const winWidth = win.offsetWidth;
                    let newLeft = e.clientX - desktopRect.left - (winWidth / 2);

                    // Keep within bounds
                    if (newLeft < 0) newLeft = 0;
                    if (newLeft + winWidth > desktopRect.width) newLeft = desktopRect.width - winWidth;

                    let newTop = e.clientY - desktopRect.top - (header.offsetHeight / 2);
                    if (newTop < 0) newTop = 0;

                    // Update internal offsets to simulate it was dragged here
                    xOffset = newLeft - parseFloat(getComputedStyle(win).left || 0);
                    yOffset = newTop - parseFloat(getComputedStyle(win).top || 0);

                    setTranslate(xOffset, yOffset, win);
                }

                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;
                    this.bringToFront(win);
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

                    // Aero Snap preview
                    const desktopRect = this.desktop.getBoundingClientRect();
                    const relativeY = e.clientY - desktopRect.top;

                    if (relativeY <= 10) {
                        this.snapOverlay.style.display = 'block';
                    } else {
                        this.snapOverlay.style.display = 'none';
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

                // Apply Aero Snap
                const desktopRect = this.desktop.getBoundingClientRect();
                const relativeY = e.clientY - desktopRect.top;

                if (relativeY <= 10 && !win.classList.contains('maximized')) {
                    this.snapOverlay.style.display = 'none';
                    const id = win.getAttribute('data-id');

                    // Save transform before snap
                    win.dataset.prevTransform = win.style.transform;
                    this.maximizeWindow(id);
                }
                this.snapOverlay.style.display = 'none';
            }
        });
    }

    setupResizableWindows() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', initResize.bind(this));

                let isResizing = false;
                let currentResizer = null;
                let startX, startY, startWidth, startHeight;

                function initResize(e) {
                    e.preventDefault();
                    isResizing = true;
                    currentResizer = resizer;

                    startX = e.clientX;
                    startY = e.clientY;
                    startWidth = parseInt(document.defaultView.getComputedStyle(win).width, 10);
                    startHeight = parseInt(document.defaultView.getComputedStyle(win).height, 10);

                    document.addEventListener('mousemove', resize);
                    document.addEventListener('mouseup', stopResize);
                    this.bringToFront(win);
                }

                function resize(e) {
                    if(!isResizing) return;

                    if (currentResizer.classList.contains('right')) {
                        win.style.width = startWidth + e.clientX - startX + 'px';
                    } else if (currentResizer.classList.contains('bottom')) {
                        win.style.height = startHeight + e.clientY - startY + 'px';
                    } else if (currentResizer.classList.contains('bottom-right')) {
                        win.style.width = startWidth + e.clientX - startX + 'px';
                        win.style.height = startHeight + e.clientY - startY + 'px';
                    }
                }

                function stopResize() {
                    isResizing = false;
                    currentResizer = null;
                    document.removeEventListener('mousemove', resize);
                    document.removeEventListener('mouseup', stopResize);
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

                // Focus terminal input if terminal is opened
                if (id === 'terminal') {
                     const input = document.getElementById('terminal-input');
                     if(input) input.focus();
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
                win.dataset.prevTransform = win.style.transform;
                win.classList.add('maximized');
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

// Initialize the OS and expose globally
window.app = new LinuxOS();