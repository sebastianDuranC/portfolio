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

                    // Drag down from top to restore window
                    if (win.classList.contains('maximized')) {
                        win.classList.remove('maximized');
                        win.style.transform = 'none';

                        const rect = win.getBoundingClientRect();
                        const desktopRect = document.getElementById('desktop').getBoundingClientRect();

                        xOffset = e.clientX - desktopRect.left - (rect.width / 2);
                        yOffset = e.clientY - desktopRect.top - 10;

                        initialX = e.clientX - xOffset;
                        initialY = e.clientY - yOffset;

                        setTranslate(xOffset, yOffset, win);
                        return;
                    }

                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;

                    xOffset = currentX;
                    yOffset = currentY;

                    setTranslate(currentX, currentY, win);

                    // Aero snap preview (optional visual enhancement, keeping simple logic here)
                }
            }

            function setTranslate(xPos, yPos, el) {
                el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
            }

            function dragEnd(e) {
                if(isDragging) {
                    initialX = currentX;
                    initialY = currentY;
                    isDragging = false;

                    // Aero snap to top
                    const desktopRect = document.getElementById('desktop').getBoundingClientRect();
                    if (e.clientY <= desktopRect.top + 10 && !win.classList.contains('maximized')) {
                        win.dataset.prevTransform = win.style.transform;
                        win.classList.add('maximized');
                        win.style.transform = 'none';
                    }
                }
            }
        });
    }

    setupResizableWindows() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer;
            let startX;
            let startY;
            let startWidth;
            let startHeight;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', function(e) {
                    isResizing = true;
                    currentResizer = resizer;
                    startX = e.clientX;
                    startY = e.clientY;
                    const rect = win.getBoundingClientRect();
                    startWidth = rect.width;
                    startHeight = rect.height;
                    e.preventDefault();
                });
            });

            document.addEventListener('mousemove', function(e) {
                if (!isResizing) return;

                if (currentResizer.classList.contains('resizer-r')) {
                    const newWidth = startWidth + (e.clientX - startX);
                    win.style.width = `${newWidth}px`;
                } else if (currentResizer.classList.contains('resizer-b')) {
                    const newHeight = startHeight + (e.clientY - startY);
                    win.style.height = `${newHeight}px`;
                } else if (currentResizer.classList.contains('resizer-br')) {
                    const newWidth = startWidth + (e.clientX - startX);
                    const newHeight = startHeight + (e.clientY - startY);
                    win.style.width = `${newWidth}px`;
                    win.style.height = `${newHeight}px`;
                }
            });

            document.addEventListener('mouseup', function(e) {
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

class TerminalParser {
    constructor(osApp) {
        this.osApp = osApp;
        this.input = document.getElementById('terminal-input');
        this.output = document.getElementById('terminal-output');
        this.content = document.getElementById('terminal-content');

        if (this.input) {
            this.input.addEventListener('keypress', (e) => this.handleInput(e));
            this.content.addEventListener('click', () => this.input.focus());
        }
    }

    handleInput(e) {
        if (e.key === 'Enter') {
            const command = this.input.value.trim();
            this.input.value = '';

            // Print prompt + command
            const cmdElement = document.createElement('p');
            cmdElement.className = 'mb-2';
            cmdElement.innerHTML = '<span class="text-green-400 font-bold">sebastian@adwaita</span>:<span class="text-blue-400 font-bold mr-1">~</span>$ ';

            // Safely append text to avoid self-XSS
            const cmdText = document.createTextNode(command);
            cmdElement.appendChild(cmdText);
            this.output.appendChild(cmdElement);

            if (command) {
                this.executeCommand(command);
            }

            this.scrollToBottom();
        }
    }

    scrollToBottom() {
        if (this.content) {
            this.content.scrollTop = this.content.scrollHeight;
        }
    }

    executeCommand(cmdStr) {
        const args = cmdStr.split(' ');
        const cmd = args[0].toLowerCase();

        let response = '';

        switch (cmd) {
            case 'help':
                response = `
                    <p class="text-gray-100 mb-4">Comandos disponibles:</p>
                    <ul class="text-gray-300 list-disc ml-4 mb-4">
                        <li><span class="text-[#3584e4] font-bold">whoami</span> - Muestra el usuario actual</li>
                        <li><span class="text-[#3584e4] font-bold">neofetch</span> - Muestra información del sistema</li>
                        <li><span class="text-[#3584e4] font-bold">ls</span> - Lista los directorios disponibles</li>
                        <li><span class="text-[#3584e4] font-bold">cat [archivo]</span> - Muestra el contenido de un archivo</li>
                        <li><span class="text-[#3584e4] font-bold">open [app]</span> - Abre una aplicación (projects, skills, contact)</li>
                        <li><span class="text-[#3584e4] font-bold">clear</span> - Limpia la terminal</li>
                    </ul>
                `;
                break;
            case 'whoami':
                response = '<p class="text-gray-100 mb-4">Sebastian Duran Caballero</p>';
                break;
            case 'neofetch':
                response = `
                    <div class="flex flex-col md:flex-row text-gray-100 mb-4">
                        <div class="mr-6 mb-4 md:mb-0 text-[#3584e4] text-xs sm:text-sm font-bold">
<pre>
       _,-/` + "`" + `--,-/\\-,
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
                            <p><span class="text-[#3584e4] font-bold">OS:</span> GNOME OS x86_64</p>
                            <p><span class="text-[#3584e4] font-bold">Host:</span> Desarrollador Web</p>
                            <p><span class="text-[#3584e4] font-bold">Uptime:</span> 24/7 coding</p>
                            <p><span class="text-[#3584e4] font-bold">Packages:</span> HTML, CSS, JS, .NET, C#</p>
                            <p><span class="text-[#3584e4] font-bold">Shell:</span> bash 5.1.16</p>
                            <p><span class="text-[#3584e4] font-bold">Location:</span> Santa Cruz, Bolivia</p>
                            <p><span class="text-[#3584e4] font-bold">Email:</span> sd8587793@email.com</p>
                        </div>
                    </div>
                `;
                break;
            case 'ls':
                response = `
                    <div class="flex space-x-4 text-[#3584e4] font-bold mb-4">
                        <span>projects/</span>
                        <span>skills/</span>
                        <span>contact/</span>
                        <span class="text-gray-300">description.txt</span>
                    </div>
                `;
                break;
            case 'cat':
                if (args[1] === 'description.txt') {
                    response = `
                        <p class="text-gray-100 mb-4">
                            Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.
                        </p>
                    `;
                } else if (args[1]) {
                    response = `<p class="text-red-400 mb-4">cat: ${args[1]}: No such file or directory</p>`;
                } else {
                    response = `<p class="text-gray-300 mb-4">Uso: cat [archivo]</p>`;
                }
                break;
            case 'clear':
                this.output.innerHTML = '';
                return;
            case 'open':
                const appName = args[1];
                if (['projects', 'skills', 'contact'].includes(appName)) {
                    this.osApp.openWindow(appName);
                    response = `<p class="text-gray-300 mb-4">Abriendo ${appName}...</p>`;
                } else if (appName) {
                    response = `<p class="text-red-400 mb-4">open: Aplicación no encontrada: ${appName}</p>`;
                } else {
                    response = `<p class="text-gray-300 mb-4">Uso: open [app]</p>`;
                }
                break;
            default:
                response = `<p class="text-red-400 mb-4">${cmd}: comando no encontrado</p>`;
                break;
        }

        if (response) {
            const respElement = document.createElement('div');
            respElement.innerHTML = response;
            this.output.appendChild(respElement);
        }
    }
}

// Initialize the OS
const app = new LinuxOS();
// Pass app instance to terminal parser so it can control windows
window.app = app;
const terminal = new TerminalParser(app);