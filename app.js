class TerminalParser {
    constructor(os) {
        this.os = os;
        this.output = document.getElementById('terminal-output');
        this.input = document.getElementById('terminal-input');

        if (this.input) {
            this.input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const command = this.input.value.trim();
                    this.executeCommand(command);
                    this.input.value = '';
                }
            });

            // Re-focus input when clicking terminal content
            const content = document.querySelector('#window-terminal .window-content');
            if(content) {
                content.addEventListener('click', () => this.input.focus());
            }
        }
    }

    printLine(html, isCommand = false) {
        if(!this.output) return;
        const line = document.createElement('div');
        line.className = isCommand ? 'mb-2' : 'mb-4 text-gray-100';
        // Only use innerHTML for known safe formatted templates, use textContent for user input echoing
        line.innerHTML = html;
        this.output.appendChild(line);
        this.output.parentElement.scrollTop = this.output.parentElement.scrollHeight;
    }

    printText(text) {
        if(!this.output) return;
        const line = document.createElement('div');
        line.className = 'mb-4 text-gray-100';
        line.textContent = text;
        this.output.appendChild(line);
        this.output.parentElement.scrollTop = this.output.parentElement.scrollHeight;
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

    executeCommand(cmd) {
        if(!cmd) {
            this.printLine(`<span class="text-green-400 font-bold">sebastian@adwaita</span>:<span class="text-adwaita-blue font-bold">~</span>$ `);
            return;
        }

        const escapedCmd = this.escapeHTML(cmd);
        this.printLine(`<span class="text-green-400 font-bold">sebastian@adwaita</span>:<span class="text-adwaita-blue font-bold">~</span>$ ${escapedCmd}`, true);

        const args = cmd.split(' ');
        const command = args[0].toLowerCase();

        switch(command) {
            case 'help':
                this.printLine('Available commands: help, whoami, clear, ls, neofetch, cat [file], open [app]');
                break;
            case 'whoami':
                this.printLine('Sebastian Duran Caballero');
                break;
            case 'clear':
                this.output.innerHTML = '';
                break;
            case 'ls':
                this.printLine('description.txt<br>projects/<br>skills/<br>contact/');
                break;
            case 'neofetch':
                this.printLine(`
                    <div class="flex flex-col md:flex-row text-gray-100 mb-4">
                        <div class="mr-6 mb-4 md:mb-0 text-[#3584e4] text-xs sm:text-sm font-bold">
<pre>
       _,-/\`--,-/\\-,
     ,' /   ,-'   ) \
   ,'  |  ,'     /   \
  /    | /      /     \
 /      /      /      |
|      /      /       |
|      |     /        |
|      |    /         |
 \     |   /         /
  \    |  /         /
   \`.  | /        ,'
     \`./'      ,-'
       \`-----'
</pre>
                        </div>
                        <div>
                            <p><span class="text-[#3584e4] font-bold">OS:</span> Adwaita OS x86_64</p>
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
            case 'cat':
                if (args[1] === 'description.txt') {
                    this.printLine('Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.');
                } else if(args[1]) {
                    this.printText(`cat: ${args[1]}: No such file or directory`);
                } else {
                    this.printLine('Usage: cat [file]');
                }
                break;
            case 'open':
                if(args[1] && ['terminal', 'projects', 'skills', 'contact'].includes(args[1])) {
                    this.os.openWindow(args[1]);
                    this.printLine(`Opening ${args[1]}...`);
                } else {
                    this.printLine('Usage: open [terminal|projects|skills|contact]');
                }
                break;
            default:
                this.printText(`${command}: command not found`);
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
        this.setupResizableWindows();
        this.setupWindowClickToFront();
        this.setupLogin();
        this.terminal = new TerminalParser(this);
        this.terminal.executeCommand('whoami');
        this.terminal.executeCommand('neofetch');
        this.terminal.executeCommand('');
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


    setupResizableWindows() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer;
            let originalWidth = 0;
            let originalHeight = 0;
            let originalX = 0;
            let originalY = 0;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    if (win.classList.contains('maximized')) return;
                    e.preventDefault();
                    isResizing = true;
                    currentResizer = resizer;
                    originalWidth = parseFloat(getComputedStyle(win, null).getPropertyValue('width').replace('px', ''));
                    originalHeight = parseFloat(getComputedStyle(win, null).getPropertyValue('height').replace('px', ''));
                    originalX = e.clientX;
                    originalY = e.clientY;

                    document.addEventListener('mousemove', resize);
                    document.addEventListener('mouseup', stopResize);
                    this.bringToFront(win);
                });
            });

            const resize = (e) => {
                if (!isResizing) return;
                if (currentResizer.classList.contains('right')) {
                    const width = originalWidth + (e.clientX - originalX);
                    win.style.width = width + 'px';
                } else if (currentResizer.classList.contains('bottom')) {
                    const height = originalHeight + (e.clientY - originalY);
                    win.style.height = height + 'px';
                } else if (currentResizer.classList.contains('bottom-right')) {
                    const width = originalWidth + (e.clientX - originalX);
                    const height = originalHeight + (e.clientY - originalY);
                    win.style.width = width + 'px';
                    win.style.height = height + 'px';
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

            header.addEventListener('mousedown', dragStart);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);

            const dragStart = (e) => {
                if(e.target.closest('button')) return;

                // If maximized, we restore it to normal size and drag it
                if(win.classList.contains('maximized')) {
                    this.maximizeWindow(win.dataset.id || win.id.replace('window-', ''));
                    // We need to recalculate offsets because position just jumped
                    const rect = win.getBoundingClientRect();
                    xOffset = e.clientX - rect.left;
                    yOffset = e.clientY - rect.top;
                    // Temporary set transform to none to prevent visual jumps while dragging
                    win.style.transform = 'none';
                }

                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;
                }
            }

            const drag = (e) => {
                if (isDragging) {
                    e.preventDefault();

                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;

                    xOffset = currentX;
                    yOffset = currentY;

                    setTranslate(currentX, currentY, win);
                }
            }

            const setTranslate = (xPos, yPos, el) => {
                el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
            }

            const dragEnd = (e) => {
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
}

// Initialize the OS
window.app = new LinuxOS();