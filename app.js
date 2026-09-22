
class TerminalParser {
    constructor() {
        this.input = document.getElementById('terminal-input');
        this.output = document.getElementById('terminal-output');
        this.history = [];
        this.historyIndex = -1;

        if(this.input) {
            this.input.addEventListener('keydown', this.handleInput.bind(this));
        }
    }

    handleInput(e) {
        if (e.key === 'Enter') {
            const command = this.input.value.trim();
            this.input.value = '';
            if (command) {
                this.history.push(command);
                this.historyIndex = this.history.length;
                this.executeCommand(command);
            } else {
                this.printPrompt('');
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (this.historyIndex > 0) {
                this.historyIndex--;
                this.input.value = this.history[this.historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (this.historyIndex < this.history.length - 1) {
                this.historyIndex++;
                this.input.value = this.history[this.historyIndex];
            } else {
                this.historyIndex = this.history.length;
                this.input.value = '';
            }
        }
    }

    printPrompt(command) {
        const line = document.createElement('div');
        line.innerHTML = `<span class="text-green-400 font-bold mr-2">sebastian@adwaita</span><span class="text-blue-400 font-bold mr-2">~ $</span><span class="text-gray-200">${this.escapeHTML(command)}</span>`;
        this.output.appendChild(line);
    }

    printOutput(text, isHtml=false) {
        const line = document.createElement('div');
        line.className = 'mb-2 text-gray-200';
        if(isHtml) {
            line.innerHTML = text;
        } else {
            line.textContent = text;
        }
        this.output.appendChild(line);
        this.scrollToBottom();
    }

    escapeHTML(str) {
        return str.replace(/[&<>'"]/g, tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag]));
    }

    scrollToBottom() {
        const content = document.getElementById('terminal-content');
        if (content) {
            content.scrollTop = content.scrollHeight;
        }
    }

    executeCommand(command) {
        this.printPrompt(command);
        const args = command.split(' ').filter(Boolean);
        const cmd = args[0].toLowerCase();

        switch (cmd) {
            case 'help':
                this.printOutput(`
Comandos disponibles:
  help      - Muestra este mensaje
  whoami    - Muestra el usuario actual
  clear     - Limpia la terminal
  ls        - Lista el contenido del directorio
  neofetch  - Muestra información del sistema
  cat       - Lee el contenido de un archivo (ej. cat description.txt)
  open      - Abre una aplicación (ej. open projects)`);
                break;
            case 'whoami':
                this.printOutput('Sebastian Duran Caballero');
                break;
            case 'clear':
                this.output.innerHTML = '';
                break;
            case 'ls':
                this.printOutput('description.txt  projects/  skills/  contact/');
                break;
            case 'cat':
                if (args[1] === 'description.txt') {
                    this.printOutput('Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.');
                } else if (args[1]) {
                    this.printOutput(`cat: ${args[1]}: No such file or directory`);
                } else {
                    this.printOutput('uso: cat <archivo>');
                }
                break;
            case 'open':
                if (args[1]) {
                    const validApps = ['projects', 'skills', 'contact', 'terminal'];
                    if (validApps.includes(args[1])) {
                        window.app.openWindow(args[1]);
                    } else {
                        this.printOutput(`open: aplicación no encontrada: ${args[1]}`);
                    }
                } else {
                    this.printOutput('uso: open <aplicación>');
                }
                break;
            case 'neofetch':
                this.printOutput(`
<div class="flex flex-col md:flex-row text-gray-100 mb-4">
    <div class="mr-6 mb-4 md:mb-0 text-[#3584e4] text-xs sm:text-sm font-bold">
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
        <p><span class="text-[#3584e4] font-bold">OS:</span> GNOME 40+ Adwaita</p>
        <p><span class="text-[#3584e4] font-bold">Host:</span> Desarrollador Web</p>
        <p><span class="text-[#3584e4] font-bold">Uptime:</span> 24/7 coding</p>
        <p><span class="text-[#3584e4] font-bold">Packages:</span> HTML, CSS, JS, .NET, C#</p>
        <p><span class="text-[#3584e4] font-bold">Shell:</span> bash 5.1.16</p>
        <p><span class="text-[#3584e4] font-bold">Location:</span> Santa Cruz, Bolivia</p>
        <p><span class="text-[#3584e4] font-bold">Email:</span> sd8587793@email.com</p>
    </div>
</div>
`, true);
                break;
            default:
                this.printOutput(`comando no encontrado: ${cmd}`);
                break;
        }
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
        this.setupResizingWindows();
        this.setupWindowClickToFront();
        this.setupLogin();
    }

    setupResizingWindows() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer;
            let initialWidth, initialHeight, initialMouseX, initialMouseY;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    if(win.classList.contains('maximized')) return;

                    isResizing = true;
                    currentResizer = resizer;
                    initialMouseX = e.clientX;
                    initialMouseY = e.clientY;

                    const rect = win.getBoundingClientRect();
                    initialWidth = rect.width;
                    initialHeight = rect.height;

                    this.bringToFront(win);

                    document.addEventListener('mousemove', resize);
                    document.addEventListener('mouseup', stopResize);
                });
            });

            function resize(e) {
                if (!isResizing) return;

                if (currentResizer.classList.contains('resizer-r') || currentResizer.classList.contains('resizer-br')) {
                    const width = initialWidth + (e.clientX - initialMouseX);
                    if (width > 300) {
                        win.style.width = width + 'px';
                        win.style.maxWidth = 'none'; // Overwrite tailwind max-w if needed
                    }
                }
                if (currentResizer.classList.contains('resizer-b') || currentResizer.classList.contains('resizer-br')) {
                    const height = initialHeight + (e.clientY - initialMouseY);
                    if (height > 200) {
                        win.style.height = height + 'px';
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
                setTimeout(() => {
                    if(window.terminal) {
                        window.terminal.executeCommand('whoami');
                        window.terminal.executeCommand('cat description.txt');
                        window.terminal.executeCommand('neofetch');
                    }
                }, 300);
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
                // Don't drag if maximizing/closing buttons are clicked or on resizers
                if(e.target.closest('button') || e.target.classList.contains('resizer')) return;

                if (win.classList.contains('maximized')) {
                    // Temporarily set transform to none, recalculate xOffset and yOffset
                    win.classList.remove('maximized');
                    win.style.transform = 'none';
                    const rect = win.getBoundingClientRect();
                    const desktopRect = document.getElementById('desktop').getBoundingClientRect();

                    // We need to place it exactly where it was before it maximized
                    // But if dragged from maximized, calculate based on mouse pos

                    // Center the window on mouse
                    currentX = e.clientX - desktopRect.left - win.offsetWidth / 2;
                    currentY = e.clientY - desktopRect.top - win.offsetHeight / 2;

                    // Keep in bounds rough
                    currentX = Math.max(0, currentX);
                    currentY = Math.max(0, currentY);

                    xOffset = currentX;
                    yOffset = currentY;
                    setTranslate(currentX, currentY, win);

                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;
                } else {
                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;
                }

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
                }
            }

            function setTranslate(xPos, yPos, el) {
                el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
            }

            function dragEnd(e) {
                initialX = currentX;
                initialY = currentY;
                isDragging = false;
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
window.app = app;
window.terminal = new TerminalParser();