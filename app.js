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
        this.setupResizers();
        this.setupWindowClickToFront();
        this.setupLogin();
        this.setupSkillsSidebar();
    }

    setupSkillsSidebar() {
        const sidebarItems = document.querySelectorAll('#skills-sidebar-items li');
        const gridContainer = document.getElementById('skills-content-grid');

        if(!sidebarItems.length || !gridContainer) return;

        sidebarItems.forEach(item => {
            item.addEventListener('click', () => {
                // Update active styling
                sidebarItems.forEach(i => {
                    i.classList.remove('bg-white/10', 'font-bold', 'text-white');
                    i.classList.add('hover:bg-white/5', 'text-gray-300');
                });

                item.classList.remove('hover:bg-white/5', 'text-gray-300');
                item.classList.add('bg-white/10', 'font-bold', 'text-white');

                // Filter content
                const category = item.dataset.category;
                const skills = gridContainer.children;

                Array.from(skills).forEach(skill => {
                    // For now, if category is not 'tecnologias', hide everything to show filter works.
                    // In a real app we'd have items for other categories.
                    if (skill.dataset.skillCategory === category || category === 'tecnologias') {
                        if (category === 'tecnologias') {
                            skill.style.display = 'flex';
                        } else {
                            skill.style.display = 'none'; // mock hiding for other tabs since we don't have their content
                        }
                    } else {
                        skill.style.display = 'none';
                    }
                });
            });
        });
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


    setupResizers() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer = null;
            let originalWidth = 0;
            let originalHeight = 0;
            let originalX = 0;
            let originalY = 0;
            let originalMouseX = 0;
            let originalMouseY = 0;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    if(win.classList.contains('maximized')) return;
                    isResizing = true;
                    currentResizer = resizer;

                    const rect = win.getBoundingClientRect();
                    originalWidth = rect.width;
                    originalHeight = rect.height;
                    originalX = rect.left;
                    originalY = rect.top;
                    originalMouseX = e.clientX;
                    originalMouseY = e.clientY;

                    this.bringToFront(win);

                    document.addEventListener('mousemove', resize);
                    document.addEventListener('mouseup', stopResize);
                });
            });

            const resize = (e) => {
                if (!isResizing) return;

                // Temporarily disable transition during resize for smooth tracking
                win.style.transition = 'none';

                if (currentResizer.classList.contains('resizer-r') || currentResizer.classList.contains('resizer-br')) {
                    const width = originalWidth + (e.clientX - originalMouseX);
                    // enforce min-width manually to be safe, though tailwind might do it
                    if (width > 300) {
                        win.style.width = width + 'px';
                    }
                }

                if (currentResizer.classList.contains('resizer-b') || currentResizer.classList.contains('resizer-br')) {
                    const height = originalHeight + (e.clientY - originalMouseY);
                    // enforce min-height manually
                    if (height > 200) {
                        win.style.height = height + 'px';
                    }
                }
            };

            const stopResize = () => {
                isResizing = false;
                // Restore transition (from styles.css)
                win.style.transition = '';
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

            header.addEventListener('mousedown', dragStart);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);

            function dragStart(e) {
                // Don't drag if maximizing/closing buttons are clicked
                if(e.target.closest('button')) return;

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;

                    // Handle un-maximizing via drag
                    if(win.classList.contains('maximized')) {
                        const rect = win.getBoundingClientRect();
                        const desktopRect = document.getElementById('desktop').getBoundingClientRect();

                        // Calculate percentage of mouse position along the header
                        const clickRatioX = (e.clientX - rect.left) / rect.width;

                        win.classList.remove('maximized');
                        win.style.transform = 'none';

                        // Re-measure after removing class to get real size
                        const newRect = win.getBoundingClientRect();

                        // New position should keep the mouse at the same relative position on the header
                        const newLeft = e.clientX - (newRect.width * clickRatioX);
                        const newTop = e.clientY;

                        // Set new offsets relative to desktop container
                        xOffset = newLeft - desktopRect.left;
                        yOffset = newTop - desktopRect.top;

                        setTranslate(xOffset, yOffset, win);
                    }

                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;

                    // Temporarily remove transition for snappy dragging
                    win.style.transition = 'none';
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
                // Restore transition
                win.style.transition = '';
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
window.app = new LinuxOS();
new TerminalParser();

class TerminalParser {
    constructor() {
        this.input = document.getElementById('terminal-input');
        this.output = document.getElementById('terminal-output');
        if(!this.input || !this.output) return;

        this.fileSystem = {
            'description.txt': 'Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.',
            'projects': 'Directorio',
            'skills': 'Directorio',
            'contact': 'Directorio'
        };

        this.init();
    }

    init() {
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.processCommand(this.input.value);
                this.input.value = '';
            }
        });

        // Focus input when clicking anywhere in terminal window content
        const winContent = this.input.closest('.window-content');
        if(winContent) {
            winContent.addEventListener('click', () => {
                // only focus if not selecting text
                if (window.getSelection().toString() === '') {
                    this.input.focus();
                }
            });
        }

        // Prepend initial commands
        this.processCommand('whoami', true);
        this.processCommand('cat description.txt', true);
        this.processCommand('neofetch', true);
    }

    echo(command) {
        const line = document.createElement('p');
        line.className = 'mb-1';

        const prompt1 = document.createElement('span');
        prompt1.className = 'text-green-400 font-bold';
        prompt1.textContent = 'sebastian@ubuntu';

        const colon = document.createTextNode(':');

        const prompt2 = document.createElement('span');
        prompt2.className = 'text-blue-400 font-bold';
        prompt2.textContent = '~';

        const dollar = document.createTextNode('$ ');

        const cmdSpan = document.createElement('span');
        cmdSpan.textContent = command;

        line.appendChild(prompt1);
        line.appendChild(colon);
        line.appendChild(prompt2);
        line.appendChild(dollar);
        line.appendChild(cmdSpan);

        this.output.appendChild(line);
    }

    printRawHTML(html) {
        const div = document.createElement('div');
        div.innerHTML = html; // Safe here as we control the hardcoded HTML responses
        this.output.appendChild(div);
    }

    printText(text) {
        const p = document.createElement('p');
        p.className = 'text-gray-100 mb-2';
        p.textContent = text;
        this.output.appendChild(p);
    }

    processCommand(cmdStr, isInit = false) {
        const commandLine = cmdStr.trim();
        if (!isInit && commandLine !== '') {
            this.echo(commandLine);
        } else if (isInit) {
             this.echo(commandLine);
        }

        if (commandLine === '') return;

        const parts = commandLine.split(' ').filter(p => p !== '');
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        switch(cmd) {
            case 'help':
                this.printText('Available commands: help, whoami, clear, ls, neofetch, cat <file>, open <app>');
                break;
            case 'whoami':
                this.printText('Sebastian Duran Caballero');
                break;
            case 'clear':
                this.output.innerHTML = '';
                break;
            case 'ls':
                this.printText(Object.keys(this.fileSystem).join('  '));
                break;
            case 'cat':
                if (args.length === 0) {
                    this.printText('cat: missing file operand');
                } else {
                    const file = args[0];
                    if (this.fileSystem[file]) {
                        if(this.fileSystem[file] === 'Directorio') {
                            this.printText(`cat: ${file}: Is a directory`);
                        } else {
                            this.printText(this.fileSystem[file]);
                        }
                    } else {
                        this.printText(`cat: ${file}: No such file or directory`);
                    }
                }
                break;
            case 'neofetch':
                const neofetchHTML = `
                    <div class="flex flex-col md:flex-row text-gray-100 mb-4">
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
                    </div>`;
                this.printRawHTML(neofetchHTML);
                break;
            case 'open':
                if (args.length === 0) {
                    this.printText('open: missing app operand');
                } else {
                    const appName = args[0].toLowerCase();
                    const validApps = ['projects', 'skills', 'contact', 'terminal'];
                    if (validApps.includes(appName)) {
                        if(window.app) {
                            window.app.openWindow(appName);
                            this.printText(`Opened ${appName}`);
                        } else {
                             this.printText(`Error: OS not initialized`);
                        }
                    } else {
                        this.printText(`open: app '${appName}' not found`);
                    }
                }
                break;
            default:
                this.printText(`bash: ${cmd}: command not found`);
        }

        if(!isInit) {
            // Scroll to bottom
            const winContent = this.output.closest('.window-content');
            if(winContent) {
                winContent.scrollTop = winContent.scrollHeight;
            }
        }
    }
}
