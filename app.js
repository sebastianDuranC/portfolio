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
        this.setupWindowResizing();
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
            let currentX;
            let currentY;
            let initialX;
            let initialY;
            let xOffset = 0;
            let yOffset = 0;

            header.addEventListener('mousedown', dragStart);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);

            function dragStart(e) {
                if(e.target.closest('button')) return;

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;
                    // If maximized and we start dragging, unmaximize it and set offsets so it follows cursor smoothly
                    if(win.classList.contains('maximized')) {
                         win.style.transform = 'none';
                         const rect = win.getBoundingClientRect();
                         const desktopRect = document.getElementById('desktop').getBoundingClientRect();

                         // Re-calculate the current offset relative to the desktop container bounds
                         xOffset = rect.left - desktopRect.left;
                         yOffset = rect.top - desktopRect.top;

                         win.classList.remove('maximized');
                    }

                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;
                }
            }

            function drag(e) {
                if (isDragging) {
                    e.preventDefault();

                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;

                    // Constrain dragging roughly within bounds if desired, but for now just follow cursor
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

    setupWindowResizing() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer;
            let startX, startY, startWidth, startHeight;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', function(e) {
                    isResizing = true;
                    currentResizer = resizer;
                    startX = e.clientX;
                    startY = e.clientY;
                    startWidth = parseInt(document.defaultView.getComputedStyle(win).width, 10);
                    startHeight = parseInt(document.defaultView.getComputedStyle(win).height, 10);

                    e.preventDefault();
                });
            });

            document.addEventListener('mousemove', function(e) {
                if (!isResizing) return;

                if (currentResizer.classList.contains('right')) {
                    win.style.width = startWidth + (e.clientX - startX) + 'px';
                } else if (currentResizer.classList.contains('bottom')) {
                    win.style.height = startHeight + (e.clientY - startY) + 'px';
                } else if (currentResizer.classList.contains('bottom-right')) {
                    win.style.width = startWidth + (e.clientX - startX) + 'px';
                    win.style.height = startHeight + (e.clientY - startY) + 'px';
                }
            });

            document.addEventListener('mouseup', function(e) {
                isResizing = false;
            });
        });
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
        this.inputElement = document.getElementById('terminal-input');
        this.historyElement = document.getElementById('terminal-history');
        this.terminalContent = document.getElementById('terminal-content');
        this.commandHistory = [];
        this.historyIndex = -1;

        if (this.inputElement) {
            this.inputElement.addEventListener('keydown', this.handleInput.bind(this));
        }
    }

    handleInput(e) {
        if (e.key === 'Enter') {
            const command = this.inputElement.value.trim();
            this.inputElement.value = '';

            if (command) {
                this.commandHistory.push(command);
                this.historyIndex = this.commandHistory.length;
                this.executeCommand(command);
            } else {
                this.printPrompt();
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (this.historyIndex > 0) {
                this.historyIndex--;
                this.inputElement.value = this.commandHistory[this.historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (this.historyIndex < this.commandHistory.length - 1) {
                this.historyIndex++;
                this.inputElement.value = this.commandHistory[this.historyIndex];
            } else {
                this.historyIndex = this.commandHistory.length;
                this.inputElement.value = '';
            }
        }
    }

    printPrompt(command = '') {
        const promptDiv = document.createElement('div');
        promptDiv.className = 'mb-2';
        promptDiv.innerHTML = `<span class="text-green-400 font-bold">sebastian@adwaita</span>:<span class="text-blue-400 font-bold">~</span>$ `;

        if (command) {
            const commandSpan = document.createElement('span');
            commandSpan.textContent = command; // Use textContent for safety against XSS
            promptDiv.appendChild(commandSpan);
        }

        this.historyElement.appendChild(promptDiv);
        this.scrollToBottom();
    }

    printOutput(html) {
        const outputDiv = document.createElement('div');
        outputDiv.className = 'text-gray-100 mb-4 whitespace-pre-wrap';
        outputDiv.innerHTML = html; // Safe output generated by system, not user
        this.historyElement.appendChild(outputDiv);
        this.scrollToBottom();
    }

    printError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'text-red-400 mb-4';
        errorDiv.textContent = message; // Use textContent for safety against XSS
        this.historyElement.appendChild(errorDiv);
        this.scrollToBottom();
    }

    scrollToBottom() {
        if (this.terminalContent) {
            this.terminalContent.scrollTop = this.terminalContent.scrollHeight;
        }
    }

    executeCommand(commandStr) {
        this.printPrompt(commandStr);

        const args = commandStr.split(' ').filter(arg => arg.trim() !== '');
        const cmd = args[0].toLowerCase();

        switch (cmd) {
            case 'help':
                this.printOutput(`Available commands:
  help       - Show this message
  whoami     - Print the current user
  neofetch   - Show system information
  ls         - List available windows
  open [app] - Open an application (e.g., 'open projects')
  cat [file] - View file contents
  clear      - Clear terminal output`);
                break;
            case 'whoami':
                this.printOutput('Sebastian Duran Caballero');
                break;
            case 'clear':
                this.historyElement.innerHTML = '';
                break;
            case 'ls':
                 this.printOutput(`<span class="text-blue-400">projects</span>  <span class="text-blue-400">skills</span>  <span class="text-blue-400">contact</span>  description.txt`);
                 break;
            case 'neofetch':
                this.printOutput(`<div class="flex flex-col md:flex-row text-gray-100">
    <div class="mr-6 mb-4 md:mb-0 text-[#3584e4] text-xs sm:text-sm font-bold">
           .
         / \\
        /   \\
       /^.   \\
      /  .-.  \\
     /  (   ) _\\
    / _.~   ~._^\\
   /.^         ^.\\
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
</div>`);
                break;
            case 'cat':
                if (args[1] === 'description.txt') {
                    this.printOutput('Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.');
                } else if (args[1]) {
                    this.printError(`cat: ${args[1]}: No such file or directory`);
                } else {
                    this.printError('cat: missing file operand');
                }
                break;
            case 'open':
                const appName = args[1];
                if (['projects', 'skills', 'contact'].includes(appName)) {
                    if (window.app) {
                         window.app.openWindow(appName);
                         this.printOutput(`Opening ${appName}...`);
                    }
                } else if (appName) {
                    this.printError(`open: ${appName}: Application not found`);
                } else {
                     this.printError('open: missing application name');
                }
                break;
            default:
                this.printError(`bash: ${cmd}: command not found`);
        }
    }
}

// Initialize the OS and expose it globally
window.app = new LinuxOS();

// Initialize terminal parser once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.terminalParser = new TerminalParser();
});