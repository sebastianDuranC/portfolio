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
            let isResizing = false;

            const dragStart = (e) => {
                if (e.target.closest('button') || e.target.classList.contains('resizer') || isResizing) return;

                if (win.classList.contains('maximized')) {
                    // Logic to restore window when dragged while maximized
                    win.classList.remove('maximized');
                    win.style.transform = 'none';

                    const rect = win.getBoundingClientRect();
                    const targetLeft = e.clientX - (rect.width / 2);

                    xOffset = targetLeft - rect.left;
                    yOffset = 0;

                    this.setTranslate(xOffset, yOffset, win);
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

                    // Implement 'Aero Snap' to top
                    if (e.clientY <= 28) {
                        this.maximizeWindow(win.dataset.id);
                        isDragging = false;
                        return;
                    }

                    xOffset = currentX;
                    yOffset = currentY;

                    this.setTranslate(currentX, currentY, win);
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

            // Setup Resizing
            const resizers = win.querySelectorAll('.resizer');
            resizers.forEach(resizer => {
                let startWidth, startHeight, startX, startY;

                const resizeStart = (e) => {
                    e.preventDefault();
                    isResizing = true;
                    this.bringToFront(win);

                    startX = e.clientX;
                    startY = e.clientY;
                    startWidth = parseInt(document.defaultView.getComputedStyle(win).width, 10);
                    startHeight = parseInt(document.defaultView.getComputedStyle(win).height, 10);

                    const resize = (e) => {
                        if(resizer.classList.contains('resizer-r') || resizer.classList.contains('resizer-br')) {
                            win.style.width = (startWidth + e.clientX - startX) + 'px';
                        }
                        if(resizer.classList.contains('resizer-b') || resizer.classList.contains('resizer-br')) {
                            win.style.height = (startHeight + e.clientY - startY) + 'px';
                        }
                    };

                    const resizeEnd = (e) => {
                        isResizing = false;
                        document.removeEventListener('mousemove', resize);
                        document.removeEventListener('mouseup', resizeEnd);
                    };

                    document.addEventListener('mousemove', resize);
                    document.addEventListener('mouseup', resizeEnd);
                };

                resizer.addEventListener('mousedown', resizeStart);
            });
        });
    }

    setTranslate(xPos, yPos, el) {
        el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
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
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.history = [];
        this.historyIndex = -1;
        this.prompt = '<span class="text-green-400 font-bold">sebastian@adwaita</span>:<span class="text-blue-400 font-bold">~</span>$ ';

        this.commands = {
            'help': this.cmdHelp.bind(this),
            'whoami': this.cmdWhoami.bind(this),
            'clear': this.cmdClear.bind(this),
            'ls': this.cmdLs.bind(this),
            'neofetch': this.cmdNeofetch.bind(this),
            'cat': this.cmdCat.bind(this),
            'open': this.cmdOpen.bind(this)
        };

        this.init();
    }

    init() {
        if(!this.container) return;
        this.container.innerHTML = ''; // Clear initial html
        this.container.addEventListener('click', () => {
            const input = this.container.querySelector('.terminal-input');
            if(input) input.focus();
        });

        // Pre-populate
        this.printLine(`${this.prompt}whoami`);
        this.printLine('Sebastian Duran Caballero');
        this.printLine(`${this.prompt}neofetch`);
        this.cmdNeofetch([]);
        this.createNewInputLine();
    }

    printLine(htmlString) {
        const div = document.createElement('div');
        div.className = 'mb-2';
        div.innerHTML = htmlString; // prompt contains html, safe as we control it
        this.container.appendChild(div);
        this.scrollToBottom();
    }

    printText(text) {
        const div = document.createElement('div');
        div.className = 'mb-2 whitespace-pre-wrap text-gray-100';
        div.textContent = text;
        this.container.appendChild(div);
        this.scrollToBottom();
    }

    scrollToBottom() {
        this.container.scrollTop = this.container.scrollHeight;
    }

    createNewInputLine() {
        // Remove old input if exists
        const oldInputContainer = this.container.querySelector('.terminal-input-container');
        if (oldInputContainer) {
            const oldInput = oldInputContainer.querySelector('input');
            const val = oldInput ? oldInput.value : '';
            oldInputContainer.outerHTML = `<div class="mb-2">${this.prompt}${this.escapeHTML(val)}</div>`;
        }

        const div = document.createElement('div');
        div.className = 'terminal-input-container flex items-center mb-2';
        div.innerHTML = `${this.prompt} <input type="text" class="terminal-input bg-transparent border-none outline-none text-gray-200 flex-1 ml-1 font-firacode" autocomplete="off" spellcheck="false" autofocus>`;

        this.container.appendChild(div);

        const input = div.querySelector('input');
        input.addEventListener('keydown', this.handleInput.bind(this));
        // Small delay to ensure render before focus
        setTimeout(() => input.focus(), 10);
        this.scrollToBottom();
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

    handleInput(e) {
        if (e.key === 'Enter') {
            const val = e.target.value.trim();
            if (val) {
                this.history.push(val);
                this.historyIndex = this.history.length;
            }
            this.processCommand(val);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (this.historyIndex > 0) {
                this.historyIndex--;
                e.target.value = this.history[this.historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (this.historyIndex < this.history.length - 1) {
                this.historyIndex++;
                e.target.value = this.history[this.historyIndex];
            } else {
                this.historyIndex = this.history.length;
                e.target.value = '';
            }
        }
    }

    processCommand(cmdString) {
        if (!cmdString) {
            this.createNewInputLine();
            return;
        }

        const parts = cmdString.split(' ').filter(p => p.trim() !== '');
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        // Replace current input with static text
        const oldInputContainer = this.container.querySelector('.terminal-input-container');
        if (oldInputContainer) {
            oldInputContainer.outerHTML = `<div class="mb-2">${this.prompt}${this.escapeHTML(cmdString)}</div>`;
        } else {
             this.printLine(`${this.prompt}${this.escapeHTML(cmdString)}`);
        }


        if (this.commands[cmd]) {
            this.commands[cmd](args);
        } else {
            this.printText(`bash: ${cmd}: command not found`);
        }

        if (cmd !== 'clear') {
            this.createNewInputLine();
        }
    }

    cmdHelp() {
        this.printText(`Available commands:
  help      - Show this help message
  whoami    - Print current user
  clear     - Clear terminal output
  ls        - List directory contents
  neofetch  - Display system information
  cat       - Concatenate and print files (try: cat description.txt)
  open      - Open an application (usage: open <app_name>)
              Apps: projects, skills, contact`);
    }

    cmdWhoami() {
        this.printText('Sebastian Duran Caballero');
    }

    cmdClear() {
        this.container.innerHTML = '';
        this.createNewInputLine();
    }

    cmdLs() {
        const html = `<div class="flex gap-4 text-adwaita-blue font-bold">
            <span>projects/</span>
            <span>skills/</span>
            <span>contact/</span>
            <span class="text-gray-200 font-normal">description.txt</span>
        </div>`;
        const div = document.createElement('div');
        div.className = 'mb-2';
        div.innerHTML = html;
        this.container.appendChild(div);
        this.scrollToBottom();
    }

    cmdNeofetch() {
        // Escaping backticks carefully for the template literal
        const ascii = `       _,-/\`--,-/\\-,
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

        const html = `
        <div class="flex flex-col md:flex-row text-gray-100 mb-4">
            <div class="mr-6 mb-4 md:mb-0 text-adwaita-blue text-xs sm:text-sm font-bold whitespace-pre">
${this.escapeHTML(ascii)}
            </div>
            <div>
                <p><span class="text-adwaita-blue font-bold">OS:</span> GNOME OS x86_64</p>
                <p><span class="text-adwaita-blue font-bold">Host:</span> Desarrollador Web</p>
                <p><span class="text-adwaita-blue font-bold">Uptime:</span> 24/7 coding</p>
                <p><span class="text-adwaita-blue font-bold">Packages:</span> HTML, CSS, JS, .NET, C#</p>
                <p><span class="text-adwaita-blue font-bold">Shell:</span> bash 5.1.16</p>
                <p><span class="text-adwaita-blue font-bold">Location:</span> Santa Cruz, Bolivia</p>
                <p><span class="text-adwaita-blue font-bold">Email:</span> sd8587793@email.com</p>
            </div>
        </div>`;
        const div = document.createElement('div');
        div.innerHTML = html;
        this.container.appendChild(div);
        this.scrollToBottom();
    }

    cmdCat(args) {
        if (args.length === 0) {
            this.printText('cat: missing operand');
            return;
        }

        if (args[0] === 'description.txt') {
            this.printText('Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.');
        } else {
            this.printText(`cat: ${args[0]}: No such file or directory`);
        }
    }

    cmdOpen(args) {
        if (args.length === 0) {
            this.printText('open: missing application name');
            return;
        }

        const appName = args[0].toLowerCase();
        const validApps = ['projects', 'skills', 'contact', 'terminal'];

        if (validApps.includes(appName)) {
            if(window.app) {
                window.app.openWindow(appName);
                this.printText(`Opening ${appName}...`);
            } else {
                this.printText('Error: Window manager not found.');
            }
        } else {
            this.printText(`open: application '${appName}' not found`);
        }
    }
}


// Initialize the OS
const app = new LinuxOS();
window.app = app;

// Initialize Terminal Parser once the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.terminalParser = new TerminalParser('terminal-content');
});