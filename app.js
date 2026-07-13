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
        this.setupWindowResizing();
        this.setupWindowClickToFront();
        this.setupTerminal();
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
                this.processCommand('neofetch');
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


    setupWindowResizing() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let currentResizer;

            let original_width = 0;
            let original_height = 0;
            let original_x = 0;
            let original_y = 0;
            let original_mouse_x = 0;
            let original_mouse_y = 0;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', function(e) {
                    e.preventDefault();
                    currentResizer = e.target;
                    original_width = parseFloat(getComputedStyle(win, null).getPropertyValue('width').replace('px', ''));
                    original_height = parseFloat(getComputedStyle(win, null).getPropertyValue('height').replace('px', ''));
                    original_x = win.getBoundingClientRect().left;
                    original_y = win.getBoundingClientRect().top;
                    original_mouse_x = e.pageX;
                    original_mouse_y = e.pageY;
                    window.addEventListener('mousemove', resize);
                    window.addEventListener('mouseup', stopResize);

                    // Don't resize if maximized
                    if(win.classList.contains('maximized')) {
                        stopResize();
                    }
                });
            });

            function resize(e) {
                if (currentResizer.classList.contains('bottom-right')) {
                    const width = original_width + (e.pageX - original_mouse_x);
                    const height = original_height + (e.pageY - original_mouse_y);
                    if (width > 300) win.style.width = width + 'px';
                    if (height > 200) win.style.height = height + 'px';
                }
                else if (currentResizer.classList.contains('bottom')) {
                    const height = original_height + (e.pageY - original_mouse_y);
                    if (height > 200) win.style.height = height + 'px';
                }
                else if (currentResizer.classList.contains('right')) {
                    const width = original_width + (e.pageX - original_mouse_x);
                    if (width > 300) win.style.width = width + 'px';
                }
            }

            function stopResize() {
                window.removeEventListener('mousemove', resize);
            }
        });
    }


    setupTerminal() {
        const input = document.getElementById('terminal-input');
        if (!input) return;

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = input.value.trim();
                if (command) {
                    this.processCommand(command);
                }
                input.value = '';
            }
        });
    }

    processCommand(cmd) {
        const history = document.getElementById('terminal-history');
        if (!history) return;

        // Echo command
        const cmdLine = document.createElement('div');
        cmdLine.className = 'mb-2';
        cmdLine.innerHTML = `<span class="text-green-400 font-bold">sebastian@ubuntu</span>:<span class="text-blue-400 font-bold">~</span>$ <span class="cmd-text"></span>`;
        cmdLine.querySelector('.cmd-text').textContent = cmd;
        history.appendChild(cmdLine);

        // Process output
        const output = document.createElement('div');
        output.className = 'text-gray-100 mb-4';

        const args = cmd.toLowerCase().split(' ');
        const mainCmd = args[0];

        switch(mainCmd) {
            case 'help':
                output.innerHTML = `
                    <p>Comandos disponibles:</p>
                    <ul class="list-disc ml-5 mt-2">
                        <li><span class="text-[#e95420]">whoami</span> - Muestra información sobre el usuario actual</li>
                        <li><span class="text-[#e95420]">neofetch</span> - Muestra información del sistema</li>
                        <li><span class="text-[#e95420]">projects</span> - Abre la ventana de proyectos</li>
                        <li><span class="text-[#e95420]">skills</span> - Abre la ventana de habilidades</li>
                        <li><span class="text-[#e95420]">contact</span> - Abre la ventana de contacto</li>
                        <li><span class="text-[#e95420]">clear</span> - Limpia la terminal</li>
                    </ul>`;
                break;
            case 'whoami':
                output.textContent = 'Sebastian Duran Caballero - Desarrollador Web .NET';
                break;
            case 'projects':
                this.openWindow('projects');
                output.textContent = 'Abriendo Proyectos...';
                break;
            case 'skills':
                this.openWindow('skills');
                output.textContent = 'Abriendo Habilidades...';
                break;
            case 'contact':
                this.openWindow('contact');
                output.textContent = 'Abriendo Contacto...';
                break;
            case 'clear':
                history.innerHTML = '';
                return; // don't append output
            case 'neofetch':
                output.className = 'flex flex-col md:flex-row text-gray-100 mb-4';
                output.innerHTML = `
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
                `;
                break;
            default:
                output.textContent = `${mainCmd}: orden no encontrada. Escribe 'help' para ver los comandos disponibles.`;
        }

        history.appendChild(output);

        // Scroll to bottom
        const contentContainer = document.getElementById('terminal-content');
        if (contentContainer) {
            contentContainer.scrollTop = contentContainer.scrollHeight;
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
        const self = this;
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

                // Aero snap to top
                if (e.clientY <= 28 && !win.classList.contains('maximized')) {
                    self.maximizeWindow(win.dataset.id);
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