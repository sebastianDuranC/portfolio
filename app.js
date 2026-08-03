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
        this.setupWindowResizing();
        this.setupWindowClickToFront();
        this.setupLogin();
        this.setupTerminal();
    }

    setupTerminal() {
        const terminalInput = document.getElementById('terminal-input');
        const terminalContent = document.getElementById('terminal-content');
        const terminalOutput = document.getElementById('terminal-output');

        if (!terminalInput || !terminalContent || !terminalOutput) return;

        // Keep focus on input when clicking inside terminal content
        terminalContent.addEventListener('click', () => {
            const selection = window.getSelection();
            if (selection.toString().length === 0) {
                terminalInput.focus();
            }
        });

        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = terminalInput.value.trim();
                terminalInput.value = '';
                this.executeTerminalCommand(cmd, terminalOutput, terminalContent);
            }
        });
    }

    executeTerminalCommand(cmd, outputElement, scrollElement) {
        // Echo command
        const cmdLine = document.createElement('div');
        cmdLine.className = 'mb-2';
        cmdLine.innerHTML = `<span class="text-green-400 font-bold">sebastian@ubuntu</span>:<span class="text-blue-400 font-bold">~</span>$ `;

        const cmdText = document.createElement('span');
        cmdText.textContent = cmd; // Prevents XSS when echoing input
        cmdLine.appendChild(cmdText);

        outputElement.appendChild(cmdLine);

        if (cmd === '') {
            this.scrollTerminal(scrollElement);
            return;
        }

        const args = cmd.split(' ');
        const baseCmd = args[0].toLowerCase();

        const responseLine = document.createElement('div');
        responseLine.className = 'text-gray-100 mb-4 whitespace-pre-wrap';

        switch (baseCmd) {
            case 'help':
                responseLine.textContent = `Comandos disponibles:
  help       - Muestra este mensaje
  whoami     - Muestra el usuario actual
  clear      - Limpia la terminal
  ls         - Lista archivos o ventanas disponibles
  neofetch   - Muestra información del sistema
  cat <file> - Muestra el contenido de un archivo
  open <app> - Abre una aplicación (ej. open projects)`;
                break;
            case 'whoami':
                responseLine.textContent = 'Sebastian Duran Caballero';
                break;
            case 'clear':
                outputElement.innerHTML = '';
                this.scrollTerminal(scrollElement);
                return; // Return early, don't append empty responseLine
            case 'ls':
                responseLine.textContent = 'description.txt\nprojects/\nskills/\ncontact/';
                break;
            case 'neofetch':
                responseLine.innerHTML = `
<div class="flex flex-col md:flex-row text-gray-100 mb-4">
    <div class="mr-6 mb-4 md:mb-0 text-[#e95420] text-xs sm:text-sm font-bold">
<pre>
       _,-/&#x60;--,-/\\-,
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
                break;
            case 'cat':
                if (args.length > 1 && args[1] === 'description.txt') {
                    responseLine.textContent = 'Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.';
                } else {
                    responseLine.textContent = `cat: ${args[1] ? args[1] : ''}: No existe el archivo o directorio`;
                }
                break;
            case 'open':
                if (args.length > 1) {
                    const appName = args[1].toLowerCase();
                    if (['projects', 'skills', 'contact', 'terminal'].includes(appName)) {
                        this.openWindow(appName);
                        responseLine.textContent = `Abriendo ${appName}...`;
                    } else {
                        responseLine.textContent = `open: Aplicación '${appName}' no encontrada.`;
                    }
                } else {
                    responseLine.textContent = `open: Falta el argumento de la aplicación`;
                }
                break;
            default:
                responseLine.textContent = `${baseCmd}: orden no encontrada`;
        }

        outputElement.appendChild(responseLine);
        this.scrollTerminal(scrollElement);
    }

    scrollTerminal(scrollElement) {
        // Use timeout to ensure DOM update before scroll
        setTimeout(() => {
            scrollElement.scrollTop = scrollElement.scrollHeight;
        }, 10);
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

    setupWindowResizing() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer;
            let originalWidth;
            let originalHeight;
            let originalMouseX;
            let originalMouseY;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', function(e) {
                    e.preventDefault();
                    isResizing = true;
                    currentResizer = resizer;
                    const rect = win.getBoundingClientRect();
                    originalWidth = rect.width;
                    originalHeight = rect.height;
                    originalMouseX = e.pageX;
                    originalMouseY = e.pageY;

                    // Apply window active class explicitly
                    win.classList.add('window-active');

                    window.addEventListener('mousemove', resize);
                    window.addEventListener('mouseup', stopResize);
                });
            });

            function resize(e) {
                if (!isResizing) return;

                // Don't resize if maximized
                if (win.classList.contains('maximized')) return;

                if (currentResizer.classList.contains('resizer-r')) {
                    const width = originalWidth + (e.pageX - originalMouseX);
                    win.style.width = width + 'px';
                } else if (currentResizer.classList.contains('resizer-b')) {
                    const height = originalHeight + (e.pageY - originalMouseY);
                    win.style.height = height + 'px';
                } else if (currentResizer.classList.contains('resizer-br')) {
                    const width = originalWidth + (e.pageX - originalMouseX);
                    const height = originalHeight + (e.pageY - originalMouseY);
                    win.style.width = width + 'px';
                    win.style.height = height + 'px';
                }
            }

            function stopResize() {
                isResizing = false;
                window.removeEventListener('mousemove', resize);
                window.removeEventListener('mouseup', stopResize);
            }
        });
    }

    setupDraggableWindows() {
        const snapPreview = document.getElementById('aero-snap-preview');

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
            let isSnapped = false;

            // Bind explicitly so we can call app.maximizeWindow correctly if needed
            const self = this;

            header.addEventListener('mousedown', dragStart);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);

            function dragStart(e) {
                // Don't drag if maximizing/closing buttons are clicked
                if(e.target.closest('button')) return;

                if (win.classList.contains('maximized')) {
                    // Start dragging from maximized state
                    win.classList.remove('maximized');
                    isSnapped = false;

                    // Temporarily remove transform to get un-transformed base coordinates
                    win.style.transform = 'none';
                    const rect = win.getBoundingClientRect();

                    // The window jumps back to its original width.
                    // We need to place it under the mouse.
                    const newX = e.clientX - (rect.width / 2);
                    const newY = e.clientY - 10; // offset slightly from top

                    xOffset = newX;
                    yOffset = newY;
                    setTranslate(newX, newY, win);
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

                    // Check for Aero Snap (near top edge)
                    if (e.clientY <= 5) {
                        snapPreview.classList.add('maximized-snap-preview');
                    } else {
                        snapPreview.classList.remove('maximized-snap-preview');
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

                // Execute Aero Snap if preview is active
                if (snapPreview && snapPreview.classList.contains('maximized-snap-preview')) {
                    snapPreview.classList.remove('maximized-snap-preview');
                    self.maximizeWindow(win.dataset.id);
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
const app = new LinuxOS();