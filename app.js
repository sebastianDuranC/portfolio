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
        this.setupWindowResizing();
    }


    setupWindowResizing() {
        let isResizing = false;
        let currentResizer = null;
        let currentWindow = null;
        let startX, startY, startWidth, startHeight;

        document.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('resizer')) {
                isResizing = true;
                currentResizer = e.target;
                currentWindow = e.target.closest('.os-window');

                startX = e.clientX;
                startY = e.clientY;

                const rect = currentWindow.getBoundingClientRect();
                startWidth = rect.width;
                startHeight = rect.height;

                // Prevent bringing to front from triggering drag by stopping propagation
                e.preventDefault();
                this.bringToFront(currentWindow);
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;

            if (currentWindow.classList.contains('maximized')) return;

            let newWidth = startWidth;
            let newHeight = startHeight;

            if (currentResizer.classList.contains('resizer-r') || currentResizer.classList.contains('resizer-br')) {
                newWidth = startWidth + (e.clientX - startX);
                currentWindow.style.width = `${newWidth}px`;
            }

            if (currentResizer.classList.contains('resizer-b') || currentResizer.classList.contains('resizer-br')) {
                newHeight = startHeight + (e.clientY - startY);
                currentWindow.style.height = `${newHeight}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            isResizing = false;
            currentResizer = null;
            currentWindow = null;
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


            let isMaximizedRestoreDrag = false;

            function dragStart(e) {
                if(e.target.closest('button')) return;

                if (e.target === header || header.contains(e.target)) {
                    isDragging = true;

                    if(win.classList.contains('maximized')) {
                        isMaximizedRestoreDrag = true;
                    } else {
                        isMaximizedRestoreDrag = false;
                    }

                    // Memory constraint: temporarily set transform to 'none' before getBoundingClientRect
                    const prevTransform = win.style.transform;
                    win.style.transform = 'none';
                    const rect = win.getBoundingClientRect();

                    // We also need to restore it right after capturing if it wasn't maximized
                    if (!isMaximizedRestoreDrag) {
                        win.style.transform = prevTransform;
                        // Calculate initial offset based on mouse position and the current window translation
                        initialX = e.clientX - xOffset;
                        initialY = e.clientY - yOffset;
                    } else {
                        // If it is maximized, we will restore it, so we need to calculate where to grab it.
                        // We will unmaximize it in the first 'drag' event.
                        // But we capture initialX/Y now as if it had no transform, since we just set it to 'none'
                        // Actually, if we are restoring from maximized, we don't have an xOffset/yOffset yet (they are 0 or from before).
                        // Let's just capture the mouse relative to the top-left of the untransformed window.
                        initialX = e.clientX - xOffset;
                        initialY = e.clientY - yOffset;
                    }
                }
            }

            let snapPreview = null;

            function drag(e) {
                if (isDragging) {
                    e.preventDefault();

                    if (isMaximizedRestoreDrag) {
                        isMaximizedRestoreDrag = false;
                        win.classList.remove('maximized');
                        // Calculate new xOffset so the window center is at mouse X, but keep Y relative to header
                        const rect = win.getBoundingClientRect();
                        const newWidth = parseInt(win.style.width) || rect.width;
                        xOffset = e.clientX - (newWidth / 2);
                        yOffset = e.clientY - 20; // grab it by the header
                        initialX = e.clientX - xOffset;
                        initialY = e.clientY - yOffset;
                    }

                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;

                    xOffset = currentX;
                    yOffset = currentY;

                    setTranslate(currentX, currentY, win);

                    // Snap preview logic
                    if (e.clientY <= 28) {
                        if (!snapPreview) {
                            snapPreview = document.createElement('div');
                            snapPreview.className = 'maximized-snap-preview';
                            document.getElementById('windows-container').appendChild(snapPreview);
                        }
                    } else {
                        if (snapPreview) {
                            snapPreview.remove();
                            snapPreview = null;
                        }
                    }
                }
            }

            function setTranslate(xPos, yPos, el) {
                el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
            }

            function dragEnd(e) {
                initialX = currentX;
                initialY = currentY;
                isDragging = false;

                if (snapPreview) {
                    snapPreview.remove();
                    snapPreview = null;
                    if (e.clientY <= 28 && !win.classList.contains('maximized')) {
                        // trigger maximization
                        // Since we are maximizing via drag, we need to save the transform so it can be restored
                        // Or we can just call our app.maximizeWindow logic
                        app.maximizeWindow(win.dataset.id);
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
const app = new LinuxOS();