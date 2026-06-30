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

                    // Aero snap
                    if (e.clientY <= 0) {
                        isDragging = false;
                        app.maximizeWindow(win.dataset.id);
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
            }
        });
    }

    setupResizableWindows() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let minimum_size = 200;
            let original_width = 0;
            let original_height = 0;
            let original_x = 0;
            let original_y = 0;
            let original_mouse_x = 0;
            let original_mouse_y = 0;

            for (let i = 0; i < resizers.length; i++) {
                const currentResizer = resizers[i];
                currentResizer.addEventListener('mousedown', function(e) {
                    e.preventDefault();
                    original_width = parseFloat(getComputedStyle(win, null).getPropertyValue('width').replace('px', ''));
                    original_height = parseFloat(getComputedStyle(win, null).getPropertyValue('height').replace('px', ''));
                    original_x = win.getBoundingClientRect().left;
                    original_y = win.getBoundingClientRect().top;
                    original_mouse_x = e.pageX;
                    original_mouse_y = e.pageY;
                    window.addEventListener('mousemove', resize);
                    window.addEventListener('mouseup', stopResize);
                });

                function resize(e) {
                    if (win.classList.contains('maximized')) return;
                    if (currentResizer.classList.contains('resizer-br')) {
                        const width = original_width + (e.pageX - original_mouse_x);
                        const height = original_height + (e.pageY - original_mouse_y);
                        if (width > minimum_size) {
                            win.style.width = width + 'px';
                        }
                        if (height > minimum_size) {
                            win.style.height = height + 'px';
                        }
                    }
                    else if (currentResizer.classList.contains('resizer-b')) {
                        const height = original_height + (e.pageY - original_mouse_y);
                        if (height > minimum_size) {
                            win.style.height = height + 'px';
                        }
                    }
                    else if (currentResizer.classList.contains('resizer-r')) {
                        const width = original_width + (e.pageX - original_mouse_x);
                        if (width > minimum_size) {
                            win.style.width = width + 'px';
                        }
                    }
                }

                function stopResize() {
                    window.removeEventListener('mousemove', resize);
                }
            }
        });
    }

    setupTerminal() {
        const terminalInput = document.getElementById('terminal-input');
        const terminalOutput = document.getElementById('terminal-output');

        if (!terminalInput || !terminalOutput) return;

        // Ensure default focus
        terminalInput.focus();

        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = terminalInput.value.trim().toLowerCase();
                const outputLine = document.createElement('div');
                outputLine.innerHTML = `<span class="text-green-400 font-bold">sebastian@ubuntu</span>:<span class="text-blue-400 font-bold">~</span>$ ${command}`;
                outputLine.className = 'mb-2';
                terminalOutput.appendChild(outputLine);

                let response = '';

                switch (command) {
                    case 'help':
                        response = `<p class="text-gray-100 mb-4">Comandos disponibles:<br>
                            - <span class="text-yellow-300 font-bold">about</span>: Muestra información sobre mi.<br>
                            - <span class="text-yellow-300 font-bold">whoami</span>: Muestra mi nombre.<br>
                            - <span class="text-yellow-300 font-bold">neofetch</span>: Muestra información del sistema.<br>
                            - <span class="text-yellow-300 font-bold">clear</span>: Limpia la terminal.</p>`;
                        break;
                    case 'about':
                        response = `<p class="text-gray-100 mb-4">Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.</p>`;
                        break;
                    case 'whoami':
                        response = `<p class="text-gray-100 mb-4">Sebastian Duran Caballero</p>`;
                        break;
                    case 'neofetch':
                        response = `<div class="flex flex-col md:flex-row text-gray-100 mb-4">
                        <div class="mr-6 mb-4 md:mb-0 text-[#e95420] text-xs sm:text-sm font-bold">
<pre>
       _,-/` + "`" + `--,-/\\-,
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
                    case 'clear':
                        terminalOutput.innerHTML = '';
                        break;
                    case '':
                        break;
                    default:
                        response = `<p class="text-red-400 mb-4">Comando no encontrado: ${command}. Escribe 'help' para ver los comandos disponibles.</p>`;
                }

                if (response) {
                    const responseContainer = document.createElement('div');
                    responseContainer.innerHTML = response;
                    terminalOutput.appendChild(responseContainer);
                }

                terminalInput.value = '';
                document.getElementById('terminal-content').scrollTop = document.getElementById('terminal-content').scrollHeight;
            }
        });

        // Show initial content like neofetch
        terminalInput.value = 'neofetch';
        terminalInput.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Enter'}));
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