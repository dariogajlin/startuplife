// === WEBCAM & GESTURE DETECTION ===
// Requires deliberate, fast hand movements — ignores head/body motion

class WebcamGestures {
    constructor() {
        this.video = $('#webcam-video');
        this.canvas = $('#webcam-canvas');
        this.statusDot = $('.status-dot');
        this.statusText = $('#webcam-status-text');
        this.feedbackEl = $('#gesture-feedback');
        this.active = false;
        this.onThrow = null;
        this.onSpin = null;
        this.onHighFive = null;
        this.onFingerCount = null; // callback(count) for decision selection
        this.lastGestureTime = 0;
        this.cooldown = 1500; // 1.5 seconds between gestures
        this.prevFrame = null;
        this.motionHistory = [];
        this.highFiveState = { wasStill: false, flashDetected: false };
        this.fingerDetection = { active: false, lastCount: 0, stableFrames: 0 };
    }

    async init() {
        try {
            // Reuse existing stream if available (from photo capture)
            let stream = window.game?._webcamStream;
            if (!stream) {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 320, height: 240, facingMode: 'user' }
                });
            }
            this.video.srcObject = stream;
            this.active = true;
            this.statusDot.classList.add('active');
            this.statusText.textContent = 'Webcam activa';
            this.overlayEl = $('#webcam-overlay');
            this.setBorderState('idle');

            this.video.addEventListener('loadeddata', () => {
                this.startDetection();
            });
        } catch (e) {
            console.log('Webcam not available:', e.message);
            this.statusText.textContent = 'Usar mouse';
            this.active = false;
        }
    }

    startDetection() {
        this.canvas.width = 320;
        this.canvas.height = 240;
        const ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        this.frameCount = 0;
        this.lastGestureTime = 0;
        this.motionHistory = [];

        const detect = () => {
            if (!this.active) return;

            ctx.drawImage(this.video, 0, 0, 320, 240);
            const frame = ctx.getImageData(0, 0, 320, 240);

            this.frameCount++;
            // Ignore first 60 frames to let webcam fully stabilize
            if (this.prevFrame && this.frameCount > 60) {
                this.analyzeMotion(frame);
            }

            this.prevFrame = frame;
            requestAnimationFrame(detect);
        };

        detect();
    }

    analyzeMotion(frame) {
        const prev = this.prevFrame;
        const width = 320;
        const height = 240;
        const step = 8; // Sample every 8th pixel for performance

        // Only analyze the LOWER HALF of the frame (hands area, not face)
        // This prevents head movement from triggering
        const startY = Math.floor(height * 0.4); // Start from 40% down
        let totalMotion = 0;
        let motionCenterX = 0;
        let motionCenterY = 0;
        let motionPixels = 0;

        for (let y = startY; y < height; y += step) {
            for (let x = 0; x < width; x += step) {
                const i = (y * width + x) * 4;
                const dr = Math.abs(frame.data[i] - prev.data[i]);
                const dg = Math.abs(frame.data[i + 1] - prev.data[i + 1]);
                const db = Math.abs(frame.data[i + 2] - prev.data[i + 2]);
                const diff = (dr + dg + db) / 3;

                // Threshold: count significant pixel changes
                if (diff > 20) {
                    totalMotion++;
                    motionCenterX += x;
                    motionCenterY += y;
                    motionPixels++;
                }
            }
        }

        if (motionPixels > 0) {
            motionCenterX /= motionPixels;
            motionCenterY /= motionPixels;
        }

        const now = Date.now();
        this.motionHistory.push({
            motion: totalMotion,
            cx: motionCenterX,
            cy: motionCenterY,
            time: now
        });

        // Keep only last 500ms of history
        this.motionHistory = this.motionHistory.filter(m => now - m.time < 500);

        // Side gesture detection runs independently (no cooldown needed)
        // (disabled - not reliable enough)

        // Check for gestures (need cooldown to have passed)
        if (now - this.lastGestureTime < this.cooldown) return;
        if (this.motionHistory.length < 3) return;

        // Update border: cyan when motion detected in hand area
        if (totalMotion > 50 && (this.onThrow || this.onSpin || this.onHighFive || this.onFingerCount)) {
            this.setBorderState('detecting');
        }

        this.detectGestures();
        this.detectHighFive(totalMotion);
    }

    detectGestures() {
        const recent = this.motionHistory.slice(-5);
        const avgMotion = recent.reduce((s, m) => s + m.motion, 0) / recent.length;

        // Minimum motion threshold - require strong deliberate movement
        if (avgMotion < 100) return;

        // Check direction of motion
        const first = recent[0];
        const last = recent[recent.length - 1];
        const dy = last.cy - first.cy;
        const dx = last.cx - first.cx;

        // If waiting for SPIN: horizontal motion triggers it
        if (this.onSpin && Math.abs(dx) > 20) {
            this.triggerGesture('spin');
            return;
        }

        // If waiting for THROW: strong downward motion triggers it
        if (this.onThrow && avgMotion > 120 && dy > 5) {
            this.triggerGesture('throw');
            return;
        }
    }

    triggerGesture(type) {
        this.lastGestureTime = Date.now();
        this.motionHistory = []; // Clear history after gesture

        // Flash green border on gesture detection
        this.setBorderState('gesture');
        setTimeout(() => this.setBorderState('idle'), 1500);

        if (type === 'throw' && this.onThrow) {
            this.showFeedback('🎲 Lanzamiento!');
            this.onThrow();
            this.onThrow = null; // One-shot
        } else if (type === 'spin' && this.onSpin) {
            this.showFeedback('🎰 Giro!');
            this.onSpin();
            this.onSpin = null; // One-shot
        } else if (type === 'highfive' && this.onHighFive) {
            this.showFeedback('✋ High Five!');
            Sounds.playSlap();
            this.onHighFive();
            this.onHighFive = null; // One-shot
        }
    }

    // Detect "high five" — hand suddenly appears (big motion burst)
    // then stays still (low motion) = palm held towards camera
    detectHighFive(currentMotion) {
        if (!this.onHighFive) return; // Only detect when waiting for it

        const state = this.highFiveState;

        if (!state.flashDetected) {
            // Phase 1: detect a big burst of motion (hand comes into frame)
            if (currentMotion > 150) {
                state.flashDetected = true;
                state.flashTime = Date.now();
            }
        } else {
            // Phase 2: after the burst, check if motion drops (hand is still = palm held)
            const elapsed = Date.now() - state.flashTime;
            if (elapsed > 200 && elapsed < 1000) {
                if (currentMotion < 40) {
                    // Low motion after burst = palm held still = high five!
                    state.flashDetected = false;
                    state.wasStill = false;
                    this.triggerGesture('highfive');
                }
            } else if (elapsed >= 1000) {
                // Timeout — reset
                state.flashDetected = false;
            }
        }
    }

    showFeedback(text) {
        this.feedbackEl.innerHTML = text;
        this.feedbackEl.classList.add('show');
        setTimeout(() => this.feedbackEl.classList.remove('show'), 1500);
    }

    // Detect which side of the frame has motion for option selection
    // Wave left = option 1, wave right = option 2
    detectFingers(frame) {
        // Not used - detection happens in analyzeMotion via detectSideGesture
    }

    isSkinColor(r, g, b) {
        return false;
    }

    // Called from analyzeMotion when onFingerCount is set
    // Up motion = option 1, Down motion = option 2
    detectSideGesture(frame) {
        if (!this.onFingerCount) return;
        if (this.motionHistory.length < 3) return;

        const recent = this.motionHistory.slice(-4);
        const avgMotion = recent.reduce((s, m) => s + m.motion, 0) / recent.length;

        // Need some motion
        if (avgMotion < 50) {
            this.fingerDetection.stableFrames = 0;
            this.fingerDetection.lastCount = 0;
            return;
        }

        // Check vertical direction
        const first = recent[0];
        const last = recent[recent.length - 1];
        const dy = last.cy - first.cy;

        let detected = 0;
        if (dy < -15) {
            detected = 1; // Motion going UP = option 1
        } else if (dy > 15) {
            detected = 2; // Motion going DOWN = option 2
        }

        if (detected > 0 && detected === this.fingerDetection.lastCount) {
            this.fingerDetection.stableFrames++;
        } else if (detected > 0) {
            this.fingerDetection.lastCount = detected;
            this.fingerDetection.stableFrames = 1;
        } else {
            this.fingerDetection.stableFrames = 0;
        }

        // Stable for 4 frames = confirmed
        if (this.fingerDetection.stableFrames >= 4 && detected > 0) {
            this.fingerDetection.stableFrames = 0;
            this.fingerDetection.lastCount = 0;
            this.lastGestureTime = Date.now();
            if (this.onFingerCount) {
                this.showFeedback(detected === 1 ? '☝️ Opción 1' : '👇 Opción 2');
                this.setBorderState('gesture');
                setTimeout(() => this.setBorderState('idle'), 1500);
                this.onFingerCount(detected);
                this.onFingerCount = null;
            }
        }
    }

    // Remove MediaPipe methods (not used)
    initMediaPipeHands() {}
    onHandResults() {}
    countFingers() { return 0; }

    // Set webcam border visual state
    setBorderState(state) {
        if (!this.overlayEl) this.overlayEl = $('#webcam-overlay');
        if (!this.overlayEl) return;
        this.overlayEl.classList.remove('webcam-idle', 'webcam-detecting', 'webcam-gesture', 'webcam-waiting');
        if (state) {
            this.overlayEl.classList.add(`webcam-${state}`);
        }
    }
}
