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
        this.setupTerminal();
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



    setupTerminal() {
        this.terminalOutput = document.getElementById('terminal-output');
        this.terminalInput = document.getElementById('terminal-input');

        if (!this.terminalInput) return;

        // Setup initial text
        this.echo('whoami', 'cmd');
        this.echo('Sebastian Duran Caballero');
        this.echo('');
        this.echo('neofetch', 'cmd');
        this.echo(`
<div class="flex flex-col md:flex-row text-gray-100 mb-4">
    <div class="mr-6 mb-4 md:mb-0 text-[#3584e4] text-xs sm:text-sm font-bold">
<pre>
       _,-/\`--,-/\-,
     ,' /   ,-'   ) \
   ,'  |  ,'     /   \
  /    | /      /     \
 /      /      /      |
|      /      /       |
|      |     /        |
|      |    /         |
 \     |   /         /
  \    |  /         /
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
</div>`, 'html');

        this.terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = this.terminalInput.value.trim();
                this.terminalInput.value = '';
                this.executeCommand(cmd);
            }
        });
    }

    echo(text, type = 'text') {
        const div = document.createElement('div');
        div.className = 'mb-2';

        if (type === 'cmd') {
            div.innerHTML = `<span class="text-green-400 font-bold">sebastian@adwaita</span>:<span class="text-blue-400 font-bold">~</span>$ ${this.escapeHTML(text)}`;
        } else if (type === 'html') {
            div.innerHTML = text; // Trusted HTML only!
        } else {
            div.textContent = text;
            div.className = 'text-gray-100 mb-4';
        }

        this.terminalOutput.appendChild(div);

        // Scroll to bottom
        const container = document.getElementById('terminal-content');
        container.scrollTop = container.scrollHeight;
    }

    escapeHTML(str) {
        return str.replace(/[&<>'"]/g, tag => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
        }[tag] || tag));
    }

    executeCommand(cmd) {
        if (!cmd) {
            this.echo('', 'cmd');
            return;
        }

        this.echo(cmd, 'cmd');
        const args = cmd.split(' ');
        const command = args[0].toLowerCase();

        switch (command) {
            case 'help':
                this.echo('Comandos disponibles:');
                this.echo('  help      - Muestra este mensaje');
                this.echo('  whoami    - Muestra el usuario actual');
                this.echo('  clear     - Limpia la pantalla');
                this.echo('  ls        - Lista los archivos');
                this.echo('  cat       - Muestra el contenido de un archivo (ej: cat description.txt)');
                this.echo('  neofetch  - Muestra la información del sistema');
                this.echo('  open      - Abre una aplicación (ej: open projects)');
                break;
            case 'whoami':
                this.echo('Sebastian Duran Caballero');
                break;
            case 'clear':
                this.terminalOutput.innerHTML = '';
                break;
            case 'ls':
                this.echo('description.txt  projects/  skills/  contact/');
                break;
            case 'cat':
                if (args[1] === 'description.txt') {
                    this.echo('Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.');
                } else if (!args[1]) {
                    this.echo('Falta un operando');
                } else {
                    this.echo(`cat: ${this.escapeHTML(args[1])}: No existe el archivo o directorio`);
                }
                break;
            case 'neofetch':
                this.echo(`
<div class="flex flex-col md:flex-row text-gray-100 mb-4">
    <div class="mr-6 mb-4 md:mb-0 text-[#3584e4] text-xs sm:text-sm font-bold">
<pre>
       _,-/\`--,-/\-,
     ,' /   ,-'   ) \
   ,'  |  ,'     /   \
  /    | /      /     \
 /      /      /      |
|      /      /       |
|      |     /        |
|      |    /         |
 \     |   /         /
  \    |  /         /
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
</div>`, 'html');
                break;
            case 'open':
                if (args[1]) {
                    const validApps = ['projects', 'skills', 'contact', 'terminal'];
                    if (validApps.includes(args[1])) {
                        this.openWindow(args[1]);
                    } else {
                        this.echo(`No se encontro la aplicacion: ${this.escapeHTML(args[1])}`);
                    }
                } else {
                    this.echo('Especifique una aplicacion para abrir');
                }
                break;
            default:
                this.echo(`Comando no encontrado: ${this.escapeHTML(command)}. Escriba 'help' para ver los comandos.`);
        }
    }


    setupResizers() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer;
            let startX, startY, startWidth, startHeight, startLeft, startTop;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    isResizing = true;
                    currentResizer = resizer;
                    startX = e.clientX;
                    startY = e.clientY;

                    // Get current dimensions and position, including transform
                    const rect = win.getBoundingClientRect();
                    startWidth = rect.width;
                    startHeight = rect.height;

                    // Compute effective top and left considering margins/offsets in DOM
                    const computedStyle = window.getComputedStyle(win);
                    startLeft = parseFloat(computedStyle.left) || 0;
                    startTop = parseFloat(computedStyle.top) || 0;

                    // Incorporate translate3d values if present
                    const transform = computedStyle.transform;
                    let xOffset = 0;
                    let yOffset = 0;
                    if(transform !== 'none') {
                        const matrix = new DOMMatrix(transform);
                        xOffset = matrix.m41;
                        yOffset = matrix.m42;
                    }

                    // Convert translate to absolute left/top so resizing works predictably
                    win.style.transform = 'none';
                    win.style.left = (startLeft + xOffset) + 'px';
                    win.style.top = (startTop + yOffset) + 'px';

                    startLeft = parseFloat(win.style.left);
                    startTop = parseFloat(win.style.top);

                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                });
            });

            const handleMouseMove = (e) => {
                if (!isResizing) return;
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;

                if (currentResizer.classList.contains('right') || currentResizer.classList.contains('bottom-right')) {
                    win.style.width = `${startWidth + dx}px`;
                }

                if (currentResizer.classList.contains('bottom') || currentResizer.classList.contains('bottom-right')) {
                    win.style.height = `${startHeight + dy}px`;
                }
            };

            const handleMouseUp = () => {
                isResizing = false;
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
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
                if(e.target.closest('button')) return;

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;

                    if(win.classList.contains('maximized')) {
                        win.classList.remove('maximized');

                        // Temporarily set transform to none to get real layout rect
                        win.style.transform = 'none';
                        const rect = win.getBoundingClientRect();

                        // Calculate new xOffset based on mouse position so it snaps to cursor
                        // Instead of centering, let's keep it relative to the mouse X if possible,
                        // but ensure it stays within bounds.
                        const targetLeft = Math.max(0, e.clientX - (rect.width / 2));
                        xOffset = targetLeft - rect.left;

                        // The top should be at the mouse cursor basically, or slightly offset
                        const topBarHeight = 28;
                        const targetTop = Math.max(topBarHeight, e.clientY - 20);
                        yOffset = targetTop - rect.top;

                        setTranslate(xOffset, yOffset, win);
                    }

                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;
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