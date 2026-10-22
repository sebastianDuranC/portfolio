class TerminalParser {
    constructor(terminalContentElement) {
        this.contentElement = terminalContentElement;
        this.history = [];
        this.historyIndex = -1;
        this.init();
    }

    init() {
        // Initial setup
        this.printLine('<span class="text-green-400 font-bold">sebastian@adwaita</span>:<span class="text-adwaita-blue font-bold">~</span>$ whoami');
        this.printLine('Sebastian Duran Caballero', 'text-gray-100 mb-4');
        this.printLine('<span class="text-green-400 font-bold">sebastian@adwaita</span>:<span class="text-adwaita-blue font-bold">~</span>$ cat description.txt');
        this.printLine('Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.', 'text-gray-100 mb-4');
        this.printLine('<span class="text-green-400 font-bold">sebastian@adwaita</span>:<span class="text-adwaita-blue font-bold">~</span>$ neofetch');
        this.printNeofetch();
        this.createNewPrompt();
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

    printLine(content, classes = '') {
        const p = document.createElement('p');
        if (classes) p.className = classes;
        p.innerHTML = content;
        this.contentElement.appendChild(p);
        this.scrollToBottom();
    }

    printNeofetch() {
        const neofetchHTML = `
        <div class="flex flex-col md:flex-row text-gray-100 mb-4">
            <div class="mr-6 mb-4 md:mb-0 text-adwaita-blue text-xs sm:text-sm font-bold">
<pre>
       _,-/&#96;--,-/\-,
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
                <p><span class="text-adwaita-blue font-bold">OS:</span> Adwaita OS x86_64</p>
                <p><span class="text-adwaita-blue font-bold">Host:</span> Desarrollador Web</p>
                <p><span class="text-adwaita-blue font-bold">Uptime:</span> 24/7 coding</p>
                <p><span class="text-adwaita-blue font-bold">Packages:</span> HTML, CSS, JS, .NET, C#</p>
                <p><span class="text-adwaita-blue font-bold">Shell:</span> bash 5.1.16</p>
                <p><span class="text-adwaita-blue font-bold">Location:</span> Santa Cruz, Bolivia</p>
                <p><span class="text-adwaita-blue font-bold">Email:</span> sd8587793@email.com</p>
            </div>
        </div>`;
        this.printLine(neofetchHTML);
    }

    createNewPrompt() {
        const promptDiv = document.createElement('div');
        promptDiv.className = 'flex items-center mb-2';
        promptDiv.innerHTML = `
            <span class="text-green-400 font-bold mr-1">sebastian@adwaita</span>:<span class="text-adwaita-blue font-bold mr-2">~</span>$
            <input type="text" class="flex-1 bg-transparent outline-none text-gray-200 ml-1 terminal-input" autofocus spellcheck="false" autocomplete="off">
        `;
        this.contentElement.appendChild(promptDiv);
        const input = promptDiv.querySelector('input');
        input.focus();

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = input.value.trim();
                input.disabled = true;

                // Add the entered command as static text
                const staticPrompt = document.createElement('p');
                staticPrompt.className = 'mb-2';
                staticPrompt.innerHTML = `<span class="text-green-400 font-bold">sebastian@adwaita</span>:<span class="text-adwaita-blue font-bold">~</span>$ ${this.escapeHTML(command)}`;
                promptDiv.replaceWith(staticPrompt);

                if (command) {
                    this.history.push(command);
                    this.historyIndex = this.history.length;
                    this.executeCommand(command);
                } else {
                    this.createNewPrompt();
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (this.historyIndex > 0) {
                    this.historyIndex--;
                    input.value = this.history[this.historyIndex];
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (this.historyIndex < this.history.length - 1) {
                    this.historyIndex++;
                    input.value = this.history[this.historyIndex];
                } else {
                    this.historyIndex = this.history.length;
                    input.value = '';
                }
            }
        });

        // Ensure focus stays on the input when clicking anywhere in terminal
        this.contentElement.addEventListener('click', () => {
            const activeInput = this.contentElement.querySelector('input.terminal-input:not([disabled])');
            if (activeInput) activeInput.focus();
        });

        this.scrollToBottom();
    }

    executeCommand(command) {
        const args = command.split(' ').filter(Boolean);
        const cmd = args[0].toLowerCase();

        switch (cmd) {
            case 'help':
                this.printLine('Available commands: help, whoami, clear, ls, neofetch, cat, open', 'text-gray-300 mb-4');
                break;
            case 'whoami':
                this.printLine('Sebastian Duran Caballero', 'text-gray-100 mb-4');
                break;
            case 'clear':
                this.contentElement.innerHTML = '';
                break;
            case 'ls':
                this.printLine('description.txt  projects/  skills/  contact/', 'text-adwaita-blue font-bold mb-4');
                break;
            case 'neofetch':
                this.printNeofetch();
                break;
            case 'cat':
                if (args[1] === 'description.txt') {
                    this.printLine('Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.', 'text-gray-100 mb-4');
                } else {
                    this.printLine(`cat: ${this.escapeHTML(args[1] || '')}: No such file or directory`, 'text-red-400 mb-4');
                }
                break;
            case 'open':
                const appName = args[1]?.toLowerCase();
                if (['projects', 'skills', 'contact'].includes(appName)) {
                    this.printLine(`Opening ${appName}...`, 'text-gray-300 mb-4');
                    if (window.app) window.app.openWindow(appName);
                } else {
                    this.printLine(`open: invalid application '${this.escapeHTML(appName || '')}'`, 'text-red-400 mb-4');
                }
                break;
            default:
                this.printLine(`bash: ${this.escapeHTML(cmd)}: command not found`, 'text-red-400 mb-4');
        }

        this.createNewPrompt();
    }

    scrollToBottom() {
        this.contentElement.scrollTop = this.contentElement.scrollHeight;
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
        this.setupWindowClickToFront();
        this.setupLogin();
        this.setupResizers();

        const terminalOutput = document.getElementById('terminal-output');
        if (terminalOutput) {
            this.terminalParser = new TerminalParser(terminalOutput);
        }
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
                // Automatically open terminal on startup
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
                    e.preventDefault();
                    isResizing = true;
                    currentResizer = resizer;
                    originalWidth = parseFloat(getComputedStyle(win, null).getPropertyValue('width').replace('px', ''));
                    originalHeight = parseFloat(getComputedStyle(win, null).getPropertyValue('height').replace('px', ''));
                    originalMouseX = e.pageX;
                    originalMouseY = e.pageY;

                    document.addEventListener('mousemove', resize);
                    document.addEventListener('mouseup', stopResize);
                });
            });

            const resize = (e) => {
                if (!isResizing) return;

                if (win.classList.contains('maximized')) return;

                if (currentResizer.classList.contains('resizer-r')) {
                    const width = originalWidth + (e.pageX - originalMouseX);
                    win.style.width = width + 'px';
                }
                else if (currentResizer.classList.contains('resizer-b')) {
                    const height = originalHeight + (e.pageY - originalMouseY);
                    win.style.height = height + 'px';
                }
                else if (currentResizer.classList.contains('resizer-br')) {
                    const width = originalWidth + (e.pageX - originalMouseX);
                    const height = originalHeight + (e.pageY - originalMouseY);
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
                // Don't drag if maximizing/closing buttons are clicked
                if(e.target.closest('button')) return;

                // Restoring maximized window via drag
                if(win.classList.contains('maximized')) {
                    win.classList.remove('maximized');
                    win.style.transform = 'none'; // Temporarily disable transform to calculate offsets

                    const rect = win.getBoundingClientRect();
                    // Adjust offset based on mouse position relative to restored window
                    xOffset = e.clientX - rect.left - (win.offsetWidth / 2);
                    yOffset = e.clientY - rect.top;

                    // Constrain so window doesn't jump completely offscreen
                    setTranslate(xOffset, yOffset, win);
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

                    setTranslate(currentX, currentY, win);
                }
            };

            const setTranslate = (xPos, yPos, el) => {
                el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
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

// Initialize the OS and expose it globally
window.app = new LinuxOS();
