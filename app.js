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
            let isResizing = false;
            let resizeDir = '';

            let currentX;
            let currentY;
            let initialX;
            let initialY;
            let xOffset = 0;
            let yOffset = 0;

            let startW, startH, startX, startY;

            // Dragging events
            header.addEventListener('mousedown', dragStart.bind(this));

            // Resizing events
            const resizers = win.querySelectorAll('.resizer');
            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    if (win.classList.contains('maximized')) return;
                    isResizing = true;
                    if (resizer.classList.contains('resizer-r')) resizeDir = 'r';
                    else if (resizer.classList.contains('resizer-b')) resizeDir = 'b';
                    else if (resizer.classList.contains('resizer-br')) resizeDir = 'br';

                    startX = e.clientX;
                    startY = e.clientY;
                    startW = win.offsetWidth;
                    startH = win.offsetHeight;

                    e.preventDefault();
                    this.bringToFront(win);
                });
            });

            document.addEventListener('mousemove', dragOrResize.bind(this));
            document.addEventListener('mouseup', stopDragOrResize.bind(this));

            function dragStart(e) {
                if(e.target.closest('button')) return;

                if(win.classList.contains('maximized')) {
                    // Start restore from maximized state logic
                    const rect = win.getBoundingClientRect();
                    const targetLeft = e.clientX - (rect.width * 0.5);

                    this.maximizeWindow(win.dataset.id);

                    // After un-maximizing, we need to recalculate offset
                    win.style.transform = 'none';
                    const newRect = win.getBoundingClientRect();

                    xOffset = targetLeft - newRect.left;
                    yOffset = 0;

                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;

                    setTranslate(xOffset, yOffset, win);
                } else {
                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;
                }

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;
                }
            }

            function dragOrResize(e) {
                if (isDragging) {
                    e.preventDefault();
                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;

                    xOffset = currentX;
                    yOffset = currentY;

                    setTranslate(currentX, currentY, win);

                    // Aero snap preview (optional, for now just maximize on drop)
                } else if (isResizing) {
                    e.preventDefault();
                    if (resizeDir === 'r' || resizeDir === 'br') {
                        const newWidth = startW + (e.clientX - startX);
                        win.style.width = `${newWidth}px`;
                    }
                    if (resizeDir === 'b' || resizeDir === 'br') {
                        const newHeight = startH + (e.clientY - startY);
                        win.style.height = `${newHeight}px`;
                    }
                }
            }

            function setTranslate(xPos, yPos, el) {
                el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
            }

            function stopDragOrResize(e) {
                if (isDragging) {
                    initialX = currentX;
                    initialY = currentY;
                    isDragging = false;

                    // Aero snap
                    if (e.clientY <= 0) {
                        this.maximizeWindow(win.dataset.id);
                    }
                }
                isResizing = false;
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
        this.outputContainer = document.getElementById('terminal-output');
        this.inputField = document.getElementById('terminal-input');
        this.terminalContent = document.getElementById('terminal-content');

        if (!this.inputField || !this.outputContainer) return;

        this.setupEventListeners();
        this.initializeTerminal();
    }

    setupEventListeners() {
        this.terminalContent.addEventListener('click', () => {
            this.inputField.focus();
        });

        this.inputField.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = this.inputField.value.trim();
                this.processCommand(command);
                this.inputField.value = '';
            }
        });
    }

    initializeTerminal() {
        // Pre-populate with startup info
        this.processCommand('whoami', true);
        this.processCommand('neofetch', true);
    }

    escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    printLine(html) {
        const line = document.createElement('div');
        line.innerHTML = html;
        this.outputContainer.appendChild(line);
        this.scrollToBottom();
    }

    scrollToBottom() {
        if(this.terminalContent) {
            this.terminalContent.scrollTop = this.terminalContent.scrollHeight;
        }
    }

    processCommand(command, isStartup = false) {
        const safeCommand = this.escapeHTML(command);

        if (command !== 'clear' || isStartup) {
            this.printLine(`<p class="mb-2"><span class="text-green-400 font-bold">sebastian@adwaita</span>:<span class="text-blue-400 font-bold">~</span>$ ${safeCommand}</p>`);
        }

        if (!command) return;

        const args = command.split(' ');
        const cmd = args[0].toLowerCase();

        switch (cmd) {
            case 'help':
                this.printLine(`
                    <div class="mb-4 text-gray-300">
                        <p>Available commands:</p>
                        <ul class="list-disc ml-6 mt-2">
                            <li><span class="text-[#3584e4] font-bold">whoami</span> - Display current user</li>
                            <li><span class="text-[#3584e4] font-bold">neofetch</span> - Display system information</li>
                            <li><span class="text-[#3584e4] font-bold">cat</span> [file] - Print file contents (try: cat description.txt)</li>
                            <li><span class="text-[#3584e4] font-bold">ls</span> - List files</li>
                            <li><span class="text-[#3584e4] font-bold">clear</span> - Clear terminal output</li>
                            <li><span class="text-[#3584e4] font-bold">open</span> [app] - Open an application (projects, skills, contact)</li>
                            <li><span class="text-[#3584e4] font-bold">help</span> - Display this help message</li>
                        </ul>
                    </div>
                `);
                break;
            case 'whoami':
                this.printLine('<p class="text-gray-100 mb-4">Sebastian Duran Caballero</p>');
                break;
            case 'clear':
                this.outputContainer.innerHTML = '';
                break;
            case 'ls':
                this.printLine('<p class="text-gray-100 mb-4">description.txt</p>');
                break;
            case 'cat':
                if (args[1] === 'description.txt') {
                    this.printLine(`
                        <p class="text-gray-100 mb-4">
                            Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.
                        </p>
                    `);
                } else {
                    this.printLine(`<p class="text-red-400 mb-4">cat: ${args[1] ? this.escapeHTML(args[1]) : ''}: No such file or directory</p>`);
                }
                break;
            case 'open':
                const appName = args[1]?.toLowerCase();
                if (['projects', 'skills', 'contact'].includes(appName)) {
                    this.printLine(`<p class="text-gray-300 mb-4">Opening ${appName}...</p>`);
                    window.app.openWindow(appName);
                } else {
                    this.printLine(`<p class="text-red-400 mb-4">Application not found. Available apps: projects, skills, contact</p>`);
                }
                break;
            case 'neofetch':
                this.printLine(`
                    <div class="flex flex-col md:flex-row text-gray-100 mb-4">
                        <div class="mr-6 mb-4 md:mb-0 text-[#3584e4] text-xs sm:text-sm font-bold">
<pre>
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
       \`-----'
</pre>
                        </div>
                        <div>
                            <p><span class="text-[#3584e4] font-bold">OS:</span> Adwaita OS x86_64</p>
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
                this.printLine(`<p class="text-red-400 mb-4">Command not found: ${safeCommand}. Type 'help' for available commands.</p>`);
        }
    }
}

// Initialize the OS
window.app = new LinuxOS();
window.terminal = new TerminalParser();