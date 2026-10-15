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
        this.setupResizers();
    }

    setupResizers() {
        const resizers = document.querySelectorAll('.resizer');

        resizers.forEach(resizer => {
            let isResizing = false;
            let currentResizer;
            let currentWindow;
            let initialX, initialY, initialWidth, initialHeight;

            resizer.addEventListener('mousedown', (e) => {
                isResizing = true;
                currentResizer = e.target;
                currentWindow = currentResizer.closest('.os-window');

                initialX = e.clientX;
                initialY = e.clientY;

                const rect = currentWindow.getBoundingClientRect();
                initialWidth = rect.width;
                initialHeight = rect.height;

                // Bring to front
                this.bringToFront(currentWindow);

                // Disable transition during resize
                currentWindow.style.transition = 'none';

                document.addEventListener('mousemove', resize);
                document.addEventListener('mouseup', stopResize);
            });

            const resize = (e) => {
                if (!isResizing) return;

                if (currentResizer.classList.contains('right') || currentResizer.classList.contains('bottom-right')) {
                    const width = initialWidth + (e.clientX - initialX);
                    currentWindow.style.width = `${width}px`;
                }

                if (currentResizer.classList.contains('bottom') || currentResizer.classList.contains('bottom-right')) {
                    const height = initialHeight + (e.clientY - initialY);
                    currentWindow.style.height = `${height}px`;
                }
            };

            const stopResize = () => {
                isResizing = false;
                if(currentWindow) {
                    currentWindow.style.transition = '';
                }
                document.removeEventListener('mousemove', resize);
                document.removeEventListener('mouseup', stopResize);
            };
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

            const dragStart = (e) => {
                // Don't drag if maximizing/closing buttons are clicked
                if(e.target.closest('button')) return;

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;
                    this.bringToFront(win);

                    if (win.classList.contains('maximized')) {
                        // Restore and start dragging
                        win.classList.remove('maximized');
                        win.style.transform = 'none';

                        // Calculate offset relative to mouse position to avoid jumping
                        const rectLeft = win.getBoundingClientRect().left;
                        const headerRect = header.getBoundingClientRect();

                        // The relative percentage of where the user clicked on the header
                        const clickPercentageX = (e.clientX - headerRect.left) / headerRect.width;

                        // The new window width will be the width it had before maximizing.
                        // But we don't know it since we didn't save it and we rely on css classes.
                        // However, we can just position it so the cursor stays where it clicked
                        // relative to the unmaximized width. Let's just use the current rect after unmaximizing.

                        const newRectLeft = win.getBoundingClientRect().left;

                        xOffset = newRectLeft;
                        yOffset = e.clientY - header.getBoundingClientRect().height / 2; // Grab from top area roughly

                        // Actually, just let's set the target translation based on cursor

                        // Wait, a simpler fix is what was requested in memory:
                        // "recalculate xOffset based on targetLeft - rectLeft to prevent positioning jumps."

                        // A simpler fix following memory: recalculate xOffset based on targetLeft - rectLeft
                        const unmaximizedRect = win.getBoundingClientRect();
                        const targetLeft = e.clientX - (clickPercentageX * unmaximizedRect.width);

                        xOffset = targetLeft - rectLeft;
                        yOffset = e.clientY - rectLeft; // this is just roughly the Y
                        // Actually, yOffset should be near 0 relative to header top.
                        yOffset = 0;
                        // Wait, it is better to just set xOffset to the position we want the window at minus its static layout position

                        // We will compute xOffset based on `e.clientX - unmaximizedRect.left` but preserving the relative click point.

                        // Correct calculation:
                        const layoutLeft = unmaximizedRect.left - (win.style.transform ? new DOMMatrixReadOnly(win.style.transform).m41 : 0);
                        const layoutTop = unmaximizedRect.top - (win.style.transform ? new DOMMatrixReadOnly(win.style.transform).m42 : 0);

                        xOffset = targetLeft - layoutLeft;
                        yOffset = e.clientY - layoutTop - (e.clientY - headerRect.top); // keeping Y relative to cursor

                        initialX = e.clientX - xOffset;
                        initialY = e.clientY - yOffset;
                        setTranslate(xOffset, yOffset, win);
                    } else {
                        initialX = e.clientX - xOffset;
                        initialY = e.clientY - yOffset;
                    }
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

            const setTranslate = (xPos, yPos, el) => {
                el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
            };

            const dragEnd = (e) => {
                if (!isDragging) return;
                initialX = currentX;
                initialY = currentY;
                isDragging = false;

                // Aero snap to top
                if (e.clientY <= 0) {
                    this.maximizeWindow(win.dataset.id);
                }
            };

            header.addEventListener('mousedown', dragStart);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', dragEnd);
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
const app = new LinuxOS();