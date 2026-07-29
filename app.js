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
                // Simulate running neofetch immediately
                this.runTerminalCommand('neofetch');
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
            let startMouseX;
            let startMouseY;
            let initialTransformX = 0;
            let initialTransformY = 0;
            let isRestoringFromMaximized = false;
            let snapPreview = document.getElementById('snap-preview');

            header.addEventListener('mousedown', dragStart.bind(this));
            document.addEventListener('mousemove', drag.bind(this));
            document.addEventListener('mouseup', dragEnd.bind(this));

            function dragStart(e) {
                // Don't drag if maximizing/closing buttons are clicked
                if(e.target.closest('button')) return;

                isDragging = true;
                this.bringToFront(win);

                startMouseX = e.clientX;
                startMouseY = e.clientY;

                if (win.classList.contains('maximized')) {
                    isRestoringFromMaximized = true;
                } else {
                    const transform = win.style.transform;
                    if (transform && transform !== 'none') {
                        const match = transform.match(/translate3d\(([-0-9.]+)px,\s*([-0-9.]+)px/);
                        if (match) {
                            initialTransformX = parseFloat(match[1]);
                            initialTransformY = parseFloat(match[2]);
                        }
                    } else {
                        initialTransformX = 0;
                        initialTransformY = 0;
                    }
                }
            }

            function drag(e) {
                if (!isDragging) return;
                e.preventDefault();

                if (isRestoringFromMaximized) {
                    // Restore original size before calculating offset
                    win.classList.remove('maximized');
                    win.style.transform = 'none'; // Temporarily clear to get accurate base rect

                    const rect = win.getBoundingClientRect();
                    const windowWidth = win.offsetWidth;

                    // Keep mouse roughly at the same horizontal proportion of the header
                    let newLeft = e.clientX - (windowWidth / 2);

                    // Adjust if it goes off screen
                    if (newLeft < 0) newLeft = 0;
                    if (newLeft + windowWidth > window.innerWidth) newLeft = window.innerWidth - windowWidth;

                    // Calculate translation from base position (which is top: xx, left: xx from CSS)
                    const baseLeft = parseFloat(getComputedStyle(win).left);
                    const baseTop = parseFloat(getComputedStyle(win).top);

                    initialTransformX = newLeft - baseLeft;
                    initialTransformY = e.clientY - baseTop - 10; // 10px offset for grab point

                    startMouseX = e.clientX;
                    startMouseY = e.clientY;

                    isRestoringFromMaximized = false;
                    win.dataset.prevTransform = '';
                }

                const dx = e.clientX - startMouseX;
                const dy = e.clientY - startMouseY;

                const newX = initialTransformX + dx;
                const newY = initialTransformY + dy;

                win.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;

                // Aero snap check
                if (e.clientY <= 28) {
                    snapPreview.classList.remove('hidden');
                } else {
                    snapPreview.classList.add('hidden');
                }
            }

            function dragEnd(e) {
                if (!isDragging) return;
                isDragging = false;

                if (e.clientY <= 28 && !win.classList.contains('maximized')) {
                    snapPreview.classList.add('hidden');
                    this.maximizeWindow(win.dataset.id);
                }
            }
        });
    }

    setupWindowResizing() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer;
            let startMouseX, startMouseY;
            let startWidth, startHeight;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    if (win.classList.contains('maximized')) return;

                    isResizing = true;
                    currentResizer = resizer;
                    this.bringToFront(win);

                    startMouseX = e.clientX;
                    startMouseY = e.clientY;
                    startWidth = win.offsetWidth;
                    startHeight = win.offsetHeight;

                    // Disable transitions during resize
                    win.style.transition = 'none';

                    document.addEventListener('mousemove', resize);
                    document.addEventListener('mouseup', stopResize);
                });
            });

            const resize = (e) => {
                if (!isResizing) return;

                if (currentResizer.classList.contains('resizer-r') || currentResizer.classList.contains('resizer-br')) {
                    const newWidth = startWidth + (e.clientX - startMouseX);
                    win.style.width = `${newWidth}px`;
                }

                if (currentResizer.classList.contains('resizer-b') || currentResizer.classList.contains('resizer-br')) {
                    const newHeight = startHeight + (e.clientY - startMouseY);
                    win.style.height = `${newHeight}px`;
                }
            };

            const stopResize = () => {
                isResizing = false;
                // Re-enable transition
                win.style.transition = '';
                document.removeEventListener('mousemove', resize);
                document.removeEventListener('mouseup', stopResize);
            };
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

                if (id === 'terminal') {
                    const input = document.getElementById('terminal-input');
                    if (input) setTimeout(() => input.focus(), 100);
                }
            } else {
                this.bringToFront(win);
                if (id === 'terminal') {
                    const input = document.getElementById('terminal-input');
                    if (input) input.focus();
                }
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

    // Terminal Logic
    setupTerminal() {
        const terminalInput = document.getElementById('terminal-input');
        if (!terminalInput) return;

        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = terminalInput.value.trim();
                terminalInput.value = '';
                this.runTerminalCommand(command);
            }
        });
    }

    runTerminalCommand(command) {
        const outputDiv = document.getElementById('terminal-output');
        const terminalContent = document.getElementById('terminal-content');
        if (!outputDiv) return;

        // Echo command
        const cmdEcho = document.createElement('p');
        cmdEcho.className = 'mb-2';
        cmdEcho.innerHTML = `<span class="text-green-400 font-bold">sebastian@ubuntu</span>:<span class="text-blue-400 font-bold">~</span>$ ${this.escapeHTML(command)}`;
        outputDiv.appendChild(cmdEcho);

        if (command === '') {
            this.scrollToBottom(terminalContent);
            return;
        }

        const args = command.split(' ');
        const cmd = args[0].toLowerCase();

        let response = '';

        switch (cmd) {
            case 'help':
                response = `Available commands:
  help      - Show this message
  whoami    - Print current user
  clear     - Clear terminal output
  ls        - List directory contents
  cat       - Concatenate and print files
  neofetch  - System information
  open      - Open an application (e.g., open projects)`;
                break;
            case 'whoami':
                response = 'Sebastian Duran Caballero';
                break;
            case 'clear':
                outputDiv.innerHTML = '';
                return;
            case 'ls':
                response = 'description.txt  projects/  skills/  contact/';
                break;
            case 'cat':
                if (args[1] === 'description.txt') {
                    response = 'Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.';
                } else if (args[1]) {
                    response = `cat: ${this.escapeHTML(args[1])}: No such file or directory`;
                } else {
                    response = 'cat: missing file operand';
                }
                break;
            case 'neofetch':
                response = `<div class="flex flex-col md:flex-row text-gray-100 mb-4">
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
   &#96;.  | /        ,'
     &#96;./'      ,-'
       &#96;-----'
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
            case 'open':
                if (args[1]) {
                    const appName = args[1].toLowerCase();
                    if (['projects', 'skills', 'contact'].includes(appName)) {
                        this.openWindow(appName);
                        response = `Opening ${appName}...`;
                    } else {
                        response = `Application '${this.escapeHTML(appName)}' not found.`;
                    }
                } else {
                    response = 'open: missing application name';
                }
                break;
            default:
                response = `${this.escapeHTML(cmd)}: command not found`;
        }

        if (response) {
            const respNode = document.createElement('div');
            respNode.className = 'text-gray-100 mb-4 whitespace-pre-wrap font-ubuntu-mono';

            // Only use innerHTML for neofetch which is pre-defined safe HTML, otherwise textContent to prevent XSS
            if (cmd === 'neofetch') {
                 respNode.innerHTML = response;
            } else {
                 respNode.textContent = response;
            }
            outputDiv.appendChild(respNode);
        }

        this.scrollToBottom(terminalContent);
    }

    escapeHTML(str) {
        return str.replace(/[&<>'"]/g,
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag])
        );
    }

    scrollToBottom(element) {
        if (element) {
            setTimeout(() => {
                element.scrollTop = element.scrollHeight;
            }, 10);
        }
    }
}

// Initialize the OS
const app = new LinuxOS();
