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
        this.setupTerminal();
    }

    setupTerminal() {
        const terminalInput = document.getElementById('terminal-input-field');
        const terminalOutput = document.getElementById('terminal-output');

        if (!terminalInput || !terminalOutput) return;

        terminalInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const command = terminalInput.value.trim();
                terminalInput.value = '';
                this.executeCommand(command, terminalOutput);

                // Scroll to bottom
                const windowContent = terminalOutput.closest('.window-content');
                if (windowContent) {
                    windowContent.scrollTop = windowContent.scrollHeight;
                }
            }
        });
    }

    executeCommand(command, outputElement) {
        // Echo command
        const cmdEcho = document.createElement('p');
        cmdEcho.className = 'mb-2';
        cmdEcho.innerHTML = `<span class="text-green-400 font-bold">sebastian@ubuntu</span>:<span class="text-blue-400 font-bold">~</span>$ <span class="cmd-text"></span>`;
        cmdEcho.querySelector('.cmd-text').textContent = command;
        outputElement.appendChild(cmdEcho);

        if (!command) return;

        const outputRow = document.createElement('div');
        outputRow.className = 'text-gray-100 mb-4';

        const args = command.split(' ');
        const cmd = args[0].toLowerCase();

        switch (cmd) {
            case 'help':
                outputRow.innerHTML = `
                    <p>Available commands:</p>
                    <ul class="list-disc ml-4">
                        <li><span class="text-green-300">whoami</span> - Display current user</li>
                        <li><span class="text-green-300">neofetch</span> - Display system information</li>
                        <li><span class="text-green-300">ls</span> - List files</li>
                        <li><span class="text-green-300">cat</span> - View file contents</li>
                        <li><span class="text-green-300">clear</span> - Clear terminal</li>
                        <li><span class="text-green-300">help</span> - Display this help message</li>
                    </ul>
                `;
                break;
            case 'whoami':
                outputRow.textContent = 'Sebastian Duran Caballero';
                break;
            case 'neofetch':
                outputRow.innerHTML = `
                    <div class="flex flex-col md:flex-row text-gray-100 mb-4">
                        <div class="mr-6 mb-4 md:mb-0 text-[#e95420] text-xs sm:text-sm font-bold">
<pre>
       _,-/&#96;--,-/\\-,
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
                    </div>
                `;
                break;
            case 'ls':
                outputRow.innerHTML = '<span class="text-blue-400 font-bold">description.txt</span> <span class="text-blue-400 font-bold">projects/</span> <span class="text-blue-400 font-bold">skills/</span>';
                break;
            case 'cat':
                if (args[1] === 'description.txt') {
                    outputRow.textContent = 'Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.';
                } else {
                    outputRow.textContent = `cat: ${args[1] || ''}: No such file or directory`;
                }
                break;
            case 'clear':
                outputElement.innerHTML = '';
                return; // Don't append empty row
            default:
                outputRow.textContent = `${cmd}: command not found`;
        }

        outputElement.appendChild(outputRow);
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

        // Update dock icon active state
        document.querySelectorAll('.dock-icon').forEach(icon => {
            icon.classList.remove('active');
        });
        const activeId = windowElement.dataset.id;
        const dockIcon = document.getElementById(`dock-${activeId}`);
        if (dockIcon) {
            dockIcon.classList.add('active');
        }

        // Focus terminal input if terminal is brought to front
        if (activeId === 'terminal') {
            const input = document.getElementById('terminal-input-field');
            if (input) input.focus();
        }
    }

    setupWindowClickToFront() {
        this.windows.forEach(win => {
            win.addEventListener('mousedown', () => {
                this.bringToFront(win);
            });
        });
    }

    setupDraggableWindows() {
        const aeroPreview = document.getElementById('aero-snap-preview');

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

            // Resizing logic
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    isResizing = true;
                    currentResizer = resizer;
                    const startX = e.clientX;
                    const startY = e.clientY;
                    const startWidth = parseInt(document.defaultView.getComputedStyle(win).width, 10);
                    const startHeight = parseInt(document.defaultView.getComputedStyle(win).height, 10);

                    const doDrag = (e) => {
                        if (currentResizer.classList.contains('resizer-r') || currentResizer.classList.contains('resizer-br')) {
                            win.style.width = startWidth + e.clientX - startX + 'px';
                        }
                        if (currentResizer.classList.contains('resizer-b') || currentResizer.classList.contains('resizer-br')) {
                            win.style.height = startHeight + e.clientY - startY + 'px';
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


            header.addEventListener('mousedown', dragStart.bind(this));
            document.addEventListener('mousemove', drag.bind(this));
            document.addEventListener('mouseup', dragEnd.bind(this));

            function dragStart(e) {
                // Don't drag if maximizing/closing buttons are clicked
                if(e.target.closest('button')) return;

                if (win.classList.contains('maximized')) {
                    // Restore window but calculate relative position so it stays under mouse
                    win.classList.remove('maximized');
                    win.style.transform = 'none';
                    // Reset transform tracking variables
                    const rect = win.getBoundingClientRect();
                    win.style.left = e.clientX - (rect.width / 2) + 'px';
                    win.style.top = e.clientY - 10 + 'px';
                    xOffset = 0;
                    yOffset = 0;
                }

                const computed = window.getComputedStyle(win);
                const transform = new WebKitCSSMatrix(computed.transform);
                xOffset = transform.m41;
                yOffset = transform.m42;

                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;
                    this.bringToFront(win);
                }
            }

            function drag(e) {
                if (isDragging && !isResizing) {
                    e.preventDefault();

                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;

                    xOffset = currentX;
                    yOffset = currentY;

                    setTranslate(currentX, currentY, win);

                    // Aero snap preview logic
                    if (e.clientY <= 28) {
                        aeroPreview.style.display = 'block';
                        aeroPreview.style.top = '28px';
                        aeroPreview.style.left = '0';
                        aeroPreview.style.width = '100%';
                        aeroPreview.style.height = 'calc(100vh - 28px)';
                    } else {
                        aeroPreview.style.display = 'none';
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

                    if (aeroPreview) {
                        aeroPreview.style.display = 'none';
                    }

                    // Aero snap execution
                    if (e.clientY <= 28) {
                        const winId = win.dataset.id;
                        this.maximizeWindow(winId);
                    }
                }
            }
        });
    }

    openWindow(id) {
        const win = document.getElementById(`window-${id}`);
        const dockIcon = document.getElementById(`dock-${id}`);
        
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

                if (dockIcon) dockIcon.classList.add('open');
            } else {
                this.bringToFront(win);
            }
        }
    }

    closeWindow(id) {
        const win = document.getElementById(`window-${id}`);
        const dockIcon = document.getElementById(`dock-${id}`);
        
        if (win) {
            win.classList.add('hidden');
            win.classList.remove('maximized');

            this.openWindows.delete(id);
            if (dockIcon) {
                dockIcon.classList.remove('open');
                dockIcon.classList.remove('active');
            }
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