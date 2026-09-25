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
        this.setupResizers();
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
                // Auto focus terminal input
                const termInput = document.getElementById('terminal-input');
                if(termInput) termInput.focus();
            }, 500);
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

    setupResizers() {
        const resizers = document.querySelectorAll('.resizer');
        resizers.forEach(resizer => {
            resizer.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();

                const winId = resizer.getAttribute('data-win');
                const win = document.getElementById(`window-${winId}`);
                if (!win || win.classList.contains('maximized')) return;

                this.bringToFront(win);

                const isRight = resizer.classList.contains('resizer-r');
                const isBottom = resizer.classList.contains('resizer-b');
                const isBottomRight = resizer.classList.contains('resizer-br');

                const startX = e.clientX;
                const startY = e.clientY;
                const startWidth = win.offsetWidth;
                const startHeight = win.offsetHeight;

                const doDrag = (eDrag) => {
                    if (isRight || isBottomRight) {
                        win.style.width = startWidth + eDrag.clientX - startX + 'px';
                    }
                    if (isBottom || isBottomRight) {
                        win.style.height = startHeight + eDrag.clientY - startY + 'px';
                    }
                };

                const stopDrag = () => {
                    document.documentElement.removeEventListener('mousemove', doDrag, false);
                    document.documentElement.removeEventListener('mouseup', stopDrag, false);
                };

                document.documentElement.addEventListener('mousemove', doDrag, false);
                document.documentElement.addEventListener('mouseup', stopDrag, false);
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

                if(win.classList.contains('maximized')) {
                    // Un-maximize and recalculate offset based on mouse position relative to desktop
                    win.classList.remove('maximized');
                    win.style.transform = 'none'; // Temporarily clear transform

                    const desktop = document.getElementById('desktop');
                    const desktopRect = desktop.getBoundingClientRect();

                    // Center window on cursor somewhat, or just use current mouse pos
                    // Calculate absolute positions relative to desktop
                    const mouseX = e.clientX - desktopRect.left;

                    // We need to set top/left style to not jump
                    win.style.left = Math.max(0, mouseX - (win.offsetWidth / 2)) + 'px';
                    win.style.top = '0px';

                    // Reset transform offsets
                    xOffset = 0;
                    yOffset = 0;

                    initialX = e.clientX;
                    initialY = e.clientY;
                    isDragging = true;
                    return;
                }

                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;
                }
            }

            function drag(e) {
                if (isDragging) {
                    e.preventDefault();

                    // Snap to top to maximize
                    const desktop = document.getElementById('desktop');
                    const desktopRect = desktop.getBoundingClientRect();

                    if (e.clientY <= desktopRect.top + 5) {
                        window.app.maximizeWindow(win.id.replace('window-', ''));
                        isDragging = false;
                        return;
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

                // If it's terminal, focus input
                if(id === 'terminal') {
                    const termInput = document.getElementById('terminal-input');
                    if(termInput) termInput.focus();
                }
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

// Terminal Parser Logic
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

        // Initial text
        this.printLine(`<p class="mb-2"><span class="text-[#8ff0a4] font-bold">sebastian@adwaita</span>:<span class="text-[#78aeed] font-bold">~</span>$ whoami</p>`);
        this.printLine(`<p class="text-gray-100 mb-4">Sebastian Duran Caballero</p>`);
        this.printLine(`<p class="mb-2"><span class="text-[#8ff0a4] font-bold">sebastian@adwaita</span>:<span class="text-[#78aeed] font-bold">~</span>$ neofetch</p>`);
        this.printNeofetch();
    }

    printLine(htmlString) {
        if(!this.output) return;
        const div = document.createElement('div');
        div.innerHTML = htmlString;
        this.output.appendChild(div);
        this.scrollToBottom();
    }

    printText(text) {
        if(!this.output) return;
        const div = document.createElement('div');
        div.textContent = text;
        div.className = 'text-gray-100 mb-4';
        this.output.appendChild(div);
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
        if(content) content.scrollTop = content.scrollHeight;
    }

    printNeofetch() {
        this.printLine(`
            <div class="flex flex-col md:flex-row text-gray-100 mb-4">
                <div class="mr-6 mb-4 md:mb-0 text-[#3584e4] text-xs sm:text-sm font-bold">
<pre>
       _,-/` + '`' + `--,-/\\-,
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
        `);
    }

    processCommand(cmd) {
        const safeCmd = this.escapeHTML(cmd.trim());
        this.printLine(`<p class="mb-2 mt-2"><span class="text-[#8ff0a4] font-bold">sebastian@adwaita</span>:<span class="text-[#78aeed] font-bold">~</span>$ ${safeCmd}</p>`);

        const args = cmd.trim().split(' ').filter(c => c);
        if(args.length === 0) return;

        const mainCmd = args[0].toLowerCase();

        switch(mainCmd) {
            case 'help':
                this.printLine(`
                    <div class="text-gray-100 mb-4">
                        <p>Comandos disponibles:</p>
                        <ul class="list-disc ml-6 mt-2">
                            <li><span class="text-[#8ff0a4]">whoami</span> - Muestra el usuario actual</li>
                            <li><span class="text-[#8ff0a4]">neofetch</span> - Muestra información del sistema</li>
                            <li><span class="text-[#8ff0a4]">clear</span> - Limpia la terminal</li>
                            <li><span class="text-[#8ff0a4]">ls</span> - Lista archivos disponibles</li>
                            <li><span class="text-[#8ff0a4]">cat &lt;file&gt;</span> - Lee un archivo</li>
                            <li><span class="text-[#8ff0a4]">open &lt;app&gt;</span> - Abre una aplicación (projects, skills, contact)</li>
                        </ul>
                    </div>
                `);
                break;
            case 'whoami':
                this.printText('Sebastian Duran Caballero');
                break;
            case 'neofetch':
                this.printNeofetch();
                break;
            case 'clear':
                if(this.output) this.output.innerHTML = '';
                break;
            case 'ls':
                this.printLine(`<p class="text-gray-100 mb-4">description.txt  resume.pdf</p>`);
                break;
            case 'cat':
                if(args[1] === 'description.txt') {
                    this.printText('Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.');
                } else if(args[1]) {
                    this.printText(`cat: ${args[1]}: No such file or directory`);
                } else {
                    this.printText(`cat: missing operand`);
                }
                break;
            case 'open':
                if(args[1]) {
                    const validApps = ['projects', 'skills', 'contact'];
                    if(validApps.includes(args[1].toLowerCase())) {
                        this.printText(`Abriendo ${args[1]}...`);
                        if(window.app) window.app.openWindow(args[1].toLowerCase());
                    } else {
                        this.printText(`Aplicación no encontrada: ${args[1]}`);
                    }
                } else {
                    this.printText(`Uso: open <projects|skills|contact>`);
                }
                break;
            default:
                this.printText(`${mainCmd}: command not found`);
        }
    }
}

// Initialize the OS
window.app = new LinuxOS();
document.addEventListener('DOMContentLoaded', () => {
    window.terminal = new TerminalParser();
});