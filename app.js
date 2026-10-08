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

        // Initialize Terminal Parser when OS loads
        this.terminalParser = new TerminalParser();
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

            header.addEventListener('mousedown', dragStart);
            document.addEventListener('mousemove', drag.bind(this));
            document.addEventListener('mouseup', dragEnd.bind(this));

            const dragStart = (e) => {
                if(e.target.closest('button')) return;

                if(win.classList.contains('maximized')) {
                    win.classList.remove('maximized');
                    win.style.transform = 'none';
                    const rect = win.getBoundingClientRect();
                    const targetLeft = e.clientX - (rect.width / 2);
                    xOffset = targetLeft - rect.left;
                    yOffset = e.clientY - rect.top;
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

                    setTranslate(currentX, currentY, win);
                }
            }

            function setTranslate(xPos, yPos, el) {
                el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
            }

            function dragEnd(e) {
                if (isDragging) {
                    initialX = currentX;
                    initialY = currentY;
                    isDragging = false;

                    const desktopRect = desktop.getBoundingClientRect();
                    if (e.clientY <= desktopRect.top + 10) {
                        this.maximizeWindow(win.dataset.id);
                    }
                }
            }
        });
    }

    setupResizableWindows() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            if (resizers.length === 0) return;

            let isResizing = false;
            let currentResizer = null;
            let initialWidth = 0;
            let initialHeight = 0;
            let initialMouseX = 0;
            let initialMouseY = 0;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    if(win.classList.contains('maximized')) return;

                    isResizing = true;
                    currentResizer = resizer;
                    initialWidth = win.offsetWidth;
                    initialHeight = win.offsetHeight;
                    initialMouseX = e.clientX;
                    initialMouseY = e.clientY;
                    this.bringToFront(win);
                });
            });

            document.addEventListener('mousemove', (e) => {
                if (!isResizing) return;
                e.preventDefault();

                if (currentResizer.classList.contains('right') || currentResizer.classList.contains('bottom-right')) {
                    const width = initialWidth + (e.clientX - initialMouseX);
                    win.style.width = width + 'px';
                }

                if (currentResizer.classList.contains('bottom') || currentResizer.classList.contains('bottom-right')) {
                    const height = initialHeight + (e.clientY - initialMouseY);
                    win.style.height = height + 'px';
                }
            });

            document.addEventListener('mouseup', () => {
                isResizing = false;
                currentResizer = null;
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
        this.inputElement = document.getElementById('terminal-input');
        this.contentContainer = document.querySelector('#window-terminal .window-content');

        if (this.inputElement && this.contentContainer) {
            this.setupListener();
            this.clearTerminal();
            this.executeCommand('whoami');
            this.executeCommand('neofetch');
        }
    }

    setupListener() {
        this.inputElement.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = this.inputElement.value.trim();
                this.processCommand(command);
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

    processCommand(command) {
        // Echo command
        const promptLine = document.createElement('p');
        promptLine.className = 'mb-2 flex items-center';
        promptLine.innerHTML = `<span class="text-green-400 font-bold mr-1">sebastian@adwaita:</span><span class="text-blue-400 font-bold mr-2">~</span>$ <span class="ml-2">${this.escapeHTML(command)}</span>`;
        this.contentContainer.insertBefore(promptLine, this.inputElement.parentElement);

        this.inputElement.value = '';

        if (command) {
            this.executeCommand(command);
        }

        this.scrollToBottom();
    }

    executeCommand(command) {
        const cmd = command.toLowerCase().split(' ')[0];
        let output = '';

        switch (cmd) {
            case 'help':
                output = `
                    <div class="mb-4 text-gray-300">
                        Available commands:<br>
                        - <span class="text-green-400">whoami</span>: display current user<br>
                        - <span class="text-green-400">neofetch</span>: display system information<br>
                        - <span class="text-green-400">cat</span> [file]: read file content (try 'cat description.txt')<br>
                        - <span class="text-green-400">ls</span>: list directory contents<br>
                        - <span class="text-green-400">clear</span>: clear terminal output<br>
                        - <span class="text-green-400">open</span> [app]: open application (projects, skills, contact)
                    </div>`;
                break;
            case 'whoami':
                output = `<p class="text-gray-100 mb-4">Sebastian Duran Caballero</p>`;
                break;
            case 'neofetch':
                output = `
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
                    </div>`;
                break;
            case 'ls':
                output = `<div class="mb-4 flex gap-4 text-[#3584e4] font-bold"><span>Projects/</span> <span>Skills/</span> <span>description.txt</span></div>`;
                break;
            case 'cat':
                const file = command.substring(4).trim();
                if (file === 'description.txt') {
                    output = `<p class="text-gray-100 mb-4">Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.</p>`;
                } else {
                    output = `<p class="text-red-400 mb-4">cat: ${this.escapeHTML(file)}: No such file or directory</p>`;
                }
                break;
            case 'clear':
                this.clearTerminal();
                return;
            case 'open':
                const appName = command.substring(5).trim();
                if (['projects', 'skills', 'contact'].includes(appName)) {
                    window.app.openWindow(appName);
                    output = `<p class="text-gray-300 mb-4">Opening ${this.escapeHTML(appName)}...</p>`;
                } else {
                    output = `<p class="text-red-400 mb-4">App not found: ${this.escapeHTML(appName)}</p>`;
                }
                break;
            default:
                output = `<p class="text-red-400 mb-4">Command not found: ${this.escapeHTML(cmd)}. Type 'help' for available commands.</p>`;
        }

        if (output) {
            const outputDiv = document.createElement('div');
            outputDiv.innerHTML = output;
            this.contentContainer.insertBefore(outputDiv, this.inputElement.parentElement);
        }
    }

    clearTerminal() {
        // Remove all children except the input line
        const inputParent = this.inputElement.parentElement;
        Array.from(this.contentContainer.children).forEach(child => {
            if (child !== inputParent) {
                this.contentContainer.removeChild(child);
            }
        });
    }

    scrollToBottom() {
        this.contentContainer.scrollTop = this.contentContainer.scrollHeight;
    }
}

// Initialize the OS
window.app = new LinuxOS();