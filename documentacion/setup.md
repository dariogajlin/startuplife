# Startup Life - Setup Guide

## Quick Start (Web Version)

1. Abrir `web/index.html` en Chrome o Edge
2. ¡Listo! El juego corre directamente en el navegador

## Cómo Jugar

- **Menú principal**: Elige cantidad de jugadores y jugadores IA, luego presiona JUGAR
- **Dado**: Haz clic en cualquier lugar o presiona Espacio para lanzar
- **Ruleta**: Haz clic para girar
- **Decisiones**: Haz clic en la opción que prefieras

## Webcam (Gestos)

La webcam se activa automáticamente al iniciar. Gestos disponibles:

- **Lanzar dado**: Movimiento rápido hacia abajo (simular lanzamiento)
- **Girar ruleta**: Movimiento horizontal rápido

Si la webcam no está disponible, se usa mouse/teclado como fallback.

## Tecnologías

- HTML5 Canvas para el tablero
- CSS3 3D Transforms para el dado animado
- Canvas 2D para la ruleta con física de deceleración
- CSS Animations para tarjetas, transiciones y efectos
- Particle system con conexiones tipo neural network
- WebRTC + motion detection para gestos con webcam
- Sin dependencias externas - corre offline

## Estructura del Proyecto

```
web/
├── index.html          - Punto de entrada
├── css/
│   ├── main.css        - Variables, reset, layout
│   ├── board.css       - Tablero y tokens
│   ├── dice.css        - Dado 3D animado
│   ├── roulette.css    - Ruleta
│   ├── cards.css       - Tarjetas de decisión/evento
│   ├── hud.css         - Panel de atributos e info
│   ├── menu.css        - Menú principal
│   └── particles.css   - Sistema de partículas
└── js/
    ├── utils.js        - Utilidades
    ├── particles.js    - Fondo animado con partículas
    ├── gameData.js     - Datos del juego (tiles, decisiones, eventos)
    ├── gameState.js    - Estado y lógica de turnos
    ├── board.js        - Renderizado del tablero
    ├── dice.js         - Sistema de dado 3D
    ├── roulette.js     - Sistema de ruleta
    ├── decisions.js    - Sistema de decisiones
    ├── events.js       - Sistema de eventos
    ├── hud.js          - Panel de información
    ├── ai.js           - Jugador IA
    ├── webcam.js       - Detección de gestos
    ├── game.js         - Controlador principal
    └── main.js         - Inicialización
```

## Requisitos

- Navegador moderno (Chrome, Edge, Firefox)
- Webcam (opcional - funciona sin ella con mouse)
