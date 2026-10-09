class TerminalParser {
    constructor() {
        this.outputDiv = document.getElementById('terminal-output');
        this.inputField = document.getElementById('terminal-input');

        if(this.inputField) {
            this.inputField.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.executeCommand(this.inputField.value);
                    this.inputField.value = '';

                    // Scroll to bottom
                    const content = document.getElementById('terminal-content');
                    if (content) content.scrollTop = content.scrollHeight;
                }
            });
        }

        // Initial setup
        this.printPrepopulated();
    }

    printPrepopulated() {
        if(!this.outputDiv) return;
        this.printCommand('whoami');
        this.printLine('Sebastian Duran Caballero');
        this.printLine('');

        this.printCommand('neofetch');
        const neofetchHTML = `
            <div class="flex flex-col md:flex-row text-gray-100 mb-4">
                <div class="mr-6 mb-4 md:mb-0 text-[#3584e4] text-xs sm:text-sm font-bold">
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
                    <p><span class="text-[#3584e4] font-bold">OS:</span> GNOME Adwaita x86_64</p>
                    <p><span class="text-[#3584e4] font-bold">Host:</span> Desarrollador Web</p>
                    <p><span class="text-[#3584e4] font-bold">Uptime:</span> 24/7 coding</p>
                    <p><span class="text-[#3584e4] font-bold">Packages:</span> HTML, CSS, JS, .NET, C#</p>
                    <p><span class="text-[#3584e4] font-bold">Shell:</span> bash 5.1.16</p>
                    <p><span class="text-[#3584e4] font-bold">Location:</span> Santa Cruz, Bolivia</p>
                    <p><span class="text-[#3584e4] font-bold">Email:</span> sd8587793@email.com</p>
                </div>
            </div>
        `;
        const div = document.createElement('div');
        div.innerHTML = neofetchHTML;
        this.outputDiv.appendChild(div);
    }

    printCommand(cmd) {
        const p = document.createElement('p');
        p.className = 'mb-2';
        p.innerHTML = `<span class="text-green-400 font-bold">sebastian@adwaita</span>:<span class="text-blue-400 font-bold">~</span>$ `;
        const span = document.createElement('span');
        span.textContent = cmd;
        p.appendChild(span);
        this.outputDiv.appendChild(p);
    }

    printLine(text) {
        const p = document.createElement('p');
        p.className = 'text-gray-100 mb-4 whitespace-pre-wrap';
        p.textContent = text;
        this.outputDiv.appendChild(p);
    }

    executeCommand(cmdRaw) {
        const cmd = cmdRaw.trim();
        this.printCommand(cmd);

        if (cmd === '') return;

        const parts = cmd.split(' ').filter(Boolean);
        const base = parts[0].toLowerCase();
        const args = parts.slice(1);

        switch (base) {
            case 'help':
                this.printLine('Available commands:\n  help      Show this help message\n  whoami    Print current user\n  clear     Clear terminal output\n  ls        List available files/directories\n  neofetch  Show system information\n  cat       Read a file\n  open      Open a specific app/window (e.g. open projects)');
                break;
            case 'whoami':
                this.printLine('Sebastian Duran Caballero');
                break;
            case 'clear':
                this.outputDiv.innerHTML = '';
                break;
            case 'ls':
                this.printLine('description.txt  projects/  skills/  contact/');
                break;
            case 'neofetch':
                this.printPrepopulated(); // Reuse the same logic but ideally just the neofetch part. Doing a simplified one.
                break;
            case 'cat':
                if(args[0] === 'description.txt') {
                    this.printLine('Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.');
                } else if(args.length === 0) {
                    this.printLine('cat: missing file operand');
                } else {
                    this.printLine(`cat: ${args[0]}: No such file or directory`);
                }
                break;
            case 'open':
                if (args.length > 0) {
                    const target = args[0].toLowerCase();
                    if (['projects', 'skills', 'contact', 'terminal'].includes(target)) {
                        this.printLine(`Opening ${target}...`);
                        if (window.app) {
                            window.app.openWindow(target);
                        }
                    } else {
                        this.printLine(`open: ${target}: app not found`);
                    }
                } else {
                    this.printLine('open: missing app name');
                }
                break;
            default:
                this.printLine(`${base}: command not found`);
                break;
        }
    }
}

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
        this.setupResizers();
        this.setupWindowClickToFront();
        this.setupLogin();

        this.terminalParser = new TerminalParser();
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
                    // Restore window from maximized if dragged
                    win.classList.remove('maximized');
                    win.style.transform = 'none';

                    const targetLeft = e.clientX - (win.offsetWidth / 2);
                    const rectLeft = win.getBoundingClientRect().left;

                    xOffset = targetLeft - rectLeft;
                    // Start dragging from the mouse position relative to the restored window
                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;
                    isDragging = true;
                    return;
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

                    // Aero Snap to top
                    if(e.clientY <= 0) {
                        this.maximizeWindow(win.dataset.id);
                        isDragging = false;
                        return;
                    }

                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;

                    xOffset = currentX;
                    yOffset = currentY;

                    setTranslate(currentX, currentY, win);
                }
            };

            const setTranslate = (xPos, yPos, el) => {
                el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
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
            let currentResizer = null;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    isResizing = true;
                    currentResizer = resizer;
                    this.bringToFront(win);
                });
            });

            document.addEventListener('mousemove', (e) => {
                if (!isResizing || !currentResizer) return;

                const rect = win.getBoundingClientRect();

                if (currentResizer.classList.contains('resizer-r')) {
                    win.style.width = (e.clientX - rect.left) + 'px';
                } else if (currentResizer.classList.contains('resizer-b')) {
                    win.style.height = (e.clientY - rect.top) + 'px';
                } else if (currentResizer.classList.contains('resizer-br')) {
                    win.style.width = (e.clientX - rect.left) + 'px';
                    win.style.height = (e.clientY - rect.top) + 'px';
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

// Initialize the OS and expose globally for TerminalParser
window.app = new LinuxOS();