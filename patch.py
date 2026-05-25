import re

with open('index.html', 'r') as f:
    content = f.read()

# 1. Add Login Screen overlay after body tag
login_screen_html = """
    <!-- Login Screen Overlay -->
    <div id="login-screen" class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#300a24] bg-opacity-95 transition-opacity duration-500 ease-in-out">
        <div class="flex flex-col items-center">
            <img src="images/profile.jpg" alt="Sebastian" class="w-32 h-32 rounded-full mb-6 border-4 border-gray-600 object-cover shadow-lg" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3135/3135715.png'">
            <h1 class="text-3xl font-ubuntu font-bold text-white mb-8">Sebastian Duran Caballero</h1>
            <div class="flex items-center bg-white/10 rounded-md overflow-hidden border border-white/20">
                <input type="password" id="login-password" placeholder="Contraseña" class="bg-transparent text-white px-4 py-2 outline-none w-48 font-ubuntu placeholder-gray-400" value="ubuntu" readonly>
                <button id="login-btn" class="bg-[#e95420] hover:bg-orange-600 px-4 py-2 text-white transition-colors" onclick="app.login()">
                    <i class="fas fa-arrow-right"></i>
                </button>
            </div>
            <p class="text-gray-400 mt-4 text-sm font-ubuntu">Click en la flecha para iniciar sesión</p>
        </div>
    </div>
"""
content = re.sub(r'<body[^>]*>', lambda m: m.group(0) + login_screen_html, content)


# 2. Modify Dock to be left-aligned (Ubuntu style)
old_dock = """    <!-- Dock -->
    <div class="absolute bottom-2 left-1/2 transform -translate-x-1/2 glass-dark rounded-2xl p-2 flex space-x-2 z-40 shadow-2xl">
        <div class="dock-icon w-12 h-12 flex items-center justify-center hover:bg-white/10 rounded-xl cursor-pointer transition-all hover:scale-110 group relative" onclick="app.toggleWindow('terminal')" id="dock-terminal" data-title="Terminal">
            <i class="fas fa-terminal text-2xl text-gray-200"></i>
            <!-- Dot indicator for open app -->
            <div class="absolute -bottom-1.5 w-1 h-1 bg-[#e95420] rounded-full hidden" id="dot-terminal"></div>
        </div>
        <div class="dock-icon w-12 h-12 flex items-center justify-center hover:bg-white/10 rounded-xl cursor-pointer transition-all hover:scale-110 group relative" onclick="app.toggleWindow('projects')" id="dock-projects" data-title="Proyectos">
            <i class="fas fa-folder text-2xl text-gray-200"></i>
            <div class="absolute -bottom-1.5 w-1 h-1 bg-[#e95420] rounded-full hidden" id="dot-projects"></div>
        </div>
        <div class="dock-icon w-12 h-12 flex items-center justify-center hover:bg-white/10 rounded-xl cursor-pointer transition-all hover:scale-110 group relative" onclick="app.toggleWindow('skills')" id="dock-skills" data-title="Habilidades">
            <i class="fas fa-cogs text-2xl text-gray-200"></i>
            <div class="absolute -bottom-1.5 w-1 h-1 bg-[#e95420] rounded-full hidden" id="dot-skills"></div>
        </div>
        <div class="dock-icon w-12 h-12 flex items-center justify-center hover:bg-white/10 rounded-xl cursor-pointer transition-all hover:scale-110 group relative" onclick="app.toggleWindow('contact')" id="dock-contact" data-title="Contacto">
            <i class="fas fa-envelope text-2xl text-gray-200"></i>
            <div class="absolute -bottom-1.5 w-1 h-1 bg-[#e95420] rounded-full hidden" id="dot-contact"></div>
        </div>
    </div>"""

new_dock = """    <!-- Left Dock (Ubuntu style) -->
    <div class="absolute left-0 top-7 bottom-0 w-14 bg-black/50 backdrop-blur-md flex flex-col items-center py-4 space-y-3 z-40 shadow-2xl border-r border-white/5">
        <div class="dock-icon w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-lg cursor-pointer transition-all group relative" onclick="app.toggleWindow('terminal')" id="dock-terminal" data-title="Terminal">
            <i class="fas fa-terminal text-xl text-gray-200"></i>
            <div class="absolute left-0 w-1 h-1 bg-[#e95420] rounded-full hidden transition-all duration-300" id="dot-terminal"></div>
        </div>
        <div class="dock-icon w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-lg cursor-pointer transition-all group relative" onclick="app.toggleWindow('projects')" id="dock-projects" data-title="Proyectos">
            <i class="fas fa-folder text-xl text-gray-200"></i>
            <div class="absolute left-0 w-1 h-1 bg-[#e95420] rounded-full hidden transition-all duration-300" id="dot-projects"></div>
        </div>
        <div class="dock-icon w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-lg cursor-pointer transition-all group relative" onclick="app.toggleWindow('skills')" id="dock-skills" data-title="Habilidades">
            <i class="fas fa-cogs text-xl text-gray-200"></i>
            <div class="absolute left-0 w-1 h-1 bg-[#e95420] rounded-full hidden transition-all duration-300" id="dot-skills"></div>
        </div>
        <div class="dock-icon w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-lg cursor-pointer transition-all group relative" onclick="app.toggleWindow('contact')" id="dock-contact" data-title="Contacto">
            <i class="fas fa-envelope text-xl text-gray-200"></i>
            <div class="absolute left-0 w-1 h-1 bg-[#e95420] rounded-full hidden transition-all duration-300" id="dot-contact"></div>
        </div>

        <!-- Dock Bottom section -->
        <div class="mt-auto pt-4 flex flex-col space-y-3 w-full items-center">
            <div class="w-8 h-px bg-white/20"></div>
            <div class="dock-icon w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-lg cursor-pointer transition-all group relative" data-title="Mostrar Aplicaciones">
                <i class="fas fa-th text-xl text-gray-200"></i>
            </div>
        </div>
    </div>"""

content = content.replace(old_dock, new_dock)


# 3. Adjust desktop margin to accommodate left dock
content = content.replace('<div id="desktop" class="relative w-full h-[calc(100vh-28px)] mt-7 z-10">', '<div id="desktop" class="relative ml-14 h-[calc(100vh-28px)] mt-7 z-10">')


# 4. Modify all window headers to move controls to the right (GNOME/Ubuntu default)
# and change controls look
old_controls = """                    <div class="flex space-x-2">
                        <button class="w-3.5 h-3.5 rounded-full bg-gray-500 hover:bg-gray-400 focus:outline-none flex items-center justify-center group" onclick="app.minimizeWindow('{id}')">
                            <span class="opacity-0 group-hover:opacity-100 text-black text-[8px] leading-none mb-1">-</span>
                        </button>
                        <button class="w-3.5 h-3.5 rounded-full bg-gray-500 hover:bg-gray-400 focus:outline-none flex items-center justify-center group" onclick="app.maximizeWindow('{id}')">
                            <span class="opacity-0 group-hover:opacity-100 text-black text-[8px] leading-none">□</span>
                        </button>
                        <button class="w-3.5 h-3.5 rounded-full bg-[#e95420] hover:bg-orange-600 focus:outline-none flex items-center justify-center group" onclick="app.closeWindow('{id}')">
                            <span class="opacity-0 group-hover:opacity-100 text-white text-[8px] leading-none">×</span>
                        </button>
                    </div>"""

new_controls = """                    <div class="flex space-x-3 ml-auto">
                        <button class="w-5 h-5 rounded-full hover:bg-white/10 focus:outline-none flex items-center justify-center transition-colors" onclick="app.minimizeWindow('{id}')">
                            <span class="text-white font-bold mb-1">-</span>
                        </button>
                        <button class="w-5 h-5 rounded-full hover:bg-white/10 focus:outline-none flex items-center justify-center transition-colors" onclick="app.maximizeWindow('{id}')">
                            <span class="text-white text-xs border border-white w-2.5 h-2.5 inline-block"></span>
                        </button>
                        <button class="w-5 h-5 rounded-full bg-[#e95420] hover:bg-orange-600 focus:outline-none flex items-center justify-center transition-colors" onclick="app.closeWindow('{id}')">
                            <span class="text-white text-sm font-bold">×</span>
                        </button>
                    </div>"""

for win_id in ['terminal', 'projects', 'skills', 'contact']:
    old_ctrl_rendered = old_controls.format(id=win_id)
    new_ctrl_rendered = new_controls.format(id=win_id)
    content = content.replace(old_ctrl_rendered, new_ctrl_rendered)

with open('index.html', 'w') as f:
    f.write(content)
