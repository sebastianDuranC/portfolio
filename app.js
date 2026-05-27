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
        this.hasTypedInTerminal = false;
    }

    setupLogin() {
        const passwordInput = document.getElementById('login-password');
        if (passwordInput) {
            passwordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.login();
                }
            });
        }
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
        const loginDateElement = document.getElementById('login-date');
        
        const updateClock = () => {
            const now = new Date();
            const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            // Spanish locale matching the html lang
            let dateString = now.toLocaleDateString('es-ES', options).replace(',', '');
            // Capitalize first letter of day and month
            dateString = dateString.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());

            if (dateElement) dateElement.textContent = dateString;
            if (loginDateElement) loginDateElement.textContent = dateString;
        };

        updateClock();
        setInterval(updateClock, 1000);
    }

    bringToFront(windowElement) {
        this.highestZIndex++;
        windowElement.style.zIndex = this.highestZIndex;
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
            let startX, startY, initialLeft, initialTop;

            header.addEventListener('mousedown', dragStart.bind(this));
            document.addEventListener('mousemove', drag.bind(this));
            document.addEventListener('mouseup', dragEnd.bind(this));

            function dragStart(e) {
                // Don't drag if maximizing/closing buttons are clicked
                if(e.target.closest('button')) return;

                // Don't drag if maximized
                if(win.classList.contains('maximized')) return;

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;
                    startX = e.clientX;
                    startY = e.clientY;

                    // Get current computed top and left
                    const rect = win.getBoundingClientRect();
                    // Store initial top and left relative to the desktop container or body depending on positioning
                    initialLeft = win.offsetLeft;
                    initialTop = win.offsetTop;

                    // Clear transforms if any exist from before, and lock to left/top
                    if (win.style.transform) {
                        const style = window.getComputedStyle(win);
                        const matrix = new WebKitCSSMatrix(style.transform);
                        initialLeft += matrix.m41;
                        initialTop += matrix.m42;
                        win.style.transform = 'none';
                    }

                    win.style.left = `${initialLeft}px`;
                    win.style.top = `${initialTop}px`;

                    // Bring to front
                    this.bringToFront(win);
                }
            }

            function drag(e) {
                if (isDragging) {
                    e.preventDefault();

                    // Calculate new position
                    const dx = e.clientX - startX;
                    const dy = e.clientY - startY;

                    let newLeft = initialLeft + dx;
                    let newTop = initialTop + dy;

                    // Basic bounds checking (don't go above top bar, don't go left of dock)
                    if (newTop < 0) newTop = 0; // Relative to #desktop container

                    win.style.left = `${newLeft}px`;
                    win.style.top = `${newTop}px`;
                }
            }

            function dragEnd() {
                isDragging = false;
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

                if (id === 'terminal' && !this.hasTypedInTerminal) {
                    this.hasTypedInTerminal = true;
                    this.typeTerminalCommands();
                }
            } else {
                this.bringToFront(win);
            }
        }
    }

    typeTerminalCommands() {
        const output = document.getElementById('terminal-output');
        const input = document.getElementById('terminal-input');
        if (!output || !input) return;

        const commands = [
            { cmd: 'whoami', out: 'Sebastian Duran Caballero' },
            { cmd: 'cat description.txt', out: 'Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.' },
            { cmd: 'neofetch', out: `
<div class="flex flex-col md:flex-row text-gray-100 mb-4">
    <div class="mr-6 mb-4 md:mb-0 text-[#e95420] text-xs sm:text-sm font-bold whitespace-pre">
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
</div>` }
        ];

        let cmdIndex = 0;

        const processNextCommand = () => {
            if (cmdIndex >= commands.length) return;

            const currentCmd = commands[cmdIndex];
            let charIndex = 0;
            input.textContent = '';

            const typeChar = () => {
                if (charIndex < currentCmd.cmd.length) {
                    input.textContent += currentCmd.cmd.charAt(charIndex);
                    charIndex++;
                    setTimeout(typeChar, 50); // Typing speed
                } else {
                    setTimeout(() => {
                        // Append command to output
                        output.innerHTML += `
                            <div class="mb-2">
                                <span class="text-green-400 font-bold">sebastian@ubuntu</span><span class="text-white font-bold">:</span><span class="text-blue-400 font-bold">~</span><span class="text-white font-bold">$ </span>
                                <span class="text-white">${currentCmd.cmd}</span>
                            </div>
                            <div class="text-gray-100 mb-4">${currentCmd.out}</div>
                        `;
                        input.textContent = '';
                        // Scroll to bottom
                        const contentDiv = document.getElementById('terminal-content');
                        if (contentDiv) contentDiv.scrollTop = contentDiv.scrollHeight;

                        cmdIndex++;
                        setTimeout(processNextCommand, 500); // Pause before next command
                    }, 200); // Pause after typing
                }
            };
            typeChar();
        };

        // Small delay before starting
        setTimeout(processNextCommand, 800);
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
            if (win.classList.contains('maximized')) {
                // Restore
                win.classList.remove('maximized');
                // Restore saved coordinates if they exist
                if (win.dataset.savedLeft && win.dataset.savedTop) {
                    win.style.left = win.dataset.savedLeft;
                    win.style.top = win.dataset.savedTop;
                    win.style.width = win.dataset.savedWidth;
                    win.style.height = win.dataset.savedHeight;
                }
            } else {
                // Maximize
                // Save current inline styles to restore later
                win.dataset.savedLeft = win.style.left || window.getComputedStyle(win).left;
                win.dataset.savedTop = win.style.top || window.getComputedStyle(win).top;
                win.dataset.savedWidth = win.style.width || window.getComputedStyle(win).width;
                win.dataset.savedHeight = win.style.height || window.getComputedStyle(win).height;

                win.classList.add('maximized');

                // Remove inline position styles so the CSS classes can take over
                win.style.left = '';
                win.style.top = '';
                win.style.width = '';
                win.style.height = '';
                win.style.transform = 'none'; // Ensure transform is clear
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