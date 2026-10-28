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
        this.setupResizableWindows();
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
            let initialX;
            let initialY;
            let xOffset = 0;
            let yOffset = 0;

            const dragStart = (e) => {
                if(e.target.closest('button')) return;

                if(win.classList.contains('maximized')) {
                    // Start dragging from maximized state
                    const rect = win.getBoundingClientRect();
                    win.classList.remove('maximized');

                    // Reset transform to calculate natural offsets
                    win.style.transform = 'none';
                    const newRect = win.getBoundingClientRect();

                    // Calculate offsets based on where the mouse is relative to the natural layout position
                    xOffset = e.clientX - newRect.left - (rect.width / 2) + (newRect.width / 2);
                    yOffset = e.clientY - newRect.top;

                    // Ensure the window is within bounds horizontally
                    if(xOffset > 0) xOffset = 0;
                    if(xOffset < -newRect.width + 100) xOffset = -newRect.width + 100;

                    setTranslate(xOffset, yOffset, win);
                }

                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;
                }
            };

            const drag = (e) => {
                if (isDragging) {
                    e.preventDefault();

                    let currentX = e.clientX - initialX;
                    let currentY = e.clientY - initialY;

                    // Prevent dragging above top bar (if any) or out of bounds
                    if (currentY < 0) currentY = 0;

                    xOffset = currentX;
                    yOffset = currentY;

                    setTranslate(xOffset, yOffset, win);
                }
            };

            const dragEnd = () => {
                isDragging = false;
            };

            const setTranslate = (xPos, yPos, el) => {
                el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
            };

            header.addEventListener('mousedown', dragStart);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);
        });
    }

    setupResizableWindows() {
        this.windows.forEach(win => {
            const resizerR = win.querySelector('.resizer-r');
            const resizerB = win.querySelector('.resizer-b');
            const resizerBR = win.querySelector('.resizer-br');

            if (!resizerR && !resizerB && !resizerBR) return;

            let isResizing = false;
            let currentResizer;
            let startX, startY, startWidth, startHeight;

            const resizeStart = (e, resizerType) => {
                e.preventDefault();
                e.stopPropagation();
                isResizing = true;
                currentResizer = resizerType;

                startX = e.clientX;
                startY = e.clientY;

                const rect = win.getBoundingClientRect();
                startWidth = rect.width;
                startHeight = rect.height;

                // Bring to front on resize
                this.bringToFront(win);
            };

            if(resizerR) resizerR.addEventListener('mousedown', (e) => resizeStart(e, 'r'));
            if(resizerB) resizerB.addEventListener('mousedown', (e) => resizeStart(e, 'b'));
            if(resizerBR) resizerBR.addEventListener('mousedown', (e) => resizeStart(e, 'br'));

            document.addEventListener('mousemove', (e) => {
                if (!isResizing) return;

                if (currentResizer === 'r' || currentResizer === 'br') {
                    const newWidth = startWidth + (e.clientX - startX);
                    win.style.width = `${Math.max(300, newWidth)}px`;
                }

                if (currentResizer === 'b' || currentResizer === 'br') {
                    const newHeight = startHeight + (e.clientY - startY);
                    win.style.height = `${Math.max(200, newHeight)}px`;
                }
            });

            document.addEventListener('mouseup', () => {
                isResizing = false;
                currentResizer = null;
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

// Initialize the OS
window.app = new LinuxOS();
new TerminalParser();


class TerminalParser {
    constructor() {
        this.input = document.getElementById('terminal-input');
        this.output = document.getElementById('terminal-output');

        if(this.input && this.output) {
            this.input.addEventListener('keydown', (e) => this.handleInput(e));
        }
    }

    handleInput(e) {
        if (e.key === 'Enter') {
            const command = this.input.value.trim();
            this.input.value = '';
            this.processCommand(command);
        }
    }

    processCommand(command) {
        // Echo command
        const promptLine = document.createElement('p');
        promptLine.className = 'mb-2';
        promptLine.innerHTML = '<span class="text-green-400 font-bold">sebastian@adwaita</span>:<span class="text-blue-400 font-bold">~</span>$ ';
        const cmdSpan = document.createElement('span');
        cmdSpan.textContent = command;
        promptLine.appendChild(cmdSpan);
        this.output.appendChild(promptLine);

        if (!command) {
            this.scrollToBottom();
            return;
        }

        const args = command.split(' ');
        const cmd = args[0].toLowerCase();

        const resultLine = document.createElement('div');
        resultLine.className = 'text-gray-100 mb-4 whitespace-pre-wrap';

        switch(cmd) {
            case 'help':
                resultLine.textContent = 'Available commands:\nhelp - Show this message\nwhoami - Print current user\nclear - Clear terminal output\nls - List directory contents\nneofetch - System information\ncat - Read file\nopen - Open application (e.g. open projects)';
                break;
            case 'whoami':
                resultLine.textContent = 'Sebastian Duran Caballero';
                break;
            case 'clear':
                this.output.innerHTML = '';
                return;
            case 'ls':
                resultLine.textContent = 'description.txt\nprojects\nskills\ncontact';
                break;
            case 'neofetch':
                resultLine.innerHTML = `
                        <div class="flex flex-col md:flex-row text-gray-100">
                            <div class="mr-6 mb-4 md:mb-0 text-[#3584e4] text-xs sm:text-sm font-bold">
<pre>
       _,-/'--,-/\\-,
     ,' /   ,-'   ) \\
   ,'  |  ,'     /   \\
  /    | /      /     \\
 /      /      /      |
|      /      /       |
|      |     /        |
|      |    /         |
 \\     |   /         /
  \\    |  /         /
   '.  | /        ,'
     './'      ,-'
       '-----'
</pre>
                            </div>
                            <div>
                                <p><span class="text-[#3584e4] font-bold">OS:</span> Adwaita Linux x86_64</p>
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
                if(args[1] === 'description.txt') {
                    resultLine.textContent = 'Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.';
                } else {
                    resultLine.textContent = `cat: ${args[1] || ''}: No such file or directory`;
                }
                break;
            case 'open':
                if(args[1] && window.app) {
                    window.app.openWindow(args[1]);
                    resultLine.textContent = `Opening ${args[1]}...`;
                } else {
                    resultLine.textContent = 'Usage: open <app_name>';
                }
                break;
            default:
                resultLine.textContent = `bash: ${cmd}: command not found`;
        }

        if(resultLine.innerHTML !== '') {
            this.output.appendChild(resultLine);
        }

        this.scrollToBottom();
    }

    scrollToBottom() {
        const terminalContent = document.getElementById('terminal-content');
        if (terminalContent) {
            terminalContent.scrollTop = terminalContent.scrollHeight;
        }
    }
}
