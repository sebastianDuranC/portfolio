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
                if(loginScreen && loginScreen.style.display !== 'none' && !loginScreen.classList.contains('fade-out') && e.target.id !== 'terminal-input') {
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

            header.addEventListener('mousedown', dragStart.bind(this));
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);

            function dragStart(e) {
                // Don't drag if maximizing/closing buttons are clicked
                if(e.target.closest('button')) return;

                if(win.classList.contains('maximized')) {
                    // Restore from maximized state
                    win.classList.remove('maximized');
                    win.style.transform = 'none';

                    // Recalculate offsets so window jumps to cursor
                    const rect = win.getBoundingClientRect();
                    const desktopRect = document.getElementById('desktop').getBoundingClientRect();

                    xOffset = e.clientX - desktopRect.left - (rect.width / 2);
                    yOffset = e.clientY - desktopRect.top - 20; // 20px approx header click pos

                    // Constrain
                    if(xOffset < 0) xOffset = 0;
                    if(yOffset < 0) yOffset = 0;

                    setTranslate(xOffset, yOffset, win);
                }

                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;
                }
            }

            function drag(e) {
                if (isDragging) {
                    e.preventDefault();

                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;

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

    setupResizers() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    isResizing = true;
                    currentResizer = resizer;
                    this.bringToFront(win);
                    e.preventDefault();
                });
            });

            document.addEventListener('mousemove', (e) => {
                if (!isResizing) return;

                const rect = win.getBoundingClientRect();
                const desktopRect = document.getElementById('desktop').getBoundingClientRect();

                if (currentResizer.classList.contains('right') || currentResizer.classList.contains('bottom-right')) {
                    const newWidth = e.clientX - rect.left;
                    if (newWidth > 300) { // min-width
                        win.style.width = `${newWidth}px`;
                    }
                }

                if (currentResizer.classList.contains('bottom') || currentResizer.classList.contains('bottom-right')) {
                    const newHeight = e.clientY - rect.top;
                    if (newHeight > 200) { // min-height
                        win.style.height = `${newHeight}px`;
                    }
                }
            });

            document.addEventListener('mouseup', () => {
                isResizing = false;
            });
        });
    }

    init() {
        this.setupClock();
        this.setupDraggableWindows();
        this.setupResizers();
        this.setupWindowClickToFront();
        this.setupLogin();
    }
}

class TerminalParser {
    constructor() {
        this.output = document.getElementById('terminal-output');
        this.input = document.getElementById('terminal-input');

        if(this.input) {
            this.input.addEventListener('keydown', this.handleInput.bind(this));
            // Focus on terminal click
            document.getElementById('window-terminal').addEventListener('click', () => {
                if(this.input) this.input.focus();
            });
        }

        this.initTerminal();
    }

    initTerminal() {
        this.printLine('whoami', true);
        this.printLine('Sebastian Duran Caballero');
        this.printLine('');
        this.printLine('neofetch', true);
        this.printNeofetch();
    }

    handleInput(e) {
        if(e.key === 'Enter') {
            const cmd = this.input.value.trim();
            this.input.value = '';

            if(cmd) {
                this.printLine(cmd, true);
                this.processCommand(cmd);
            } else {
                this.printLine('', true);
            }

            this.scrollToBottom();
        }
    }

    processCommand(cmd) {
        const parts = cmd.toLowerCase().split(' ');
        const baseCmd = parts[0];

        switch(baseCmd) {
            case 'help':
                this.printLine('Available commands:');
                this.printLine('  help      - Show this help message');
                this.printLine('  whoami    - Show current user');
                this.printLine('  clear     - Clear terminal output');
                this.printLine('  ls        - List directory contents');
                this.printLine('  neofetch  - System information');
                this.printLine('  cat       - Concatenate files and print on the standard output (e.g. cat description.txt)');
                this.printLine('  open      - Open applications (e.g. open projects)');
                break;
            case 'whoami':
                this.printLine('Sebastian Duran Caballero');
                break;
            case 'clear':
                this.output.innerHTML = '';
                break;
            case 'ls':
                this.printLine('<span class="text-blue-400">projects</span>  <span class="text-blue-400">skills</span>  description.txt  contact.txt', false, true);
                break;
            case 'neofetch':
                this.printNeofetch();
                break;
            case 'cat':
                if(parts[1] === 'description.txt') {
                    this.printLine('Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.');
                } else if(parts[1] === 'contact.txt') {
                    this.printLine('Email: sd8587793@email.com');
                } else {
                    this.printLine(`cat: ${parts[1]}: No such file or directory`);
                }
                break;
            case 'open':
                const appName = parts[1];
                if(['projects', 'skills', 'contact'].includes(appName)) {
                    this.printLine(`Opening ${appName}...`);
                    window.app.openWindow(appName);
                } else {
                    this.printLine(`Application not found: ${appName}`);
                }
                break;
            default:
                this.printLine(`Command not found: ${baseCmd}`);
        }
    }

    printLine(text, isCommand = false, isRaw = false) {
        const line = document.createElement('div');
        line.className = 'mb-1';

        if(isCommand) {
            line.innerHTML = `<span class="text-green-400 font-bold">sebastian@adwaita</span>:<span class="text-blue-400 font-bold">~</span>$ ${this.escapeHTML(text)}`;
        } else {
            if(isRaw) {
                line.innerHTML = text;
            } else {
                line.textContent = text;
            }
        }

        this.output.appendChild(line);
    }

    printNeofetch() {
        const html = `
        <div class="flex flex-col md:flex-row text-gray-100 my-4">
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
                <p><span class="text-[#3584e4] font-bold">OS:</span> Adwaita 22.04 LTS x86_64</p>
                <p><span class="text-[#3584e4] font-bold">Host:</span> Desarrollador Web</p>
                <p><span class="text-[#3584e4] font-bold">Uptime:</span> 24/7 coding</p>
                <p><span class="text-[#3584e4] font-bold">Packages:</span> HTML, CSS, JS, .NET, C#</p>
                <p><span class="text-[#3584e4] font-bold">Shell:</span> bash 5.1.16</p>
                <p><span class="text-[#3584e4] font-bold">Location:</span> Santa Cruz, Bolivia</p>
                <p><span class="text-[#3584e4] font-bold">Email:</span> sd8587793@email.com</p>
            </div>
        </div>`;
        const div = document.createElement('div');
        div.innerHTML = html;
        this.output.appendChild(div);
    }

    scrollToBottom() {
        const content = document.getElementById('terminal-content');
        if(content) content.scrollTop = content.scrollHeight;
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
}

// Initialize the OS
window.app = new LinuxOS();
window.terminal = new TerminalParser();