
class TerminalParser {
    constructor() {
        this.input = document.getElementById('terminal-input');
        this.output = document.getElementById('terminal-output');

        if (this.input && this.output) {
            this.input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleCommand(this.input.value);
                    this.input.value = '';
                }
            });

            // Re-focus input when clicking terminal window
            const terminalWindow = document.getElementById('window-terminal');
            if (terminalWindow) {
                terminalWindow.addEventListener('click', () => this.input.focus());
            }
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

    printOutput(htmlContent) {
        const div = document.createElement('div');
        div.innerHTML = htmlContent;
        this.output.appendChild(div);

        // Scroll to bottom
        const contentDiv = document.getElementById('terminal-content');
        if (contentDiv) {
            contentDiv.scrollTop = contentDiv.scrollHeight;
        }
    }

    printCommand(cmd) {
        this.printOutput(`<p class="mb-2"><span class="text-green-400 font-bold">sebastian@ubuntu</span>:<span class="text-blue-400 font-bold">~</span>$ ${this.escapeHTML(cmd)}</p>`);
    }

    handleCommand(rawCmd) {
        const cmd = rawCmd.trim();
        if (!cmd) return;

        this.printCommand(cmd);

        const args = cmd.split(' ').filter(c => c);
        const command = args[0].toLowerCase();

        switch (command) {
            case 'help':
                this.printOutput(`<p class="text-gray-100 mb-4">Comandos disponibles:<br>- <b>whoami</b>: Mostrar usuario<br>- <b>neofetch</b>: Información del sistema<br>- <b>ls</b>: Listar archivos<br>- <b>cat [file]</b>: Leer archivo<br>- <b>open [app]</b>: Abrir aplicación (projects, skills, contact)<br>- <b>clear</b>: Limpiar pantalla<br>- <b>help</b>: Mostrar esta ayuda</p>`);
                break;
            case 'whoami':
                this.printOutput(`<p class="text-gray-100 mb-4">Sebastian Duran Caballero</p>`);
                break;
            case 'clear':
                this.output.innerHTML = '';
                break;
            case 'ls':
                this.printOutput(`<p class="text-gray-100 mb-4">description.txt  projects/  skills/  contact/</p>`);
                break;
            case 'neofetch':
                this.printOutput(`
                    <div class="flex flex-col md:flex-row text-gray-100 mb-4">
                            <div class="mr-6 mb-4 md:mb-0 text-[#e95420] text-xs sm:text-sm font-bold leading-[1.2]">
<pre class="font-ubuntu-mono">
       _,-/\`--,-/\-,
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
                            <div class="flex flex-col justify-center text-[13px] leading-relaxed">
                                <p><span class="text-[#e95420] font-bold">OS:</span> Ubuntu 22.04 LTS x86_64</p>
                                <p><span class="text-[#e95420] font-bold">Host:</span> Desarrollador Web</p>
                                <p><span class="text-[#e95420] font-bold">Uptime:</span> 24/7 coding</p>
                                <p><span class="text-[#e95420] font-bold">Packages:</span> HTML, CSS, JS, .NET, C#</p>
                                <p><span class="text-[#e95420] font-bold">Shell:</span> bash 5.1.16</p>
                                <p><span class="text-[#e95420] font-bold">Location:</span> Santa Cruz, Bolivia</p>
                                <p><span class="text-[#e95420] font-bold">Email:</span> sd8587793@email.com</p>
                            </div>
                        </div>`);
                break;
            case 'cat':
                if (args[1] === 'description.txt') {
                    this.printOutput(`<p class="text-gray-100 mb-4">Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.</p>`);
                } else {
                    this.printOutput(`<p class="text-gray-100 mb-4">cat: ${this.escapeHTML(args[1] || '')}: No existe el archivo o el directorio</p>`);
                }
                break;
            case 'open':
                const app = args[1];
                if (['projects', 'skills', 'contact'].includes(app)) {
                    if (window.app) window.app.openWindow(app);
                    this.printOutput(`<p class="text-gray-100 mb-4">Abriendo ${this.escapeHTML(app)}...</p>`);
                } else {
                    this.printOutput(`<p class="text-gray-100 mb-4">Aplicación no encontrada. Apps disponibles: projects, skills, contact.</p>`);
                }
                break;
            default:
                this.printOutput(`<p class="text-gray-100 mb-4">${this.escapeHTML(command)}: orden no encontrada. Escribe 'help' para ver los comandos.</p>`);
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
        this.setupResizableWindows();
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


    setupResizableWindows() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer;
            let originalWidth, originalHeight, originalX, originalY, originalMouseX, originalMouseY;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    isResizing = true;
                    currentResizer = resizer;
                    const rect = win.getBoundingClientRect();
                    // When resizing, we must work with absolute dimensions and positions to avoid transform issues
                    const computedStyle = window.getComputedStyle(win);

                    // If transformed, we should ideally resolve it or freeze it, but for simplicity:
                    // we'll update inline width/height classes. Since we use tailwind classes like w-[80%]
                    // inline styles will override them, which is exactly what we want.

                    originalWidth = rect.width;
                    originalHeight = rect.height;
                    originalX = rect.left;
                    originalY = rect.top;
                    originalMouseX = e.pageX;
                    originalMouseY = e.pageY;

                    window.addEventListener('mousemove', resize);
                    window.addEventListener('mouseup', stopResize);
                });
            });

            const resize = (e) => {
                if (!isResizing) return;

                // Set max and min boundaries if needed
                if (currentResizer.classList.contains('resizer-br')) {
                    const width = originalWidth + (e.pageX - originalMouseX);
                    const height = originalHeight + (e.pageY - originalMouseY);
                    if (width > 300) win.style.width = width + 'px';
                    if (height > 200) win.style.height = height + 'px';
                } else if (currentResizer.classList.contains('resizer-r')) {
                    const width = originalWidth + (e.pageX - originalMouseX);
                    if (width > 300) win.style.width = width + 'px';
                } else if (currentResizer.classList.contains('resizer-b')) {
                    const height = originalHeight + (e.pageY - originalMouseY);
                    if (height > 200) win.style.height = height + 'px';
                }
            };

            const stopResize = () => {
                isResizing = false;
                window.removeEventListener('mousemove', resize);
                window.removeEventListener('mouseup', stopResize);
            };
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

            // Adding touch events support
            header.addEventListener('touchstart', dragStart, {passive: false});
            document.addEventListener('touchmove', drag, {passive: false});
            document.addEventListener('touchend', dragEnd);

            function dragStart(e) {
                if(e.target.closest('button')) return;

                // Handle un-maximizing on drag
                if(win.classList.contains('maximized')) {
                    win.style.transform = 'none'; // reset transform to measure correctly

                    // calculate relative to the desktop container, which has 28px margin top from the bar
                    const desktop = document.getElementById('desktop');
                    const desktopRect = desktop.getBoundingClientRect();

                    // User grabbed the header at some X. We want the window to shrink and center around mouse or just snap to mouse.
                    win.classList.remove('maximized');

                    // Let's recalculate xOffset and yOffset so the window snaps to the cursor without jumping wildly
                    const rect = win.getBoundingClientRect();

                    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
                    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

                    // Compute what the new offset should be to keep the mouse in the same visual place over the header
                    // Since it unmaximized, the window is now smaller. Let's just assume we want it centered on the cursor X.
                    xOffset = clientX - desktopRect.left - (rect.width / 2);
                    // Keep Y at 0 so it stays at the top where the user grabbed it
                    yOffset = clientY - desktopRect.top - 15; // 15 is approx half header height

                    // Force applying transform so `initialX` logic works seamlessly
                    setTranslate(xOffset, yOffset, win);
                }

                const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
                const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

                initialX = clientX - xOffset;
                initialY = clientY - yOffset;

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;
                }
            }

            function drag(e) {
                if (isDragging) {
                    e.preventDefault();

                    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
                    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

                    currentX = clientX - initialX;
                    currentY = clientY - initialY;

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

// Initialize the OS
window.app = new LinuxOS();