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

    setupResizableWindows() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer = null;
            let originalWidth = 0;
            let originalHeight = 0;
            let originalX = 0;
            let originalY = 0;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    isResizing = true;
                    currentResizer = resizer;
                    const rect = win.getBoundingClientRect();
                    originalWidth = rect.width;
                    originalHeight = rect.height;
                    originalX = e.clientX;
                    originalY = e.clientY;
                    this.bringToFront(win);
                });
            });

            document.addEventListener('mousemove', (e) => {
                if (!isResizing) return;

                let width = originalWidth;
                let height = originalHeight;

                if (currentResizer.classList.contains('right')) {
                    width = originalWidth + (e.clientX - originalX);
                } else if (currentResizer.classList.contains('bottom')) {
                    height = originalHeight + (e.clientY - originalY);
                } else if (currentResizer.classList.contains('bottom-right')) {
                    width = originalWidth + (e.clientX - originalX);
                    height = originalHeight + (e.clientY - originalY);
                }

                // Add minimum size constraints
                const minW = parseInt(getComputedStyle(win).minWidth) || 300;
                const minH = parseInt(getComputedStyle(win).minHeight) || 200;

                win.style.width = Math.max(width, minW) + 'px';
                win.style.height = Math.max(height, minH) + 'px';
            });

            document.addEventListener('mouseup', () => {
                isResizing = false;
                currentResizer = null;
            });
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

            function drag(e) {
                if (isDragging) {
                    e.preventDefault();

                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;

                    xOffset = currentX;
                    yOffset = currentY;

                    setTranslate(currentX, currentY, win);

                    // Aero snap indicator
                    const desktopRect = document.getElementById('desktop').getBoundingClientRect();
                    const snapIndicator = document.getElementById('snap-indicator');
                    if (e.clientY <= desktopRect.top + 10) {
                        snapIndicator.classList.remove('hidden');
                        snapIndicator.classList.add('visible');
                    } else {
                        snapIndicator.classList.remove('visible');
                        snapIndicator.classList.add('hidden');
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

                const desktopRect = document.getElementById('desktop').getBoundingClientRect();
                const snapIndicator = document.getElementById('snap-indicator');

                if (e.clientY <= desktopRect.top + 10 && snapIndicator.classList.contains('visible')) {
                    window.app.maximizeWindow(win.dataset.id);
                }

                if (snapIndicator) {
                    snapIndicator.classList.remove('visible');
                    snapIndicator.classList.add('hidden');
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

class TerminalParser {
    constructor() {
        this.inputLine = document.getElementById('terminal-input-line');
        this.input = document.getElementById('terminal-input');
        this.content = document.getElementById('terminal-content');

        if (this.input) {
            this.input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.executeCommand(this.input.value);
                    this.input.value = '';
                }
            });

            // Auto focus input when clicking terminal
            const terminalWindow = document.getElementById('window-terminal');
            if (terminalWindow) {
                terminalWindow.addEventListener('click', () => {
                    this.input.focus();
                });
            }
        }
    }

    printLine(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        this.content.insertBefore(div, this.inputLine);
        this.content.scrollTop = this.content.scrollHeight;
    }

    printEcho(text) {
        const p = document.createElement('p');
        p.className = "text-gray-100 mb-2";
        p.textContent = text;
        this.content.insertBefore(p, this.inputLine);
        this.content.scrollTop = this.content.scrollHeight;
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

    executeCommand(cmdRaw) {
        const cmdString = cmdRaw.trim();
        if (!cmdString) return;

        // Echo the command
        this.printLine(`<p class="mb-2"><span class="text-green-400 font-bold">sebastian@adwaita</span>:<span class="text-blue-400 font-bold">~</span>$ ${this.escapeHTML(cmdString)}</p>`);

        const parts = cmdString.split(' ').filter(p => p);
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        switch (cmd) {
            case 'help':
                this.printLine(`
                    <div class="text-gray-300 mb-4 pl-4">
                        <p>Available commands:</p>
                        <ul class="list-disc pl-4 mt-2">
                            <li><span class="text-[#3584e4]">help</span> - Show this message</li>
                            <li><span class="text-[#3584e4]">whoami</span> - Display current user</li>
                            <li><span class="text-[#3584e4]">neofetch</span> - Display system information</li>
                            <li><span class="text-[#3584e4]">ls</span> - List directory contents</li>
                            <li><span class="text-[#3584e4]">cat</span> [file] - View file contents</li>
                            <li><span class="text-[#3584e4]">clear</span> - Clear terminal output</li>
                            <li><span class="text-[#3584e4]">open</span> [app] - Open an application (projects, skills, contact)</li>
                        </ul>
                    </div>
                `);
                break;
            case 'whoami':
                this.printEcho('Sebastian Duran Caballero');
                break;
            case 'clear':
                // Remove everything except the input line
                while (this.content.firstChild && this.content.firstChild !== this.inputLine) {
                    this.content.removeChild(this.content.firstChild);
                }
                break;
            case 'ls':
                this.printLine(`
                    <div class="flex space-x-4 text-[#3584e4] font-bold mb-4">
                        <span>description.txt</span>
                        <span>projects/</span>
                        <span>skills/</span>
                        <span>contact/</span>
                    </div>
                `);
                break;
            case 'cat':
                if (args[0] === 'description.txt') {
                    this.printEcho('Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.');
                } else if (!args[0]) {
                    this.printEcho('cat: missing file operand');
                } else {
                    this.printEcho(`cat: ${this.escapeHTML(args[0])}: No such file or directory`);
                }
                break;
            case 'neofetch':
                this.printLine(`
                    <div class="flex flex-col md:flex-row text-gray-100 mb-4">
                        <div class="mr-6 mb-4 md:mb-0 text-[#3584e4] text-xs sm:text-sm font-bold">
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
            case 'open':
                if (['projects', 'skills', 'contact'].includes(args[0])) {
                    if (window.app) {
                        window.app.openWindow(args[0]);
                        this.printEcho(`Opening ${args[0]}...`);
                    }
                } else if (!args[0]) {
                    this.printEcho('open: missing application name');
                } else {
                    this.printEcho(`open: application not found: ${this.escapeHTML(args[0])}`);
                }
                break;
            default:
                this.printEcho(`bash: ${this.escapeHTML(cmd)}: command not found`);
        }
    }
}

// Initialize the OS
window.app = new LinuxOS();
window.terminal = new TerminalParser();