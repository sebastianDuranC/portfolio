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

            header.addEventListener('mousedown', dragStart);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);

            function dragStart(e) {
                // Don't drag if maximizing/closing buttons are clicked
                if(e.target.closest('button')) return;

                // Don't drag if maximized
                if(win.classList.contains('maximized')) return;

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

                    // Aero Snap: drag to top
                    if (e.clientY <= 28) {
                         if(!win.classList.contains('maximized-snap-preview')) {
                             win.classList.add('maximized-snap-preview');
                             // show a preview overlay here if desired
                         }
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

            const appInstance = this;
            function dragEnd(e) {
                if(isDragging && e.clientY <= 28) {
                    win.classList.remove('maximized-snap-preview');
                    // Find actual app instance, this refers to header within listener if not bound, so we use arrow or appInstance
                    const winId = win.getAttribute('data-id');
                    if(winId) {
                         // Maximize the window
                         const appObj = window.app || appInstance;
                         if(!win.classList.contains('maximized')) {
                             appObj.maximizeWindow(winId);
                         }
                    }
                }

                initialX = currentX;
                initialY = currentY;
                isDragging = false;
            }
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
                    isResizing = true;
                    currentResizer = resizer;
                    startX = e.clientX;
                    startY = e.clientY;
                    startWidth = parseInt(document.defaultView.getComputedStyle(win).width, 10);
                    startHeight = parseInt(document.defaultView.getComputedStyle(win).height, 10);

                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                    e.preventDefault();
                });
            });

            function handleMouseMove(e) {
                if (!isResizing) return;

                if (currentResizer.classList.contains('right') || currentResizer.classList.contains('bottom-right')) {
                    const width = startWidth + (e.clientX - startX);
                    win.style.width = `${width}px`;
                }

                if (currentResizer.classList.contains('bottom') || currentResizer.classList.contains('bottom-right')) {
                    const height = startHeight + (e.clientY - startY);
                    win.style.height = `${height}px`;
                }
            }

            function handleMouseUp() {
                isResizing = false;
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            }
        });
    }

    setupTerminal() {
        const terminalInput = document.getElementById('terminal-input');
        const terminalOutput = document.getElementById('terminal-output');

        if (!terminalInput || !terminalOutput) return;

        const executeCommand = (cmd) => {
            const command = cmd.trim();
            if (command === '') return;

            // Echo command
            const cmdLine = document.createElement('div');
            cmdLine.innerHTML = `<span class="text-green-400 font-bold">sebastian@ubuntu</span>:<span class="text-blue-400 font-bold">~</span>$ `;
            const cmdText = document.createElement('span');
            cmdText.textContent = command;
            cmdLine.appendChild(cmdText);
            terminalOutput.appendChild(cmdLine);

            const outputDiv = document.createElement('div');
            outputDiv.className = 'text-gray-100 mb-4 whitespace-pre-wrap';

            const args = command.split(' ');
            const baseCmd = args[0].toLowerCase();

            switch(baseCmd) {
                case 'help':
                    outputDiv.textContent = 'Comandos disponibles: help, whoami, clear, ls, neofetch, cat <archivo>, open <app>';
                    break;
                case 'whoami':
                    outputDiv.textContent = 'Sebastian Duran Caballero';
                    break;
                case 'clear':
                    terminalOutput.innerHTML = '';
                    return; // Don't append empty outputDiv
                case 'ls':
                    outputDiv.innerHTML = '<span class="text-blue-400">Proyectos</span>  <span class="text-gray-200">description.txt</span>';
                    break;
                case 'cat':
                    if(args[1] === 'description.txt') {
                        outputDiv.textContent = 'Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.';
                    } else {
                        outputDiv.textContent = `cat: ${args[1] || ''}: No such file or directory`;
                    }
                    break;
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
                case 'open':
                    if (args[1]) {
                        const appName = args[1].toLowerCase();
                        if (['terminal', 'projects', 'skills', 'contact'].includes(appName)) {
                            this.openWindow(appName);
                            outputDiv.textContent = `Abriendo ${appName}...`;
                        } else {
                            outputDiv.textContent = `Aplicación no encontrada: ${appName}`;
                        }
                    } else {
                        outputDiv.textContent = 'Uso: open <app>';
                    }
                    break;
                default:
                    outputDiv.textContent = `${baseCmd}: command not found`;
            }

            terminalOutput.appendChild(outputDiv);

            // Scroll to bottom
            const terminalContent = document.getElementById('terminal-content');
            if (terminalContent) {
                terminalContent.scrollTop = terminalContent.scrollHeight;
            }
        };

        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                executeCommand(terminalInput.value);
                terminalInput.value = '';
            }
        });

        // Initial text
        executeCommand('neofetch');
        terminalInput.value = '';
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