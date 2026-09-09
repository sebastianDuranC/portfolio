### Plan

1. **Update Fonts and Theme Colors (HTML & CSS)**
   - Replace the 'Ubuntu' font with 'Cantarell' in `index.html` and `styles.css`.
   - Remove Ubuntu-specific purple and orange colors (e.g., `#e95420`, `#300a24`) and replace them with GNOME Adwaita Dark colors (e.g., dark grays `#242424`, `#1e1e1e`, and accent blue `#3584e4`).
   - Change the login screen background and wallpaper to a GNOME-style background.
   - Update terminal prompt to `sebastian@adwaita: ~`.

2. **Update Layout and Taskbar (HTML & CSS)**
   - Adjust the Top Bar height to 28px (`h-7`).
   - Add a Bottom Taskbar of 56px (`h-14`) mimicking GNOME 40+ dash. Move the app dock icons to this bottom taskbar.
   - Modify the desktop container to fill the space between the top bar and the bottom taskbar: `h-[calc(100vh-28px-56px)] mt-[28px]`.
   - Update the `.maximized` CSS class to `top: 0 !important; left: 0 !important; width: 100% !important; height: 100% !important;` so it exactly fits the desktop area.
   - Use Tailwind width and height classes (e.g., `w-[80%] h-[70%] min-w-[300px]`) for the `.os-window` elements.

3. **Add Window Resizing and Snap Features (HTML & JS)**
   - Add resize handles (`.resizer` for right, bottom, and bottom-right) to all `.os-window` elements.
   - Implement resizing logic in `app.js` using mouse event listeners on the resizers.
   - Update window dragging logic in `app.js` to implement GNOME 'aero snap': dragging a window to the top edge maximizes it.
   - Ensure restoring a maximized window via drag smoothly transitions by recalculating `xOffset` and `yOffset` based on `getBoundingClientRect()`.

4. **Implement Interactive Terminal (HTML & JS)**
   - Ensure the terminal window is pre-populated with `whoami` and `neofetch` output to show personal information right away.
   - Create a `TerminalParser` class in `app.js` to handle interactive commands: `help`, `whoami`, `clear`, `ls`, `neofetch`, `cat`, and `open`.
   - Add an input field to the terminal to capture user input, safely escaping the input to prevent XSS (using `textContent`).

5. **Pre-commit Steps**
   - Run verification and pre-commit checks to ensure the application works as intended and all design paradigms are correctly applied without regressions.

6. **Submit**
   - Submit the changes.
