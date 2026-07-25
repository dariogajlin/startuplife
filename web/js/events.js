// === EVENT SYSTEM ===

class EventSystem {
    constructor() {
        this.overlay = $('#event-overlay');
        this.titleEl = $('#event-title');
        this.descEl = $('#event-desc');
        this.effectsEl = $('#event-effects');
    }

    async show(event) {
        this.titleEl.textContent = event.name;
        this.descEl.textContent = event.description;
        this.effectsEl.innerHTML = '';

        for (const [key, value] of Object.entries(event.modifiers)) {
            const name = ATTRIBUTE_TYPES[key]?.name || key;
            const tag = document.createElement('span');
            tag.className = `effect-tag ${value >= 0 ? 'positive' : 'negative'}`;
            tag.textContent = `${name} ${formatModifier(value)}`;
            this.effectsEl.appendChild(tag);
        }

        showElement(this.overlay);
        await delay(3000);
        hideElement(this.overlay);
    }
}
