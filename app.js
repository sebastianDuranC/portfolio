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
        this.setupResizableWindows();
    }


    setupResizableWindows() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer;
            let initialWidth, initialHeight, initialMouseX, initialMouseY;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    isResizing = true;
                    currentResizer = resizer;
                    const rect = win.getBoundingClientRect();
                    initialWidth = rect.width;
                    initialHeight = rect.height;
                    initialMouseX = e.clientX;
                    initialMouseY = e.clientY;

                    this.bringToFront(win);

                    document.addEventListener('mousemove', resize);
                    document.addEventListener('mouseup', stopResize);
                });
            });

            function resize(e) {
                if (!isResizing) return;

                if (win.classList.contains('maximized')) {
                    win.classList.remove('maximized');
                }

                if (currentResizer.classList.contains('right') || currentResizer.classList.contains('bottom-right')) {
                    const width = initialWidth + (e.clientX - initialMouseX);
                    win.style.width = width + 'px';
                }

                if (currentResizer.classList.contains('bottom') || currentResizer.classList.contains('bottom-right')) {
                    const height = initialHeight + (e.clientY - initialMouseY);
                    win.style.height = height + 'px';
                }
            }

            function stopResize() {
                isResizing = false;
                document.removeEventListener('mousemove', resize);
                document.removeEventListener('mouseup', stopResize);
            }
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
                if(e.target.closest('button')) return;

                if (win.classList.contains('maximized')) {
                    // Restore from maximized state when dragging header
                    win.classList.remove('maximized');

                    const rect = win.getBoundingClientRect();
                    const targetLeft = e.clientX - (rect.width / 2);

                    win.style.transform = 'none';
                    const naturalRect = win.getBoundingClientRect();

                    xOffset = targetLeft - naturalRect.left;
                    yOffset = 0; // Set to 0 to snap to top where the mouse is

                    setTranslate(xOffset, yOffset, win);

                    // Update initial mouse positions
                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;
                } else {
                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;
                }

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
}

// Initialize the OS
window.app = new LinuxOS();

class TerminalParser {
    constructor() {
        this.inputElement = document.getElementById('terminal-input');
        this.inputLine = document.getElementById('terminal-input-line');
        this.terminalContent = document.getElementById('terminal-content');

        if(this.inputElement) {
            this.setupListeners();
        }
    }

    setupListeners() {
        this.inputElement.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = this.inputElement.value.trim();
                this.executeCommand(command);
            }
        });

        // Focus input when clicking anywhere in terminal
        this.terminalContent.addEventListener('click', () => {
            // Check if there is text selected, don't focus if so
            if (window.getSelection().toString() === '') {
                this.inputElement.focus();
            }
        });
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

    executeCommand(command) {
        // Echo command
        const escapedCommand = this.escapeHTML(command);
        const echoHtml = `<p class="mb-2"><span class="text-green-400 font-bold">sebastian@adwaita</span>:<span class="text-blue-400 font-bold">~</span>$ ${escapedCommand}</p>`;

        // Output response
        let responseHtml = '';
        const args = command.split(' ').filter(Boolean);
        const cmd = args[0] ? args[0].toLowerCase() : '';

        switch(cmd) {
            case '':
                break;
            case 'help':
                responseHtml = `<p class="text-gray-100 mb-4">Comandos disponibles:<br>
                    - <span class="text-[#3584e4]">whoami</span>: Mostrar usuario actual<br>
                    - <span class="text-[#3584e4]">neofetch</span>: Mostrar información del sistema<br>
                    - <span class="text-[#3584e4]">ls</span>: Listar archivos<br>
                    - <span class="text-[#3584e4]">cat</span> [archivo]: Leer archivo<br>
                    - <span class="text-[#3584e4]">clear</span>: Limpiar terminal<br>
                    - <span class="text-[#3584e4]">open</span> [app]: Abrir aplicación (projects, skills, contact)</p>`;
                break;
            case 'whoami':
                responseHtml = `<p class="text-gray-100 mb-4">Sebastian Duran Caballero</p>`;
                break;
            case 'ls':
                responseHtml = `<p class="text-gray-100 mb-4 text-[#3584e4]">description.txt  projects/  skills/  contact/</p>`;
                break;
            case 'cat':
                if (args[1] === 'description.txt') {
                    responseHtml = `<p class="text-gray-100 mb-4">Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.</p>`;
                } else if (args[1]) {
                    responseHtml = `<p class="text-gray-100 mb-4">cat: ${this.escapeHTML(args[1])}: No existe el archivo o directorio</p>`;
                } else {
                    responseHtml = `<p class="text-gray-100 mb-4">Uso: cat [archivo]</p>`;
                }
                break;
            case 'open':
                if (args[1] && ['projects', 'skills', 'contact'].includes(args[1])) {
                    responseHtml = `<p class="text-gray-100 mb-4">Abriendo ${this.escapeHTML(args[1])}...</p>`;
                    if(window.app) {
                        window.app.openWindow(args[1]);
                    }
                } else {
                    responseHtml = `<p class="text-gray-100 mb-4">Aplicación no encontrada. Apps disponibles: projects, skills, contact</p>`;
                }
                break;
            case 'neofetch':
                responseHtml = `<div class="flex flex-col md:flex-row text-gray-100 mb-4">
                        <div class="mr-6 mb-4 md:mb-0 text-[#3584e4] text-xs sm:text-sm font-bold">
<pre>
         _,met$$$$$gg.
      ,g$$$$$$$$$$$$$$$P.
    ,g$$P"     \"\"\"Y$$.\".
   ,$$P'              \`$$$.
  ',$$P       ,ggs.     \`$$b:
  \`d$$'     ,$P\"'   .    $$$
   $$P      d$'     ,    $$P
   $$:      $$.   -    ,d$$'
   $$;      Y$b._   _,d$P'
   Y$$.    \`.\`\"Y$$$$P\"'
   \`$$b      \"-.__
    \`Y$$
     \`Y$$.
       \`$$b.
         \`Y$$b.
            \`\"Y$b._
                \`\"\"\"
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
                    </div>`;
                break;
            case 'clear':
                // Special case, empty container, re-add input line
                this.terminalContent.innerHTML = '';
                this.terminalContent.appendChild(this.inputLine);
                this.inputElement.value = '';
                this.inputElement.focus();
                return;
            default:
                responseHtml = `<p class="text-gray-100 mb-4">${this.escapeHTML(cmd)}: orden no encontrada. Escribe 'help' para ver los comandos.</p>`;
        }

        // Insert new content before input line
        this.inputLine.insertAdjacentHTML('beforebegin', echoHtml + responseHtml);

        // Reset input and scroll
        this.inputElement.value = '';
        this.terminalContent.scrollTop = this.terminalContent.scrollHeight;
    }
}

// Initialize terminal parser after DOM load
document.addEventListener('DOMContentLoaded', () => {
    new TerminalParser();
});
