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
    },

    // Fireworks effect for end screen — bursts from left and right sides
    fireworks(duration = 10000) {
        const canvas = document.createElement('canvas');
        canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:10000;pointer-events:none;';
        document.body.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const colors = ['#ff4444', '#ffaa00', '#44ff44', '#4488ff', '#ff44ff', '#00ffdd', '#ffffff', '#ffdd00'];
        const rockets = [];
        const particles = [];
        const startTime = Date.now();

        function launchRocket() {
            const side = Math.random() > 0.5 ? 'left' : 'right';
            const x = side === 'left'
                ? canvas.width * (0.05 + Math.random() * 0.2)
                : canvas.width * (0.75 + Math.random() * 0.2);
            const targetY = canvas.height * (0.15 + Math.random() * 0.35);

            rockets.push({
                x: x,
                y: canvas.height,
                targetY: targetY,
                vy: -(4 + Math.random() * 3),
                color: colors[Math.floor(Math.random() * colors.length)],
                exploded: false
            });
        }

        function explode(rocket) {
            const count = 60 + Math.floor(Math.random() * 40);
            const baseColor = rocket.color;
            Sounds.playFirework();

            for (let i = 0; i < count; i++) {
                const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
                const speed = 2 + Math.random() * 4;
                particles.push({
                    x: rocket.x,
                    y: rocket.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    gravity: 0.05 + Math.random() * 0.03,
                    color: Math.random() > 0.3 ? baseColor : colors[Math.floor(Math.random() * colors.length)],
                    size: 2 + Math.random() * 3,
                    opacity: 1,
                    decay: 0.008 + Math.random() * 0.008,
                    trail: []
                });
            }
        }

        // Launch rockets at intervals
        let launchInterval = setInterval(() => {
            if (Date.now() - startTime > duration - 1000) {
                clearInterval(launchInterval);
                return;
            }
            launchRocket();
        }, 400 + Math.random() * 300);

        // Initial burst
        launchRocket();
        setTimeout(() => launchRocket(), 200);

        const animate = () => {
            const elapsed = Date.now() - startTime;
            if (elapsed > duration) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                canvas.remove();
                return;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update rockets
            for (let i = rockets.length - 1; i >= 0; i--) {
                const r = rockets[i];
                if (r.exploded) {
                    rockets.splice(i, 1);
                    continue;
                }

                r.y += r.vy;

                // Draw rocket trail
                ctx.beginPath();
                ctx.arc(r.x, r.y, 2, 0, Math.PI * 2);
                ctx.fillStyle = r.color;
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(r.x, r.y);
                ctx.lineTo(r.x + (Math.random() - 0.5) * 2, r.y + 8);
                ctx.strokeStyle = 'rgba(255,200,50,0.6)';
                ctx.stroke();

                if (r.y <= r.targetY) {
                    r.exploded = true;
                    explode(r);
                }
            }

            // Update particles
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.vy += p.gravity;
                p.x += p.vx;
                p.y += p.vy;
                p.vx *= 0.98;
                p.opacity -= p.decay;

                if (p.opacity <= 0) {
                    particles.splice(i, 1);
                    continue;
                }

                ctx.save();
                ctx.globalAlpha = p.opacity;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.shadowBlur = 6;
                ctx.shadowColor = p.color;
                ctx.fill();
                ctx.restore();
            }

            requestAnimationFrame(animate);
        };

        animate();
    }
};
