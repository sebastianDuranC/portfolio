import re

with open('styles.css', 'r') as f:
    content = f.read()

# Update dock tooltip for left-side orientation
old_tooltip = """/* Tooltip for dock */
.dock-icon:hover::after {
    content: attr(data-title);
    position: absolute;
    bottom: calc(100% + 10px);
    left: 50%;
    transform: translateX(-50%);
    background: rgba(17, 17, 17, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: white;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 12px;
    white-space: nowrap;
    pointer-events: none;
    font-family: 'Ubuntu', sans-serif;
    z-index: 50;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.dock-icon::after {
    content: '';
    position: absolute;
    bottom: calc(100% + 5px);
    left: 50%;
    transform: translateX(-50%) translateY(10px);
    opacity: 0;
    transition: opacity 0.2s, transform 0.2s;
}

.dock-icon:hover::after {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
}"""

new_tooltip = """/* Tooltip for left dock */
.dock-icon:hover::after {
    content: attr(data-title);
    position: absolute;
    left: calc(100% + 10px);
    top: 50%;
    transform: translateY(-50%);
    background: rgba(17, 17, 17, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: white;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 13px;
    white-space: nowrap;
    pointer-events: none;
    font-family: 'Ubuntu', sans-serif;
    z-index: 50;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.dock-icon::after {
    content: '';
    position: absolute;
    left: calc(100% + 5px);
    top: 50%;
    transform: translateY(-50%) translateX(-10px);
    opacity: 0;
    transition: opacity 0.2s, transform 0.2s;
}

.dock-icon:hover::after {
    opacity: 1;
    transform: translateY(-50%) translateX(0);
}

/* Little triangle for tooltip */
.dock-icon:hover::before {
    content: '';
    position: absolute;
    left: calc(100% + 4px);
    top: 50%;
    transform: translateY(-50%);
    border-width: 6px 6px 6px 0;
    border-style: solid;
    border-color: transparent rgba(17, 17, 17, 0.95) transparent transparent;
    z-index: 50;
}"""

content = content.replace(old_tooltip, new_tooltip)

with open('styles.css', 'w') as f:
    f.write(content)
