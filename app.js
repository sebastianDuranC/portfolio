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
        if (!desktop) return;

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

            header.addEventListener('mousedown', (e) => {
                // Don't drag if buttons are clicked
                if(e.target.closest('button')) return;

                if (win.classList.contains('maximized')) {
                    // Restore window via drag (Aero Snap out)
                    win.classList.remove('maximized');
                    win.style.transform = 'none'; // Temporarily disable transform for calculations

                    const rect = win.getBoundingClientRect();
                    const desktopRect = desktop.getBoundingClientRect();

                    // Calculate relative to desktop
                    xOffset = rect.left - desktopRect.left;
                    yOffset = rect.top - desktopRect.top;

                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;

                    setTranslate(xOffset, yOffset, win);
                } else {
                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;
                }

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;
                }
            });

            document.addEventListener('mousemove', (e) => {
                if (isDragging) {
                    e.preventDefault();

                    // Aero snap to top
                    if (e.clientY <= 28 && !win.classList.contains('maximized')) { // 28px is topbar height
                        win.dataset.prevTransform = win.style.transform;
                        win.classList.add('maximized');
                        win.style.transform = 'none';
                        isDragging = false;
                        return;
                    }

                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;

                    xOffset = currentX;
                    yOffset = currentY;

                    setTranslate(currentX, currentY, win);
                }
            });

            document.addEventListener('mouseup', () => {
                initialX = currentX;
                initialY = currentY;
                isDragging = false;
            });

            function setTranslate(xPos, yPos, el) {
                el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
            }
        });
    }

    setupResizableWindows() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer;
            let startX, startY, startWidth, startHeight;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', function(e) {
                    if(win.classList.contains('maximized')) return;

                    e.preventDefault();
                    isResizing = true;
                    currentResizer = resizer;

                    startX = e.clientX;
                    startY = e.clientY;
                    startWidth = parseInt(document.defaultView.getComputedStyle(win).width, 10);
                    startHeight = parseInt(document.defaultView.getComputedStyle(win).height, 10);

                    window.app.bringToFront(win);
                });
            });

            window.addEventListener('mousemove', function(e) {
                if (!isResizing) return;

                if (currentResizer.classList.contains('resizer-r') || currentResizer.classList.contains('resizer-br')) {
                    win.style.width = startWidth + (e.clientX - startX) + 'px';
                }

                if (currentResizer.classList.contains('resizer-b') || currentResizer.classList.contains('resizer-br')) {
                    win.style.height = startHeight + (e.clientY - startY) + 'px';
                }
            });

            window.addEventListener('mouseup', function() {
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

        if(this.input) {
            this.input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const command = this.input.value.trim();
                    this.processCommand(command);
                    this.input.value = '';
                    this.scrollToBottom();
                }
            });

            // Keep focus on input when clicking inside terminal
            this.content.addEventListener('click', () => {
                this.input.focus();
            });
        }
    }

    scrollToBottom() {
        if(this.content) {
            this.content.scrollTop = this.content.scrollHeight;
        }
    }

    printLine(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        this.output.appendChild(div);
    }

    printText(text) {
        const div = document.createElement('div');
        div.textContent = text;
        this.output.appendChild(div);
    }

    printCommandEcho(command) {
        const prompt = `<span class="text-green-400 font-bold whitespace-nowrap">sebastian@adwaita</span><span class="text-white font-bold">:</span><span class="text-blue-400 font-bold whitespace-nowrap">~</span><span class="text-white font-bold mr-2">$</span>`;
        // Safe escaping for the command echo
        const escapedCommand = document.createElement('div');
        escapedCommand.textContent = command;
        this.printLine(`${prompt} ${escapedCommand.innerHTML}`);
    }

    init() {
        // Clear first
        this.output.innerHTML = '';

        // Pre-populate
        this.printCommandEcho('whoami');
        this.printLine('<p class="text-gray-100 mb-4">Sebastian Duran Caballero</p>');

        this.printCommandEcho('cat description.txt');
        this.printLine('<p class="text-gray-100 mb-4">Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.</p>');

        this.printCommandEcho('neofetch');
        this.printLine(`
            <div class="flex flex-col md:flex-row text-gray-100 mb-4">
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
                    <p><span class="text-[#3584e4] font-bold">OS:</span> GNOME OS x86_64</p>
                    <p><span class="text-[#3584e4] font-bold">Host:</span> Desarrollador Web</p>
                    <p><span class="text-[#3584e4] font-bold">Uptime:</span> 24/7 coding</p>
                    <p><span class="text-[#3584e4] font-bold">Packages:</span> HTML, CSS, JS, .NET, C#</p>
                    <p><span class="text-[#3584e4] font-bold">Shell:</span> bash 5.1.16</p>
                    <p><span class="text-[#3584e4] font-bold">Location:</span> Santa Cruz, Bolivia</p>
                    <p><span class="text-[#3584e4] font-bold">Email:</span> sd8587793@email.com</p>
                </div>
            </div>
        `);
    }

    processCommand(command) {
        this.printCommandEcho(command);

        if (command === '') return;

        const args = command.split(' ');
        const cmd = args[0].toLowerCase();

        switch (cmd) {
            case 'help':
                this.printLine(`
                    <div class="mb-4 text-gray-300">
                        <p>Available commands:</p>
                        <ul class="list-disc ml-6 mt-2">
                            <li><span class="text-blue-300">whoami</span> - Display current user</li>
                            <li><span class="text-blue-300">neofetch</span> - Display system information</li>
                            <li><span class="text-blue-300">cat [file]</span> - Concatenate files and print on the standard output</li>
                            <li><span class="text-blue-300">ls</span> - List directory contents</li>
                            <li><span class="text-blue-300">clear</span> - Clear the terminal screen</li>
                            <li><span class="text-blue-300">open [app]</span> - Open an application (projects, skills, contact)</li>
                        </ul>
                    </div>
                `);
                break;
            case 'whoami':
                this.printLine('<p class="text-gray-100 mb-4">Sebastian Duran Caballero</p>');
                break;
            case 'clear':
                this.output.innerHTML = '';
                break;
            case 'ls':
                this.printLine(`
                    <div class="flex space-x-4 mb-4 text-blue-400">
                        <span>description.txt</span>
                        <span>projects/</span>
                        <span>skills/</span>
                    </div>
                `);
                break;
            case 'cat':
                if (args[1] === 'description.txt') {
                    this.printLine('<p class="text-gray-100 mb-4">Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.</p>');
                } else if (!args[1]) {
                    this.printLine('<p class="text-red-400 mb-4">cat: missing operand</p>');
                } else {
                    this.printText(`cat: ${args[1]}: No such file or directory\n\n`);
                }
                break;
            case 'neofetch':
                this.printLine(`
                    <div class="flex flex-col md:flex-row text-gray-100 mb-4">
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
                            <p><span class="text-[#3584e4] font-bold">OS:</span> GNOME OS x86_64</p>
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
            case 'open':
                const appName = args[1]?.toLowerCase();
                if (['projects', 'skills', 'contact'].includes(appName)) {
                    if(window.app) {
                        window.app.openWindow(appName);
                        this.printLine(`<p class="text-green-400 mb-4">Opening ${appName}...</p>`);
                    }
                } else {
                    this.printText(`open: application '${appName}' not found.\n\n`);
                }
                break;
            default:
                this.printText(`bash: ${cmd}: command not found. Type 'help' for available commands.\n\n`);
                break;
        }
    }
}

// Initialize the OS
window.app = new LinuxOS();
window.terminal = new TerminalParser();
window.terminal.init();