import re

with open("app.js", "r") as f:
    content = f.read()

# Fix drag to restore offset bug in app.js
# The old logic:
# const targetX = mouseX - desktopRect.left - (winRect.width / 2);
# const targetY = mouseY - desktopRect.top - 15;
# xOffset = targetX;
# yOffset = targetY;

# The fixed logic: Calculate relative to the top left corner of where the element naturally is
# In dragging maximized to normal, we want to center the window under the mouse
# We need to compute the translate values relative to the initial CSS left/top values.
# win.offsetLeft and win.offsetTop give us its position relative to the nearest positioned ancestor (desktop)

new_logic = """
                        // Recalculate offsets based on where the mouse is relative to the restored window
                        const desktopRect = desktop.getBoundingClientRect();
                        const winRect = win.getBoundingClientRect();

                        const mouseX = e.clientX;
                        const mouseY = e.clientY;

                        // We want to center the window horizontally under the cursor, but offset vertically a bit
                        const targetLeft = mouseX - (winRect.width / 2);
                        const targetTop = mouseY - 15;

                        // Calculate transform values based on current offsetLeft/offsetTop
                        const rectLeft = win.offsetLeft + desktopRect.left;
                        const rectTop = win.offsetTop + desktopRect.top;

                        xOffset = targetLeft - rectLeft;
                        yOffset = targetTop - rectTop;

                        initialX = mouseX - xOffset;
                        initialY = mouseY - yOffset;
"""

# Replace the specific block of code for restoring
pattern = r"                        // Recalculate offsets based on where the mouse is relative to the restored window.*?initialY = e.clientY - yOffset;"
content = re.sub(pattern, new_logic.strip('\n'), content, flags=re.DOTALL)

with open("app.js", "w") as f:
    f.write(content)
