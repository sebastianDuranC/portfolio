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
            let currentX;
            let currentY;
            let initialX;
            let initialY;
            let xOffset = 0;
            let yOffset = 0;

            const setTranslate = (xPos, yPos, el) => {
                el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
            };

            const dragStart = (e) => {
                if(e.target.closest('button')) return;

                if(win.classList.contains('maximized')) {
                    // Recalculate offsets for smooth un-maximizing
                    const rectLeft = win.getBoundingClientRect().left;
                    const targetLeft = e.clientX - (win.offsetWidth / 2);
                    xOffset = targetLeft - rectLeft;
                    yOffset = 0; // Reset Y to top when unmaximizing
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

                    if(win.classList.contains('maximized')) {
                        win.classList.remove('maximized');
                        win.style.transform = 'none'; // reset transform so translation applies correctly
                    }

                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;

                    xOffset = currentX;
                    yOffset = currentY;

                    setTranslate(currentX, currentY, win);
                }
            };

            const dragEnd = (e) => {
                if(isDragging) {
                    initialX = currentX;
                    initialY = currentY;
                    isDragging = false;

                    // Aero snap: Maximize if dropped at the top of the screen (<= 28px top bar height)
                    if (e.clientY <= 28) {
                        this.maximizeWindow(win.dataset.id);
                    }
                }
            };

            header.addEventListener('mousedown', dragStart);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);
        });
    }

    setupResizableWindows() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    if (win.classList.contains('maximized')) return;
                    e.preventDefault();
                    isResizing = true;
                    currentResizer = resizer;

                    // We need to use fixed widths and heights during resize to avoid tailwind % issues
                    if(win.style.width === '') {
                        win.style.width = win.offsetWidth + 'px';
                        win.style.height = win.offsetHeight + 'px';
                    }
                });
            });

            document.addEventListener('mousemove', (e) => {
                if (!isResizing) return;

                const rect = win.getBoundingClientRect();

                if (currentResizer.classList.contains('right')) {
                    win.style.width = e.clientX - rect.left + 'px';
                } else if (currentResizer.classList.contains('bottom')) {
                    win.style.height = e.clientY - rect.top + 'px';
                } else if (currentResizer.classList.contains('bottom-right')) {
                    win.style.width = e.clientX - rect.left + 'px';
                    win.style.height = e.clientY - rect.top + 'px';
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
        this.input = document.getElementById('terminal-input');
        this.output = document.getElementById('terminal-output');
        this.content = document.getElementById('terminal-content');
        this.prompt = '<span class="text-green-400 font-bold">sebastian@adwaita</span>:<span class="text-blue-400 font-bold">~</span>$ ';

        if (this.input) {
            this.input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.processCommand(this.input.value);
                    this.input.value = '';
                }
            });
        }

        this.init();
    }

    init() {
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
            }[tag] || tag)
        );
    }

    printLine(html) {
        const line = document.createElement('div');
        line.innerHTML = html;
        line.className = 'mb-2';
        this.output.appendChild(line);
        this.scrollToBottom();
    }

    scrollToBottom() {
        if(this.content) {
            this.content.scrollTop = this.content.scrollHeight;
        }
    }

    processCommand(cmd, isStartup = false) {
        const cleanCmd = cmd.trim();
        this.printLine(`${this.prompt}${this.escapeHTML(cleanCmd)}`);

        if (!cleanCmd) return;

        const args = cleanCmd.split(' ');
        const command = args[0].toLowerCase();

        switch (command) {
            case 'help':
                this.printLine(`
                    <div class="text-gray-300 ml-4 mb-4">
                        <p>Available commands:</p>
                        <ul class="list-none ml-4 mt-2 space-y-1">
                            <li><span class="text-green-400">help</span>     - Show this message</li>
                            <li><span class="text-green-400">whoami</span>   - Print current user</li>
                            <li><span class="text-green-400">neofetch</span> - Show system information</li>
                            <li><span class="text-green-400">ls</span>       - List directory contents</li>
                            <li><span class="text-green-400">cat</span>      - Read file content</li>
                            <li><span class="text-green-400">clear</span>    - Clear terminal output</li>
                            <li><span class="text-green-400">open</span>     - Open an application (e.g., 'open projects')</li>
                        </ul>
                    </div>
                `);
                break;
            case 'whoami':
                this.printLine('<p class="text-gray-100 mb-4 ml-4">Sebastian Duran Caballero</p>');
                break;
            case 'clear':
                this.output.innerHTML = '';
                break;
            case 'ls':
                this.printLine(`
                    <div class="flex space-x-4 ml-4 mb-4 text-blue-400 font-bold">
                        <span>Projects/</span>
                        <span>Skills/</span>
                        <span>Contact/</span>
                        <span class="text-gray-200 font-normal">description.txt</span>
                    </div>
                `);
                break;
            case 'cat':
                if (args[1] === 'description.txt') {
                    this.printLine(`
                        <p class="text-gray-100 mb-4 ml-4">
                            Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.
                        </p>
                    `);
                } else if (!args[1]) {
                    this.printLine('<p class="text-red-400 mb-4 ml-4">cat: missing file operand</p>');
                } else {
                    this.printLine(`<p class="text-red-400 mb-4 ml-4">cat: ${this.escapeHTML(args[1])}: No such file or directory</p>`);
                }
                break;
            case 'open':
                const appName = args[1] ? args[1].toLowerCase() : '';
                if (['projects', 'skills', 'contact'].includes(appName)) {
                    this.printLine(`<p class="text-gray-300 mb-4 ml-4">Opening ${appName}...</p>`);
                    // Call the global app instance
                    if(window.app) window.app.openWindow(appName);
                } else if (!appName) {
                    this.printLine('<p class="text-red-400 mb-4 ml-4">open: missing application name</p>');
                } else {
                    this.printLine(`<p class="text-red-400 mb-4 ml-4">open: application '${this.escapeHTML(appName)}' not found</p>`);
                }
                break;
            case 'neofetch':
                this.printLine(`
                    <div class="flex flex-col md:flex-row text-gray-100 mb-4 ml-4">
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
                            <p><span class="text-[#3584e4] font-bold">OS:</span> Adwaita 22.04 LTS x86_64</p>
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
                this.printLine(`<p class="text-red-400 mb-4 ml-4">Command not found: ${this.escapeHTML(command)}. Type 'help' for available commands.</p>`);
        }
    }
}

// Initialize the OS
const app = new LinuxOS();
window.app = app;
const terminal = new TerminalParser();