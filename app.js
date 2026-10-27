class TerminalParser {
    constructor(outputElement) {
        this.outputElement = outputElement;
        this.prompt = '<span class="text-green-400 font-bold">sebastian@adwaita</span>:<span class="text-blue-400 font-bold">~</span>$ ';

        this.commands = {
            'help': this.cmdHelp.bind(this),
            'whoami': this.cmdWhoami.bind(this),
            'clear': this.cmdClear.bind(this),
            'ls': this.cmdLs.bind(this),
            'neofetch': this.cmdNeofetch.bind(this),
            'cat': this.cmdCat.bind(this),
            'open': this.cmdOpen.bind(this)
        };

        this.files = {
            'description.txt': 'Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.',
            'skills.txt': 'HTML, CSS, JS, .NET, C#',
            'contact.txt': 'Email: sd8587793@email.com\nGithub: @sebastianDuranC'
        };

        this.init();
    }

    init() {
        this.outputElement.innerHTML = '';

        // Pre-populate
        this.printLine(`${this.prompt}whoami`);
        this.printLine('Sebastian Duran Caballero');
        this.printLine('');

        this.printLine(`${this.prompt}neofetch`);
        this.cmdNeofetch();
        this.printLine('');

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

    printLine(htmlContent) {
        const p = document.createElement('p');
        p.innerHTML = htmlContent;
        this.outputElement.appendChild(p);
    }

    createNewInputLine() {
        const container = document.createElement('div');
        container.className = 'terminal-input-container';

        const promptSpan = document.createElement('span');
        promptSpan.innerHTML = this.prompt;

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'terminal-input';
        input.spellcheck = false;

        container.appendChild(promptSpan);
        container.appendChild(input);

        this.outputElement.appendChild(container);

        // Focus input
        setTimeout(() => input.focus(), 10);

        // Keep focus when clicking terminal
        this.outputElement.parentElement.addEventListener('click', () => {
            const inputs = this.outputElement.querySelectorAll('.terminal-input');
            if (inputs.length > 0) {
                inputs[inputs.length - 1].focus();
            }
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = input.value.trim();

                // Disable previous input
                input.disabled = true;

                if (cmd) {
                    this.executeCommand(cmd);
                } else {
                    this.createNewInputLine();
                }
            }
        });

        // Scroll to bottom
        this.outputElement.scrollTop = this.outputElement.scrollHeight;
    }

    executeCommand(cmdStr) {
        const args = cmdStr.split(' ').filter(arg => arg.trim() !== '');
        const cmd = args[0].toLowerCase();

        if (this.commands[cmd]) {
            this.commands[cmd](args);
        } else {
            this.printLine(`bash: ${this.escapeHTML(cmd)}: command not found`);
        }

        if (cmd !== 'clear') {
            this.createNewInputLine();
        }
    }

    // Commands
    cmdHelp(args) {
        this.printLine('Available commands:');
        this.printLine('  help      - Show this help message');
        this.printLine('  whoami    - Print current user');
        this.printLine('  clear     - Clear terminal output');
        this.printLine('  ls        - List directory contents');
        this.printLine('  cat       - Concatenate and print files (e.g. cat description.txt)');
        this.printLine('  neofetch  - Print system information');
        this.printLine('  open      - Open an application (e.g. open projects, open skills, open contact)');
    }

    cmdWhoami(args) {
        this.printLine('Sebastian Duran Caballero');
    }

    cmdClear(args) {
        this.outputElement.innerHTML = '';
        this.createNewInputLine();
    }

    cmdLs(args) {
        const filesHtml = Object.keys(this.files).map(f => `<span class="text-blue-300">${f}</span>`).join('  ');
        this.printLine(filesHtml);
    }

    cmdCat(args) {
        if (args.length < 2) {
            this.printLine('cat: missing operand');
            return;
        }
        const file = args[1];
        if (this.files[file]) {
            // Replace newlines with <br> for HTML display
            this.printLine(this.escapeHTML(this.files[file]).replace(/\n/g, '<br>'));
        } else {
            this.printLine(`cat: ${this.escapeHTML(file)}: No such file or directory`);
        }
    }

    cmdNeofetch(args) {
        const asciiArt = `
<pre class="text-adwaita-blue font-bold text-xs sm:text-sm mr-6">
           .MMM..:MMMMMMM
          MMMMMMMMMMMMMMMMMM
          MMMMMMMMMMMMMMMMMMMM.
         MMMMMMMMMMMMMMMMMMMMMM
        ,MMMMMMMMMMMMMMMMMMMMMM:
        MMMMMMMMMMMMMMMMMMMMMMMM
  .MMMM'  MMMMMMMMMMMMMMMMMMMMMM
 MMMMMM    'MMMMMMMMMMMMMMMMMMMM.
MMMMMMMM      MMMMMMMMMMMMMMMMMM .
MMMMMMMMMM'    'MMMMMMMMMMMMMMM. ..
MMMMMMMMMMMMM:   'MMMMMMMMMMMMO. ..
MMMMMMMMMMMMMMMAC   'MMMMMMMM. . .
MMMMMMMMMMMMMMMMMAST   'MMMMM . .
MMMMMMMMMMMMMMMMMMMMG:   'MMM.
</pre>`;

        const infoHtml = `
            <div class="flex flex-col md:flex-row text-gray-100">
                ${asciiArt}
                <div>
                    <p><span class="text-adwaita-blue font-bold">OS:</span> GNOME OS x86_64</p>
                    <p><span class="text-adwaita-blue font-bold">Host:</span> Desarrollador Web</p>
                    <p><span class="text-adwaita-blue font-bold">Kernel:</span> 6.1.0-linux</p>
                    <p><span class="text-adwaita-blue font-bold">Uptime:</span> 24/7 coding</p>
                    <p><span class="text-adwaita-blue font-bold">Packages:</span> HTML, CSS, JS, .NET, C#</p>
                    <p><span class="text-adwaita-blue font-bold">Shell:</span> bash 5.1.16</p>
                    <p><span class="text-adwaita-blue font-bold">DE:</span> GNOME 43</p>
                    <p><span class="text-adwaita-blue font-bold">WM:</span> Mutter</p>
                    <p><span class="text-adwaita-blue font-bold">Theme:</span> Adwaita-dark [GTK3/4]</p>
                    <p><span class="text-adwaita-blue font-bold">Location:</span> Santa Cruz, Bolivia</p>
                </div>
            </div>
        `;
        this.printLine(infoHtml);
    }

    cmdOpen(args) {
        if (args.length < 2) {
            this.printLine('open: missing application name');
            return;
        }
        const appName = args[1].toLowerCase();
        const validApps = ['projects', 'skills', 'contact', 'terminal'];

        if (validApps.includes(appName)) {
            this.printLine(`Opening ${appName}...`);
            // Trigger app open globally
            if (window.app) {
                window.app.openWindow(appName);
            }
        } else {
            this.printLine(`open: application '${this.escapeHTML(appName)}' not found`);
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

        // Initialize Terminal
        const terminalOutput = document.getElementById('terminal-output');
        if (terminalOutput) {
            this.terminalParser = new TerminalParser(terminalOutput);
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

                // If maximized, clicking header and dragging will restore it
                if(win.classList.contains('maximized')) {
                    // Temporarily remove maximized class to calculate proper offset
                    win.classList.remove('maximized');
                    win.style.transform = 'none';

                    const rect = win.getBoundingClientRect();
                    // Calculate mouse position relative to window top-left
                    const mouseX = e.clientX - rect.left;

                    // Center the restored window horizontally under the mouse, within bounds
                    const newLeft = Math.max(0, Math.min(e.clientX - (win.offsetWidth / 2), window.innerWidth - win.offsetWidth));
                    const newTop = Math.max(28, e.clientY - 15); // Keep under top bar

                    // Reset transform tracking variables
                    xOffset = newLeft - win.offsetLeft;
                    yOffset = newTop - win.offsetTop;

                    this.setTranslate(xOffset, yOffset, win);
                }

                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;
                    this.bringToFront(win);

                    // Prevent text selection while dragging
                    document.body.style.userSelect = 'none';
                }
            };

            const drag = (e) => {
                if (isDragging) {
                    e.preventDefault();

                    const currentX = e.clientX - initialX;
                    const currentY = e.clientY - initialY;

                    xOffset = currentX;
                    yOffset = currentY;

                    this.setTranslate(currentX, currentY, win);

                    // Aero snap preview (optional enhancement, here we just maximize on release)
                }
            };

            const dragEnd = (e) => {
                if(isDragging) {
                    isDragging = false;
                    document.body.style.userSelect = '';

                    // Top edge snap to maximize
                    if (e.clientY <= 28) { // 28px is top bar height
                        this.maximizeWindow(win.dataset.id);
                    }
                }
            };

            header.addEventListener('mousedown', dragStart);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);
        });
    }

    setupResizableWindows() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer;
            let originalWidth;
            let originalHeight;
            let originalX;
            let originalY;
            let originalMouseX;
            let originalMouseY;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    if(win.classList.contains('maximized')) return;

                    isResizing = true;
                    currentResizer = resizer;
                    this.bringToFront(win);

                    originalWidth = parseFloat(getComputedStyle(win, null).getPropertyValue('width').replace('px', ''));
                    originalHeight = parseFloat(getComputedStyle(win, null).getPropertyValue('height').replace('px', ''));

                    // Extract current translate values
                    const style = window.getComputedStyle(win);
                    const matrix = new DOMMatrixReadOnly(style.transform);
                    originalX = matrix.m41;
                    originalY = matrix.m42;

                    originalMouseX = e.clientX;
                    originalMouseY = e.clientY;
                });
            });

            window.addEventListener('mousemove', (e) => {
                if (!isResizing) return;

                // Get minimum dimensions from Tailwind classes if possible, or fallback
                const minWidth = 300;
                const minHeight = 200;

                if (currentResizer.classList.contains('resizer-br')) {
                    const width = originalWidth + (e.clientX - originalMouseX);
                    const height = originalHeight + (e.clientY - originalMouseY);
                    if (width > minWidth) win.style.width = width + 'px';
                    if (height > minHeight) win.style.height = height + 'px';
                }
                else if (currentResizer.classList.contains('resizer-r')) {
                    const width = originalWidth + (e.clientX - originalMouseX);
                    if (width > minWidth) win.style.width = width + 'px';
                }
                else if (currentResizer.classList.contains('resizer-b')) {
                    const height = originalHeight + (e.clientY - originalMouseY);
                    if (height > minHeight) win.style.height = height + 'px';
                }
            });

            window.addEventListener('mouseup', () => {
                isResizing = false;
            });
        });
    }

    setTranslate(xPos, yPos, el) {
        el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
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
                win.dataset.prevTransform = win.style.transform;
                win.dataset.prevWidth = win.style.width;
                win.dataset.prevHeight = win.style.height;

                win.classList.add('maximized');
                win.style.transform = 'none';

                // Clear inline dimensions to let CSS handle it
                win.style.width = '';
                win.style.height = '';
            } else {
                win.classList.remove('maximized');
                if (win.dataset.prevTransform) {
                    win.style.transform = win.dataset.prevTransform;
                }
                if(win.dataset.prevWidth) win.style.width = win.dataset.prevWidth;
                if(win.dataset.prevHeight) win.style.height = win.dataset.prevHeight;
            }
            this.bringToFront(win);
        }
    }
}

// Expose globally
window.app = new LinuxOS();