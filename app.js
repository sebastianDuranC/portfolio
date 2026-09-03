class TerminalParser {
    constructor() {
        this.input = document.getElementById('terminal-input');
        this.output = document.getElementById('terminal-output');
        this.commands = {
            'help': this.help.bind(this),
            'whoami': this.whoami.bind(this),
            'clear': this.clear.bind(this),
            'ls': this.ls.bind(this),
            'neofetch': this.neofetch.bind(this),
            'cat': this.cat.bind(this),
            'open': this.open.bind(this)
        };

        this.init();
    }

    init() {
        if(!this.input || !this.output) return;

        // Initial setup
        this.output.innerHTML = '';
        this.neofetch();

        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const commandLine = this.input.value.trim();
                if (commandLine) {
                    this.execute(commandLine);
                }
                this.input.value = '';
            }
        });
    }

    echo(command) {
        const line = document.createElement('p');
        line.className = 'mb-2';
        line.innerHTML = '<span class="text-green-400 font-bold">sebastian@ubuntu</span>:<span class="text-blue-400 font-bold">~</span>$ ' + this.escapeHTML(command);
        this.output.appendChild(line);
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

    execute(commandLine) {
        this.echo(commandLine);
        const args = commandLine.split(' ');
        const cmd = args.shift().toLowerCase();

        if (this.commands[cmd]) {
            this.commands[cmd](args);
        } else {
            const errorLine = document.createElement('p');
            errorLine.className = 'text-gray-100 mb-4';
            errorLine.textContent = `bash: ${cmd}: orden no encontrada`;
            this.output.appendChild(errorLine);
        }

        // Scroll to bottom
        this.output.parentElement.scrollTop = this.output.parentElement.scrollHeight;
    }

    help() {
        const out = document.createElement('p');
        out.className = 'text-gray-100 mb-4 whitespace-pre-line';
        out.textContent = `Comandos disponibles:
  help       - Muestra este mensaje
  whoami     - Muestra el usuario actual
  clear      - Limpia la terminal
  ls         - Lista archivos
  neofetch   - Muestra información del sistema
  cat [file] - Muestra el contenido de un archivo
  open [app] - Abre una aplicación (ej: open projects)`;
        this.output.appendChild(out);
    }

    whoami() {
        const out = document.createElement('p');
        out.className = 'text-gray-100 mb-4';
        out.textContent = 'Sebastian Duran Caballero';
        this.output.appendChild(out);
    }

    clear() {
        this.output.innerHTML = '';
    }

    ls() {
        const out = document.createElement('div');
        out.className = 'text-gray-100 mb-4 flex space-x-4';
        out.innerHTML = '<span class="text-blue-400 font-bold">Proyectos</span> <span class="text-blue-400 font-bold">Habilidades</span> description.txt';
        this.output.appendChild(out);
    }

    cat(args) {
        const out = document.createElement('p');
        out.className = 'text-gray-100 mb-4';
        if(args.length === 0) {
            out.textContent = 'cat: falta un operando';
        } else if (args[0] === 'description.txt') {
            out.textContent = 'Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.';
        } else {
            out.textContent = `cat: ${args[0]}: No existe el archivo o el directorio`;
        }
        this.output.appendChild(out);
    }

    open(args) {
        if(args.length === 0) {
            const out = document.createElement('p');
            out.className = 'text-gray-100 mb-4';
            out.textContent = 'open: falta argumento. Uso: open [app]';
            this.output.appendChild(out);
            return;
        }

        const appName = args[0].toLowerCase();
        if(window.app && typeof window.app.openWindow === 'function') {
            if(['projects', 'skills', 'contact'].includes(appName)) {
                 window.app.openWindow(appName);
            } else {
                const out = document.createElement('p');
                out.className = 'text-gray-100 mb-4';
                out.textContent = `Aplicación no encontrada: ${appName}`;
                this.output.appendChild(out);
            }
        }
    }

    neofetch() {
        const out = document.createElement('div');
        out.className = 'flex flex-col md:flex-row text-gray-100 mb-4';
        out.innerHTML = `
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
        `;
        this.output.appendChild(out);
    }
}

class LinuxOS {
    constructor() {
        this.windows = document.querySelectorAll('.os-window');
        this.highestZIndex = 100;
        this.openWindows = new Set();
        this.terminalParser = new TerminalParser();
        
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
            let currentResizer = null;
            let currentX, currentY, initialX, initialY, xOffset = 0, yOffset = 0;
            let startWidth, startHeight, startX, startY;

            header.addEventListener('mousedown', dragStart);

            // Setup resizing
            const resizers = win.querySelectorAll('.resizer');
            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    if (win.classList.contains('maximized')) return;
                    isResizing = true;
                    currentResizer = resizer;
                    startX = e.clientX;
                    startY = e.clientY;
                    startWidth = parseInt(document.defaultView.getComputedStyle(win).width, 10);
                    startHeight = parseInt(document.defaultView.getComputedStyle(win).height, 10);
                    e.preventDefault(); // Prevent text selection
                });
            });

            document.addEventListener('mousemove', (e) => {
                if (isDragging) drag(e);
                if (isResizing) resize(e);
            });
            document.addEventListener('mouseup', (e) => {
                if (isDragging) dragEnd(e);
                if (isResizing) {
                    isResizing = false;
                    currentResizer = null;
                }
            });

            function dragStart(e) {
                if(e.target.closest('button')) return;

                if (win.classList.contains('maximized')) {
                    // Aero snap restore
                    app.maximizeWindow(win.dataset.id);
                    // Recalculate offsets so the window jumps to mouse position properly
                    const rect = win.getBoundingClientRect();
                    const desktopRect = document.getElementById('desktop').getBoundingClientRect();

                    xOffset = e.clientX - desktopRect.left - (rect.width / 2);
                    // Prevent window from going above the desktop container
                    yOffset = Math.max(0, e.clientY - desktopRect.top - (header.offsetHeight / 2));

                    setTranslate(xOffset, yOffset, win);
                }

                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;
                }
            }

            function drag(e) {
                e.preventDefault();

                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;

                xOffset = currentX;
                yOffset = currentY;

                // Aero snap to top
                const desktopRect = document.getElementById('desktop').getBoundingClientRect();
                if (e.clientY <= desktopRect.top + 5) { // 5px threshold
                    // Shows a visual cue before dropping could be added here
                }

                setTranslate(currentX, currentY, win);
            }

            function setTranslate(xPos, yPos, el) {
                el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
            }

            function dragEnd(e) {
                if (!isDragging) return;
                initialX = currentX;
                initialY = currentY;
                isDragging = false;

                // Aero snap maximize
                const desktopRect = document.getElementById('desktop').getBoundingClientRect();
                if (e.clientY <= desktopRect.top + 10) {
                     app.maximizeWindow(win.dataset.id);
                }
            }

            function resize(e) {
                if(currentResizer.classList.contains('resizer-r')) {
                    win.style.width = startWidth + (e.clientX - startX) + 'px';
                } else if(currentResizer.classList.contains('resizer-b')) {
                    win.style.height = startHeight + (e.clientY - startY) + 'px';
                } else if(currentResizer.classList.contains('resizer-br')) {
                    win.style.width = startWidth + (e.clientX - startX) + 'px';
                    win.style.height = startHeight + (e.clientY - startY) + 'px';
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