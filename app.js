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
        this.setupWindowResizing();
        this.setupWindowClickToFront();
        this.setupLogin();
        this.setupTerminal();
    }

    setupTerminal() {
        this.terminalInput = document.getElementById('terminal-input');
        this.terminalOutput = document.getElementById('terminal-output');

        if (!this.terminalInput || !this.terminalOutput) return;

        // Pre-populate output
        this.executeCommand('whoami', false);
        this.executeCommand('cat description.txt', false);
        this.executeCommand('neofetch', false);

        this.terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = this.terminalInput.value.trim();
                this.executeCommand(command, true);
                this.terminalInput.value = '';

                // Scroll to bottom
                const terminalContent = document.getElementById('terminal-content');
                if (terminalContent) {
                    terminalContent.scrollTop = terminalContent.scrollHeight;
                }
            }
        });
    }

    executeCommand(command, echo = true) {
        if (echo) {
            const promptLine = document.createElement('p');
            promptLine.className = 'mb-2';
            promptLine.innerHTML = `<span class="text-green-400 font-bold">sebastian@ubuntu</span>:<span class="text-blue-400 font-bold">~</span>$ ${this.escapeHTML(command)}`;
            this.terminalOutput.appendChild(promptLine);
        } else {
             const promptLine = document.createElement('p');
             promptLine.className = 'mb-2';
             promptLine.innerHTML = `<span class="text-green-400 font-bold">sebastian@ubuntu</span>:<span class="text-blue-400 font-bold">~</span>$ ${command}`;
             this.terminalOutput.appendChild(promptLine);
        }

        if (!command) return;

        const args = command.split(' ');
        const cmd = args[0].toLowerCase();

        const responseDiv = document.createElement('div');
        responseDiv.className = 'text-gray-100 mb-4';

        switch (cmd) {
            case 'help':
                responseDiv.innerHTML = `
                    <p>Available commands:</p>
                    <ul class="list-disc list-inside ml-4 mt-2">
                        <li><span class="text-green-400">help</span> - Show this message</li>
                        <li><span class="text-green-400">whoami</span> - Display current user</li>
                        <li><span class="text-green-400">clear</span> - Clear terminal output</li>
                        <li><span class="text-green-400">ls</span> - List directory contents</li>
                        <li><span class="text-green-400">neofetch</span> - Display system information</li>
                        <li><span class="text-green-400">cat &lt;file&gt;</span> - Read file content</li>
                        <li><span class="text-green-400">open &lt;app&gt;</span> - Open an application (projects, skills, contact)</li>
                    </ul>
                `;
                break;
            case 'whoami':
                responseDiv.textContent = 'Sebastian Duran Caballero';
                break;
            case 'clear':
                this.terminalOutput.innerHTML = '';
                return; // Don't append empty response
            case 'ls':
                responseDiv.innerHTML = `
                    <div class="flex space-x-4 text-blue-400 font-bold">
                        <span>projects/</span>
                        <span>skills/</span>
                        <span>contact/</span>
                    </div>
                    <div class="flex space-x-4 mt-1">
                        <span>description.txt</span>
                    </div>
                `;
                break;
            case 'neofetch':
                responseDiv.innerHTML = `
                    <div class="flex flex-col md:flex-row text-gray-100">
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
                `;
                break;
            case 'cat':
                if (args[1] === 'description.txt') {
                    responseDiv.textContent = 'Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.';
                } else if (args[1]) {
                    responseDiv.textContent = `cat: ${args[1]}: No such file or directory`;
                } else {
                    responseDiv.textContent = 'cat: missing operand';
                }
                break;
            case 'open':
                const app = args[1];
                if (['projects', 'skills', 'contact'].includes(app)) {
                    this.openWindow(app);
                    responseDiv.textContent = `Opening ${app}...`;
                } else if (app) {
                    responseDiv.textContent = `open: ${app}: Application not found`;
                } else {
                    responseDiv.textContent = 'open: missing application name';
                }
                break;
            default:
                responseDiv.innerHTML = `${this.escapeHTML(cmd)}: command not found. Type <span class="text-green-400">'help'</span> to see available commands.`;
        }

        this.terminalOutput.appendChild(responseDiv);
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

    setupWindowResizing() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer;
            let startX, startY, startWidth, startHeight;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    if (win.classList.contains('maximized')) return;
                    e.preventDefault();
                    isResizing = true;
                    currentResizer = e.target;
                    startX = e.clientX;
                    startY = e.clientY;
                    startWidth = win.offsetWidth;
                    startHeight = win.offsetHeight;
                    this.bringToFront(win);
                });
            });

            document.addEventListener('mousemove', (e) => {
                if (!isResizing) return;

                if (currentResizer.classList.contains('resizer-r') || currentResizer.classList.contains('resizer-br')) {
                    win.style.width = startWidth + (e.clientX - startX) + 'px';
                }
                if (currentResizer.classList.contains('resizer-b') || currentResizer.classList.contains('resizer-br')) {
                    win.style.height = startHeight + (e.clientY - startY) + 'px';
                }
            });

            document.addEventListener('mouseup', () => {
                isResizing = false;
            });
        });
    }

    setupDraggableWindows() {
        const snapPreview = document.getElementById('snap-preview');

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
            document.addEventListener('mousemove', drag.bind(this));
            document.addEventListener('mouseup', dragEnd.bind(this));

            function dragStart(e) {
                if(e.target.closest('button')) return;

                if (win.classList.contains('maximized')) {
                    // Start dragging from maximized state
                    win.classList.remove('maximized');
                    win.style.transform = 'none';

                    const rect = win.getBoundingClientRect();
                    xOffset = rect.left;
                    yOffset = 28; // Keep it slightly below top bar initially

                    // Center the window slightly relative to mouse X if possible, or just use mouse offset
                    const mouseRatio = e.clientX / window.innerWidth;
                    xOffset = e.clientX - (win.offsetWidth * mouseRatio);

                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;

                    setTranslate(xOffset, yOffset, win);
                } else {
                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;
                }

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;
                    this.bringToFront(win);
                }
            }

            function drag(e) {
                if (isDragging) {
                    e.preventDefault();

                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;

                    xOffset = currentX;
                    yOffset = currentY;

                    // Don't drag above the top bar (28px)
                    if (yOffset < 28) yOffset = 28;

                    setTranslate(currentX, yOffset, win);

                    // Aero snap preview
                    if (e.clientY <= 28) {
                        snapPreview.classList.add('show');
                    } else {
                        snapPreview.classList.remove('show');
                    }
                }
            }

            function setTranslate(xPos, yPos, el) {
                el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
            }

            function dragEnd(e) {
                if (!isDragging) return;

                initialX = currentX;
                initialY = currentY;
                isDragging = false;

                // Perform Aero Snap if dropped near top edge
                if (e.clientY <= 28) {
                    snapPreview.classList.remove('show');
                    this.maximizeWindow(win.dataset.id);
                }
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
const app = new LinuxOS();