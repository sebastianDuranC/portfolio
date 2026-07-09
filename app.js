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

                    // Aero Snap to top
                    if (e.clientY <= 0) {
                        if (!win.classList.contains('maximized')) {
                            app.maximizeWindow(win.dataset.id);
                        }
                    } else if (win.classList.contains('maximized') && e.clientY > 10) {
                        app.maximizeWindow(win.dataset.id);
                        xOffset = currentX;
                        yOffset = currentY;
                    }

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

    setupResizers() {
        this.windows.forEach(win => {
            const resizers = ['right', 'bottom', 'bottom-right'];
            resizers.forEach(type => {
                const resizer = document.createElement('div');
                resizer.classList.add('resizer', type);
                win.appendChild(resizer);

                let isResizing = false;
                let startX, startY, startWidth, startHeight;

                resizer.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    isResizing = true;
                    startX = e.clientX;
                    startY = e.clientY;
                    startWidth = parseInt(document.defaultView.getComputedStyle(win).width, 10);
                    startHeight = parseInt(document.defaultView.getComputedStyle(win).height, 10);

                    const doDrag = (e) => {
                        if (!isResizing) return;
                        if (type.includes('right')) {
                            win.style.width = (startWidth + e.clientX - startX) + 'px';
                        }
                        if (type.includes('bottom')) {
                            win.style.height = (startHeight + e.clientY - startY) + 'px';
                        }
                    };

                    const stopDrag = () => {
                        isResizing = false;
                        document.removeEventListener('mousemove', doDrag);
                        document.removeEventListener('mouseup', stopDrag);
                    };

                    document.addEventListener('mousemove', doDrag);
                    document.addEventListener('mouseup', stopDrag);
                });
            });
        });
    }

    setupTerminal() {
        const terminalInput = document.getElementById('terminal-input');
        const terminalOutput = document.getElementById('terminal-output');

        if (!terminalInput || !terminalOutput) return;

        const printNeofetch = () => {
            const out = document.createElement('div');
            out.className = 'mb-4';
            out.innerHTML = `
                <div class="flex flex-col md:flex-row text-gray-100">
                    <div class="mr-6 mb-4 md:mb-0 text-[#e95420] text-xs sm:text-sm font-bold">
<pre>
       _,-/\`--,-/\\-,
     ,' /   ,-'   ) \\
   ,'  |  ,'     /   \\
  /    | /      /     \\
 /      /      /      |
|      /      /       |
+|      |     /        |
+|      |    /         |
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
                </div>
            `;
            terminalOutput.appendChild(out);
        };

        // Initial print
        printNeofetch();

        const processCommand = (cmd) => {
            const cmdLine = document.createElement('div');
            cmdLine.className = 'mb-2';
            cmdLine.innerHTML = `<span class="text-green-400 font-bold">sebastian@ubuntu</span>:<span class="text-blue-400 font-bold">~</span>$ `;
            const cmdText = document.createElement('span');
            cmdText.textContent = cmd;
            cmdLine.appendChild(cmdText);
            terminalOutput.appendChild(cmdLine);

            const outLine = document.createElement('div');
            outLine.className = 'mb-4 text-gray-100';

            const c = cmd.trim().toLowerCase();
            if (c === '') {
                // Do nothing
                outLine.style.display = 'none';
            } else if (c === 'whoami') {
                outLine.textContent = 'Sebastian Duran Caballero - Desarrollador Web';
            } else if (c === 'help') {
                outLine.innerHTML = 'Available commands: <br> whoami - Show current user <br> neofetch - Show system info <br> ls - List files <br> clear - Clear terminal <br> help - Show this message';
            } else if (c === 'neofetch') {
                printNeofetch();
                outLine.style.display = 'none';
            } else if (c === 'ls') {
                outLine.innerHTML = '<span class="text-blue-400">Desktop</span>  <span class="text-blue-400">Documents</span>  <span class="text-blue-400">Downloads</span>  description.txt';
            } else if (c === 'clear') {
                terminalOutput.innerHTML = '';
                outLine.style.display = 'none';
            } else if (c === 'cat description.txt') {
                outLine.textContent = 'Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.';
            } else {
                outLine.textContent = `bash: ${c}: command not found`;
            }

            if (outLine.style.display !== 'none') {
                terminalOutput.appendChild(outLine);
            }

            document.getElementById('terminal-content').scrollTop = document.getElementById('terminal-content').scrollHeight;
        };

        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const val = terminalInput.value;
                terminalInput.value = '';
                processCommand(val);
            }
        });

        // Focus input when clicking terminal content
        document.getElementById('terminal-content').addEventListener('click', () => {
            terminalInput.focus();
        });
    }
}

// Initialize the OS
const app = new LinuxOS();