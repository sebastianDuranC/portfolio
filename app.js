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
        this.setupResizing();
        this.setupTerminal();
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

    setupResizing() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer;
            let initialX;
            let initialY;
            let initialWidth;
            let initialHeight;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', function(e) {
                    if (win.classList.contains('maximized')) return;

                    isResizing = true;
                    currentResizer = e.target;
                    initialX = e.clientX;
                    initialY = e.clientY;

                    const rect = win.getBoundingClientRect();
                    initialWidth = rect.width;
                    initialHeight = rect.height;

                    e.preventDefault(); // Prevent text selection
                });
            });

            document.addEventListener('mousemove', function(e) {
                if (!isResizing) return;

                if (currentResizer.classList.contains('right') || currentResizer.classList.contains('bottom-right')) {
                    const width = initialWidth + (e.clientX - initialX);
                    // Let min-w classes handle minimums
                    win.style.width = `${width}px`;
                }

                if (currentResizer.classList.contains('bottom') || currentResizer.classList.contains('bottom-right')) {
                    const height = initialHeight + (e.clientY - initialY);
                    // Let min-h classes handle minimums
                    win.style.height = `${height}px`;
                }
            });

            document.addEventListener('mouseup', function(e) {
                isResizing = false;
            });
        });
    }

    setupTerminal() {
        const terminalInput = document.getElementById('terminal-input');
        const terminalOutput = document.getElementById('terminal-output');
        const terminalWindow = document.getElementById('window-terminal');
        const terminalContent = document.getElementById('terminal-content');

        if (!terminalInput || !terminalOutput || !terminalWindow) return;

        // Focus input when clicking anywhere in terminal content
        terminalContent.addEventListener('click', () => {
            terminalInput.focus();
        });

        const appendOutput = (text, isHtml = false) => {
            const el = document.createElement('div');
            el.className = 'mb-2';
            if (isHtml) {
                el.innerHTML = text;
            } else {
                el.textContent = text;
            }
            terminalOutput.appendChild(el);
            terminalContent.scrollTop = terminalContent.scrollHeight;
        };

        const executeCommand = (cmd) => {
            const line = document.createElement('p');
            line.className = 'mb-2';
            line.innerHTML = `<span class="text-green-400 font-bold">sebastian@ubuntu</span>:<span class="text-blue-400 font-bold">~</span>$ `;
            const span = document.createElement('span');
            span.textContent = cmd; // use textContent to avoid self-XSS
            line.appendChild(span);
            terminalOutput.appendChild(line);

            const args = cmd.trim().split(/\s+/);
            const baseCmd = args[0].toLowerCase();

            switch (baseCmd) {
                case '':
                    break;
                case 'help':
                    appendOutput('Comandos disponibles: help, whoami, clear, ls, neofetch, cat, open');
                    break;
                case 'whoami':
                    appendOutput('Sebastian Duran Caballero');
                    break;
                case 'clear':
                    terminalOutput.innerHTML = '';
                    break;
                case 'ls':
                    appendOutput('description.txt  proyectos/  habilidades/  contacto/');
                    break;
                case 'neofetch':
                    appendOutput(`
<div class="flex flex-col md:flex-row text-gray-100 mb-4">
    <div class="mr-6 mb-4 md:mb-0 text-[#e95420] text-xs sm:text-sm font-bold">
<pre>
       _,-/\`--,-/\\-,
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
        <p><span class="text-[#e95420] font-bold">OS:</span> Ubuntu 22.04 LTS x86_64</p>
        <p><span class="text-[#e95420] font-bold">Host:</span> Desarrollador Web</p>
        <p><span class="text-[#e95420] font-bold">Uptime:</span> 24/7 coding</p>
        <p><span class="text-[#e95420] font-bold">Packages:</span> HTML, CSS, JS, .NET, C#</p>
        <p><span class="text-[#e95420] font-bold">Shell:</span> bash 5.1.16</p>
        <p><span class="text-[#e95420] font-bold">Location:</span> Santa Cruz, Bolivia</p>
        <p><span class="text-[#e95420] font-bold">Email:</span> sd8587793@email.com</p>
    </div>
</div>`, true);
                    break;
                case 'cat':
                    if (args[1] === 'description.txt') {
                        appendOutput('Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.');
                    } else if (args[1]) {
                        appendOutput(`cat: ${args[1]}: No such file or directory`);
                    } else {
                        appendOutput('Usage: cat <file>');
                    }
                    break;
                case 'open':
                    if (args[1] === 'proyectos') {
                        this.openWindow('projects');
                        appendOutput('Opening Proyectos...');
                    } else if (args[1] === 'habilidades') {
                        this.openWindow('skills');
                        appendOutput('Opening Habilidades...');
                    } else if (args[1] === 'contacto') {
                        this.openWindow('contact');
                        appendOutput('Opening Contacto...');
                    } else {
                        appendOutput(`open: ${args[1]}: No such application`);
                    }
                    break;
                default:
                    appendOutput(`${baseCmd}: command not found`);
                    break;
            }
            terminalContent.scrollTop = terminalContent.scrollHeight;
        };

        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = terminalInput.value;
                executeCommand(cmd);
                terminalInput.value = '';
            }
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

                // Don't drag if maximized
                if(win.classList.contains('maximized')) return;

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
const app = new LinuxOS();