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
        this.setupResizing();
    }

    setupTerminal() {
        const terminalInput = document.getElementById('terminal-input');
        const terminalOutput = document.getElementById('terminal-output');

        if (!terminalInput || !terminalOutput) return;

        // Ensure clicking anywhere in terminal content focuses the input
        const windowContent = document.querySelector('#window-terminal .window-content');
        if (windowContent) {
            windowContent.addEventListener('click', () => {
                terminalInput.focus();
            });
        }

        const terminalParser = new TerminalParser(this);

        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = terminalInput.value.trim();
                terminalInput.value = '';

                if (command) {
                    terminalParser.executeCommand(command, terminalOutput);
                } else {
                    // Empty enter just prints prompt
                    const prompt = document.createElement('div');
                    prompt.innerHTML = `<span class="text-green-400 font-bold">sebastian@adwaita</span>:<span class="text-blue-400 font-bold">~</span>$ `;
                    terminalOutput.appendChild(prompt);
                }

                // Scroll to bottom
                if (windowContent) {
                    windowContent.scrollTop = windowContent.scrollHeight;
                }
            }
        });

        // Initialize with default commands
        terminalParser.executeCommand('whoami', terminalOutput);
        terminalParser.executeCommand('neofetch', terminalOutput);
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
                // Don't drag if maximizing/closing buttons are clicked
                if(e.target.closest('button')) return;

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;

                    // Support restoring from maximized state on drag
                    if (win.classList.contains('maximized')) {
                        win.classList.remove('maximized');

                        // Temporarily remove transform to calculate accurate bounds relative to desktop
                        win.style.transform = 'none';
                        const desktopRect = document.getElementById('desktop').getBoundingClientRect();

                        // Recalculate offsets based on current mouse position to keep window under cursor
                        // Center horizontally on cursor, start slightly below cursor vertically
                        xOffset = e.clientX - desktopRect.left - (win.offsetWidth / 2);
                        yOffset = e.clientY - desktopRect.top - 10;

                        setTranslate(xOffset, yOffset, win);
                    }

                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;
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

    setupResizing() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer;
            let originalWidth;
            let originalHeight;
            let originalX;
            let originalY;
            let originalMouseX;
            let originalMouseY;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    isResizing = true;
                    currentResizer = resizer;

                    originalWidth = parseFloat(getComputedStyle(win, null).getPropertyValue('width').replace('px', ''));
                    originalHeight = parseFloat(getComputedStyle(win, null).getPropertyValue('height').replace('px', ''));
                    originalX = win.getBoundingClientRect().left;
                    originalY = win.getBoundingClientRect().top;
                    originalMouseX = e.pageX;
                    originalMouseY = e.pageY;

                    window.addEventListener('mousemove', resize);
                    window.addEventListener('mouseup', stopResize);
                });
            });

            function resize(e) {
                if (!isResizing) return;
                if (win.classList.contains('maximized')) return;

                if (currentResizer.classList.contains('resizer-bottom-right')) {
                    const width = originalWidth + (e.pageX - originalMouseX);
                    const height = originalHeight + (e.pageY - originalMouseY);
                    if (width > 300) win.style.width = width + 'px';
                    if (height > 200) win.style.height = height + 'px';
                } else if (currentResizer.classList.contains('resizer-bottom')) {
                    const height = originalHeight + (e.pageY - originalMouseY);
                    if (height > 200) win.style.height = height + 'px';
                } else if (currentResizer.classList.contains('resizer-right')) {
                    const width = originalWidth + (e.pageX - originalMouseX);
                    if (width > 300) win.style.width = width + 'px';
                }
            }

            function stopResize() {
                isResizing = false;
                window.removeEventListener('mousemove', resize);
                window.removeEventListener('mouseup', stopResize);
            }
        });
    }
}

class TerminalParser {
    constructor(osInstance) {
        this.os = osInstance;
        this.fileSystem = {
            'description.txt': 'Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.',
            'contact.txt': 'Email: sd8587793@email.com\nGitHub: @sebastianDuranC\nLinkedIn: Sebastian Duran Caballero'
        };
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

    executeCommand(command, outputElement) {
        const args = command.trim().split(/\s+/);
        const cmd = args[0].toLowerCase();

        // Echo command
        const commandDiv = document.createElement('div');
        commandDiv.innerHTML = `<span class="text-green-400 font-bold">sebastian@adwaita</span>:<span class="text-blue-400 font-bold">~</span>$ ${this.escapeHTML(command)}`;
        commandDiv.className = 'mb-1';
        outputElement.appendChild(commandDiv);

        const responseDiv = document.createElement('div');
        responseDiv.className = 'mb-2 text-gray-100';

        switch (cmd) {
            case 'help':
                responseDiv.innerHTML = `
                    Available commands:<br>
                    &nbsp;&nbsp;help&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Show this help message<br>
                    &nbsp;&nbsp;whoami&nbsp;&nbsp;&nbsp;&nbsp;Print the current user<br>
                    &nbsp;&nbsp;clear&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Clear the terminal<br>
                    &nbsp;&nbsp;ls&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;List directory contents<br>
                    &nbsp;&nbsp;cat&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Read file content<br>
                    &nbsp;&nbsp;neofetch&nbsp;&nbsp;Show system information<br>
                    &nbsp;&nbsp;open&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Open application (projects, skills, contact)
                `;
                outputElement.appendChild(responseDiv);
                break;
            case 'whoami':
                responseDiv.textContent = 'Sebastian Duran Caballero';
                outputElement.appendChild(responseDiv);
                break;
            case 'clear':
                outputElement.innerHTML = '';
                break;
            case 'ls':
                responseDiv.innerHTML = Object.keys(this.fileSystem).map(f => `<span class="text-blue-400">${f}</span>`).join('  ');
                outputElement.appendChild(responseDiv);
                break;
            case 'cat':
                if (args.length < 2) {
                    responseDiv.textContent = 'cat: missing file operand';
                } else {
                    const filename = args[1];
                    if (this.fileSystem[filename]) {
                        responseDiv.textContent = this.fileSystem[filename];
                    } else {
                        responseDiv.textContent = `cat: ${filename}: No such file or directory`;
                    }
                }
                outputElement.appendChild(responseDiv);
                break;
            case 'open':
                if (args.length < 2) {
                    responseDiv.textContent = 'open: missing application name';
                } else {
                    const appName = args[1].toLowerCase();
                    if (['projects', 'skills', 'contact'].includes(appName)) {
                        this.os.openWindow(appName);
                        responseDiv.textContent = `Opening ${appName}...`;
                    } else {
                        responseDiv.textContent = `open: ${appName}: Application not found`;
                    }
                }
                outputElement.appendChild(responseDiv);
                break;
            case 'neofetch':
                responseDiv.innerHTML = `
                    <div class="flex flex-col md:flex-row text-gray-100 mb-4">
                        <div class="mr-6 mb-4 md:mb-0 text-[#3584e4] text-xs sm:text-sm font-bold">
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
                            <p><span class="text-[#3584e4] font-bold">OS:</span> Adwaita OS x86_64</p>
                            <p><span class="text-[#3584e4] font-bold">Host:</span> Desarrollador Web</p>
                            <p><span class="text-[#3584e4] font-bold">Uptime:</span> 24/7 coding</p>
                            <p><span class="text-[#3584e4] font-bold">Packages:</span> HTML, CSS, JS, .NET, C#</p>
                            <p><span class="text-[#3584e4] font-bold">Shell:</span> bash 5.1.16</p>
                            <p><span class="text-[#3584e4] font-bold">Location:</span> Santa Cruz, Bolivia</p>
                            <p><span class="text-[#3584e4] font-bold">Email:</span> sd8587793@email.com</p>
                        </div>
                    </div>
                `;
                outputElement.appendChild(responseDiv);
                break;
            default:
                if (cmd) {
                    responseDiv.textContent = `${cmd}: command not found`;
                    outputElement.appendChild(responseDiv);
                }
        }
    }
}

// Initialize the OS and expose it to window
window.app = new LinuxOS();