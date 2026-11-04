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
                if(e.target.closest('button') || e.target.closest('.resizer')) return;

                if(win.classList.contains('maximized')) {
                    // Start dragging from maximized state
                    const rect = win.getBoundingClientRect();
                    const targetLeft = e.clientX - (rect.width / 4); // Assume grabbing near center-left

                    win.classList.remove('maximized');
                    win.style.transform = 'none';

                    // Force reflow
                    void win.offsetWidth;
                    const newRect = win.getBoundingClientRect();

                    xOffset = targetLeft - newRect.left;
                    yOffset = e.clientY - newRect.top;

                    this.bringToFront(win);
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

                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;

                    xOffset = currentX;
                    yOffset = currentY;

                    setTranslate(currentX, currentY, win);

                    // Aero snap indicator could be added here
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

                // Aero snap to top
                if (e.clientY <= 28) {
                    this.maximizeWindow(win.dataset.id);
                }
            };

            header.addEventListener('mousedown', dragStart);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);

            this.setupResizers(win);
        });
    }

    setupResizers(win) {
        const resizers = win.querySelectorAll('.resizer');
        if (!resizers.length) return;

        let isResizing = false;
        let currentResizer = null;
        let originalWidth = 0;
        let originalHeight = 0;
        let originalX = 0;
        let originalY = 0;

        resizers.forEach(resizer => {
            resizer.addEventListener('mousedown', (e) => {
                e.preventDefault();
                isResizing = true;
                currentResizer = resizer;

                const rect = win.getBoundingClientRect();
                originalWidth = rect.width;
                originalHeight = rect.height;
                originalX = e.clientX;
                originalY = e.clientY;

                // Prevent drag conflicts
                e.stopPropagation();
            });
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;

            if (currentResizer.classList.contains('right')) {
                const width = originalWidth + (e.clientX - originalX);
                win.style.width = `${Math.max(width, 300)}px`;
            }
            else if (currentResizer.classList.contains('bottom')) {
                const height = originalHeight + (e.clientY - originalY);
                win.style.height = `${Math.max(height, 200)}px`;
            }
            else if (currentResizer.classList.contains('bottom-right')) {
                const width = originalWidth + (e.clientX - originalX);
                const height = originalHeight + (e.clientY - originalY);
                win.style.width = `${Math.max(width, 300)}px`;
                win.style.height = `${Math.max(height, 200)}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                currentResizer = null;
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
        this.input = document.getElementById('terminal-input');
        this.historyElement = document.getElementById('terminal-history');
        if(!this.input || !this.historyElement) return;

        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const cmd = this.input.value.trim();
                this.input.value = '';
                if(cmd) {
                    this.executeCommand(cmd);
                }
            }
        });

        // Initial setup
        this.executeCommand('whoami', true);
        this.executeCommand('neofetch', true);
    }

    executeCommand(cmd, isInit = false) {
        const echoCmd = document.createElement('div');
        echoCmd.className = 'mb-2';
        echoCmd.innerHTML = `<span class="text-green-400 font-bold">sebastian@adwaita</span>:<span class="text-adwaita-blue font-bold">~</span>$ ${this.escapeHTML(cmd)}`;
        this.historyElement.appendChild(echoCmd);

        const response = document.createElement('div');
        response.className = 'mb-4 text-gray-100';

        const commandParts = cmd.split(' ');
        const baseCmd = commandParts[0].toLowerCase();

        switch(baseCmd) {
            case 'help':
                response.innerHTML = `
                    <p>Comandos disponibles:</p>
                    <ul class="list-disc list-inside mt-1 ml-2">
                        <li><span class="text-green-300">whoami</span> - Mostrar información sobre mí</li>
                        <li><span class="text-green-300">neofetch</span> - Mostrar información del sistema</li>
                        <li><span class="text-green-300">cat</span> - Leer archivo (ej. cat descripcion.txt)</li>
                        <li><span class="text-green-300">ls</span> - Listar archivos</li>
                        <li><span class="text-green-300">clear</span> - Limpiar la terminal</li>
                        <li><span class="text-green-300">open</span> - Abrir aplicación (ej. open projects)</li>
                        <li><span class="text-green-300">help</span> - Mostrar este mensaje</li>
                    </ul>`;
                break;
            case 'whoami':
                response.textContent = 'Sebastian Duran Caballero - Desarrollador Web .NET';
                break;
            case 'neofetch':
                response.innerHTML = `
                    <div class="flex flex-col md:flex-row text-gray-100">
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
                            <p><span class="text-adwaita-blue font-bold">OS:</span> Adwaita OS x86_64</p>
                            <p><span class="text-adwaita-blue font-bold">Host:</span> Desarrollador Web</p>
                            <p><span class="text-adwaita-blue font-bold">Uptime:</span> 24/7 coding</p>
                            <p><span class="text-adwaita-blue font-bold">Packages:</span> HTML, CSS, JS, .NET, C#</p>
                            <p><span class="text-adwaita-blue font-bold">Shell:</span> bash 5.1.16</p>
                            <p><span class="text-adwaita-blue font-bold">Location:</span> Santa Cruz, Bolivia</p>
                            <p><span class="text-adwaita-blue font-bold">Email:</span> sd8587793@email.com</p>
                        </div>
                    </div>`;
                break;
            case 'ls':
                response.innerHTML = '<span class="text-adwaita-blue">projects/</span>  <span class="text-adwaita-blue">skills/</span>  <span class="text-white">descripcion.txt</span>';
                break;
            case 'cat':
                if(commandParts[1] === 'descripcion.txt') {
                    response.textContent = 'Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.';
                } else {
                    response.textContent = `cat: ${commandParts[1] ? this.escapeHTML(commandParts[1]) : ''}: No such file or directory`;
                }
                break;
            case 'clear':
                this.historyElement.innerHTML = '';
                return;
            case 'open':
                const appName = commandParts[1];
                if(['projects', 'skills', 'contact'].includes(appName)) {
                    response.textContent = `Opening ${appName}...`;
                    if(window.app) window.app.openWindow(appName);
                } else {
                    response.textContent = `open: ${appName ? this.escapeHTML(appName) : ''}: Application not found`;
                }
                break;
            default:
                response.textContent = `bash: ${baseCmd}: command not found`;
        }

        this.historyElement.appendChild(response);

        // Scroll to bottom
        const content = document.getElementById('terminal-content');
        if(content) content.scrollTop = content.scrollHeight;
    }

    escapeHTML(str) {
        return str.replace(/[&<>'"]/g,
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }
}

// Initialize the OS
const app = new LinuxOS();
window.app = app; // Expose globally for openWindow calls

// Initialize terminal after DOM loads
document.addEventListener('DOMContentLoaded', () => {
    new TerminalParser();
});