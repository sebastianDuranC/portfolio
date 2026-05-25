import re

with open('index.html', 'r') as f:
    content = f.read()

# Update top bar styling
old_topbar = """    <!-- Top Bar -->
    <div class="top-bar w-full h-7 bg-black/80 backdrop-blur-md flex justify-between items-center px-4 z-50 fixed top-0 text-sm font-ubuntu shadow-sm text-gray-200">
        <div class="flex items-center space-x-4">
            <span class="hover:bg-white/10 px-2 py-0.5 rounded-sm cursor-pointer transition-colors font-medium">Actividades</span>
        </div>
        <div class="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center cursor-pointer hover:bg-white/10 px-3 rounded-sm transition-colors" id="clock-container">
            <span id="topbar-date" class="font-medium text-[13px]"></span>
        </div>
        <div class="flex items-center space-x-3 cursor-pointer hover:bg-white/10 px-2 py-0.5 rounded-sm transition-colors">
            <i class="fas fa-network-wired text-[10px]"></i>
            <i class="fas fa-volume-up text-[10px]"></i>
            <i class="fas fa-battery-full text-[10px]"></i>
            <i class="fas fa-caret-down text-[10px] ml-1"></i>
        </div>
    </div>"""

new_topbar = """    <!-- Top Bar (GNOME style) -->
    <div class="top-bar w-full h-7 bg-black/90 flex justify-between items-center px-3 z-50 fixed top-0 text-[13px] font-ubuntu font-medium text-gray-100 select-none">
        <div class="flex items-center h-full">
            <span class="hover:bg-white/10 px-3 h-full flex items-center rounded-full cursor-pointer transition-colors">Actividades</span>
        </div>
        <div class="absolute left-1/2 transform -translate-x-1/2 flex items-center cursor-pointer hover:bg-white/10 px-3 h-full rounded-full transition-colors" id="clock-container">
            <span id="topbar-date"></span>
        </div>
        <div class="flex items-center space-x-3 h-full cursor-pointer hover:bg-white/10 px-3 rounded-full transition-colors">
            <i class="fas fa-network-wired text-xs"></i>
            <i class="fas fa-volume-up text-xs"></i>
            <i class="fas fa-battery-full text-xs"></i>
            <i class="fas fa-caret-down text-xs ml-1"></i>
        </div>
    </div>"""

content = content.replace(old_topbar, new_topbar)

with open('index.html', 'w') as f:
    f.write(content)
