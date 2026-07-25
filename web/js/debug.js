// === DEBUG PANEL ===
// Press F2 to toggle debug panel for testing individual features

const Debug = {
    panel: null,
    visible: false,

    init() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                this.toggle();
            }
        });
    },

    toggle() {
        if (!this.panel) this.create();
        this.visible = !this.visible;
        this.panel.style.display = this.visible ? 'block' : 'none';

        // Block/unblock game events
        if (this.visible) {
            // Capture ALL clicks at document level when debug is open
            this._captureHandler = (e) => {
                if (e.target.closest('#debug-panel')) return; // Allow debug panel clicks
                e.stopImmediatePropagation();
                e.preventDefault();
            };
            document.addEventListener('click', this._captureHandler, true);

            // Pause webcam detection
            const webcam = window.game?.webcam;
            if (webcam) {
                this._webcamWasActive = webcam.active;
                webcam.active = false;
            }
        } else {
            // Remove capture handler
            if (this._captureHandler) {
                document.removeEventListener('click', this._captureHandler, true);
                this._captureHandler = null;
            }
            // Reset game to initial state
            window.location.reload();
        }
    },

    create() {
        this.panel = document.createElement('div');
        this.panel.id = 'debug-panel';
        this.panel.addEventListener('click', (e) => e.stopPropagation());
        this.panel.innerHTML = `
            <div class="debug-header">DEBUG (Ctrl+Shift+D para cerrar)</div>
            <div class="debug-section">
                <div class="debug-title">Efectos</div>
                <button onclick="Debug.testConfetti()">Confetti</button>
                <button onclick="Debug.testVictorySound()">Sonido Victoria</button>
                <button onclick="Debug.testMusic()">Toggle Música</button>
            </div>
            <div class="debug-section">
                <div class="debug-title">Overlays</div>
                <button onclick="Debug.testDice()">Dado</button>
                <button onclick="Debug.testRoulette()">Ruleta</button>
                <button onclick="Debug.testCard()">Carta Positiva</button>
                <button onclick="Debug.testDecision()">Decisión</button>
            </div>
            <div class="debug-section">
                <div class="debug-title">Pantallas</div>
                <button onclick="Debug.testEndScreen()">Pantalla Final</button>
                <button onclick="Debug.testMenu()">Volver al Menú</button>
            </div>
        `;
        document.body.appendChild(this.panel);
    },

    // --- Test functions ---

    testConfetti() {
        Effects.confetti(3000);
    },

    testVictorySound() {
        Sounds.init();
        Sounds.playVictory();
    },

    _musicPlaying: false,
    testMusic() {
        if (this._musicPlaying) {
            Music.stop();
            this._musicPlaying = false;
        } else {
            Music.start();
            this._musicPlaying = true;
        }
    },

    testDice() {
        Sounds.init();
        const dice = new DiceSystem();
        dice.show();
        dice.roll().then(() => {
            setTimeout(() => dice.hide(), 2000);
        });
    },

    testRoulette() {
        Sounds.init();
        const roulette = new RouletteSystem();
        const segments = ROULETTE_SETS.investors;
        roulette.show(segments);
        setTimeout(async () => {
            const result = await roulette.spin();
            setTimeout(() => roulette.hide(), 2000);
        }, 500);
    },

    testCard() {
        Sounds.init();
        const cards = new CardSystem();
        cards.showInfo('💰', 'Gran Cliente', 'Un cliente enterprise firma un contrato grande.', { revenue: 25, valuation: 100 }, true);
    },

    testDecision() {
        Sounds.init();
        const cards = new CardSystem();
        const decision = DECISIONS[0];
        cards.showDecision('🤔', decision.title, decision.description, decision.options).then(i => {
            console.log('Eligió opción:', i);
        });
    },

    testEndScreen() {
        Sounds.init();

        Effects.confetti(4000);
        setTimeout(() => Effects.confetti(4000), 2000);
        setTimeout(() => Effects.confetti(4000), 4000);
        Sounds.playVictory(0);

        // Show photo if available
        let photoEl = document.getElementById('winner-photo');
        if (!photoEl) {
            photoEl = document.createElement('img');
            photoEl.id = 'winner-photo';
            photoEl.className = 'winner-photo hidden';
            const trophy = document.querySelector('.trophy');
            if (trophy) trophy.parentNode.insertBefore(photoEl, trophy.nextSibling);
        }
        if (window.game?._playerPhotos && Object.keys(window.game._playerPhotos).length > 0) {
            const firstPhoto = Object.values(window.game._playerPhotos)[0];
            photoEl.src = firstPhoto;
            photoEl.classList.remove('hidden');
        } else {
            photoEl.classList.add('hidden');
        }

        $('#winner-name').textContent = 'TechNova';
        $('#winner-name').style.color = '#60bbff';
        const rankingsEl = $('#rankings');
        rankingsEl.innerHTML = '';

        const mockPlayers = [
            { name: 'TechNova', color: '#60bbff', capital: 15000 },
            { name: 'DataForge', color: '#ff8c6a', capital: 570 },
        ];
        mockPlayers.forEach((p, i) => {
            const row = document.createElement('div');
            row.className = 'ranking-row';
            row.style.animationDelay = `${i * 0.15}s`;
            row.innerHTML = `
                <span class="rank">#${i + 1}</span>
                <span class="rank-name" style="color:${p.color}">${p.name}</span>
                <span class="rank-capital">$${p.capital.toLocaleString()}K</span>
            `;
            rankingsEl.appendChild(row);
        });

        showScreen('end-screen');
    },

    testMenu() {
        showScreen('main-menu');
    },

    testWebcamBorder(state) {
        const overlay = $('#webcam-overlay');
        if (!overlay) return;
        overlay.classList.remove('webcam-idle', 'webcam-detecting', 'webcam-gesture', 'webcam-waiting');
        overlay.classList.add(`webcam-${state}`);
    },

    toggleMusic() {
        const btn = document.getElementById('mute-btn');
        if (!btn) return;
        if (this._musicMuted) {
            Music.start();
            btn.textContent = '🔊';
            btn.classList.remove('muted');
            this._musicMuted = false;
        } else {
            Music.stop();
            btn.textContent = '🔇';
            btn.classList.add('muted');
            this._musicMuted = true;
        }
    },

    _musicMuted: false
};

// Auto-init
document.addEventListener('DOMContentLoaded', () => Debug.init());