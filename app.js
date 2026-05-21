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

                // Don't drag if maximized
                if(win.classList.contains('maximized')) return;

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
                initialX = currentX;
                initialY = currentY;
                isDragging = false;
            }
        });
    }

    openWindow(id) {
        const win = document.getElementById(`window-${id}`);
        const dot = document.getElementById(`dot-${id}`);
        const icon = document.getElementById(`dock-${id}`);
        
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

                if(dot) {
                    dot.classList.remove('hidden');
                }
                if(icon) {
                    icon.classList.add('bg-white/10');
                }

                // Trigger typing effect for terminal only on first open
                if (id === 'terminal' && !this.terminalTyped) {
                    this.typeTerminalContent();
                    this.terminalTyped = true;
                }
            } else {
                this.bringToFront(win);
            }
        }
    }

    typeTerminalContent() {
        const contentDiv = document.getElementById('terminal-content');
        const promptDiv = document.getElementById('terminal-prompt');
        if (!contentDiv || !promptDiv) return;

        contentDiv.innerHTML = '';
        promptDiv.style.display = 'none';

        const commands = [
            { cmd: 'whoami', out: 'Sebastian Duran Caballero' },
            { cmd: 'cat description.txt', out: 'Hola, soy un Desarrollador web apasionado por crear experiencias digitales únicas y funcionales. Especializado en el desarrollo web con .NET.' },
            { cmd: 'neofetch', out: `<div class="flex flex-col md:flex-row text-gray-100 mb-4 mt-2">
                <div class="mr-6 mb-4 md:mb-0 text-[#e95420] text-xs sm:text-sm font-bold">
<pre>
       _,-/&#x60;--,-/\\-,
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
            </div>` }
        ];

        let i = 0;

        const typeCommand = () => {
            if (i >= commands.length) {
                promptDiv.style.display = 'block';
                const terminalWin = document.querySelector('#window-terminal .window-content');
                if (terminalWin) terminalWin.scrollTop = terminalWin.scrollHeight;
                return;
            }

            const line = document.createElement('div');
            line.className = 'mb-2';
            line.innerHTML = `<span class="text-green-400 font-bold">sebastian@ubuntu</span>:<span class="text-blue-400 font-bold">~</span>$ `;
            contentDiv.appendChild(line);

            let charIndex = 0;
            const cmdText = commands[i].cmd;

            const typeChar = () => {
                if (charIndex < cmdText.length) {
                    line.innerHTML += cmdText.charAt(charIndex);
                    charIndex++;
                    setTimeout(typeChar, 50); // typing speed
                } else {
                    setTimeout(() => {
                        const outDiv = document.createElement('div');
                        outDiv.className = 'text-gray-100 mb-4';
                        outDiv.innerHTML = commands[i].out;
                        contentDiv.appendChild(outDiv);
                        i++;
                        setTimeout(typeCommand, 300);

                        const terminalWin = document.querySelector('#window-terminal .window-content');
                        if (terminalWin) terminalWin.scrollTop = terminalWin.scrollHeight;
                    }, 200);
                }
            };

            typeChar();
        };

        setTimeout(typeCommand, 500);
    }

    closeWindow(id) {
        const win = document.getElementById(`window-${id}`);
        const dot = document.getElementById(`dot-${id}`);
        const icon = document.getElementById(`dock-${id}`);
        
        if (win) {
            win.classList.add('hidden');
            win.classList.remove('maximized');

            this.openWindows.delete(id);
            if(dot) {
                dot.classList.add('hidden');
            }
            if(icon) {
                icon.classList.remove('bg-white/10');
            }
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
            win.classList.toggle('maximized');
            // Reset translation when maximized
            if(win.classList.contains('maximized')) {
                win.style.transform = 'none';
            }
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