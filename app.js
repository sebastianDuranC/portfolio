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
                if (e.target.closest('button')) return;

                if (win.classList.contains('maximized')) {
                    win.classList.remove('maximized');
                    win.style.transform = 'none';
                    const rect = win.getBoundingClientRect();
                    xOffset = rect.left;
                    yOffset = rect.top;
                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;
                } else {
                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;
                }

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;
                }
            }

            function drag(e) {
                if (isDragging) {
                    e.preventDefault();
                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;

                    if (e.clientY <= 0) {
                        document.getElementById('snap-preview').classList.remove('hidden');
                        document.getElementById('snap-preview').classList.add('maximized-snap-preview');
                        document.getElementById('snap-preview').style.opacity = '1';
                    } else {
                        document.getElementById('snap-preview').classList.remove('maximized-snap-preview');
                        document.getElementById('snap-preview').style.opacity = '0';
                        setTimeout(() => {
                            if (!document.getElementById('snap-preview').classList.contains('maximized-snap-preview')) {
                                document.getElementById('snap-preview').classList.add('hidden');
                            }
                        }, 150);
                    }

                    xOffset = currentX;
                    yOffset = currentY;
                    setTranslate(currentX, currentY, win);
                }
            }

            function setTranslate(xPos, yPos, el) {
                el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
            }

            const appInstance = this;
            function dragEnd(e) {
                if (!isDragging) return;
                initialX = currentX;
                initialY = currentY;
                isDragging = false;
                document.getElementById('snap-preview').style.opacity = '0';
                setTimeout(() => {
                    document.getElementById('snap-preview').classList.add('hidden');
                }, 150);

                if (e.clientY <= 0) {
                    appInstance.maximizeWindow(win.dataset.id);
                }
            }
        });
    }

    setupResizers() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer;
            let startX, startY, startWidth, startHeight;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', function(e) {
                    isResizing = true;
                    currentResizer = resizer;
                    startX = e.clientX;
                    startY = e.clientY;
                    startWidth = parseInt(document.defaultView.getComputedStyle(win).width, 10);
                    startHeight = parseInt(document.defaultView.getComputedStyle(win).height, 10);
                    e.preventDefault();
                });
            });

            document.addEventListener('mousemove', function(e) {
                if (!isResizing) return;

                if (currentResizer.classList.contains('right') || currentResizer.classList.contains('bottom-right')) {
                    win.style.width = startWidth + (e.clientX - startX) + 'px';
                }
                if (currentResizer.classList.contains('bottom') || currentResizer.classList.contains('bottom-right')) {
                    win.style.height = startHeight + (e.clientY - startY) + 'px';
                }
            });

            document.addEventListener('mouseup', function() {
                isResizing = false;
            });
        });
    }

    setupTerminal() {
        const input = document.getElementById('terminal-input');
        const output = document.getElementById('terminal-output');
        const contentArea = document.getElementById('terminal-content');
        if (!input || !output || !contentArea) return;

        const processCommand = (cmd) => {
            const cleanCmd = cmd.trim();
            const cmdLine = document.createElement('div');
            cmdLine.innerHTML = `<span class="text-green-400 font-bold">sebastian@ubuntu</span><span class="text-white font-bold">:</span><span class="text-blue-400 font-bold">~</span><span class="text-white font-bold mr-2">$</span> ${this.escapeHtml(cleanCmd)}`;
            cmdLine.className = 'mb-2';
            output.appendChild(cmdLine);

            const response = document.createElement('div');
            response.className = 'mb-4 text-gray-100';

            switch (cleanCmd.toLowerCase()) {
                case 'whoami':
                    response.innerHTML = 'Sebastian Duran Caballero';
                    break;
                case 'cat description.txt':
                case 'cat about.txt':
                    response.innerHTML = `
                        Soy un desarrollador de software apasionado por crear aplicaciones web eficientes y experiencias de usuario atractivas.<br>
                        Tengo experiencia en tecnologías front-end y back-end, y siempre estoy buscando aprender y aplicar nuevas herramientas.<br>
                        Me encanta resolver problemas complejos y construir soluciones que marquen la diferencia.
                    `;
                    break;
                case 'ls':
                    response.innerHTML = 'description.txt  projects/  skills/  contact/';
                    break;
                case 'neofetch':
                    response.innerHTML = `
                        <div class="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-xs sm:text-sm">
                            <div class="text-[#e95420] font-bold text-center mb-4 sm:mb-0 hidden sm:block">
                                <pre class="font-ubuntu-mono leading-tight">
            .-/+oossssoo+/-.
        \`:+ssssssssssssssssss+:\`
      -+ssssssssssssssssssyyssss+-
    .ossssssssssssssssssdMMMNysssso.
   /ssssssssssshdmmNNmmyNMMMMhssssss/
  +ssssssssshmydMMMMMMMNddddyssssssss+
 /sssssssshNMMMyhhyyyyhmNMMMNhssssssss/
.ssssssssdMMMNhsssssssssshNMMMdssssssss.
+sssshhhyNMMNyssssssssssssyNMMMysssssss+
ossyNMMMNyMMhsssssssssssssshmmmhssssssso
ossyNMMMNyMMhsssssssssssssshmmmhssssssso
+sssshhhyNMMNyssssssssssssyNMMMysssssss+
.ssssssssdMMMNhsssssssssshNMMMdssssssss.
 /sssssssshNMMMyhhyyyyhdNMMMNhssssssss/
  +sssssssssdmydMMMMMMMMddddyssssssss+
   /ssssssssssshdmNNNNmyNMMMMhssssss/
    .ossssssssssssssssssdMMMNysssso.
      -+sssssssssssssssssyyyssss+-
        \`:+ssssssssssssssssss+:\`
            .-/+oossssoo+/-.
                                </pre>
                            </div>
                            <div>
                                <p><span class="text-[#e95420] font-bold">sebastian</span>@<span class="text-[#e95420] font-bold">ubuntu</span></p>
                                <p>-------------------</p>
                                <p><span class="text-[#e95420] font-bold">OS:</span> Ubuntu 22.04.3 LTS x86_64</p>
                                <p><span class="text-[#e95420] font-bold">Host:</span> Portfolio v2.0</p>
                                <p><span class="text-[#e95420] font-bold">Kernel:</span> 5.15.0-82-generic</p>
                                <p><span class="text-[#e95420] font-bold">Uptime:</span> 1 year, 2 days</p>
                                <p><span class="text-[#e95420] font-bold">Packages:</span> HTML, CSS, JS, .NET, C#</p>
                                <p><span class="text-[#e95420] font-bold">Shell:</span> bash 5.1.16</p>
                                <p><span class="text-[#e95420] font-bold">Location:</span> Santa Cruz, Bolivia</p>
                                <p><span class="text-[#e95420] font-bold">Email:</span> sd8587793@email.com</p>
                            </div>
                        </div>
                    `;
                    break;
                case 'clear':
                    output.innerHTML = '';
                    return;
                case 'help':
                    response.innerHTML = `
                        Available commands:<br>
                        <span class="text-green-400">whoami</span> - Display current user<br>
                        <span class="text-green-400">cat description.txt</span> - Display about me<br>
                        <span class="text-green-400">ls</span> - List directory contents<br>
                        <span class="text-green-400">neofetch</span> - Display system information<br>
                        <span class="text-green-400">clear</span> - Clear terminal output<br>
                        <span class="text-green-400">help</span> - Display this help message
                    `;
                    break;
                case '':
                    return;
                default:
                    response.innerHTML = `Command '${this.escapeHtml(cleanCmd)}' not found. Type 'help' for a list of commands.`;
            }
            output.appendChild(response);
            contentArea.scrollTop = contentArea.scrollHeight;
        };

        // Populate default commands to show identity without breaking data
        processCommand('whoami');
        processCommand('cat description.txt');

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                processCommand(input.value);
                input.value = '';
                contentArea.scrollTop = contentArea.scrollHeight;
            }
        });
    }

    escapeHtml(unsafe) {
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
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