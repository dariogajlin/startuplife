// === ROULETTE SYSTEM ===

class RouletteSystem {
    constructor() {
        this.container = $('#roulette-container');
        this.canvas = $('#roulette-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resultEl = $('#roulette-result');
        this.pointer = $('.roulette-pointer');
        this.spinning = false;
        this.currentAngle = 0;
        this.segments = [];
    }

    show(segments) {
        this.segments = segments;
        showElement(this.container);
        this.resultEl.classList.add('hidden');
        this.drawWheel(0);
    }

    hide() {
        hideElement(this.container);
    }

    drawWheel(rotation) {
        const ctx = this.ctx;
        const cx = 200, cy = 200, r = 180;
        ctx.clearRect(0, 0, 400, 400);

        const total = this.segments.length;
        const anglePerSegment = (Math.PI * 2) / total;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotation);

        for (let i = 0; i < total; i++) {
            const seg = this.segments[i];
            const startAngle = i * anglePerSegment;
            const endAngle = (i + 1) * anglePerSegment;

            // Segment fill
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, r, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = seg.color;
            ctx.fill();
            ctx.strokeStyle = 'rgba(0,0,0,0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Label
            ctx.save();
            ctx.rotate(startAngle + anglePerSegment / 2);
            ctx.textAlign = 'center';
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px sans-serif';
            ctx.fillText(seg.label, r * 0.6, 4);
            ctx.restore();
        }

        ctx.restore();

        // Outer ring
        ctx.beginPath();
        ctx.arc(cx, cy, r + 5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(74, 158, 255, 0.5)';
        ctx.lineWidth = 4;
        ctx.stroke();
    }

    getWeightedRandom() {
        let total = 0;
        for (const s of this.segments) total += (s.weight || 1);
        let r = Math.random() * total;
        for (let i = 0; i < this.segments.length; i++) {
            r -= (this.segments[i].weight || 1);
            if (r <= 0) return i;
        }
        return this.segments.length - 1;
    }

    async spin() {
        if (this.spinning) return null;
        this.spinning = true;
        this.resultEl.classList.add('hidden');

        Sounds.playRouletteSpin(3000);

        const total = this.segments.length;
        const anglePerSegment = (Math.PI * 2) / total;

        // Pick target using weighted random
        const targetIndex = this.getWeightedRandom();

        // Calculate how much to rotate so target lands under top pointer
        // When wheel is drawn with rotation R, the segment at the top (pointer) is:
        // The pointer is at -90° (top). A segment i occupies angles [i*aps, (i+1)*aps].
        // After rotation R, segment i is at angle (i*aps + R). For it to be at top (-π/2 = 3π/2):
        // i*aps + R ≡ 3π/2 (mod 2π)  →  R = 3π/2 - i*aps - aps/2 (center of segment)
        const landAngle = (3 * Math.PI / 2) - targetIndex * anglePerSegment - anglePerSegment / 2;
        // Normalize to positive and add full spins
        const normalizedLand = ((landAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const totalRotation = Math.PI * 2 * 5 + normalizedLand;

        const duration = 3000;
        const start = performance.now();
        const startAngle = 0; // Always start from 0 for consistency
        this.currentAngle = 0;

        return new Promise(resolve => {
            const animate = (now) => {
                const elapsed = now - start;
                const t = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - t, 3);
                const angle = startAngle + totalRotation * eased;
                this.currentAngle = angle;
                this.drawWheel(angle);

                if (t < 0.9 && Math.random() < 0.3) {
                    this.pointer.classList.add('bounce');
                    setTimeout(() => this.pointer.classList.remove('bounce'), 100);
                }

                if (t < 1) {
                    requestAnimationFrame(animate);
                } else {
                    const seg = this.segments[targetIndex];
                    this.resultEl.textContent = seg.label;
                    this.resultEl.classList.remove('hidden');
                    this.spinning = false;
                    setTimeout(() => resolve({ index: targetIndex, segment: seg }), 2500);
                }
            };
            requestAnimationFrame(animate);
        });
    }
}
