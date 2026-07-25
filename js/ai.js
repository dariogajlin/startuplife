// === AI PLAYER - Money focused ===

class AIPlayer {
    constructor() {
        this.thinkDelay = 1500;
    }

    async chooseDiceRoll() {
        await delay(this.thinkDelay);
    }

    async chooseRouletteSpin() {
        await delay(this.thinkDelay);
    }

    async chooseDecision(decision, player) {
        await delay(this.thinkDelay * 1.2);

        let bestIndex = 0;
        let bestScore = -Infinity;

        for (let i = 0; i < decision.options.length; i++) {
            const option = decision.options[i];
            let score = 0;

            for (const [key, value] of Object.entries(option.modifiers)) {
                let weight = 1;

                // Prioritize based on financial health
                if (key === 'capital') {
                    weight = player.getAttribute('capital') < 30 ? 4 : 2;
                } else if (key === 'revenue') {
                    weight = 3;
                } else if (key === 'valuation') {
                    weight = 1.5;
                } else if (key === 'runway') {
                    weight = player.getAttribute('runway') <= 3 ? 5 : 2;
                }

                score += value * weight;
            }

            // Add randomness
            score += (Math.random() - 0.5) * 15;

            if (score > bestScore) {
                bestScore = score;
                bestIndex = i;
            }
        }

        return bestIndex;
    }
}
