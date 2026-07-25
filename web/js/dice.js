// === DICE SYSTEM ===
// Smooth single animation: spins fast then decelerates to land on correct face

class DiceSystem {
    constructor() {
        this.container = $('#dice-container');
        this.cube = $('.dice-cube');
        this.resultEl = $('#dice-result');
        this.rolling = false;
        this.result = 0;
    }

    show() {
        showElement(this.container);
        this.resultEl.classList.add('hidden');
        this.cube.style.transition = 'none';
        this.cube.style.transform = 'rotateX(-20deg) rotateY(20deg)';
        // Hide only the card deck in center, not the whole board
        if (window.game && window.game.board) {
            window.game.board.hideDeck = true;
            window.game.board.draw(window.game.state, window.game.state.currentPlayer?.tileIndex ?? 0);
        }
        // Force browser to apply the reset before any transition
        void this.cube.offsetHeight;
    }

    hide() {
        hideElement(this.container);
        // Show deck again
        if (window.game && window.game.board) {
            window.game.board.hideDeck = false;
            window.game.board.draw(window.game.state, window.game.state.currentPlayer?.tileIndex ?? 0);
        }
    }

    async roll() {
        if (this.rolling) return null;
        this.rolling = true;
        this.result = randomInt(1, 6);
        this.resultEl.classList.add('hidden');

        Sounds.playDiceRoll();

        // Target rotation that shows the correct face
        // front=1, top=2, right=3, left=4, bottom=5, back=6
        const faceAngles = {
            1: { x: 0, y: 0 },
            2: { x: -90, y: 0 },
            3: { x: 0, y: -90 },
            4: { x: 0, y: 90 },
            5: { x: 90, y: 0 },
            6: { x: 0, y: 180 }
        };
        const target = faceAngles[this.result];

        // Add many full rotations so it spins a lot before landing
        // The key: one continuous ease-out so it spins fast → slows → stops
        const extraSpinsX = (5 + Math.floor(Math.random() * 3)) * 360;
        const extraSpinsY = (4 + Math.floor(Math.random() * 3)) * 360;
        const finalX = target.x + extraSpinsX;
        const finalY = target.y + extraSpinsY;

        // Single smooth deceleration over 3 seconds
        this.cube.style.transition = 'transform 3s cubic-bezier(0.12, 0.8, 0.2, 1)';
        this.cube.style.transform = `rotateX(${finalX}deg) rotateY(${finalY}deg)`;

        // Play bell and flash result when transition ends
        const bellPromise = new Promise(resolve => {
            const onEnd = () => {
                this.cube.removeEventListener('transitionend', onEnd);
                Sounds.resume();
                Sounds.playDiceResult();

                // Flash the dice face and cube
                this.resultEl.classList.add('hidden');
                this.cube.classList.add('dice-flash');
                setTimeout(() => this.cube.classList.remove('dice-flash'), 700);

                resolve();
            };
            this.cube.addEventListener('transitionend', onEnd);
        });

        await bellPromise;
        await delay(800);
        this.rolling = false;
        return this.result;
    }
}
