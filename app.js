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
        this.setupResizers();
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


    setupResizers() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer;
            let startX, startY, startWidth, startHeight;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    isResizing = true;
                    currentResizer = resizer;
                    startX = e.clientX;
                    startY = e.clientY;
                    const rect = win.getBoundingClientRect();
                    startWidth = rect.width;
                    startHeight = rect.height;

                    this.bringToFront(win);

                    document.addEventListener('mousemove', resize);
                    document.addEventListener('mouseup', stopResize);
                });
            });

            const resize = (e) => {
                if (!isResizing) return;

                if (currentResizer.classList.contains('right') || currentResizer.classList.contains('bottom-right')) {
                    const newWidth = startWidth + (e.clientX - startX);
                    if (newWidth > 300) {
                        win.style.width = `${newWidth}px`;
                    }
                }
                if (currentResizer.classList.contains('bottom') || currentResizer.classList.contains('bottom-right')) {
                    const newHeight = startHeight + (e.clientY - startY);
                    if (newHeight > 200) {
                        win.style.height = `${newHeight}px`;
                    }
                }
            };

            const stopResize = () => {
                isResizing = false;
                document.removeEventListener('mousemove', resize);
                document.removeEventListener('mouseup', stopResize);
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

            function dragStart(e) {
                if(e.target.closest('button') || e.target.closest('.resizer')) return;

                if(win.classList.contains('maximized')) {
                    win.classList.remove('maximized');
                    win.style.transform = 'none';
                    const desktopRect = document.getElementById('desktop').getBoundingClientRect();

                    // Set offsets so that the window's left edge is slightly to the left of the mouse
                    // and top edge is where the mouse is. Or just use its absolute position.
                    // Wait, when maximized, its bounding client rect is the full screen
                    // So we want it to center on the mouse X
                    const winWidth = win.offsetWidth;
                    let newLeft = e.clientX - desktopRect.left - (winWidth / 2);
                    if (newLeft < 0) newLeft = 0;

                    let newTop = e.clientY - desktopRect.top - 10;
                    if (newTop < 0) newTop = 0;

                    xOffset = newLeft;
                    yOffset = newTop;
                    setTranslate(xOffset, yOffset, win);

                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;
                } else {
                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;
                }

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;
                    app.bringToFront(win);
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


class TerminalParser {
    constructor() {
        this.output = document.getElementById('terminal-output');
        this.input = document.getElementById('terminal-input');
        this.form = document.getElementById('terminal-form');

        if(this.form) {
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCommand(this.input.value);
                this.input.value = '';
            });
        }
        this.init();
    }

    init() {
        if(this.output) {
            this.output.innerHTML = '';
            this.printLine('<span class="text-green-400 font-bold">sebastian@gnome</span>:<span class="text-blue-400 font-bold">~</span>$ whoami', true);
            this.printLine('Sebastian Duran Caballero');
            this.printLine('<span class="text-green-400 font-bold">sebastian@gnome</span>:<span class="text-blue-400 font-bold">~</span>$ neofetch', true);
            this.printNeofetch();
        }
    }

    printLine(text, isHtml = false) {
        const div = document.createElement('div');
        div.className = 'mb-2 text-gray-100';
        if (isHtml) {
            div.innerHTML = text;
        } else {
            div.textContent = text;
        }
        this.output.appendChild(div);

        // Scroll to bottom
        const winContent = this.output.parentElement;
        winContent.scrollTop = winContent.scrollHeight;
    }

    printNeofetch() {
        const fetchHtml = `
<div class="flex flex-col md:flex-row text-gray-100 mb-4 text-xs sm:text-sm">
    <div class="mr-6 mb-4 md:mb-0 text-[#3584e4] font-bold">
<pre>
         _YYYYYYYYYYYYYYYYYYYYYYYYY_
       _YYYYYYYYYYYYYYYYYYYYYYYYYYYYY_
      YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
     YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
    YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
   YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
  YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
 YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
 YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
 YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
 YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
 YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
  YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
   YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
    YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
     YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
      YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
       _YYYYYYYYYYYYYYYYYYYYYYYYYYYYY_
         _YYYYYYYYYYYYYYYYYYYYYYYYY_
</pre>
    </div>
    <div>
        <p><span class="text-[#3584e4] font-bold">OS:</span> GNOME OS x86_64</p>
        <p><span class="text-[#3584e4] font-bold">Host:</span> Desarrollador Web</p>
        <p><span class="text-[#3584e4] font-bold">Uptime:</span> 24/7 coding</p>
        <p><span class="text-[#3584e4] font-bold">Packages:</span> HTML, CSS, JS, .NET, C#</p>
        <p><span class="text-[#3584e4] font-bold">Shell:</span> bash</p>
        <p><span class="text-[#3584e4] font-bold">Location:</span> Santa Cruz, Bolivia</p>
        <p><span class="text-[#3584e4] font-bold">Email:</span> sd8587793@email.com</p>
    </div>
</div>`;
        this.printLine(fetchHtml, true);
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

    handleCommand(cmdRaw) {
        const cmd = cmdRaw.trim();
        if (!cmd) {
            this.printLine('<span class="text-green-400 font-bold">sebastian@gnome</span>:<span class="text-blue-400 font-bold">~</span>$ ', true);
            return;
        }

        const safeCmd = this.escapeHTML(cmd);
        this.printLine(`<span class="text-green-400 font-bold">sebastian@gnome</span>:<span class="text-blue-400 font-bold">~</span>$ ${safeCmd}`, true);

        const args = cmd.split(' ').filter(x => x);
        const mainCmd = args[0].toLowerCase();

        switch(mainCmd) {
            case 'help':
                this.printLine('Available commands: help, whoami, clear, ls, neofetch, cat, open');
                break;
            case 'whoami':
                this.printLine('Sebastian Duran Caballero');
                break;
            case 'clear':
                this.output.innerHTML = '';
                break;
            case 'ls':
                this.printLine('description.txt  projects/  skills/  contact/');
                break;
            case 'neofetch':
                this.printNeofetch();
                break;
            case 'cat':
                if(args[1] === 'description.txt') {
                    this.printLine('Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.');
                } else {
                    this.printLine(`cat: ${this.escapeHTML(args[1] || '')}: No such file or directory`);
                }
                break;
            case 'open':
                const appName = args[1] ? args[1].toLowerCase() : '';
                if(['projects', 'skills', 'contact'].includes(appName)) {
                    if (window.app) {
                        window.app.openWindow(appName);
                    }
                    this.printLine(`Opening ${appName}...`);
                } else {
                    this.printLine(`open: ${this.escapeHTML(appName)}: App not found`);
                }
                break;
            default:
                this.printLine(`bash: ${safeCmd}: command not found`);
                break;
        }
    }
}

// Initialize terminal parser
const terminal = new TerminalParser();
