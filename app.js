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

            header.addEventListener('mousedown', dragStart.bind(this));
            document.addEventListener('mousemove', drag.bind(this));
            document.addEventListener('mouseup', dragEnd.bind(this));

            this.setupWindowResizing(win);

            function dragStart(e) {
                if(e.target.closest('button')) return;

                if (win.classList.contains('maximized')) {
                    win.classList.remove('maximized');
                    win.style.transform = 'none';

                    const rect = win.getBoundingClientRect();
                    const topBarHeight = 28;
                    const desktopOffset = topBarHeight;

                    let targetLeft = e.clientX - (rect.width / 2);

                    if (targetLeft < 0) targetLeft = 0;
                    if (targetLeft + rect.width > window.innerWidth) targetLeft = window.innerWidth - rect.width;

                    xOffset = targetLeft - rect.left;
                    yOffset = 0;

                    win.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0)`;
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

                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;

                    xOffset = currentX;
                    yOffset = currentY;

                    setTranslate(currentX, currentY, win);

                    if (e.clientY <= 28) {
                        const desktop = document.getElementById('desktop');
                        desktop.classList.add('bg-white/10');
                    } else {
                        const desktop = document.getElementById('desktop');
                        desktop.classList.remove('bg-white/10');
                    }
                }
            }

            function setTranslate(xPos, yPos, el) {
                el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
            }

            function dragEnd(e) {
                if (isDragging) {
                    initialX = currentX;
                    initialY = currentY;
                    isDragging = false;

                    const desktop = document.getElementById('desktop');
                    desktop.classList.remove('bg-white/10');

                    if (e.clientY <= 28) {
                        this.maximizeWindow(win.dataset.id);
                    }
                }
            }
        });
    }

    setupWindowResizing(win) {
        const resizers = win.querySelectorAll('.resizer');
        let isResizing = false;
        let currentResizer;
        let initialWidth, initialHeight, initialX, initialY;

        resizers.forEach(resizer => {
            resizer.addEventListener('mousedown', (e) => {
                isResizing = true;
                currentResizer = resizer;
                initialWidth = win.offsetWidth;
                initialHeight = win.offsetHeight;
                initialX = e.clientX;
                initialY = e.clientY;
                e.preventDefault();
            });
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            if (win.classList.contains('maximized')) return;

            let newWidth = initialWidth;
            let newHeight = initialHeight;

            if (currentResizer.classList.contains('right') || currentResizer.classList.contains('bottom-right')) {
                newWidth = initialWidth + (e.clientX - initialX);
            }
            if (currentResizer.classList.contains('bottom') || currentResizer.classList.contains('bottom-right')) {
                newHeight = initialHeight + (e.clientY - initialY);
            }

            // Respect min-width/height from classes, roughly checking limits to avoid visual bugs
            const minWidth = parseInt(getComputedStyle(win).minWidth) || 300;
            const minHeight = parseInt(getComputedStyle(win).minHeight) || 200;

            if (newWidth > minWidth) win.style.width = `${newWidth}px`;
            if (newHeight > minHeight) win.style.height = `${newHeight}px`;
        });

        document.addEventListener('mouseup', () => {
            isResizing = false;
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
                win.dataset.prevTransform = win.style.transform || 'none';
                win.classList.add('maximized');
                win.style.transform = 'none';
            } else {
                win.classList.remove('maximized');
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
        this.terminalContent = document.getElementById('terminal-content');
        this.history = [];
        this.historyIndex = -1;

        this.init();
    }

    init() {
        if (!this.terminalContent) return;

        this.terminalContent.innerHTML = '';

        // Print welcome sequence
        this.printLine(`<span class="text-green-400 font-bold">sebastian@adwaita</span>:<span class="text-blue-400 font-bold">~</span>$ whoami`);
        this.printLine('Sebastian Duran Caballero');
        this.printLine('');

        this.printLine(`<span class="text-green-400 font-bold">sebastian@adwaita</span>:<span class="text-blue-400 font-bold">~</span>$ neofetch`);
        this.printNeofetch();

        this.createNewInputLine();

        // Focus input when clicking anywhere in terminal
        this.terminalContent.parentElement.addEventListener('click', () => {
            const currentInput = this.terminalContent.querySelector('.terminal-input:last-of-type');
            if (currentInput) currentInput.focus();
        });
    }

    printLine(content, isHtml = true) {
        const div = document.createElement('div');
        div.className = 'mb-1 text-gray-200';
        if (isHtml) {
            div.innerHTML = content;
        } else {
            div.textContent = content;
        }
        this.terminalContent.appendChild(div);
    }

    printNeofetch() {
        const neofetchHtml = `
            <div class="flex flex-col md:flex-row text-gray-100 mb-4">
                <div class="mr-6 mb-4 md:mb-0 text-[#3584e4] text-xs sm:text-sm font-bold">
<pre>
           .
          / \\
         /   \\
        /     \\
       /       \\
      /_________\\
      \\         /
       \\       /
        \\     /
         \\   /
          \\ /
           '
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
        `;
        const div = document.createElement('div');
        div.innerHTML = neofetchHtml;
        this.terminalContent.appendChild(div);
    }

    createNewInputLine() {
        const promptDiv = document.createElement('div');
        promptDiv.className = 'flex items-center mb-1';

        const promptStr = `<span class="text-green-400 font-bold">sebastian@adwaita</span>:<span class="text-blue-400 font-bold">~</span>$ &nbsp;`;

        const promptSpan = document.createElement('span');
        promptSpan.innerHTML = promptStr;

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'terminal-input flex-1 bg-transparent border-none outline-none text-gray-200 font-fira-code caret-gray-200';
        input.autocomplete = 'off';
        input.spellcheck = false;

        input.addEventListener('keydown', (e) => this.handleInput(e, input));

        promptDiv.appendChild(promptSpan);
        promptDiv.appendChild(input);

        this.terminalContent.appendChild(promptDiv);
        input.focus();
        this.scrollToBottom();
    }

    handleInput(e, inputElement) {
        if (e.key === 'Enter') {
            const command = inputElement.value.trim();
            inputElement.disabled = true; // Lock current input

            if (command) {
                this.history.push(command);
                this.historyIndex = this.history.length;
                this.processCommand(command);
            } else {
                this.createNewInputLine();
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (this.historyIndex > 0) {
                this.historyIndex--;
                inputElement.value = this.history[this.historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (this.historyIndex < this.history.length - 1) {
                this.historyIndex++;
                inputElement.value = this.history[this.historyIndex];
            } else {
                this.historyIndex = this.history.length;
                inputElement.value = '';
            }
        }
    }

    processCommand(cmdStr) {
        const args = cmdStr.split(' ').filter(Boolean);
        const cmd = args[0].toLowerCase();

        switch (cmd) {
            case 'help':
                this.printLine('Available commands:');
                this.printLine('  <span class="text-[#3584e4]">help</span>     - Show this message');
                this.printLine('  <span class="text-[#3584e4]">whoami</span>   - Print current user info');
                this.printLine('  <span class="text-[#3584e4]">clear</span>    - Clear terminal output');
                this.printLine('  <span class="text-[#3584e4]">ls</span>       - List available files/directories');
                this.printLine('  <span class="text-[#3584e4]">neofetch</span> - Show system information');
                this.printLine('  <span class="text-[#3584e4]">cat</span>      - Read a file');
                this.printLine('  <span class="text-[#3584e4]">open</span>     - Open an application (e.g. open projects)');
                break;
            case 'whoami':
                this.printLine('Sebastian Duran Caballero');
                break;
            case 'clear':
                this.terminalContent.innerHTML = '';
                break;
            case 'ls':
                this.printLine('<span class="text-blue-400">projects</span>  <span class="text-blue-400">skills</span>  <span class="text-blue-400">contact</span>  description.txt');
                break;
            case 'neofetch':
                this.printNeofetch();
                break;
            case 'cat':
                if (args[1] === 'description.txt') {
                    this.printLine('Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.');
                } else if (!args[1]) {
                    this.printLine('cat: missing file operand');
                } else {
                    this.printLine(`cat: ${this.escapeHTML(args[1])}: No such file or directory`);
                }
                break;
            case 'open':
                if (!args[1]) {
                    this.printLine('open: missing argument');
                } else if (['projects', 'skills', 'contact'].includes(args[1])) {
                    this.printLine(`Opening ${args[1]}...`);
                    if(window.app) window.app.openWindow(args[1]);
                } else {
                    this.printLine(`open: application '${this.escapeHTML(args[1])}' not found`);
                }
                break;
            default:
                this.printLine(`${this.escapeHTML(cmd)}: command not found`);
        }

        this.createNewInputLine();
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

    scrollToBottom() {
        this.terminalContent.scrollTop = this.terminalContent.scrollHeight;
    }
}

// Initialize the OS
const app = new LinuxOS();
window.app = app;
const terminalParser = new TerminalParser();