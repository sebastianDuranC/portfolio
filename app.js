class LinuxOS {
    constructor() {
        this.windows = document.querySelectorAll('.os-window');
        this.highestZIndex = 100;
        this.openWindows = new Set();
        this.snapPreview = document.getElementById('snap-preview');
        this.terminal = new Terminal(this);
        
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

            header.addEventListener('mousedown', dragStart);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);

            function dragStart(e) {
                // Don't drag if maximizing/closing buttons are clicked
                if(e.target.closest('button')) return;

                // Don't drag if maximized
                if(win.classList.contains('maximized')) return;

                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;
                }
            }

            const self = this;
            function drag(e) {
                if (isDragging) {
                    e.preventDefault();

                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;

                    xOffset = currentX;
                    yOffset = currentY;

                    setTranslate(currentX, currentY, win);

                    // Aero snap preview
                    if (e.clientY < 30) { // Near top edge
                        self.snapPreview.classList.remove('hidden');
                        self.snapPreview.classList.add('active');
                    } else {
                        self.snapPreview.classList.add('hidden');
                        self.snapPreview.classList.remove('active');
                    }
                }
            }

            function setTranslate(xPos, yPos, el) {
                el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
            }

            function dragEnd(e) {
                initialX = currentX;
                initialY = currentY;
                isDragging = false;

                // Trigger Aero snap
                if (self.snapPreview && self.snapPreview.classList.contains('active')) {
                    self.snapPreview.classList.add('hidden');
                    self.snapPreview.classList.remove('active');
                    self.maximizeWindow(win.dataset.id);
                }
            }
        }.bind(this));
    }

    setupResizableWindows() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let originalWidth = 0;
            let originalHeight = 0;
            let originalX = 0;
            let originalY = 0;
            let originalMouseX = 0;
            let originalMouseY = 0;
            let isResizing = false;
            let currentResizer = null;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    if(win.classList.contains('maximized')) return;
                    isResizing = true;
                    currentResizer = resizer;
                    originalWidth = parseFloat(getComputedStyle(win, null).getPropertyValue('width').replace('px', ''));
                    originalHeight = parseFloat(getComputedStyle(win, null).getPropertyValue('height').replace('px', ''));
                    originalX = win.getBoundingClientRect().left;
                    originalY = win.getBoundingClientRect().top;
                    originalMouseX = e.pageX;
                    originalMouseY = e.pageY;
                    e.preventDefault();
                    window.addEventListener('mousemove', resize);
                    window.addEventListener('mouseup', stopResize);
                });
            });

            function resize(e) {
                if (!isResizing) return;

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
            }

            function stopResize() {
                isResizing = false;
                window.removeEventListener('mousemove', resize);
                window.removeEventListener('mouseup', stopResize);
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

class Terminal {
    constructor(os) {
        this.os = os;
        this.input = document.getElementById('terminal-input');
        this.output = document.getElementById('terminal-output');
        this.history = [];
        this.historyIndex = -1;
        this.setupInput();
        this.printWelcomeMessage();
    }

    setupInput() {
        if (!this.input) return;
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = this.input.value.trim();
                this.processCommand(command);
                this.input.value = '';
                // Scroll to bottom
                const content = document.getElementById('terminal-content');
                if (content) content.scrollTop = content.scrollHeight;
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (this.history.length > 0 && this.historyIndex < this.history.length - 1) {
                    this.historyIndex++;
                    this.input.value = this.history[this.history.length - 1 - this.historyIndex];
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (this.historyIndex > 0) {
                    this.historyIndex--;
                    this.input.value = this.history[this.history.length - 1 - this.historyIndex];
                } else if (this.historyIndex === 0) {
                    this.historyIndex = -1;
                    this.input.value = '';
                }
            }
        });
    }

    echo(command) {
        const line = document.createElement('div');
        line.className = 'mb-2';

        const promptUser = document.createElement('span');
        promptUser.className = 'text-green-400 font-bold';
        promptUser.textContent = 'sebastian@ubuntu';

        const promptColon = document.createTextNode(':');

        const promptDir = document.createElement('span');
        promptDir.className = 'text-blue-400 font-bold';
        promptDir.textContent = '~';

        const promptEnd = document.createTextNode('$ ');

        const cmdText = document.createElement('span');
        cmdText.textContent = command;

        line.appendChild(promptUser);
        line.appendChild(promptColon);
        line.appendChild(promptDir);
        line.appendChild(promptEnd);
        line.appendChild(cmdText);

        this.output.appendChild(line);
    }

    printHTML(htmlString) {
        const div = document.createElement('div');
        div.innerHTML = htmlString; // We use this for our controlled predefined HTML blocks
        this.output.appendChild(div);
    }

    printText(text) {
        const p = document.createElement('p');
        p.className = 'text-gray-100 mb-4';
        p.textContent = text;
        this.output.appendChild(p);
    }

    printWelcomeMessage() {
        this.printText('Type "help" to see available commands.');
        this.processCommand('neofetch', false);
    }

    processCommand(command, shouldEcho = true) {
        if (shouldEcho && command) {
            this.echo(command);
            this.history.push(command);
            this.historyIndex = -1;
        }

        const args = command.split(' ').filter(Boolean);
        const cmd = args[0]?.toLowerCase();

        if (!cmd) return;

        switch (cmd) {
            case 'help':
                this.printHTML(`
                    <div class="text-gray-100 mb-4 ml-4">
                        <p><span class="text-yellow-400 font-bold">whoami</span>   - Print current user</p>
                        <p><span class="text-yellow-400 font-bold">neofetch</span> - Show system information</p>
                        <p><span class="text-yellow-400 font-bold">clear</span>    - Clear the terminal screen</p>
                        <p><span class="text-yellow-400 font-bold">ls</span>       - List directory contents</p>
                        <p><span class="text-yellow-400 font-bold">cat</span>      - Read a file</p>
                        <p><span class="text-yellow-400 font-bold">open</span>     - Open an application (e.g. open projects)</p>
                    </div>
                `);
                break;
            case 'whoami':
                this.printText('Sebastian Duran Caballero');
                break;
            case 'clear':
                this.output.innerHTML = '';
                break;
            case 'ls':
                this.printHTML(`
                    <div class="flex space-x-4 text-blue-400 font-bold mb-4">
                        <span>Projects/</span>
                        <span>Skills/</span>
                        <span>Contact/</span>
                        <span class="text-gray-200 font-normal">description.txt</span>
                    </div>
                `);
                break;
            case 'cat':
                if (args[1] === 'description.txt') {
                    this.printText('Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.');
                } else if (!args[1]) {
                    this.printText('cat: missing file operand');
                } else {
                    this.printText(\`cat: \${args[1]}: No such file or directory\`);
                }
                break;
            case 'neofetch':
                this.printHTML(`
                    <div class="flex flex-col md:flex-row text-gray-100 mb-4">
                        <div class="mr-6 mb-4 md:mb-0 text-[#e95420] text-xs sm:text-sm font-bold">
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
                            <p><span class="text-[#e95420] font-bold">OS:</span> Ubuntu 22.04 LTS x86_64</p>
                            <p><span class="text-[#e95420] font-bold">Host:</span> Desarrollador Web</p>
                            <p><span class="text-[#e95420] font-bold">Uptime:</span> 24/7 coding</p>
                            <p><span class="text-[#e95420] font-bold">Packages:</span> HTML, CSS, JS, .NET, C#</p>
                            <p><span class="text-[#e95420] font-bold">Shell:</span> bash 5.1.16</p>
                            <p><span class="text-[#e95420] font-bold">Location:</span> Santa Cruz, Bolivia</p>
                            <p><span class="text-[#e95420] font-bold">Email:</span> sd8587793@email.com</p>
                        </div>
                    </div>
                `);
                break;
            case 'open':
                const app = args[1]?.toLowerCase();
                if (['projects', 'skills', 'contact'].includes(app)) {
                    this.printText(\`Opening \${app}...\`);
                    this.os.openWindow(app);
                } else if (!app) {
                    this.printText('open: missing application name');
                } else {
                    this.printText(\`open: \${app}: Application not found\`);
                }
                break;
            default:
                this.printText(\`\${cmd}: command not found\`);
        }
    }
}

// Initialize the OS
const app = new LinuxOS();