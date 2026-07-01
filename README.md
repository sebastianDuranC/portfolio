# Mi Portafolio - Sebastian Duran Caballero

Un portafolio interactivo, inmersivo y temático estilo Sistema Operativo Linux (GNOME/Ubuntu Desktop). Construido con HTML, Tailwind CSS y JavaScript Vanilla (sin frameworks pesados).

## 🚀 Características

- **Interfaz de Sistema Operativo**: Simula una experiencia de escritorio Linux moderna.
- **Ventanas Interactivas**: Arrastrables, redimensionables y con "Aero Snap" en los bordes superiores.
- **Terminal Funcional**: Línea de comandos interactiva con comandos simulados (e.g., `help`, `whoami`, `neofetch`, `clear`).
- **Diseño Responsivo y Glassmorphism**: Uso de Tailwind para un diseño difuminado y moderno.
- **Dock de Aplicaciones**: Barra lateral izquierda al estilo Ubuntu para abrir aplicaciones (Proyectos, Sobre Mí, Habilidades, Contacto).
- **Pantalla de Inicio de Sesión**: Simula la pantalla de bloqueo de GDM de GNOME.

## 📁 Estructura del Proyecto

```
Portafolio/
├── index.html         # Página principal y estructura del DOM
├── app.js             # Lógica del SO, gestión de ventanas y terminal interactiva
├── styles.css         # Estilos personalizados, animaciones y glassmorphism
├── images/            # Carpeta para imágenes e iconos de tecnologías
└── README.md          # Documentación
```

## 📱 Funcionalidades

### Gestor de Ventanas
- Arrastre fluido haciendo clic en la barra superior.
- Redimensionamiento manual usando controles en los bordes y esquinas.
- Maximización automática al arrastrar la ventana hacia el borde superior de la pantalla ("Aero Snap").
- Sistema de capas dinámico (z-index) para superponer ventanas activas.

### Aplicaciones Integradas
- **Terminal**: Interactúa con el sistema mediante comandos para saber más sobre mí.
- **Archivos (Nautilus)**: Un explorador para ver los proyectos en los que he trabajado.
- **Configuración**: Muestra las habilidades y el stack tecnológico.
- **Correo**: Formulario de contacto estilizado como un cliente de correo electrónico.