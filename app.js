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

    setupResizableWindows() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer = null;
            let originalWidth = 0;
            let originalHeight = 0;
            let originalX = 0;
            let originalY = 0;
            let originalMouseX = 0;
            let originalMouseY = 0;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    isResizing = true;
                    currentResizer = resizer;

                    const rect = win.getBoundingClientRect();
                    originalWidth = rect.width;
                    originalHeight = rect.height;

                    // Parse transform values
                    const style = window.getComputedStyle(win);
                    const matrix = new DOMMatrixReadOnly(style.transform);
                    originalX = matrix.m41;
                    originalY = matrix.m42;

                    originalMouseX = e.pageX;
                    originalMouseY = e.pageY;

                    window.addEventListener('mousemove', resize);
                    window.addEventListener('mouseup', stopResize);
                });
            });

            const resize = (e) => {
                if (!isResizing) return;

                if (win.classList.contains('maximized')) {
                    return; // Prevent resize when maximized
                }

                if (currentResizer.classList.contains('resizer-br')) {
                    const width = originalWidth + (e.pageX - originalMouseX);
                    const height = originalHeight + (e.pageY - originalMouseY);
                    if (width > 300) win.style.width = width + 'px';
                    if (height > 200) win.style.height = height + 'px';
                } else if (currentResizer.classList.contains('resizer-r')) {
                    const width = originalWidth + (e.pageX - originalMouseX);
                    if (width > 300) win.style.width = width + 'px';
                } else if (currentResizer.classList.contains('resizer-b')) {
                    const height = originalHeight + (e.pageY - originalMouseY);
                    if (height > 200) win.style.height = height + 'px';
                }
            };

            const stopResize = () => {
                isResizing = false;
                window.removeEventListener('mousemove', resize);
                window.removeEventListener('mouseup', stopResize);
            };
        });
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

            const dragStart = (e) => {
                if(e.target.closest('button')) return;

                if(win.classList.contains('maximized')) {
                    // Restore from maximized on drag
                    win.style.transform = 'none';
                    const targetLeft = e.clientX - (win.offsetWidth / 2);
                    const rectLeft = win.getBoundingClientRect().left;

                    xOffset = targetLeft - rectLeft;
                    yOffset = 0;

                    win.classList.remove('maximized');
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

                    // Aero snap visualization could go here

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

                // Aero snap action
                if (e.clientY <= 28) {
                    this.maximizeWindow(win.dataset.id);
                }
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
        this.prompt = `<span class="text-green-400 font-bold mr-2">sebastian@adwaita:</span><span class="text-blue-400 font-bold mr-2">~</span>$ `;

        if (this.input && this.output) {
            this.init();
        }
    }

    init() {
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = this.input.value.trim();
                this.input.value = '';
                this.processCommand(command);
            }
        });

        // Pre-populate output
        this.printLine(`${this.prompt}whoami`);
        this.printLine(`Sebastian Duran Caballero`);

        this.printLine(`${this.prompt}neofetch`);
        this.printNeofetch();
    }

    escapeHTML(str) {
        return str.replace(/[&<>'"]/g,
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag])
        );
    }

    printLine(html) {
        const line = document.createElement('div');
        line.className = 'mb-2';
        line.innerHTML = html;
        this.output.appendChild(line);
        this.scrollToBottom();
    }

    printNeofetch() {
        const neofetchHTML = `
        <div class="flex flex-col md:flex-row text-gray-100 mb-4 mt-2">
            <div class="mr-6 mb-4 md:mb-0 text-adwaita-blue text-xs sm:text-sm font-bold leading-none">
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
                <p><span class="text-adwaita-blue font-bold">OS:</span> Adwaita OS x86_64</p>
                <p><span class="text-adwaita-blue font-bold">Host:</span> Desarrollador Web</p>
                <p><span class="text-adwaita-blue font-bold">Uptime:</span> 24/7 coding</p>
                <p><span class="text-adwaita-blue font-bold">Packages:</span> HTML, CSS, JS, .NET, C#</p>
                <p><span class="text-adwaita-blue font-bold">Shell:</span> bash 5.1.16</p>
                <p><span class="text-adwaita-blue font-bold">Location:</span> Santa Cruz, Bolivia</p>
                <p><span class="text-adwaita-blue font-bold">Email:</span> sd8587793@email.com</p>
            </div>
        </div>`;
        this.printLine(neofetchHTML);
    }

    scrollToBottom() {
        const content = document.getElementById('terminal-content');
        if(content) content.scrollTop = content.scrollHeight;
    }

    processCommand(rawCommand) {
        if (!rawCommand) {
            this.printLine(`${this.prompt}`);
            return;
        }

        const safeCommand = this.escapeHTML(rawCommand);
        this.printLine(`${this.prompt}${safeCommand}`);

        const args = rawCommand.split(' ').filter(Boolean);
        const cmd = args[0].toLowerCase();

        switch (cmd) {
            case 'help':
                this.printLine(`Available commands:
                    <ul class="ml-4 mt-2">
                        <li><span class="text-adwaita-blue font-bold">whoami</span> - display current user</li>
                        <li><span class="text-adwaita-blue font-bold">neofetch</span> - display system information</li>
                        <li><span class="text-adwaita-blue font-bold">clear</span> - clear the terminal</li>
                        <li><span class="text-adwaita-blue font-bold">ls</span> - list directory contents</li>
                        <li><span class="text-adwaita-blue font-bold">cat [file]</span> - display file contents</li>
                        <li><span class="text-adwaita-blue font-bold">open [app]</span> - open a window (projects, skills, contact)</li>
                        <li><span class="text-adwaita-blue font-bold">help</span> - display this message</li>
                    </ul>`);
                break;
            case 'whoami':
                this.printLine(`Sebastian Duran Caballero`);
                break;
            case 'neofetch':
                this.printNeofetch();
                break;
            case 'clear':
                this.output.innerHTML = '';
                break;
            case 'ls':
                this.printLine(`<span class="text-adwaita-blue font-bold">projects/</span>  <span class="text-adwaita-blue font-bold">skills/</span>  <span class="text-adwaita-blue font-bold">contact/</span>  description.txt`);
                break;
            case 'cat':
                if (args[1] === 'description.txt') {
                    this.printLine(`Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.`);
                } else if (!args[1]) {
                    this.printLine(`cat: missing file operand`);
                } else {
                    this.printLine(`cat: ${this.escapeHTML(args[1])}: No such file or directory`);
                }
                break;
            case 'open':
                if (args[1] && ['projects', 'skills', 'contact'].includes(args[1].toLowerCase())) {
                    if (window.app) {
                        window.app.openWindow(args[1].toLowerCase());
                        this.printLine(`Opening ${args[1].toLowerCase()}...`);
                    }
                } else if (!args[1]) {
                    this.printLine(`open: missing application name`);
                } else {
                    this.printLine(`open: application '${this.escapeHTML(args[1])}' not found`);
                }
                break;
            default:
                this.printLine(`${cmd}: command not found. Type 'help' for available commands.`);
        }
    }
}

// Initialize the OS
const app = new LinuxOS();
window.app = app;
new TerminalParser();