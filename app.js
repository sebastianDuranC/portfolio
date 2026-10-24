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
            let xOffset = parseFloat(win.dataset.xOffset) || 0;
            let yOffset = parseFloat(win.dataset.yOffset) || 0;

            // Handle double click to maximize
            header.addEventListener('dblclick', (e) => {
                if(e.target.closest('button')) return;
                this.maximizeWindow(win.dataset.id);
            });

            const dragStart = (e) => {
                if(e.target.closest('button')) return;

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;
                    this.bringToFront(win);

                    // If maximized and dragging, restore it
                    if (win.classList.contains('maximized')) {
                        win.classList.remove('maximized');
                        win.style.transform = 'none'; // Temporarily clear transform to get actual rect

                        const rect = win.getBoundingClientRect();
                        const desktopRect = document.getElementById('desktop').getBoundingClientRect();

                        // Calculate where the mouse is relative to the width, and center the window on it roughly
                        const mouseRatioX = e.clientX / window.innerWidth;
                        let targetLeft = e.clientX - (rect.width * mouseRatioX);

                        // Keep within bounds
                        if (targetLeft < desktopRect.left) targetLeft = desktopRect.left;
                        if (targetLeft + rect.width > desktopRect.right) targetLeft = desktopRect.right - rect.width;

                        // Recalculate offsets based on new intended position vs natural element position
                        // Because transform is currently none, rect.left is its natural position + any left properties
                        xOffset = targetLeft - rect.left;
                        yOffset = e.clientY - desktopRect.top - 20; // 20px offset to put cursor in header

                        win.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0)`;

                        initialX = e.clientX - xOffset;
                        initialY = e.clientY - yOffset;

                    } else {
                        initialX = e.clientX - xOffset;
                        initialY = e.clientY - yOffset;
                    }
                }
            };

            const drag = (e) => {
                if (isDragging) {
                    e.preventDefault();

                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;

                    xOffset = currentX;
                    yOffset = currentY;

                    win.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;

                    // Aero snap to top
                    const desktopRect = document.getElementById('desktop').getBoundingClientRect();
                    if (e.clientY <= desktopRect.top + 5) {
                        if (!win.classList.contains('maximized')) {
                            win.dataset.xOffset = xOffset;
                            win.dataset.yOffset = yOffset;
                            this.maximizeWindow(win.dataset.id);
                            isDragging = false;
                        }
                    }
                }
            };

            const dragEnd = (e) => {
                if(isDragging) {
                    initialX = currentX;
                    initialY = currentY;
                    win.dataset.xOffset = xOffset;
                    win.dataset.yOffset = yOffset;
                    isDragging = false;
                }
            };

            header.addEventListener('mousedown', dragStart);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);

            // Set up resizers
            this.setupWindowResizers(win);
        });
    }

    setupWindowResizers(win) {
        const resizers = win.querySelectorAll('.resizer');
        let currentResizer;
        let isResizing = false;
        let startWidth, startHeight, startX, startY;

        const startResize = (e) => {
            isResizing = true;
            currentResizer = e.target;
            startX = e.clientX;
            startY = e.clientY;

            // Need to get computed width/height if not inline
            const styles = window.getComputedStyle(win);
            startWidth = parseInt(styles.width, 10);
            startHeight = parseInt(styles.height, 10);

            this.bringToFront(win);
            e.preventDefault();
        };

        const resize = (e) => {
            if (!isResizing) return;

            if (currentResizer.classList.contains('right') || currentResizer.classList.contains('bottom-right')) {
                const width = startWidth + (e.clientX - startX);
                if (width > parseInt(window.getComputedStyle(win).minWidth, 10)) {
                    win.style.width = `${width}px`;
                }
            }

            if (currentResizer.classList.contains('bottom') || currentResizer.classList.contains('bottom-right')) {
                const height = startHeight + (e.clientY - startY);
                if (height > 200) { // Arbitrary min height
                    win.style.height = `${height}px`;
                }
            }
        };

        const stopResize = () => {
            isResizing = false;
        };

        resizers.forEach(resizer => {
            resizer.addEventListener('mousedown', startResize);
        });
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
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
                // Inline transform is overriden by !important in css, but let's clear it
                win.style.transform = '';
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
        this.output = document.getElementById('terminal-output');
        this.prompt = '<span class="text-green-400 font-bold mr-1">sebastian@adwaita:</span><span class="text-adwaita-blue font-bold mr-1">~</span>$ ';

        if(this.input) {
            this.input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.executeCommand(this.input.value);
                    this.input.value = '';
                }
            });
        }

        this.init();
    }

    init() {
        if(!this.output) return;
        // Pre-populate
        this.printLine(`${this.prompt}whoami`);
        this.printLine('Sebastian Duran Caballero');
        this.printLine('');

        this.printLine(`${this.prompt}cat description.txt`);
        this.printLine('Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.');
        this.printLine('');

        this.printLine(`${this.prompt}neofetch`);
        this.printNeofetch();
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

    printLine(text) {
        const line = document.createElement('div');
        line.className = 'mb-2';
        line.innerHTML = text; // Expecting pre-formatted HTML for prompts
        this.output.appendChild(line);
        this.scrollToBottom();
    }

    printText(text) {
        const line = document.createElement('div');
        line.className = 'mb-2 text-gray-200';
        line.textContent = text;
        this.output.appendChild(line);
        this.scrollToBottom();
    }

    scrollToBottom() {
        const container = document.getElementById('terminal-content');
        if(container) container.scrollTop = container.scrollHeight;
    }

    printNeofetch() {
        const neofetchHTML = `
        <div class="flex flex-col md:flex-row text-gray-100 mb-4 mt-2">
            <div class="mr-6 mb-4 md:mb-0 text-adwaita-blue text-xs sm:text-sm font-bold leading-none">
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
            <div class="leading-relaxed">
                <p><span class="text-adwaita-blue font-bold">OS:</span> Adwaita Linux x86_64</p>
                <p><span class="text-adwaita-blue font-bold">Host:</span> Desarrollador Web</p>
                <p><span class="text-adwaita-blue font-bold">Uptime:</span> 24/7 coding</p>
                <p><span class="text-adwaita-blue font-bold">Packages:</span> HTML, CSS, JS, .NET, C#</p>
                <p><span class="text-adwaita-blue font-bold">Shell:</span> bash 5.1.16</p>
                <p><span class="text-adwaita-blue font-bold">Location:</span> Santa Cruz, Bolivia</p>
                <p><span class="text-adwaita-blue font-bold">Email:</span> sd8587793@email.com</p>
            </div>
        </div>`;
        const div = document.createElement('div');
        div.innerHTML = neofetchHTML;
        this.output.appendChild(div);
        this.scrollToBottom();
    }

    executeCommand(cmd) {
        const cleanCmd = cmd.trim();
        this.printLine(`${this.prompt}${this.escapeHTML(cleanCmd)}`);

        if (!cleanCmd) return;

        const args = cleanCmd.split(' ');
        const command = args[0].toLowerCase();

        switch (command) {
            case 'help':
                this.printText('Comandos disponibles:');
                this.printText('  help     - Muestra este mensaje');
                this.printText('  whoami   - Muestra el usuario actual');
                this.printText('  clear    - Limpia la terminal');
                this.printText('  ls       - Lista los directorios');
                this.printText('  neofetch - Muestra información del sistema');
                this.printText('  cat      - Muestra el contenido de un archivo (ej. cat description.txt)');
                this.printText('  open     - Abre una aplicación (ej. open projects)');
                break;
            case 'whoami':
                this.printText('Sebastian Duran Caballero');
                break;
            case 'clear':
                this.output.innerHTML = '';
                break;
            case 'ls':
                this.printText('description.txt  projects/  skills/  contact/');
                break;
            case 'neofetch':
                this.printNeofetch();
                break;
            case 'cat':
                if (args[1] === 'description.txt') {
                    this.printText('Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.');
                } else {
                    this.printText(`cat: ${this.escapeHTML(args[1] || '')}: No existe el archivo o directorio`);
                }
                break;
            case 'open':
                if (args[1]) {
                    const appName = args[1].toLowerCase();
                    if (['projects', 'skills', 'contact'].includes(appName)) {
                        this.printText(`Abriendo ${appName}...`);
                        if(window.app) window.app.openWindow(appName);
                    } else {
                        this.printText(`open: Aplicación no encontrada: ${this.escapeHTML(appName)}`);
                    }
                } else {
                    this.printText('Uso: open <aplicación>');
                }
                break;
            default:
                this.printText(`${this.escapeHTML(command)}: comando no encontrado`);
                break;
        }
    }
}

// Initialize the OS globally
window.app = new LinuxOS();
// Initialize Terminal Parser
window.terminalParser = new TerminalParser();