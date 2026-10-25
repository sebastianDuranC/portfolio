class LinuxOS {
    constructor() {
        this.windows = document.querySelectorAll('.os-window');
        this.highestZIndex = 100;
        this.openWindows = new Set();
        this.terminalParser = new TerminalParser(this);
        this.init();
    }

    init() {
        this.setupClock();
        this.setupDraggableWindows();
        this.setupWindowClickToFront();
        this.setupLogin();
        this.setupResizers();
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

            const dragStart = (e) => {
                if(e.target.closest('button')) return;

                if(win.classList.contains('maximized')) {
                    // Restore window on drag when maximized
                    win.classList.remove('maximized');
                    win.style.transform = 'none';

                    const rect = win.getBoundingClientRect();
                    const targetLeft = e.clientX - (rect.width / 2);

                    // Recalculate xOffset so that it maps to original left/top offsets
                    xOffset = targetLeft - parseFloat(getComputedStyle(win).left);
                    // Reset Y offset since we attach to cursor
                    yOffset = 0;
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

                    win.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0)`;
                }
            };

            const dragEnd = (e) => {
                initialX = currentX;
                initialY = currentY;
                isDragging = false;

                // Top edge snap to maximize
                if (e.clientY <= 28 && !win.classList.contains('maximized')) {
                    this.maximizeWindow(win.dataset.id);
                }
            };

            header.addEventListener('mousedown', dragStart);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);
        });
    }

    setupResizers() {
        let isResizing = false;
        let currentResizer = null;
        let currentWindow = null;
        let originalWidth, originalHeight, originalMouseX, originalMouseY;

        const resizeStart = (e, win) => {
            if (win.classList.contains('maximized')) return;

            isResizing = true;
            currentResizer = e.target;
            currentWindow = win;

            const rect = win.getBoundingClientRect();
            originalWidth = rect.width;
            originalHeight = rect.height;

            originalMouseX = e.pageX;
            originalMouseY = e.pageY;

            e.preventDefault();
        };

        const resize = (e) => {
            if (!isResizing || !currentWindow) return;

            if (currentResizer.classList.contains('resizer-r') || currentResizer.classList.contains('resizer-br')) {
                const width = originalWidth + (e.pageX - originalMouseX);
                currentWindow.style.width = width + 'px';
            }

            if (currentResizer.classList.contains('resizer-b') || currentResizer.classList.contains('resizer-br')) {
                const height = originalHeight + (e.pageY - originalMouseY);
                currentWindow.style.height = height + 'px';
            }
        };

        const resizeEnd = () => {
            isResizing = false;
            currentResizer = null;
            currentWindow = null;
        };

        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => resizeStart(e, win));
            });
        });

        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', resizeEnd);
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
    constructor(os) {
        this.os = os;
        this.input = document.getElementById('terminal-input');
        this.output = document.getElementById('terminal-output');
        this.content = document.getElementById('terminal-content');

        if (this.input) {
            this.setupEvents();
            this.initOutput();
        }
    }

    setupEvents() {
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = this.input.value.trim();
                if (cmd) {
                    this.executeCommand(cmd);
                } else {
                    this.printPrompt();
                }
                this.input.value = '';
                this.scrollToBottom();
            }
        });

        this.content.addEventListener('click', () => {
            const selection = window.getSelection();
            if (selection.toString() === '') {
                this.input.focus();
            }
        });
    }

    initOutput() {
        this.output.innerHTML = '';
        this.executeCommand('whoami');
        this.executeCommand('neofetch');
    }

    printPrompt(command = '') {
        const line = document.createElement('div');
        line.innerHTML = `<span class="text-green-400 font-bold">sebastian@adwaita</span>:<span class="text-blue-400 font-bold">~</span>$ `;
        const cmdSpan = document.createElement('span');
        cmdSpan.textContent = command;
        line.appendChild(cmdSpan);
        this.output.appendChild(line);
    }

    printOutput(text, isHtml = false) {
        const div = document.createElement('div');
        div.className = 'mb-2 text-gray-200';
        if (isHtml) {
            div.innerHTML = text;
        } else {
            div.textContent = text;
        }
        this.output.appendChild(div);
    }

    scrollToBottom() {
        this.content.scrollTop = this.content.scrollHeight;
    }

    executeCommand(commandLine) {
        this.printPrompt(commandLine);
        const args = commandLine.split(' ').filter(arg => arg.trim() !== '');
        const cmd = args[0].toLowerCase();

        switch (cmd) {
            case 'help':
                this.printOutput('Comandos disponibles:\n- help: Muestra esta ayuda\n- whoami: Muestra el usuario actual\n- neofetch: Muestra información del sistema\n- clear: Limpia la terminal\n- ls: Lista directorios\n- cat [archivo]: Lee un archivo\n- open [app]: Abre una aplicación (projects, skills, contact)');
                break;
            case 'whoami':
                this.printOutput('Sebastian Duran Caballero');
                break;
            case 'clear':
                this.output.innerHTML = '';
                break;
            case 'ls':
                this.printOutput('description.txt  projects/  skills/  contact/', true);
                break;
            case 'cat':
                if (args[1] === 'description.txt') {
                    this.printOutput('Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.');
                } else {
                    this.printOutput(`cat: ${args[1] || ''}: No such file or directory`);
                }
                break;
            case 'neofetch':
                this.printOutput(`
<div class="flex flex-col md:flex-row text-gray-100 mb-4 mt-2">
    <div class="mr-6 mb-4 md:mb-0 text-adwaita-blue text-xs sm:text-sm font-bold">
<pre>
      .---.
     /     \\
     \\.@-@./
     /\\\`_'/\\
    //  _  \\\\
   | \\     / |
  /\\_/\`---'\\_/\\
  \\__/       \\__/
</pre>
    </div>
    <div>
        <p><span class="text-adwaita-blue font-bold">OS:</span> Adwaita OS x86_64</p>
        <p><span class="text-adwaita-blue font-bold">Host:</span> Desarrollador Web</p>
        <p><span class="text-adwaita-blue font-bold">Uptime:</span> 24/7 coding</p>
        <p><span class="text-adwaita-blue font-bold">Packages:</span> HTML, CSS, JS, .NET, C#</p>
        <p><span class="text-adwaita-blue font-bold">Shell:</span> bash</p>
        <p><span class="text-adwaita-blue font-bold">Location:</span> Santa Cruz, Bolivia</p>
        <p><span class="text-adwaita-blue font-bold">Email:</span> sd8587793@email.com</p>
    </div>
</div>
                `, true);
                break;
            case 'open':
                const app = args[1];
                if (['projects', 'skills', 'contact'].includes(app)) {
                    this.printOutput(`Opening ${app}...`);
                    this.os.openWindow(app);
                } else {
                    this.printOutput(`open: ${app || ''}: Application not found`);
                }
                break;
            default:
                this.printOutput(`${cmd}: command not found`);
        }
    }
}


// Initialize the OS
window.app = new LinuxOS();