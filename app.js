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
        this.setupResizing();
        this.setupWindowClickToFront();
        this.setupTerminal();
        this.setupLogin();

        // Aero snap preview element
        this.snapPreview = document.createElement('div');
        this.snapPreview.className = 'maximized-snap-preview hidden';
        document.body.appendChild(this.snapPreview);
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
                // Auto run neofetch on login
                this.processTerminalCommand('neofetch');
            }, 500); // Wait for transition to complete
        }
    }

    setupTerminal() {
        const terminalInput = document.getElementById('terminal-input');
        if (!terminalInput) return;

        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = terminalInput.value.trim();
                if (command) {
                    this.processTerminalCommand(command);
                }
                terminalInput.value = '';
            }
        });
    }

    processTerminalCommand(command) {
        const terminalHistory = document.getElementById('terminal-history');
        if (!terminalHistory) return;

        // Echo command
        const commandEcho = document.createElement('p');
        commandEcho.className = 'mb-2';
        commandEcho.innerHTML = `<span class="text-green-400 font-bold">sebastian@ubuntu</span>:<span class="text-blue-400 font-bold">~</span>$ ${this.escapeHTML(command)}`;
        terminalHistory.appendChild(commandEcho);

        // Process command
        const outputElement = document.createElement('div');
        outputElement.className = 'text-gray-100 mb-4 whitespace-pre-wrap';

        const args = command.split(' ').filter(Boolean);
        const cmd = args[0].toLowerCase();

        switch (cmd) {
            case 'help':
                outputElement.innerHTML = `Comandos disponibles:
  <span class="text-[#e95420] font-bold">help</span>      - Muestra este mensaje de ayuda
  <span class="text-[#e95420] font-bold">whoami</span>    - Muestra el usuario actual
  <span class="text-[#e95420] font-bold">clear</span>     - Limpia la terminal
  <span class="text-[#e95420] font-bold">ls</span>        - Lista los archivos en el directorio actual
  <span class="text-[#e95420] font-bold">neofetch</span>  - Muestra información del sistema
  <span class="text-[#e95420] font-bold">cat</span>       - Muestra el contenido de un archivo (ej. cat description.txt)
  <span class="text-[#e95420] font-bold">open</span>      - Abre una aplicación (ej. open projects)`;
                break;
            case 'whoami':
                outputElement.textContent = 'Sebastian Duran Caballero';
                break;
            case 'clear':
                terminalHistory.innerHTML = '';
                return; // Early return to avoid scrolling logic for empty output
            case 'ls':
                outputElement.innerHTML = `<span class="text-blue-400 font-bold">projects/</span>  <span class="text-blue-400 font-bold">skills/</span>  <span class="text-blue-400 font-bold">contact/</span>  description.txt`;
                break;
            case 'neofetch':
                outputElement.innerHTML = `<div class="flex flex-col md:flex-row text-gray-100 mb-4">
                        <div class="mr-6 mb-4 md:mb-0 text-[#e95420] text-xs sm:text-sm font-bold">
<pre>
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
   &#96;.  | /        ,'
     &#96;./'      ,-'
       &#96;-----'
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
                if (args[1] === 'description.txt') {
                    outputElement.textContent = 'Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.';
                } else {
                    outputElement.textContent = `cat: ${args[1] ? this.escapeHTML(args[1]) : ''}: No such file or directory`;
                }
                break;
            case 'open':
                if (args[1] && ['projects', 'skills', 'contact'].includes(args[1].toLowerCase())) {
                    this.openWindow(args[1].toLowerCase());
                    outputElement.textContent = `Opening ${args[1]}...`;
                } else {
                    outputElement.textContent = `Application not found: ${args[1] ? this.escapeHTML(args[1]) : ''}`;
                }
                break;
            default:
                outputElement.textContent = `${this.escapeHTML(cmd)}: command not found`;
                break;
        }

        terminalHistory.appendChild(outputElement);

        // Auto-scroll to bottom
        const terminalOutput = document.getElementById('terminal-output');
        if (terminalOutput) {
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
        }
    }

    escapeHTML(str) {
        return str.replace(/[&<>'"]/g,
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag])
        );
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
            let inSnapZone = false;

            // Store offsets so they persist
            win.dataset.xOffset = 0;
            win.dataset.yOffset = 0;

            // We need to use an arrow function or bind to access 'this.snapPreview' inside event listeners.
            const dragStart = (e) => {
                if(e.target.closest('button')) return;

                if(win.classList.contains('maximized')) {
                    // Restore maximized window by dragging
                    win.classList.remove('maximized');
                    win.style.transform = 'none';
                    const rect = win.getBoundingClientRect();

                    // Adjust position to under cursor roughly in middle of header
                    let startX = e.clientX - (rect.width / 2);
                    let startY = e.clientY - 10;

                    win.dataset.xOffset = startX;
                    win.dataset.yOffset = startY;
                    xOffset = startX;
                    yOffset = startY;

                    setTranslate(xOffset, yOffset, win);
                } else {
                    xOffset = parseFloat(win.dataset.xOffset) || 0;
                    yOffset = parseFloat(win.dataset.yOffset) || 0;
                }

                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;

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

                    setTranslate(currentX, currentY, win);

                    // Aero Snap preview
                    if (e.clientY < 38) { // 28px top bar + 10px threshold
                        this.snapPreview.classList.remove('hidden');
                        inSnapZone = true;
                    } else {
                        this.snapPreview.classList.add('hidden');
                        inSnapZone = false;
                    }
                }
            };

            const setTranslate = (xPos, yPos, el) => {
                el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
            };

            const dragEnd = (e) => {
                if(!isDragging) return;

                initialX = currentX;
                initialY = currentY;

                win.dataset.xOffset = xOffset;
                win.dataset.yOffset = yOffset;

                isDragging = false;

                if (inSnapZone) {
                    this.snapPreview.classList.add('hidden');
                    inSnapZone = false;
                    this.maximizeWindow(win.dataset.id);
                }
            };

            header.addEventListener('mousedown', dragStart);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);
        });
    }

    setupResizing() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer;
            let startX, startY, startWidth, startHeight;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    isResizing = true;
                    currentResizer = resizer;
                    startX = e.clientX;
                    startY = e.clientY;

                    // Get computed styles for precise width/height
                    const rect = win.getBoundingClientRect();
                    startWidth = rect.width;
                    startHeight = rect.height;

                    this.bringToFront(win);

                    document.addEventListener('mousemove', resize);
                    document.addEventListener('mouseup', stopResize);
                });
            });

            const resize = (e) => {
                if (!isResizing) return;

                if (win.classList.contains('maximized')) return;

                if (currentResizer.classList.contains('resizer-r')) {
                    win.style.width = startWidth + (e.clientX - startX) + 'px';
                } else if (currentResizer.classList.contains('resizer-b')) {
                    win.style.height = startHeight + (e.clientY - startY) + 'px';
                } else if (currentResizer.classList.contains('resizer-br')) {
                    win.style.width = startWidth + (e.clientX - startX) + 'px';
                    win.style.height = startHeight + (e.clientY - startY) + 'px';
                }
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