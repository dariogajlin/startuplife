// === GAME STATE ===

const GamePhase = {
    MENU: 'menu',
    PLAYING: 'playing',
    ROLLING_DICE: 'rolling_dice',
    MOVING_TOKEN: 'moving_token',
    RESOLVING_TILE: 'resolving_tile',
    SPINNING_ROULETTE: 'spinning_roulette',
    MAKING_DECISION: 'making_decision',
    GAME_OVER: 'game_over'
};

class PlayerState {
    constructor(index, config) {
        this.index = index;
        this.name = config.name;
        this.startup = config.startup;
        this.color = config.color;
        this.type = config.type;
        this.tileIndex = 0;
        this.alive = true;
        this.attributes = { ...DEFAULT_ATTRIBUTES };
        // History of decisions/events that affect future outcomes
        this.history = {
            hiredSales: false,     // contrató vendedores
            hasPartner: false,     // tiene partner estratégico
            hasCTO: false,         // tiene CTO
            automated: false,     // automatizó operaciones
            expanded: false,       // expandió a LATAM
            rebranded: false,      // hizo rebrand
            tookDebt: false,       // tomó deuda
            pivoted: false,        // pivotó el producto
            hasOffice: false,      // tiene oficina
            hasInvestor: false     // aceptó inversión
        };
    }

    getAttribute(key) {
        return this.attributes[key] || 0;
    }

    setAttribute(key, value) {
        const max = ATTRIBUTE_TYPES[key]?.max || 9999;
        this.attributes[key] = clamp(value, 0, max);
    }

    applyModifiers(modifiers) {
        if (!modifiers) return;
        const changes = {};
        for (const [key, value] of Object.entries(modifiers)) {
            const old = this.getAttribute(key);
            this.setAttribute(key, old + value);
            changes[key] = value;
        }
        return changes;
    }

    applyBurnRate() {
        const runway = this.getAttribute('runway');
        this.setAttribute('runway', runway - 1);
    }

    checkAlive() {
        if (this.getAttribute('capital') <= 0 || this.getAttribute('runway') <= 0) {
            this.alive = false;
        }
        return this.alive;
    }
}

class GameState {
    constructor() {
        this.reset();
    }

    reset() {
        this.phase = GamePhase.MENU;
        this.players = [];
        this.currentPlayerIndex = 0;
        this.round = 1;
        this.maxRounds = 15;
        this.totalTiles = TILES.length;
        this.lastDiceValue = 0;
    }

    get currentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    setupPlayers(playerCount, aiCount, customNames = []) {
        this.players = [];
        const humanCount = playerCount - aiCount;

        for (let i = 0; i < playerCount; i++) {
            const config = { ...PLAYER_CONFIGS[i] };
            if (i < humanCount) {
                config.type = 'human';
                if (customNames[i]) {
                    config.startup = customNames[i];
                }
            } else {
                config.type = 'ai';
            }
            this.players.push(new PlayerState(i, config));
        }
    }

    nextPlayer() {
        do {
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
            if (this.currentPlayerIndex === 0) {
                this.round++;
            }
        } while (!this.currentPlayer.alive && this.getAlivePlayers().length > 0);
    }

    getAlivePlayers() {
        return this.players.filter(p => p.alive);
    }

    shouldEndGame() {
        if (this.round > this.maxRounds) return true;
        if (this.getAlivePlayers().length <= 1) return true;
        for (const p of this.players) {
            if (p.alive && p.tileIndex >= this.totalTiles - 1) return true;
        }
        return false;
    }

    getWinner() {
        let winner = null;
        let best = -Infinity;
        for (const p of this.players) {
            const score = p.getAttribute('capital') + p.getAttribute('valuation');
            if (score > best) {
                best = score;
                winner = p;
            } else if (score === best && winner) {
                // Tiebreaker 1: more capital
                if (p.getAttribute('capital') > winner.getAttribute('capital')) {
                    winner = p;
                } else if (p.getAttribute('capital') === winner.getAttribute('capital')) {
                    // Tiebreaker 2: more runway
                    if (p.getAttribute('runway') > winner.getAttribute('runway')) {
                        winner = p;
                    }
                }
            }
        }
        return winner;
    }

    getRankings() {
        return [...this.players].sort((a, b) =>
            (b.getAttribute('capital') + b.getAttribute('valuation')) -
            (a.getAttribute('capital') + a.getAttribute('valuation'))
        );
    }
}
