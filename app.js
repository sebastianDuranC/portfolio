class LinuxOS {
    constructor() {
        this.windows = document.querySelectorAll('.os-window');
        this.highestZIndex = 100;
        this.openWindows = new Set();
        
        // Expose globally
        window.app = this;

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

            const dragStart = (e) => {
                // Don't drag if maximizing/closing buttons are clicked
                if(e.target.closest('button')) return;

                if (win.classList.contains('maximized')) {
                    // Handle un-maximizing while dragging
                    const rectLeft = win.getBoundingClientRect().left;

                    win.classList.remove('maximized');
                    win.style.transform = 'none'; // Temporarily clear transform to recalculate layout

                    // Recalculate offset relative to the un-maximized natural layout position
                    const newRectLeft = win.getBoundingClientRect().left;
                    const targetLeft = e.clientX - (win.offsetWidth / 2);

                    xOffset = targetLeft - newRectLeft;
                    yOffset = 0; // Stick to mouse Y for un-maximizing
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

                    // Aero snap for maximizing when hitting top edge
                    if (e.clientY <= 0 && !win.classList.contains('maximized')) {
                        this.maximizeWindow(win.dataset.id);
                        isDragging = false; // stop dragging to let it snap
                        return;
                    }

                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;

                    xOffset = currentX;
                    yOffset = currentY;

                    win.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
                }
            };

            const dragEnd = () => {
                initialX = currentX;
                initialY = currentY;
                isDragging = false;
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
                    isResizing = true;
                    currentResizer = resizer;
                    e.preventDefault(); // Prevent text selection

                    document.addEventListener('mousemove', resize);
                    document.addEventListener('mouseup', stopResize);
                });
            });

            const resize = (e) => {
                if (!isResizing) return;

                if (win.classList.contains('maximized')) return;

                const rect = win.getBoundingClientRect();
                const parentRect = win.parentElement.getBoundingClientRect();

                if (currentResizer.classList.contains('resizer-r')) {
                    win.style.width = (e.clientX - rect.left) + 'px';
                } else if (currentResizer.classList.contains('resizer-b')) {
                    win.style.height = (e.clientY - rect.top) + 'px';
                } else if (currentResizer.classList.contains('resizer-br')) {
                    win.style.width = (e.clientX - rect.left) + 'px';
                    win.style.height = (e.clientY - rect.top) + 'px';
                }
            };

            const stopResize = () => {
                isResizing = false;
                document.removeEventListener('mousemove', resize);
                document.removeEventListener('mouseup', stopResize);
            };
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

            // reset size just in case it was resized
            win.style.width = '';
            win.style.height = '';

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
                // Save current transform/size before maximizing
                win.dataset.prevTransform = win.style.transform;
                win.dataset.prevWidth = win.style.width;
                win.dataset.prevHeight = win.style.height;

                win.classList.add('maximized');
                win.style.transform = 'none';
                win.style.width = '100%';
                win.style.height = '100%';
            } else {
                win.classList.remove('maximized');
                // Restore transform/size
                if (win.dataset.prevTransform) win.style.transform = win.dataset.prevTransform;
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

class TerminalParser {
    constructor(terminalElementId) {
        this.terminal = document.getElementById(terminalElementId);
        if (!this.terminal) return;

        this.history = [];
        this.historyIndex = -1;
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
        // Pre-populate
        this.printPrompt();
        this.printCommand('whoami');
        this.cmdWhoami();
        this.printPrompt();
        this.printCommand('neofetch');
        this.cmdNeofetch();

        this.createNewInput();

        // Focus input when clicking anywhere in terminal
        this.terminal.addEventListener('click', () => {
            const input = this.terminal.querySelector('.cmd-input:last-of-type');
            if (input) input.focus();
        });
    }

    printPrompt() {
        const p = document.createElement('p');
        p.className = 'mb-1';
        p.innerHTML = `<span class="text-green-400 font-bold">sebastian@adwaita</span>:<span class="text-blue-400 font-bold">~</span>$ `;
        this.terminal.appendChild(p);
    }

    printCommand(cmd) {
        const p = this.terminal.lastElementChild;
        p.appendChild(document.createTextNode(cmd));
    }

    createNewInput() {
        const p = document.createElement('p');
        p.className = 'mb-1 flex items-center';
        p.innerHTML = `<span class="text-green-400 font-bold whitespace-nowrap">sebastian@adwaita</span><span class="text-white">:</span><span class="text-blue-400 font-bold whitespace-nowrap">~</span><span class="text-white whitespace-nowrap mr-2">$</span>`;

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'cmd-input flex-1 bg-transparent border-none outline-none text-gray-200 font-fira';
        input.autocomplete = 'off';
        input.spellcheck = false;

        input.addEventListener('keydown', (e) => this.handleInput(e, input));

        p.appendChild(input);
        this.terminal.appendChild(p);

        // Scroll to bottom
        this.terminal.scrollTop = this.terminal.scrollHeight;
        input.focus();
    }

    handleInput(e, inputElement) {
        if (e.key === 'Enter') {
            const val = inputElement.value.trim();
            // Disable previous input
            inputElement.disabled = true;
            inputElement.classList.add('opacity-80');

            if (val) {
                this.history.push(val);
                this.historyIndex = this.history.length;
                this.processCommand(val);
            } else {
                this.createNewInput();
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (this.historyIndex > 0) {
                this.historyIndex--;
                inputElement.value = this.history[this.historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (this.historyIndex < this.history.length - 1) {
                this.historyIndex++;
                inputElement.value = this.history[this.historyIndex];
            } else {
                this.historyIndex = this.history.length;
                inputElement.value = '';
            }
        }
    }

    processCommand(cmdLine) {
        const args = cmdLine.split(' ').filter(Boolean);
        const cmd = args.shift().toLowerCase();

        if (this.commands[cmd]) {
            this.commands[cmd](args);
        } else {
            this.printOutput(`bash: ${this.escapeHTML(cmd)}: command not found`);
        }

        if (cmd !== 'clear') {
            this.createNewInput();
        }
    }

    printOutput(text, isHtml = false) {
        const div = document.createElement('div');
        div.className = 'text-gray-200 mb-4 whitespace-pre-wrap';
        if (isHtml) {
            div.innerHTML = text;
        } else {
            div.textContent = text;
        }
        this.terminal.appendChild(div);
    }

    escapeHTML(str) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }

    // Commands
    cmdHelp() {
        this.printOutput(`Available commands:
  help      - Show this message
  whoami    - Show current user
  clear     - Clear terminal
  ls        - List directory contents
  neofetch  - System information
  cat       - Print file contents (try 'cat description.txt')
  open      - Open a window (try 'open projects', 'open skills', 'open contact')`);
    }

    cmdWhoami() {
        this.printOutput('Sebastian Duran Caballero');
    }

    cmdClear() {
        this.terminal.innerHTML = '';
        this.createNewInput();
    }

    cmdLs(args) {
        this.printOutput('description.txt  projects/  skills/  contact/');
    }

    cmdNeofetch() {
        const html = `
<div class="flex flex-col md:flex-row mb-4">
    <div class="mr-6 mb-4 md:mb-0 text-adwaita-blue text-xs sm:text-sm font-bold">
<pre>
           .
          / \\
         /   \\
        /     \\
       /       \\
      /_________\\
      \\         /
       \\       /
        \\     /
         \\   /
          \\ /
           '
</pre>
    </div>
    <div>
        <p><span class="text-adwaita-blue font-bold">OS:</span> GNOME Adwaita Web OS</p>
        <p><span class="text-adwaita-blue font-bold">Host:</span> Desarrollador Web .NET</p>
        <p><span class="text-adwaita-blue font-bold">Uptime:</span> 24/7 coding</p>
        <p><span class="text-adwaita-blue font-bold">Packages:</span> HTML, CSS, JS, .NET, C#, SQL Server</p>
        <p><span class="text-adwaita-blue font-bold">Shell:</span> bash 5.1.16</p>
        <p><span class="text-adwaita-blue font-bold">Location:</span> Santa Cruz, Bolivia</p>
        <p><span class="text-adwaita-blue font-bold">Email:</span> sd8587793@email.com</p>
    </div>
</div>`;
        this.printOutput(html, true);
    }

    cmdCat(args) {
        if (args.length === 0) {
            this.printOutput("cat: missing file operand");
            return;
        }

        const file = args[0];
        if (file === 'description.txt') {
            this.printOutput('Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET y creación de interfaces interactivas.');
        } else {
            this.printOutput(`cat: ${this.escapeHTML(file)}: No such file or directory`);
        }
    }

    cmdOpen(args) {
        if(args.length === 0) {
            this.printOutput("open: missing argument (projects, skills, contact)");
            return;
        }
        const appName = args[0].toLowerCase();
        if(['projects', 'skills', 'contact'].includes(appName)) {
            this.printOutput(`Opening ${appName}...`);
            if (window.app) window.app.openWindow(appName);
        } else {
            this.printOutput(`open: ${this.escapeHTML(appName)}: Application not found`);
        }
    }
}

// Initialize the OS
const app = new LinuxOS();

// Initialize Terminal parser when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TerminalParser('terminal-content');
});
