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
        this.setupTerminal();
        this.setupResizableWindows();
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
        const snapPreview = document.getElementById('snap-preview');

        this.windows.forEach(win => {
            const header = win.querySelector('.window-header');
            if (!header) return;

            let isDragging = false;
            let initialX, initialY;
            let winLeft, winTop;

            const dragStart = (e) => {
                if (e.target.closest('button') || win.classList.contains('maximized')) return;

                isDragging = true;

                // Get the computed style or inline style values
                const rect = win.getBoundingClientRect();

                // Store initial mouse position
                initialX = e.clientX;
                initialY = e.clientY;

                // Store initial window position
                // We use getComputedStyle to handle % values and fixed positioning properly
                const style = window.getComputedStyle(win);
                winLeft = parseInt(style.left, 10);
                if (isNaN(winLeft)) winLeft = rect.left;
                winTop = parseInt(style.top, 10);
                if (isNaN(winTop)) winTop = rect.top;

                // Bring to front on drag start
                this.bringToFront(win);

                // Clear transforms and commit to left/top for easier dragging
                win.style.transform = 'none';
                win.style.left = `${winLeft}px`;
                win.style.top = `${winTop}px`;
            };

            const drag = (e) => {
                if (isDragging) {
                    e.preventDefault();

                    const dx = e.clientX - initialX;
                    const dy = e.clientY - initialY;

                    let newLeft = winLeft + dx;
                    let newTop = winTop + dy;

                    // Boundaries (Don't go under top bar (28px))
                    if (newTop < 28) newTop = 28;

                    win.style.left = `${newLeft}px`;
                    win.style.top = `${newTop}px`;

                    // Aero snap preview logic
                    if (e.clientY <= 30 && snapPreview) {
                        snapPreview.style.display = 'block';
                        snapPreview.style.top = '28px';
                        snapPreview.style.left = '56px'; // Dock width
                        snapPreview.style.width = 'calc(100% - 56px)';
                        snapPreview.style.height = 'calc(100vh - 28px)';
                    } else if (snapPreview) {
                        snapPreview.style.display = 'none';
                    }
                }
            };

            const dragEnd = (e) => {
                if (!isDragging) return;
                isDragging = false;

                // Aero snap action
                if (e.clientY <= 30) {
                    this.maximizeWindow(win.dataset.id);
                }

                if (snapPreview) {
                    snapPreview.style.display = 'none';
                }
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

            let initialMouseX, initialMouseY;
            let initialWidth, initialHeight;

            const startResize = (e) => {
                if (win.classList.contains('maximized')) return;

                isResizing = true;
                currentResizer = e.target;

                initialMouseX = e.clientX;
                initialMouseY = e.clientY;

                const style = window.getComputedStyle(win);
                initialWidth = parseInt(style.width, 10);
                initialHeight = parseInt(style.height, 10);

                // Prevent text selection while resizing
                e.preventDefault();
            };

            const resize = (e) => {
                if (!isResizing) return;

                const dx = e.clientX - initialMouseX;
                const dy = e.clientY - initialMouseY;

                if (currentResizer.classList.contains('resizer-r') || currentResizer.classList.contains('resizer-br')) {
                    win.style.width = `${initialWidth + dx}px`;
                    // Remove max-width to allow free resizing
                    win.style.maxWidth = 'none';
                }

                if (currentResizer.classList.contains('resizer-b') || currentResizer.classList.contains('resizer-br')) {
                    win.style.height = `${initialHeight + dy}px`;
                }
            };

            const stopResize = () => {
                isResizing = false;
            };

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', startResize);
            });

            document.addEventListener('mousemove', resize);
            document.addEventListener('mouseup', stopResize);
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

    setupTerminal() {
        const terminalInput = document.getElementById('terminal-input');
        const terminalOutput = document.getElementById('terminal-output');
        const terminalWindow = document.getElementById('window-terminal');

        if (!terminalInput || !terminalOutput) return;

        // Focus input when clicking anywhere in the terminal window
        terminalWindow.addEventListener('click', () => {
            terminalInput.focus();
        });

        // Add initial neofetch output
        this.runCommand('neofetch', terminalOutput);

        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = terminalInput.value.trim();
                terminalInput.value = '';

                if (command) {
                    // Echo command securely
                    const promptLine = document.createElement('div');
                    promptLine.innerHTML = `<span class="text-green-400 font-bold">sebastian@portfolio</span><span class="text-gray-300">:</span><span class="text-blue-400">~</span><span class="text-gray-300">$ </span><span></span>`;
                    promptLine.lastChild.textContent = command; // Escape user input
                    terminalOutput.appendChild(promptLine);

                    // Run command
                    this.runCommand(command, terminalOutput);
                } else {
                    // Empty command echo
                    const promptLine = document.createElement('div');
                    promptLine.innerHTML = `<span class="text-green-400 font-bold">sebastian@portfolio</span><span class="text-gray-300">:</span><span class="text-blue-400">~</span><span class="text-gray-300">$ </span>`;
                    terminalOutput.appendChild(promptLine);
                }

                // Scroll to bottom
                const terminalContentArea = terminalOutput.parentElement;
                terminalContentArea.scrollTop = terminalContentArea.scrollHeight;
            }
        });
    }

    runCommand(command, outputElement) {
        const args = command.split(' ');
        const cmd = args[0].toLowerCase();

        const responseLine = document.createElement('div');
        responseLine.className = 'mb-2';

        switch (cmd) {
            case 'help':
                responseLine.innerHTML = `
                    <div class="mb-1">Available commands:</div>
                    <div class="ml-4">
                        <span class="text-green-400">whoami</span>   - Show information about me<br>
                        <span class="text-green-400">neofetch</span> - Display system information<br>
                        <span class="text-green-400">clear</span>    - Clear terminal output<br>
                        <span class="text-green-400">help</span>     - Show this help message
                    </div>
                `;
                break;
            case 'whoami':
                responseLine.innerHTML = `
                    <div>Sebastian Duran Caballero</div>
                    <div>Backend Developer | Data Engineer</div>
                    <div>I specialize in Python, Django, Cloud architectures, and crafting robust software solutions.</div>
                `;
                break;
            case 'neofetch':
                responseLine.innerHTML = `
<div class="flex flex-col md:flex-row gap-4 mb-4 mt-2">
    <div class="text-ubuntu-orange whitespace-pre font-mono text-xs md:text-sm leading-tight">
         _.-="""=-._
       /  _     _  \\
      /  ( o ) ( o )  \\
     /      \\_/      \\
    |   \\_       _/   |
    |     \`"""""\`     |
     \\               /
      \\             /
       \`-..___..-'\`
    </div>
    <div class="flex-1">
        <div class="text-green-400 font-bold">sebastian<span class="text-gray-300">@</span>portfolio</div>
        <div class="text-gray-400">-------------------</div>
        <div><span class="text-ubuntu-orange font-bold">OS</span>: Ubuntu Web Edition x86_64</div>
        <div><span class="text-ubuntu-orange font-bold">Host</span>: Browser-based Portfolio UI</div>
        <div><span class="text-ubuntu-orange font-bold">Kernel</span>: HTML5/CSS3/JS</div>
        <div><span class="text-ubuntu-orange font-bold">Uptime</span>: Just started</div>
        <div><span class="text-ubuntu-orange font-bold">Packages</span>: 1042 (npm), 5 (pip)</div>
        <div><span class="text-ubuntu-orange font-bold">Shell</span>: Bash-like JS</div>
        <div><span class="text-ubuntu-orange font-bold">Resolution</span>: Responsive</div>
        <div><span class="text-ubuntu-orange font-bold">DE</span>: GNOME Web</div>
        <div><span class="text-ubuntu-orange font-bold">WM</span>: TailwindCSS</div>
        <div><span class="text-ubuntu-orange font-bold">Theme</span>: Yaru-dark [GTK2/3]</div>
        <div><span class="text-ubuntu-orange font-bold">Icons</span>: FontAwesome</div>
        <div><span class="text-ubuntu-orange font-bold">Terminal</span>: JS-Term</div>
        <div><span class="text-ubuntu-orange font-bold">CPU</span>: Client Processor</div>
        <div><span class="text-ubuntu-orange font-bold">Memory</span>: Sufficient for Web</div>
        <div class="mt-2 flex gap-1">
            <div class="w-4 h-4 bg-black"></div>
            <div class="w-4 h-4 bg-red-500"></div>
            <div class="w-4 h-4 bg-green-500"></div>
            <div class="w-4 h-4 bg-yellow-500"></div>
            <div class="w-4 h-4 bg-blue-500"></div>
            <div class="w-4 h-4 bg-purple-500"></div>
            <div class="w-4 h-4 bg-cyan-500"></div>
            <div class="w-4 h-4 bg-white"></div>
        </div>
    </div>
</div>`;
                break;
            case 'clear':
                outputElement.innerHTML = '';
                return; // Do not append responseLine
            case '':
                return; // Do nothing
            default:
                const errorSpan = document.createElement('span');
                errorSpan.className = 'text-red-400';
                errorSpan.textContent = `Command '${command}' not found. Type 'help' for a list of commands.`;
                responseLine.appendChild(errorSpan);
                break;
        }

        outputElement.appendChild(responseLine);
    }
}

// Initialize the OS
const app = new LinuxOS();