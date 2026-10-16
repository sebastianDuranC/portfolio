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

                if (win.classList.contains('maximized')) {
                    // Start dragging to unmaximize
                    initialX = e.clientX;
                    initialY = e.clientY;
                } else {
                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;
                }

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;
                }
            };

            const drag = (e) => {
                if (isDragging) {
                    e.preventDefault();

                    if (win.classList.contains('maximized')) {
                        // Unmaximize on drag
                        win.classList.remove('maximized');

                        // Recalculate offsets based on where user clicked vs the natural window position
                        const rect = win.getBoundingClientRect();
                        xOffset = e.clientX - (rect.width / 2); // Center the window on mouse
                        yOffset = e.clientY - 20; // 20 is approx half header height

                        initialX = e.clientX - xOffset;
                        initialY = e.clientY - yOffset;
                    }

                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;

                    xOffset = currentX;
                    yOffset = currentY;

                    setTranslate(currentX, currentY, win);

                    // Top edge 'aero snap' for maximize
                    if (e.clientY <= 28) {
                        if (!document.getElementById('maximize-preview')) {
                            const preview = document.createElement('div');
                            preview.id = 'maximize-preview';
                            preview.className = 'absolute top-0 left-0 w-full h-full bg-white/10 border-2 border-white/20 rounded z-[99] pointer-events-none transition-all duration-200';
                            document.getElementById('desktop').appendChild(preview);
                        }
                    } else {
                        const preview = document.getElementById('maximize-preview');
                        if (preview) preview.remove();
                    }
                }
            };

            const setTranslate = (xPos, yPos, el) => {
                el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
            };

            const dragEnd = (e) => {
                if (!isDragging) return;

                initialX = currentX;
                initialY = currentY;
                isDragging = false;

                const preview = document.getElementById('maximize-preview');
                if (preview) {
                    preview.remove();
                    this.maximizeWindow(win.dataset.id);
                }
            };

            // Store the setTranslate method for use in maximizing/restoring
            win.setTranslate = setTranslate;
            win.resetOffsets = () => { xOffset = 0; yOffset = 0; };

            header.addEventListener('mousedown', dragStart);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);
        });
    }

    setupResizableWindows() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer;
            let startX, startY, startWidth, startHeight;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    if(win.classList.contains('maximized')) return;

                    isResizing = true;
                    currentResizer = resizer;
                    startX = e.clientX;
                    startY = e.clientY;
                    startWidth = parseInt(document.defaultView.getComputedStyle(win).width, 10);
                    startHeight = parseInt(document.defaultView.getComputedStyle(win).height, 10);

                    document.addEventListener('mousemove', resize);
                    document.addEventListener('mouseup', stopResize);
                });
            });

            const resize = (e) => {
                if (!isResizing) return;

                if (currentResizer.classList.contains('bottom-right')) {
                    win.style.width = startWidth + (e.clientX - startX) + 'px';
                    win.style.height = startHeight + (e.clientY - startY) + 'px';
                } else if (currentResizer.classList.contains('right')) {
                    win.style.width = startWidth + (e.clientX - startX) + 'px';
                } else if (currentResizer.classList.contains('bottom')) {
                    win.style.height = startHeight + (e.clientY - startY) + 'px';
                }

                // Override tailwind percentages if resized
                win.classList.remove('w-[80%]', 'h-[70%]', 'h-[75%]');
            };

            const stopResize = () => {
                isResizing = false;
                document.removeEventListener('mousemove', resize);
                document.removeEventListener('mouseup', stopResize);
            };
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
                win.dataset.prevTransform = win.style.transform;
                win.classList.add('maximized');
                win.style.transform = 'none';
            } else {
                win.classList.remove('maximized');
                if (win.dataset.prevTransform) {
                    win.style.transform = win.dataset.prevTransform;
                } else if(win.setTranslate) {
                    win.resetOffsets();
                    win.setTranslate(0, 0, win);
                }
            }
            this.bringToFront(win);
        }
    }

    setupTerminal() {
        const input = document.getElementById('terminal-input');
        const output = document.getElementById('terminal-output');
        const content = document.getElementById('terminal-content');

        if(!input || !output) return;

        // Pre-populate terminal
        this.printToTerminal(output, 'whoami', 'Sebastian Duran Caballero');

        const desc = 'Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.';
        this.printToTerminal(output, 'cat description.txt', desc);

        const neofetchArt = `
       _,-/\\--,-/\\-,
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
       \`-----'`;

        const neofetchInfo = `
<span class="text-[#3584e4] font-bold">OS:</span> Adwaita OS x86_64
<span class="text-[#3584e4] font-bold">Host:</span> Desarrollador Web
<span class="text-[#3584e4] font-bold">Uptime:</span> 24/7 coding
<span class="text-[#3584e4] font-bold">Packages:</span> HTML, CSS, JS, .NET, C#
<span class="text-[#3584e4] font-bold">Shell:</span> bash 5.1.16
<span class="text-[#3584e4] font-bold">Location:</span> Santa Cruz, Bolivia
<span class="text-[#3584e4] font-bold">Email:</span> sd8587793@email.com`;

        const neofetchHTML = `
            <div class="flex flex-col md:flex-row text-gray-100 mb-4">
                <div class="mr-6 mb-4 md:mb-0 text-[#3584e4] text-xs sm:text-sm font-bold whitespace-pre font-fira-code">${this.escapeHtml(neofetchArt.substring(1))}</div>
                <div class="font-fira-code leading-relaxed">${neofetchInfo}</div>
            </div>
        `;

        this.printRawHTMLToTerminal(output, 'neofetch', neofetchHTML);

        // Handle input
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = input.value.trim();
                input.value = '';
                if(cmd) {
                    this.executeCommand(cmd, output);
                } else {
                     // Empty command just prints prompt
                     const prompt = document.createElement('div');
                     prompt.className = 'mb-1';
                     prompt.innerHTML = `<span class="text-green-400 font-bold">sebastian@adwaita</span><span class="text-white">:</span><span class="text-[#3584e4] font-bold">~</span><span class="text-white">$</span> `;
                     output.appendChild(prompt);
                }

                // Scroll to bottom
                content.scrollTop = content.scrollHeight;
            }
        });

        // Focus input when clicking anywhere in terminal
        content.addEventListener('click', () => {
            // Check if there is a selection
            if(window.getSelection().toString() === '') {
                input.focus();
            }
        });
    }

    escapeHtml(unsafe) {
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }

    printToTerminal(output, cmd, result) {
        const promptLine = document.createElement('div');
        promptLine.className = 'mb-1';
        promptLine.innerHTML = `<span class="text-green-400 font-bold">sebastian@adwaita</span><span class="text-white">:</span><span class="text-[#3584e4] font-bold">~</span><span class="text-white">$</span> ${this.escapeHtml(cmd)}`;

        const resultLine = document.createElement('div');
        resultLine.className = 'text-gray-100 mb-4 whitespace-pre-wrap';
        resultLine.textContent = result;

        output.appendChild(promptLine);
        output.appendChild(resultLine);
    }

    printRawHTMLToTerminal(output, cmd, htmlResult) {
        const promptLine = document.createElement('div');
        promptLine.className = 'mb-1';
        promptLine.innerHTML = `<span class="text-green-400 font-bold">sebastian@adwaita</span><span class="text-white">:</span><span class="text-[#3584e4] font-bold">~</span><span class="text-white">$</span> ${this.escapeHtml(cmd)}`;

        const resultContainer = document.createElement('div');
        resultContainer.innerHTML = htmlResult;

        output.appendChild(promptLine);
        output.appendChild(resultContainer);
    }

    executeCommand(cmd, output) {
        const args = cmd.split(' ');
        const command = args[0].toLowerCase();

        switch (command) {
            case 'help':
                this.printToTerminal(output, cmd, 'Comandos disponibles: \n  help      - Muestra esta ayuda\n  whoami    - Muestra el usuario actual\n  clear     - Limpia la terminal\n  ls        - Lista los archivos\n  neofetch  - Muestra la información del sistema\n  cat       - Muestra el contenido de un archivo\n  open      - Abre una aplicación (ej. open projects)');
                break;
            case 'whoami':
                this.printToTerminal(output, cmd, 'Sebastian Duran Caballero');
                break;
            case 'clear':
                output.innerHTML = '';
                break;
            case 'ls':
                this.printToTerminal(output, cmd, 'description.txt\nportfolio_v1\nscripts');
                break;
            case 'cat':
                if (args[1] === 'description.txt') {
                    this.printToTerminal(output, cmd, 'Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.');
                } else if(args[1]) {
                    this.printToTerminal(output, cmd, `cat: ${args[1]}: No such file or directory`);
                } else {
                    this.printToTerminal(output, cmd, `cat: missing operand`);
                }
                break;
            case 'neofetch':
                const neofetchArt = `
       _,-/\\--,-/\\-,
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
       \`-----'`;

                const neofetchInfo = `
<span class="text-[#3584e4] font-bold">OS:</span> Adwaita OS x86_64
<span class="text-[#3584e4] font-bold">Host:</span> Desarrollador Web
<span class="text-[#3584e4] font-bold">Uptime:</span> 24/7 coding
<span class="text-[#3584e4] font-bold">Packages:</span> HTML, CSS, JS, .NET, C#
<span class="text-[#3584e4] font-bold">Shell:</span> bash 5.1.16
<span class="text-[#3584e4] font-bold">Location:</span> Santa Cruz, Bolivia
<span class="text-[#3584e4] font-bold">Email:</span> sd8587793@email.com`;

                const neofetchHTML = `
                    <div class="flex flex-col md:flex-row text-gray-100 mb-4">
                        <div class="mr-6 mb-4 md:mb-0 text-[#3584e4] text-xs sm:text-sm font-bold whitespace-pre font-fira-code">${this.escapeHtml(neofetchArt.substring(1))}</div>
                        <div class="font-fira-code leading-relaxed">${neofetchInfo}</div>
                    </div>
                `;
                this.printRawHTMLToTerminal(output, cmd, neofetchHTML);
                break;
            case 'open':
                const appName = args[1];
                if (['projects', 'skills', 'contact', 'terminal'].includes(appName)) {
                    this.printToTerminal(output, cmd, `Opening ${appName}...`);
                    this.openWindow(appName);
                } else {
                     this.printToTerminal(output, cmd, `open: ${appName}: App not found`);
                }
                break;
            default:
                this.printToTerminal(output, cmd, `${command}: command not found`);
        }
    }
}

// Make globally available
window.app = new LinuxOS();