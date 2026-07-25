// === DECISION SYSTEM ===

class DecisionSystem {
    constructor() {
        this.overlay = $('#decision-overlay');
        this.titleEl = $('#decision-title');
        this.descEl = $('#decision-desc');
        this.optionsEl = $('#decision-options');
        this.resolveChoice = null;
    }

    async show(decision) {
        this.titleEl.textContent = decision.title;
        this.descEl.textContent = decision.description;
        this.optionsEl.innerHTML = '';

        return new Promise(resolve => {
            this.resolveChoice = resolve;

            decision.options.forEach((option, i) => {
                const btn = document.createElement('div');
                btn.className = 'decision-option';
                btn.style.animationDelay = `${i * 0.1}s`;

                const effectsText = Object.entries(option.modifiers)
                    .map(([k, v]) => {
                        const name = ATTRIBUTE_TYPES[k]?.name || k;
                        return `${name} ${formatModifier(v)}`;
                    }).join(' | ');

                btn.innerHTML = `
                    <div class="option-text">${option.text}</div>
                    <div class="option-effects">${effectsText}</div>
                `;

                btn.addEventListener('click', () => {
                    this.hide();
                    resolve(i);
                });

                this.optionsEl.appendChild(btn);
            });

            showElement(this.overlay);
        });
    }

    hide() {
        hideElement(this.overlay);
    }
}
