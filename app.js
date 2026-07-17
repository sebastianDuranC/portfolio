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
        this.setupResizableWindows();
        this.setupTerminal();
    }

    setupTerminal() {
        const input = document.getElementById('terminal-input');
        const output = document.getElementById('terminal-output');

        if (!input || !output) return;

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = input.value.trim();

                // Echo command
                const echoLine = document.createElement('p');
                echoLine.className = 'mb-2';

                const userHost = document.createElement('span');
                userHost.className = 'text-green-400 font-bold';
                userHost.textContent = 'sebastian@ubuntu';

                const colon = document.createTextNode(':');

                const tilde = document.createElement('span');
                tilde.className = 'text-blue-400 font-bold';
                tilde.textContent = '~';

                const prompt = document.createTextNode('$ ' + cmd);

                echoLine.appendChild(userHost);
                echoLine.appendChild(colon);
                echoLine.appendChild(tilde);
                echoLine.appendChild(prompt);

                output.appendChild(echoLine);

                // Process command
                if (cmd.length > 0) {
                    this.processCommand(cmd.toLowerCase(), output);
                }

                input.value = '';

                // Auto scroll
                const container = document.getElementById('terminal-content-area');
                if (container) {
                    container.scrollTop = container.scrollHeight;
                }
            }
        });
    }

    processCommand(cmd, output) {
        const response = document.createElement('div');
        response.className = 'text-gray-100 mb-4 whitespace-pre-wrap';

        if (cmd === 'whoami') {
            response.textContent = 'Sebastian Duran Caballero';
        } else if (cmd === 'clear') {
            output.innerHTML = '';
            return;
        } else if (cmd === 'help') {
            response.textContent = 'Comandos disponibles: whoami, clear, help, neofetch, cat description.txt, ls';
        } else if (cmd === 'ls') {
            response.textContent = 'description.txt\nprojects/\nskills/\ncontact/';
        } else if (cmd === 'cat description.txt') {
            response.textContent = 'Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.';
        } else if (cmd === 'neofetch') {
            response.innerHTML = `
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
</div>`;
        } else {
             const cmdSafe = document.createElement('span');
             cmdSafe.textContent = cmd;
             response.appendChild(cmdSafe);
             response.appendChild(document.createTextNode(': orden no encontrada'));
        }

        if (response.innerHTML !== '') {
             output.appendChild(response);
        }
    }

    setupResizableWindows() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let originalWidth = 0;
            let originalHeight = 0;
            let originalX = 0;
            let originalY = 0;
            let originalMouseX = 0;
            let originalMouseY = 0;
            let currentResizer = null;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', function(e) {
                    if (win.classList.contains('maximized')) return;
                    e.preventDefault();
                    originalWidth = parseFloat(getComputedStyle(win, null).getPropertyValue('width').replace('px', ''));
                    originalHeight = parseFloat(getComputedStyle(win, null).getPropertyValue('height').replace('px', ''));
                    originalX = win.getBoundingClientRect().left;
                    originalY = win.getBoundingClientRect().top;
                    originalMouseX = e.pageX;
                    originalMouseY = e.pageY;
                    currentResizer = resizer;
                    window.addEventListener('mousemove', resize);
                    window.addEventListener('mouseup', stopResize);
                });
            });

            function resize(e) {
                if (currentResizer.classList.contains('resizer-br')) {
                    const width = originalWidth + (e.pageX - originalMouseX);
                    const height = originalHeight + (e.pageY - originalMouseY);
                    if (width > 300) win.style.width = width + 'px';
                    if (height > 200) win.style.height = height + 'px';
                } else if (currentResizer.classList.contains('resizer-b')) {
                    const height = originalHeight + (e.pageY - originalMouseY);
                    if (height > 200) win.style.height = height + 'px';
                } else if (currentResizer.classList.contains('resizer-r')) {
                    const width = originalWidth + (e.pageX - originalMouseX);
                    if (width > 300) win.style.width = width + 'px';
                }
            }

            function stopResize() {
                window.removeEventListener('mousemove', resize);
            }
        });
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

                    // Aero snap preview
                    if (e.clientY < 35) {
                        if (!document.getElementById('snap-preview')) {
                            const preview = document.createElement('div');
                            preview.id = 'snap-preview';
                            preview.className = 'maximized-snap-preview';
                            document.getElementById('desktop').appendChild(preview);
                        }
                    } else {
                        const preview = document.getElementById('snap-preview');
                        if (preview) preview.remove();
                    }
                }
            }

            function setTranslate(xPos, yPos, el) {
                el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
            }

            function dragEnd(e) {
                initialX = currentX;
                initialY = currentY;
                isDragging = false;

                const preview = document.getElementById('snap-preview');
                if (preview) {
                    preview.remove();
                    // trigger maximize
                    const winId = win.dataset.id;
                    if (winId) app.maximizeWindow(winId);
                }
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