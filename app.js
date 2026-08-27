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
                if (window.terminal) {
                    window.terminal.initPrePopulated();
                }
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

    setupResizableWindows() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    isResizing = true;
                    currentResizer = resizer;
                    this.bringToFront(win);

                    document.addEventListener('mousemove', resize);
                    document.addEventListener('mouseup', stopResize);
                });
            });

            function resize(e) {
                if (!isResizing) return;

                const rect = win.getBoundingClientRect();

                if (currentResizer.classList.contains('resizer-r')) {
                    win.style.width = e.clientX - rect.left + 'px';
                }
                else if (currentResizer.classList.contains('resizer-b')) {
                    win.style.height = e.clientY - rect.top + 'px';
                }
                else if (currentResizer.classList.contains('resizer-br')) {
                    win.style.width = e.clientX - rect.left + 'px';
                    win.style.height = e.clientY - rect.top + 'px';
                }
            }

            function stopResize() {
                isResizing = false;
                document.removeEventListener('mousemove', resize);
                document.removeEventListener('mouseup', stopResize);
            }
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

                    // Aero Snap Top Edge
                    if (e.clientY <= 0) {
                         if (!win.classList.contains('maximized')) {
                              // Force maximization
                              const id = win.dataset.id;
                              // Need to access class instance method, but we're in a closure.
                              // Since we bind window.app at the bottom, we can use that, or just use the local instance if we saved it.
                              if (window.app) {
                                  // Restore positioning first to avoid jump when unmaximized later
                                  xOffset = 0;
                                  yOffset = 0;
                                  setTranslate(0, 0, win);
                                  window.app.maximizeWindow(id);
                              }
                         }
                         // Stop dragging since it's maximized
                         isDragging = false;
                         return;
                    }

                    // Restore maximized window when dragged by header
                    if (win.classList.contains('maximized')) {
                         const id = win.dataset.id;
                         if (window.app) {
                             window.app.maximizeWindow(id); // Toggle max off

                             // Calculate new offsets to prevent jumping
                             const desktop = document.getElementById('desktop');
                             const desktopRect = desktop.getBoundingClientRect();

                             // Temporarily set transform to none to get true bounds
                             const prevTransform = win.style.transform;
                             win.style.transform = 'none';
                             const winRect = win.getBoundingClientRect();

                             // Calculate current offsets relative to the desktop container
                             xOffset = winRect.left - desktopRect.left;
                             yOffset = winRect.top - desktopRect.top;

                             // Ensure we don't start dragging from exactly the edge if it was just unmaximized
                             xOffset = Math.max(0, e.clientX - desktopRect.left - (winRect.width / 2));
                             yOffset = 0; // Stick to top initially while dragging

                             initialX = e.clientX - xOffset;
                             initialY = e.clientY - yOffset;
                         }
                    }

                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;

                    xOffset = currentX;
                    yOffset = currentY;

                    setTranslate(currentX, currentY, win);
                }
            }

            function setTranslate(xPos, yPos, el) {
                el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
            }

            function dragEnd(e) {
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

class TerminalParser {
    constructor() {
        this.output = document.getElementById('terminal-output');
        this.input = document.getElementById('terminal-input');

        if (this.input) {
            this.input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.executeCommand(this.input.value);
                    this.input.value = '';
                }
            });
        }
    }

    initPrePopulated() {
        if (!this.output) return;
        this.output.innerHTML = '';
        this.executeCommand('whoami', true);
        this.executeCommand('neofetch', true);
    }

    printLine(html) {
        if (this.output) {
            const div = document.createElement('div');
            div.className = 'mb-2';
            div.innerHTML = html;
            this.output.appendChild(div);
            // Scroll to bottom
            const content = document.getElementById('terminal-content');
            if (content) {
                content.scrollTop = content.scrollHeight;
            }
        }
    }

    executeCommand(cmd, isInit = false) {
        if (!cmd && !isInit) return;

        const safeCmd = this.escapeHTML(cmd);

        // Print the prompt and command
        const promptHtml = `<span class="text-green-400 font-bold">sebastian@ubuntu</span><span class="text-white font-bold mx-0.5">:</span><span class="text-blue-400 font-bold">~</span><span class="text-white font-bold ml-0.5 mr-1">$</span> ${safeCmd}`;
        this.printLine(promptHtml);

        const args = cmd.trim().split(/\s+/);
        const command = args[0].toLowerCase();

        switch (command) {
            case 'help':
                this.printLine(`<div class="text-gray-100 mb-4 mt-2">
                    Comandos disponibles:<br>
                    - help: Muestra esta ayuda<br>
                    - whoami: Muestra el usuario actual<br>
                    - clear: Limpia la terminal<br>
                    - ls: Lista los archivos<br>
                    - neofetch: Muestra la información del sistema<br>
                    - cat &lt;archivo&gt;: Lee un archivo<br>
                    - open &lt;app&gt;: Abre una aplicación (projects, skills, contact)
                </div>`);
                break;
            case 'whoami':
                this.printLine('<p class="text-gray-100 mb-4 mt-1">Sebastian Duran Caballero</p>');
                break;
            case 'clear':
                if (this.output) {
                    this.output.innerHTML = '';
                }
                break;
            case 'ls':
                this.printLine('<p class="text-gray-100 mb-4 mt-1 text-blue-300">projects/  skills/  contact/  description.txt</p>');
                break;
            case 'neofetch':
                this.printLine(`
                    <div class="flex flex-col md:flex-row text-gray-100 mb-4 mt-2">
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
                    </div>
                `);
                break;
            case 'cat':
                if (args[1] === 'description.txt') {
                    this.printLine('<p class="text-gray-100 mb-4 mt-1">Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.</p>');
                } else {
                    this.printLine(`<p class="text-red-400 mb-4 mt-1">cat: ${this.escapeHTML(args[1] || '')}: No existe el archivo o el directorio</p>`);
                }
                break;
            case 'open':
                const appToOpen = args[1];
                if (['projects', 'skills', 'contact'].includes(appToOpen)) {
                    this.printLine(`<p class="text-gray-100 mb-4 mt-1">Abriendo ${appToOpen}...</p>`);
                    if (window.app) {
                        window.app.openWindow(appToOpen);
                    }
                } else {
                    this.printLine(`<p class="text-red-400 mb-4 mt-1">Aplicación no encontrada: ${this.escapeHTML(appToOpen || '')}</p>`);
                }
                break;
            default:
                if (command) {
                    this.printLine(`<p class="text-red-400 mb-4 mt-1">${this.escapeHTML(command)}: orden no encontrada</p>`);
                }
        }
    }

    escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}

// Initialize the OS
window.app = new LinuxOS();
window.terminal = new TerminalParser();