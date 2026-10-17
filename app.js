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
            let currentX;
            let currentY;
            let initialX;
            let initialY;
            let xOffset = 0;
            let yOffset = 0;

            const dragStart = (e) => {
                if(e.target.closest('button')) return;

                if (win.classList.contains('maximized')) {
                    win.classList.remove('maximized');
                    win.style.transform = 'none';

                    const rect = win.getBoundingClientRect();
                    const targetLeft = Math.max(0, e.clientX - (rect.width / 2));
                    const desktopRect = document.getElementById('desktop').getBoundingClientRect();

                    xOffset = targetLeft - rect.left;
                    yOffset = e.clientY - rect.top - desktopRect.top;

                    setTranslate(xOffset, yOffset, win);
                }

                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;
                    this.bringToFront(win);
                }
            };

            const drag = (e) => {
                if (isDragging) {
                    e.preventDefault();

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
                if (!isDragging) return;
                initialX = currentX;
                initialY = currentY;
                isDragging = false;

                if (e.clientY <= 28) {
                    this.maximizeWindow(win.dataset.id);
                }
            };

            header.addEventListener('mousedown', dragStart);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);

            // Resizing logic
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    isResizing = true;
                    currentResizer = resizer;
                    initialX = e.clientX;
                    initialY = e.clientY;
                    this.bringToFront(win);
                    e.preventDefault();
                });
            });

            document.addEventListener('mousemove', (e) => {
                if (!isResizing) return;
                e.preventDefault();

                const rect = win.getBoundingClientRect();

                if (currentResizer.classList.contains('resizer-r') || currentResizer.classList.contains('resizer-br')) {
                    const newWidth = e.clientX - rect.left;
                    win.style.width = `${Math.max(300, newWidth)}px`;
                }
                if (currentResizer.classList.contains('resizer-b') || currentResizer.classList.contains('resizer-br')) {
                    const newHeight = e.clientY - rect.top;
                    win.style.height = `${Math.max(200, newHeight)}px`;
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
        this.output = document.getElementById('terminal-output');
        this.input = document.getElementById('terminal-input');
        if (!this.output || !this.input) return;

        this.filesystem = {
            'description.txt': 'Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.',
            'skills.txt': 'HTML, CSS, JS, .NET, C#, SQL Server',
            'contact.txt': 'sd8587793@email.com'
        };

        this.setupInputListener();

        // Initial setup
        this.printCommand('whoami');
        this.printLine('Sebastian Duran Caballero');
        this.printLine('');
        this.printCommand('neofetch');
        this.executeNeofetch();
    }

    setupInputListener() {
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = this.input.value.trim();
                this.input.value = '';

                if (command) {
                    this.printCommand(command);
                    this.processCommand(command);
                }

                // Scroll to bottom
                const container = document.getElementById('terminal-content');
                if (container) {
                    container.scrollTop = container.scrollHeight;
                }
            }
        });

        // Focus input when clicking anywhere in terminal
        const terminalContent = document.getElementById('terminal-content');
        if (terminalContent) {
            terminalContent.addEventListener('click', () => {
                this.input.focus();
            });
        }
    }

    printCommand(cmd) {
        const p = document.createElement('p');
        p.className = 'mb-2';

        const promptSpan1 = document.createElement('span');
        promptSpan1.className = 'text-green-400 font-bold';
        promptSpan1.textContent = 'sebastian@adwaita';

        const colonSpan = document.createElement('span');
        colonSpan.className = 'text-white font-bold';
        colonSpan.textContent = ':';

        const promptSpan2 = document.createElement('span');
        promptSpan2.className = 'text-[#3584e4] font-bold';
        promptSpan2.textContent = '~';

        const dollarSpan = document.createElement('span');
        dollarSpan.className = 'text-white font-bold mr-2';
        dollarSpan.textContent = '$';

        const cmdSpan = document.createElement('span');
        cmdSpan.className = 'text-gray-200';
        cmdSpan.textContent = cmd;

        p.appendChild(promptSpan1);
        p.appendChild(colonSpan);
        p.appendChild(promptSpan2);
        p.appendChild(dollarSpan);
        p.appendChild(cmdSpan);

        this.output.appendChild(p);
    }

    printLine(text, className = 'text-gray-100 mb-4 whitespace-pre-wrap') {
        const p = document.createElement('p');
        p.className = className;
        p.textContent = text;
        this.output.appendChild(p);
    }

    processCommand(rawCmd) {
        const args = rawCmd.split(' ').filter(Boolean);
        const cmd = args[0].toLowerCase();

        switch (cmd) {
            case 'help':
                this.printLine('Available commands:\n  help      - Show this help message\n  whoami    - Show current user\n  clear     - Clear terminal output\n  ls        - List directory contents\n  cat       - View file contents\n  neofetch  - Show system information\n  open      - Open a desktop application (e.g., "open projects")');
                break;
            case 'whoami':
                this.printLine('Sebastian Duran Caballero');
                break;
            case 'clear':
                this.output.innerHTML = '';
                break;
            case 'ls':
                this.printLine(Object.keys(this.filesystem).join('  '), 'text-[#3584e4] font-bold mb-4');
                break;
            case 'cat':
                if (args.length < 2) {
                    this.printLine('Usage: cat <filename>');
                } else {
                    const filename = args[1];
                    if (this.filesystem[filename]) {
                        this.printLine(this.filesystem[filename]);
                    } else {
                        this.printLine(`cat: ${filename}: No such file or directory`, 'text-red-400 mb-4');
                    }
                }
                break;
            case 'neofetch':
                this.executeNeofetch();
                break;
            case 'open':
                if (args.length < 2) {
                    this.printLine('Usage: open <app_name> (projects, skills, contact)');
                } else {
                    const appName = args[1].toLowerCase();
                    const validApps = ['projects', 'skills', 'contact'];
                    if (validApps.includes(appName)) {
                        if (window.app) {
                            window.app.openWindow(appName);
                            this.printLine(`Opening ${appName}...`);
                        }
                    } else {
                        this.printLine(`open: App '${appName}' not found. Available apps: ${validApps.join(', ')}`, 'text-red-400 mb-4');
                    }
                }
                break;
            default:
                this.printLine(`Command not found: ${cmd}`, 'text-red-400 mb-4');
        }
    }

    executeNeofetch() {
        const container = document.createElement('div');
        container.className = 'flex flex-col md:flex-row text-gray-100 mb-4';

        const artDiv = document.createElement('div');
        artDiv.className = 'mr-6 mb-4 md:mb-0 text-[#3584e4] text-xs sm:text-sm font-bold';
        artDiv.innerHTML = `<pre>
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
</pre>`;

        const infoDiv = document.createElement('div');
        infoDiv.innerHTML = `
            <p><span class="text-[#3584e4] font-bold">OS:</span> Adwaita OS x86_64</p>
            <p><span class="text-[#3584e4] font-bold">Host:</span> Desarrollador Web</p>
            <p><span class="text-[#3584e4] font-bold">Uptime:</span> 24/7 coding</p>
            <p><span class="text-[#3584e4] font-bold">Packages:</span> HTML, CSS, JS, .NET, C#</p>
            <p><span class="text-[#3584e4] font-bold">Shell:</span> bash 5.1.16</p>
            <p><span class="text-[#3584e4] font-bold">Location:</span> Santa Cruz, Bolivia</p>
            <p><span class="text-[#3584e4] font-bold">Email:</span> sd8587793@email.com</p>
        `;

        container.appendChild(artDiv);
        container.appendChild(infoDiv);
        this.output.appendChild(container);
    }
}

// Initialize the OS
const app = new LinuxOS();
window.app = app;
const terminal = new TerminalParser();