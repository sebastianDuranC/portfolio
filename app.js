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

    setupTerminal() {
        const terminalInput = document.getElementById('terminal-input');
        const terminalOutput = document.getElementById('terminal-output');
        const terminalContainer = document.getElementById('terminal-container');

        if (!terminalInput || !terminalOutput) return;

        const executeCommand = (cmd) => {
            const commandDiv = document.createElement('div');
            commandDiv.className = 'mb-2';
            commandDiv.innerHTML = `<span class="text-green-400 font-bold">sebastian@ubuntu</span><span class="text-white">:</span><span class="text-blue-400 font-bold">~</span><span class="text-white">$ </span><span class="text-gray-200"></span>`;
            commandDiv.querySelector('span.text-gray-200').textContent = cmd;
            terminalOutput.appendChild(commandDiv);

            const outputDiv = document.createElement('div');
            outputDiv.className = 'text-gray-100 mb-4';

            const trimmedCmd = cmd.trim().toLowerCase();
            const args = trimmedCmd.split(' ');
            const baseCmd = args[0];

            switch (baseCmd) {
                case 'help':
                    outputDiv.innerHTML = `
                        Comandos disponibles:<br>
                        &nbsp;&nbsp;<b>whoami</b>&nbsp;&nbsp;&nbsp;&nbsp;- Muestra el usuario actual<br>
                        &nbsp;&nbsp;<b>neofetch</b>&nbsp;&nbsp;- Muestra información del sistema<br>
                        &nbsp;&nbsp;<b>cat [file]</b>- Lee un archivo (ej: cat description.txt)<br>
                        &nbsp;&nbsp;<b>ls</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Lista los archivos en el directorio actual<br>
                        &nbsp;&nbsp;<b>clear</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Limpia la terminal<br>
                        &nbsp;&nbsp;<b>open [app]</b>- Abre una aplicación (ej: open projects, open skills)
                    `;
                    break;
                case 'whoami':
                    outputDiv.textContent = 'Sebastian Duran Caballero';
                    break;
                case 'ls':
                    outputDiv.innerHTML = `<span class="text-blue-400 font-bold">projects/</span> &nbsp; <span class="text-blue-400 font-bold">skills/</span> &nbsp; description.txt`;
                    break;
                case 'cat':
                    if (args[1] === 'description.txt') {
                        outputDiv.textContent = 'Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.';
                    } else if (!args[1]) {
                        outputDiv.textContent = 'cat: falta un argumento';
                    } else {
                        outputDiv.textContent = `cat: ${args[1]}: No existe el archivo o directorio`;
                    }
                    break;
                case 'open':
                    if (args[1]) {
                        if (['projects', 'skills', 'contact'].includes(args[1])) {
                            this.openWindow(args[1]);
                            outputDiv.textContent = `Abriendo ${args[1]}...`;
                        } else {
                            outputDiv.textContent = `open: aplicación '${args[1]}' no encontrada`;
                        }
                    } else {
                        outputDiv.textContent = 'open: falta el nombre de la aplicación';
                    }
                    break;
                case 'clear':
                    terminalOutput.innerHTML = '';
                    return; // Don't append outputDiv
                case 'neofetch':
                    outputDiv.innerHTML = `
                    <div class="flex flex-col md:flex-row text-gray-100">
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
                    break;
                case '':
                    return; // Empty command, just new line
                default:
                    outputDiv.textContent = `${baseCmd}: orden no encontrada`;
            }

            terminalOutput.appendChild(outputDiv);
            terminalContainer.scrollTop = terminalContainer.scrollHeight;
        };

        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = terminalInput.value;
                terminalInput.value = '';
                executeCommand(cmd);
            }
        });

        // Run neofetch on startup
        executeCommand('neofetch');
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

                if(win.classList.contains('maximized')) {
                    // Un-maximize on drag
                    win.style.transform = 'none';
                    const rect = win.getBoundingClientRect();
                    win.classList.remove('maximized');

                    // Adjust offsets so the window stays under the cursor
                    xOffset = rect.left;
                    yOffset = rect.top;
                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;
                    setTranslate(xOffset, yOffset, win);
                } else {
                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;
                }

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;
                    win.classList.add('window-active');
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

                    // Aero snap preview
                    if (e.clientY <= 28) {
                        if (!document.getElementById('snap-preview')) {
                            const preview = document.createElement('div');
                            preview.id = 'snap-preview';
                            preview.className = 'maximized-snap-preview';
                            document.body.appendChild(preview);
                        }
                    } else {
                        const preview = document.getElementById('snap-preview');
                        if (preview) preview.remove();
                    }
                }
            }

            function setTranslate(xPos, yPos, el) {
                el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
            }

            function dragEnd(e) {
                initialX = currentX;
                initialY = currentY;
                isDragging = false;

                const preview = document.getElementById('snap-preview');
                if (preview) {
                    preview.remove();
                    // Maximize window
                    win.dataset.prevTransform = win.style.transform;
                    win.classList.add('maximized');
                    win.style.transform = 'none';
                }
            }
        });
    }

    setupWindowResizing() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer;
            let startX, startY, startWidth, startHeight;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
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