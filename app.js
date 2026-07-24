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
        this.setupTerminal();
    }


    setupTerminal() {
        const input = document.getElementById('terminal-input');
        if (!input) return;

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = input.value.trim();
                input.value = '';
                this.executeTerminalCommand(command);
            }
        });

        // Execute neofetch on boot
        setTimeout(() => this.executeTerminalCommand('neofetch'), 600);
    }

    executeTerminalCommand(cmd) {
        const history = document.getElementById('terminal-history');
        if (!history) return;

        const cmdDiv = document.createElement('div');
        cmdDiv.className = 'mb-2';
        cmdDiv.innerHTML = `<span class="text-green-400 font-bold">sebastian@ubuntu</span><span class="text-white">:</span><span class="text-blue-400 font-bold">~</span><span class="text-white">$</span> <span class="text-gray-200">${this.escapeHTML(cmd)}</span>`;
        history.appendChild(cmdDiv);

        const outDiv = document.createElement('div');
        outDiv.className = 'text-gray-100 mb-4';

        const args = cmd.split(' ').filter(Boolean);
        const command = args[0]?.toLowerCase();

        switch (command) {
            case 'help':
                outDiv.textContent = 'Available commands: help, whoami, clear, ls, neofetch, cat [file], open [app]';
                break;
            case 'whoami':
                outDiv.textContent = 'Sebastian Duran Caballero';
                break;
            case 'clear':
                history.innerHTML = '';
                return; // don't append outDiv
            case 'ls':
                outDiv.innerHTML = 'description.txt&nbsp;&nbsp;&nbsp;&nbsp;projects/&nbsp;&nbsp;&nbsp;&nbsp;skills/&nbsp;&nbsp;&nbsp;&nbsp;contact/';
                break;
            case 'cat':
                if (args[1] === 'description.txt') {
                    outDiv.textContent = 'Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.';
                } else if (args[1]) {
                    outDiv.textContent = `cat: ${args[1]}: No such file or directory`;
                } else {
                    outDiv.textContent = 'Usage: cat [file]';
                }
                break;
            case 'open':
                if (args[1] && ['projects', 'skills', 'contact', 'terminal'].includes(args[1].toLowerCase())) {
                    this.openWindow(args[1].toLowerCase());
                    outDiv.textContent = `Opening ${args[1]}...`;
                } else {
                    outDiv.textContent = `App not found. Available apps: projects, skills, contact, terminal`;
                }
                break;
            case 'neofetch':
                outDiv.innerHTML = `
                    <div class="flex flex-col md:flex-row">
                        <div class="mr-6 mb-4 md:mb-0 text-[#e95420] text-xs sm:text-sm font-bold whitespace-pre">
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
                return; // Do nothing on empty enter
            default:
                if (command) outDiv.textContent = `${command}: command not found`;
        }

        history.appendChild(outDiv);

        // Scroll to bottom
        const content = document.getElementById('terminal-content');
        if (content) content.scrollTop = content.scrollHeight;
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

            const snapPreview = document.getElementById('snap-preview');

            header.addEventListener('mousedown', dragStart.bind(this));
            document.addEventListener('mousemove', drag.bind(this));
            document.addEventListener('mouseup', dragEnd.bind(this));

            // Resizing logic
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', function(e) {
                    isResizing = true;
                    currentResizer = e.target;
                    initialX = e.clientX;
                    initialY = e.clientY;

                    const rect = win.getBoundingClientRect();
                    win.dataset.startWidth = rect.width;
                    win.dataset.startHeight = rect.height;

                    e.preventDefault(); // prevent selection
                });
            });

            document.addEventListener('mousemove', function(e) {
                if (!isResizing) return;

                const dx = e.clientX - initialX;
                const dy = e.clientY - initialY;

                const startWidth = parseFloat(win.dataset.startWidth);
                const startHeight = parseFloat(win.dataset.startHeight);

                if (currentResizer.classList.contains('resizer-r')) {
                    win.style.width = startWidth + dx + 'px';
                }
                else if (currentResizer.classList.contains('resizer-b')) {
                    win.style.height = startHeight + dy + 'px';
                }
                else if (currentResizer.classList.contains('resizer-br')) {
                    win.style.width = startWidth + dx + 'px';
                    win.style.height = startHeight + dy + 'px';
                }
            });

            document.addEventListener('mouseup', function(e) {
                isResizing = false;
            });


            function dragStart(e) {
                if(e.target.closest('button')) return;

                // Handle unmaximizing by dragging header
                if(win.classList.contains('maximized')) {
                    // Temporarily unset transform to get accurate base offset
                    win.style.transform = 'none';
                    const rect = win.getBoundingClientRect();

                    // Unmaximize
                    win.classList.remove('maximized');

                    // Calculate relative mouse position in header
                    const mouseRatioX = e.clientX / window.innerWidth;

                    // Set new width/height and center it on mouse
                    const newWidth = parseFloat(win.style.width) || 700;

                    xOffset = e.clientX - (newWidth * mouseRatioX);
                    yOffset = e.clientY - 28; // offset for top bar

                    setTranslate(xOffset, yOffset, win);

                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;
                    isDragging = true;
                    return;
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

                    setTranslate(currentX, currentY, win);

                    // Aero snap preview logic
                    if (e.clientY <= 28) {
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
                if(isDragging) {
                    initialX = currentX;
                    initialY = currentY;
                    isDragging = false;

                    // Aero snap execution
                    if (e.clientY <= 28) {
                        snapPreview.classList.add('hidden');
                        win.dataset.prevTransform = win.style.transform;
                        win.classList.add('maximized');
                        win.style.transform = 'none';
                        xOffset = 0; // reset offsets for next un-maximize
                        yOffset = 0;
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