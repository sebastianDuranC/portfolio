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

    setupTerminal() {
        const input = document.getElementById('terminal-input');
        const output = document.getElementById('terminal-output');

        if(!input || !output) return;

        const escapeHTML = (str) => {
            if (!str) return '';
            return str.replace(/[&<>'"]/g,
                tag => ({
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    "'": '&#39;',
                    '"': '&quot;'
                }[tag])
            );
        };

        const executeCommand = (cmd) => {
            const command = cmd.trim().toLowerCase();
            const args = command.split(' ');
            const baseCmd = args[0];
            const safeBaseCmd = escapeHTML(baseCmd);
            const safeArg1 = escapeHTML(args[1] || '');

            let response = '';

            switch(baseCmd) {
                case 'help':
                    response = 'Available commands:<br> - whoami<br> - neofetch<br> - cat [file]<br> - ls<br> - open [app]<br> - clear';
                    break;
                case 'whoami':
                    response = 'Sebastian Duran Caballero';
                    break;
                case 'ls':
                    response = 'description.txt  projects/  skills/  contact/';
                    break;
                case 'cat':
                    if (args[1] === 'description.txt') {
                        response = 'Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.';
                    } else if (args[1]) {
                        response = `cat: ${safeArg1}: No such file or directory`;
                    } else {
                        response = 'Usage: cat [file]';
                    }
                    break;
                case 'open':
                    if (args[1] === 'projects' || args[1] === 'skills' || args[1] === 'contact') {
                        this.openWindow(args[1]);
                        response = `Opening ${args[1]}...`;
                    } else if (args[1]) {
                        response = `App not found: ${safeArg1}. Available: projects, skills, contact`;
                    } else {
                        response = 'Usage: open [app]';
                    }
                    break;
                case 'clear':
                    output.innerHTML = '';
                    return;
                case 'neofetch':
                    response = `
<div class="flex flex-col md:flex-row text-gray-100 mb-4">
    <div class="mr-6 mb-4 md:mb-0 text-[#e95420] text-xs sm:text-sm font-bold">
<pre>
       _,-/\`--,-/\-,
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
                case '':
                    break;
                default:
                    response = `bash: ${safeBaseCmd}: command not found`;
            }

            // Create command echo element
            const echoDiv = document.createElement('div');
            echoDiv.className = 'mb-2';

            // Safe encoding using textContent for command echo
            const echoPrompt = document.createElement('span');
            echoPrompt.innerHTML = '<span class="text-green-400 font-bold">sebastian@ubuntu</span>:<span class="text-blue-400 font-bold">~</span>$ ';

            const echoCmdText = document.createElement('span');
            echoCmdText.textContent = cmd; // Prevent XSS

            echoDiv.appendChild(echoPrompt);
            echoDiv.appendChild(echoCmdText);
            output.appendChild(echoDiv);

            if (response) {
                const responseDiv = document.createElement('div');
                responseDiv.className = 'text-gray-100 mb-4 whitespace-pre-wrap font-ubuntu-mono';
                // Render as HTML for things like neofetch which have internal DOM elements
                responseDiv.innerHTML = response;
                output.appendChild(responseDiv);
            }

            // Scroll to bottom
            const winContent = input.closest('.window-content');
            if (winContent) {
                winContent.scrollTop = winContent.scrollHeight;
            }
        };

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = input.value;
                input.value = '';
                executeCommand(cmd);
            }
        });

        // Initial setup for terminal
        executeCommand('whoami');
        executeCommand('cat description.txt');
        executeCommand('neofetch');

        // Ensure clicking anywhere in terminal content focuses input
        const terminalContent = document.querySelector('#window-terminal .window-content');
        if(terminalContent) {
            terminalContent.addEventListener('click', () => {
                input.focus();
            });
        }
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
            let isMaximized = false;

            // Store aero snap preview element
            let snapPreview = document.createElement('div');
            snapPreview.className = 'maximized-snap-preview hidden';
            document.body.appendChild(snapPreview);

            header.addEventListener('mousedown', dragStart);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);

            // Access to class context
            const self = this;

            function dragStart(e) {
                if(e.target.closest('button')) return;

                isMaximized = win.classList.contains('maximized');

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;
                    self.bringToFront(win);

                    if(isMaximized) {
                        // Calculate offset based on click position relative to window width
                        const clickRatio = e.clientX / window.innerWidth;

                        // Temporarily remove transform and maximized class to get actual unmaximized dimensions
                        win.classList.remove('maximized');

                        const rect = win.getBoundingClientRect();

                        // Position window so the mouse is still over the header at the same relative ratio
                        xOffset = e.clientX - (rect.width * clickRatio);
                        yOffset = e.clientY - 15; // approximate middle of header height

                        // Apply immediate translation so it doesn't jump
                        setTranslate(xOffset, yOffset, win);

                        initialX = e.clientX - xOffset;
                        initialY = e.clientY - yOffset;
                    } else {
                        // Extract current translation from inline style or computed style
                        const style = window.getComputedStyle(win);
                        const matrix = new DOMMatrixReadOnly(style.transform !== 'none' ? style.transform : undefined);
                        xOffset = matrix.m41;
                        yOffset = matrix.m42;

                        initialX = e.clientX - xOffset;
                        initialY = e.clientY - yOffset;
                    }
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

                    // Aero snap detection (top edge)
                    if(e.clientY < 5) {
                        snapPreview.classList.remove('hidden');
                    } else {
                        snapPreview.classList.add('hidden');
                    }
                }
            }

            function setTranslate(xPos, yPos, el) {
                el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
            }

            function dragEnd(e) {
                if (!isDragging) return;

                initialX = currentX;
                initialY = currentY;
                isDragging = false;

                // Aero snap apply
                if(e.clientY < 5) {
                    snapPreview.classList.add('hidden');
                    // Reset position before maximizing
                    setTranslate(0, 0, win);
                    xOffset = 0;
                    yOffset = 0;
                    if(!win.classList.contains('maximized')) {
                        self.maximizeWindow(win.dataset.id);
                    }
                }
            }
        });
    }

    setupWindowResizing() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer;
            let startX, startY, startWidth, startHeight;
            let startXOffset, startYOffset;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    isResizing = true;
                    currentResizer = resizer;
                    startX = e.clientX;
                    startY = e.clientY;

                    const rect = win.getBoundingClientRect();
                    startWidth = rect.width;
                    startHeight = rect.height;

                    const style = window.getComputedStyle(win);
                    const matrix = new DOMMatrixReadOnly(style.transform !== 'none' ? style.transform : undefined);
                    startXOffset = matrix.m41;
                    startYOffset = matrix.m42;

                    e.preventDefault(); // Prevent text selection
                });
            });

            document.addEventListener('mousemove', (e) => {
                if (!isResizing) return;
                if (win.classList.contains('maximized')) return;

                const dx = e.clientX - startX;
                const dy = e.clientY - startY;

                if (currentResizer.classList.contains('resizer-r')) {
                    win.style.width = `${startWidth + dx}px`;
                } else if (currentResizer.classList.contains('resizer-b')) {
                    win.style.height = `${startHeight + dy}px`;
                } else if (currentResizer.classList.contains('resizer-br')) {
                    win.style.width = `${startWidth + dx}px`;
                    win.style.height = `${startHeight + dy}px`;
                }
            });

            document.addEventListener('mouseup', () => {
                isResizing = false;
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
                // Save current state before maximizing
                win.dataset.prevTransform = win.style.transform;
                win.dataset.prevWidth = win.style.width;
                win.dataset.prevHeight = win.style.height;

                win.classList.add('maximized');
                win.style.transform = 'none';
                win.style.width = '100%';
                win.style.height = 'calc(100vh - 28px - 56px)';
            } else {
                win.classList.remove('maximized');
                // Restore transform and size
                if (win.dataset.prevTransform) {
                    win.style.transform = win.dataset.prevTransform;
                }
                if (win.dataset.prevWidth) {
                    win.style.width = win.dataset.prevWidth;
                } else {
                    win.style.width = ''; // revert to class default
                }
                if (win.dataset.prevHeight) {
                    win.style.height = win.dataset.prevHeight;
                } else {
                    win.style.height = ''; // revert to class default
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