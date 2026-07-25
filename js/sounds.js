// === SOUND EFFECTS (Web Audio API — no external files) ===

class SoundSystem {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    init() {
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            this.enabled = false;
        }
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // Dice rolling — rattling percussion
    playDiceRoll() {
        if (!this.enabled || !this.ctx) return;
        this.resume();

        const duration = 2.5;
        const now = this.ctx.currentTime;

        // Multiple short clicks that slow down
        const clicks = 18;
        for (let i = 0; i < clicks; i++) {
            const t = (i / clicks) * duration;
            const spacing = 0.05 + (i / clicks) * 0.15;
            const time = now + t + spacing * i * 0.3;
            const volume = 0.3 - (i / clicks) * 0.2;
            this._click(time, 200 + Math.random() * 300, volume, 0.04);
        }

        // Final thud when dice lands
        this._thud(now + duration - 0.1, 0.4);
    }

    // Token step — short pop/click
    playTokenStep() {
        if (!this.enabled || !this.ctx) return;
        this.resume();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.08);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        osc.start(now);
        osc.stop(now + 0.1);
    }

    // Card flip — whoosh + paper sound
    playCardFlip() {
        if (!this.enabled || !this.ctx) return;
        this.resume();

        const now = this.ctx.currentTime;

        // Whoosh (filtered noise)
        const bufferSize = this.ctx.sampleRate * 0.4;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            const t = i / bufferSize;
            data[i] = (Math.random() * 2 - 1) * (1 - t) * Math.sin(t * Math.PI);
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2000, now);
        filter.frequency.exponentialRampToValueAtTime(800, now + 0.3);
        filter.Q.value = 1.5;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start(now);

        // Snap at the end
        this._click(now + 0.25, 1200, 0.15, 0.02);
    }

    // Roulette spinning — ticks that decelerate
    playRouletteSpin(duration = 3000) {
        if (!this.enabled || !this.ctx) return;
        this.resume();

        const now = this.ctx.currentTime;
        const totalTicks = 25;

        for (let i = 0; i < totalTicks; i++) {
            // Ticks get further apart as the wheel slows
            const t = i / totalTicks;
            const spacing = 0.05 + t * t * 0.25;
            let time = now;
            for (let j = 0; j <= i; j++) {
                time += 0.05 + (j / totalTicks) * (j / totalTicks) * 0.25;
            }

            if (time - now > duration / 1000) break;

            const freq = 800 - t * 400;
            const vol = 0.25 - t * 0.15;
            this._click(time, freq, Math.max(vol, 0.05), 0.03);
        }
    }

    // Dice result — melodic "ta-daa" two-note chime
    playDiceResult() {
        if (!this.enabled || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;

        // Bell: two sine tones, 880Hz and 1320Hz
        const playTone = (freq, dur) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(0.8, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
            osc.start(now);
            osc.stop(now + dur + 0.01);
        };

        playTone(880, 0.3);
        playTone(1320, 0.2);
    }

    // Slap / hit — short dry thud
    playSlap() {
        if (!this.enabled || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;
        this._thud(now, 0.6);
    }

    // Victory fanfare — ascending triumphant notes
    playVictory(startOffset = 0) {
        if (!this.enabled || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime + startOffset;

        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.type = 'sine';
            osc.frequency.value = freq;
            const start = now + i * 0.45;
            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(0.4, start + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 2.4);
            osc.start(start);
            osc.stop(start + 2.5);
        });

        // Final chord
        const chordNotes = [523.25, 659.25, 783.99];
        chordNotes.forEach(freq => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.type = 'triangle';
            osc.frequency.value = freq;
            const start = now + 2.0;
            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(0.3, start + 0.2);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 6);
            osc.start(start);
            osc.stop(start + 6.1);
        });
    }

    // Camera shutter sound
    playCameraShutter() {
        if (!this.enabled || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;

        // Sharp click
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = 'square';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.03);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.07);

        // Mechanical noise
        const bufferSize = this.ctx.sampleRate * 0.08;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const nGain = this.ctx.createGain();
        nGain.gain.setValueAtTime(0.3, now + 0.02);
        nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        noise.connect(nGain);
        nGain.connect(this.ctx.destination);
        noise.start(now + 0.02);
    }

    // Firework explosion — burst of noise with pitch sweep
    playFirework() {
        if (!this.enabled || !this.ctx) return;
        this.resume();
        const now = this.ctx.currentTime;

        // Launch whistle
        const whistle = this.ctx.createOscillator();
        const whistleGain = this.ctx.createGain();
        whistle.connect(whistleGain);
        whistleGain.connect(this.ctx.destination);
        whistle.type = 'sine';
        whistle.frequency.setValueAtTime(400, now);
        whistle.frequency.exponentialRampToValueAtTime(2000, now + 0.15);
        whistleGain.gain.setValueAtTime(0.15, now);
        whistleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        whistle.start(now);
        whistle.stop(now + 0.16);

        // Explosion — burst of filtered noise
        const bufferSize = this.ctx.sampleRate * 0.6;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            const t = i / bufferSize;
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 2);
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1000 + Math.random() * 500, now + 0.15);
        filter.Q.value = 0.8;

        const expGain = this.ctx.createGain();
        expGain.gain.setValueAtTime(0, now);
        expGain.gain.setValueAtTime(0.35, now + 0.15);
        expGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

        noise.connect(filter);
        filter.connect(expGain);
        expGain.connect(this.ctx.destination);
        noise.start(now + 0.12);

        // Crackle — tiny high-frequency pops
        for (let i = 0; i < 5; i++) {
            const t = now + 0.2 + Math.random() * 0.4;
            this._click(t, 3000 + Math.random() * 2000, 0.08, 0.02);
        }
    }

    // --- Internal helpers ---

    _click(time, freq, volume, duration) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(volume, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

        osc.start(time);
        osc.stop(time + duration + 0.01);
    }

    _thud(time, volume) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(60, time + 0.15);
        gain.gain.setValueAtTime(volume, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

        osc.start(time);
        osc.stop(time + 0.25);
    }
}

// Global instance
const Sounds = new SoundSystem();

// === AMBIENT MUSIC (procedural lo-fi ambient loop) ===
class AmbientMusic {
    constructor() {
        this.ctx = null;
        this.playing = false;
        this.nodes = [];
        this.masterGain = null;
    }

    start() {
        if (this.playing) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) { return; }

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.28;
        this.masterGain.connect(this.ctx.destination);

        this.playing = true;
        this._playPad();
        this._playArpeggio();
    }

    stop() {
        this.playing = false;
        if (this.masterGain) {
            this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1);
        }
        setTimeout(() => {
            this.nodes.forEach(n => { try { n.stop(); } catch(e){} });
            this.nodes = [];
            if (this.ctx) this.ctx.close();
            this.ctx = null;
        }, 1200);
    }

    setVolume(vol) {
        if (this.masterGain) this.masterGain.gain.value = vol;
    }

    _playPad() {
        if (!this.playing || !this.ctx) return;
        // Soft evolving pad with two detuned oscillators
        const notes = [130.81, 146.83, 164.81, 174.61]; // C3, D3, E3, F3
        const note = notes[Math.floor(Math.random() * notes.length)];
        const duration = 4 + Math.random() * 2;
        const now = this.ctx.currentTime;

        for (let detune of [-6, 6]) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            osc.type = 'sine';
            osc.frequency.value = note;
            osc.detune.value = detune;

            filter.type = 'lowpass';
            filter.frequency.value = 400 + Math.random() * 200;

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.6, now + 1.5);
            gain.gain.linearRampToValueAtTime(0, now + duration);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);

            osc.start(now);
            osc.stop(now + duration + 0.1);
            this.nodes.push(osc);
        }

        setTimeout(() => this._playPad(), duration * 800);
    }

    _playArpeggio() {
        if (!this.playing || !this.ctx) return;
        // Soft plucked notes, pentatonic scale
        const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; // C4 pentatonic-ish
        const note = scale[Math.floor(Math.random() * scale.length)];
        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.value = note;

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 1.3);
        this.nodes.push(osc);

        // Random interval between notes (lo-fi rhythm)
        const nextDelay = 800 + Math.random() * 2200;
        setTimeout(() => this._playArpeggio(), nextDelay);
    }
}

const Music = new AmbientMusic();
