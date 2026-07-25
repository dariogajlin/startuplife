// === GAME CONTROLLER ===

class Game {
    constructor() {
        this.state = new GameState();
        this.board = new BoardRenderer($('#board-canvas'));
        this.dice = new DiceSystem();
        this.roulette = new RouletteSystem();
        this.cards = new CardSystem();
        this.decisions = new DecisionSystem();
        this.events = new EventSystem();
        this.hud = new HUD();
        this.ai = new AIPlayer();
        this.webcam = new WebcamGestures();
        this.waitingForInput = false;
    }

    async start(playerCount, aiCount, customNames = []) {
        this.state.reset();
        this.state.setupPlayers(playerCount, aiCount, customNames);
        this.state.phase = GamePhase.PLAYING;

        this.hud.init();
        showScreen('game-screen');
        await delay(500);

        this.webcam.init();
        this.board.draw(this.state, 0);
        this.hud.update(this.state.currentPlayer);

        // Start animation loop for token pulsing
        this.startRenderLoop();

        // Show startup name splash
        await this.showStartupSplash();

        this.startTurn();
    }

    async showStartupSplash() {
        const player = this.state.currentPlayer;
        const splash = document.createElement('div');
        splash.id = 'startup-splash';
        splash.innerHTML = `<div class="splash-name" style="color:${player.color}">${player.startup}</div><div class="splash-subtitle">¡Comienza tu aventura!</div>`;
        document.body.appendChild(splash);

        await delay(100);
        splash.classList.add('splash-visible');
        await delay(3000);
        splash.classList.add('splash-exit');
        await delay(600);
        splash.remove();
    }

    async showTurnSplash(player) {
        const splash = document.createElement('div');
        splash.id = 'startup-splash';
        splash.innerHTML = `<div class="splash-name splash-name-small" style="color:${player.color}">${player.startup}</div>`;
        document.body.appendChild(splash);

        await delay(50);
        splash.classList.add('splash-visible');
        await delay(1500);
        splash.classList.add('splash-exit');
        await delay(400);
        splash.remove();
    }

    startRenderLoop() {
        this._litTiles = [];
        const loop = () => {
            if (this.state.phase !== GamePhase.MENU && this.state.phase !== GamePhase.GAME_OVER) {
                const player = this.state.currentPlayer;
                this.board.draw(this.state, player ? player.tileIndex : 0, this._litTiles);
            }
            this._animFrame = requestAnimationFrame(loop);
        };
        loop();
    }

    async startTurn() {
        const player = this.state.currentPlayer;
        if (!player || !player.alive) {
            this.state.nextPlayer();
            if (this.state.shouldEndGame()) return this.endGame();
            return this.startTurn();
        }

        // Check if game should end before starting this turn
        if (this.state.shouldEndGame()) return this.endGame();

        // Show player name splash before each turn (skip first turn, already shown)
        if (this._firstTurnDone) {
            await this.showTurnSplash(player);
        }
        this._firstTurnDone = true;

        this.hud.update(player);
        this.board.draw(this.state, player.tileIndex);

        // Request dice roll
        this.state.phase = GamePhase.ROLLING_DICE;

        if (player.type === 'ai') {
            await this.ai.chooseDiceRoll();
            await this.rollDice();
        } else {
            this.hud.showPrompt('Haz clic o lanza el dado con la webcam');
            this.dice.show();
            this.waitForDiceInput();
        }
    }

    waitForDiceInput() {
        this.waitingForInput = true;
        this.webcam.setBorderState('waiting');
        this.showWebcamHint('🎲 Mové la mano hacia abajo');

        const handler = async (e) => {
            if (!this.waitingForInput) return;
            if (window.Debug && Debug.visible) return;
            // Ignore clicks on mute button and HUD attributes panel
            if (e && e.target) {
                if (e.target.closest('#mute-btn') || e.target.closest('#hud-attributes')) return;
            }
            this.waitingForInput = false;
            this.hideWebcamHint();
            document.removeEventListener('click', handler);
            document.removeEventListener('keydown', keyHandler);
            await this.rollDice();
        };

        const keyHandler = (e) => {
            if (window.Debug && Debug.visible) return;
            if (e.code === 'Space') handler(e);
        };

        document.addEventListener('click', handler);
        document.addEventListener('keydown', keyHandler);

        // Webcam gesture
        this.webcam.onThrow = () => handler();
    }

    async rollDice() {
        this.hud.hidePrompt();
        this.webcam.setBorderState('idle');
        this.hideWebcamHint();
        this.dice.show();
        await delay(100);
        let result = await this.dice.roll();

        // Bias towards finishing: if player is ≤3 tiles from end and has been stuck 3+ turns
        const player = this.state.currentPlayer;
        const tilesFromEnd = (this.state.totalTiles - 1) - player.tileIndex;
        if (tilesFromEnd > 0 && tilesFromEnd <= 3) {
            if (!player._stuckNearEnd) player._stuckNearEnd = 0;
            player._stuckNearEnd++;

            if (player._stuckNearEnd >= 3) {
                // Increasing chance to land exactly: 50% + 10% per extra turn stuck
                const chance = 0.5 + (player._stuckNearEnd - 3) * 0.1;
                if (Math.random() < Math.min(chance, 0.9)) {
                    result = tilesFromEnd;
                }
            }
        } else {
            player._stuckNearEnd = 0;
        }

        this.state.lastDiceValue = result;
        this.dice.hide();
        await delay(500); // Wait for dice to fully disappear before anything else

        await this.moveToken(result);
    }

    async moveToken(steps) {
        this.state.phase = GamePhase.MOVING_TOKEN;
        const player = this.state.currentPlayer;
        const fromTile = player.tileIndex;
        let toTile = fromTile + steps;

        // Need exact roll to reach the last tile - if exceeds, bounce back
        const lastTile = this.state.totalTiles - 1;
        let bounceTile = -1;
        if (toTile > lastTile) {
            const excess = toTile - lastTile;
            bounceTile = lastTile;
            toTile = lastTile - excess;
            if (toTile < 0) toTile = 0;
        }

        // Animate token moving step by step with smooth interpolation
        this._litTiles = [];

        if (bounceTile >= 0) {
            // Move forward to the end
            for (let i = fromTile + 1; i <= bounceTile; i++) {
                this._litTiles.push(i);
                await this.board.animateTokenMove(player, i - 1, i);
                player.tileIndex = i;
                Sounds.playTokenStep();
                await delay(100);
            }
            // Bounce back
            for (let i = bounceTile - 1; i >= toTile; i--) {
                this._litTiles.push(i);
                await this.board.animateTokenMove(player, i + 1, i);
                player.tileIndex = i;
                Sounds.playTokenStep();
                await delay(100);
            }
        } else {
            for (let i = fromTile + 1; i <= toTile; i++) {
                this._litTiles.push(i);
                await this.board.animateTokenMove(player, i - 1, i);
                player.tileIndex = i;
                Sounds.playTokenStep();
                await delay(100);
            }
        }

        // Brief pause with all tiles lit, then clear trail keeping only final
        await delay(500);
        this._litTiles = [];

        await this.resolveTile();
    }

    async resolveTile() {
        this.state.phase = GamePhase.RESOLVING_TILE;
        const player = this.state.currentPlayer;
        const tile = TILES[player.tileIndex];
        if (!tile) return this.endTurn();

        // If player reached the last tile, end game immediately after showing the card
        if (player.tileIndex >= this.state.totalTiles - 1) {
            const icon = this.board.getTileEmoji(tile.type, tile);
            const desc = tile.description || 'Tu startup llegó al final!';
            const isHuman = player.type === 'human';
            const boosted = this.applyHistoryBonus(player, tile.modifiers);
            setTimeout(() => Effects.confetti(), 500);
            await this.cards.showInfo(icon, tile.name, desc, boosted, isHuman);
            this.applyModifiers(player, boosted);
            this.endGame();
            return;
        }

        switch (tile.type) {
            case 'positive':
            case 'negative':
                await this.handleInfoTile(tile, player);
                break;

            case 'decision':
                await this.handleDecision(tile, player);
                break;

            case 'event':
                await this.handleEvent(tile, player);
                break;

            case 'roulette':
                await this.handleRoulette(tile, player);
                break;

            case 'special':
                await this.handleSpecial(tile, player);
                break;

            default:
                this.endTurn();
        }
    }

    async handleInfoTile(tile, player) {
        const icon = this.board.getTileEmoji(tile.type, tile);
        let desc = tile.description || (tile.type === 'positive'
            ? 'Tu startup recibe buenas noticias.'
            : 'Algo malo le pasó a tu startup.');
        const isHuman = player.type === 'human';

        // Randomize capital if tile has randomCapital range
        let modifiers = tile.modifiers;
        if (tile.randomCapital) {
            const amount = randomInt(tile.randomCapital[0], tile.randomCapital[1]);
            modifiers = { ...tile.modifiers, capital: amount };
            desc = `${desc} Te llevás $${amount}K.`;
        }

        // Trigger visual effects based on tile type
        if (tile.type === 'positive') {
            // Confetti triggers after card is fully revealed
            setTimeout(() => Effects.confetti(), 1700);
        } else if (tile.type === 'negative') {
            setTimeout(() => Effects.redFlash(), 1700);
        }

        const boosted = this.applyHistoryBonus(player, modifiers);
        await this.cards.showInfo(icon, tile.name, desc, boosted, isHuman);
        this.applyModifiers(player, boosted);
        this.endTurn();
    }

    async handleDecision(tile, player) {
        this.state.phase = GamePhase.MAKING_DECISION;
        // Pick random decision from the full pool
        const decision = DECISIONS[randomInt(0, DECISIONS.length - 1)];
        if (!decision) return this.endTurn();

        const icon = this.board.getTileEmoji(tile.type, tile);
        let chosenIndex;

        if (player.type === 'ai') {
            chosenIndex = await this.ai.chooseDecision(decision, player);
            // Show the AI's choice as an info card (auto-close)
            const chosen = decision.options[chosenIndex];
            await this.cards.showInfo(icon, decision.title, `IA eligió: ${chosen.text}`, chosen.modifiers, false);
        } else {
            chosenIndex = await this.cards.showDecision(icon, decision.title, decision.description, decision.options);
        }

        const option = decision.options[chosenIndex];

        // Track decision in history
        this.trackDecision(player, decision.title, chosenIndex);

        // Apply modifiers with history bonuses
        const boosted = this.applyHistoryBonus(player, option.modifiers);
        this.applyModifiers(player, boosted);
        await delay(400);
        this.endTurn();
    }

    trackDecision(player, title, optionIndex) {
        const t = title.toLowerCase();
        if (t.includes('ventas') && optionIndex === 0) player.history.hiredSales = true;
        if (t.includes('partner') && optionIndex === 0) player.history.hasPartner = true;
        if (t.includes('cto') && optionIndex === 0) player.history.hasCTO = true;
        if (t.includes('automatizar') && optionIndex === 0) player.history.automated = true;
        if (t.includes('expandir') && optionIndex === 0) player.history.expanded = true;
        if (t.includes('rebrand') && optionIndex === 0) player.history.rebranded = true;
        if (t.includes('crédito') && optionIndex === 0) player.history.tookDebt = true;
        if (t.includes('pivot') && optionIndex === 0) player.history.pivoted = true;
        if (t.includes('oficina') && optionIndex === 0) player.history.hasOffice = true;
        if (t.includes('serie a') && optionIndex === 0) player.history.hasInvestor = true;
        if (t.includes('pre-seed') && optionIndex === 0) player.history.hasInvestor = true;
    }

    applyHistoryBonus(player, modifiers) {
        if (!modifiers) return modifiers;
        const boosted = { ...modifiers };
        const h = player.history;

        // More salespeople = more revenue on revenue gains
        if (h.hiredSales && boosted.revenue && boosted.revenue > 0) {
            boosted.revenue = Math.round(boosted.revenue * 1.4);
        }

        // CTO = better valuation on positive valuation events
        if (h.hasCTO && boosted.valuation && boosted.valuation > 0) {
            boosted.valuation = Math.round(boosted.valuation * 1.3);
        }

        // Partner = less capital loss
        if (h.hasPartner && boosted.capital && boosted.capital < 0) {
            boosted.capital = Math.round(boosted.capital * 0.7);
        }

        // Automated = better runway preservation
        if (h.automated && boosted.runway && boosted.runway < 0) {
            boosted.runway = Math.round(boosted.runway * 0.6);
        }

        // Expanded = revenue bonuses stacked
        if (h.expanded && boosted.revenue && boosted.revenue > 0) {
            boosted.revenue = Math.round(boosted.revenue * 1.2);
        }

        // Office = runway lasts slightly longer
        if (h.hasOffice && boosted.runway && boosted.runway > 0) {
            boosted.runway += 1;
        }

        return boosted;
    }

    async handleEvent(tile, player) {
        // Pick random event from the full pool
        const event = EVENTS[randomInt(0, EVENTS.length - 1)];
        if (!event) return this.endTurn();

        const icon = this.board.getTileEmoji(tile.type, tile);
        const isHuman = player.type === 'human';
        const boosted = this.applyHistoryBonus(player, event.modifiers);

        // Determine net effect for visual feedback
        const netEffect = Object.values(boosted || {}).reduce((sum, v) => sum + v, 0);
        if (netEffect > 0) {
            setTimeout(() => Effects.confetti(), 1700);
        } else if (netEffect < 0) {
            setTimeout(() => Effects.redFlash(), 1700);
        }

        await this.cards.showInfo(icon, event.name, event.description, boosted, isHuman);
        this.applyModifiers(player, boosted);
        this.endTurn();
    }

    async handleRoulette(tile, player) {
        this.state.phase = GamePhase.SPINNING_ROULETTE;
        const segments = ROULETTE_SETS[tile.rouletteSet];
        if (!segments) return this.endTurn();

        this.roulette.show(segments);

        if (player.type === 'ai') {
            await this.ai.chooseRouletteSpin();
        } else {
            this.hud.showPrompt('Haz clic o gira con la webcam');
            this.webcam.setBorderState('waiting');
            this.showWebcamHint('🎰 Mové la mano de costado');
            this.webcam.onSpin = () => {};
            await new Promise(resolve => {
                const handler = () => {
                    if (window.Debug && Debug.visible) return;
                    document.removeEventListener('click', handler);
                    this.webcam.setBorderState('idle');
                    this.hideWebcamHint();
                    resolve();
                };
                document.addEventListener('click', handler);
                this.webcam.onSpin = () => {
                    document.removeEventListener('click', handler);
                    this.webcam.setBorderState('idle');
                    this.hideWebcamHint();
                    resolve();
                };
            });
            this.hud.hidePrompt();
        }

        const result = await this.roulette.spin();
        this.roulette.hide();

        if (result && result.segment) {
            const isHuman = player.type === 'human';

            // Visual effect based on roulette result
            const netEffect = Object.values(result.segment.modifiers || {}).reduce((sum, v) => sum + v, 0);
            if (netEffect > 0) {
                setTimeout(() => Effects.confetti(), 1700);
            } else if (netEffect < 0) {
                setTimeout(() => Effects.redFlash(), 1700);
            }

            await this.cards.showInfo('🎰', result.segment.label, 'Resultado de la ruleta', result.segment.modifiers, isHuman);
            this.applyModifiers(player, result.segment.modifiers);
        }

        await delay(400);
        this.endTurn();
    }

    async handleSpecial(tile, player) {
        const icon = this.board.getTileEmoji(tile.type, tile);
        const desc = tile.specialId === 'extra_turn'
            ? 'Tienes un turno extra!'
            : 'Retrocedes 3 casillas.';
        const isHuman = player.type === 'human';

        await this.cards.showInfo(icon, tile.name, desc, tile.modifiers, isHuman);
        this.applyModifiers(player, tile.modifiers);

        if (tile.specialId === 'extra_turn') {
            this.startTurn(); // No advance to next player
            return;
        }

        if (tile.specialId === 'go_back') {
            player.tileIndex = Math.max(0, player.tileIndex - 3);
            this.board.draw(this.state, player.tileIndex);
            await delay(800);
        }

        this.endTurn();
    }

    applyModifiers(player, modifiers) {
        if (!modifiers) return;
        const changes = player.applyModifiers(modifiers);
        this.hud.update(player);

        for (const [key, value] of Object.entries(modifiers)) {
            this.hud.showAttributeChange(key, value);
        }
    }

    endTurn() {
        const player = this.state.currentPlayer;
        player.applyBurnRate();
        const wasAlive = player.alive;
        player.checkAlive();
        this.hud.update(player);

        // Show bankruptcy message if player just died
        if (wasAlive && !player.alive) {
            this.cards.showInfo('💀', `${player.startup} quebró!`, 'Se quedó sin capital o runway.', {}, false);
        }

        if (this.state.shouldEndGame()) {
            // Check if no players alive
            const alive = this.state.getAlivePlayers();
            if (alive.length === 0) {
                setTimeout(() => {
                    $('#winner-name').textContent = 'Nadie sobrevivió';
                    $('.end-subtitle').textContent = 'Todas las startups quebraron';
                    const rankingsEl = $('#rankings');
                    rankingsEl.innerHTML = '';
                    this.state.getRankings().forEach((p, i) => {
                        const row = document.createElement('div');
                        row.className = 'ranking-row';
                        row.innerHTML = `
                            <span class="rank">#${i + 1}</span>
                            <span class="rank-name" style="color:${p.color}">${p.startup}</span>
                            <span class="rank-capital">💀 Quebró</span>
                        `;
                        rankingsEl.appendChild(row);
                    });
                    showScreen('end-screen');
                }, 2000);
            } else {
                return this.endGame();
            }
            return;
        }

        this.state.nextPlayer();
        this.state.phase = GamePhase.PLAYING;
        setTimeout(() => this.startTurn(), 800);
    }

    showWebcamHint(text) {
        const hint = document.getElementById('webcam-hint');
        if (hint) {
            hint.textContent = text;
            hint.classList.remove('hidden');
        }
    }

    hideWebcamHint() {
        const hint = document.getElementById('webcam-hint');
        if (hint) {
            hint.classList.add('hidden');
        }
    }

    endGame() {
        this.state.phase = GamePhase.GAME_OVER;
        const winner = this.state.getWinner();
        const rankings = this.state.getRankings();

        // Big celebration effects
        Effects.confetti(4000);
        setTimeout(() => Effects.confetti(4000), 2000);
        setTimeout(() => Effects.confetti(4000), 4000);
        Sounds.playVictory(0);
        Music.stop();

        $('#winner-name').textContent = winner ? winner.startup : 'Nadie';
        if (winner) {
            $('#winner-name').style.color = winner.color;
        }

        // Show player photo if captured
        let photoEl = document.getElementById('winner-photo');
        if (!photoEl) {
            photoEl = document.createElement('img');
            photoEl.id = 'winner-photo';
            photoEl.className = 'winner-photo hidden';
            const trophy = document.querySelector('.trophy');
            trophy.parentNode.insertBefore(photoEl, trophy.nextSibling);
        }
        const photos = window.game._playerPhotos || {};
        if (winner && photos[winner.index]) {
            photoEl.src = photos[winner.index];
            photoEl.classList.remove('hidden');
        } else {
            photoEl.classList.add('hidden');
        }
        const rankingsEl = $('#rankings');
        rankingsEl.innerHTML = '';

        rankings.forEach((player, i) => {
            const row = document.createElement('div');
            row.className = 'ranking-row';
            row.style.animationDelay = `${i * 0.15}s`;
            const status = player.alive ? '' : ' (Quebró)';
            const total = player.getAttribute('capital') + player.getAttribute('valuation');
            row.innerHTML = `
                <span class="rank">#${i + 1}</span>
                <span class="rank-name" style="color:${player.color}">${player.startup}</span>
                <span class="rank-capital">$ ${total.toLocaleString()}K${status}</span>
            `;
            rankingsEl.appendChild(row);
        });

        showScreen('end-screen');
    }
}
