# STARTUP LIFE - Documentación Técnica

## Quick Start

1. Abrir `index.html` en Chrome o Edge
2. ¡Listo! El juego corre directamente en el navegador

### Requisitos

- Navegador moderno (Chrome, Edge, Firefox)
- Webcam (opcional - funciona sin ella con mouse/teclado)

## Cómo Jugar

- **Menú principal**: Elige cantidad de jugadores humanos e IA, luego presiona JUGAR
- **Dado**: Haz clic en cualquier lugar o presiona Espacio para lanzar
- **Ruleta**: Haz clic para girar
- **Decisiones**: Haz clic en la opción que prefieras

### Webcam (Gestos)

La webcam se activa automáticamente al iniciar. Gestos disponibles:

- **Lanzar dado**: Movimiento rápido hacia abajo (simular lanzamiento)
- **Girar ruleta**: Movimiento horizontal rápido

Si la webcam no está disponible, se usa mouse/teclado como fallback.

## Stack Tecnológico

- **Frontend**: HTML5, CSS3, JavaScript vanilla (sin frameworks)
- **Gráficos**: Canvas 2D (tablero y partículas), CSS 3D transforms (dado)
- **Audio**: Web Audio API (sonidos procedurales, sin archivos de audio)
- **Webcam**: MediaDevices API + análisis de frames por diferencia de pixels
- **Servidor**: Archivo estático (abrir index.html directamente o servir con cualquier HTTP server)
- Sin dependencias externas - corre offline

## Estructura de Archivos

```
├── index.html          # HTML principal (todas las pantallas)
├── css/
│   ├── main.css        # Estilos globales, pantallas, efectos
│   ├── board.css       # (vacío, tablero se dibuja en canvas)
│   ├── cards.css       # Sistema de cartas con flip 3D
│   ├── dice.css        # Dado 3D con CSS transforms
│   ├── hud.css         # Panel de atributos, ranking, estrellas
│   ├── menu.css        # Pantalla de inicio
│   ├── particles.css   # Partículas de fondo
│   └── roulette.css    # Ruleta animada
├── js/
│   ├── main.js         # Entry point, inicialización, foto
│   ├── game.js         # Controlador principal del juego
│   ├── gameState.js    # Estado del juego y jugadores
│   ├── gameData.js     # Datos: tiles, decisiones, eventos, ruletas
│   ├── board.js        # Renderizado del tablero (canvas)
│   ├── cardSystem.js   # Sistema de cartas (flip, decisiones)
│   ├── dice.js         # Sistema de dado 3D
│   ├── roulette.js     # Sistema de ruleta
│   ├── hud.js          # HUD: ranking, barras, estrellas, toasts
│   ├── ai.js           # Lógica de la IA
│   ├── webcam.js       # Detección de gestos por webcam
│   ├── sounds.js       # Sonidos procedurales + música ambient
│   ├── effects.js      # Confetti, flash rojo
│   ├── particles.js    # Sistema de partículas de fondo
│   ├── events.js       # Sistema de eventos (legacy)
│   ├── decisions.js    # Sistema de decisiones (legacy)
│   ├── utils.js        # Utilidades ($, delay, clamp, etc)
│   └── debug.js        # Panel de debug (Ctrl+Shift+D)
└── images/
    └── logo.png        # Logo del juego
```

## Arquitectura de Clases

```
Game (controlador principal)
├── GameState          # Estado: jugadores, ronda, fase
│   └── PlayerState[]  # Atributos, historial, posición
├── BoardRenderer      # Dibuja tablero en canvas
├── DiceSystem         # Dado 3D con animación CSS
├── RouletteSystem     # Ruleta canvas con spin animado
├── CardSystem         # Cartas con flip 3D (info + decisión)
├── HUD                # Panel derecho, ranking, estrellas
├── AIPlayer           # Decisiones de la IA
├── WebcamGestures     # Detección de gestos
└── AmbientMusic       # Música procedural
```

## Flujo del Juego

```
Menu → Foto → Start → [Loop de turnos] → End Screen

Loop de turno:
1. showTurnSplash(player)     # Nombre del jugador
2. hud.update(player)         # Actualiza panel
3. rollDice()                 # Input: click/space/webcam
4. moveToken(steps)           # Animación casilla por casilla
5. resolveTile()              # Según tipo de casilla
6. endTurn()                  # Decrementa runway, check alive
7. nextPlayer()               # Siguiente turno
```

## Fases del Juego (GamePhase)

| Fase | Descripción |
|------|-------------|
| MENU | Pantalla de inicio |
| PLAYING | Esperando input del jugador |
| ROLLING_DICE | Dado girando |
| MOVING_TOKEN | Ficha avanzando |
| RESOLVING_TILE | Procesando casilla |
| SPINNING_ROULETTE | Ruleta girando |
| MAKING_DECISION | Mostrando opciones |
| GAME_OVER | Pantalla final |

## Sistema de Detección de Gestos

La webcam analiza diferencias entre frames consecutivos:

1. Captura frame a 320x240
2. Compara pixel a pixel con frame anterior (zona inferior 60%)
3. Calcula `totalMotion` (pixels que cambiaron > threshold)
4. Acumula historial de movimiento (500ms)
5. Detecta patrones:
   - **Throw**: avgMotion > 60 + callback activo
   - **Spin**: desplazamiento horizontal dx > 10
   - **High Five**: burst de movimiento → quietud

## Sistema de Audio (Procedural)

Todo el audio se genera con Web Audio API sin archivos:

- **SoundSystem**: clicks, thuds, whoosh (osciladores + noise buffers)
- **AmbientMusic**: pad (sines detuned) + arpeggio (triangle, pentatónica)
- **Notas**: programadas con `ctx.currentTime` para timing preciso

## Datos del Juego

- **36 casillas** en el tablero (clockwise: izq → arriba → der → abajo)
- **35 decisiones** con 2 opciones cada una
- **35 eventos** aleatorios
- **5 sets de ruleta** con 6-8 segmentos cada uno
- **4 atributos**: Capital, Ingresos, Valuación, Runway
- **Máximo 4 jugadores** (humanos + IA, selección independiente)
- **15 rondas** por partida

## Condiciones de Fin

1. Ronda > 15
2. Solo 1 jugador vivo
3. Jugador llega a casilla 35 (Salida a Bolsa)

## Desempate

1. Mayor valor (capital + valuación)
2. Mayor capital
3. Mayor runway
