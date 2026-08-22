class LinuxOS {
    constructor() {
        this.windows = document.querySelectorAll('.os-window');
        this.highestZIndex = 100;
        this.openWindows = new Set();
        this.terminalTyped = false;
        
        this.init();
    }

    init() {
        this.setupClock();
        this.setupDraggableWindows();
        this.setupResizableWindows();
        this.setupWindowClickToFront();
        this.setupLogin();

        // Expose globally
        window.app = this;
    }

    setupLogin() {
        const passwordInput = document.getElementById('login-password');
        const loginBtn = document.getElementById('login-btn');

        if (passwordInput) {
            passwordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.login();
                }
            });
            passwordInput.focus();
        }

        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.login());
        }

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
                this.openWindow('terminal');
            }, 500);
        }
    }

    setupClock() {
        const dateElement = document.getElementById('topbar-date');
        if(!dateElement) return;
        
        const updateClock = () => {
            const now = new Date();
            const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            let dateString = now.toLocaleDateString('es-ES', options).replace(',', '');
            dateString = dateString.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
            dateElement.textContent = dateString;
        };

        updateClock();
        setInterval(updateClock, 1000);
    }

    bringToFront(windowElement) {
        this.highestZIndex++;
        windowElement.style.zIndex = this.highestZIndex;

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

            function dragEnd(e) {
                initialX = currentX;
                initialY = currentY;
                isDragging = false;
            }

            // Expose for maximization reset
            win.resetDragOffset = () => {
                xOffset = 0;
                yOffset = 0;
                setTranslate(0, 0, win);
            }

            function setTranslate(xPos, yPos, el) {
                el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
            }
        });
    }

    setupResizableWindows() {
        this.windows.forEach(win => {
            const resizers = win.querySelectorAll('.resizer');
            let isResizing = false;
            let currentResizer;
            let originalWidth;
            let originalHeight;
            let originalMouseX;
            let originalMouseY;

            resizers.forEach(resizer => {
                resizer.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    if(win.classList.contains('maximized')) return;
                    isResizing = true;
                    currentResizer = resizer;
                    originalWidth = parseFloat(getComputedStyle(win, null).getPropertyValue('width').replace('px', ''));
                    originalHeight = parseFloat(getComputedStyle(win, null).getPropertyValue('height').replace('px', ''));
                    originalMouseX = e.pageX;
                    originalMouseY = e.pageY;
                    document.addEventListener('mousemove', resize);
                    document.addEventListener('mouseup', stopResize);
                });
            });

            function resize(e) {
                if (!isResizing) return;
                if (currentResizer.classList.contains('resizer-br')) {
                    win.style.width = originalWidth + (e.pageX - originalMouseX) + 'px';
                    win.style.height = originalHeight + (e.pageY - originalMouseY) + 'px';
                } else if (currentResizer.classList.contains('resizer-r')) {
                    win.style.width = originalWidth + (e.pageX - originalMouseX) + 'px';
                } else if (currentResizer.classList.contains('resizer-b')) {
                    win.style.height = originalHeight + (e.pageY - originalMouseY) + 'px';
                }
            }

            function stopResize() {
                isResizing = false;
                document.removeEventListener('mousemove', resize);
                document.removeEventListener('mouseup', stopResize);
            }
        });
    }

    typeTerminalEffect() {
        if(this.terminalTyped) return;
        this.terminalTyped = true;

        const output = document.getElementById('terminal-output');
        if(!output) return;

        const asciiArt = `
       _       _
      (_)     | |
       _ _   _| | ___  ___
      | | | | | |/ _ \\/ __|
      | | |_| | |  __/\\__ \\
      | |\\__,_|_|\\___||___/
     _/ |
    |__/

`;

        const info = `
OS: Ubuntu 24.04 LTS x86_64
Host: Portfolio Web 1.0
Kernel: 6.8.0-linux-web
Uptime: 24 mins
Packages: 1530 (dpkg)
Shell: bash 5.2.21
Resolution: ${window.innerWidth}x${window.innerHeight}
DE: GNOME 46
WM: Mutter
Theme: Yaru-dark [GTK2/3]
Terminal: gnome-terminal
CPU: Intel i7-10750H (12) @ 5.000GHz
Memory: 3241MiB / 15830MiB

Bienvenido al portafolio de Sebastian Duran Caballero.
Desarrollador Web .NET con pasión por el código limpio y arquitecturas robustas.
Explora mis proyectos, habilidades y contacta conmigo usando las aplicaciones en el dock.
`;

        let charIndex = 0;
        let isTypingInfo = false;
        let fullText = asciiArt;

        // Output ASCII immediately
        output.textContent = asciiArt;

        const typeChar = () => {
            if (charIndex < info.length) {
                output.textContent = asciiArt + info.substring(0, charIndex + 1);
                charIndex++;
                setTimeout(typeChar, 10);
            }
        };

        setTimeout(typeChar, 300);
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

                if(id === 'terminal') {
                    this.typeTerminalEffect();
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
                // Remove custom sizing for maximization
                win.dataset.prevWidth = win.style.width;
                win.dataset.prevHeight = win.style.height;
                win.style.width = '';
                win.style.height = '';

                win.classList.add('maximized');
                // Temporarily disable transform to fix positioning relative to desktop container
                win.style.transform = 'none';
            } else {
                win.classList.remove('maximized');
                if(win.dataset.prevWidth) win.style.width = win.dataset.prevWidth;
                if(win.dataset.prevHeight) win.style.height = win.dataset.prevHeight;
                if(win.resetDragOffset) win.resetDragOffset();
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

document.addEventListener('DOMContentLoaded', () => {
    new LinuxOS();
});
