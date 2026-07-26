class LinuxOS {
    constructor() {
        this.windows = document.querySelectorAll('.os-window');
        this.highestZIndex = 100;
        this.openWindows = new Set();
        
        this.init();
    }



    init() {
        document.addEventListener('maximizeWindow', (e) => this.maximizeWindow(e.detail.id));
        this.setupClock();
        this.setupDraggableWindows();
        this.setupWindowClickToFront();
        this.setupWindowResizing();
        this.setupTerminal();
        this.setupLogin();
    }




    setupTerminal() {
        const input = document.getElementById('terminal-input');
        const output = document.getElementById('terminal-output');
        const content = document.getElementById('terminal-content');
        if (!input || !output) return;

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = input.value.trim();
                input.value = '';

                // Echo command
                const echoLine = document.createElement('p');
                echoLine.className = 'mb-2';
                echoLine.innerHTML = `<span class="text-green-400 font-bold">sebastian@ubuntu</span>:<span class="text-blue-400 font-bold">~</span>$ <span class="cmd-text"></span>`;
                echoLine.querySelector('.cmd-text').textContent = command;
                output.appendChild(echoLine);

                // Process command
                if (command) {
                    this.processCommand(command, output);
                }

                // Scroll to bottom
                setTimeout(() => {
                    content.scrollTop = content.scrollHeight;
                }, 10);
            }
        });
    }

    processCommand(cmd, output) {
        const args = cmd.split(' ').filter(Boolean);
        const command = args[0].toLowerCase();

        const responseLine = document.createElement('div');
        responseLine.className = 'text-gray-100 mb-4';

        switch (command) {
            case 'help':
                responseLine.innerHTML = `
                    <p>Comandos disponibles:</p>
                    <ul class="ml-4 mt-2 space-y-1">
                        <li><span class="text-yellow-400">help</span>    - Muestra este mensaje</li>
                        <li><span class="text-yellow-400">whoami</span>  - Muestra el usuario actual</li>
                        <li><span class="text-yellow-400">clear</span>   - Limpia la terminal</li>
                        <li><span class="text-yellow-400">ls</span>      - Lista los archivos en el directorio actual</li>
                        <li><span class="text-yellow-400">neofetch</span>- Muestra información del sistema</li>
                        <li><span class="text-yellow-400">cat</span>     - Lee un archivo (ej: cat description.txt)</li>
                        <li><span class="text-yellow-400">open</span>    - Abre una aplicación (ej: open projects)</li>
                    </ul>
                `;
                break;
            case 'whoami':
                responseLine.textContent = 'Sebastian Duran Caballero';
                break;
            case 'clear':
                output.innerHTML = '';
                return;
            case 'ls':
                responseLine.innerHTML = `
                    <div class="flex space-x-4">
                        <span class="text-blue-400 font-bold">projects/</span>
                        <span class="text-blue-400 font-bold">skills/</span>
                        <span class="text-blue-400 font-bold">contact/</span>
                        <span class="text-gray-200">description.txt</span>
                    </div>
                `;
                break;
            case 'neofetch':
                responseLine.innerHTML = `
                    <div class="flex flex-col md:flex-row text-gray-100">
                        <div class="mr-6 mb-4 md:mb-0 text-[#e95420] text-xs sm:text-sm font-bold">
<pre>
       _,-/\`--,-/\-,
     ,' /   ,-'   ) \
   ,'  |  ,'     /   \
  /    | /      /     \
 /      /      /      |
|      /      /       |
|      |     /        |
|      |    /         |
 \     |   /         /
  \    |  /         /
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
            case 'cat':
                if (args[1] === 'description.txt') {
                    responseLine.textContent = 'Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.';
                } else if (args[1]) {
                    responseLine.textContent = `cat: ${args[1]}: No existe el archivo o directorio`;
                } else {
                    responseLine.textContent = 'cat: falta un operando de archivo';
                }
                break;
            case 'open':
                if (args[1]) {
                    const validApps = ['projects', 'skills', 'contact', 'terminal'];
                    const app = args[1].toLowerCase();
                    if (validApps.includes(app)) {
                        this.openWindow(app);
                        responseLine.textContent = `Abriendo ${app}...`;
                    } else {
                        responseLine.textContent = `Aplicación no encontrada: ${args[1]}`;
                    }
                } else {
                    responseLine.textContent = 'open: falta el nombre de la aplicación';
                }
                break;
            default:
                responseLine.innerHTML = `Comando no encontrado: <span class="cmd-text"></span>`;
                responseLine.querySelector('.cmd-text').textContent = command;
                break;
        }

        output.appendChild(responseLine);
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


    setupWindowResizing() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer;
            let originalWidth, originalHeight, originalX, originalY, originalMouseX, originalMouseY;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    if (win.classList.contains('maximized')) return;
                    e.preventDefault();
                    isResizing = true;
                    currentResizer = resizer;

                    const rect = win.getBoundingClientRect();
                    originalWidth = rect.width;
                    originalHeight = rect.height;

                    const transformStr = win.style.transform;
                    let tx = 0, ty = 0;
                    if (transformStr && transformStr !== 'none') {
                        const match = transformStr.match(/translate3d\(([-\d.]+)px, ([-\d.]+)px/);
                        if (match) {
                            tx = parseFloat(match[1]);
                            ty = parseFloat(match[2]);
                        }
                    }
                    originalX = tx;
                    originalY = ty;

                    originalMouseX = e.pageX;
                    originalMouseY = e.pageY;

                    window.addEventListener('mousemove', resize);
                    window.addEventListener('mouseup', stopResize);
                });
            });

            function resize(e) {
                if (!isResizing) return;
                let newWidth = originalWidth;
                let newHeight = originalHeight;

                if (currentResizer.classList.contains('resizer-r') || currentResizer.classList.contains('resizer-br')) {
                    newWidth = originalWidth + (e.pageX - originalMouseX);
                }
                if (currentResizer.classList.contains('resizer-b') || currentResizer.classList.contains('resizer-br')) {
                    newHeight = originalHeight + (e.pageY - originalMouseY);
                }

                // Minimum dimensions
                if (newWidth > 300) win.style.width = newWidth + 'px';
                if (newHeight > 200) win.style.height = newHeight + 'px';
            }

            function stopResize() {
                isResizing = false;
                window.removeEventListener('mousemove', resize);
                window.removeEventListener('mouseup', stopResize);
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
            let snapPreview = null;

            header.addEventListener('mousedown', dragStart);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);

            function dragStart(e) {
                if(e.target.closest('button')) return;

                // Handle restoring from maximized
                if(win.classList.contains('maximized')) {
                    win.classList.remove('maximized');
                    win.style.transform = 'none'; // Temporarily unset transform for getBoundingClientRect

                    const rect = win.getBoundingClientRect();
                    // Restore to previous dimensions if we stored them, or just default size
                    win.style.width = win.dataset.prevWidth || '800px';
                    win.style.height = win.dataset.prevHeight || '500px';

                    // Re-calculate transform so mouse stays at same relative position on header
                    const mousePercentX = e.clientX / rect.width;

                    const newWidth = parseFloat(win.style.width);

                    let startX = e.clientX - (newWidth * mousePercentX);
                    let startY = e.clientY - (e.clientY - rect.top);

                    // Don't let it restore offscreen
                    if (startX < 0) startX = 0;
                    if (startY < 28) startY = 28;

                    xOffset = startX;
                    yOffset = startY;
                    setTranslate(startX, startY, win);
                } else {
                    const transform = win.style.transform;
                    if (transform && transform !== 'none') {
                        const match = transform.match(/translate3d\(([-\d.]+)px, ([-\d.]+)px/);
                        if (match) {
                            xOffset = parseFloat(match[1]);
                            yOffset = parseFloat(match[2]);
                        }
                    } else {
                        const rect = win.getBoundingClientRect();
                        // Instead of relative, let's use absolute to left/top and convert to transform
                        xOffset = rect.left;
                        yOffset = rect.top;
                        win.style.left = '0';
                        win.style.top = '0';
                        setTranslate(xOffset, yOffset, win);
                    }
                }

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

                    // Aero snap preview
                    if (e.clientY <= 28) {
                        if (!snapPreview) {
                            snapPreview = document.createElement('div');
                            snapPreview.className = 'maximized-snap-preview absolute inset-0 bg-white/20 z-40 border-2 border-white/40 backdrop-blur-sm transition-all duration-200';
                            snapPreview.style.top = '28px';
                            snapPreview.style.height = 'calc(100vh - 28px)';
                            document.getElementById('desktop').appendChild(snapPreview);
                        }
                    } else {
                        if (snapPreview) {
                            snapPreview.remove();
                            snapPreview = null;
                        }
                    }

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

                if (snapPreview) {
                    snapPreview.remove();
                    snapPreview = null;

                    // Actually maximize
                    const windowId = win.dataset.id;
                    const event = new CustomEvent('maximizeWindow', { detail: { id: windowId } });
                    document.dispatchEvent(event);
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
                // Save current transform and dimensions before maximizing
                win.dataset.prevTransform = win.style.transform;
                win.dataset.prevWidth = win.style.width || getComputedStyle(win).width;
                win.dataset.prevHeight = win.style.height || getComputedStyle(win).height;
                win.classList.add('maximized');
                win.style.transform = 'none';
                win.style.left = '0';
                win.style.top = '28px';
            } else {
                win.classList.remove('maximized');
                // Restore transform and dimensions
                if (win.dataset.prevTransform) {
                    win.style.transform = win.dataset.prevTransform;
                }
                if (win.dataset.prevWidth) win.style.width = win.dataset.prevWidth;
                if (win.dataset.prevHeight) win.style.height = win.dataset.prevHeight;
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