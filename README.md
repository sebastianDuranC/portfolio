# Mi Portafolio - Desarrollador Web

Un portafolio interactivo y moderno que simula el entorno de escritorio de un sistema operativo Linux (estilo Ubuntu/GNOME), construido con HTML, Tailwind CSS y Vanilla JavaScript.

## 🚀 Características

- **Interfaz de Sistema Operativo**: Diseño basado en un entorno de escritorio clásico de Linux, con barra superior y dock lateral.
- **Gestión de Ventanas**: Ventanas arrastrables que se pueden minimizar, maximizar y cerrar, tal como en un sistema real.
- **Pantalla de Inicio de Sesión**: Simula la pantalla de login (GDM) con fondo difuminado al iniciar el portafolio.
- **Metáforas de Aplicaciones**: Las secciones de contenido se muestran como aplicaciones (Terminal, Explorador de Archivos, Configuración, Cliente de Correo).
- **Animaciones Suaves**: Transiciones CSS para abrir, cerrar y organizar ventanas.
- **Diseño Personalizado**: Implementado íntegramente con utilidades de Tailwind CSS y JavaScript sin depender de frameworks complejos.

## 📁 Estructura del Proyecto

```
Portafolio/
├── index.html          # Página principal
├── app.js             # Funcionalidad JavaScript
├── images/            # Carpeta para imágenes de habilidades
│   ├── html5.png
│   ├── css3.png
│   ├── javascript.png
│   ├── react.png
│   ├── git.png
│   ├── github.png
│   └── .NET.png
└── README.md          
```

## 📱 Funcionalidades

### Gestor de Ventanas
- Arrastre libre de ventanas por la pantalla.
- Opción de maximizar para ocupar el escritorio disponible.
- Sistema de capas (z-index) para poner en primer plano la ventana activa.
- Minimizar al dock lateral.

### Navegación
- Interacción a través de iconos en el dock y la barra superior.
- Pantalla de bienvenida / bloqueo interactiva.