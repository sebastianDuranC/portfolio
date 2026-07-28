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
        this.setupTerminal();
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

    setupResizableWindows() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer = null;
            let originalWidth = 0;
            let originalHeight = 0;
            let originalMouseX = 0;
            let originalMouseY = 0;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    if(win.classList.contains('maximized')) return;
                    isResizing = true;
                    currentResizer = resizer;
                    originalWidth = parseFloat(getComputedStyle(win).width.replace('px', ''));
                    originalHeight = parseFloat(getComputedStyle(win).height.replace('px', ''));
                    originalMouseX = e.pageX;
                    originalMouseY = e.pageY;
                    this.bringToFront(win);

                    document.addEventListener('mousemove', resize);
                    document.addEventListener('mouseup', stopResize);
                });
            });

            function resize(e) {
                if (!isResizing) return;

                if (currentResizer.classList.contains('resizer-r') || currentResizer.classList.contains('resizer-br')) {
                    const width = originalWidth + (e.pageX - originalMouseX);
                    if (width > 300) {
                        win.style.width = width + 'px';
                    }
                }

                if (currentResizer.classList.contains('resizer-b') || currentResizer.classList.contains('resizer-br')) {
                    const height = originalHeight + (e.pageY - originalMouseY);
                    if (height > 200) {
                        win.style.height = height + 'px';
                    }
                }
            }

            function stopResize() {
                isResizing = false;
                document.removeEventListener('mousemove', resize);
                document.removeEventListener('mouseup', stopResize);
            }
        });
    }

    setupTerminal() {
        const input = document.getElementById('terminal-input');
        const output = document.getElementById('terminal-output');
        const terminalContent = document.getElementById('terminal-content');
        if (!input || !output) return;

        // Auto focus when terminal is clicked
        terminalContent.addEventListener('click', () => {
            // Check if there is selection
            if(window.getSelection().toString() === '') {
                input.focus();
            }
        });

        // Run initial command
        setTimeout(() => this.executeCommand('neofetch', output), 500);

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = input.value.trim();

                // Echo command safely
                const echoDiv = document.createElement('div');
                echoDiv.className = 'mb-2';
                echoDiv.innerHTML = `<span class="text-green-400 font-bold">sebastian@ubuntu</span>:<span class="text-blue-400 font-bold">~</span>$ `;
                const cmdSpan = document.createElement('span');
                cmdSpan.textContent = cmd;
                echoDiv.appendChild(cmdSpan);
                output.appendChild(echoDiv);

                this.executeCommand(cmd, output);

                input.value = '';
                terminalContent.scrollTop = terminalContent.scrollHeight;
            }
        });
    }

    executeCommand(cmd, output) {
        if (!cmd) return;
        const lowerCmd = cmd.toLowerCase();

        const responseDiv = document.createElement('div');
        responseDiv.className = 'text-gray-100 mb-4';

        switch (lowerCmd) {
            case 'help':
                responseDiv.innerHTML = `Comandos disponibles:<br>
                    - <span class="text-[#e95420]">whoami</span>: Información básica<br>
                    - <span class="text-[#e95420]">neofetch</span>: Información del sistema<br>
                    - <span class="text-[#e95420]">cat description.txt</span>: Mi descripción<br>
                    - <span class="text-[#e95420]">ls</span>: Listar archivos<br>
                    - <span class="text-[#e95420]">clear</span>: Limpiar terminal<br>
                    - <span class="text-[#e95420]">open [app]</span>: Abrir aplicación (projects, skills, contact)`;
                break;
            case 'whoami':
                responseDiv.textContent = 'Sebastian Duran Caballero';
                break;
            case 'cat description.txt':
                responseDiv.textContent = 'Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.';
                break;
            case 'ls':
                responseDiv.innerHTML = 'description.txt&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-blue-400 font-bold">projects/</span>&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-blue-400 font-bold">skills/</span>';
                break;
            case 'clear':
                output.innerHTML = '';
                return;
            case 'neofetch':
                responseDiv.innerHTML = `
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
                break;
            default:
                if (lowerCmd.startsWith('open ')) {
                    const app = lowerCmd.split(' ')[1];
                    if (['projects', 'skills', 'contact'].includes(app)) {
                        this.openWindow(app);
                        responseDiv.textContent = `Abriendo ${app}...`;
                    } else {
                        responseDiv.textContent = `Aplicación no encontrada: ${app}`;
                    }
                } else {
                    responseDiv.textContent = `bash: ${cmd}: orden no encontrada`;
                }
        }
        output.appendChild(responseDiv);
    }

    setupDraggableWindows() {
        const snapPreview = document.getElementById('snap-preview');

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
            let willSnap = false;

            header.addEventListener('mousedown', dragStart.bind(this));
            document.addEventListener('mousemove', drag.bind(this));
            document.addEventListener('mouseup', dragEnd.bind(this));

            function dragStart(e) {
                if(e.target.closest('button')) return;

                if(win.classList.contains('maximized')) {
                    // Restore window from maximized but keep it at mouse position
                    win.style.transform = 'none';
                    const rect = win.getBoundingClientRect();
                    win.classList.remove('maximized');

                    // Calculate offsets to keep window under cursor
                    // Width might change if it was full screen vs inline width
                    const widthStr = win.style.width || '600px';
                    const restoredWidth = parseFloat(widthStr.replace('px',''));

                    // Center roughly around mouse if restoring from maximized top bar
                    let newX = e.clientX - (restoredWidth / 2);
                    let newY = e.clientY - 10; // slightly below mouse

                    xOffset = newX;
                    yOffset = newY - 28; // adjusting for top bar container relative positioning if needed, assuming absolute to container

                    // The #windows-container is inset-0, so coords are just viewport relative minus desktop offset
                    // Actually, window is absolute relative to #windows-container which is in #desktop
                    // desktop has mt-7 (28px) and ml-14 (56px)
                    xOffset = e.clientX - 56 - (restoredWidth / 2);
                    yOffset = e.clientY - 28 - 10;

                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;
                    setTranslate(xOffset, yOffset, win);

                    if (win.dataset.prevTransform) {
                       win.dataset.prevTransform = `translate3d(${xOffset}px, ${yOffset}px, 0)`;
                    }

                    isDragging = true;
                } else {
                    // Extract existing translation
                    const transform = win.style.transform;
                    if(transform && transform.includes('translate3d')) {
                        const match = transform.match(/translate3d\(([^p]+)px,\s*([^p]+)px/);
                        if(match) {
                            xOffset = parseFloat(match[1]);
                            yOffset = parseFloat(match[2]);
                        }
                    }

                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;
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

                    // Aero snap preview if mouse is at very top of screen
                    if (e.clientY <= 28) {
                        snapPreview.classList.remove('hidden');
                        willSnap = true;
                    } else {
                        snapPreview.classList.add('hidden');
                        willSnap = false;
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

                    if (willSnap) {
                        snapPreview.classList.add('hidden');
                        win.dataset.prevTransform = win.style.transform;
                        this.maximizeWindow(win.dataset.id);
                        willSnap = false;
                    }
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