// === CARD FLIP SYSTEM ===
// Shows a deck card face-down, flips it to reveal content

class CardSystem {
    constructor() {
        this.overlay = $('#card-overlay');
        this.flipper = $('#card-flipper');
        this.iconEl = $('#card-icon');
        this.titleEl = $('#card-title');
        this.descEl = $('#card-desc');
        this.effectsEl = $('#card-effects');
        this.optionsEl = $('#card-options');
    }

    // Show an info card (positive/negative tile, event)
    // For AI: auto-closes after 5s. For human: shows "Aceptar" button.
    async showInfo(icon, title, description, modifiers, isHuman = false) {
        this.prepare(icon, title, description);
        this.renderEffects(modifiers);
        this.optionsEl.innerHTML = '';

        if (isHuman) {
            // Human: require button click or high-five gesture to dismiss
            return new Promise(resolve => {
                const btn = document.createElement('div');
                btn.className = 'card-option-btn';
                btn.style.textAlign = 'center';
                btn.style.marginTop = '10px';
                btn.style.borderLeftColor = '#2ecc71';
                btn.innerHTML = `<div class="opt-text" style="text-align:center">✋ Aceptar</div>`;

                const dismiss = () => {
                    if (window.Debug && Debug.visible) return;
                    if (window.game && window.game.webcam) {
                        window.game.webcam.onHighFive = null;
                    }
                    window.game?.hideWebcamHint();
                    this.hide();
                    resolve();
                };

                btn.addEventListener('click', dismiss);

                // Also accept high-five gesture
                if (window.game && window.game.webcam) {
                    window.game.webcam.onHighFive = dismiss;
                    window.game.showWebcamHint('✋ Mostrá la palma para aceptar');
                }

                this.optionsEl.appendChild(btn);

                showElement(this.overlay);
                // Step 1: tilt up to vertical
                setTimeout(() => {
                    this.flipper.classList.add('upright');
                }, 50);
                // Step 2: flip to reveal
                setTimeout(() => {
                    Sounds.playCardFlip();
                    this.flipper.classList.add('revealed');
                }, 900);
            });
        } else {
            // AI: auto-close after time
            showElement(this.overlay);
            setTimeout(() => {
                this.flipper.classList.add('upright');
            }, 50);
            await delay(900);
            Sounds.playCardFlip();
            this.flipper.classList.add('revealed');
            await delay(5000);
            this.hide();
        }
    }

    // Show a decision card — returns chosen option index
    async showDecision(icon, title, description, options) {
        this.prepare(icon, title, description);
        this.effectsEl.innerHTML = '';

        return new Promise(resolve => {
            this.optionsEl.innerHTML = '';

            options.forEach((opt, i) => {
                const btn = document.createElement('div');
                btn.className = 'card-option-btn';

                const effectText = Object.entries(opt.modifiers)
                    .map(([k, v]) => `${ATTRIBUTE_TYPES[k]?.name || k} ${formatModifier(v)}`)
                    .join(' | ');

                btn.innerHTML = `
                    <div class="opt-text">${i + 1}. ${opt.text}</div>
                    <div class="opt-effect">${effectText}</div>
                `;
                btn.addEventListener('click', () => {
                    if (window.Debug && Debug.visible) return;
                    this.hide();
                    resolve(i);
                });
                this.optionsEl.appendChild(btn);
            });

            showElement(this.overlay);
            // Step 1: tilt up to vertical
            setTimeout(() => {
                this.flipper.classList.add('upright');
            }, 50);
            // Step 2: flip to reveal
            setTimeout(() => {
                Sounds.playCardFlip();
                this.flipper.classList.add('revealed');
            }, 900);
        });
    }

    prepare(icon, title, description) {
        this.flipper.classList.remove('revealed', 'upright');
        this.iconEl.textContent = icon;
        this.titleEl.textContent = title;
        this.descEl.textContent = description;
        this.effectsEl.innerHTML = '';
        this.optionsEl.innerHTML = '';
    }

    renderEffects(modifiers) {
        if (!modifiers) return;
        for (const [key, value] of Object.entries(modifiers)) {
            const name = ATTRIBUTE_TYPES[key]?.name || key;
            const tag = document.createElement('span');
            tag.className = `effect-tag ${value >= 0 ? 'positive' : 'negative'}`;
            tag.textContent = `${name} ${formatModifier(value)}`;
            this.effectsEl.appendChild(tag);
        }
    }

    hide() {
        this.flipper.classList.remove('revealed', 'upright');
        hideElement(this.overlay);
    }
}
