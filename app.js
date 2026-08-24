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



    setupWindowResizing() {
        let isResizingGlobal = false;
        let currentWindow = null;
        let currentResizerGlobal = null;
        let startXGlobal, startYGlobal, startWidthGlobal, startHeightGlobal;

        document.addEventListener('mousemove', (e) => {
            if (!isResizingGlobal) return;

            if (currentResizerGlobal.classList.contains('resizer-r')) {
                currentWindow.style.width = startWidthGlobal + (e.clientX - startXGlobal) + 'px';
            } else if (currentResizerGlobal.classList.contains('resizer-b')) {
                currentWindow.style.height = startHeightGlobal + (e.clientY - startYGlobal) + 'px';
            } else if (currentResizerGlobal.classList.contains('resizer-br')) {
                currentWindow.style.width = startWidthGlobal + (e.clientX - startXGlobal) + 'px';
                currentWindow.style.height = startHeightGlobal + (e.clientY - startYGlobal) + 'px';
            }
        });

        document.addEventListener('mouseup', () => {
            isResizingGlobal = false;
        });

        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    if (win.classList.contains('maximized')) return;
                    isResizingGlobal = true;
                    currentResizerGlobal = resizer;
                    currentWindow = win;
                    startXGlobal = e.clientX;
                    startYGlobal = e.clientY;

                    startWidthGlobal = parseInt(document.defaultView.getComputedStyle(win).width, 10);
                    startHeightGlobal = parseInt(document.defaultView.getComputedStyle(win).height, 10);

                    const rect = win.getBoundingClientRect();
                    win.style.width = rect.width + 'px';
                    win.style.height = rect.height + 'px';

                    e.preventDefault(); // Prevent text selection
                });
            });
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
            const self = this; // Capture reference to LinuxOS instance

            header.addEventListener('mousedown', dragStart);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);

            function dragStart(e) {
                if(e.target.closest('button')) return;

                if(win.classList.contains('maximized')) {
                    // Restore maximized window via drag
                    win.classList.remove('maximized');
                    win.style.transform = 'none'; // Temporarily clear transform

                    const rect = win.getBoundingClientRect();
                    const desktopRect = document.getElementById('desktop').getBoundingClientRect();

                    // Recalculate offsets relative to the desktop container
                    xOffset = rect.left - desktopRect.left;
                    yOffset = rect.top - desktopRect.top;

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

                    // Aero snap: Maximize if dragged to top edge
                    const desktopRect = document.getElementById('desktop').getBoundingClientRect();
                    if (e.clientY <= desktopRect.top + 10) { // 10px threshold
                        self.maximizeWindow(win.dataset.id);
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
window.app = new LinuxOS();
window.terminal = new TerminalParser();

class TerminalParser {
    constructor() {
        this.input = document.getElementById('terminal-input');
        this.output = document.getElementById('terminal-output');
        if(this.input && this.output) {
            this.setup();
            this.prePopulate();
        }
    }

    setup() {
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const command = this.input.value.trim();
                if (command) {
                    this.print(`sebastian@ubuntu:~$ ${command}`, true);
                    this.processCommand(command);
                } else {
                    this.print(`sebastian@ubuntu:~$ `);
                }
                this.input.value = '';
                this.scrollToBottom();
            }
        });
    }

    prePopulate() {
        this.print(`sebastian@ubuntu:~$ whoami`, true);
        this.processCommand('whoami');
        this.print(`sebastian@ubuntu:~$ neofetch`, true);
        this.processCommand('neofetch');
    }

    print(html, isCommand = false) {
        const div = document.createElement('div');
        div.className = isCommand ? 'mb-2' : 'text-gray-100 mb-4';

        if (isCommand) {
            // Reformat the command prompt string
            const commandText = document.createTextNode(html.replace('sebastian@ubuntu:~$ ', ''));
            div.innerHTML = '<span class="text-green-400 font-bold">sebastian@ubuntu</span>:<span class="text-blue-400 font-bold">~</span>$ ';
            div.appendChild(commandText);
        } else {
            // Securely escape non-html string or just use innerHTML for known safe HTML (like neofetch)
            div.innerHTML = html;
        }
        this.output.appendChild(div);
    }

    printText(text) {
        const div = document.createElement('div');
        div.className = 'text-gray-100 mb-4';
        div.textContent = text;
        this.output.appendChild(div);
    }

    processCommand(cmd) {
        const args = cmd.split(' ');
        const mainCmd = args[0].toLowerCase();

        switch (mainCmd) {
            case 'help':
                this.print(`Comandos disponibles:
<br> - <span class="text-green-300">help</span>: Muestra esta ayuda
<br> - <span class="text-green-300">whoami</span>: Muestra el usuario actual
<br> - <span class="text-green-300">clear</span>: Limpia la terminal
<br> - <span class="text-green-300">ls</span>: Lista los archivos en el directorio actual
<br> - <span class="text-green-300">cat &lt;file&gt;</span>: Muestra el contenido de un archivo
<br> - <span class="text-green-300">neofetch</span>: Muestra información del sistema
<br> - <span class="text-green-300">open &lt;app&gt;</span>: Abre una aplicación (projects, skills, contact)`);
                break;
            case 'whoami':
                this.printText('Sebastian Duran Caballero');
                break;
            case 'clear':
                this.output.innerHTML = '';
                break;
            case 'ls':
                this.print(`<span class="text-blue-400">projects/</span>  <span class="text-blue-400">skills/</span>  <span class="text-blue-400">contact/</span>  description.txt`);
                break;
            case 'neofetch':
                this.print(`<div class="flex flex-col md:flex-row text-gray-100 mb-4">
                        <div class="mr-6 mb-4 md:mb-0 text-[#e95420] text-xs sm:text-sm font-bold">
<pre>
       _,-/&#96;--,-/\-,
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
                    </div>`);
                break;
            case 'cat':
                if (args[1] === 'description.txt') {
                    this.printText('Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.');
                } else {
                    this.printText(`cat: ${args[1] || ''}: No such file or directory`);
                }
                break;
            case 'open':
                const app = args[1];
                if (['projects', 'skills', 'contact'].includes(app)) {
                    this.printText(`Opening ${app}...`);
                    window.app.openWindow(app);
                } else {
                    this.printText(`Application not found: ${app || ''}`);
                }
                break;
            default:
                this.printText(`Command not found: ${mainCmd}`);
        }
    }

    scrollToBottom() {
        const content = document.getElementById('terminal-content');
        if (content) {
            content.scrollTop = content.scrollHeight;
        }
    }
}
