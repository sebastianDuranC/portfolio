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
            let isResizing = false;
            let currentResizer = null;

            let currentX;
            let currentY;
            let initialX;
            let initialY;
            let xOffset = 0;
            let yOffset = 0;

            let initialWidth;
            let initialHeight;

            header.addEventListener('mousedown', dragStart);

            // Resize listeners
            const resizers = win.querySelectorAll('.resizer');
            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    isResizing = true;
                    currentResizer = resizer;
                    initialX = e.clientX;
                    initialY = e.clientY;
                    initialWidth = parseFloat(getComputedStyle(win).width);
                    initialHeight = parseFloat(getComputedStyle(win).height);

                    // Also bring to front when resizing
                    this.bringToFront(win);

                    e.preventDefault();
                });
            });

            document.addEventListener('mousemove', dragOrResize);
            document.addEventListener('mouseup', dragOrResizeEnd);

            function dragStart(e) {
                // Don't drag if maximizing/closing buttons are clicked
                if(e.target.closest('button')) return;

                if (win.classList.contains('maximized')) {
                    // Restoring a maximized window by dragging
                    win.classList.remove('maximized');
                    win.style.transform = 'none'; // Temporarily set to none to calculate offsets
                    const rect = win.getBoundingClientRect();
                    const desktopRect = document.getElementById('desktop').getBoundingClientRect();

                    // We want to center the restored window on the cursor roughly, or just keep it under the cursor
                    // The simplest is to recalculate offsets based on current mouse position relative to the new window position
                    // By removing the maximized class, it snaps back to its CSS size/position.

                    xOffset = e.clientX - desktopRect.left - (win.offsetWidth / 2);
                    yOffset = e.clientY - desktopRect.top - 20; // 20px is roughly half header height

                    setTranslate(xOffset, yOffset, win);

                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;
                    isDragging = true;
                    return;
                }

                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;
                }
            }

            function dragOrResize(e) {
                if (isDragging) {
                    e.preventDefault();

                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;

                    xOffset = currentX;
                    yOffset = currentY;

                    setTranslate(currentX, currentY, win);
                } else if (isResizing) {
                    e.preventDefault();

                    if (currentResizer.classList.contains('right') || currentResizer.classList.contains('bottom-right')) {
                        const width = initialWidth + (e.clientX - initialX);
                        if(width > 300) win.style.width = width + 'px';
                    }
                    if (currentResizer.classList.contains('bottom') || currentResizer.classList.contains('bottom-right')) {
                        const height = initialHeight + (e.clientY - initialY);
                        if(height > 200) win.style.height = height + 'px';
                    }
                }
            }

            function setTranslate(xPos, yPos, el) {
                el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
            }

            function dragOrResizeEnd(e) {
                initialX = currentX;
                initialY = currentY;
                isDragging = false;
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
        this.output = document.getElementById('terminal-output');

        if (this.input && this.output) {
            this.input.addEventListener('keydown', this.handleInput.bind(this));
            this.init();
        }
    }

    init() {
        this.printLine('Bienvenido a Ubuntu 22.04 LTS (GNU/Linux 5.15.0-43-generic x86_64)');
        this.printLine(' * Documentation:  https://help.ubuntu.com');
        this.printLine(' * Management:     https://landscape.canonical.com');
        this.printLine(' * Support:        https://ubuntu.com/advantage');
        this.printLine('');
        this.executeCommand('whoami');
        this.executeCommand('neofetch');
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

    printLine(text, isHTML = false) {
        const div = document.createElement('div');
        div.className = 'mb-1';
        if (isHTML) {
            div.innerHTML = text;
        } else {
            div.textContent = text;
        }
        this.output.appendChild(div);
        this.scrollToBottom();
    }

    printPromptAndCommand(command) {
        this.printLine(`<span class="text-green-400 font-bold">sebastian@ubuntu</span>:<span class="text-blue-400 font-bold">~</span>$ ${this.escapeHTML(command)}`, true);
    }

    scrollToBottom() {
        const container = document.getElementById('terminal-container');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }

    handleInput(e) {
        if (e.key === 'Enter') {
            const command = this.input.value.trim();
            this.input.value = '';

            this.printPromptAndCommand(command);

            if (command) {
                this.executeCommand(command);
            }
        }
    }

    executeCommand(cmd) {
        const parts = cmd.split(' ');
        const baseCmd = parts[0].toLowerCase();

        switch (baseCmd) {
            case 'help':
                this.printLine('Comandos disponibles:');
                this.printLine('  help      - Muestra este mensaje de ayuda');
                this.printLine('  whoami    - Muestra el usuario actual');
                this.printLine('  clear     - Limpia la terminal');
                this.printLine('  ls        - Lista los archivos en el directorio actual');
                this.printLine('  neofetch  - Muestra la información del sistema');
                this.printLine('  cat       - Muestra el contenido de un archivo (ej: cat description.txt)');
                this.printLine('  open      - Abre una aplicación (ej: open projects)');
                break;
            case 'whoami':
                this.printLine('Sebastian Duran Caballero');
                break;
            case 'clear':
                this.output.innerHTML = '';
                break;
            case 'ls':
                this.printLine('<span class="text-blue-400 font-bold">description.txt</span>  <span class="text-blue-400 font-bold">projects</span>  <span class="text-blue-400 font-bold">skills</span>  <span class="text-blue-400 font-bold">contact</span>', true);
                break;
            case 'neofetch':
                const neofetchOutput = `
<div class="flex flex-col md:flex-row text-gray-100 mb-4">
    <div class="mr-6 mb-4 md:mb-0 text-[#e95420] text-xs sm:text-sm font-bold">
<pre>
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
                this.printLine(neofetchOutput, true);
                break;
            case 'cat':
                if (parts[1] === 'description.txt') {
                    this.printLine('Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.');
                } else {
                    this.printLine(`cat: ${this.escapeHTML(parts.slice(1).join(' '))}: No such file or directory`);
                }
                break;
            case 'open':
                const targetApp = parts[1] || '';
                if (['projects', 'skills', 'contact', 'terminal'].includes(targetApp)) {
                    // Access the global app instance
                    if (window.app) {
                        window.app.openWindow(targetApp);
                    } else if (typeof app !== 'undefined') {
                        app.openWindow(targetApp);
                    }
                    this.printLine(`Abriendo ${targetApp}...`);
                } else {
                    this.printLine(`open: ${this.escapeHTML(targetApp)}: Aplicación no encontrada`);
                }
                break;
            default:
                this.printLine(`${this.escapeHTML(baseCmd)}: command not found`);
        }
    }
}


// Initialize the OS
const app = new LinuxOS();
// Attach app to window so TerminalParser can access it reliably
window.app = app;
const terminal = new TerminalParser();