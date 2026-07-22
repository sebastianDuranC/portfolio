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

    setupWindowClickToFront() {
        this.windows.forEach(win => {
            win.addEventListener('mousedown', () => {
                this.bringToFront(win);
            });
        });
    }

    setupDraggableWindows() {
        // Create snap preview element
        const snapPreview = document.createElement('div');
        snapPreview.classList.add('maximized-snap-preview', 'hidden');
        document.getElementById('windows-container').appendChild(snapPreview);

        this.windows.forEach(win => {
            const header = win.querySelector('.window-header');
            if (!header) return;

            let isDragging = false;
            let startX, startY;
            let initialLeft, initialTop;
            let shouldSnap = false;

            const dragStart = (e) => {
                if (e.target.closest('button')) return;

                if (win.classList.contains('maximized')) {
                    // Start dragging out of maximized state
                    win.classList.remove('maximized');
                    // Calculate a reasonable position based on mouse click
                    const rect = win.getBoundingClientRect();
                    const ratioX = e.clientX / window.innerWidth;

                    // Reset to inline styles size (or default)
                    let w = parseInt(win.style.width) || 600;

                    // Center the window at the mouse cursor
                    let newLeft = e.clientX - (w * ratioX);
                    let newTop = e.clientY - 15; // approximate half header height

                    win.style.left = `${newLeft}px`;
                    win.style.top = `${newTop}px`;
                    win.style.transform = 'none';

                    // Trigger drag logic normally from this new position
                }

                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;

                // Parse current position, falling back to computed style
                const computed = window.getComputedStyle(win);
                initialLeft = parseInt(win.style.left) || parseInt(computed.left) || 0;
                initialTop = parseInt(win.style.top) || parseInt(computed.top) || 0;

                // Disable transition during drag for smoothness
                win.style.transition = 'none';

                // Reset transform if it exists from previous mechanics
                win.style.transform = 'none';

                this.bringToFront(win);
            };

            const drag = (e) => {
                if (!isDragging) return;
                e.preventDefault();

                const dx = e.clientX - startX;
                const dy = e.clientY - startY;

                win.style.left = `${initialLeft + dx}px`;
                win.style.top = `${initialTop + dy}px`;

                // Aero Snap Logic
                if (e.clientY <= 28) {
                    shouldSnap = true;
                    snapPreview.classList.remove('hidden');
                } else {
                    shouldSnap = false;
                    snapPreview.classList.add('hidden');
                }
            };

            const dragEnd = (e) => {
                if (!isDragging) return;
                isDragging = false;

                // Restore transition
                win.style.transition = 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.2s ease-out';

                if (shouldSnap) {
                    this.maximizeWindow(win.dataset.id);
                    shouldSnap = false;
                    snapPreview.classList.add('hidden');
                }
            };

            header.addEventListener('mousedown', dragStart);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);
        });
    }

    setupResizers() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer;
            let startX, startY;
            let startWidth, startHeight;

            const mousedown = (e) => {
                isResizing = true;
                currentResizer = e.target;
                startX = e.clientX;
                startY = e.clientY;

                // Get current size
                const computed = window.getComputedStyle(win);
                startWidth = parseInt(computed.width, 10);
                startHeight = parseInt(computed.height, 10);

                // Disable transitions while resizing
                win.style.transition = 'none';
                e.preventDefault();
            };

            const mousemove = (e) => {
                if (!isResizing) return;

                if (currentResizer.classList.contains('resizer-r') || currentResizer.classList.contains('resizer-br')) {
                    win.style.width = startWidth + (e.clientX - startX) + 'px';
                }

                if (currentResizer.classList.contains('resizer-b') || currentResizer.classList.contains('resizer-br')) {
                    win.style.height = startHeight + (e.clientY - startY) + 'px';
                }
            };

            const mouseup = () => {
                if (isResizing) {
                    isResizing = false;
                    // Restore transitions
                    win.style.transition = 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.2s ease-out';
                }
            };

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', mousedown);
            });
            document.addEventListener('mousemove', mousemove);
            document.addEventListener('mouseup', mouseup);
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

    setupTerminal() {
        const input = document.getElementById('terminal-input');
        const output = document.getElementById('terminal-output');
        const terminalContent = document.getElementById('terminal-content');

        if (!input || !output) return;

        const printLine = (html) => {
            const div = document.createElement('div');
            div.innerHTML = html;
            div.className = 'mb-2 text-gray-100';
            output.appendChild(div);
            terminalContent.scrollTop = terminalContent.scrollHeight;
        };

        const printText = (text) => {
            const div = document.createElement('div');
            div.textContent = text;
            div.className = 'mb-2 text-gray-100';
            output.appendChild(div);
            terminalContent.scrollTop = terminalContent.scrollHeight;
        };

        // Welcome message
        printLine('Bienvenido a Ubuntu 22.04.4 LTS (GNU/Linux 5.15.0-101-generic x86_64)<br><br> * Documentation:  <a href="https://help.ubuntu.com" class="text-blue-400 hover:underline">https://help.ubuntu.com</a><br> * Management:     <a href="https://landscape.canonical.com" class="text-blue-400 hover:underline">https://landscape.canonical.com</a><br> * Support:        <a href="https://ubuntu.com/pro" class="text-blue-400 hover:underline">https://ubuntu.com/pro</a><br><br>Escribe <span class="text-green-400 font-bold">help</span> para ver los comandos disponibles.<br>');

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = input.value.trim();
                input.value = '';

                // Echo the command safely
                const echoDiv = document.createElement('div');
                echoDiv.className = 'mb-2';
                echoDiv.innerHTML = `<span class="text-green-400 font-bold">sebastian@ubuntu</span>:<span class="text-blue-400 font-bold">~</span>$ `;
                const cmdText = document.createElement('span');
                cmdText.textContent = cmd;
                echoDiv.appendChild(cmdText);
                output.appendChild(echoDiv);

                if (cmd) {
                    this.processCommand(cmd, printLine, printText, output);
                }

                terminalContent.scrollTop = terminalContent.scrollHeight;
            }
        });

        // Focus input when clicking anywhere in terminal
        terminalContent.addEventListener('click', () => {
            input.focus();
        });
    }

    processCommand(cmd, printLine, printText, output) {
        const args = cmd.split(' ');
        const command = args[0].toLowerCase();

        switch (command) {
            case 'help':
                printLine(`Comandos disponibles:<br>
                <span class="text-green-400">help</span>      - Muestra este mensaje de ayuda<br>
                <span class="text-green-400">whoami</span>    - Muestra el usuario actual<br>
                <span class="text-green-400">neofetch</span>  - Muestra la información del sistema<br>
                <span class="text-green-400">clear</span>     - Limpia la terminal<br>
                <span class="text-green-400">ls</span>        - Lista los archivos del directorio<br>
                <span class="text-green-400">cat</span>       - Muestra el contenido de un archivo (ej: cat description.txt)<br>
                <span class="text-green-400">open</span>      - Abre una aplicación (ej: open projects)`);
                break;
            case 'whoami':
                printText('Sebastian Duran Caballero');
                break;
            case 'clear':
                output.innerHTML = '';
                break;
            case 'ls':
                printLine('<span class="text-blue-400 font-bold mr-4">projects/</span> <span class="text-blue-400 font-bold mr-4">skills/</span> <span class="text-blue-400 font-bold mr-4">contact/</span> <span class="text-gray-200">description.txt</span>');
                break;
            case 'cat':
                if (args[1] === 'description.txt') {
                    printText('Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.');
                } else if (!args[1]) {
                    printText('cat: falta el nombre del archivo. Prueba con "cat description.txt"');
                } else {
                    printText(`cat: ${args[1]}: No existe el archivo o el directorio`);
                }
                break;
            case 'open':
                if (args[1]) {
                    const validApps = ['projects', 'skills', 'contact', 'terminal'];
                    if (validApps.includes(args[1].toLowerCase())) {
                        this.openWindow(args[1].toLowerCase());
                        printText(`Abriendo ${args[1]}...`);
                    } else {
                        printText(`Aplicación no encontrada: ${args[1]}`);
                    }
                } else {
                    printText('Especifica una aplicación. (ej: open projects)');
                }
                break;
            case 'neofetch':
                printLine(`
                    <div class="flex flex-col md:flex-row text-gray-100 mb-4 whitespace-pre-wrap">
                        <div class="mr-6 mb-4 md:mb-0 text-[#e95420] text-xs sm:text-sm font-bold">
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
                    </div>`);
                break;
            default:
                printText(`${command}: comando no encontrado`);
        }
    }
}

// Initialize the OS
const app = new LinuxOS();