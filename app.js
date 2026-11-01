class TerminalParser {
    constructor() {
        this.output = document.getElementById('terminal-output');
        this.input = document.getElementById('terminal-input');

        if(this.input) {
            this.input.addEventListener('keydown', (e) => {
                if(e.key === 'Enter') {
                    this.processCommand(this.input.value);
                    this.input.value = '';
                }
            });
        }

        this.initContent();
    }

    initContent() {
        this.echo('whoami');
        this.echoHTML('<p class="text-gray-100 mb-4">Sebastian Duran Caballero</p>');
        this.echo('neofetch');
        const neofetchHTML = `
            <div class="flex flex-col md:flex-row text-gray-100 mb-4">
                <div class="mr-6 mb-4 md:mb-0 text-adwaita-blue text-xs sm:text-sm font-bold">
<pre>
           .
          / \\
         /   \\
        /^.   \\
       /  .-.  \\
      /  (   ) _\\
     / _.~   ~._^\\
    /.^         ^.\\
</pre>
                </div>
                <div>
                    <p><span class="text-adwaita-blue font-bold">OS:</span> Adwaita OS x86_64</p>
                    <p><span class="text-adwaita-blue font-bold">Host:</span> Desarrollador Web</p>
                    <p><span class="text-adwaita-blue font-bold">Uptime:</span> 24/7 coding</p>
                    <p><span class="text-adwaita-blue font-bold">Packages:</span> HTML, CSS, JS, .NET, C#</p>
                    <p><span class="text-adwaita-blue font-bold">Shell:</span> bash 5.1.16</p>
                    <p><span class="text-adwaita-blue font-bold">Location:</span> Santa Cruz, Bolivia</p>
                    <p><span class="text-adwaita-blue font-bold">Email:</span> sd8587793@email.com</p>
                </div>
            </div>`;
        this.echoHTML(neofetchHTML);
    }

    echo(command) {
        const cmdLine = document.createElement('p');
        cmdLine.className = 'mb-2';
        cmdLine.innerHTML = `<span class="text-green-400 font-bold">sebastian@adwaita</span><span class="text-blue-400 font-bold">~</span>$ ` + this.escapeHTML(command);
        this.output.appendChild(cmdLine);
    }

    echoHTML(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        this.output.appendChild(div);
        this.scrollToBottom();
    }

    echoText(text) {
        const p = document.createElement('p');
        p.className = 'text-gray-100 mb-4 whitespace-pre-wrap';
        p.textContent = text;
        this.output.appendChild(p);
        this.scrollToBottom();
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

    scrollToBottom() {
        const content = document.getElementById('terminal-content');
        if(content) {
            content.scrollTop = content.scrollHeight;
        }
    }

    processCommand(rawCmd) {
        const cmd = rawCmd.trim();
        if(!cmd) {
            this.echo('');
            return;
        }

        this.echo(cmd);
        const parts = cmd.split(' ');
        const mainCmd = parts[0].toLowerCase();

        switch(mainCmd) {
            case 'help':
                this.echoHTML(`
                    <p class="text-gray-100 mb-4">Comandos disponibles:</p>
                    <ul class="list-none text-gray-100 mb-4 pl-4 space-y-1">
                        <li><span class="text-adwaita-blue font-bold">help</span>     - Muestra este mensaje</li>
                        <li><span class="text-adwaita-blue font-bold">whoami</span>   - Muestra el usuario actual</li>
                        <li><span class="text-adwaita-blue font-bold">clear</span>    - Limpia la terminal</li>
                        <li><span class="text-adwaita-blue font-bold">neofetch</span> - Muestra información del sistema</li>
                        <li><span class="text-adwaita-blue font-bold">ls</span>       - Lista archivos en el directorio actual</li>
                        <li><span class="text-adwaita-blue font-bold">cat</span>      - Lee un archivo</li>
                        <li><span class="text-adwaita-blue font-bold">open</span>     - Abre una aplicación (ej. open projects)</li>
                    </ul>
                `);
                break;
            case 'whoami':
                this.echoText('Sebastian Duran Caballero');
                break;
            case 'clear':
                this.output.innerHTML = '';
                break;
            case 'neofetch':
                this.initContent(); // Reuse neofetch output logic
                break;
            case 'ls':
                this.echoHTML('<p class="text-gray-100 mb-4"><span class="text-adwaita-blue font-bold">projects/</span>  <span class="text-adwaita-blue font-bold">skills/</span>  <span class="text-gray-300">description.txt</span></p>');
                break;
            case 'cat':
                if(parts[1] === 'description.txt') {
                    this.echoText('Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.');
                } else {
                    this.echoText(`cat: ${parts[1] || ''}: No existe el archivo o directorio`);
                }
                break;
            case 'open':
                const appName = parts[1]?.toLowerCase();
                if(['projects', 'skills', 'contact'].includes(appName)) {
                    this.echoText(`Abriendo ${appName}...`);
                    if(window.app) window.app.openWindow(appName);
                } else {
                    this.echoText(`Aplicación no encontrada: ${appName || ''}`);
                }
                break;
            default:
                this.echoText(`Comando no encontrado: ${mainCmd}. Escribe 'help' para ver los comandos disponibles.`);
        }
    }
}

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
        this.setupResizers();
        this.setupWindowClickToFront();
        this.setupLogin();

        this.terminalParser = new TerminalParser();
    }

    setupLogin() {
        const passwordInput = document.getElementById('login-password');
        if (passwordInput) {
            passwordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.login();
                }
            });
            passwordInput.focus();
        }

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
                this.openWindow('terminal');
                // Focus terminal input after opening
                setTimeout(() => {
                    const termInput = document.getElementById('terminal-input');
                    if(termInput) termInput.focus();
                }, 300);
            }, 500);
        }
    }

    setupClock() {
        const dateElement = document.getElementById('topbar-date');
        
        const updateClock = () => {
            const now = new Date();
            const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            let dateString = now.toLocaleDateString('es-ES', options).replace(',', '');
            dateString = dateString.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
            dateElement.textContent = dateString;
        };

        updateClock();
        setInterval(updateClock, 1000);
    }

    bringToFront(windowElement) {
        this.highestZIndex++;
        windowElement.style.zIndex = this.highestZIndex;

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
                // If it's terminal, focus input
                if(win.id === 'window-terminal') {
                    const input = document.getElementById('terminal-input');
                    if(input) input.focus();
                }
            });
        });
    }

    setupDraggableWindows() {
        this.windows.forEach(win => {
            const header = win.querySelector('.window-header');
            if (!header) return;

            let isDragging = false;
            let initialX;
            let initialY;
            let xOffset = 0;
            let yOffset = 0;

            const dragStart = (e) => {
                if(e.target.closest('button')) return;

                // If maximized, clicking header and dragging down restores it
                if(win.classList.contains('maximized')) {
                    // Only start if they drag
                    isDragging = true;
                    // We need to calculate where they grabbed it relative to the restored window width
                    // We'll set the actual offsets in the first drag move
                    win.dataset.wasMaximized = "true";
                    initialX = e.clientX;
                    initialY = e.clientY;
                    return;
                }

                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;
                }
            };

            const drag = (e) => {
                if (isDragging) {
                    e.preventDefault();

                    if(win.dataset.wasMaximized === "true") {
                        // Restore window before continuing drag
                        this.maximizeWindow(win.dataset.id);
                        win.dataset.wasMaximized = "false";

                        // Calculate new initial position so cursor stays where it grabbed
                        const rect = win.getBoundingClientRect();

                        // Adjust offset so the window center moves to cursor if grabbed near edge,
                        // or just try to keep cursor at relative position
                        const cursorRatio = e.clientX / window.innerWidth;
                        const newLeft = e.clientX - (rect.width * cursorRatio);

                        // Set transform to actual translation values relative to its CSS placement
                        // The css placement usually left: 10%, top: 10%
                        const computedStyle = window.getComputedStyle(win);
                        const leftStart = parseInt(computedStyle.left, 10);
                        const topStart = parseInt(computedStyle.top, 10);

                        xOffset = newLeft - leftStart;
                        yOffset = e.clientY - topStart;

                        initialX = e.clientX - xOffset;
                        initialY = e.clientY - yOffset;
                    }

                    let currentX = e.clientX - initialX;
                    let currentY = e.clientY - initialY;

                    xOffset = currentX;
                    yOffset = currentY;

                    // Aero snap
                    if (e.clientY <= 0 && !win.classList.contains('maximized')) {
                        // Show preview outline maybe? For now just maximize on release
                        win.dataset.snapMaximize = "true";
                    } else {
                        win.dataset.snapMaximize = "false";
                    }

                    win.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
                }
            };

            const dragEnd = (e) => {
                if(win.dataset.snapMaximize === "true" && isDragging) {
                    this.maximizeWindow(win.dataset.id);
                    win.dataset.snapMaximize = "false";
                }
                isDragging = false;
                win.dataset.wasMaximized = "false";
            };

            header.addEventListener('mousedown', dragStart);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);
        });
    }

    setupResizers() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer;
            let originalWidth = 0;
            let originalHeight = 0;
            let originalMouseX = 0;
            let originalMouseY = 0;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    if(win.classList.contains('maximized')) return;
                    e.preventDefault();
                    isResizing = true;
                    currentResizer = resizer;

                    const rect = win.getBoundingClientRect();
                    originalWidth = rect.width;
                    originalHeight = rect.height;
                    originalMouseX = e.pageX;
                    originalMouseY = e.pageY;

                    window.addEventListener('mousemove', resize);
                    window.addEventListener('mouseup', stopResize);
                });
            });

            const resize = (e) => {
                if (!isResizing) return;

                if (currentResizer.classList.contains('resizer-r') || currentResizer.classList.contains('resizer-br')) {
                    const width = originalWidth + (e.pageX - originalMouseX);
                    win.style.width = `${width}px`;
                    // Remove fixed percentage width to allow pixel resizing
                    win.style.maxWidth = 'none';
                }

                if (currentResizer.classList.contains('resizer-b') || currentResizer.classList.contains('resizer-br')) {
                    const height = originalHeight + (e.pageY - originalMouseY);
                    win.style.height = `${height}px`;
                }
            };

            const stopResize = () => {
                isResizing = false;
                window.removeEventListener('mousemove', resize);
                window.removeEventListener('mouseup', stopResize);
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

                setTimeout(() => {
                    win.classList.remove('window-opening');
                }, 200);

                this.bringToFront(win);
                this.openWindows.add(id);

                if(dot) dot.classList.remove('hidden');

                if(id === 'terminal') {
                    const termInput = document.getElementById('terminal-input');
                    if(termInput) termInput.focus();
                }
            } else {
                this.bringToFront(win);
                if(id === 'terminal') {
                    const termInput = document.getElementById('terminal-input');
                    if(termInput) termInput.focus();
                }
            }
        }
    }

    closeWindow(id) {
        const win = document.getElementById(`window-${id}`);
        const dot = document.getElementById(`dot-${id}`);
        
        if (win) {
            win.classList.add('hidden');
            win.classList.remove('maximized');
            // reset transform in case it was moved
            win.style.transform = 'translate3d(0px, 0px, 0)';

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
                win.dataset.prevWidth = win.style.width;
                win.dataset.prevHeight = win.style.height;

                win.classList.add('maximized');
                win.style.transform = 'none';
            } else {
                win.classList.remove('maximized');
                if (win.dataset.prevTransform) {
                    win.style.transform = win.dataset.prevTransform;
                }
                if (win.dataset.prevWidth) win.style.width = win.dataset.prevWidth;
                if (win.dataset.prevHeight) win.style.height = win.dataset.prevHeight;
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

window.app = new LinuxOS();