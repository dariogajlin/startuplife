// === BOARD RENDERER - Realistic Board Game ===
// Clockwise: Bottom(L→R), Right(B→T), Top(R→L), Left(T→B)

class BoardRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.tilePositions = [];
        this.hideDeck = false;
        // Smooth token animation state: { playerIndex: { fromX, fromY, toX, toY, startTime, duration } }
        this.tokenAnimations = {};
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const scale = window.devicePixelRatio || 1;
        // Board fills ~70% of the screen
        const w = window.innerWidth * 0.70;
        const h = window.innerHeight * 0.82;
        this.canvas.width = w * scale;
        this.canvas.height = h * scale;
        this.canvas.style.width = w + 'px';
        this.canvas.style.height = h + 'px';
        this.ctx.setTransform(scale, 0, 0, scale, 0, 0);
        this.w = w;
        this.h = h;
        this.generatePositions();
    }

    generatePositions() {
        this.tilePositions = [];
        const w = this.w;
        const h = this.h;
        const margin = 8;

        // Horizontal tiles (top/bottom) are wider
        const tileHW = 96; // width for horizontal tiles
        const tileHH = 62; // height for horizontal tiles
        // Vertical tiles (left/right) are wider too
        const tileVW = 96; // width for vertical tiles
        const tileVH = 68; // height for vertical tiles

        // CLOCKWISE: Left(B→T) → Top(L→R) → Right(T→B) → Bottom(R→L)
        // 36 tiles: 7 left + 11 top + 7 right + 11 bottom = 36
        const left = margin + tileVW / 2;
        const right = w - margin - tileVW / 2;
        const top = margin + tileHH / 2;
        const bottom = h - margin - tileHH / 2;

        // Left side: 7 tiles (no corners)
        for (let i = 0; i < 7; i++) {
            const t = (i + 1) / 8;
            this.tilePositions.push({
                x: left,
                y: bottom - t * (bottom - top),
                w: tileVW - 2, h: tileVH - 2
            });
        }

        // Top: 11 tiles (includes corners)
        for (let i = 0; i < 11; i++) {
            const t = i / 10;
            this.tilePositions.push({
                x: left + t * (right - left),
                y: top,
                w: tileHW - 2, h: tileHH - 2
            });
        }

        // Right side: 7 tiles (no corners)
        for (let i = 0; i < 7; i++) {
            const t = (i + 1) / 8;
            this.tilePositions.push({
                x: right,
                y: top + t * (bottom - top),
                w: tileVW - 2, h: tileVH - 2
            });
        }

        // Bottom: 11 tiles (includes corners)
        for (let i = 0; i < 11; i++) {
            const t = i / 10;
            this.tilePositions.push({
                x: right - t * (right - left),
                y: bottom,
                w: tileHW - 2, h: tileHH - 2
            });
        }
    }

    getTileColors(type) {
        switch (type) {
            case 'positive': return { bg: '#145214', border: '#4caf50', glow: '#4caf5060' };
            case 'negative': return { bg: '#5c1111', border: '#ef5350', glow: '#ef535060' };
            case 'decision': return { bg: '#5c3500', border: '#ff9800', glow: '#ff980060' };
            case 'event': return { bg: '#0a2e5c', border: '#42a5f5', glow: '#42a5f560' };
            case 'roulette': return { bg: '#3d0a5c', border: '#ab47bc', glow: '#ab47bc60' };
            case 'special': return { bg: '#004040', border: '#26c6da', glow: '#26c6da60' };
            default: return { bg: '#2a2a3a', border: '#78909c', glow: '#78909c40' };
        }
    }

    getTileEmoji(type, tile) {
        // Specific emojis based on tile name for variety
        if (tile) {
            const name = tile.name.toLowerCase();
            if (name.includes('inicio')) return '🚀';
            if (name.includes('cliente')) return '👥';
            if (name.includes('contrat')) return '👔';
            if (name.includes('servidor')) return '💥';
            if (name.includes('hackathon')) return '🏆';
            if (name.includes('viral')) return '📱';
            if (name.includes('pivotar')) return '🔄';
            if (name.includes('ruleta')) return '🎰';
            if (name.includes('legal')) return '⚖️';
            if (name.includes('review')) return '📰';
            if (name.includes('inversión') || name.includes('inversion')) return '💎';
            if (name.includes('bug')) return '🐛';
            if (name.includes('premio')) return '🏅';
            if (name.includes('cancela')) return '📉';
            if (name.includes('marketing')) return '📣';
            if (name.includes('turno')) return '⭐';
            if (name.includes('cto')) return '👋';
            if (name.includes('webinar')) return '💻';
            if (name.includes('oficina')) return '🏢';
            if (name.includes('bolsa')) return '📊';
            if (name.includes('inversionista')) return '🤝';
            if (name.includes('subsidio')) return '🏦';
            if (name.includes('financ')) return '🔥';
            if (name.includes('deuda')) return '⚙️';
            if (name.includes('partner')) return '🤝';
            if (name.includes('competidor')) return '⚔️';
            if (name.includes('empleado')) return '😢';
            if (name.includes('serie')) return '💸';
            if (name.includes('mentor')) return '🎓';
            if (name.includes('retrocede')) return '⏪';
            if (name.includes('expan')) return '🌎';
            if (name.includes('crisis')) return '💔';
            if (name.includes('adquisición') || name.includes('adquisicion')) return '🏰';
            if (name.includes('ipo') || name.includes('salida')) return '🎉';
        }

        // Fallback by type
        switch (type) {
            case 'positive': return '💰';
            case 'negative': return '⚠️';
            case 'decision': return '🤔';
            case 'event': return '⚡';
            case 'roulette': return '🎰';
            case 'special': return '✨';
            default: return '⬡';
        }
    }

    draw(gameState, highlightTile = -1, litTiles = []) {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.w, this.h);

        // Center area
        this.drawCenter(ctx);

        // Draw path connections
        this.drawPath(ctx);

        // Draw tiles
        for (let i = 0; i < this.tilePositions.length && i < TILES.length; i++) {
            const isLit = litTiles.includes(i);
            this.drawTile(ctx, i, i === highlightTile, isLit);
        }

        // Draw tokens
        if (gameState && gameState.players) {
            for (const player of gameState.players) {
                if (!player.alive) continue;
                this.drawToken(ctx, player, player.index === gameState.currentPlayerIndex);
            }
        }
    }

    drawCenter(ctx) {
        const cx = this.w / 2;
        const cy = this.h / 2;

        // Clear canvas (transparent — game-screen has the green bg)
        ctx.clearRect(0, 0, this.w, this.h);

        // Skip deck drawing if hidden (during dice roll)
        if (this.hideDeck) return;

        // Card deck visual — stack of cards face down
        const deckX = cx - 100;
        const deckY = cy - 140;
        const cardW = 200;
        const cardH = 280;

        // Shadow cards (stack effect) — 2 cards behind
        for (let i = 2; i >= 0; i--) {
            const ox = i * 3;
            const oy = i * 3;
            ctx.beginPath();
            ctx.roundRect(deckX + ox, deckY + oy, cardW, cardH, 8);
            ctx.fillStyle = i === 0 ? '#1a1a3e' : `rgba(15, 15, 35, 0.9)`;
            ctx.fill();
            ctx.strokeStyle = i === 0 ? 'rgba(74, 158, 255, 0.5)' : 'rgba(74, 158, 255, 0.35)';
            ctx.lineWidth = i === 0 ? 2 : 1.5;
            ctx.stroke();
        }

        // Card back pattern on top card
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(deckX, deckY, cardW, cardH, 8);
        ctx.clip();

        // Diamond pattern
        ctx.strokeStyle = 'rgba(74, 158, 255, 0.12)';
        ctx.lineWidth = 1;
        for (let i = -cardH; i < cardW + cardH; i += 14) {
            ctx.beginPath();
            ctx.moveTo(deckX + i, deckY);
            ctx.lineTo(deckX + i + cardH, deckY + cardH);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(deckX + i, deckY + cardH);
            ctx.lineTo(deckX + i + cardH, deckY);
            ctx.stroke();
        }
        ctx.restore();

        // "Startup Life" on top card
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(74, 158, 255, 0.4)';
        ctx.fillText('Startup Life', cx, cy);
    }

    drawPath(ctx) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(74, 158, 255, 0.45)';
        ctx.lineWidth = 3;
        for (let i = 0; i < this.tilePositions.length; i++) {
            const p = this.tilePositions[i];
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
    }

    drawTile(ctx, index, isHighlight, isLit = false) {
        const pos = this.tilePositions[index];
        if (!pos) return;
        const tile = TILES[index];
        if (!tile) return;
        const colors = this.getTileColors(tile.type);
        const x = pos.x - pos.w / 2;
        const y = pos.y - pos.h / 2;
        const r = 8;

        // Glow for highlight (current tile) or lit (trail)
        if (isHighlight) {
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 22;
        } else if (isLit) {
            ctx.shadowColor = colors.border;
            ctx.shadowBlur = 14;
        }

        // Outer border (always visible white line)
        ctx.beginPath();
        ctx.roundRect(x - 1, y - 1, pos.w + 2, pos.h + 2, r + 1);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Solid background to cover the path line underneath
        ctx.beginPath();
        ctx.roundRect(x, y, pos.w, pos.h, r);
        ctx.fillStyle = '#0a0a14';
        ctx.fill();

        // Background
        ctx.beginPath();
        ctx.roundRect(x, y, pos.w, pos.h, r);
        ctx.fillStyle = isLit ? colors.border + '40' : colors.bg;
        ctx.fill();
        ctx.strokeStyle = isHighlight ? '#ffffff' : (isLit ? '#ffffff' : colors.border);
        ctx.lineWidth = isHighlight ? 3 : 2;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Emoji icon
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.getTileEmoji(tile.type, tile), pos.x, pos.y - 10);

        // Tile name — adapt to tile width
        const maxChars = Math.floor(pos.w / 6.5);
        const name = tile.name.length > maxChars
            ? tile.name.slice(0, maxChars - 1) + '…'
            : tile.name;
        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(name, pos.x, pos.y + 18);
    }

    drawToken(ctx, player, isCurrent) {
        const pos = this.tilePositions[player.tileIndex];
        if (!pos) return;
        const offset = this.getPlayerOffset(player.index);

        // Check if this token has an active animation
        let x, y;
        const anim = this.tokenAnimations[player.index];
        if (anim) {
            const elapsed = Date.now() - anim.startTime;
            const t = Math.min(elapsed / anim.duration, 1);
            // Ease-out cubic for smooth deceleration
            const ease = 1 - Math.pow(1 - t, 3);
            x = anim.fromX + (anim.toX - anim.fromX) * ease + offset.x;
            y = anim.fromY + (anim.toY - anim.fromY) * ease + offset.y;
            // Clean up finished animation
            if (t >= 1) {
                delete this.tokenAnimations[player.index];
            }
        } else {
            x = pos.x + offset.x;
            y = pos.y + offset.y;
        }

        const radius = 11;

        // Pulsating opacity — subtle
        const pulse = 0.8 + Math.sin(Date.now() / 300) * 0.2;
        ctx.globalAlpha = pulse;

        // Shadow
        ctx.beginPath();
        ctx.arc(x + 1, y + 1, radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fill();

        // Token body
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        const g = ctx.createRadialGradient(x - 3, y - 3, 1, x, y, radius);
        g.addColorStop(0, '#ffffff90');
        g.addColorStop(0.35, player.color);
        g.addColorStop(1, player.color + 'cc');
        ctx.fillStyle = g;
        ctx.fill();

        // Border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.globalAlpha = 1.0;

        // Letter (always full opacity)
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#fff';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 3;
        ctx.fillText(player.startup[0], x, y);
        ctx.shadowBlur = 0;
    }

    getPlayerOffset(index) {
        const offsets = [
            { x: -16, y: -12 },
            { x: 16, y: -12 },
            { x: -16, y: 16 },
            { x: 16, y: 16 }
        ];
        return offsets[index] || { x: 0, y: 0 };
    }

    async animateTokenMove(player, fromTile, toTile) {
        const fromPos = this.tilePositions[fromTile];
        const toPos = this.tilePositions[toTile];
        if (!fromPos || !toPos) return;

        const duration = 300; // ms per tile step
        this.tokenAnimations[player.index] = {
            fromX: fromPos.x,
            fromY: fromPos.y,
            toX: toPos.x,
            toY: toPos.y,
            startTime: Date.now(),
            duration
        };

        // Wait for the animation to complete
        return new Promise(resolve => setTimeout(resolve, duration));
    }
}
