class TerminalParser {
    constructor(terminalContent, terminalOutput, terminalInput) {
        this.content = terminalContent;
        this.output = terminalOutput;
        this.input = terminalInput;
        this.commandHistory = [];
        this.historyIndex = -1;

        this.init();
    }

    init() {
        if (!this.input) return;
        this.input.addEventListener('keydown', (e) => this.handleInput(e));

        // Initial setup
        this.printLine("sebastian@adwaita:~$ whoami", "input-echo");
        this.printLine("Sebastian Duran Caballero");
        this.printLine("sebastian@adwaita:~$ neofetch", "input-echo");
        this.printNeofetch();
    }

    handleInput(e) {
        if (e.key === 'Enter') {
            const command = this.input.value.trim();
            this.input.value = '';

            if (command) {
                this.commandHistory.push(command);
                this.historyIndex = this.commandHistory.length;
            }

            this.processCommand(command);
            this.scrollToBottom();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (this.historyIndex > 0) {
                this.historyIndex--;
                this.input.value = this.commandHistory[this.historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (this.historyIndex < this.commandHistory.length - 1) {
                this.historyIndex++;
                this.input.value = this.commandHistory[this.historyIndex];
            } else {
                this.historyIndex = this.commandHistory.length;
                this.input.value = '';
            }
        }
    }

    processCommand(cmd) {
        const prompt = document.createElement('div');
        prompt.innerHTML = `<span class="text-green-400 font-bold mr-1">sebastian@adwaita</span><span class="text-gray-200">:</span><span class="text-[#3584e4] font-bold mx-1">~</span><span class="text-gray-200 mr-2">$</span> <span class="cmd-text"></span>`;
        prompt.querySelector('.cmd-text').textContent = cmd;
        this.output.appendChild(prompt);

        if (!cmd) return;

        const args = cmd.split(' ').filter(Boolean);
        const command = args[0].toLowerCase();

        switch (command) {
            case 'help':
                this.printLine("Available commands:");
                this.printLine("  help     - Show this help message");
                this.printLine("  whoami   - Display current user");
                this.printLine("  clear    - Clear terminal output");
                this.printLine("  ls       - List directory contents");
                this.printLine("  neofetch - Display system information");
                this.printLine("  cat      - Print file content");
                this.printLine("  open     - Open an application (e.g., open projects)");
                break;
            case 'whoami':
                this.printLine("Sebastian Duran Caballero");
                break;
            case 'clear':
                this.output.innerHTML = '';
                break;
            case 'ls':
                this.printLine("<span class='text-[#3584e4] font-bold'>projects/</span>  <span class='text-[#3584e4] font-bold'>skills/</span>  description.txt  contact.sh", 'html');
                break;
            case 'cat':
                if (args[1] === 'description.txt') {
                    this.printLine("Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.");
                } else if (args[1] === 'contact.sh') {
                    this.printLine("echo 'Email: sd8587793@email.com'");
                } else {
                    this.printLine(`cat: ${args[1]}: No such file or directory`);
                }
                break;
            case 'neofetch':
                this.printNeofetch();
                break;
            case 'open':
                if (args[1]) {
                    const appName = args[1].toLowerCase();
                    const validApps = ['projects', 'skills', 'contact'];
                    if (validApps.includes(appName)) {
                        this.printLine(`Opening ${appName}...`);
                        if(window.app) window.app.openWindow(appName);
                    } else {
                        this.printLine(`open: App '${appName}' not found.`);
                    }
                } else {
                    this.printLine("Usage: open <app_name>");
                }
                break;
            default:
                this.printLine(`Command not found: ${command}`);
        }
    }

    printLine(text, type = 'text') {
        const line = document.createElement('div');
        if (type === 'html') {
            line.innerHTML = text;
        } else if (type === 'input-echo') {
             // For initial populated commands to show prompt
             line.innerHTML = `<span class="text-green-400 font-bold mr-1">sebastian@adwaita</span><span class="text-gray-200">:</span><span class="text-[#3584e4] font-bold mx-1">~</span><span class="text-gray-200 mr-2">$</span> <span class="cmd-text"></span>`;
             line.querySelector('.cmd-text').textContent = text.replace('sebastian@adwaita:~$ ', '');
        }
        else {
            line.textContent = text;
        }
        line.className = 'mb-1';
        this.output.appendChild(line);
    }

    printNeofetch() {
        const neo = document.createElement('div');
        neo.className = 'flex flex-col md:flex-row text-gray-100 my-2';
        neo.innerHTML = `
            <div class="mr-6 mb-4 md:mb-0 text-[#3584e4] text-xs sm:text-sm font-bold">
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
                <p><span class="text-[#3584e4] font-bold">OS:</span> GNOME OS x86_64</p>
                <p><span class="text-[#3584e4] font-bold">Host:</span> Desarrollador Web</p>
                <p><span class="text-[#3584e4] font-bold">Uptime:</span> 24/7 coding</p>
                <p><span class="text-[#3584e4] font-bold">Packages:</span> HTML, CSS, JS, .NET, C#</p>
                <p><span class="text-[#3584e4] font-bold">Shell:</span> bash 5.1.16</p>
                <p><span class="text-[#3584e4] font-bold">Theme:</span> Adwaita-dark [GTK3/4]</p>
                <p><span class="text-[#3584e4] font-bold">Location:</span> Santa Cruz, Bolivia</p>
            </div>
        `;
        this.output.appendChild(neo);
    }

    scrollToBottom() {
        if(this.content) {
            this.content.scrollTop = this.content.scrollHeight;
        }
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
        this.setupResizableWindows();
        this.setupWindowClickToFront();
        this.setupLogin();
        this.setupTerminal();
    }

    setupTerminal() {
        const terminalContent = document.getElementById('terminal-content');
        const terminalOutput = document.getElementById('terminal-output');
        const terminalInput = document.getElementById('terminal-input');
        if(terminalContent && terminalOutput && terminalInput) {
            this.terminal = new TerminalParser(terminalContent, terminalOutput, terminalInput);
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
            if(dateElement) dateElement.textContent = dateString;
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

            // Extract matrix transform if present to keep consistency
            const style = window.getComputedStyle(win);
            const matrix = new WebKitCSSMatrix(style.transform);
            if (matrix.m41 !== undefined) {
                xOffset = matrix.m41;
                yOffset = matrix.m42;
            }

            header.addEventListener('mousedown', dragStart);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);

            function dragStart(e) {
                // Don't drag if maximizing/closing buttons are clicked
                if(e.target.closest('button')) return;
                if(e.target.closest('.resizer')) return;

                if (win.classList.contains('maximized')) {
                     // Restore window to dragging state smoothly
                     const rect = win.getBoundingClientRect();
                     const deskRect = app.desktop.getBoundingClientRect();

                     // Temporarily clear transform to calculate offsets properly
                     win.style.transform = 'none';

                     // Calculate where the mouse grabbed the window relative to its top-left
                     const grabX = e.clientX - rect.left;
                     const grabY = e.clientY - rect.top;

                     // Calculate new offsets relative to desktop container
                     xOffset = (e.clientX - deskRect.left) - grabX;
                     yOffset = (e.clientY - deskRect.top) - grabY;

                     // Ensure window doesn't jump out of bounds on top
                     if (yOffset < 0) yOffset = 0;

                     setTranslate(xOffset, yOffset, win);
                     win.classList.remove('maximized');
                }

                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;
                    app.bringToFront(win);
                }
            }

            function drag(e) {
                if (isDragging) {
                    e.preventDefault();

                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;

                    // Basic boundary constraints (top bar)
                    if (currentY < 0) currentY = 0;

                    xOffset = currentX;
                    yOffset = currentY;

                    setTranslate(currentX, currentY, win);
                }
            }

            function setTranslate(xPos, yPos, el) {
                el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
            }

            function dragEnd(e) {
                initialX = currentX;
                initialY = currentY;
                isDragging = false;
            }
        });
    }

    setupResizableWindows() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer;
            let startWidth, startHeight, startX, startY;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    isResizing = true;
                    currentResizer = resizer;
                    const rect = win.getBoundingClientRect();
                    startWidth = rect.width;
                    startHeight = rect.height;
                    startX = e.clientX;
                    startY = e.clientY;
                    this.bringToFront(win);
                });
            });

            document.addEventListener('mousemove', (e) => {
                if (!isResizing) return;
                if (win.classList.contains('maximized')) return;

                if (currentResizer.classList.contains('right')) {
                    win.style.width = startWidth + (e.clientX - startX) + 'px';
                } else if (currentResizer.classList.contains('bottom')) {
                    win.style.height = startHeight + (e.clientY - startY) + 'px';
                } else if (currentResizer.classList.contains('bottom-right')) {
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
                    if (id === 'terminal' && this.terminal) {
                        this.terminal.scrollToBottom();
                        const input = document.getElementById('terminal-input');
                        if (input) input.focus();
                    }
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
                // Save current state before maximizing
                win.dataset.prevTransform = win.style.transform;
                win.dataset.prevWidth = win.style.width;
                win.dataset.prevHeight = win.style.height;

                win.classList.add('maximized');
            } else {
                win.classList.remove('maximized');
                // Restore state
                if (win.dataset.prevTransform) {
                    win.style.transform = win.dataset.prevTransform;
                }
                if (win.dataset.prevWidth) {
                    win.style.width = win.dataset.prevWidth;
                }
                if (win.dataset.prevHeight) {
                    win.style.height = win.dataset.prevHeight;
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

// Initialize the OS and expose globally
window.app = new LinuxOS();
