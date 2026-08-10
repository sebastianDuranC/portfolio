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
        this.setupResizableWindows();
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

    setupResizableWindows() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer;
            let startX, startY, startWidth, startHeight;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    if (win.classList.contains('maximized')) return;
                    e.preventDefault();
                    isResizing = true;
                    currentResizer = resizer;
                    startX = e.clientX;
                    startY = e.clientY;
                    const rect = win.getBoundingClientRect();
                    startWidth = rect.width;
                    startHeight = rect.height;

                    document.addEventListener('mousemove', resize);
                    document.addEventListener('mouseup', stopResize);

                    // Bring to front on resize
                    this.bringToFront(win);
                });
            });

            const resize = (e) => {
                if (!isResizing) return;

                if (currentResizer.classList.contains('resizer-r') || currentResizer.classList.contains('resizer-br')) {
                    const newWidth = startWidth + (e.clientX - startX);
                    win.style.width = `${newWidth}px`;
                }
                if (currentResizer.classList.contains('resizer-b') || currentResizer.classList.contains('resizer-br')) {
                    const newHeight = startHeight + (e.clientY - startY);
                    win.style.height = `${newHeight}px`;
                }
            };

            const stopResize = () => {
                isResizing = false;
                document.removeEventListener('mousemove', resize);
                document.removeEventListener('mouseup', stopResize);
            };
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

            // Reference to global snap preview element if exists, or create one
            let snapPreview = document.getElementById('snap-preview');
            if (!snapPreview) {
                snapPreview = document.createElement('div');
                snapPreview.id = 'snap-preview';
                snapPreview.className = 'maximized-snap-preview';
                document.body.appendChild(snapPreview);
            }

            header.addEventListener('mousedown', dragStart);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);

            const osInstance = this; // to call maximize/restore methods

            function dragStart(e) {
                if(e.target.closest('button')) return;

                if (win.classList.contains('maximized')) {
                    // Start drag from maximized state
                    isDragging = true;

                    // Temporarily remove transform to get accurate bounding rect
                    win.style.transform = 'none';
                    const rect = win.getBoundingClientRect();

                    // Calculate click position ratio relative to header width
                    const headerRect = header.getBoundingClientRect();
                    const clickRatio = (e.clientX - headerRect.left) / headerRect.width;

                    // Un-maximize
                    win.classList.remove('maximized');
                    if (win.dataset.prevTransform) {
                        win.style.transform = win.dataset.prevTransform;
                    }

                    // Get new rect after un-maximizing
                    const newRect = win.getBoundingClientRect();

                    // Adjust transform to keep mouse over the same relative part of header
                    const expectedLeft = e.clientX - (newRect.width * clickRatio);

                    // Reset offsets to match new position
                    currentX = expectedLeft - (rect.left - xOffset);
                    // Just place it under cursor for Y
                    currentY = e.clientY - (headerRect.height / 2);

                    // Update transform immediately
                    xOffset = currentX;
                    yOffset = currentY;
                    setTranslate(xOffset, yOffset, win);

                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;

                } else {
                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;

                    if (e.target === header || header.contains(e.target)) {
                        isDragging = true;
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

                    // Show snap preview if near top
                    if (e.clientY < 10) {
                        snapPreview.style.display = 'block';
                    } else {
                        snapPreview.style.display = 'none';
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

                // Snap to maximize
                if (e.clientY < 10) {
                    snapPreview.style.display = 'none';
                    if (!win.classList.contains('maximized')) {
                        osInstance.maximizeWindow(win.id.replace('window-', ''));
                    }
                }
                snapPreview.style.display = 'none';
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
    setupTerminal() {
        const terminalInput = document.getElementById('terminal-input');
        const terminalOutput = document.getElementById('terminal-output');
        const terminalWindow = document.getElementById('window-terminal');
        if (!terminalInput || !terminalOutput || !terminalWindow) return;

        const terminalContent = terminalWindow.querySelector('.window-content');

        // Focus input when clicking anywhere in the terminal window
        terminalContent.addEventListener('click', () => {
            terminalInput.focus();
        });

        const printLine = (text, isHtml = false) => {
            const line = document.createElement('div');
            line.className = 'mb-1';
            if (isHtml) {
                line.innerHTML = text;
            } else {
                line.textContent = text;
            }
            terminalOutput.appendChild(line);
            terminalContent.scrollTop = terminalContent.scrollHeight;
        };

        const printPrompt = () => {
            return `<span class="text-[#26a269] font-bold">sebastian@ubuntu</span><span class="text-white">:</span><span class="text-[#12488b] font-bold">~</span><span class="text-white">$ </span>`;
        };

        const escapeHTML = (str) => {
            return str.replace(/[&<>'"]/g,
                tag => ({
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    "'": '&#39;',
                    '"': '&quot;'
                }[tag] || tag)
            );
        };

        // Initial neofetch like display
        printLine(printPrompt() + 'neofetch', true);
        const neofetchOutput = `
<div class="flex flex-col sm:flex-row gap-4 sm:gap-8 my-2 items-center sm:items-start text-xs sm:text-sm">
    <div class="text-[#e95420] font-ubuntu-mono whitespace-pre leading-tight">
            .-/+oossssoo+/-.
        \`:+ssssssssssssssssss+:\`
      -+ssssssssssssssssssyyssss+-
    .ossssssssssssssssssdMMMNysssso.
   /ssssssssssshdmmNNmmyNMMMMhssssss/
  +ssssssssshmydMMMMMMMNddddyssssssss+
 /sssssssshNMMMyhhyyyyhmNMMMNhssssssss/
.ssssssssdMMMNhsssssssssshNMMMdssssssss.
+sssshhhyNMMNyssssssssssssyNMMMysssssss+
ossyNMMMNyMMhsssssssssssssshmmmhssssssso
ossyNMMMNyMMhsssssssssssssshmmmhssssssso
+sssshhhyNMMNyssssssssssssyNMMMysssssss+
.ssssssssdMMMNhsssssssssshNMMMdssssssss.
 /sssssssshNMMMyhhyyyyhdNMMMNhssssssss/
  +sssssssssdmydMMMMMMMMddddyssssssss+
   /ssssssssssshdmNNNNmyNMMMMhssssss/
    .ossssssssssssssssssdMMMNysssso.
      -+sssssssssssssssssyyyssss+-
        \`:+ssssssssssssssssss+:\`
            .-/+oossssoo+/-.
    </div>
    <div class="font-ubuntu-mono text-gray-300">
        <div class="font-bold text-[#e95420]">sebastian@ubuntu</div>
        <div class="border-b border-gray-600 mb-2 w-full"></div>
        <div><span class="text-[#e95420] font-bold">OS</span>: Ubuntu 22.04 LTS x86_64</div>
        <div><span class="text-[#e95420] font-bold">Host</span>: Desarrollador Web</div>
        <div><span class="text-[#e95420] font-bold">Uptime</span>: 24/7 coding</div>
        <div><span class="text-[#e95420] font-bold">Packages</span>: HTML, CSS, JS, .NET, C#</div>
        <div><span class="text-[#e95420] font-bold">Shell</span>: bash 5.1.16</div>
        <div><span class="text-[#e95420] font-bold">Location</span>: Santa Cruz, Bolivia</div>
        <div><span class="text-[#e95420] font-bold">Email</span>: sd8587793@email.com</div>
    </div>
</div>`;
        printLine(neofetchOutput, true);

        const commands = {
            'help': 'Comandos disponibles: help, whoami, clear, ls, neofetch, cat, open',
            'whoami': 'Sebastian Duran Caballero - Desarrollador Web',
            'clear': () => { terminalOutput.innerHTML = ''; },
            'ls': 'description.txt   projects/   skills/',
            'neofetch': () => { printLine(neofetchOutput, true); },
            'cat description.txt': 'Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.',
            'open projects': () => { this.openWindow('projects'); return 'Abriendo Proyectos...'; },
            'open skills': () => { this.openWindow('skills'); return 'Abriendo Habilidades...'; },
            'open contact': () => { this.openWindow('contact'); return 'Abriendo Contacto...'; }
        };

        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const inputVal = terminalInput.value.trim();
                terminalInput.value = '';

                if (inputVal) {
                    printLine(printPrompt() + escapeHTML(inputVal), true);

                    const cmd = inputVal.toLowerCase();
                    const response = commands[cmd];

                    if (typeof response === 'function') {
                        const result = response();
                        if (result) printLine(result);
                    } else if (response) {
                        printLine(response);
                    } else if (cmd.startsWith('cat ')) {
                        printLine(`cat: ${escapeHTML(cmd.substring(4))}: No such file or directory`);
                    } else if (cmd.startsWith('open ')) {
                        printLine(`open: ${escapeHTML(cmd.substring(5))}: No such application`);
                    } else {
                        printLine(`${escapeHTML(cmd)}: command not found`);
                    }
                } else {
                    printLine(printPrompt(), true);
                }
            }
        });
    }
}

// Initialize the OS
const app = new LinuxOS();