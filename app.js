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
        this.setupResizing();
    }

    setupTerminal() {
        const terminalInput = document.getElementById('terminal-input');
        const terminalOutput = document.getElementById('terminal-output');
        if (!terminalInput || !terminalOutput) return;

        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = terminalInput.value.trim();
                terminalInput.value = '';

                // Print command
                const cmdLine = document.createElement('p');
                cmdLine.className = 'mb-2';
                cmdLine.innerHTML = `<span class="text-green-400 font-bold">sebastian@ubuntu</span>:<span class="text-blue-400 font-bold">~</span>$ ${this.escapeHTML(command)}`;
                terminalOutput.appendChild(cmdLine);

                // Process command
                this.processCommand(command, terminalOutput);

                // Scroll to bottom
                const content = document.getElementById('terminal-content');
                if (content) content.scrollTop = content.scrollHeight;
            }
        });
    }

    escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    processCommand(cmd, output) {
        const args = cmd.split(' ').filter(c => c);
        if (args.length === 0) return;

        const mainCmd = args[0].toLowerCase();
        const responseLine = document.createElement('div');
        responseLine.className = 'text-gray-100 mb-4';

        switch(mainCmd) {
            case 'help':
                responseLine.innerHTML = `Comandos disponibles:<br>
                - <b>whoami</b>: Muestra el usuario actual<br>
                - <b>neofetch</b>: Muestra información del sistema<br>
                - <b>clear</b>: Limpia la terminal<br>
                - <b>ls</b>: Lista los archivos en el directorio actual<br>
                - <b>cat [archivo]</b>: Muestra el contenido de un archivo<br>
                - <b>open [app]</b>: Abre una aplicación (projects, skills, contact)`;
                break;
            case 'whoami':
                responseLine.textContent = 'Sebastian Duran Caballero';
                break;
            case 'clear':
                output.innerHTML = '';
                return;
            case 'ls':
                responseLine.innerHTML = `<span class="text-blue-400 font-bold mr-4">projects/</span> <span class="text-blue-400 font-bold mr-4">skills/</span> <span class="text-blue-400 font-bold mr-4">contact/</span> description.txt`;
                break;
            case 'cat':
                if (args[1] === 'description.txt') {
                    responseLine.textContent = 'Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.';
                } else {
                    responseLine.textContent = `cat: ${args[1] ? this.escapeHTML(args[1]) : ''}: No such file or directory`;
                }
                break;
            case 'neofetch':
                responseLine.innerHTML = `
                    <div class="flex flex-col md:flex-row text-gray-100">
                        <div class="mr-6 mb-4 md:mb-0 text-[#e95420] text-xs sm:text-sm font-bold">
<pre>
       _,-/\`--,-\/\-,
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
            case 'open':
                if (args[1]) {
                    const appId = args[1].toLowerCase();
                    if (['projects', 'skills', 'contact'].includes(appId)) {
                        this.openWindow(appId);
                        responseLine.textContent = `Abriendo ${appId}...`;
                    } else {
                        responseLine.textContent = `open: ${this.escapeHTML(args[1])}: No such application`;
                    }
                } else {
                    responseLine.textContent = 'open: missing application name';
                }
                break;
            default:
                responseLine.textContent = `${this.escapeHTML(mainCmd)}: command not found`;
        }

        output.appendChild(responseLine);
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

                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;
                }
            }

            function drag(e) {
                if (isDragging) {
                    e.preventDefault();

                    // Restore from maximized if dragging a maximized window
                    if (win.classList.contains('maximized')) {
                        win.classList.remove('maximized');
                        win.style.transform = 'none';
                        const rect = win.getBoundingClientRect();

                        // Recalculate offsets based on where the mouse grabbed the header
                        // Assuming header is roughly 38px
                        xOffset = e.clientX - (rect.width / 2); // Center horizontally on mouse
                        yOffset = e.clientY - 19; // Center vertically on header

                        initialX = e.clientX - xOffset;
                        initialY = e.clientY - yOffset;
                    }

                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;

                    xOffset = currentX;
                    yOffset = currentY;

                    setTranslate(currentX, currentY, win);

                    // Aero snap preview
                    const snapPreview = document.getElementById('maximized-snap-preview');
                    if (e.clientY < 30) {
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

                // Perform snap if dropped near top
                const snapPreview = document.getElementById('maximized-snap-preview');
                if (e.clientY < 30 && snapPreview && !snapPreview.classList.contains('hidden')) {
                    snapPreview.classList.add('hidden');
                    app.maximizeWindow(win.dataset.id); // Maximize
                } else if(snapPreview) {
                    snapPreview.classList.add('hidden');
                }
            }
        });
    }

    setupResizing() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer;
            let startX, startY, startWidth, startHeight;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', function(e) {
                    e.preventDefault();
                    isResizing = true;
                    currentResizer = e.target;

                    startX = e.clientX;
                    startY = e.clientY;

                    // Get computed style for width/height (handling both inline and class-based dims)
                    const style = window.getComputedStyle(win);
                    startWidth = parseInt(style.width, 10);
                    startHeight = parseInt(style.height, 10);

                    // Prevent text selection during resize
                    document.body.style.userSelect = 'none';
                    app.bringToFront(win);
                });
            });

            document.addEventListener('mousemove', function(e) {
                if (!isResizing) return;

                // Don't resize if maximized
                if(win.classList.contains('maximized')) return;

                if (currentResizer.classList.contains('right')) {
                    win.style.width = startWidth + (e.clientX - startX) + 'px';
                } else if (currentResizer.classList.contains('bottom')) {
                    win.style.height = startHeight + (e.clientY - startY) + 'px';
                } else if (currentResizer.classList.contains('bottom-right')) {
                    win.style.width = startWidth + (e.clientX - startX) + 'px';
                    win.style.height = startHeight + (e.clientY - startY) + 'px';
                }
            });

            document.addEventListener('mouseup', function(e) {
                if (isResizing) {
                    isResizing = false;
                    document.body.style.userSelect = '';
                }
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