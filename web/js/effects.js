// === SCREEN EFFECTS (Shake + Confetti) ===

const Effects = {
    // Screen shake for negative events
    shake() {
        const body = document.body;
        // Remove class if already shaking, then re-add to restart animation
        body.classList.remove('shake');
        // Force reflow to restart animation
        void body.offsetWidth;
        body.classList.add('shake');
        // Clean up after animation ends
        setTimeout(() => {
            body.classList.remove('shake');
        }, 550);
    },

    // Confetti burst for positive events
    confetti(duration = 2500) {
        // Each burst gets its own canvas so they don't interfere
        const canvas = document.createElement('canvas');
        canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:9998;pointer-events:none;';
        document.body.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const colors = ['#4a9eff', '#2ecc71', '#f39c12', '#e74c3c', '#9b59b6', '#00d4ff', '#ffffff'];
        const particles = [];
        const particleCount = 180;

        // Create particles bursting from top-center
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: canvas.width / 2 + (Math.random() - 0.5) * 400,
                y: -20,
                vx: (Math.random() - 0.5) * 14,
                vy: Math.random() * 4 + 2,
                gravity: 0.10 + Math.random() * 0.06,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 10 + 5,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 12,
                opacity: 1,
                decay: 0.005 + Math.random() * 0.005,
                shape: Math.random() > 0.5 ? 'rect' : 'circle'
            });
        }

        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            if (elapsed > duration) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                canvas.remove();
                return;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (const p of particles) {
                p.x += p.vx;
                p.vy += p.gravity;
                p.y += p.vy;
                p.vx *= 0.99;
                p.rotation += p.rotationSpeed;
                p.opacity -= p.decay;

                if (p.opacity <= 0) continue;

                ctx.save();
                ctx.globalAlpha = p.opacity;
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);

                if (p.shape === 'rect') {
                    ctx.fillStyle = p.color;
                    ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
                } else {
                    ctx.beginPath();
                    ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                    ctx.fillStyle = p.color;
                    ctx.fill();
                }

                ctx.restore();
            }

            requestAnimationFrame(animate);
        };

        animate();
    },

    // Red flash for negative events
    redFlash() {
        let flash = document.getElementById('red-flash');
        if (!flash) {
            flash = document.createElement('div');
            flash.id = 'red-flash';
            flash.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9997;opacity:0;background:radial-gradient(ellipse at center, rgba(231,76,60,0.3) 0%, rgba(231,76,60,0.5) 100%);transition:opacity 0.15s ease-in;';
            document.body.appendChild(flash);
        }
        flash.style.opacity = '1';
        setTimeout(() => {
            flash.style.transition = 'opacity 0.5s ease-out';
            flash.style.opacity = '0';
            setTimeout(() => { flash.style.transition = 'opacity 0.15s ease-in'; }, 500);
        }, 350);
    }
};
