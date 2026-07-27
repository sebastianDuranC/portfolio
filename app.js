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
        this.setupWindowResizing();
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
            let isMaximizedBeforeDrag = false;

            // Load saved offsets if any (e.g. from a previous session, though here they start at 0)
            const transform = win.style.transform;
            if (transform && transform !== 'none') {
                const matrix = transform.match(/translate3d\(([^px]+)px,\s*([^px]+)px/);
                if(matrix) {
                    xOffset = parseFloat(matrix[1]);
                    yOffset = parseFloat(matrix[2]);
                }
            }

            const dragStart = (e) => {
                if (e.target.closest('button') || e.target.closest('.resizer')) return;

                if (win.classList.contains('maximized')) {
                    isMaximizedBeforeDrag = true;
                    win.classList.remove('maximized');

                    // Temporarily remove transform to get accurate base coordinates
                    const savedTransform = win.style.transform;
                    win.style.transform = 'none';
                    const rect = win.getBoundingClientRect();
                    win.style.transform = savedTransform;

                    // Calculate where the mouse is relative to the window width to keep it under cursor
                    let mouseXRatio = e.clientX / window.innerWidth;

                    // Reset offsets for unmaximized window, placing it under the cursor
                    xOffset = e.clientX - (rect.left + (rect.width * mouseXRatio));
                    yOffset = e.clientY - rect.top;
                } else {
                    isMaximizedBeforeDrag = false;
                }

                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;
                }
            };

            const drag = (e) => {
                if (isDragging) {
                    e.preventDefault();

                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;

                    xOffset = currentX;
                    yOffset = currentY;

                    setTranslate(currentX, currentY, win);

                    // Aero snap preview
                    if (e.clientY <= 28) {
                        snapPreview.classList.remove('hidden');
                        snapPreview.classList.add('show');
                    } else {
                        snapPreview.classList.remove('show');
                        snapPreview.classList.add('hidden');
                    }
                }
            };

            const setTranslate = (xPos, yPos, el) => {
                el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
                el.dataset.prevTransform = el.style.transform; // Save it for maximize restore
            };

            const dragEnd = (e) => {
                if (!isDragging) return;

                initialX = currentX;
                initialY = currentY;
                isDragging = false;

                // Snap maximize on release
                if (e.clientY <= 28) {
                    snapPreview.classList.remove('show');
                    snapPreview.classList.add('hidden');
                    this.maximizeWindow(win.dataset.id);
                }
            };

            header.addEventListener('mousedown', dragStart);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);
        });
    }

    setupWindowResizing() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer = null;
            let startX, startY, startWidth, startHeight;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    if (win.classList.contains('maximized')) return;
                    e.preventDefault();
                    isResizing = true;
                    currentResizer = resizer;
                    startX = e.clientX;
                    startY = e.clientY;

                    // Temporarily remove transform to get raw dimensions (though inline styles might be easier if set)
                    startWidth = parseFloat(getComputedStyle(win).width);
                    startHeight = parseFloat(getComputedStyle(win).height);

                    this.bringToFront(win);
                });
            });

            document.addEventListener('mousemove', (e) => {
                if (!isResizing) return;
                e.preventDefault();

                if (currentResizer.classList.contains('resizer-r') || currentResizer.classList.contains('resizer-br')) {
                    const newWidth = startWidth + (e.clientX - startX);
                    win.style.width = `${Math.max(300, newWidth)}px`;
                }

                if (currentResizer.classList.contains('resizer-b') || currentResizer.classList.contains('resizer-br')) {
                    const newHeight = startHeight + (e.clientY - startY);
                    win.style.height = `${Math.max(200, newHeight)}px`;
                }
            });

            document.addEventListener('mouseup', () => {
                isResizing = false;
                currentResizer = null;
            });
        });
    }

    setupTerminal() {
        const terminalInput = document.getElementById('terminal-input');
        const terminalOutput = document.getElementById('terminal-output');
        const terminalContent = document.getElementById('terminal-content');

        if (!terminalInput || !terminalOutput) return;

        // Print initial text
        this.printToTerminal(terminalOutput, 'whoami', 'Sebastian Duran Caballero');
        this.printToTerminal(terminalOutput, 'cat description.txt', 'Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.');
        this.printToTerminal(terminalOutput, 'neofetch', `
<div class="flex flex-col md:flex-row text-gray-100 mb-4">
    <div class="mr-6 mb-4 md:mb-0 text-[#e95420] text-xs sm:text-sm font-bold">
<pre>
       _,-/&#x60;--,-/\\-,
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
        `, true);

        // Keep focus on input when clicking terminal
        document.getElementById('window-terminal').addEventListener('click', () => {
            terminalInput.focus();
        });

        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = terminalInput.value.trim();
                terminalInput.value = '';

                if (command === '') {
                    this.printToTerminal(terminalOutput, command, '');
                    terminalContent.scrollTop = terminalContent.scrollHeight;
                    return;
                }

                this.processCommand(command, terminalOutput);
                terminalContent.scrollTop = terminalContent.scrollHeight;
            }
        });
    }

    printToTerminal(outputEl, command, response, isHTML = false) {
        const cmdWrapper = document.createElement('div');
        cmdWrapper.className = 'mb-2';

        const prompt = document.createElement('p');
        prompt.className = 'mb-1';
        prompt.innerHTML = `<span class="text-green-400 font-bold">sebastian@ubuntu</span>:<span class="text-blue-400 font-bold">~</span>$ ${this.escapeHTML(command)}`;
        cmdWrapper.appendChild(prompt);

        if (response) {
            const resp = document.createElement('div');
            resp.className = 'text-gray-100 mb-4';
            if (isHTML) {
                resp.innerHTML = response;
            } else {
                resp.textContent = response;
            }
            cmdWrapper.appendChild(resp);
        }

        outputEl.appendChild(cmdWrapper);
    }

    escapeHTML(str) {
        return str.replace(/[&<>'"]/g,
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }

    processCommand(command, outputEl) {
        const args = command.split(' ');
        const cmd = args[0].toLowerCase();

        switch (cmd) {
            case 'help':
                this.printToTerminal(outputEl, command, 'Comandos disponibles: help, whoami, clear, ls, neofetch, cat, open <app>');
                break;
            case 'whoami':
                this.printToTerminal(outputEl, command, 'Sebastian Duran Caballero');
                break;
            case 'clear':
                outputEl.innerHTML = '';
                break;
            case 'ls':
                this.printToTerminal(outputEl, command, 'description.txt  projects/  skills/  contact/');
                break;
            case 'cat':
                if (args[1] === 'description.txt') {
                    this.printToTerminal(outputEl, command, 'Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.');
                } else {
                    this.printToTerminal(outputEl, command, `cat: ${args[1] || ''}: No such file or directory`);
                }
                break;
            case 'neofetch':
                this.printToTerminal(outputEl, command, `
<div class="flex flex-col md:flex-row text-gray-100 mb-4">
    <div class="mr-6 mb-4 md:mb-0 text-[#e95420] text-xs sm:text-sm font-bold">
<pre>
       _,-/&#x60;--,-/\\-,
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
                `, true);
                break;
            case 'open':
                if (args[1]) {
                    const validApps = ['projects', 'skills', 'contact', 'terminal'];
                    if (validApps.includes(args[1].toLowerCase())) {
                        this.printToTerminal(outputEl, command, `Abriendo ${args[1]}...`);
                        this.openWindow(args[1].toLowerCase());
                    } else {
                        this.printToTerminal(outputEl, command, `open: ${args[1]}: Aplicación no encontrada`);
                    }
                } else {
                    this.printToTerminal(outputEl, command, 'open: falta el argumento de aplicación');
                }
                break;
            default:
                this.printToTerminal(outputEl, command, `${cmd}: orden no encontrada`);
        }
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