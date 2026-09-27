class TerminalParser {
    constructor(terminalContent, terminalInput) {
        this.content = terminalContent;
        this.input = terminalInput;
        this.output = document.getElementById('terminal-output');
        this.commands = ['help', 'whoami', 'clear', 'ls', 'neofetch', 'cat', 'open'];

        this.init();
    }

    init() {
        if (!this.input) return;
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const commandLine = this.input.value.trim();
                if (commandLine) {
                    this.executeCommand(commandLine);
                } else {
                    this.appendLine(`<span class="text-[#8ff0a4] font-bold">sebastian@adwaita</span>:<span class="text-[#78aeed] font-bold">~</span>$ `);
                }
                this.input.value = '';
                this.scrollToBottom();
            }
        });

        // Initial setup
        this.runNeofetch(true);
    }

    appendLine(htmlContent) {
        const div = document.createElement('div');
        div.innerHTML = htmlContent;
        this.output.appendChild(div);
    }

    appendSafeLine(text) {
        const div = document.createElement('div');
        div.textContent = text;
        this.output.appendChild(div);
    }

    scrollToBottom() {
        if (this.content) {
            this.content.scrollTop = this.content.scrollHeight;
        }
    }

    executeCommand(commandLine) {
        // Echo command
        const escapedCommand = document.createElement('div');
        escapedCommand.textContent = commandLine;
        this.appendLine(`<span class="text-[#8ff0a4] font-bold">sebastian@adwaita</span>:<span class="text-[#78aeed] font-bold">~</span>$ ${escapedCommand.innerHTML}`);

        const args = commandLine.split(' ').filter(Boolean);
        const cmd = args[0].toLowerCase();

        switch (cmd) {
            case 'help':
                this.appendLine(`
                    <p class="mb-2">Available commands:</p>
                    <ul class="ml-4 mb-4 list-disc list-inside">
                        <li><strong>help</strong> - Show this help message</li>
                        <li><strong>whoami</strong> - Print current user</li>
                        <li><strong>clear</strong> - Clear terminal output</li>
                        <li><strong>ls</strong> - List files</li>
                        <li><strong>neofetch</strong> - Display system info</li>
                        <li><strong>cat</strong> [file] - Print file content</li>
                        <li><strong>open</strong> [app] - Open a window (projects, skills, contact)</li>
                    </ul>
                `);
                break;
            case 'whoami':
                this.appendSafeLine('Sebastian Duran Caballero');
                break;
            case 'clear':
                this.output.innerHTML = '';
                break;
            case 'ls':
                this.appendLine(`<p class="mb-4 text-[#78aeed]">description.txt  projects/  skills/  contact/</p>`);
                break;
            case 'cat':
                if (args[1] === 'description.txt') {
                    this.appendLine(`<p class="mb-4">Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.</p>`);
                } else if (!args[1]) {
                    this.appendSafeLine('cat: missing file operand');
                } else {
                    this.appendSafeLine(`cat: ${args[1]}: No such file or directory`);
                }
                break;
            case 'neofetch':
                this.runNeofetch();
                break;
            case 'open':
                if (args[1]) {
                    const appName = args[1].toLowerCase();
                    if (['projects', 'skills', 'contact'].includes(appName)) {
                        if (window.app) {
                            window.app.openWindow(appName);
                        }
                    } else {
                        this.appendSafeLine(`open: cannot open '${args[1]}': No such app`);
                    }
                } else {
                    this.appendSafeLine('open: missing app operand');
                }
                break;
            default:
                this.appendLine(`<p class="mb-4">bash: ${escapedCommand.innerHTML}: command not found</p>`);
        }
    }

    runNeofetch(isInitial = false) {
        if (!isInitial) {
           // this.appendLine(`<span class="text-[#8ff0a4] font-bold">sebastian@adwaita</span>:<span class="text-[#78aeed] font-bold">~</span>$ neofetch`);
        } else {
            this.appendLine(`<p class="mb-2"><span class="text-[#8ff0a4] font-bold">sebastian@adwaita</span>:<span class="text-[#78aeed] font-bold">~</span>$ whoami</p>`);
            this.appendLine(`<p class="text-gray-100 mb-4">Sebastian Duran Caballero</p>`);
            this.appendLine(`<p class="mb-2"><span class="text-[#8ff0a4] font-bold">sebastian@adwaita</span>:<span class="text-[#78aeed] font-bold">~</span>$ neofetch</p>`);
        }

        const logo = `           _,-/&gt;--,-/\\-,
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

        this.appendLine(`
            <div class="flex flex-col md:flex-row text-gray-100 mb-4 font-fira-code">
                <div class="mr-6 mb-4 md:mb-0 text-[#3584e4] text-xs sm:text-sm font-bold whitespace-pre">
${logo}
                </div>
                <div>
                    <p><span class="text-[#3584e4] font-bold">OS:</span> GNOME OS x86_64</p>
                    <p><span class="text-[#3584e4] font-bold">Host:</span> Desarrollador Web</p>
                    <p><span class="text-[#3584e4] font-bold">Uptime:</span> 24/7 coding</p>
                    <p><span class="text-[#3584e4] font-bold">Packages:</span> HTML, CSS, JS, .NET, C#</p>
                    <p><span class="text-[#3584e4] font-bold">Shell:</span> bash</p>
                    <p><span class="text-[#3584e4] font-bold">DE:</span> GNOME 45</p>
                    <p><span class="text-[#3584e4] font-bold">Location:</span> Santa Cruz, Bolivia</p>
                    <p><span class="text-[#3584e4] font-bold">Email:</span> sd8587793@email.com</p>
                </div>
            </div>
        `);
    }
}

class LinuxOS {
    constructor() {
        this.windows = document.querySelectorAll('.os-window');
        this.highestZIndex = 100;
        this.openWindows = new Set();
        this.desktopContainer = document.getElementById('desktop');
        
        this.init();
    }

    init() {
        this.setupClock();
        this.setupDraggableWindows();
        this.setupWindowClickToFront();
        this.setupResizers();
        this.setupLogin();

        // Initialize Terminal
        const terminalContent = document.getElementById('terminal-content');
        const terminalInput = document.getElementById('terminal-input');
        if (terminalContent && terminalInput) {
            this.terminal = new TerminalParser(terminalContent, terminalInput);
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
                if (this.terminal && this.terminal.input) {
                    this.terminal.input.focus();
                }
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

            // We use transform translate, keep track of offsets
            win.dataset.xOffset = 0;
            win.dataset.yOffset = 0;

            const dragStart = (e) => {
                // Don't drag if maximizing/closing buttons are clicked
                if(e.target.closest('button')) return;

                // Don't drag if maximized
                if(win.classList.contains('maximized')) {
                    // Try to restore window and start dragging from top bar
                    if (e.target === header || header.contains(e.target)) {
                        this.maximizeWindow(win.dataset.id);

                        // Calculate new offsets based on mouse position relative to restored window
                        const rect = win.getBoundingClientRect();
                        const desktopRect = this.desktopContainer.getBoundingClientRect();

                        win.dataset.xOffset = rect.left - desktopRect.left;
                        win.dataset.yOffset = rect.top - desktopRect.top;

                        win.style.transform = `translate3d(${win.dataset.xOffset}px, ${win.dataset.yOffset}px, 0)`;

                        initialX = e.clientX - parseFloat(win.dataset.xOffset);
                        initialY = e.clientY - parseFloat(win.dataset.yOffset);
                        isDragging = true;
                    }
                    return;
                }

                initialX = e.clientX - parseFloat(win.dataset.xOffset || 0);
                initialY = e.clientY - parseFloat(win.dataset.yOffset || 0);

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;
                }
            };

            const drag = (e) => {
                if (isDragging) {
                    e.preventDefault();

                    // Aero snap to top to maximize
                    if (e.clientY <= 28 && !win.classList.contains('maximized')) { // 28px is top bar height
                        this.maximizeWindow(win.dataset.id);
                        isDragging = false;
                        return;
                    }

                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;

                    win.dataset.xOffset = currentX;
                    win.dataset.yOffset = currentY;

                    win.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
                }
            };

            const dragEnd = (e) => {
                initialX = currentX;
                initialY = currentY;
                isDragging = false;
            };

            header.addEventListener('mousedown', dragStart);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);
        });
    }

    setupResizers() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer;
            let startX, startY, startWidth, startHeight;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    if(win.classList.contains('maximized')) return;
                    e.preventDefault();
                    isResizing = true;
                    currentResizer = resizer;
                    startX = e.clientX;
                    startY = e.clientY;
                    startWidth = parseInt(document.defaultView.getComputedStyle(win).width, 10);
                    startHeight = parseInt(document.defaultView.getComputedStyle(win).height, 10);

                    // Convert tailwind relative sizes to absolute pixels to avoid jumping
                    win.style.width = `${startWidth}px`;
                    win.style.height = `${startHeight}px`;
                });
            });

            document.addEventListener('mousemove', (e) => {
                if (!isResizing) return;

                if (currentResizer.classList.contains('resizer-r')) {
                    win.style.width = startWidth + (e.clientX - startX) + 'px';
                } else if (currentResizer.classList.contains('resizer-b')) {
                    win.style.height = startHeight + (e.clientY - startY) + 'px';
                } else if (currentResizer.classList.contains('resizer-br')) {
                    win.style.width = startWidth + (e.clientX - startX) + 'px';
                    win.style.height = startHeight + (e.clientY - startY) + 'px';
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

                // Recalculate offset if dragged down from top
                const desktopRect = this.desktopContainer.getBoundingClientRect();
                const rect = win.getBoundingClientRect();
                win.dataset.xOffset = rect.left - desktopRect.left;
                win.dataset.yOffset = rect.top - desktopRect.top;

                // Restore transform if any
                if (win.dataset.prevTransform) {
                    win.style.transform = win.dataset.prevTransform;
                } else {
                    win.style.transform = `translate3d(${win.dataset.xOffset}px, ${win.dataset.yOffset}px, 0)`;
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
window.app = new LinuxOS();
