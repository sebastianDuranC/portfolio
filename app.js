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
        this.setupTerminal();
        this.setupLogin();
    }

    setupTerminal() {
        this.terminalInput = document.getElementById('terminal-input');
        this.terminalOutput = document.getElementById('terminal-output');

        if (!this.terminalInput || !this.terminalOutput) return;

        // Pre-populate with some output
        this.appendTerminalOutput("whoami", "Sebastian Duran Caballero");
        this.appendTerminalOutput("neofetch", this.getNeofetchOutput());

        this.terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = this.terminalInput.value.trim();
                if (command) {
                    this.processCommand(command);
                }
                this.terminalInput.value = '';

                // Scroll to bottom
                const terminalContent = document.getElementById('terminal-content');
                if(terminalContent) {
                    terminalContent.scrollTop = terminalContent.scrollHeight;
                }
            }
        });
    }

    getNeofetchOutput() {
        return `<div class="flex flex-col md:flex-row text-gray-100 mb-4">
            <div class="mr-6 mb-4 md:mb-0 text-[#e95420] text-xs sm:text-sm font-bold">
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
                <p><span class="text-[#e95420] font-bold">OS:</span> Ubuntu 22.04 LTS x86_64</p>
                <p><span class="text-[#e95420] font-bold">Host:</span> Desarrollador Web</p>
                <p><span class="text-[#e95420] font-bold">Uptime:</span> 24/7 coding</p>
                <p><span class="text-[#e95420] font-bold">Packages:</span> HTML, CSS, JS, .NET, C#</p>
                <p><span class="text-[#e95420] font-bold">Shell:</span> bash 5.1.16</p>
                <p><span class="text-[#e95420] font-bold">Location:</span> Santa Cruz, Bolivia</p>
                <p><span class="text-[#e95420] font-bold">Email:</span> sd8587793@email.com</p>
            </div>
        </div>`;
    }

    processCommand(command) {
        let response = "";
        const args = command.split(' ');
        const cmd = args[0].toLowerCase();

        switch (cmd) {
            case 'help':
                response = "Available commands: help, whoami, clear, ls, neofetch, cat, open";
                break;
            case 'whoami':
                response = "Sebastian Duran Caballero";
                break;
            case 'clear':
                this.terminalOutput.innerHTML = '';
                return;
            case 'ls':
                response = "description.txt  projects/  skills/  contact/";
                break;
            case 'neofetch':
                response = this.getNeofetchOutput();
                break;
            case 'cat':
                if (args[1] === 'description.txt') {
                    response = "Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.";
                } else {
                    response = `cat: ${args[1] || ''}: No such file or directory`;
                }
                break;
            case 'open':
                const appName = args[1];
                if (['projects', 'skills', 'contact'].includes(appName)) {
                    this.openWindow(appName);
                    response = `Opening ${appName}...`;
                } else {
                    response = `open: ${appName || ''}: Application not found`;
                }
                break;
            default:
                response = `${cmd}: command not found`;
        }

        this.appendTerminalOutput(command, response);
    }

    appendTerminalOutput(command, response) {
        const cmdWrapper = document.createElement('div');
        cmdWrapper.className = 'mb-2';

        const prompt = document.createElement('p');
        prompt.className = 'mb-1';
        prompt.innerHTML = '<span class="text-green-400 font-bold">sebastian@ubuntu</span>:<span class="text-blue-400 font-bold">~</span>$ ';

        // Escape HTML for safety, except for neofetch which returns raw HTML
        const cmdText = document.createElement('span');
        cmdText.textContent = command;
        prompt.appendChild(cmdText);

        cmdWrapper.appendChild(prompt);

        if (response) {
            const resp = document.createElement('div');
            resp.className = 'text-gray-100 mb-4';
            if (command === 'neofetch') {
                resp.innerHTML = response;
            } else {
                resp.textContent = response;
            }
            cmdWrapper.appendChild(resp);
        }

        this.terminalOutput.appendChild(cmdWrapper);
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

    setupWindowResizing() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');

            resizers.forEach(resizer => {
                let isResizing = false;
                let startX, startY, startWidth, startHeight;

                resizer.addEventListener('mousedown', (e) => {
                    if (win.classList.contains('maximized')) return;

                    isResizing = true;
                    startX = e.clientX;
                    startY = e.clientY;
                    const rect = win.getBoundingClientRect();
                    startWidth = rect.width;
                    startHeight = rect.height;

                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);

                    // Prevent text selection during resize
                    e.preventDefault();
                });

                const handleMouseMove = (e) => {
                    if (!isResizing) return;

                    if (resizer.classList.contains('resizer-r') || resizer.classList.contains('resizer-br')) {
                        const newWidth = startWidth + (e.clientX - startX);
                        win.style.width = `${newWidth}px`;
                    }
                    if (resizer.classList.contains('resizer-b') || resizer.classList.contains('resizer-br')) {
                        const newHeight = startHeight + (e.clientY - startY);
                        win.style.height = `${newHeight}px`;
                    }
                };

                const handleMouseUp = () => {
                    isResizing = false;
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                };
            });
        });
    }

    setupDraggableWindows() {
        const desktop = document.getElementById('desktop');

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

            header.addEventListener('mousedown', (e) => {
                if(e.target.closest('button')) return;

                if(win.classList.contains('maximized')) {
                    // Start dragging to unmaximize
                    isDragging = true;

                    // Temporarily remove transform to get correct rect based on top/left
                    const oldTransform = win.style.transform;
                    win.style.transform = 'none';
                    const rect = win.getBoundingClientRect();
                    const desktopRect = desktop.getBoundingClientRect();
                    win.style.transform = oldTransform;

                    // Unmaximize
                    this.maximizeWindow(win.dataset.id);

                    // Calculate offsets to keep cursor in same relative position
                    // We need xOffset relative to the original container's top-left.
                    // rect.left is absolute screen position. The element itself might have left: 10%
                    xOffset = rect.left - desktopRect.left;
                    yOffset = rect.top - desktopRect.top;

                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;

                } else {
                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;

                    if (e.target === header || header.contains(e.target)) {
                        isDragging = true;
                    }
                }
            });

            document.addEventListener('mousemove', (e) => {
                if (isDragging) {
                    e.preventDefault();

                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;

                    xOffset = currentX;
                    yOffset = currentY;

                    win.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;

                    // Check for snap to top
                    const desktopRect = desktop.getBoundingClientRect();
                    if (e.clientY <= desktopRect.top + 10) {
                         if(!document.getElementById('snap-preview')) {
                             const preview = document.createElement('div');
                             preview.id = 'snap-preview';
                             preview.className = 'absolute top-0 left-0 w-full h-full bg-white/10 border-2 border-white/20 rounded-lg pointer-events-none z-40 transition-all';
                             desktop.appendChild(preview);
                         }
                    } else {
                        const preview = document.getElementById('snap-preview');
                        if (preview) preview.remove();
                    }
                }
            });

            document.addEventListener('mouseup', (e) => {
                if(isDragging) {
                    initialX = currentX;
                    initialY = currentY;
                    isDragging = false;

                    const preview = document.getElementById('snap-preview');
                    if (preview) {
                        preview.remove();
                        this.maximizeWindow(win.dataset.id);
                    }
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
                // Save current state before maximizing
                win.dataset.prevTransform = win.style.transform;
                win.dataset.prevWidth = win.style.width;
                win.dataset.prevHeight = win.style.height;
                win.classList.add('maximized');
                win.style.transform = 'none';
                win.style.width = '100%';
                win.style.height = '100%';
            } else {
                win.classList.remove('maximized');
                // Restore state
                if (win.dataset.prevTransform) {
                    win.style.transform = win.dataset.prevTransform;
                }
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