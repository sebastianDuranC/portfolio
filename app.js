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

            // For resizing
            let isResizing = false;
            let currentResizer;
            let originalWidth = 0;
            let originalHeight = 0;
            let originalX = 0;
            let originalY = 0;
            let originalMouseX = 0;
            let originalMouseY = 0;

            // Resize listeners
            const resizers = win.querySelectorAll('.resizer');
            for (let resizer of resizers) {
                resizer.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    isResizing = true;
                    currentResizer = resizer;
                    originalWidth = parseFloat(getComputedStyle(win, null).getPropertyValue('width').replace('px', ''));
                    originalHeight = parseFloat(getComputedStyle(win, null).getPropertyValue('height').replace('px', ''));
                    originalX = win.getBoundingClientRect().left;
                    originalY = win.getBoundingClientRect().top;
                    originalMouseX = e.pageX;
                    originalMouseY = e.pageY;

                    document.addEventListener('mousemove', resize);
                    document.addEventListener('mouseup', stopResize);
                });
            }

            const resize = (e) => {
                if (!isResizing) return;

                if (currentResizer.classList.contains('bottom-right')) {
                    const width = originalWidth + (e.pageX - originalMouseX);
                    const height = originalHeight + (e.pageY - originalMouseY);
                    if (width > 300) win.style.width = width + 'px';
                    if (height > 200) win.style.height = height + 'px';
                } else if (currentResizer.classList.contains('bottom')) {
                    const height = originalHeight + (e.pageY - originalMouseY);
                    if (height > 200) win.style.height = height + 'px';
                } else if (currentResizer.classList.contains('right')) {
                    const width = originalWidth + (e.pageX - originalMouseX);
                    if (width > 300) win.style.width = width + 'px';
                }
            };

            const stopResize = () => {
                isResizing = false;
                document.removeEventListener('mousemove', resize);
                document.removeEventListener('mouseup', stopResize);
            };

            const dragStart = (e) => {
                // Don't drag if maximizing/closing buttons are clicked
                if(e.target.closest('button')) return;

                // If maximized, restore and start dragging
                if(win.classList.contains('maximized')) {
                    const rect = win.getBoundingClientRect();
                    win.classList.remove('maximized');
                    win.style.transform = 'none';
                    // Re-calculate offset based on where mouse is relative to natural element position
                    const unmaximizedRect = win.getBoundingClientRect();
                    xOffset = rect.left - unmaximizedRect.left;
                    // For aero-snap, just align under mouse, simplify xOffset
                    xOffset = e.clientX - unmaximizedRect.left - (unmaximizedRect.width / 2);
                    yOffset = 0;

                    win.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0)`;
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

                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;

                    xOffset = currentX;
                    yOffset = currentY;

                    setTranslate(currentX, currentY, win);

                    // Aero snap preview (optional enhancement, skipping for now, just snap on drop)
                }
            };

            const setTranslate = (xPos, yPos, el) => {
                el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
            };

            const dragEnd = (e) => {
                initialX = currentX;
                initialY = currentY;
                isDragging = false;

                // Aero snap to top
                if (e.clientY <= 28) {
                    // Check if not already maximized
                    if (!win.classList.contains('maximized')) {
                         this.maximizeWindow(win.dataset.id);
                    }
                }
            };

            header.addEventListener('mousedown', dragStart);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);
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

        this.init();
    }

    init() {
        // Pre-populate
        this.printLine('whoami', 'Sebastian Duran Caballero');
        this.printLine('cat description.txt', 'Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.');
        this.printNeofetch();

        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = this.input.value.trim();
                this.input.value = '';
                this.processCommand(cmd);
            }
        });
    }

    printCommandEcho(cmd) {
        const line = document.createElement('div');
        line.innerHTML = `<span class="text-green-400 font-bold">sebastian@adwaita</span><span class="text-white">:</span><span class="text-adwaita-blue font-bold">~</span><span class="text-white">$ </span><span>${this.escapeHtml(cmd)}</span>`;
        this.output.appendChild(line);
    }

    printLine(cmd, response) {
        this.printCommandEcho(cmd);
        const res = document.createElement('div');
        res.className = 'text-gray-100 mb-4';
        res.textContent = response;
        this.output.appendChild(res);
        this.scrollToBottom();
    }

    printHTML(cmd, htmlContent) {
        this.printCommandEcho(cmd);
        const res = document.createElement('div');
        res.className = 'text-gray-100 mb-4';
        res.innerHTML = htmlContent;
        this.output.appendChild(res);
        this.scrollToBottom();
    }

    printNeofetch() {
        const ascii = `
       _,-/\\--,-/\\-,
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
`;

        const html = `
        <div class="flex flex-col md:flex-row text-gray-100 mb-4 mt-2">
            <div class="mr-6 mb-4 md:mb-0 text-adwaita-blue text-xs sm:text-sm font-bold">
<pre>${ascii}</pre>
            </div>
            <div>
                <p><span class="text-adwaita-blue font-bold">OS:</span> GNOME OS</p>
                <p><span class="text-adwaita-blue font-bold">Host:</span> Desarrollador Web</p>
                <p><span class="text-adwaita-blue font-bold">Uptime:</span> 24/7 coding</p>
                <p><span class="text-adwaita-blue font-bold">Packages:</span> HTML, CSS, JS, .NET, C#</p>
                <p><span class="text-adwaita-blue font-bold">Shell:</span> bash 5.1.16</p>
                <p><span class="text-adwaita-blue font-bold">Location:</span> Santa Cruz, Bolivia</p>
                <p><span class="text-adwaita-blue font-bold">Email:</span> sd8587793@email.com</p>
            </div>
        </div>`;

        this.printHTML('neofetch', html);
    }

    escapeHtml(unsafe) {
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }

    scrollToBottom() {
        this.output.parentElement.scrollTop = this.output.parentElement.scrollHeight;
    }

    processCommand(cmd) {
        if (!cmd) return;

        const args = cmd.split(' ').filter(Boolean);
        const main = args[0].toLowerCase();

        switch (main) {
            case 'help':
                this.printLine(cmd, 'Available commands: help, whoami, clear, ls, neofetch, cat, open');
                break;
            case 'whoami':
                this.printLine(cmd, 'Sebastian Duran Caballero');
                break;
            case 'clear':
                this.output.innerHTML = '';
                break;
            case 'ls':
                this.printHTML(cmd, '<span class="text-adwaita-blue font-bold mr-4">projects/</span> <span class="text-adwaita-blue font-bold mr-4">skills/</span> <span class="text-white mr-4">description.txt</span>');
                break;
            case 'neofetch':
                this.printNeofetch();
                break;
            case 'cat':
                if (args[1] === 'description.txt') {
                    this.printLine(cmd, 'Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.');
                } else {
                    this.printLine(cmd, `cat: ${args[1] || ''}: No such file or directory`);
                }
                break;
            case 'open':
                if (args[1] === 'projects' || args[1] === 'skills' || args[1] === 'contact') {
                    this.printLine(cmd, `Opening ${args[1]}...`);
                    if(window.app) window.app.openWindow(args[1]);
                } else {
                    this.printLine(cmd, `open: invalid application '${args[1] || ''}'. Available: projects, skills, contact`);
                }
                break;
            default:
                this.printLine(cmd, `bash: ${main}: command not found`);
        }
    }
}

// Initialize the OS
const app = new LinuxOS();
window.app = app;
const terminal = new TerminalParser();