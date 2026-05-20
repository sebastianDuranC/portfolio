class LinuxOS {
    constructor() {
        this.windows = document.querySelectorAll('.os-window');
        this.highestZIndex = 100;
        this.openWindows = new Set();
        this.activeApp = null;
        this.activeAppNameEl = document.getElementById('active-app-name');
        
        this.init();
    }

    init() {
        this.setupClock();
        this.setupDraggableWindows();
        this.setupWindowClickToFront();

        // Initialize terminal typing effect tracking
        this.terminalTyped = false;
    }

    setupClock() {
        const dateElement = document.getElementById('topbar-date');
        
        const updateClock = () => {
            const now = new Date();
            const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            let dateString = now.toLocaleDateString('es-ES', options).replace(',', '');
            // Capitalize first letter of month
            dateString = dateString.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
            dateElement.textContent = dateString;
        };

        updateClock();
        setInterval(updateClock, 1000);
    }

    bringToFront(windowElement) {
        // Remove inactive class from this window, add to others
        this.windows.forEach(win => win.classList.add('inactive'));
        windowElement.classList.remove('inactive');

        this.highestZIndex++;
        windowElement.style.zIndex = this.highestZIndex;

        const appId = windowElement.getAttribute('data-id');
        this.activeApp = appId;

        // Update Top Bar active app name
        if(this.activeAppNameEl) {
            this.activeAppNameEl.textContent = windowElement.getAttribute('data-title') || 'Aplicación';
        }
    }

    setupWindowClickToFront() {
        this.windows.forEach(win => {
            win.addEventListener('mousedown', () => {
                this.bringToFront(win);
            });
        });

        // Desktop click resets active app
        document.getElementById('desktop').addEventListener('mousedown', (e) => {
            if(e.target.id === 'desktop' || e.target.id === 'windows-container') {
                this.windows.forEach(win => win.classList.add('inactive'));
                this.activeApp = null;
                if(this.activeAppNameEl) this.activeAppNameEl.textContent = 'Escritorio';
            }
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
                if(win.classList.contains('maximized')) return;

                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;
                    // Fix iframe dragging issue if any exist
                    win.style.pointerEvents = 'none';
                    header.style.pointerEvents = 'auto';
                }
            }

            function drag(e) {
                if (isDragging) {
                    e.preventDefault();

                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;

                    // Bounds checking (keep window header reachable)
                    const headerRect = header.getBoundingClientRect();
                    const topPanelHeight = 28;
                    const dockWidth = 64;

                    // Prevent dragging above top bar
                    if (currentY + win.offsetTop < 0) {
                        currentY = -win.offsetTop;
                    }

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
                win.style.pointerEvents = 'auto';
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

                setTimeout(() => {
                    win.classList.remove('window-opening');
                }, 200);

                this.bringToFront(win);
                this.openWindows.add(id);

                if(dot) dot.classList.remove('hidden');

                // Special handling for terminal
                if(id === 'terminal' && !this.terminalTyped) {
                    this.typeTerminal();
                    this.terminalTyped = true;
                }
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

            // If we closed the active window, update top bar
            if(this.activeApp === id) {
                if(this.activeAppNameEl) this.activeAppNameEl.textContent = 'Escritorio';
                this.activeApp = null;
            }
        }
    }

    minimizeWindow(id) {
        const win = document.getElementById(`window-${id}`);
        if (win) {
            win.classList.add('minimized');
            win.classList.add('inactive');

            // Re-evaluate active window
            if(this.activeApp === id) {
                if(this.activeAppNameEl) this.activeAppNameEl.textContent = 'Escritorio';
                this.activeApp = null;
            }
        }
    }

    maximizeWindow(id) {
        const win = document.getElementById(`window-${id}`);
        if (win) {
            win.classList.toggle('maximized');
            // Reset translation when maximized
            if(win.classList.contains('maximized')) {
                win.style.transform = 'none';
                this.bringToFront(win);
            } else {
                // Restore transform from before maximize
                // (relies on dragging logic keeping track of transform state)
                win.style.transform = '';
            }
        }
    }

    toggleWindow(id) {
        const win = document.getElementById(`window-${id}`);
        if(win && !win.classList.contains('hidden')) {
            if(win.classList.contains('minimized')) {
                this.openWindow(id);
            } else {
                if(parseInt(win.style.zIndex || 0) === this.highestZIndex && !win.classList.contains('inactive')) {
                    this.minimizeWindow(id);
                } else {
                    this.bringToFront(win);
                }
            }
        } else {
            this.openWindow(id);
        }
    }

    // Fake typing effect for terminal
    typeTerminal() {
        const cursor = document.getElementById('terminal-cursor');
        if(!cursor) return;

        const parent = cursor.parentNode;
        const textToType = "ls -la";
        let i = 0;

        const typeChar = () => {
            if (i < textToType.length) {
                const textNode = document.createTextNode(textToType.charAt(i));
                parent.insertBefore(textNode, cursor);
                i++;
                setTimeout(typeChar, Math.random() * 100 + 50);
            } else {
                setTimeout(() => {
                    const newLines = document.createElement('div');
                    newLines.innerHTML = `
                    <div class="text-gray-300 mb-2">
                        total 42<br>
                        drwxr-xr-x  2 sebastian sebastian 4096 May 20 10:00 .<br>
                        drwxr-xr-x  3 root      root      4096 May 20 10:00 ..<br>
                        -rw-r--r--  1 sebastian sebastian 1024 May 20 10:00 index.html<br>
                        -rw-r--r--  1 sebastian sebastian 2048 May 20 10:00 styles.css<br>
                        -rw-r--r--  1 sebastian sebastian 1536 May 20 10:00 app.js
                    </div>
                    <p class="mb-1"><span class="text-[#8ae234] font-bold">sebastian@ubuntu</span>:<span class="text-[#729fcf] font-bold">~</span>$ <span class="animate-pulse block w-2 h-4 bg-gray-200 inline-block align-middle"></span></p>
                    `;

                    cursor.remove();
                    parent.parentNode.appendChild(newLines);

                    // Scroll to bottom
                    const content = parent.closest('.window-content');
                    if(content) content.scrollTop = content.scrollHeight;
                }, 400);
            }
        };

        setTimeout(typeChar, 600);
    }
}

// Initialize the OS
const app = new LinuxOS();