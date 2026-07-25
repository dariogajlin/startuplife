// === HUD ===

class HUD {
    constructor() {
        this.attributesEl = $('#hud-attributes');
        this.playerNameEl = $('#turn-player-name');
        this.roundEl = $('#turn-round');
        this.promptEl = $('#action-prompt');
        this.promptText = $('#prompt-text');
    }

    init() {
        this.attributesEl.innerHTML = '';
        this.buildAllPlayersPanel();
    }

    buildAllPlayersPanel() {
        this.attributesEl.innerHTML = '';
        const players = window.game?.state?.players || [];

        // Ranking section at the top
        const rankingDiv = document.createElement('div');
        rankingDiv.id = 'hud-ranking';
        rankingDiv.className = 'hud-ranking';
        this.attributesEl.appendChild(rankingDiv);

        // Simplified player sections (only Capital, Runway, Score)
        players.forEach(player => {
            const section = document.createElement('div');
            section.className = 'hud-player-section';
            section.id = `hud-player-${player.index}`;

            const header = document.createElement('div');
            header.className = 'hud-player-header';
            header.innerHTML = `
                <span class="hud-player-dot" style="background:${player.color}"></span>
                <span class="hud-player-name">${player.startup}${player.type === 'ai' ? ' <span class="hud-player-type">(IA)</span>' : ''}</span>
            `;
            section.appendChild(header);

            const attrs = document.createElement('div');
            attrs.className = 'hud-player-attrs';

            // Only show: Capital, Runway, Score (capital + valuation)
            const displayAttrs = [
                { key: '_score', name: 'Valor', color: '#f39c12', max: 5000 },
                { key: 'capital', name: 'Capital', color: '#2ecc71', max: 1000 },
                { key: 'runway', name: 'Runway', color: '#27ae60', max: 36 }
            ];

            for (const attr of displayAttrs) {
                const row = document.createElement('div');
                row.className = 'attr-row';
                row.innerHTML = `
                    <span class="attr-name">${attr.name}</span>
                    <div class="attr-bar-bg">
                        <div class="attr-bar-fill" id="bar-${player.index}-${attr.key}"
                             style="background:${attr.color};width:0%"></div>
                    </div>
                    <span class="attr-value" id="val-${player.index}-${attr.key}">0</span>
                `;
                attrs.appendChild(row);
            }

            section.appendChild(attrs);
            this.attributesEl.appendChild(section);
        });
    }

    update(player) {
        this.playerNameEl.textContent = player.startup;
        this.playerNameEl.style.color = player.color;
        const round = Math.min(window.game?.state.round || 1, window.game?.state.maxRounds || 15);
        this.roundEl.textContent = `Ronda ${round} de ${window.game?.state.maxRounds || 15}`;

        // Update runway urgency for human player
        this.updateRunwayUrgency(player);

        // Update startup health indicator (show current player's health)
        this.updateHealth(player);

        // Update all players
        const players = window.game?.state?.players || [];
        players.forEach(p => {
            this.updatePlayerBars(p);
        });

        // Update live ranking
        this.updateRanking(players);

        // Highlight current player section
        document.querySelectorAll('.hud-player-section').forEach(el => {
            el.classList.remove('active');
        });
        const currentSection = document.getElementById(`hud-player-${player.index}`);
        if (currentSection) currentSection.classList.add('active');
    }

    updateRanking(players) {
        const rankingEl = document.getElementById('hud-ranking');
        if (!rankingEl) return;

        const medals = ['🥇', '🥈', '🥉', '🪨'];
        const sorted = [...players].sort((a, b) => {
            const scoreA = a.getAttribute('capital') + a.getAttribute('valuation');
            const scoreB = b.getAttribute('capital') + b.getAttribute('valuation');
            return scoreB - scoreA;
        });

        rankingEl.innerHTML = sorted.map((p, i) => {
            const score = p.getAttribute('capital') + p.getAttribute('valuation');
            const dead = !p.alive ? ' <span class="rank-dead">💀</span>' : '';
            return `<div class="rank-entry">
                <span class="rank-medal">${medals[i] || ''}</span>
                <span class="rank-name" style="color:${p.color}">${p.startup}</span>
                <span class="rank-score">$ ${score}K${dead}</span>
            </div>`;
        }).join('');
    }

    updateHealth(player) {
        const starsEl = document.getElementById('health-stars');
        const labelEl = document.getElementById('health-label');
        if (!starsEl || !labelEl) return;

        // Calculate health score (0-100) based on key attributes
        const capital = player.getAttribute('capital');
        const revenue = player.getAttribute('revenue');
        const valuation = player.getAttribute('valuation');
        const runway = player.getAttribute('runway');

        // Weighted score
        let score = 0;
        score += Math.min(capital / 500, 1) * 35;
        score += Math.min(revenue / 50, 1) * 25;
        score += Math.min(valuation / 2000, 1) * 20;
        score += Math.min(runway / 12, 1) * 20;
        score = Math.max(0, Math.min(100, score));

        // Map score to half-stars (0 to 10 halves = 0 to 5 stars)
        const halves = Math.round(score / 10); // 0-10
        const fullStars = Math.floor(halves / 2);
        const halfStar = halves % 2 === 1;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

        let starsHtml = '';
        for (let i = 0; i < fullStars; i++) starsHtml += '<span class="star full">★</span>';
        if (halfStar) starsHtml += '<span class="star half">★</span>';
        for (let i = 0; i < emptyStars; i++) starsHtml += '<span class="star empty">★</span>';

        starsEl.innerHTML = starsHtml;

        // Label based on halves (0-10)
        let label, labelColor;
        if (halves >= 10) {
            label = 'Unicornio en camino';
            labelColor = '#2ecc71';
        } else if (halves >= 9) {
            label = 'Rumbo al éxito';
            labelColor = '#2ecc71';
        } else if (halves >= 8) {
            label = 'Crecimiento sólido';
            labelColor = '#a0d468';
        } else if (halves >= 7) {
            label = 'Buen momento';
            labelColor = '#a0d468';
        } else if (halves >= 6) {
            label = 'Startup estable';
            labelColor = '#f39c12';
        } else if (halves >= 5) {
            label = 'Zona de riesgo';
            labelColor = '#f39c12';
        } else if (halves >= 4) {
            label = 'Momento difícil';
            labelColor = '#e67e22';
        } else if (halves >= 3) {
            label = 'En problemas';
            labelColor = '#e67e22';
        } else if (halves >= 2) {
            label = 'Al borde del cierre';
            labelColor = '#e74c3c';
        } else {
            label = 'Emergencia total';
            labelColor = '#e74c3c';
        }

        labelEl.textContent = label;
        labelEl.style.color = labelColor;
    }

    updateRunwayUrgency(player) {
        const urgencyEl = document.getElementById('runway-urgency');
        if (!urgencyEl) return;

        // Only show urgency for human players
        if (player.type !== 'human') {
            urgencyEl.classList.remove('active', 'critical');
            return;
        }

        const runway = player.getAttribute('runway');
        if (runway <= 3) {
            urgencyEl.classList.remove('active');
            urgencyEl.classList.add('critical');
        } else if (runway <= 6) {
            urgencyEl.classList.remove('critical');
            urgencyEl.classList.add('active');
        } else {
            urgencyEl.classList.remove('active', 'critical');
        }
    }

    updatePlayerBars(player) {
        // Capital
        const capital = player.getAttribute('capital');
        const capitalBar = document.getElementById(`bar-${player.index}-capital`);
        const capitalVal = document.getElementById(`val-${player.index}-capital`);
        if (capitalBar) capitalBar.style.width = `${clamp((capital / 1000) * 100, 0, 100)}%`;
        if (capitalVal) capitalVal.textContent = `$ ${capital}K`;

        // Runway
        const runway = player.getAttribute('runway');
        const runwayBar = document.getElementById(`bar-${player.index}-runway`);
        const runwayVal = document.getElementById(`val-${player.index}-runway`);
        if (runwayBar) runwayBar.style.width = `${clamp((runway / 36) * 100, 0, 100)}%`;
        if (runwayVal) runwayVal.textContent = `${runway} meses`;

        // Score (capital + valuation)
        const valuation = player.getAttribute('valuation');
        const score = capital + valuation;
        const scoreBar = document.getElementById(`bar-${player.index}-_score`);
        const scoreVal = document.getElementById(`val-${player.index}-_score`);
        if (scoreBar) scoreBar.style.width = `${clamp((score / 5000) * 100, 0, 100)}%`;
        if (scoreVal) scoreVal.textContent = `$ ${score}K`;

        // Grey out dead players
        const section = document.getElementById(`hud-player-${player.index}`);
        if (section && !player.alive) {
            section.classList.add('dead');
        }
    }

    showPrompt(text) {
        this.promptText.textContent = text;
        showElement(this.promptEl);
    }

    hidePrompt() {
        hideElement(this.promptEl);
    }

    showAttributeChange(key, value) {
        if (!value || value === 0) return;
        const info = ATTRIBUTE_TYPES[key];
        if (!info) return;

        const isPositive = value > 0;
        const prefix = isPositive ? '+' : '';
        const suffix = (key === 'capital' || key === 'revenue' || key === 'valuation') ? 'K' : '';
        const text = `${prefix}${value}${suffix}`;

        // Find the current player's section to animate on top of it
        const currentPlayer = window.game?.state?.currentPlayer;
        if (!currentPlayer) return;
        const section = document.getElementById(`hud-player-${currentPlayer.index}`);
        if (!section) return;

        const float = document.createElement('div');
        float.className = `attr-float ${isPositive ? 'attr-float-positive' : 'attr-float-negative'}`;
        float.textContent = text;
        section.style.position = 'relative';
        section.appendChild(float);

        requestAnimationFrame(() => {
            float.classList.add('attr-float-animate');
        });

        setTimeout(() => float.remove(), 1500);
    }
}
