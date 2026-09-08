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
        this.setupTerminal();
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
                document.getElementById('terminal-input')?.focus();
            }, 500); // Wait for transition to complete
        }
    }

    setupTerminal() {
        const input = document.getElementById('terminal-input');
        const output = document.getElementById('terminal-output');
        const content = document.getElementById('terminal-content');

        if (!input || !output || !content) return;

        // Pre-populate standard output
        this.executeCommand('whoami', output);
        this.executeCommand('cat description.txt', output);
        this.executeCommand('neofetch', output);

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const cmd = input.value.trim();
                input.value = '';

                if (cmd) {
                    this.executeCommand(cmd, output);
                }
                content.scrollTop = content.scrollHeight;
            }
        });
    }

    executeCommand(cmd, outputElement) {
        // Echo command
        const promptDiv = document.createElement('div');
        promptDiv.className = 'mb-2';
        promptDiv.innerHTML = `<span class="text-green-400 font-bold">sebastian@adwaita</span>:<span class="text-blue-400 font-bold">~</span>$ <span class="cmd-text"></span>`;
        promptDiv.querySelector('.cmd-text').textContent = cmd;
        outputElement.appendChild(promptDiv);

        // Process command
        const responseDiv = document.createElement('div');
        responseDiv.className = 'text-gray-100 mb-4';

        const args = cmd.split(' ').filter(Boolean);
        const command = args[0].toLowerCase();

        switch (command) {
            case 'whoami':
                responseDiv.textContent = 'Sebastian Duran Caballero';
                break;
            case 'cat':
                if (args[1] === 'description.txt') {
                    responseDiv.textContent = 'Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.';
                } else {
                    responseDiv.textContent = `cat: ${args[1] || ''}: No such file or directory`;
                }
                break;
            case 'ls':
                responseDiv.innerHTML = '<span class="text-blue-400 font-bold">projects/</span> <span class="text-blue-400 font-bold">skills/</span> description.txt contact.sh';
                break;
            case 'clear':
                outputElement.innerHTML = '';
                return; // Don't append responseDiv
            case 'help':
                responseDiv.innerHTML = `Available commands:<br>
                whoami - Print current user<br>
                cat [file] - Print file contents<br>
                ls - List directory contents<br>
                clear - Clear terminal output<br>
                neofetch - System information<br>
                open [app] - Open a desktop application (projects, skills, contact)`;
                break;
            case 'open':
                const appToOpen = args[1];
                if (['projects', 'skills', 'contact'].includes(appToOpen)) {
                    this.openWindow(appToOpen);
                    responseDiv.textContent = `Opening ${appToOpen}...`;
                } else {
                    responseDiv.textContent = `open: ${appToOpen || ''}: App not found. Available: projects, skills, contact`;
                }
                break;
            case 'neofetch':
                responseDiv.innerHTML = `
                    <div class="flex flex-col md:flex-row">
                        <div class="mr-6 mb-4 md:mb-0 text-blue-500 text-xs sm:text-sm font-bold">
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
                            <p><span class="text-blue-500 font-bold">OS:</span> Linux Adwaita x86_64</p>
                            <p><span class="text-blue-500 font-bold">Host:</span> Desarrollador Web</p>
                            <p><span class="text-blue-500 font-bold">Uptime:</span> 24/7 coding</p>
                            <p><span class="text-blue-500 font-bold">Packages:</span> HTML, CSS, JS, .NET, C#</p>
                            <p><span class="text-blue-500 font-bold">Shell:</span> bash 5.1.16</p>
                            <p><span class="text-blue-500 font-bold">Location:</span> Santa Cruz, Bolivia</p>
                            <p><span class="text-blue-500 font-bold">Email:</span> sd8587793@email.com</p>
                        </div>
                    </div>`;
                break;
            default:
                responseDiv.textContent = `bash: ${command}: command not found. Type 'help' for available commands.`;
        }

        outputElement.appendChild(responseDiv);
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

    setupResizableWindows() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer;
            let initialX, initialY, initialWidth, initialHeight;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    if (win.classList.contains('maximized')) return;

                    e.preventDefault();
                    e.stopPropagation();

                    isResizing = true;
                    currentResizer = resizer;

                    initialX = e.clientX;
                    initialY = e.clientY;

                    const rect = win.getBoundingClientRect();
                    initialWidth = rect.width;
                    initialHeight = rect.height;

                    document.addEventListener('mousemove', resize);
                    document.addEventListener('mouseup', stopResize);
                });
            });

            function resize(e) {
                if (!isResizing) return;

                // Get minimum dimensions from Tailwind classes if possible, else defaults
                const minWidthMatch = win.className.match(/min-w-\[?(\d+)px\]?/);
                const minHeightMatch = win.className.match(/min-h-\[?(\d+)px\]?/);

                const minWidth = minWidthMatch ? parseInt(minWidthMatch[1]) : 300;
                const minHeight = minHeightMatch ? parseInt(minHeightMatch[1]) : 200;

                if (currentResizer.classList.contains('resizer-r') || currentResizer.classList.contains('resizer-br')) {
                    const newWidth = initialWidth + (e.clientX - initialX);
                    if (newWidth >= minWidth) {
                        win.style.width = `${newWidth}px`;
                    }
                }

                if (currentResizer.classList.contains('resizer-b') || currentResizer.classList.contains('resizer-br')) {
                    const newHeight = initialHeight + (e.clientY - initialY);
                    if (newHeight >= minHeight) {
                        win.style.height = `${newHeight}px`;
                    }
                }
            }

            function stopResize() {
                isResizing = false;
                document.removeEventListener('mousemove', resize);
                document.removeEventListener('mouseup', stopResize);
            }
        });
    }

    setupDraggableWindows() {
        const desktop = document.getElementById('desktop');

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
            let dragThresholdExceeded = false;
            const self = this;

            header.addEventListener('mousedown', dragStart);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);

            function dragStart(e) {
                if(e.target.closest('button')) return;

                if(win.classList.contains('maximized')) {
                    // Temporarily remove transform to get accurate bounds
                    win.style.transform = 'none';
                    const rect = win.getBoundingClientRect();
                    const desktopRect = desktop.getBoundingClientRect();

                    xOffset = rect.left - desktopRect.left;
                    yOffset = rect.top - desktopRect.top;

                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;

                    isDragging = true;
                    dragThresholdExceeded = false;
                    return;
                }

                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;
                    dragThresholdExceeded = false;
                }
            }

            function drag(e) {
                if (isDragging) {
                    e.preventDefault();

                    const dx = e.clientX - (initialX + xOffset);
                    const dy = e.clientY - (initialY + yOffset);

                    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                         dragThresholdExceeded = true;
                    }

                    if (dragThresholdExceeded && win.classList.contains('maximized')) {
                         win.classList.remove('maximized');

                         // Recalculate initial positions so it attaches to mouse
                         const rect = win.getBoundingClientRect();
                         const desktopRect = desktop.getBoundingClientRect();

                         // Try to center window on cursor horizontally if possible
                         xOffset = (e.clientX - desktopRect.left) - (rect.width / 2);
                         yOffset = e.clientY - desktopRect.top;

                         initialX = e.clientX - xOffset;
                         initialY = e.clientY - yOffset;
                    }

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
                if(isDragging) {
                    initialX = currentX;
                    initialY = currentY;
                    isDragging = false;

                    // Aero snap to top to maximize
                    const desktopRect = desktop.getBoundingClientRect();
                    const topThreshold = 10;

                    if (e.clientY - desktopRect.top < topThreshold && !win.classList.contains('maximized') && dragThresholdExceeded) {
                        self.maximizeWindow(win.dataset.id);
                    }
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
window.app = new LinuxOS();