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

            win.dataset.xOffset = win.dataset.xOffset || '0';
            win.dataset.yOffset = win.dataset.yOffset || '0';

            header.addEventListener('mousedown', dragStart.bind(this));
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);

            function dragStart(e) {
                if(e.target.closest('button')) return;

                if(win.classList.contains('maximized')) {
                    win.classList.remove('maximized');

                    const rect = win.getBoundingClientRect();
                    const desktopRect = document.getElementById('desktop').getBoundingClientRect();

                    win.style.transform = 'none';

                    let newX = e.clientX - desktopRect.left - (win.offsetWidth / 2);
                    let newY = e.clientY - desktopRect.top - 15;

                    win.dataset.xOffset = newX;
                    win.dataset.yOffset = newY;
                    setTranslate(newX, newY, win);
                }

                let xOff = parseFloat(win.dataset.xOffset) || 0;
                let yOff = parseFloat(win.dataset.yOffset) || 0;

                initialX = e.clientX - xOff;
                initialY = e.clientY - yOff;

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;
                }
            }

            function drag(e) {
                if (isDragging) {
                    e.preventDefault();

                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;

                    win.dataset.xOffset = currentX;
                    win.dataset.yOffset = currentY;

                    setTranslate(currentX, currentY, win);
                }
            }

            function setTranslate(xPos, yPos, el) {
                el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
            }

            function dragEnd(e) {
                isDragging = false;
            }
        });
    }

    setupResizableWindows() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer;
            let originalWidth;
            let originalHeight;
            let originalMouseX;
            let originalMouseY;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    isResizing = true;
                    currentResizer = resizer;
                    originalWidth = parseFloat(getComputedStyle(win, null).getPropertyValue('width').replace('px', ''));
                    originalHeight = parseFloat(getComputedStyle(win, null).getPropertyValue('height').replace('px', ''));
                    originalMouseX = e.pageX;
                    originalMouseY = e.pageY;

                    window.addEventListener('mousemove', resize);
                    window.addEventListener('mouseup', stopResize);
                });
            });

            function resize(e) {
                if (!isResizing) return;

                if (currentResizer.classList.contains('bottom-right')) {
                    const width = originalWidth + (e.pageX - originalMouseX);
                    const height = originalHeight + (e.pageY - originalMouseY);
                    win.style.width = width + 'px';
                    win.style.height = height + 'px';
                }
                else if (currentResizer.classList.contains('bottom')) {
                    const height = originalHeight + (e.pageY - originalMouseY);
                    win.style.height = height + 'px';
                }
                else if (currentResizer.classList.contains('right')) {
                    const width = originalWidth + (e.pageX - originalMouseX);
                    win.style.width = width + 'px';
                }
            }

            function stopResize() {
                isResizing = false;
                window.removeEventListener('mousemove', resize);
                window.removeEventListener('mouseup', stopResize);
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

window.app = new LinuxOS();
const app = window.app;


class TerminalParser {
    constructor() {
        this.terminalContent = document.getElementById('terminal-content');
        this.prompt = '<span class="text-green-400 font-bold">sebastian@adwaita</span>:<span class="text-blue-400 font-bold">~</span>$ ';
        this.history = [];
        this.init();
    }

    init() {
        if (!this.terminalContent) return;
        this.terminalContent.innerHTML = '';
        this.terminalContent.addEventListener('click', () => {
            const input = this.terminalContent.querySelector('.terminal-input');
            if(input) input.focus();
        });

        // Initial commands
        this.simulateCommand('whoami', 'Sebastian Duran Caballero');
        this.simulateCommand('cat description.txt', 'Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.');

        const neofetchOutput = `
<div class="flex flex-col md:flex-row text-gray-100 mb-4">
    <div class="mr-6 mb-4 md:mb-0 text-[#3584e4] text-xs sm:text-sm font-bold">
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
        <p><span class="text-[#3584e4] font-bold">OS:</span> Adwaita 22.04 LTS x86_64</p>
        <p><span class="text-[#3584e4] font-bold">Host:</span> Desarrollador Web</p>
        <p><span class="text-[#3584e4] font-bold">Uptime:</span> 24/7 coding</p>
        <p><span class="text-[#3584e4] font-bold">Packages:</span> HTML, CSS, JS, .NET, C#</p>
        <p><span class="text-[#3584e4] font-bold">Shell:</span> bash 5.1.16</p>
        <p><span class="text-[#3584e4] font-bold">Location:</span> Santa Cruz, Bolivia</p>
        <p><span class="text-[#3584e4] font-bold">Email:</span> sd8587793@email.com</p>
    </div>
</div>`;
        this.simulateCommand('neofetch', neofetchOutput, true);

        this.createNewInput();
    }

    simulateCommand(command, output, isHtml = false) {
        const cmdLine = document.createElement('p');
        cmdLine.className = 'mb-2';
        cmdLine.innerHTML = this.prompt + this.escapeHTML(command);
        this.terminalContent.appendChild(cmdLine);

        if (output) {
            const outLine = document.createElement('div');
            outLine.className = 'text-gray-100 mb-4';
            if (isHtml) {
                outLine.innerHTML = output;
            } else {
                outLine.textContent = output;
            }
            this.terminalContent.appendChild(outLine);
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
            }[tag] || tag)
        );
    }

    createNewInput() {
        const inputLine = document.createElement('div');
        inputLine.className = 'flex items-center mb-2';
        inputLine.innerHTML = this.prompt;

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'terminal-input bg-transparent border-none outline-none text-gray-200 flex-1 ml-1 font-fira-code';
        input.autocomplete = 'off';
        input.spellcheck = false;

        inputLine.appendChild(input);
        this.terminalContent.appendChild(inputLine);

        input.focus();

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = input.value.trim();
                inputLine.innerHTML = this.prompt + this.escapeHTML(cmd);
                this.processCommand(cmd);
            }
        });

        this.terminalContent.scrollTop = this.terminalContent.scrollHeight;
    }

    processCommand(cmd) {
        const args = cmd.split(' ').filter(Boolean);
        const command = args[0] ? args[0].toLowerCase() : '';

        let output = '';
        let isHtml = false;

        switch (command) {
            case '':
                break;
            case 'help':
                output = 'Comandos disponibles: whoami, neofetch, clear, ls, cat, open, help';
                break;
            case 'whoami':
                output = 'Sebastian Duran Caballero';
                break;
            case 'neofetch':
                isHtml = true;
                output = `
<div class="flex flex-col md:flex-row text-gray-100 mb-4">
    <div class="mr-6 mb-4 md:mb-0 text-[#3584e4] text-xs sm:text-sm font-bold">
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
        <p><span class="text-[#3584e4] font-bold">OS:</span> Adwaita 22.04 LTS x86_64</p>
        <p><span class="text-[#3584e4] font-bold">Host:</span> Desarrollador Web</p>
    </div>
</div>`;
                break;
            case 'clear':
                this.terminalContent.innerHTML = '';
                break;
            case 'ls':
                output = 'description.txt  projects/  skills/  contact/';
                break;
            case 'cat':
                if (args[1] === 'description.txt') {
                    output = 'Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales.';
                } else {
                    output = `cat: ${this.escapeHTML(args[1] || '')}: No such file or directory`;
                }
                break;
            case 'open':
                if (['projects', 'skills', 'contact'].includes(args[1])) {
                    window.app.openWindow(args[1]);
                    output = `Opening ${args[1]}...`;
                } else {
                    output = `Cannot open: ${this.escapeHTML(args[1] || '')}`;
                }
                break;
            default:
                output = `bash: ${this.escapeHTML(command)}: command not found`;
        }

        if (output) {
            const outLine = document.createElement('div');
            outLine.className = 'text-gray-100 mb-4';
            if (isHtml) outLine.innerHTML = output;
            else outLine.textContent = output;
            this.terminalContent.appendChild(outLine);
        }

        this.createNewInput();
    }
}

const terminal = new TerminalParser();
