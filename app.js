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
                if(e.target.closest('button')) return;

                if(win.classList.contains('maximized')) {
                    // Handle un-maximizing by dragging top header
                    const winRect = win.getBoundingClientRect();
                    win.classList.remove('maximized');
                    win.style.transform = 'none'; // Temporarily remove transform for accurate rect

                    const newRect = win.getBoundingClientRect();
                    // Keep cursor relatively in same position on header
                    const cursorRatio = e.clientX / winRect.width;

                    xOffset = e.clientX - (newRect.width * cursorRatio);
                    yOffset = e.clientY;

                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;

                    setTranslate(xOffset, yOffset, win);
                } else {
                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;
                }

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;
                }
            }

            let snapPreview = null;

            function drag(e) {
                if (isDragging) {
                    e.preventDefault();

                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;

                    xOffset = currentX;
                    yOffset = currentY;

                    setTranslate(currentX, currentY, win);

                    // Aero Snap preview
                    if (e.clientY <= 5) {
                        if (!snapPreview) {
                            snapPreview = document.createElement('div');
                            snapPreview.className = 'maximized-snap-preview';
                            document.body.appendChild(snapPreview);
                        }
                    } else {
                        if (snapPreview) {
                            snapPreview.remove();
                            snapPreview = null;
                        }
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

                    if (snapPreview) {
                        snapPreview.remove();
                        snapPreview = null;
                        if (e.clientY <= 5) {
                           app.maximizeWindow(win.dataset.id);
                        }
                    }
                }
            }
        });
    }

    setupResizers() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer = null;
            let startX, startY, startWidth, startHeight;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    isResizing = true;
                    currentResizer = resizer;

                    startX = e.clientX;
                    startY = e.clientY;

                    // Must remove transform temporarily to get accurate un-transformed dimensions if we wanted to mix transforms and resizes,
                    // but standard bounding client rect is fine if we just want current visual width/height
                    const rect = win.getBoundingClientRect();
                    startWidth = rect.width;
                    startHeight = rect.height;

                    // Apply active state
                    this.bringToFront(win);

                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                });
            });

            const handleMouseMove = (e) => {
                if (!isResizing) return;

                if (win.classList.contains('maximized')) return; // Don't resize maximized window

                let newWidth = startWidth;
                let newHeight = startHeight;

                if (currentResizer.classList.contains('resizer-r') || currentResizer.classList.contains('resizer-br')) {
                    newWidth = startWidth + (e.clientX - startX);
                }

                if (currentResizer.classList.contains('resizer-b') || currentResizer.classList.contains('resizer-br')) {
                    newHeight = startHeight + (e.clientY - startY);
                }

                // Apply with min constraints (matches CSS classes, but enforcing via JS too)
                if (newWidth > 300) win.style.width = `${newWidth}px`;
                if (newHeight > 200) win.style.height = `${newHeight}px`;
            };

            const handleMouseUp = () => {
                isResizing = false;
                currentResizer = null;
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        });
    }

    openWindow(id) {
        const win = document.getElementById(`window-${id}`);
        // Support bottom dock icons
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

                if(dockIcon) dockIcon.classList.add('active');
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
            if(dockIcon) dockIcon.classList.remove('active');
        }
    }

    setupTerminal() {
        const input = document.getElementById('terminal-input');
        const output = document.getElementById('terminal-output');

        if (!input || !output) return;

        const commands = {
            'help': 'Comandos disponibles: help, whoami, clear, ls, neofetch, cat, open',
            'whoami': 'Sebastian Duran Caballero',
            'ls': 'description.txt  projects/  skills/  contact/',
            'cat description.txt': 'Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.',
            'neofetch': `       _,-/&#96;--,-/\\-,
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
<br>
<span style="color:#e95420; font-weight:bold">OS:</span> Ubuntu 22.04 LTS x86_64<br>
<span style="color:#e95420; font-weight:bold">Host:</span> Desarrollador Web<br>
<span style="color:#e95420; font-weight:bold">Uptime:</span> 24/7 coding<br>
<span style="color:#e95420; font-weight:bold">Packages:</span> HTML, CSS, JS, .NET, C#<br>
<span style="color:#e95420; font-weight:bold">Shell:</span> bash 5.1.16<br>
<span style="color:#e95420; font-weight:bold">Location:</span> Santa Cruz, Bolivia<br>
<span style="color:#e95420; font-weight:bold">Email:</span> sd8587793@email.com`
        };

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const cmd = input.value.trim();
                input.value = '';

                // Echo command
                const cmdLine = document.createElement('div');
                cmdLine.className = 'mb-2';
                cmdLine.innerHTML = `<span class="text-green-400 font-bold">sebastian@ubuntu</span><span class="text-white">:</span><span class="text-blue-400 font-bold">~</span><span class="text-white mr-2">$</span> <span class="text-gray-200">${this.escapeHTML(cmd)}</span>`;
                output.appendChild(cmdLine);

                // Process command
                if (cmd === 'clear') {
                    output.innerHTML = '';
                } else if (cmd.startsWith('open ')) {
                    const appName = cmd.split(' ')[1];
                    if (['projects', 'skills', 'contact'].includes(appName)) {
                        this.openWindow(appName);
                    } else {
                        const errorLine = document.createElement('div');
                        errorLine.className = 'text-gray-100 mb-4';
                        errorLine.textContent = `bash: open: ${appName}: aplicación no encontrada`;
                        output.appendChild(errorLine);
                    }
                } else if (cmd !== '') {
                    const response = commands[cmd] || `bash: ${cmd}: orden no encontrada`;
                    const resLine = document.createElement('div');
                    resLine.className = 'text-gray-100 mb-4 whitespace-pre-wrap';
                    // Special case for neofetch to allow HTML, others escape
                    if (cmd === 'neofetch') {
                        resLine.innerHTML = commands['neofetch'];
                    } else {
                        resLine.textContent = response;
                    }
                    output.appendChild(resLine);
                }

                // Scroll to bottom
                const container = document.getElementById('terminal-container');
                if (container) container.scrollTop = container.scrollHeight;
            }
        });

        // Initial neofetch
        input.value = 'neofetch';
        const enterEvent = new KeyboardEvent('keypress', { key: 'Enter' });
        input.dispatchEvent(enterEvent);
    }

    escapeHTML(str) {
        return str.replace(/[&<>'"]/g, tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag]));
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