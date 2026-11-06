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
            let isResizing = false;
            let resizeDir = '';
            let currentX, currentY, initialX, initialY;
            let xOffset = 0, yOffset = 0;
            let startW, startH, startX, startY;

            // DRAG EVENTS
            const dragStart = (e) => {
                if(e.target.closest('button') || e.target.classList.contains('resizer')) return;

                if(win.classList.contains('maximized')) {
                    // Un-maximize behavior on drag
                    win.classList.remove('maximized');
                    win.style.transform = 'none';
                    const rect = win.getBoundingClientRect();
                    xOffset = e.clientX - rect.left - (rect.width / 2);
                    yOffset = 0; // Snap to top initially
                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;
                } else {
                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;
                }

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;
                    this.bringToFront(win);
                }
            };

            const drag = (e) => {
                if (isDragging) {
                    e.preventDefault();
                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;
                    xOffset = currentX;
                    yOffset = currentY;
                    win.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
                } else if (isResizing) {
                    e.preventDefault();
                    let newW = startW;
                    let newH = startH;
                    if (resizeDir.includes('r')) newW = startW + (e.clientX - startX);
                    if (resizeDir.includes('b')) newH = startH + (e.clientY - startY);
                    if(newW > 250) win.style.width = `${newW}px`;
                    if(newH > 200) win.style.height = `${newH}px`;
                }
            };

            const dragEnd = (e) => {
                if (isDragging) {
                    initialX = currentX;
                    initialY = currentY;
                    isDragging = false;
                }
                isResizing = false;
            };

            header.addEventListener('mousedown', dragStart);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);

            // RESIZE EVENTS
            const resizers = win.querySelectorAll('.resizer');
            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    if (win.classList.contains('maximized')) return;
                    isResizing = true;
                    this.bringToFront(win);
                    if (resizer.classList.contains('resizer-r')) resizeDir = 'r';
                    else if (resizer.classList.contains('resizer-b')) resizeDir = 'b';
                    else if (resizer.classList.contains('resizer-br')) resizeDir = 'br';

                    startX = e.clientX;
                    startY = e.clientY;
                    startW = parseInt(document.defaultView.getComputedStyle(win).width, 10);
                    startH = parseInt(document.defaultView.getComputedStyle(win).height, 10);
                    e.preventDefault();
                });
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

// Initialize the OS
window.app = new LinuxOS();
class TerminalParser {
    constructor() {
        this.input = document.getElementById('terminal-input');
        this.content = document.getElementById('terminal-content');
        this.history = [];
        this.historyIndex = -1;
        this.setup();

        // Initial Neofetch
        this.executeCommand('neofetch');
    }

    setup() {
        if (!this.input || !this.content) return;

        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = this.input.value.trim();
                this.input.value = '';
                if (cmd) {
                    this.history.push(cmd);
                    this.historyIndex = this.history.length;
                    this.executeCommand(cmd);
                } else {
                    this.printPrompt();
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

    printLine(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        div.className = 'mb-2';
        this.content.insertBefore(div, this.input.parentElement);
        this.content.scrollTop = this.content.scrollHeight;
    }

    printPrompt(command = '') {
        if (command) {
            this.printLine(`<span class="text-green-400 font-bold mr-2">sebastian@adwaita</span>:<span class="text-adwaita-blue font-bold mr-2">~</span>$ ${this.escapeHTML(command)}`);
        }
    }

    executeCommand(cmdRaw) {
        const args = cmdRaw.split(' ').filter(Boolean);
        const cmd = args[0].toLowerCase();

        this.printPrompt(cmdRaw);

        switch (cmd) {
            case 'help':
                this.printLine(`
                    <div class="text-gray-300">
                        Comandos disponibles:<br>
                        - <span class="text-adwaita-blue font-bold">whoami</span>: Mostrar información del usuario<br>
                        - <span class="text-adwaita-blue font-bold">clear</span>: Limpiar terminal<br>
                        - <span class="text-adwaita-blue font-bold">ls</span>: Listar directorio<br>
                        - <span class="text-adwaita-blue font-bold">neofetch</span>: Mostrar info del sistema<br>
                        - <span class="text-adwaita-blue font-bold">cat [archivo]</span>: Leer archivo<br>
                        - <span class="text-adwaita-blue font-bold">open [app]</span>: Abrir aplicación (projects, skills, contact)
                    </div>
                `);
                break;
            case 'whoami':
                this.printLine(`<div class="text-gray-100">Sebastian Duran Caballero</div>`);
                break;
            case 'clear':
                const children = Array.from(this.content.children);
                children.forEach(child => {
                    if (child !== this.input.parentElement) {
                        this.content.removeChild(child);
                    }
                });
                break;
            case 'ls':
                this.printLine(`<div class="text-adwaita-blue font-bold flex space-x-4"><span>description.txt</span><span>proyectos/</span><span>contacto.sh</span></div>`);
                break;
            case 'cat':
                if (args[1] === 'description.txt') {
                    this.printLine(`<div class="text-gray-100">Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.</div>`);
                } else {
                    this.printLine(`<div class="text-red-400">cat: ${this.escapeHTML(args[1] || '')}: No existe el archivo o directorio</div>`);
                }
                break;
            case 'neofetch':
                this.printLine(`
                    <div class="flex flex-col md:flex-row text-gray-100 mb-4">
                        <div class="mr-6 mb-4 md:mb-0 text-adwaita-blue text-xs sm:text-sm font-bold font-firacode whitespace-pre">
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
                        </div>
                        <div>
                            <p><span class="text-adwaita-blue font-bold">OS:</span> GNOME Adwaita OS x86_64</p>
                            <p><span class="text-adwaita-blue font-bold">Host:</span> Desarrollador Web</p>
                            <p><span class="text-adwaita-blue font-bold">Uptime:</span> 24/7 coding</p>
                            <p><span class="text-adwaita-blue font-bold">Packages:</span> HTML, CSS, JS, .NET, C#</p>
                            <p><span class="text-adwaita-blue font-bold">Shell:</span> bash 5.1.16</p>
                            <p><span class="text-adwaita-blue font-bold">Location:</span> Santa Cruz, Bolivia</p>
                            <p><span class="text-adwaita-blue font-bold">Email:</span> sd8587793@email.com</p>
                        </div>
                    </div>
                `);
                break;
            case 'open':
                const appName = args[1];
                if (['projects', 'skills', 'contact'].includes(appName)) {
                    if (window.app) window.app.openWindow(appName);
                    this.printLine(`<div class="text-green-400">Abriendo ${this.escapeHTML(appName)}...</div>`);
                } else {
                    this.printLine(`<div class="text-red-400">Aplicación no encontrada: ${this.escapeHTML(appName || '')}</div>`);
                }
                break;
            default:
                this.printLine(`<div class="text-red-400">${this.escapeHTML(cmd)}: comando no encontrado</div>`);
        }
        this.content.scrollTop = this.content.scrollHeight;
    }
}

// Initialize terminal after DOM loads
document.addEventListener('DOMContentLoaded', () => {
    window.terminalParser = new TerminalParser();
});
