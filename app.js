
class TerminalParser {
    constructor(terminalContentElement) {
        this.contentElement = terminalContentElement;
        this.commandHistory = [];
        this.historyIndex = -1;
    }

    printLine(htmlContent, isHTML = true) {
        const p = document.createElement('p');
        p.className = 'mb-2 text-gray-100';
        if (isHTML) {
            p.innerHTML = htmlContent;
        } else {
            p.textContent = htmlContent;
        }

        // Insert before the input line (which is the last element)
        const inputLine = this.contentElement.lastElementChild;
        this.contentElement.insertBefore(p, inputLine);
        this.scrollToBottom();
    }

    printSystem(text) {
        const div = document.createElement('div');
        div.className = 'mb-4 text-gray-100 whitespace-pre-wrap';
        div.textContent = text;
        const inputLine = this.contentElement.lastElementChild;
        this.contentElement.insertBefore(div, inputLine);
        this.scrollToBottom();
    }

    printSystemHTML(html) {
        const div = document.createElement('div');
        div.className = 'mb-4 text-gray-100';
        div.innerHTML = html;
        const inputLine = this.contentElement.lastElementChild;
        this.contentElement.insertBefore(div, inputLine);
        this.scrollToBottom();
    }

    scrollToBottom() {
        this.contentElement.scrollTop = this.contentElement.scrollHeight;
    }

    parseCommand(cmdStr) {
        const trimmed = cmdStr.trim();
        if (!trimmed) return;

        this.commandHistory.push(trimmed);
        this.historyIndex = this.commandHistory.length;

        // Echo command using textContent to prevent self-XSS
        const echoDiv = document.createElement('p');
        echoDiv.className = 'mb-2';

        const promptSpan = document.createElement('span');
        promptSpan.className = 'text-green-400 font-bold';
        promptSpan.textContent = 'sebastian@adwaita';

        const colonSpan = document.createElement('span');
        colonSpan.textContent = ':';

        const tildeSpan = document.createElement('span');
        tildeSpan.className = 'text-blue-400 font-bold';
        tildeSpan.textContent = '~';

        const dollarSpan = document.createElement('span');
        dollarSpan.textContent = '$ ';

        const cmdSpan = document.createElement('span');
        cmdSpan.textContent = trimmed;

        echoDiv.appendChild(promptSpan);
        echoDiv.appendChild(colonSpan);
        echoDiv.appendChild(tildeSpan);
        echoDiv.appendChild(dollarSpan);
        echoDiv.appendChild(cmdSpan);

        const inputLine = this.contentElement.lastElementChild;
        this.contentElement.insertBefore(echoDiv, inputLine);

        const args = trimmed.split(' ');
        const cmd = args[0].toLowerCase();

        switch (cmd) {
            case 'help':
                this.printSystem('Comandos disponibles: help, whoami, clear, ls, neofetch, cat, open');
                break;
            case 'whoami':
                this.printSystem('Sebastian Duran Caballero');
                break;
            case 'clear':
                // Remove everything except the last element (the input line)
                while (this.contentElement.children.length > 1) {
                    this.contentElement.removeChild(this.contentElement.firstChild);
                }
                break;
            case 'ls':
                this.printSystemHTML('<span class="text-blue-400 font-bold mr-4">Proyectos</span> <span class="text-gray-200 mr-4">description.txt</span> <span class="text-blue-400 font-bold">Habilidades</span>');
                break;
            case 'neofetch':
                this.printSystemHTML(`
                    <div class="flex flex-col md:flex-row text-gray-100">
                        <div class="mr-6 mb-4 md:mb-0 text-[#3584e4] text-xs sm:text-sm font-bold">
<pre>
          .
         / \
        /   \
       /     \
      /       \
     /_________\
     \         /
      \       /
       \     /
        \   /
         \ /
          '
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
                `);
                break;
            case 'cat':
                if (args[1] === 'description.txt') {
                    this.printSystem('Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.');
                } else {
                    this.printSystem(`cat: ${args[1] || ''}: No such file or directory`);
                }
                break;
            case 'open':
                if (args[1] === 'projects' || args[1] === 'skills' || args[1] === 'contact') {
                    window.app.openWindow(args[1]);
                    this.printSystem(`Abriendo ${args[1]}...`);
                } else {
                    this.printSystem(`open: No se puede abrir '${args[1] || ''}'. Aplicaciones disponibles: projects, skills, contact`);
                }
                break;
            default:
                this.printSystem(`${cmd}: orden no encontrada`);
        }
        this.scrollToBottom();
    }
}

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
        this.setupResizableWindows();
        this.setupWindowClickToFront();
        this.setupLogin();
        this.setupTerminal();
    }


    setupTerminal() {
        const terminalContent = document.querySelector('#window-terminal .window-content');
        if (terminalContent) {
            this.terminalParser = new TerminalParser(terminalContent);
            const inputField = document.getElementById('terminal-input');

            if (inputField) {
                // Pre-populate with whoami and neofetch
                inputField.value = 'whoami';
                this.terminalParser.parseCommand('whoami');
                inputField.value = '';

                inputField.value = 'neofetch';
                this.terminalParser.parseCommand('neofetch');
                inputField.value = '';

                inputField.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        const cmd = inputField.value;
                        inputField.value = '';
                        this.terminalParser.parseCommand(cmd);
                    } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        if (this.terminalParser.historyIndex > 0) {
                            this.terminalParser.historyIndex--;
                            inputField.value = this.terminalParser.commandHistory[this.terminalParser.historyIndex];
                        }
                    } else if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        if (this.terminalParser.historyIndex < this.terminalParser.commandHistory.length - 1) {
                            this.terminalParser.historyIndex++;
                            inputField.value = this.terminalParser.commandHistory[this.terminalParser.historyIndex];
                        } else {
                            this.terminalParser.historyIndex = this.terminalParser.commandHistory.length;
                            inputField.value = '';
                        }
                    }
                });

                // Focus terminal input when clicking anywhere in terminal content
                terminalContent.addEventListener('click', () => {
                    inputField.focus();
                });
            }
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

            const setTranslate = (xPos, yPos, el) => {
                el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
            };

            const dragStart = (e) => {
                if(e.target.closest('button')) return;

                if(win.classList.contains('maximized')) {
                    win.classList.remove('maximized');
                    win.style.transform = 'none';

                    const rect = win.getBoundingClientRect();
                    // calculate natural position relative offset to prevent jump
                    // The window jumps because we are setting transform relative to its natural CSS top/left
                    // We need xOffset such that (naturalLeft + xOffset) = current mouse X, minus where we clicked on the header
                    // For simplicity in this vanilla implementation, center the window on the mouse

                    const windowWidth = win.offsetWidth;
                    xOffset = e.clientX - (rect.left + windowWidth / 2);
                    yOffset = e.clientY - rect.top;

                    setTranslate(xOffset, yOffset, win);
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
                }
            };

            const dragEnd = (e) => {
                if (isDragging) {
                    initialX = currentX;
                    initialY = currentY;
                    isDragging = false;

                    // Aero snap to top to maximize
                    if (e.clientY <= 30) { // Top bar threshold
                        this.maximizeWindow(win.dataset.id);
                    }
                }
            };

            header.addEventListener('mousedown', dragStart);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);
        });
    }

    setupResizableWindows() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer = null;
            let startX, startY, startWidth, startHeight;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    isResizing = true;
                    currentResizer = resizer;
                    startX = e.clientX;
                    startY = e.clientY;
                    startWidth = parseInt(document.defaultView.getComputedStyle(win).width, 10);
                    startHeight = parseInt(document.defaultView.getComputedStyle(win).height, 10);
                    e.preventDefault();
                });
            });

            document.addEventListener('mousemove', (e) => {
                if (!isResizing) return;

                if (currentResizer.classList.contains('resizer-r') || currentResizer.classList.contains('resizer-br')) {
                    win.style.width = startWidth + (e.clientX - startX) + 'px';
                }

                if (currentResizer.classList.contains('resizer-b') || currentResizer.classList.contains('resizer-br')) {
                    win.style.height = startHeight + (e.clientY - startY) + 'px';
                }
            });

            document.addEventListener('mouseup', () => {
                isResizing = false;
                currentResizer = null;
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