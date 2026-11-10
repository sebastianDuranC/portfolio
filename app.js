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

        // Ensure TerminalParser is loaded when app starts
        window.addEventListener('load', () => {
            this.terminalParser = new TerminalParser();
        });
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
                // Start terminal parser if not already done, and open terminal
                if (!this.terminalParser) {
                    this.terminalParser = new TerminalParser();
                }
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

                // If dragging maximized window, restore it
                if (win.classList.contains('maximized')) {
                    win.classList.remove('maximized');

                    // Temporarily set transform to none to get exact bounding rect
                    win.style.transform = 'none';
                    const rect = win.getBoundingClientRect();

                    // Reset to natural position using prevTransform or default
                    if (win.dataset.prevTransform) {
                        win.style.transform = win.dataset.prevTransform;
                    }

                    const targetLeft = Math.max(0, e.clientX - (rect.width / 2));
                    xOffset = targetLeft - rect.left + (parseFloat(win.dataset.xOffset) || 0);

                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;
                } else {
                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;
                }

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

                    // Aero snap for maximizing
                    if (e.clientY <= 28) {
                        if (!win.dataset.snapPreview) {
                            win.dataset.snapPreview = "true";
                            win.style.opacity = '0.5';
                        }
                    } else if (win.dataset.snapPreview) {
                        delete win.dataset.snapPreview;
                        win.style.opacity = '1';
                    }

                    setTranslate(currentX, currentY, win);
                }
            };

            const setTranslate = (xPos, yPos, el) => {
                el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
                el.dataset.xOffset = xPos;
            };

            const dragEnd = (e) => {
                if (!isDragging) return;

                initialX = currentX;
                initialY = currentY;
                isDragging = false;

                if (win.dataset.snapPreview) {
                    delete win.dataset.snapPreview;
                    win.style.opacity = '1';
                    this.maximizeWindow(win.dataset.id);
                }
            };

            header.addEventListener('mousedown', dragStart);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);
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
window.app = new LinuxOS();

class TerminalParser {
    constructor() {
        this.content = document.getElementById('terminal-content');
        this.setupInput();

        // Execute initial commands silently
        this.executeCommand('whoami', true);
        this.executeCommand('neofetch', true);
        this.createNewPrompt();
    }

    setupInput() {
        if (!this.content) return;

        this.content.addEventListener('click', () => {
            const input = this.content.querySelector('.terminal-input');
            if (input) input.focus();
        });

        document.addEventListener('keydown', (e) => {
            // Only process if terminal is the active window
            const terminal = document.getElementById('window-terminal');
            if (terminal && !terminal.classList.contains('hidden') && terminal.classList.contains('window-active')) {
                const input = this.content.querySelector('.terminal-input');
                if (input && document.activeElement !== input) {
                     // Check if it's a regular key
                     if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Enter') {
                         input.focus();
                     }
                }
            }
        });
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

    createNewPrompt() {
        if (!this.content) return;

        // Remove old cursor
        const oldCursor = this.content.querySelector('.animate-pulse');
        if (oldCursor) oldCursor.remove();

        // Disable old inputs
        const oldInputs = this.content.querySelectorAll('.terminal-input');
        oldInputs.forEach(input => {
            input.disabled = true;
            input.classList.remove('terminal-input');
        });

        const promptDiv = document.createElement('div');
        promptDiv.className = 'flex items-center mb-2';
        promptDiv.innerHTML = `
            <span class="text-green-400 font-bold mr-1">sebastian@adwaita</span>:
            <span class="text-adwaita-blue font-bold mx-1">~</span>$
            <input type="text" class="terminal-input bg-transparent border-none outline-none text-adwaita-text ml-2 flex-1 font-fira-code" autocomplete="off" spellcheck="false" autofocus>
            <span class="animate-pulse block w-2 h-4 bg-gray-200 inline-block align-middle ml-1"></span>
        `;

        this.content.appendChild(promptDiv);

        const input = promptDiv.querySelector('input');

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const cmd = input.value.trim();
                input.disabled = true;

                // Keep the value visible
                const valueSpan = document.createElement('span');
                valueSpan.className = 'ml-2 text-adwaita-text';
                valueSpan.textContent = cmd;

                input.parentNode.replaceChild(valueSpan, input);

                if (cmd) {
                    this.executeCommand(cmd);
                }

                if (cmd !== 'clear') {
                    this.createNewPrompt();
                }
            }
        });

        // Add a small delay for focusing due to DOM rendering
        setTimeout(() => input.focus(), 10);
        this.scrollToBottom();
    }

    executeCommand(cmdStr, silent = false) {
        if (!this.content) return;

        const args = cmdStr.split(' ').filter(a => a);
        const cmd = args[0].toLowerCase();

        const outputDiv = document.createElement('div');
        outputDiv.className = 'text-gray-100 mb-4';

        if (!silent) {
            switch(cmd) {
                case 'help':
                    outputDiv.innerHTML = `
                        Comandos disponibles:<br>
                        &nbsp;&nbsp;<span class="text-adwaita-blue">whoami</span> &nbsp;&nbsp;- Muestra el usuario actual<br>
                        &nbsp;&nbsp;<span class="text-adwaita-blue">neofetch</span> - Muestra información del sistema<br>
                        &nbsp;&nbsp;<span class="text-adwaita-blue">clear</span> &nbsp;&nbsp;&nbsp;- Limpia la terminal<br>
                        &nbsp;&nbsp;<span class="text-adwaita-blue">ls</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Lista los archivos<br>
                        &nbsp;&nbsp;<span class="text-adwaita-blue">cat</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Lee un archivo<br>
                        &nbsp;&nbsp;<span class="text-adwaita-blue">open</span> &nbsp;&nbsp;&nbsp;&nbsp;- Abre una aplicación (ej. open projects)
                    `;
                    break;
                case 'whoami':
                    outputDiv.textContent = 'Sebastian Duran Caballero';
                    break;
                case 'neofetch':
                    this.renderNeofetch(outputDiv);
                    break;
                case 'clear':
                    this.content.innerHTML = '';
                    this.createNewPrompt();
                    return; // Avoid appending outputDiv
                case 'ls':
                    outputDiv.innerHTML = `
                        <span class="text-adwaita-blue font-bold">description.txt</span> &nbsp;&nbsp;
                        <span class="text-adwaita-blue font-bold">skills.txt</span> &nbsp;&nbsp;
                        <span class="text-adwaita-blue font-bold">contact.txt</span>
                    `;
                    break;
                case 'cat':
                    if (args.length > 1) {
                        const file = args[1];
                        if (file === 'description.txt') {
                            outputDiv.textContent = 'Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.';
                        } else if (file === 'skills.txt') {
                            outputDiv.textContent = 'HTML, CSS, JS, .NET, C#, SQL Server';
                        } else if (file === 'contact.txt') {
                            outputDiv.textContent = 'Email: sd8587793@email.com | Github: sebastianDuranC';
                        } else {
                            outputDiv.textContent = `cat: ${this.escapeHTML(file)}: No existe el archivo o directorio`;
                        }
                    } else {
                        outputDiv.textContent = 'cat: falta un operando de archivo';
                    }
                    break;
                case 'open':
                     if (args.length > 1) {
                        const appName = args[1].toLowerCase();
                        const validApps = ['projects', 'skills', 'contact', 'terminal'];
                        if (validApps.includes(appName)) {
                            if (window.app) {
                                window.app.openWindow(appName);
                                outputDiv.textContent = `Abriendo ${appName}...`;
                            } else {
                                outputDiv.textContent = 'Error: Sistema no inicializado.';
                            }
                        } else {
                            outputDiv.textContent = `open: aplicación no encontrada: ${this.escapeHTML(appName)}`;
                        }
                     } else {
                         outputDiv.textContent = 'open: falta el nombre de la aplicación';
                     }
                     break;
                default:
                    outputDiv.innerHTML = `bash: ${this.escapeHTML(cmd)}: no se encontró la orden. Escribe <span class="text-adwaita-blue">help</span> para ver los comandos disponibles.`;
            }
            this.content.appendChild(outputDiv);
        } else {
            // For silent execution (initialization)
             if (cmd === 'whoami') {
                  const pCmd = document.createElement('p');
                  pCmd.className = 'mb-2';
                  pCmd.innerHTML = '<span class="text-green-400 font-bold">sebastian@adwaita</span>:<span class="text-adwaita-blue font-bold">~</span>$ whoami';

                  const pOut = document.createElement('p');
                  pOut.className = 'text-gray-100 mb-4';
                  pOut.textContent = 'Sebastian Duran Caballero';

                  this.content.appendChild(pCmd);
                  this.content.appendChild(pOut);
             } else if (cmd === 'neofetch') {
                  const pCmd = document.createElement('p');
                  pCmd.className = 'mb-2';
                  pCmd.innerHTML = '<span class="text-green-400 font-bold">sebastian@adwaita</span>:<span class="text-adwaita-blue font-bold">~</span>$ neofetch';
                  this.content.appendChild(pCmd);

                  const neoDiv = document.createElement('div');
                  neoDiv.className = 'text-gray-100 mb-4';
                  this.renderNeofetch(neoDiv);
                  this.content.appendChild(neoDiv);
             }
        }

        this.scrollToBottom();
    }

    renderNeofetch(container) {
        container.innerHTML = `
            <div class="flex flex-col md:flex-row">
                <div class="mr-6 mb-4 md:mb-0 text-adwaita-blue text-xs sm:text-sm font-bold">
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
   \`.  | /        ,'
     \`./'      ,-'
       \`-----'
</pre>
                </div>
                <div>
                    <p><span class="text-adwaita-blue font-bold">OS:</span> GNOME OS x86_64</p>
                    <p><span class="text-adwaita-blue font-bold">Host:</span> Desarrollador Web</p>
                    <p><span class="text-adwaita-blue font-bold">Uptime:</span> 24/7 coding</p>
                    <p><span class="text-adwaita-blue font-bold">Packages:</span> HTML, CSS, JS, .NET, C#</p>
                    <p><span class="text-adwaita-blue font-bold">Shell:</span> bash 5.2.15</p>
                    <p><span class="text-adwaita-blue font-bold">Location:</span> Santa Cruz, Bolivia</p>
                    <p><span class="text-adwaita-blue font-bold">Email:</span> sd8587793@email.com</p>
                </div>
            </div>
        `;
    }

    scrollToBottom() {
        if (this.content) {
            this.content.scrollTop = this.content.scrollHeight;
        }
    }
}
