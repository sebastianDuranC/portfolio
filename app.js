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
        this.setupTopBarCalendar();
        this.setupContextMenu();
    }

    setupLogin() {
        const passwordInput = document.getElementById('login-password');
        if (passwordInput) {
            passwordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.login();
                }
            });
        }
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
            if(dateElement) dateElement.textContent = dateString;
        };

        updateClock();
        setInterval(updateClock, 1000);
    }

    setupTopBarCalendar() {
        const calendarMonthYear = document.getElementById('calendar-month-year');
        if(calendarMonthYear) {
            const now = new Date();
            const options = { month: 'long', year: 'numeric' };
            let title = now.toLocaleDateString('es-ES', options);
            calendarMonthYear.textContent = title.charAt(0).toUpperCase() + title.slice(1);
        }

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            const calendar = document.getElementById('calendar-dropdown');
            const systemTray = document.getElementById('system-tray-dropdown');
            const clockContainer = document.getElementById('clock-container');

            // Check if clicking outside calendar
            if (calendar && !calendar.classList.contains('hidden') && !calendar.contains(e.target) && (!clockContainer || !clockContainer.contains(e.target))) {
                calendar.classList.add('opacity-0');
                setTimeout(() => calendar.classList.add('hidden'), 200);
            }

            // System tray handled in toggle method for simplicity, but clicking outside closes it
            if (systemTray && !systemTray.classList.contains('hidden') && !systemTray.contains(e.target) && !e.target.closest('.fas.fa-network-wired')) {
                 systemTray.classList.add('opacity-0');
                 setTimeout(() => systemTray.classList.add('hidden'), 200);
            }
        });
    }

    setupContextMenu() {
        const desktop = document.getElementById('desktop');
        const contextMenu = document.getElementById('desktop-context-menu');

        if(desktop && contextMenu) {
            desktop.addEventListener('contextmenu', (e) => {
                e.preventDefault();

                // Hide if clicking on a window or icon
                if(e.target.closest('.os-window') || e.target.closest('.desktop-icon')) return;

                contextMenu.style.left = `${e.clientX}px`;
                contextMenu.style.top = `${e.clientY}px`;
                contextMenu.classList.remove('hidden');

                // small delay for transition
                setTimeout(() => {
                    contextMenu.classList.remove('opacity-0');
                }, 10);
            });

            document.addEventListener('click', () => {
                contextMenu.classList.add('opacity-0');
                setTimeout(() => {
                    contextMenu.classList.add('hidden');
                }, 100);
            });
        }
    }

    toggleCalendar(e) {
        if(e) e.stopPropagation();
        const calendar = document.getElementById('calendar-dropdown');
        const systemTray = document.getElementById('system-tray-dropdown');

        if (calendar) {
            if (calendar.classList.contains('hidden')) {
                // Close others
                if(systemTray) {
                    systemTray.classList.add('opacity-0');
                    systemTray.classList.add('hidden');
                }

                calendar.classList.remove('hidden');
                setTimeout(() => calendar.classList.remove('opacity-0'), 10);
            } else {
                calendar.classList.add('opacity-0');
                setTimeout(() => calendar.classList.add('hidden'), 200);
            }
        }
    }

    toggleSystemTray(e) {
        if(e) e.stopPropagation();
        const systemTray = document.getElementById('system-tray-dropdown');
        const calendar = document.getElementById('calendar-dropdown');

        if (systemTray) {
            if (systemTray.classList.contains('hidden')) {
                // Close others
                if(calendar) {
                    calendar.classList.add('opacity-0');
                    calendar.classList.add('hidden');
                }

                systemTray.classList.remove('hidden');
                setTimeout(() => systemTray.classList.remove('opacity-0'), 10);
            } else {
                systemTray.classList.add('opacity-0');
                setTimeout(() => systemTray.classList.add('hidden'), 200);
            }
        }
    }

    initTerminalTyping() {
        // Typing effect simulation
        const terminalCursor = document.getElementById('terminal-cursor');
        if(!terminalCursor) return;

        // This is a simple placeholder to show the concept is active
        // Full typing logic would manipulate the DOM lines sequentially
    }

    toggleAppLauncher() {
        const launcher = document.getElementById('app-launcher');
        const desktop = document.getElementById('desktop');
        const dock = document.getElementById('left-dock');

        if(launcher) {
            if(launcher.classList.contains('hidden')) {
                // Open
                launcher.classList.remove('hidden');
                // blur desktop
                if(desktop) desktop.classList.add('blur-sm');
                if(dock) dock.style.transform = 'translateX(-100%)';

                setTimeout(() => {
                    launcher.classList.remove('opacity-0');
                }, 10);
            } else {
                // Close
                launcher.classList.add('opacity-0');
                if(desktop) desktop.classList.remove('blur-sm');
                if(dock) dock.style.transform = 'none';

                setTimeout(() => {
                    launcher.classList.add('hidden');
                }, 300);
            }
        }
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

                    // Enforce boundaries
                    const rect = win.getBoundingClientRect();
                    const topBarHeight = 28;
                    const leftDockWidth = 56;

                    // Don't let header go above top bar
                    if (e.clientY < topBarHeight + 10) {
                         currentY = (topBarHeight + 10) - initialY - rect.height/2; // rough estimation
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