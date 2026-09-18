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

            // Save restoring function to win for external access (e.g. aero snap restore)
            win.setOffsets = (x, y) => {
                xOffset = x;
                yOffset = y;
                setTranslate(x, y, win);
            };

            win.getOffsets = () => ({ xOffset, yOffset });

            header.addEventListener('mousedown', dragStart);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);

            // Double click header to maximize
            header.addEventListener('dblclick', (e) => {
                if(e.target.closest('.flex.space-x-3')) return;
                const id = win.getAttribute('data-id');
                window.app.maximizeWindow(id);
            });

            function dragStart(e) {
                // Don't drag if maximizing/closing buttons are clicked
                if(e.target.closest('.flex.space-x-3')) return;

                if(win.classList.contains('maximized')) {
                    // Restore window but start dragging from the exact mouse position
                    win.classList.remove('maximized');
                    win.style.transform = 'none'; // Temporarily clear to get real bounding rect
                    const desktop = document.getElementById('desktop');
                    const desktopRect = desktop.getBoundingClientRect();

                    // Keep the mouse at the same relative position of the header width if possible,
                    // or just center it.
                    const winRect = win.getBoundingClientRect();
                    const mouseRatioX = e.clientX / window.innerWidth;

                    let newX = e.clientX - desktopRect.left - (winRect.width * mouseRatioX);
                    let newY = e.clientY - desktopRect.top - (header.offsetHeight / 2);

                    xOffset = newX;
                    yOffset = newY;
                    setTranslate(xOffset, yOffset, win);
                }

                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;
                    // Disable transitions during drag for immediate follow
                    win.style.transition = 'none';
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

                    // Aero snap preview (optional enhancement, but top drag triggers maximize)
                    if (e.clientY <= 0) {
                         // Dragged to top edge
                         if(!win.dataset.snapPreview) {
                             win.dataset.snapPreview = "true";
                         }
                    } else {
                         win.dataset.snapPreview = "false";
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

                // Restore transition
                win.style.transition = '';

                // Trigger Aero Snap Maximize
                if (e.clientY <= 0) {
                    const id = win.getAttribute('data-id');
                    window.app.maximizeWindow(id);
                }
            }
        });
    }

    setupResizableWindows() {
        let isResizing = false;
        let currentResizer;
        let currentWindow;
        let startX, startY, startWidth, startHeight;

        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    isResizing = true;
                    currentResizer = resizer;
                    currentWindow = win;
                    startX = e.clientX;
                    startY = e.clientY;
                    startWidth = parseInt(document.defaultView.getComputedStyle(win).width, 10);
                    startHeight = parseInt(document.defaultView.getComputedStyle(win).height, 10);

                    // Temporarily disable transitions during resize
                    win.style.transition = 'none';
                });
            });
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;

            if (currentResizer.classList.contains('right')) {
                currentWindow.style.width = startWidth + (e.clientX - startX) + 'px';
            } else if (currentResizer.classList.contains('bottom')) {
                currentWindow.style.height = startHeight + (e.clientY - startY) + 'px';
            } else if (currentResizer.classList.contains('bottom-right')) {
                currentWindow.style.width = startWidth + (e.clientX - startX) + 'px';
                currentWindow.style.height = startHeight + (e.clientY - startY) + 'px';
            }
        });

        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                if(currentWindow) currentWindow.style.transition = '';
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
class TerminalParser {
    constructor() {
        this.inputElement = document.getElementById('terminal-input');
        this.outputElement = document.getElementById('terminal-output');
        this.terminalContent = document.getElementById('terminal-content');
        this.commands = {
            'help': 'Comandos disponibles: help, whoami, clear, ls, neofetch, cat [archivo], open [aplicacion]',
            'whoami': 'Sebastian Duran Caballero\nDesarrollador Web .NET',
            'ls': 'description.txt\nprojects/\nskills/\ncontact/',
            'neofetch': this.getNeofetch(),
            'clear': () => this.clearTerminal(),
            'cat': (args) => this.handleCat(args),
            'open': (args) => this.handleOpen(args)
        };

        this.init();
        this.prepopulate();
    }

    init() {
        if (!this.inputElement) return;
        this.inputElement.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const command = this.inputElement.value.trim();
                this.executeCommand(command);
                this.inputElement.value = '';
            }
        });

        if (this.terminalContent) {
            this.terminalContent.addEventListener('click', () => {
                const selection = window.getSelection();
                if (selection.toString().length === 0) {
                    this.inputElement.focus();
                }
            });
        }
    }

    prepopulate() {
        this.executeCommand('whoami');
        this.executeCommand('neofetch');
    }

    getNeofetch() {
        return `
<div class="flex flex-col md:flex-row text-gray-100 my-2">
    <div class="mr-6 mb-4 md:mb-0 text-blue-500 text-xs sm:text-sm font-bold whitespace-pre">
       _,-/` + "`" + `--,-/\\-,
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
    </div>
    <div>
        <p><span class="text-blue-500 font-bold">OS:</span> Adwaita OS x86_64</p>
        <p><span class="text-blue-500 font-bold">Host:</span> Desarrollador Web</p>
        <p><span class="text-blue-500 font-bold">Uptime:</span> 24/7 coding</p>
        <p><span class="text-blue-500 font-bold">Packages:</span> HTML, CSS, JS, .NET, C#</p>
        <p><span class="text-blue-500 font-bold">Shell:</span> bash 5.1.16</p>
        <p><span class="text-blue-500 font-bold">Location:</span> Santa Cruz, Bolivia</p>
        <p><span class="text-blue-500 font-bold">Email:</span> sd8587793@email.com</p>
    </div>
</div>`;
    }

    handleCat(args) {
        if (!args || args.length === 0) {
            return 'cat: falta el operando de archivo';
        }
        if (args[0] === 'description.txt') {
            return 'Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.';
        }
        return `cat: ${args[0]}: No existe el archivo o el directorio`;
    }

    handleOpen(args) {
        if (!args || args.length === 0) {
            return 'open: falta el operando de aplicación';
        }
        const appName = args[0].toLowerCase();
        const validApps = ['projects', 'skills', 'contact'];
        if (validApps.includes(appName)) {
            if(window.app) {
                window.app.openWindow(appName);
                return `Abriendo ${appName}...`;
            }
        }
        return `open: aplicación '${appName}' no encontrada`;
    }

    clearTerminal() {
        if (this.outputElement) {
            this.outputElement.innerHTML = '';
        }
        return null; // Return null so it doesn't print anything
    }

    executeCommand(commandString) {
        if (!commandString) return;

        // Print command prompt
        const promptDiv = document.createElement('div');
        promptDiv.className = 'mb-1';
        promptDiv.innerHTML = `<span class="text-green-400 font-bold">sebastian@adwaita</span><span class="text-gray-200">:</span><span class="text-blue-400 font-bold">~</span><span class="text-gray-200">$</span> ${this.escapeHTML(commandString)}`;
        this.outputElement.appendChild(promptDiv);

        const parts = commandString.split(' ');
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        let output = '';
        if (this.commands.hasOwnProperty(cmd)) {
            const handler = this.commands[cmd];
            if (typeof handler === 'function') {
                output = handler(args);
            } else {
                output = handler;
            }
        } else {
            output = `bash: ${cmd}: orden no encontrada`;
        }

        if (output !== null) {
            const outDiv = document.createElement('div');
            outDiv.className = 'text-gray-300 mb-3 whitespace-pre-wrap';
            // Output neofetch as HTML, everything else as textContent for safety
            if(cmd === 'neofetch') {
                outDiv.innerHTML = output;
            } else {
                outDiv.textContent = output;
            }
            this.outputElement.appendChild(outDiv);
        }

        // Scroll to bottom
        if (this.terminalContent) {
            this.terminalContent.scrollTop = this.terminalContent.scrollHeight;
        }
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
}

// Initialize terminal parser
document.addEventListener('DOMContentLoaded', () => {
    window.terminalParser = new TerminalParser();
});
