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
        this.setupResizing();
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

            // Allow storing original pos when restoring from max
            let restoreDragging = false;

            const dragStart = (e) => {
                if(e.target.closest('button')) return;

                if (win.classList.contains('maximized')) {
                    // Start dragging to restore window
                    restoreDragging = true;
                    return;
                }

                const rect = win.getBoundingClientRect();
                const transformMatrix = window.getComputedStyle(win).getPropertyValue('transform');

                if (transformMatrix !== 'none') {
                    const matrixValues = transformMatrix.split('(')[1].split(')')[0].split(',');
                    xOffset = parseFloat(matrixValues[4]);
                    yOffset = parseFloat(matrixValues[5]);
                } else {
                    xOffset = 0;
                    yOffset = 0;
                }

                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;
                }
            };

            const drag = (e) => {
                if (restoreDragging) {
                     // Restore window
                     win.classList.remove('maximized');
                     restoreDragging = false;
                     isDragging = true;

                     win.style.transform = 'none';
                     let w = parseFloat(win.style.width) || win.offsetWidth;

                     // Center window on mouse x if possible
                     let newX = e.clientX - w / 2;
                     if (newX < 0) newX = 0;
                     let newY = e.clientY;

                     // Calculate relative offset based on rect top left to simulate translation from top left (0,0) of absolute positioning
                     // The window original pos is determined by absolute top/left classes in index.html. We can just set transform.
                     const rect = win.getBoundingClientRect();
                     // Actually, if we use translate, it's relative to its initial position.
                     // A simple way is to calculate difference from default origin.
                     // The element has absolute pos top-10 left-[10%] etc.
                     // Instead of fighting it, we temporarily set transform to 'none', get its native rect, and translate from there.

                     win.style.transform = 'none';
                     const nativeRect = win.getBoundingClientRect();

                     xOffset = e.clientX - nativeRect.left - (w/2);
                     yOffset = e.clientY - nativeRect.top - 10; // offset slightly

                     initialX = e.clientX - xOffset;
                     initialY = e.clientY - yOffset;
                }

                if (isDragging) {
                    e.preventDefault();

                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;

                    xOffset = currentX;
                    yOffset = currentY;

                    setTranslate(currentX, currentY, win);

                    // Aero snap
                    if (e.clientY < 30) {
                        snapPreview.classList.remove('hidden');
                    } else {
                        snapPreview.classList.add('hidden');
                    }
                }
            };

            const setTranslate = (xPos, yPos, el) => {
                el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
            };

            const dragEnd = (e) => {
                initialX = currentX;
                initialY = currentY;
                isDragging = false;
                restoreDragging = false;

                if (!snapPreview.classList.contains('hidden')) {
                     snapPreview.classList.add('hidden');
                     this.maximizeWindow(win.dataset.id);
                }
            };

            header.addEventListener('mousedown', dragStart);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);
        });
    }

    setupResizing() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer;

            let originalWidth = 0;
            let originalHeight = 0;
            let originalMouseX = 0;
            let originalMouseY = 0;

            const resizeStart = (e) => {
                if (win.classList.contains('maximized')) return;

                e.preventDefault();
                isResizing = true;
                currentResizer = e.target;

                originalWidth = parseFloat(getComputedStyle(win, null).getPropertyValue('width').replace('px', ''));
                originalHeight = parseFloat(getComputedStyle(win, null).getPropertyValue('height').replace('px', ''));
                originalMouseX = e.pageX;
                originalMouseY = e.pageY;

                document.addEventListener('mousemove', resize);
                document.addEventListener('mouseup', resizeEnd);
            };

            const resize = (e) => {
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
            };

            const resizeEnd = (e) => {
                isResizing = false;
                document.removeEventListener('mousemove', resize);
                document.removeEventListener('mouseup', resizeEnd);
            };

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', resizeStart);
            });
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

    setupTerminal() {
        const input = document.getElementById('terminal-input');
        const output = document.getElementById('terminal-output');
        const container = document.getElementById('terminal-container');

        if (!input || !output) return;

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const cmd = input.value.trim();
                input.value = '';

                // Print command
                const cmdLine = document.createElement('div');
                cmdLine.innerHTML = `<span class="text-green-400 font-bold">sebastian@ubuntu</span>:<span class="text-blue-400 font-bold">~</span>$ <span></span>`;
                cmdLine.querySelector('span:last-child').textContent = cmd;
                cmdLine.className = "mb-2";
                output.appendChild(cmdLine);

                if (cmd) {
                    this.executeCommand(cmd, output);
                }

                container.scrollTop = container.scrollHeight;
            }
        });
    }

    executeCommand(cmd, output) {
        const args = cmd.split(' ').filter(Boolean);
        const command = args[0].toLowerCase();

        const responseLine = document.createElement('div');
        responseLine.className = "text-gray-100 mb-4";

        switch (command) {
            case 'help':
                responseLine.innerHTML = `
                    Comandos disponibles:<br>
                    <span class="text-[#e95420] font-bold">whoami</span> - Muestra el usuario actual<br>
                    <span class="text-[#e95420] font-bold">cat description.txt</span> - Muestra información sobre mi<br>
                    <span class="text-[#e95420] font-bold">neofetch</span> - Muestra información del sistema<br>
                    <span class="text-[#e95420] font-bold">ls</span> - Lista los archivos en el directorio actual<br>
                    <span class="text-[#e95420] font-bold">open [app]</span> - Abre una aplicación (projects, skills, contact)<br>
                    <span class="text-[#e95420] font-bold">clear</span> - Limpia la terminal
                `;
                break;
            case 'whoami':
                responseLine.textContent = "Sebastian Duran Caballero";
                break;
            case 'cat':
                if (args[1] === 'description.txt') {
                    responseLine.textContent = "Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.";
                } else {
                    responseLine.textContent = `cat: ${args.slice(1).join(' ')}: No such file or directory`;
                }
                break;
            case 'ls':
                responseLine.innerHTML = `<span class="text-blue-400 font-bold">projects/</span>  <span class="text-blue-400 font-bold">skills/</span>  <span class="text-blue-400 font-bold">contact/</span>  description.txt`;
                break;
            case 'clear':
                output.innerHTML = '';
                return;
            case 'open':
                const appToOpen = args[1];
                if (['projects', 'skills', 'contact'].includes(appToOpen)) {
                    this.openWindow(appToOpen);
                    responseLine.textContent = `Opening ${appToOpen}...`;
                } else {
                    responseLine.textContent = `App '${appToOpen}' not found. Try projects, skills, or contact.`;
                }
                break;
            case 'neofetch':
                responseLine.innerHTML = `
                    <div class="flex flex-col md:flex-row">
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
                    </div>
                `;
                break;
            default:
                responseLine.textContent = `${command}: command not found`;
        }
        output.appendChild(responseLine);
    }
}

// Initialize the OS
const app = new LinuxOS();
