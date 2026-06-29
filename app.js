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
        this.setupTopMenu();
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

    setupTopMenu() {
        const menuBtn = document.getElementById('system-menu-btn');
        const menu = document.getElementById('system-menu');

        if(menuBtn && menu) {
            menuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                menu.classList.toggle('hidden');
            });

            document.addEventListener('click', (e) => {
                if(!menu.contains(e.target) && !menuBtn.contains(e.target)) {
                    menu.classList.add('hidden');
                }
            });
        }
    }

    setupResizers() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer;

            let startX, startY, startWidth, startHeight, startLeft, startTop;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    e.stopPropagation(); // prevent window drag

                    isResizing = true;
                    currentResizer = resizer;

                    startX = e.clientX;
                    startY = e.clientY;

                    const rect = win.getBoundingClientRect();
                    startWidth = rect.width;
                    startHeight = rect.height;
                    startLeft = rect.left;
                    startTop = rect.top;

                    document.addEventListener('mousemove', resize);
                    document.addEventListener('mouseup', stopResize);

                    this.bringToFront(win);
                });
            });

            const resize = (e) => {
                if (!isResizing) return;

                if (win.classList.contains('maximized')) return;

                if (currentResizer.classList.contains('resizer-r')) {
                    win.style.width = startWidth + (e.clientX - startX) + 'px';
                } else if (currentResizer.classList.contains('resizer-b')) {
                    win.style.height = startHeight + (e.clientY - startY) + 'px';
                } else if (currentResizer.classList.contains('resizer-br')) {
                    win.style.width = startWidth + (e.clientX - startX) + 'px';
                    win.style.height = startHeight + (e.clientY - startY) + 'px';
                }
            };

            const stopResize = () => {
                isResizing = false;
                document.removeEventListener('mousemove', resize);
                document.removeEventListener('mouseup', stopResize);
            };
        });
    }

    setupTerminal() {
        const terminalInput = document.getElementById('terminal-input');
        const terminalWindow = document.getElementById('window-terminal');

        if (terminalInput && terminalWindow) {
            // Focus input when terminal is clicked
            terminalWindow.addEventListener('click', () => {
                if (!window.getSelection().toString()) {
                    terminalInput.focus();
                }
            });

            terminalInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const command = terminalInput.value.trim();
                    terminalInput.value = '';
                    this.executeCommand(command);
                }
            });
        }
    }

    executeCommand(command) {
        const terminalContent = document.querySelector('#window-terminal .window-content');
        const inputLine = document.getElementById('terminal-input-line');

        if (!terminalContent || !inputLine) return;

        // Echo command
        const echoLine = document.createElement('p');
        echoLine.className = 'mb-2 mt-2 text-sm';
        echoLine.innerHTML = `<span class="text-green-400 font-bold">sebastian@ubuntu</span>:<span class="text-blue-400 font-bold">~</span>$ ${command}`;
        terminalContent.insertBefore(echoLine, inputLine);

        // Process command
        const outputLine = document.createElement('div');
        outputLine.className = 'mb-4 text-sm text-gray-200';

        const cmd = command.toLowerCase();

        if (cmd === 'clear') {
            // Remove everything except the input line
            Array.from(terminalContent.children).forEach(child => {
                if (child !== inputLine) {
                    terminalContent.removeChild(child);
                }
            });
            return;
        } else if (cmd === 'whoami') {
            outputLine.innerHTML = '<p>Sebastian Duran Caballero - Desarrollador Web .NET</p>';
        } else if (cmd === 'help') {
             outputLine.innerHTML = `
                <p>Comandos disponibles:</p>
                <ul class="ml-4 mt-2 list-disc list-inside">
                    <li><span class="text-yellow-400">whoami</span> - Muestra información sobre mi</li>
                    <li><span class="text-yellow-400">neofetch</span> - Muestra información del sistema</li>
                    <li><span class="text-yellow-400">clear</span> - Limpia la consola</li>
                    <li><span class="text-yellow-400">help</span> - Muestra este mensaje</li>
                </ul>
            `;
        } else if (cmd === 'neofetch') {
            outputLine.innerHTML = `
                <div class="flex flex-col md:flex-row text-gray-100 mb-4 mt-2">
                        <div class="mr-6 mb-4 md:mb-0 text-[#e95420] text-xs sm:text-sm font-bold">
<pre>
       _,-/\`--,-/\\\\-,
     ,' /   ,-'   ) \\\\
   ,'  |  ,'     /   \\\\
  /    | /      /     \\\\
 /      /      /      |
|      /      /       |
|      |     /        |
|      |    /         |
 \\\\     |   /         /
  \\\\    |  /         /
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
                    </div>
            `;
        } else if (cmd === '') {
             // do nothing
             return;
        } else {
            outputLine.innerHTML = `<p class="text-red-400">bash: ${command}: orden no encontrada. Escribe 'help' para ver los comandos.</p>`;
        }

        terminalContent.insertBefore(outputLine, inputLine);

        // Scroll to bottom
        terminalContent.scrollTop = terminalContent.scrollHeight;
    }
}

// Initialize the OS
const app = new LinuxOS();