// === MAIN ENTRY POINT ===

let game;
let globalWebcamStream = null;

document.addEventListener('DOMContentLoaded', () => {
    // Start particle background
    const particles = new ParticleSystem($('#particles-bg'));
    particles.start();

    // Menu controls
    const playerSlider = $('#player-count');
    const aiSlider = $('#ai-count');
    const playerVal = $('#player-count-val');
    const aiVal = $('#ai-count-val');
    const playerNamesDiv = $('#player-names');

    function updateNameFields() {
        const total = parseInt(playerSlider.value);
        const aiCount = parseInt(aiSlider.value);
        const humanCount = total - aiCount;
        playerNamesDiv.innerHTML = '';

        for (let i = 0; i < humanCount; i++) {
            const row = document.createElement('div');
            row.className = 'option-row';
            row.innerHTML = `
                <label>Startup ${i + 1}</label>
                <input type="text" class="player-name-input" placeholder="Nombre startup"
                       value="${PLAYER_CONFIGS[i]?.startup || 'Startup ' + (i+1)}"
                       maxlength="12">
            `;
            playerNamesDiv.appendChild(row);
        }

        // Focus first input
        const firstInput = playerNamesDiv.querySelector('.player-name-input');
        if (firstInput) firstInput.focus();
    }

    function enforceAIMax() {
        const total = parseInt(playerSlider.value);
        // IA can be 0 to total - 1 (at least 1 human always)
        aiSlider.max = total - 1;
        aiSlider.min = 0;
        if (parseInt(aiSlider.value) > total - 1) {
            aiSlider.value = total - 1;
            aiVal.textContent = aiSlider.value;
        }
    }

    playerSlider.addEventListener('input', () => {
        playerVal.textContent = playerSlider.value;
        enforceAIMax();
        updateNameFields();
    });

    aiSlider.addEventListener('input', () => {
        aiVal.textContent = aiSlider.value;
        updateNameFields();
    });

    enforceAIMax();
    updateNameFields();

    // Start button
    $('#btn-start').addEventListener('click', async () => {
        $('#btn-start').disabled = true;
        $('#btn-start').style.opacity = '0.5';
        $('#btn-how-to-play').disabled = true;
        $('#btn-how-to-play').style.opacity = '0.5';
        Sounds.init();
        Music.start();
        const playerCount = parseInt(playerSlider.value);
        const aiCount = parseInt(aiSlider.value);
        const humanCount = playerCount - aiCount;

        // Get custom names
        const nameInputs = document.querySelectorAll('.player-name-input');
        const customNames = [];
        nameInputs.forEach(input => {
            customNames.push(input.value.trim() || input.placeholder);
        });

        // Ask each human player for photo
        const photos = {};
        for (let i = 0; i < humanCount; i++) {
            const result = await askForPhoto(customNames[i] || `Jugador ${i + 1}`);
            if (result) {
                photos[i] = result.photo;
            }
        }

        game = new Game();
        window.game = game;
        window.game._playerPhotos = photos;
        window.game._webcamStream = globalWebcamStream;
        game.start(playerCount, aiCount, customNames);
    });

    // Replay button
    $('#btn-replay').addEventListener('click', () => {
        showScreen('main-menu');
    });

    // Mute button
    $('#mute-btn').addEventListener('click', (e) => {
        e.stopImmediatePropagation();
        Debug.toggleMusic();
    });

    // Photo capture function
    async function askForPhoto(playerName) {
        // Ensure webcam stream is available
        if (!globalWebcamStream) {
            try {
                globalWebcamStream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 320, height: 240, facingMode: 'user' }
                });
            } catch (e) {
                return null;
            }
        }

        return new Promise(resolve => {
            const overlay = document.createElement('div');
            overlay.id = 'photo-overlay';
            overlay.innerHTML = `
                <div class="photo-container">
                    <h2 class="photo-title">📸 ${playerName}</h2>
                    <p class="photo-subtitle">¿Querés sacarte una foto como CEO de tu startup ${playerName}?</p>
                    <div class="photo-preview-area">
                        <div id="photo-loading">Iniciando cámara...</div>
                        <video id="photo-video" autoplay playsinline style="display:none"></video>
                        <canvas id="photo-canvas"></canvas>
                        <img id="photo-result" class="hidden" />
                    </div>
                    <div class="photo-buttons">
                        <button id="photo-skip" class="btn-secondary"><span class="btn-text">SALTAR</span></button>
                        <button id="photo-capture" class="btn-primary" disabled><span class="btn-text">SACAR FOTO</span><span class="btn-glow"></span></button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            const video = overlay.querySelector('#photo-video');
            const canvas = overlay.querySelector('#photo-canvas');
            const resultImg = overlay.querySelector('#photo-result');
            const loadingEl = overlay.querySelector('#photo-loading');
            const captureBtn = overlay.querySelector('#photo-capture');
            let capturedData = null;

            video.srcObject = globalWebcamStream;
            video.addEventListener('loadeddata', () => {
                loadingEl.style.display = 'none';
                video.style.display = 'block';
                captureBtn.disabled = false;
            });

            overlay.querySelector('#photo-skip').addEventListener('click', () => {
                overlay.remove();
                resolve(null);
            });

            overlay.querySelector('#photo-capture').addEventListener('click', () => {
                if (!capturedData) {
                    // Take photo - flash effect then capture
                    const flashEl = document.createElement('div');
                    flashEl.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:#fff;opacity:0.4;transition:opacity 0.2s ease-out;z-index:5;border-radius:12px;';
                    overlay.querySelector('.photo-preview-area').appendChild(flashEl);

                    Sounds.playCameraShutter();

                    setTimeout(() => {
                        canvas.width = 320;
                        canvas.height = 240;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(video, 0, 0, 320, 240);
                        capturedData = canvas.toDataURL('image/png');
                        resultImg.src = capturedData;
                        resultImg.classList.remove('hidden');
                        video.classList.add('hidden');
                        flashEl.style.opacity = '0';
                        setTimeout(() => flashEl.remove(), 200);

                        // Show LISTO and REPETIR buttons
                        overlay.querySelector('#photo-capture .btn-text').textContent = 'LISTO';
                        let retakeBtn = overlay.querySelector('#photo-retake');
                        if (!retakeBtn) {
                            retakeBtn = document.createElement('button');
                            retakeBtn.id = 'photo-retake';
                            retakeBtn.className = 'btn-secondary';
                            retakeBtn.innerHTML = '<span class="btn-text">REPETIR</span>';
                            retakeBtn.addEventListener('click', () => {
                                capturedData = null;
                                resultImg.classList.add('hidden');
                                video.classList.remove('hidden');
                                overlay.querySelector('#photo-capture .btn-text').textContent = 'SACAR FOTO';
                                retakeBtn.remove();
                            });
                            overlay.querySelector('.photo-buttons').insertBefore(retakeBtn, overlay.querySelector('#photo-capture'));
                        }
                    }, 300);
                } else {
                    // Confirm
                    overlay.remove();
                    resolve({ photo: capturedData });
                }
            });
        });
    }
});
