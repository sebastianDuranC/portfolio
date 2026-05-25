with open('index.html', 'r') as f:
    content = f.read()

# Update terminal window header bg
content = content.replace(
    '<div class="window-header h-10 bg-gray-800/90 flex justify-between items-center px-4 cursor-grab active:cursor-grabbing select-none border-b border-black/50 backdrop-blur-md">',
    '<div class="window-header h-10 bg-[#2b2b2b] flex justify-between items-center px-4 cursor-grab active:cursor-grabbing select-none border-b border-black/50">'
)

# Fix close window controls ml-auto
content = content.replace('<div class="flex space-x-2">', '<div class="flex space-x-3 ml-auto">')

# Refine desktop icons styling (add text shadow)
content = content.replace(
    '<span class="text-xs mt-2 bg-black/60 px-2 py-0.5 rounded-md text-center shadow-sm font-ubuntu text-gray-100 backdrop-blur-sm border border-white/10">Terminal</span>',
    '<span class="text-xs mt-2 text-center font-ubuntu text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">Terminal</span>'
)
content = content.replace(
    '<span class="text-xs mt-2 bg-black/60 px-2 py-0.5 rounded-md text-center shadow-sm font-ubuntu text-gray-100 backdrop-blur-sm border border-white/10">Proyectos</span>',
    '<span class="text-xs mt-2 text-center font-ubuntu text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">Proyectos</span>'
)
content = content.replace(
    '<span class="text-xs mt-2 bg-black/60 px-2 py-0.5 rounded-md text-center shadow-sm font-ubuntu text-gray-100 backdrop-blur-sm border border-white/10">Habilidades</span>',
    '<span class="text-xs mt-2 text-center font-ubuntu text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">Habilidades</span>'
)
content = content.replace(
    '<span class="text-xs mt-2 bg-black/60 px-2 py-0.5 rounded-md text-center shadow-sm font-ubuntu text-gray-100 backdrop-blur-sm border border-white/10">Contacto</span>',
    '<span class="text-xs mt-2 text-center font-ubuntu text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">Contacto</span>'
)

with open('index.html', 'w') as f:
    f.write(content)
