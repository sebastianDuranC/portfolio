class LinuxOS {
    constructor() {
        this.windows = document.querySelectorAll('.os-window');
        this.highestZIndex = 100;
        this.openWindows = new Set();
        window.app = this;
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
            let currentResizer = null;
            let startX, startY, startWidth, startHeight;

            const resizeStart = (e) => {
                isResizing = true;
                currentResizer = e.target;
                startX = e.clientX;
                startY = e.clientY;
                const rect = win.getBoundingClientRect();
                startWidth = rect.width;
                startHeight = rect.height;
                this.bringToFront(win);
                e.preventDefault();
            };

            const resize = (e) => {
                if (!isResizing) return;

                if (currentResizer.classList.contains('resizer-r') || currentResizer.classList.contains('resizer-br')) {
                    const newWidth = startWidth + (e.clientX - startX);
                    win.style.width = `${newWidth}px`;
                }
                if (currentResizer.classList.contains('resizer-b') || currentResizer.classList.contains('resizer-br')) {
                    const newHeight = startHeight + (e.clientY - startY);
                    win.style.height = `${newHeight}px`;
                }
            };

            const resizeEnd = () => {
                isResizing = false;
                currentResizer = null;
            };

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', resizeStart);
            });
            document.addEventListener('mousemove', resize);
            document.addEventListener('mouseup', resizeEnd);
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
                if(e.target.classList.contains('resizer')) return;

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;

                    if(win.classList.contains('maximized')) {
                        // Restore from maximized while dragging
                        win.classList.remove('maximized');
                        win.style.transform = 'none';
                        const rect = win.getBoundingClientRect();

                        // Recalculate offsets based on where user clicked vs the new unmaximized position
                        xOffset = e.clientX - (rect.width / 2);
                        yOffset = e.clientY;

                        initialX = e.clientX - xOffset;
                        initialY = e.clientY - yOffset;
                        setTranslate(xOffset, yOffset, win);
                    } else {
                        initialX = e.clientX - xOffset;
                        initialY = e.clientY - yOffset;
                    }
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
                if(isDragging) {
                    initialX = currentX;
                    initialY = currentY;
                    isDragging = false;

                    // Aero snap to top
                    if(e.clientY <= 30) {
                        this.maximizeWindow(win.dataset.id);
                        xOffset = 0;
                        yOffset = 0;
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
        this.input = document.getElementById('terminal-input');
        this.output = document.getElementById('terminal-output');
        this.content = document.getElementById('terminal-content');

        if (!this.input || !this.output) return;

        // Initialize with default commands like neofetch
        this.populateInitialOutput();

        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = this.input.value.trim();
                if (cmd) {
                    this.executeCommand(cmd);
                } else {
                    // Just print empty prompt
                    const div = document.createElement('div');
                    div.innerHTML = `<span class="text-green-400 font-bold">sebastian@adwaita</span>:<span class="text-adwaita-blue font-bold">~</span>$ `;
                    this.output.appendChild(div);
                }
                this.input.value = '';
                this.scrollToBottom();
            }
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

    populateInitialOutput() {
        this.output.innerHTML = '';
        this.executeCommand('whoami', true);
        this.executeCommand('cat description.txt', true);
        this.executeCommand('neofetch', true);
    }

    printPrompt(cmd) {
        const div = document.createElement('div');
        div.className = 'mb-2';
        div.innerHTML = `<span class="text-green-400 font-bold">sebastian@adwaita</span>:<span class="text-adwaita-blue font-bold">~</span>$ ${this.escapeHTML(cmd)}`;
        this.output.appendChild(div);
    }

    executeCommand(cmd, isInit = false) {
        if(!isInit) this.printPrompt(cmd);

        const args = cmd.split(' ').filter(c => c);
        const mainCmd = args[0].toLowerCase();

        const responseDiv = document.createElement('div');
        responseDiv.className = 'text-gray-100 mb-4';

        switch (mainCmd) {
            case 'help':
                responseDiv.innerHTML = `
                    Available commands:<br>
                    - help: Show this message<br>
                    - whoami: Print current user<br>
                    - clear: Clear terminal output<br>
                    - ls: List files<br>
                    - neofetch: Show system information<br>
                    - cat &lt;file&gt;: Read file content<br>
                    - open &lt;app&gt;: Open application (e.g., open projects)
                `;
                break;
            case 'whoami':
                responseDiv.textContent = 'Sebastian Duran Caballero';
                break;
            case 'clear':
                this.output.innerHTML = '';
                return;
            case 'ls':
                responseDiv.innerHTML = 'description.txt&nbsp;&nbsp;&nbsp;projects/&nbsp;&nbsp;&nbsp;skills/';
                break;
            case 'neofetch':
                responseDiv.innerHTML = `
                    <div class="flex flex-col md:flex-row">
                        <div class="mr-6 mb-4 md:mb-0 text-adwaita-blue text-xs sm:text-sm font-bold">
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
                            <p><span class="text-adwaita-blue font-bold">OS:</span> GNOME Adwaita OS x86_64</p>
                            <p><span class="text-adwaita-blue font-bold">Host:</span> Desarrollador Web</p>
                            <p><span class="text-adwaita-blue font-bold">Uptime:</span> 24/7 coding</p>
                            <p><span class="text-adwaita-blue font-bold">Packages:</span> HTML, CSS, JS, .NET, C#</p>
                            <p><span class="text-adwaita-blue font-bold">Shell:</span> bash 5.1.16</p>
                            <p><span class="text-adwaita-blue font-bold">Location:</span> Santa Cruz, Bolivia</p>
                            <p><span class="text-adwaita-blue font-bold">Email:</span> sd8587793@email.com</p>
                        </div>
                    </div>
                `;
                break;
            case 'cat':
                if (args[1] === 'description.txt') {
                    responseDiv.textContent = 'Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.';
                } else {
                    responseDiv.textContent = \`cat: \${args[1] || ''}: No such file or directory\`;
                }
                break;
            case 'open':
                if(args[1] && ['projects', 'skills', 'contact'].includes(args[1])) {
                    if(window.app) {
                        window.app.openWindow(args[1]);
                        responseDiv.textContent = \`Opening \${args[1]}...\`;
                    }
                } else {
                    responseDiv.textContent = 'Available apps to open: projects, skills, contact';
                }
                break;
            default:
                responseDiv.textContent = \`\${mainCmd}: command not found\`;
        }

        this.output.appendChild(responseDiv);
        if(!isInit) this.scrollToBottom();
    }

    scrollToBottom() {
        if(this.content) {
            this.content.scrollTop = this.content.scrollHeight;
        }
    }
}

// Initialize the OS
const app = new LinuxOS();
const terminal = new TerminalParser();