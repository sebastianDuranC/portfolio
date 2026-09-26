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
        this.setupResizing();
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
        const desktop = document.getElementById('desktop');

        this.windows.forEach(win => {
            const header = win.querySelector('.window-header');
            if (!header) return;

            let isDragging = false;
            let initialX;
            let initialY;

            // Define offsets on the window element so they persist and can be updated
            win.xOffset = 0;
            win.yOffset = 0;

            header.addEventListener('mousedown', dragStart);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);

            const self = this;
            function dragStart(e) {
                if(e.target.closest('button')) return;

                // If maximizing via top drag is active (aero snap), we shouldn't drag, but this is handled by just dragging normally
                if(win.classList.contains('maximized')) {
                    // Start dragging from maximized state
                    win.classList.remove('maximized');
                    win.style.transform = 'none';

                    // Clear previous inline styling that might interfere
                    win.style.left = '';
                    win.style.top = '';

                    // Recalculate offsets based on where the mouse grabbed the header relative to the desktop container
                    const rect = win.getBoundingClientRect();
                    const desktopRect = desktop.getBoundingClientRect();
                    win.xOffset = rect.left - desktopRect.left;
                    win.yOffset = rect.top - desktopRect.top;

                    // Apply immediate position so it doesn't jump
                    setTranslate(win.xOffset, win.yOffset, win);
                }

                self.bringToFront(win);

                initialX = e.clientX - win.xOffset;
                initialY = e.clientY - win.yOffset;

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;
                }
            }

            function drag(e) {
                if (isDragging) {
                    e.preventDefault();

                    const currentX = e.clientX - initialX;
                    const currentY = e.clientY - initialY;

                    win.xOffset = currentX;
                    win.yOffset = currentY;

                    setTranslate(currentX, currentY, win);
                }
            }

            function setTranslate(xPos, yPos, el) {
                el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
            }

            function dragEnd(e) {
                isDragging = false;
            }
        });
    }

    setupResizing() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer;
            let startX, startY, startWidth, startHeight;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    isResizing = true;
                    currentResizer = resizer;
                    startX = e.clientX;
                    startY = e.clientY;
                    startWidth = parseInt(document.defaultView.getComputedStyle(win).width, 10);
                    startHeight = parseInt(document.defaultView.getComputedStyle(win).height, 10);

                    this.bringToFront(win);
                });
            });

            document.addEventListener('mousemove', (e) => {
                if (!isResizing) return;

                if (win.classList.contains('maximized')) return;

                if (currentResizer.classList.contains('resizer-r')) {
                    win.style.width = startWidth + (e.clientX - startX) + 'px';
                } else if (currentResizer.classList.contains('resizer-b')) {
                    win.style.height = startHeight + (e.clientY - startY) + 'px';
                } else if (currentResizer.classList.contains('resizer-br')) {
                    win.style.width = startWidth + (e.clientX - startX) + 'px';
                    win.style.height = startHeight + (e.clientY - startY) + 'px';
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
                win.dataset.prevTransform = win.style.transform;
                win.classList.add('maximized');
                win.style.transform = 'none';
            } else {
                win.classList.remove('maximized');
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

// Initialize the OS globally
window.app = new LinuxOS();
class TerminalParser {
    constructor() {
        this.input = document.getElementById('terminal-input');
        this.output = document.getElementById('terminal-output');
        this.prompt = '<span class="text-green-400 font-bold mr-2">sebastian@adwaita:~$</span>';

        if(this.input && this.output) {
            this.init();
        }
    }

    init() {
        // Pre-populate initial state
        this.printLine(this.prompt + 'whoami', true);
        this.printLine('Sebastian Duran Caballero');

        this.printLine(this.prompt + 'neofetch', true);
        this.printNeofetch();

        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = this.input.value.trim();
                this.input.value = '';
                this.executeCommand(command);
            }
        });

        // Keep focus on input when clicking terminal
        document.getElementById('window-terminal').addEventListener('click', () => {
            this.input.focus();
        });
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

    printLine(html, isHtml = false) {
        const div = document.createElement('div');
        div.className = 'mb-1';
        if(isHtml) {
            div.innerHTML = html;
        } else {
            div.textContent = html;
        }
        this.output.appendChild(div);
        this.scrollToBottom();
    }

    printError(text) {
        const div = document.createElement('div');
        div.className = 'mb-1 text-red-400';
        div.textContent = text;
        this.output.appendChild(div);
        this.scrollToBottom();
    }

    printNeofetch() {
        const neofetchHTML = `
        <div class="flex flex-col md:flex-row text-gray-100 mb-4 mt-2">
            <div class="mr-6 mb-4 md:mb-0 text-[#3584e4] text-xs sm:text-sm font-bold">
<pre>
       _,-/&#x60;--,-/\\-,
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
                <p><span class="text-[#3584e4] font-bold">OS:</span> GNOME OS (Adwaita)</p>
                <p><span class="text-[#3584e4] font-bold">Host:</span> Desarrollador Web</p>
                <p><span class="text-[#3584e4] font-bold">Uptime:</span> 24/7 coding</p>
                <p><span class="text-[#3584e4] font-bold">Packages:</span> HTML, CSS, JS, .NET, C#</p>
                <p><span class="text-[#3584e4] font-bold">Shell:</span> bash 5.1.16</p>
                <p><span class="text-[#3584e4] font-bold">Location:</span> Santa Cruz, Bolivia</p>
                <p><span class="text-[#3584e4] font-bold">Email:</span> sd8587793@email.com</p>
            </div>
        </div>`;
        this.printLine(neofetchHTML, true);
    }

    scrollToBottom() {
        const content = document.querySelector('#window-terminal .window-content');
        if(content) {
            content.scrollTop = content.scrollHeight;
        }
    }

    executeCommand(command) {
        // Echo command
        this.printLine(this.prompt + this.escapeHTML(command), true);

        if (!command) return;

        const args = command.split(' ').filter(Boolean);
        const cmd = args[0].toLowerCase();

        switch (cmd) {
            case 'help':
                this.printLine('Comandos disponibles: help, whoami, clear, ls, neofetch, cat, open');
                break;
            case 'whoami':
                this.printLine('Sebastian Duran Caballero');
                break;
            case 'clear':
                this.output.innerHTML = '';
                break;
            case 'ls':
                this.printLine('description.txt  projects/  skills/  contact/');
                break;
            case 'neofetch':
                this.printNeofetch();
                break;
            case 'cat':
                if (args[1] === 'description.txt') {
                    this.printLine('Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.');
                } else if(args[1]) {
                    this.printError(`cat: ${args[1]}: No such file or directory`);
                } else {
                    this.printError('cat: missing operand');
                }
                break;
            case 'open':
                if (args[1]) {
                    const validApps = ['projects', 'skills', 'contact', 'terminal'];
                    if (validApps.includes(args[1])) {
                        if(window.app) window.app.openWindow(args[1]);
                        this.printLine(`Opening ${args[1]}...`);
                    } else {
                        this.printError(`open: ${args[1]}: Application not found`);
                    }
                } else {
                    this.printError('open: missing operand');
                }
                break;
            default:
                this.printError(`bash: ${cmd}: command not found`);
        }
    }
}

// Initialize terminal parser
document.addEventListener('DOMContentLoaded', () => {
    window.terminalParser = new TerminalParser();
});
