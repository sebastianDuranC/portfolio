class TerminalParser {
    constructor(outputElement, inputElement) {
        this.output = outputElement;
        this.input = inputElement;

        // Initial text
        this.output.innerHTML = `
<div class="mb-4">
    <div class="text-[#26a269] font-bold inline">sebastian@adwaita</div><div class="text-white inline">:</div><div class="text-[#125997] font-bold inline">~</div><div class="text-white inline mr-2">$</div> whoami<br>
    <div class="text-gray-300 mt-1">Sebastian Duran Caballero</div>
</div>
<div class="mb-4">
    <div class="text-[#26a269] font-bold inline">sebastian@adwaita</div><div class="text-white inline">:</div><div class="text-[#125997] font-bold inline">~</div><div class="text-white inline mr-2">$</div> neofetch<br>
    <div class="flex flex-col md:flex-row text-gray-300 mt-1">
        <div class="mr-6 mb-4 md:mb-0 text-adwaita-blue font-bold whitespace-pre">
              ,,,
           ,,,   ,,,
        ,,,   ,,,   ,,,
     ,,,   ,,,   ,,,   ,,,
  ,,,   ,,,   ,,,   ,,,   ,,,
  ,,,   ,,,   ,,,   ,,,   ,,,
     ,,,   ,,,   ,,,   ,,,
        ,,,   ,,,   ,,,
           ,,,   ,,,
              ,,,
        </div>
        <div>
            <div><span class="text-adwaita-blue font-bold">OS:</span> Adwaita OS x86_64</div>
            <div><span class="text-adwaita-blue font-bold">Host:</span> Desarrollador Web</div>
            <div><span class="text-adwaita-blue font-bold">Uptime:</span> 24/7 coding</div>
            <div><span class="text-adwaita-blue font-bold">Packages:</span> HTML, CSS, JS, .NET, C#</div>
            <div><span class="text-adwaita-blue font-bold">Shell:</span> bash 5.1.16</div>
            <div><span class="text-adwaita-blue font-bold">Location:</span> Santa Cruz, Bolivia</div>
            <div><span class="text-adwaita-blue font-bold">Email:</span> sd8587793@email.com</div>
        </div>
    </div>
</div>
`;

        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = this.input.value.trim();
                this.execute(command);
                this.input.value = '';
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
            }[tag] || tag)
        );
    }

    print(text, isCommand = false, commandStr = '') {
        const div = document.createElement('div');
        div.className = 'mb-2';

        if (isCommand) {
            div.innerHTML = `<span class="text-[#26a269] font-bold">sebastian@adwaita</span><span class="text-white">:</span><span class="text-[#125997] font-bold">~</span><span class="text-white mr-2">$</span> ` + this.escapeHTML(commandStr);
        } else {
            if (typeof text === 'string') {
                div.textContent = text;
                div.className = 'text-gray-300 mb-4 whitespace-pre-wrap';
            } else {
                div.appendChild(text); // For HTML elements like neo-fetch
            }
        }

        this.output.appendChild(div);

        // Auto scroll
        const container = this.output.parentElement;
        container.scrollTop = container.scrollHeight;
    }

    execute(command) {
        if (!command) {
            this.print('', true, '');
            return;
        }

        this.print('', true, command);

        const args = command.split(' ').filter(Boolean);
        const cmd = args[0].toLowerCase();

        switch (cmd) {
            case 'help':
                this.print('Available commands:\n  help     - Show this help message\n  whoami   - Display current user\n  clear    - Clear terminal screen\n  ls       - List directory contents\n  neofetch - System information\n  cat      - Print file content\n  open     - Open an application (e.g., open projects)');
                break;
            case 'whoami':
                this.print('Sebastian Duran Caballero');
                break;
            case 'clear':
                this.output.innerHTML = '';
                break;
            case 'ls':
                this.print('description.txt  projects/  skills/  contact/');
                break;
            case 'cat':
                if (args[1] === 'description.txt') {
                    this.print('Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.');
                } else if (args[1]) {
                    this.print(`cat: ${args[1]}: No such file or directory`);
                } else {
                    this.print('cat: missing operand');
                }
                break;
            case 'neofetch':
                const neo = document.createElement('div');
                neo.innerHTML = `
<div class="flex flex-col md:flex-row text-gray-300 mt-1 mb-4">
    <div class="mr-6 mb-4 md:mb-0 text-adwaita-blue font-bold whitespace-pre">
          ,,,
       ,,,   ,,,
    ,,,   ,,,   ,,,
 ,,,   ,,,   ,,,   ,,,
,,,   ,,,   ,,,   ,,,   ,,,
,,,   ,,,   ,,,   ,,,   ,,,
 ,,,   ,,,   ,,,   ,,,
    ,,,   ,,,   ,,,
       ,,,   ,,,
          ,,,
    </div>
    <div>
        <div><span class="text-adwaita-blue font-bold">OS:</span> Adwaita OS x86_64</div>
        <div><span class="text-adwaita-blue font-bold">Host:</span> Desarrollador Web</div>
        <div><span class="text-adwaita-blue font-bold">Uptime:</span> 24/7 coding</div>
        <div><span class="text-adwaita-blue font-bold">Packages:</span> HTML, CSS, JS, .NET, C#</div>
        <div><span class="text-adwaita-blue font-bold">Shell:</span> bash 5.1.16</div>
        <div><span class="text-adwaita-blue font-bold">Location:</span> Santa Cruz, Bolivia</div>
        <div><span class="text-adwaita-blue font-bold">Email:</span> sd8587793@email.com</div>
    </div>
</div>`;
                this.print(neo);
                break;
            case 'open':
                if (args[1]) {
                    const appName = args[1].toLowerCase();
                    if (['projects', 'skills', 'contact', 'terminal'].includes(appName)) {
                        this.print(`Opening ${appName}...`);
                        setTimeout(() => {
                            if(window.app) window.app.openWindow(appName);
                        }, 300);
                    } else {
                        this.print(`open: application '${appName}' not found`);
                    }
                } else {
                    this.print('open: missing application name');
                }
                break;
            default:
                this.print(`bash: ${cmd}: command not found`);
                break;
        }
    }
}

class LinuxOS {
    constructor() {
        this.windows = document.querySelectorAll('.os-window');
        this.highestZIndex = 100;
        this.openWindows = new Set();
        this.desktop = document.getElementById('desktop');
        
        this.init();
    }

    init() {
        this.setupClock();
        this.setupDraggableWindows();
        this.setupWindowClickToFront();
        this.setupLogin();
        this.setupResizers();

        // Initialize terminal
        const termOutput = document.getElementById('terminal-output');
        const termInput = document.getElementById('terminal-input');
        if (termOutput && termInput) {
            this.terminal = new TerminalParser(termOutput, termInput);
        }
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
                document.getElementById('terminal-input').focus();
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
            if(dateElement) dateElement.textContent = dateString;
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

                // If maximized, restore when starting drag
                if(win.classList.contains('maximized')) {
                     win.classList.remove('maximized');
                     // Re-calculate offsets based on current mouse pos to prevent jumps
                     const rect = win.getBoundingClientRect();
                     const desktopRect = this.desktop.getBoundingClientRect();

                     // Transform relative to desktop
                     xOffset = e.clientX - desktopRect.left - (rect.width / 2);
                     yOffset = e.clientY - desktopRect.top - 20; // 20px grab handle offset

                     win.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0)`;
                }

                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;

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

                    win.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
                }
            };

            const dragEnd = (e) => {
                if (isDragging) {
                    initialX = currentX;
                    initialY = currentY;
                    isDragging = false;

                    // Aero snap to top to maximize
                    if (e.clientY <= 10) {
                        this.maximizeWindow(win.dataset.id);
                    }
                }
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
            let startWidth;
            let startHeight;
            let startX;
            let startY;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    isResizing = true;
                    currentResizer = resizer;

                    // Get current dimensions
                    const rect = win.getBoundingClientRect();
                    startWidth = rect.width;
                    startHeight = rect.height;
                    startX = e.clientX;
                    startY = e.clientY;

                    e.preventDefault(); // Prevent text selection
                    this.bringToFront(win);
                });
            });

            document.addEventListener('mousemove', (e) => {
                if (!isResizing) return;

                const minWidth = parseInt(getComputedStyle(win).minWidth) || 300;
                const minHeight = parseInt(getComputedStyle(win).minHeight) || 200;

                if (currentResizer.classList.contains('resizer-r') || currentResizer.classList.contains('resizer-br')) {
                    const newWidth = startWidth + (e.clientX - startX);
                    if (newWidth > minWidth) {
                        win.style.width = `${newWidth}px`;
                    }
                }

                if (currentResizer.classList.contains('resizer-b') || currentResizer.classList.contains('resizer-br')) {
                    const newHeight = startHeight + (e.clientY - startY);
                    if (newHeight > minHeight) {
                        win.style.height = `${newHeight}px`;
                    }
                }
            });

            document.addEventListener('mouseup', () => {
                isResizing = false;
                currentResizer = null;
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

                setTimeout(() => {
                    win.classList.remove('window-opening');
                }, 200);

                this.bringToFront(win);
                this.openWindows.add(id);

                if(dot) dot.classList.remove('hidden');

                // Focus terminal if opened
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
                win.classList.add('maximized');
            } else {
                win.classList.remove('maximized');
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