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

    setupWindowClickToFront() {
        this.windows.forEach(win => {
            win.addEventListener('mousedown', () => {
                this.bringToFront(win);
            });
        });
    }

    setupDraggableWindows() {
        const snapPreview = document.getElementById('snap-preview');

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

            // To restore properly after dragging from maximized state
            let wasMaximized = false;

            header.addEventListener('mousedown', dragStart);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);

            const osInstance = this;

            function dragStart(e) {
                if(e.target.closest('button')) return;

                if(win.classList.contains('maximized')) {
                    wasMaximized = true;
                    // Temporarily remove maximized class to calculate actual size
                    win.classList.remove('maximized');
                    win.style.transform = 'none'; // reset transform to measure correctly

                    const rect = win.getBoundingClientRect();

                    // Center mouse on header when unmaximizing
                    const newLeft = e.clientX - (rect.width / 2);

                    // Reset offsets for normal dragging logic
                    xOffset = newLeft;
                    yOffset = e.clientY - 28; // Adjust for top bar

                    win.style.left = '0';
                    win.style.top = '0';

                    setTranslate(xOffset, yOffset, win);
                } else {
                    wasMaximized = false;
                }

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

                    // Aero snap preview logic
                    if (e.clientY <= 28) { // Top bar height
                        snapPreview.classList.remove('hidden');
                    } else {
                        snapPreview.classList.add('hidden');
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

                // Aero snap apply logic
                if (e.clientY <= 28) { // If dropped near top edge
                    snapPreview.classList.add('hidden');
                    // Store current transform before maximizing so we can restore it later if clicked on maximize button
                    win.dataset.prevTransform = win.style.transform;
                    osInstance.maximizeWindow(win.dataset.id);
                }
            }
        });
    }

    setupResizableWindows() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    if(win.classList.contains('maximized')) return;

                    const rect = win.getBoundingClientRect();
                    const isRight = resizer.classList.contains('right');
                    const isBottom = resizer.classList.contains('bottom');
                    const isBottomRight = resizer.classList.contains('bottom-right');

                    let startX = e.clientX;
                    let startY = e.clientY;
                    let startWidth = rect.width;
                    let startHeight = rect.height;

                    const onMouseMove = (e) => {
                        if (isRight || isBottomRight) {
                            const newWidth = startWidth + (e.clientX - startX);
                            win.style.width = `${newWidth}px`;
                        }
                        if (isBottom || isBottomRight) {
                            const newHeight = startHeight + (e.clientY - startY);
                            win.style.height = `${newHeight}px`;
                        }
                    };

                    const onMouseUp = () => {
                        document.removeEventListener('mousemove', onMouseMove);
                        document.removeEventListener('mouseup', onMouseUp);
                    };

                    document.addEventListener('mousemove', onMouseMove);
                    document.addEventListener('mouseup', onMouseUp);
                });
            });
        });
    }

    setupTerminal() {
        const input = document.getElementById('terminal-input');
        const output = document.getElementById('terminal-output');
        if (!input || !output) return;

        // Populate initial commands
        this.executeCommand('whoami', output);
        this.executeCommand('neofetch', output);

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = input.value.trim();
                input.value = '';

                if (cmd) {
                    this.executeCommand(cmd, output);
                }
            }
        });
    }

    executeCommand(cmd, outputEl) {
        // Echo command
        const cmdLine = document.createElement('div');
        cmdLine.className = 'mb-2';
        cmdLine.innerHTML = `<span class="text-green-400 font-bold">sebastian@ubuntu</span>:<span class="text-blue-400 font-bold">~</span>$ `;

        const cmdText = document.createElement('span');
        cmdText.textContent = cmd;
        cmdLine.appendChild(cmdText);

        outputEl.appendChild(cmdLine);

        // Process command
        const args = cmd.split(' ').filter(c => c.trim() !== '');
        const mainCmd = args[0].toLowerCase();

        const response = document.createElement('div');
        response.className = 'text-gray-100 mb-4';

        switch (mainCmd) {
            case 'help':
                response.innerHTML = `Comandos disponibles:<br>
                &nbsp;&nbsp;help&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Muestra esta ayuda<br>
                &nbsp;&nbsp;whoami&nbsp;&nbsp;&nbsp;- Muestra información del usuario actual<br>
                &nbsp;&nbsp;clear&nbsp;&nbsp;&nbsp;&nbsp;- Limpia la terminal<br>
                &nbsp;&nbsp;ls&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Lista los archivos del directorio<br>
                &nbsp;&nbsp;neofetch&nbsp;- Muestra información del sistema<br>
                &nbsp;&nbsp;cat&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Lee un archivo (ej: cat description.txt)<br>
                &nbsp;&nbsp;open&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Abre una aplicación (ej: open projects)`;
                break;
            case 'whoami':
                response.textContent = 'Sebastian Duran Caballero';
                break;
            case 'clear':
                outputEl.innerHTML = '';
                return; // exit early
            case 'ls':
                response.innerHTML = `description.txt&nbsp;&nbsp;&nbsp;&nbsp;projects&nbsp;&nbsp;&nbsp;&nbsp;skills&nbsp;&nbsp;&nbsp;&nbsp;contact`;
                break;
            case 'cat':
                if (args.length > 1 && args[1] === 'description.txt') {
                    response.textContent = 'Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.';
                } else if (args.length > 1) {
                    response.textContent = `cat: ${args[1]}: No such file or directory`;
                } else {
                    response.textContent = 'Uso: cat [archivo]';
                }
                break;
            case 'open':
                 if (args.length > 1) {
                    const app = args[1].toLowerCase();
                    if (['projects', 'skills', 'contact'].includes(app)) {
                        this.openWindow(app);
                        response.textContent = `Abriendo ${app}...`;
                    } else {
                        response.textContent = `open: aplicación '${app}' no encontrada`;
                    }
                 } else {
                     response.textContent = 'Uso: open [aplicación]';
                 }
                 break;
            case 'neofetch':
                response.innerHTML = `
                    <div class="flex flex-col md:flex-row text-gray-100 mb-4 font-ubuntu-mono">
                        <div class="mr-6 mb-4 md:mb-0 text-[#e95420] text-xs sm:text-sm font-bold whitespace-pre">
       _,-/\`--,-/\-,
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
       \`-----'</div>
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
                break;
            default:
                response.textContent = `${mainCmd}: orden no encontrada. Escribe 'help' para ver los comandos disponibles.`;
        }

        outputEl.appendChild(response);

        // Scroll to bottom
        const container = document.getElementById('terminal-content');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
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