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
        this.setupTerminal();
        this.setupWindowResizing();
    }

    setupWindowResizing() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer;
            let startX;
            let startY;
            let startWidth;
            let startHeight;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    if(win.classList.contains('maximized')) return;
                    isResizing = true;
                    currentResizer = resizer;
                    startX = e.clientX;
                    startY = e.clientY;
                    startWidth = parseInt(document.defaultView.getComputedStyle(win).width, 10);
                    startHeight = parseInt(document.defaultView.getComputedStyle(win).height, 10);

                    e.preventDefault();
                    this.bringToFront(win);
                });
            });

            document.addEventListener('mousemove', (e) => {
                if (!isResizing) return;

                if (currentResizer.classList.contains('resizer-r')) {
                    win.style.width = startWidth + (e.clientX - startX) + 'px';
                } else if (currentResizer.classList.contains('resizer-b')) {
                    win.style.height = startHeight + (e.clientY - startY) + 'px';
                } else if (currentResizer.classList.contains('resizer-br')) {
                    win.style.width = startWidth + (e.clientX - startX) + 'px';
                    win.style.height = startHeight + (e.clientY - startY) + 'px';
                }
            });

            document.addEventListener('mouseup', () => {
                isResizing = false;
            });
        });
    }

    setupTerminal() {
        this.terminalOutput = document.getElementById('terminal-output');
        this.terminalInput = document.getElementById('terminal-input');

        if (!this.terminalOutput || !this.terminalInput) return;

        // Run neofetch immediately on init to match previous behavior
        this.executeCommand('neofetch');

        this.terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = this.terminalInput.value.trim();
                if (command) {
                    this.executeCommand(command);
                } else {
                    // Empty command just prints prompt
                    this.printPrompt();
                }
                this.terminalInput.value = '';

                // Scroll to bottom
                const terminalContent = document.getElementById('terminal-content');
                if (terminalContent) {
                    terminalContent.scrollTop = terminalContent.scrollHeight;
                }
            }
        });
    }

    printPrompt(command = '') {
        const promptDiv = document.createElement('div');
        promptDiv.className = 'mb-2';
        promptDiv.innerHTML = `<span class="text-green-400 font-bold">sebastian@ubuntu</span>:<span class="text-blue-400 font-bold">~</span>$ <span class="command-text"></span>`;
        if (command) {
            promptDiv.querySelector('.command-text').textContent = command;
        }
        this.terminalOutput.appendChild(promptDiv);
    }

    executeCommand(command) {
        if (command !== 'clear' && command !== 'neofetch') {
            this.printPrompt(command);
        }

        const args = command.split(' ');
        const cmd = args[0].toLowerCase();

        switch (cmd) {
            case 'help':
                this.printLine('Comandos disponibles:');
                this.printLine('  help      - Muestra este mensaje');
                this.printLine('  whoami    - Muestra el usuario actual');
                this.printLine('  clear     - Limpia la terminal');
                this.printLine('  ls        - Lista los archivos del directorio');
                this.printLine('  neofetch  - Muestra información del sistema');
                this.printLine('  cat       - Lee el contenido de un archivo (ej: cat description.txt)');
                this.printLine('  open      - Abre una aplicación (ej: open projects, open skills, open contact)');
                break;
            case 'whoami':
                this.printLine('Sebastian Duran Caballero');
                break;
            case 'clear':
                this.terminalOutput.innerHTML = '';
                break;
            case 'ls':
                this.printLine('<span class="text-blue-400 font-bold">projects/</span>  <span class="text-blue-400 font-bold">skills/</span>  description.txt  contact_info.txt', true);
                break;
            case 'cat':
                if (args[1] === 'description.txt') {
                    this.printLine('Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.');
                } else if (args[1] === 'contact_info.txt') {
                    this.printLine('Email: sd8587793@email.com');
                    this.printLine('Location: Santa Cruz, Bolivia');
                } else if (!args[1]) {
                    this.printLine('cat: falta el operando de archivo');
                } else {
                    this.printLine(`cat: ${args[1]}: No existe el archivo o el directorio`);
                }
                break;
            case 'neofetch':
                if (command !== 'neofetch') { // If typed by user, print prompt first
                     this.printPrompt(command);
                }
                const neofetchHTML = `
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
                const div = document.createElement('div');
                div.innerHTML = neofetchHTML;
                this.terminalOutput.appendChild(div);
                break;
            case 'open':
                if (args[1]) {
                    const target = args[1].toLowerCase();
                    if (['projects', 'skills', 'contact'].includes(target)) {
                        this.printLine(`Abriendo ${target}...`);
                        this.openWindow(target);
                    } else {
                        this.printLine(`open: no se puede abrir '${target}': Aplicación no encontrada`);
                    }
                } else {
                    this.printLine('open: falta el nombre de la aplicación (ej: open projects)');
                }
                break;
            default:
                this.printLine(`bash: ${cmd}: orden no encontrada`);
        }

        // Add spacing after command output unless it's clear
        if (cmd !== 'clear' && this.terminalOutput.innerHTML !== '') {
             const spacer = document.createElement('div');
             spacer.className = 'mb-4';
             this.terminalOutput.appendChild(spacer);
        }
    }

    printLine(text, isHtml = false) {
        const p = document.createElement('p');
        p.className = 'text-gray-100';
        if (isHtml) {
            p.innerHTML = text;
        } else {
            p.textContent = text;
        }
        this.terminalOutput.appendChild(p);
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

            header.addEventListener('mousedown', dragStart);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);

            function dragStart(e) {
                // Don't drag if maximizing/closing buttons are clicked
                if(e.target.closest('button')) return;

                // Unmaximize if pulling down from maximized state
                if(win.classList.contains('maximized')) {
                    const rect = header.getBoundingClientRect();
                    // Calculate roughly where they grabbed it proportionally
                    const grabPct = (e.clientX - rect.left) / rect.width;

                    // Call the app maximize logic to restore it properly
                    app.maximizeWindow(win.dataset.id);

                    // Now set new initial values for dragging immediately after restore
                    const newRect = win.getBoundingClientRect();
                    // Try to center the grab point, or use old offset if possible
                    xOffset = e.clientX - (newRect.left + (newRect.width * grabPct));
                    // The top bar is 28px, start Y dragging right from where they grabbed
                    yOffset = e.clientY - newRect.top;

                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;

                    setTranslate(xOffset, yOffset, win);
                    isDragging = true;
                    return;
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

                    // Prevent dragging above top bar (28px)
                    const winRect = win.getBoundingClientRect();
                    const newTop = winRect.top - yOffset + currentY;

                    if (newTop < 28) {
                        currentY = 28 - (winRect.top - yOffset);
                    }

                    // Aero snap effect check (top screen edge)
                    if (e.clientY <= 28) {
                         win.classList.add('maximized-snap-preview');
                    } else {
                         win.classList.remove('maximized-snap-preview');
                    }

                    xOffset = currentX;
                    yOffset = currentY;

                    setTranslate(currentX, currentY, win);
                }
            }

            function setTranslate(xPos, yPos, el) {
                el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
            }

            function dragEnd(e) {
                if(isDragging && win.classList.contains('maximized-snap-preview')) {
                    win.classList.remove('maximized-snap-preview');
                    app.maximizeWindow(win.dataset.id);
                }

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