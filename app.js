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
        let snapPreview = document.createElement('div');
        snapPreview.className = 'maximized-snap-preview hidden';
        document.body.appendChild(snapPreview);

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

            // Using arrow functions to preserve 'this' context for maximizeWindow
            const that = this;

            function dragStart(e) {
                if (e.target.closest('button')) return;

                if (win.classList.contains('maximized')) {
                    // Restore on drag for maximized windows
                    win.style.transform = 'none';
                    const rect = win.getBoundingClientRect();
                    win.classList.remove('maximized');

                    // Recalculate offsets based on the restored window's position and mouse click
                    xOffset = e.clientX - rect.width / 2; // Center horizontally on mouse
                    yOffset = e.clientY - 15; // Just below header top

                    // Boundaries check to keep it somewhat sane
                    xOffset = Math.max(0, xOffset);

                    win.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0)`;

                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;
                } else {
                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;
                }

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

                    // Aero snap preview
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

                if (e.clientY <= 28) {
                    snapPreview.classList.add('hidden');
                    // Reset transform before maximizing so it maximizes properly
                    win.dataset.prevTransform = win.style.transform;
                    win.style.transform = 'none';
                    win.classList.add('maximized');
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
                    currentResizer = resizer;

                    // If window is maximized, resizing is disabled
                    if(win.classList.contains('maximized')) {
                        isResizing = false;
                        return;
                    }

                    // Ensure window has inline styles for width/height first
                    const computedStyle = window.getComputedStyle(win);
                    startWidth = parseInt(computedStyle.width, 10);
                    startHeight = parseInt(computedStyle.height, 10);

                    // Set them explicitly if they aren't
                    if(!win.style.width) win.style.width = startWidth + 'px';
                    if(!win.style.height) win.style.height = startHeight + 'px';

                    startX = e.clientX;
                    startY = e.clientY;

                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                });
            });

            function handleMouseMove(e) {
                if (!isResizing) return;

                let newWidth = startWidth;
                let newHeight = startHeight;

                if (currentResizer.classList.contains('resizer-r') || currentResizer.classList.contains('resizer-br')) {
                    newWidth = startWidth + (e.clientX - startX);
                }
                if (currentResizer.classList.contains('resizer-b') || currentResizer.classList.contains('resizer-br')) {
                    newHeight = startHeight + (e.clientY - startY);
                }

                // Apply constraints (these match the tailwind min-w-[300px] min-h-[200px])
                newWidth = Math.max(300, newWidth);
                newHeight = Math.max(200, newHeight);

                win.style.width = newWidth + 'px';
                win.style.height = newHeight + 'px';
            }

            function handleMouseUp() {
                if (isResizing) {
                    isResizing = false;
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                }
            }
        });
    }

    setupTerminal() {
        const input = document.getElementById('terminal-input');
        const output = document.getElementById('terminal-output');

        if(!input || !output) return;

        // Focus input when clicking anywhere in terminal body
        const terminalContent = document.querySelector('#window-terminal .window-content');
        if(terminalContent) {
            terminalContent.addEventListener('click', () => {
                const selection = window.getSelection();
                if(selection.toString().length === 0) {
                    input.focus();
                }
            });
        }

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = input.value.trim();
                input.value = '';

                // Echo command
                const echoLine = document.createElement('p');
                echoLine.className = 'mb-2';
                echoLine.innerHTML = `<span class="text-green-400 font-bold">sebastian@ubuntu</span>:<span class="text-blue-400 font-bold">~</span>$ `;
                const commandTextNode = document.createTextNode(command);
                echoLine.appendChild(commandTextNode);
                output.appendChild(echoLine);

                // Process command
                if (command !== '') {
                    this.processCommand(command, output);
                }

                // Scroll to bottom
                terminalContent.scrollTop = terminalContent.scrollHeight;
            }
        });
    }

    processCommand(cmdStr, outputEl) {
        const args = cmdStr.split(' ').filter(Boolean);
        const command = args[0].toLowerCase();

        const responseDiv = document.createElement('div');
        responseDiv.className = 'text-gray-100 mb-4';

        switch (command) {
            case 'help':
                responseDiv.innerHTML = `
                    <p>Comandos disponibles:</p>
                    <ul class="list-disc ml-4 mt-2">
                        <li><b>whoami</b> - Muestra el usuario actual</li>
                        <li><b>neofetch</b> - Muestra información del sistema</li>
                        <li><b>cat [archivo]</b> - Lee un archivo (ej: cat description.txt)</li>
                        <li><b>ls</b> - Lista los archivos en el directorio actual</li>
                        <li><b>open [app]</b> - Abre una aplicación (projects, skills, contact)</li>
                        <li><b>clear</b> - Limpia la terminal</li>
                        <li><b>help</b> - Muestra este mensaje de ayuda</li>
                    </ul>
                `;
                break;
            case 'whoami':
                responseDiv.textContent = 'Sebastian Duran Caballero';
                break;
            case 'clear':
                outputEl.innerHTML = '';
                return; // Don't append responseDiv
            case 'ls':
                responseDiv.innerHTML = `<span class="text-blue-400 font-bold">projects/</span>  <span class="text-blue-400 font-bold">skills/</span>  <span class="text-blue-400 font-bold">contact/</span>  description.txt`;
                break;
            case 'cat':
                if (args[1] === 'description.txt') {
                    responseDiv.textContent = 'Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.';
                } else if (args[1]) {
                    responseDiv.textContent = `cat: ${args[1]}: No existe el archivo o directorio`;
                } else {
                    responseDiv.textContent = 'cat: falta operando';
                }
                break;
            case 'open':
                if (args[1]) {
                    const appName = args[1].toLowerCase();
                    if (['projects', 'skills', 'contact'].includes(appName)) {
                        this.openWindow(appName);
                        responseDiv.textContent = `Abriendo ${appName}...`;
                    } else {
                        responseDiv.textContent = `Aplicación no encontrada: ${appName}`;
                    }
                } else {
                    responseDiv.textContent = 'open: falta el nombre de la aplicación';
                }
                break;
            case 'neofetch':
                responseDiv.innerHTML = `
                    <div class="flex flex-col md:flex-row text-gray-100 mb-4">
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
            default:
                responseDiv.textContent = `${command}: orden no encontrada`;
        }

        outputEl.appendChild(responseDiv);
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