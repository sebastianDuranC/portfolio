class TerminalParser {
    constructor(outputElement, inputElement) {
        this.output = outputElement;
        this.input = inputElement;
        this.setupInput();
        this.printWelcome();
    }

    setupInput() {
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const command = this.input.value.trim();
                if (command) {
                    this.executeCommand(command);
                } else {
                    this.appendPrompt();
                }
                this.input.value = '';

                // Scroll to bottom
                this.output.parentElement.scrollTop = this.output.parentElement.scrollHeight;
            }
        });
    }

    appendPrompt(cmd = '') {
        const promptLine = document.createElement('div');
        promptLine.className = 'mb-2';
        promptLine.innerHTML = `<span class="text-green-400 font-bold">sebastian@adwaita</span>:<span class="text-[#3584e4] font-bold">~</span>$ ${this.escapeHTML(cmd)}`;
        this.output.appendChild(promptLine);
    }

    appendOutput(text, isHtml = false) {
        const outputLine = document.createElement('div');
        outputLine.className = 'text-gray-100 mb-4';
        if (isHtml) {
            outputLine.innerHTML = text;
        } else {
            outputLine.textContent = text;
        }
        this.output.appendChild(outputLine);
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

    executeCommand(command) {
        this.appendPrompt(command);
        const args = command.split(' ');
        const cmd = args[0].toLowerCase();

        switch (cmd) {
            case 'help':
                this.appendOutput('Comandos disponibles: \nhelp, whoami, clear, ls, neofetch, cat [file], open [app]');
                break;
            case 'whoami':
                this.appendOutput('Sebastian Duran Caballero');
                break;
            case 'clear':
                this.output.innerHTML = '';
                break;
            case 'ls':
                this.appendOutput('description.txt  projects/  skills/  contact/');
                break;
            case 'cat':
                if (args[1] === 'description.txt') {
                    this.appendOutput('Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.');
                } else {
                    this.appendOutput(`cat: ${this.escapeHTML(args[1] || '')}: No such file or directory`);
                }
                break;
            case 'neofetch':
                const neofetchHTML = `
                    <div class="flex flex-col md:flex-row text-gray-100">
                        <div class="mr-6 mb-4 md:mb-0 text-[#3584e4] text-xs sm:text-sm font-bold">
<pre>
         _YYYYYYYYYYYYYYYYYYYYYYYYY_
       _YYYYYYYYYYYYYYYYYYYYYYYYYYYYY_
      YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
     YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
    YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
   YYYYYYYYYYYYY           YYYYYYYYYYYYYYY
  YYYYYYYYYYYY               YYYYYYYYYYYYYY
 YYYYYYYYYYYY                 YYYYYYYYYYYYYY
YYYYYYYYYYYY                   YYYYYYYYYYYYYY
YYYYYYYYYYYY                   YYYYYYYYYYYYYY
YYYYYYYYYYYY                   YYYYYYYYYYYYYY
YYYYYYYYYYYY                   YYYYYYYYYYYYYY
 YYYYYYYYYYYY                 YYYYYYYYYYYYYY
  YYYYYYYYYYYY               YYYYYYYYYYYYYY
   YYYYYYYYYYYYY           YYYYYYYYYYYYYYY
    YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
     YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
      YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
       ~YYYYYYYYYYYYYYYYYYYYYYYYYYYYY~
         ~YYYYYYYYYYYYYYYYYYYYYYYYY~
</pre>
                        </div>
                        <div>
                            <p><span class="text-[#3584e4] font-bold">OS:</span> GNOME Adwaita x86_64</p>
                            <p><span class="text-[#3584e4] font-bold">Host:</span> Desarrollador Web</p>
                            <p><span class="text-[#3584e4] font-bold">Uptime:</span> 24/7 coding</p>
                            <p><span class="text-[#3584e4] font-bold">Packages:</span> HTML, CSS, JS, .NET, C#</p>
                            <p><span class="text-[#3584e4] font-bold">Shell:</span> bash 5.1.16</p>
                            <p><span class="text-[#3584e4] font-bold">Location:</span> Santa Cruz, Bolivia</p>
                            <p><span class="text-[#3584e4] font-bold">Email:</span> sd8587793@email.com</p>
                        </div>
                    </div>`;
                this.appendOutput(neofetchHTML, true);
                break;
            case 'open':
                const appName = args[1];
                if (['projects', 'skills', 'contact'].includes(appName)) {
                    if (window.app) {
                        window.app.openWindow(appName);
                        this.appendOutput(`Opening ${this.escapeHTML(appName)}...`);
                    }
                } else {
                    this.appendOutput(`open: ${this.escapeHTML(appName || '')}: Application not found`);
                }
                break;
            default:
                this.appendOutput(`bash: ${this.escapeHTML(cmd)}: command not found`);
        }
    }

    printWelcome() {
        this.executeCommand('whoami');
        this.executeCommand('cat description.txt');
        this.executeCommand('neofetch');
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

        const terminalOutput = document.getElementById('terminal-output');
        const terminalInput = document.getElementById('terminal-input');
        if (terminalOutput && terminalInput) {
            this.terminal = new TerminalParser(terminalOutput, terminalInput);
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
                if (this.terminal && this.terminal.input) {
                    this.terminal.input.focus();
                }
            }, 500); // Wait for transition to complete
        }
    }

    setupClock() {
        const dateElement = document.getElementById('topbar-date');
        if (!dateElement) return;
        
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

                // If it's terminal, focus input
                if (win.id === 'window-terminal' && this.terminal && this.terminal.input) {
                    this.terminal.input.focus();
                }
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

            // Start offset at 0
            if (!win.dataset.xOffset) win.dataset.xOffset = 0;
            if (!win.dataset.yOffset) win.dataset.yOffset = 0;

            const dragStart = (e) => {
                // Don't drag if maximizing/closing buttons are clicked
                if(e.target.closest('button')) return;

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;
                    this.bringToFront(win);

                    if (win.classList.contains('maximized')) {
                        // Un-maximize on drag
                        win.classList.remove('maximized');
                        win.style.transform = 'none'; // Temporarily clear transform to calculate correct offset

                        const rect = win.getBoundingClientRect();
                        const desktopRect = document.getElementById('desktop').getBoundingClientRect();

                        // Center the window on the mouse horizontally, but keep vertical pos relative to mouse
                        // Calculate where the left edge should be so mouse is centered in header
                        let targetLeft = e.clientX - (rect.width / 2);

                        // Ensure it doesn't go off screen
                        if (targetLeft < desktopRect.left) targetLeft = desktopRect.left;
                        if (targetLeft + rect.width > desktopRect.right) targetLeft = desktopRect.right - rect.width;

                        // Calculate new offset based on target position vs natural layout position
                        // The natural position is where CSS put it (e.g. left: 10%, top: 10px)
                        const computedStyle = window.getComputedStyle(win);
                        const layoutLeft = parseFloat(computedStyle.left) + desktopRect.left;
                        const layoutTop = parseFloat(computedStyle.top) + desktopRect.top;

                        // New offset is difference between target and layout position
                        win.dataset.xOffset = targetLeft - layoutLeft;
                        win.dataset.yOffset = e.clientY - layoutTop - (e.clientY - rect.top); // keep relative Y position

                        // Apply immediately so it jumps to mouse
                        win.style.transform = `translate3d(${win.dataset.xOffset}px, ${win.dataset.yOffset}px, 0)`;
                    }

                    initialX = e.clientX - parseFloat(win.dataset.xOffset);
                    initialY = e.clientY - parseFloat(win.dataset.yOffset);
                }
            };

            const drag = (e) => {
                if (isDragging) {
                    e.preventDefault();

                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;

                    win.dataset.xOffset = currentX;
                    win.dataset.yOffset = currentY;

                    win.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;

                    // Aero snap to top
                    if (e.clientY <= 0) {
                        this.maximizeWindow(win.dataset.id);
                        isDragging = false; // Stop dragging once snapped
                    }
                }
            };

            const dragEnd = (e) => {
                isDragging = false;
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

                    // Bring to front when resizing
                    this.bringToFront(win);

                    // Convert % widths/heights to px to avoid jumping
                    win.style.width = originalWidth + 'px';
                    win.style.height = originalHeight + 'px';
                });
            });

            document.addEventListener('mousemove', (e) => {
                if (!isResizing) return;

                if (currentResizer.classList.contains('resizer-r') || currentResizer.classList.contains('resizer-br')) {
                    const width = originalWidth + (e.pageX - originalMouseX);
                    // Use max to ensure min-width from css is respected
                    win.style.width = width + 'px';
                }

                if (currentResizer.classList.contains('resizer-b') || currentResizer.classList.contains('resizer-br')) {
                    const height = originalHeight + (e.pageY - originalMouseY);
                    win.style.height = height + 'px';
                }
            });

            document.addEventListener('mouseup', () => {
                isResizing = false;
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

                // Remove animation class after it finishes
                setTimeout(() => {
                    win.classList.remove('window-opening');
                }, 200);

                this.bringToFront(win);
                this.openWindows.add(id);

                if(dot) dot.classList.remove('hidden');

                if (id === 'terminal' && this.terminal && this.terminal.input) {
                    this.terminal.input.focus();
                }
            } else {
                this.bringToFront(win);
                if (id === 'terminal' && this.terminal && this.terminal.input) {
                    this.terminal.input.focus();
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
}

// Initialize the OS and expose to window
window.app = new LinuxOS();