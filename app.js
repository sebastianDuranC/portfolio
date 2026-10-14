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


    setupResizers() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer;
            let originalWidth = 0;
            let originalHeight = 0;
            let originalMouseX = 0;
            let originalMouseY = 0;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    isResizing = true;
                    currentResizer = resizer;
                    originalWidth = parseFloat(getComputedStyle(win, null).getPropertyValue('width').replace('px', ''));
                    originalHeight = parseFloat(getComputedStyle(win, null).getPropertyValue('height').replace('px', ''));
                    originalMouseX = e.pageX;
                    originalMouseY = e.pageY;
                    e.preventDefault();

                    document.addEventListener('mousemove', resize);
                    document.addEventListener('mouseup', stopResize);
                });
            });

            const resize = (e) => {
                if (!isResizing) return;

                if (currentResizer.classList.contains('bottom-right')) {
                    const width = originalWidth + (e.pageX - originalMouseX);
                    const height = originalHeight + (e.pageY - originalMouseY);
                    win.style.width = `${width}px`;
                    win.style.height = `${height}px`;
                } else if (currentResizer.classList.contains('bottom')) {
                    const height = originalHeight + (e.pageY - originalMouseY);
                    win.style.height = `${height}px`;
                } else if (currentResizer.classList.contains('right')) {
                    const width = originalWidth + (e.pageX - originalMouseX);
                    win.style.width = `${width}px`;
                }
            };

            const stopResize = () => {
                isResizing = false;
                document.removeEventListener('mousemove', resize);
                document.removeEventListener('mouseup', stopResize);
            };
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
                    // Restore from maximized when dragging starts
                    win.classList.remove('maximized');
                    win.style.transform = 'none';

                    // Recalculate offsets to prevent jumping
                    const rect = win.getBoundingClientRect();
                    // Assume new width will be standard width, so center window around mouse
                    const targetLeft = e.clientX - (win.offsetWidth / 2);
                    const targetTop = e.clientY - (header.offsetHeight / 2);

                    xOffset = targetLeft - rect.left;
                    yOffset = targetTop - rect.top;
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

                    win.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
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

class TerminalParser {
    constructor() {
        this.input = document.getElementById('terminal-input');
        this.output = document.getElementById('terminal-output');
        this.history = [];
        this.historyIndex = -1;

        if(this.input) {
            this.input.addEventListener('keydown', (e) => this.handleInput(e));
        }

        this.initText();
    }

    initText() {
        if(!this.output) return;
        this.output.innerHTML = '';
        this.echo('whoami', 'cmd');
        this.echo('Sebastian Duran Caballero');
        this.echo('');

        this.echo('cat description.txt', 'cmd');
        this.echo('Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.');
        this.echo('');

        this.echo('neofetch', 'cmd');
        this.echoNeofetch();
    }

    handleInput(e) {
        if (e.key === 'Enter') {
            const cmd = this.input.value.trim();
            this.input.value = '';

            if (cmd) {
                this.history.push(cmd);
                this.historyIndex = this.history.length;
                this.echo(cmd, 'cmd');
                this.processCommand(cmd);
            } else {
                this.echo('', 'cmd');
            }

            // Scroll to bottom
            const container = document.querySelector('#window-terminal .window-content');
            container.scrollTop = container.scrollHeight;
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (this.historyIndex > 0) {
                this.historyIndex--;
                this.input.value = this.history[this.historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (this.historyIndex < this.history.length - 1) {
                this.historyIndex++;
                this.input.value = this.history[this.historyIndex];
            } else {
                this.historyIndex = this.history.length;
                this.input.value = '';
            }
        }
    }

    echo(text, type = 'text') {
        if (!this.output) return;
        const line = document.createElement('div');
        if (type === 'cmd') {
            line.innerHTML = `<span class="text-green-400 font-bold">sebastian@adwaita</span>:<span class="text-blue-400 font-bold">~</span>$ ${this.escapeHTML(text)}`;
        } else {
            line.textContent = text;
        }
        this.output.appendChild(line);
    }

    escapeHTML(str) {
        return str.replace(/[&<>'"]/g, tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag));
    }

    echoNeofetch() {
        const neo = document.createElement('div');
        neo.className = 'flex flex-col md:flex-row mb-4';

        // Use exact HTML format that we replaced the backslash
        neo.innerHTML = `
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
                <p><span class="text-[#3584e4] font-bold">OS:</span> GNOME OS x86_64</p>
                <p><span class="text-[#3584e4] font-bold">Host:</span> Desarrollador Web</p>
                <p><span class="text-[#3584e4] font-bold">Uptime:</span> 24/7 coding</p>
                <p><span class="text-[#3584e4] font-bold">Packages:</span> HTML, CSS, JS, .NET, C#</p>
                <p><span class="text-[#3584e4] font-bold">Shell:</span> bash 5.1.16</p>
                <p><span class="text-[#3584e4] font-bold">Theme:</span> Adwaita-dark [GTK3/4]</p>
                <p><span class="text-[#3584e4] font-bold">Location:</span> Santa Cruz, Bolivia</p>
                <p><span class="text-[#3584e4] font-bold">Email:</span> sd8587793@email.com</p>
            </div>
        `;
        this.output.appendChild(neo);
    }

    processCommand(cmdStr) {
        const args = cmdStr.split(' ');
        const cmd = args[0].toLowerCase();

        switch (cmd) {
            case 'help':
                this.echo('Available commands:');
                this.echo('  help      - Show this help message');
                this.echo('  whoami    - Print current user info');
                this.echo('  clear     - Clear the terminal screen');
                this.echo('  ls        - List directory contents');
                this.echo('  neofetch  - System information');
                this.echo('  cat       - Print file contents');
                this.echo('  open      - Open a window (e.g. open projects)');
                break;
            case 'whoami':
                this.echo('Sebastian Duran Caballero');
                break;
            case 'clear':
                this.output.innerHTML = '';
                break;
            case 'ls':
                this.echo('description.txt  projects/  skills/  contact/');
                break;
            case 'neofetch':
                this.echoNeofetch();
                break;
            case 'cat':
                if (args[1] === 'description.txt') {
                    this.echo('Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.');
                } else {
                    this.echo(`cat: ${this.escapeHTML(args[1] || '')}: No such file or directory`);
                }
                break;
            case 'open':
                if (args[1]) {
                    if (['projects', 'skills', 'contact'].includes(args[1])) {
                        if(window.app) window.app.openWindow(args[1]);
                        this.echo(`Opening ${args[1]}...`);
                    } else {
                        this.echo(`App not found: ${this.escapeHTML(args[1])}`);
                    }
                } else {
                    this.echo('Usage: open <app_name>');
                }
                break;
            default:
                this.echo(`Command not found: ${this.escapeHTML(cmd)}`);
                break;
        }
    }
}


// Init parser
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        window.terminalParser = new TerminalParser();
        console.log("TerminalParser initialized. Output exists?", !!document.getElementById('terminal-output'));
    }, 100);
});
