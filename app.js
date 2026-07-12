class Terminal {
    constructor(os) {
        this.os = os;
        this.input = document.getElementById('terminal-input');
        this.history = document.getElementById('terminal-history');

        if(this.input) {
            this.input.addEventListener('keydown', (e) => {
                if(e.key === 'Enter') {
                    this.executeCommand(this.input.value);
                    this.input.value = '';
                }
            });
        }
    }

    echo(text, isHtml = false) {
        const div = document.createElement('div');
        div.className = 'mb-2';
        if (isHtml) {
            div.innerHTML = text;
        } else {
            div.textContent = text;
        }
        this.history.appendChild(div);

        // Scroll to bottom
        const container = document.getElementById('terminal-output');
        if(container) container.scrollTop = container.scrollHeight;
    }

    echoPrompt(cmd) {
        const div = document.createElement('div');
        div.className = 'mb-2';
        div.innerHTML = `<span class="text-green-400 font-bold whitespace-nowrap">sebastian@ubuntu</span><span class="text-white">:</span><span class="text-blue-400 font-bold whitespace-nowrap">~</span><span class="text-white mr-2">$</span> <span class="text-gray-200">${this.escapeHtml(cmd)}</span>`;
        this.history.appendChild(div);
    }

    escapeHtml(unsafe) {
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }

    executeCommand(cmd) {
        const trimmed = cmd.trim();
        if(!trimmed) {
            this.echoPrompt('');
            return;
        }

        this.echoPrompt(trimmed);

        const args = trimmed.split(/\s+/);
        const command = args[0].toLowerCase();

        switch(command) {
            case 'help':
                this.echo('Comandos disponibles:');
                this.echo('  help      - Muestra esta ayuda');
                this.echo('  whoami    - Muestra el usuario actual');
                this.echo('  clear     - Limpia la terminal');
                this.echo('  ls        - Lista los archivos del directorio');
                this.echo('  neofetch  - Muestra información del sistema');
                this.echo('  open <app>- Abre una aplicación (projects, skills, contact)');
                break;
            case 'whoami':
                this.echo('Sebastian Duran Caballero');
                break;
            case 'clear':
                this.history.innerHTML = '';
                break;
            case 'ls':
                this.echo('projects/  skills/  contact/  description.txt');
                break;
            case 'cat':
                if (args[1] === 'description.txt') {
                    this.echo('Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.');
                } else {
                    this.echo(`cat: ${args[1] ? this.escapeHtml(args[1]) : ''}: No such file or directory`);
                }
                break;
            case 'neofetch':
                const neofetchHtml = `
                    <div class="flex flex-col md:flex-row text-gray-100 mb-4">
                        <div class="mr-6 mb-4 md:mb-0 text-[#e95420] text-xs sm:text-sm font-bold">
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
                            <p><span class="text-[#e95420] font-bold">OS:</span> Ubuntu 22.04 LTS x86_64</p>
                            <p><span class="text-[#e95420] font-bold">Host:</span> Desarrollador Web</p>
                            <p><span class="text-[#e95420] font-bold">Uptime:</span> 24/7 coding</p>
                            <p><span class="text-[#e95420] font-bold">Packages:</span> HTML, CSS, JS, .NET, C#</p>
                            <p><span class="text-[#e95420] font-bold">Shell:</span> bash 5.1.16</p>
                            <p><span class="text-[#e95420] font-bold">Location:</span> Santa Cruz, Bolivia</p>
                            <p><span class="text-[#e95420] font-bold">Email:</span> sd8587793@email.com</p>
                        </div>
                    </div>`;
                this.echo(neofetchHtml, true);
                break;
            case 'open':
                const app = args[1];
                if (['projects', 'skills', 'contact'].includes(app)) {
                    this.os.openWindow(app);
                    this.echo(`Abriendo ${app}...`);
                } else {
                    this.echo(`Aplicación no encontrada: ${app ? this.escapeHtml(app) : ''}`);
                }
                break;
            default:
                this.echo(`${this.escapeHtml(command)}: command not found`);
        }
    }
}

class LinuxOS {
    constructor() {
        this.windows = document.querySelectorAll('.os-window');
        this.highestZIndex = 100;
        this.openWindows = new Set();
        
        this.terminal = new Terminal(this);
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
                // Run neofetch command after delay to allow window to open
                setTimeout(() => {
                    if (this.terminal && this.terminal.history.innerHTML === '') {
                       this.terminal.executeCommand('neofetch');
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

    setupResizableWindows() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            if (resizers.length === 0) return;

            let isResizing = false;
            let currentResizer;
            let originalWidth;
            let originalHeight;
            let originalMouseX;
            let originalMouseY;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    isResizing = true;
                    currentResizer = resizer;
                    originalWidth = parseFloat(getComputedStyle(win).getPropertyValue('width').replace('px', ''));
                    originalHeight = parseFloat(getComputedStyle(win).getPropertyValue('height').replace('px', ''));
                    originalMouseX = e.pageX;
                    originalMouseY = e.pageY;

                    window.addEventListener('mousemove', resize);
                    window.addEventListener('mouseup', stopResize);
                });
            });

            const resize = (e) => {
                if (!isResizing) return;

                if (currentResizer.classList.contains('resizer-br')) {
                    win.style.width = originalWidth + (e.pageX - originalMouseX) + 'px';
                    win.style.height = originalHeight + (e.pageY - originalMouseY) + 'px';
                } else if (currentResizer.classList.contains('resizer-r')) {
                    win.style.width = originalWidth + (e.pageX - originalMouseX) + 'px';
                } else if (currentResizer.classList.contains('resizer-b')) {
                    win.style.height = originalHeight + (e.pageY - originalMouseY) + 'px';
                }
            };

            const stopResize = () => {
                isResizing = false;
                window.removeEventListener('mousemove', resize);
                window.removeEventListener('mouseup', stopResize);
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