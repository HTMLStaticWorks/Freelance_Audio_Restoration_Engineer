/* 
    ==================================================
    ALEX REED PORTFOLIO - TECHNICAL AUDIO RESTORATION PLAYER
    ==================================================
*/

class AudioRestorationPlayer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.isPlaying = false;
        this.currentMode = 'after'; // 'after' = Restored, 'before' = Original
        
        // Web Audio API contexts
        this.audioCtx = null;
        this.synthInterval = null;
        
        // Audio Nodes
        this.masterGain = null;
        this.synthGain = null;
        this.noiseGain = null;
        this.humOsc = null;
        this.humGain = null;
        this.hissNode = null;
        this.hissGain = null;
        this.clickNode = null;
        this.clickGain = null;
        this.analyser = null;
        
        // Sequencer settings
        this.notes = [261.63, 329.63, 392.00, 523.25, 440.00, 349.23, 392.00, 261.63]; // C4, E4, G4, C5, A4, F4, G4, C4
        this.noteIndex = 0;
        this.tempo = 450; // ms per note
        
        this.init();
    }

    init() {
        this.container.innerHTML = `
            <div class="player-inner tech-border-accent tech-grid-bg p-4 rounded-3">
                <div class="d-flex justify-content-between align-items-center mb-3 border-bottom border-secondary border-opacity-25 pb-2">
                    <div>
                        <span class="tech-spec-label tech-font">System Diagnostic:</span>
                        <span class="badge bg-dark border border-secondary text-accent ms-2 tech-font pulse-dot-parent">
                            <span class="pulse-dot me-2"></span>ONLINE
                        </span>
                    </div>
                    <div>
                        <span class="tech-spec-label tech-font">Filter Chain:</span>
                        <span class="text-white ms-2 small tech-font" id="filter-status">de-hum, de-hiss, de-click</span>
                    </div>
                </div>

                <div class="mode-toggle mb-4 d-flex justify-content-center">
                    <div class="btn-group p-1 bg-black rounded-pill border border-secondary border-opacity-50">
                        <button class="btn btn-sm rounded-pill px-4 mode-btn active tech-font" data-mode="after">
                            <i class="bi bi-shield-check me-2 text-accent"></i>Restored Signal
                        </button>
                        <button class="btn btn-sm rounded-pill px-4 mode-btn tech-font" data-mode="before">
                            <i class="bi bi-exclamation-triangle me-2 text-warning"></i>Original Damaged
                        </button>
                    </div>
                </div>
                
                <div class="waveform-container position-relative overflow-hidden mb-3" style="height: 150px; background: #020617; border: 1px solid rgba(56, 189, 248, 0.15); border-radius: var(--radius-sm);">
                    <canvas id="spectral-canvas" class="w-100 h-100"></canvas>
                    <div class="position-absolute bottom-0 start-0 w-100 p-2 d-flex justify-content-between pointer-events-none" style="background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); font-size: 0.65rem;">
                        <span class="text-muted tech-font">0 Hz</span>
                        <span class="text-muted tech-font">1.0 kHz</span>
                        <span class="text-muted tech-font">3.5 kHz</span>
                        <span class="text-muted tech-font">8.0 kHz</span>
                        <span class="text-muted tech-font">20 kHz</span>
                    </div>
                </div>

                <div class="controls d-flex flex-wrap align-items-center justify-content-between gap-3 mt-3">
                    <div class="main-btns d-flex align-items-center gap-3">
                        <button class="btn-play bg-accent p-3 rounded-circle border-0 glow-border" title="Play Synthesized Showcase">
                            <i class="bi bi-play-fill text-dark fs-4" style="padding-left: 2px;"></i>
                        </button>
                        <div>
                            <div class="time-display small text-white tech-font">0:00 / SYNTH</div>
                            <div class="text-muted x-small tech-font">Real-time Web Audio Synthesizer</div>
                        </div>
                    </div>
                    
                    <div class="volume-ctrl d-flex align-items-center gap-2 bg-dark bg-opacity-50 p-2 rounded border border-secondary border-opacity-25">
                        <i class="bi bi-volume-up text-muted"></i>
                        <input type="range" class="form-range" style="width: 80px;" min="0" max="1" step="0.05" value="0.7" id="player-volume">
                    </div>
                </div>

                <!-- Live Parameter Controls -->
                <div class="row g-2 mt-3 pt-3 border-top border-secondary border-opacity-25">
                    <div class="col-6 col-sm-3">
                        <div class="bg-black bg-opacity-40 p-2 rounded text-center border border-secondary border-opacity-10">
                            <div class="tech-spec-label x-small">60Hz Hum</div>
                            <div class="small fw-bold tech-font" id="hum-level-label" style="color: var(--spectral-orange);">0%</div>
                        </div>
                    </div>
                    <div class="col-6 col-sm-3">
                        <div class="bg-black bg-opacity-40 p-2 rounded text-center border border-secondary border-opacity-10">
                            <div class="tech-spec-label x-small">Hiss Floor</div>
                            <div class="small fw-bold tech-font" id="hiss-level-label" style="color: var(--spectral-orange);">0%</div>
                        </div>
                    </div>
                    <div class="col-6 col-sm-3">
                        <div class="bg-black bg-opacity-40 p-2 rounded text-center border border-secondary border-opacity-10">
                            <div class="tech-spec-label x-small">Vinyl Crackle</div>
                            <div class="small fw-bold tech-font" id="crackle-level-label" style="color: var(--spectral-orange);">0%</div>
                        </div>
                    </div>
                    <div class="col-6 col-sm-3">
                        <div class="bg-black bg-opacity-40 p-2 rounded text-center border border-secondary border-opacity-10">
                            <div class="tech-spec-label x-small">Signal THD</div>
                            <div class="small fw-bold tech-font text-success" id="thd-level-label"><0.001%</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.playBtn = this.container.querySelector('.btn-play');
        this.modeBtns = this.container.querySelectorAll('.mode-btn');
        this.timeDisplay = this.container.querySelector('.time-display');
        this.volumeInput = this.container.querySelector('#player-volume');
        this.canvas = this.container.querySelector('#spectral-canvas');
        this.canvasCtx = this.canvas.getContext('2d');
        
        this.bindEvents();
        this.setupCanvas();
    }

    bindEvents() {
        this.playBtn.addEventListener('click', () => this.togglePlay());
        
        this.modeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetBtn = e.target.closest('.mode-btn');
                if (!targetBtn) return;
                
                this.switchMode(targetBtn.getAttribute('data-mode'));
                this.modeBtns.forEach(b => b.classList.remove('active'));
                targetBtn.classList.add('active');
            });
        });

        this.volumeInput.addEventListener('input', (e) => {
            if (this.masterGain) {
                this.masterGain.gain.setValueAtTime(e.target.value, this.audioCtx.currentTime);
            }
        });

        window.addEventListener('resize', () => this.setupCanvas());
    }

    setupCanvas() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.drawSpectrogramEmpty();
    }

    drawSpectrogramEmpty() {
        const ctx = this.canvasCtx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, w, h);
        
        // Draw grid lines
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)';
        ctx.lineWidth = 1;
        
        // Vertical lines
        for (let i = 0; i < w; i += 40) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, h);
            ctx.stroke();
        }
        // Horizontal lines
        for (let i = 0; i < h; i += 30) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(w, i);
            ctx.stroke();
        }
        
        // Draw a flat baseline
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.beginPath();
        ctx.moveTo(0, h - 20);
        ctx.lineTo(w, h - 20);
        ctx.stroke();
    }

    initAudioContext() {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContextClass();
        
        // Create nodes
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.setValueAtTime(this.volumeInput.value, this.audioCtx.currentTime);
        
        this.synthGain = this.audioCtx.createGain();
        this.synthGain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
        
        this.noiseGain = this.audioCtx.createGain();
        this.noiseGain.gain.setValueAtTime(0.0, this.audioCtx.currentTime); // controlled by mode
        
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 512;
        
        // Connect routing chain
        this.synthGain.connect(this.masterGain);
        this.noiseGain.connect(this.masterGain);
        this.masterGain.connect(this.analyser);
        this.analyser.connect(this.audioCtx.destination);
        
        // Create noise sources
        this.setupHum();
        this.setupHiss();
        this.setupClicks();
        
        // Initialize state levels based on default mode
        this.updateNoiseLevels();
    }

    setupHum() {
        this.humOsc = this.audioCtx.createOscillator();
        this.humOsc.type = 'sine';
        this.humOsc.frequency.setValueAtTime(60, this.audioCtx.currentTime); // 60Hz hum
        
        this.humGain = this.audioCtx.createGain();
        this.humGain.gain.setValueAtTime(0.12, this.audioCtx.currentTime); // significant hum
        
        this.humOsc.connect(this.humGain);
        this.humGain.connect(this.noiseGain);
        this.humOsc.start();
    }

    setupHiss() {
        // Create white noise buffer
        const bufferSize = 2 * this.audioCtx.sampleRate;
        const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        this.hissNode = this.audioCtx.createBufferSource();
        this.hissNode.buffer = noiseBuffer;
        this.hissNode.loop = true;
        
        this.hissGain = this.audioCtx.createGain();
        this.hissGain.gain.setValueAtTime(0.08, this.audioCtx.currentTime); // hiss floor
        
        this.hissNode.connect(this.hissGain);
        this.hissGain.connect(this.noiseGain);
        this.hissNode.start();
    }

    setupClicks() {
        // Periodic click synthesis via ScriptProcessorNode or custom timer
        // Let's use a custom AudioWorklet or standard buffer impulses for simplicity.
        // For absolute compatibility, we'll create a 1-second buffer with periodic spike impulses
        const bufferSize = this.audioCtx.sampleRate; // 1 second
        const clickBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
        const output = clickBuffer.getChannelData(0);
        
        // Add crackle and sudden clicks
        for (let i = 0; i < bufferSize; i++) {
            output[i] = 0;
            // 4 random sharp clicks per second
            if (i === 5000 || i === 12000 || i === 25000 || i === 38000) {
                // Large impulse
                output[i] = Math.random() > 0.5 ? 0.8 : -0.8;
            } else if (Math.random() < 0.0005) {
                // Micro crackle
                output[i] = (Math.random() * 2 - 1) * 0.15;
            }
        }
        
        this.clickNode = this.audioCtx.createBufferSource();
        this.clickNode.buffer = clickBuffer;
        this.clickNode.loop = true;
        
        this.clickGain = this.audioCtx.createGain();
        this.clickGain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
        
        this.clickNode.connect(this.clickGain);
        this.clickGain.connect(this.noiseGain);
        this.clickNode.start();
    }

    updateNoiseLevels() {
        const humLbl = this.container.querySelector('#hum-level-label');
        const hissLbl = this.container.querySelector('#hiss-level-label');
        const crackleLbl = this.container.querySelector('#crackle-level-label');
        const thdLbl = this.container.querySelector('#thd-level-label');
        const filterStatus = this.container.querySelector('#filter-status');
        
        if (this.currentMode === 'before') {
            // Noise active
            if (this.noiseGain) {
                this.noiseGain.gain.setTargetAtTime(1.0, this.audioCtx.currentTime, 0.05);
            }
            humLbl.innerText = "85%";
            humLbl.style.color = "var(--spectral-orange)";
            hissLbl.innerText = "60%";
            hissLbl.style.color = "var(--spectral-orange)";
            crackleLbl.innerText = "40%";
            crackleLbl.style.color = "var(--spectral-orange)";
            thdLbl.innerText = "4.2%";
            thdLbl.className = "small fw-bold tech-font text-danger";
            if (filterStatus) {
                filterStatus.innerText = "BYPASSED (Unfiltered)";
                filterStatus.className = "text-warning ms-2 small tech-font";
            }
        } else {
            // Noise muted (Restored)
            if (this.noiseGain) {
                this.noiseGain.gain.setTargetAtTime(0.0, this.audioCtx.currentTime, 0.05);
            }
            humLbl.innerText = "0%";
            humLbl.style.color = "var(--text-muted)";
            hissLbl.innerText = "0%";
            hissLbl.style.color = "var(--text-muted)";
            crackleLbl.innerText = "0%";
            crackleLbl.style.color = "var(--text-muted)";
            thdLbl.innerText = "<0.001%";
            thdLbl.className = "small fw-bold tech-font text-success";
            if (filterStatus) {
                filterStatus.innerText = "ACTIVE (Surgical)";
                filterStatus.className = "text-accent ms-2 small tech-font";
            }
        }
    }

    togglePlay() {
        if (!this.audioCtx) {
            this.initAudioContext();
        }
        
        if (this.isPlaying) {
            // Pause
            this.audioCtx.suspend();
            clearInterval(this.synthInterval);
            this.playBtn.querySelector('i').className = 'bi bi-play-fill text-dark fs-4';
            this.playBtn.classList.remove('active');
            this.isPlaying = false;
        } else {
            // Play
            this.audioCtx.resume();
            this.startSequencer();
            this.playBtn.querySelector('i').className = 'bi bi-pause-fill text-dark fs-4';
            this.playBtn.classList.add('active');
            this.isPlaying = true;
            this.drawVisuals();
        }
    }

    startSequencer() {
        clearInterval(this.synthInterval);
        
        const playSynthNote = () => {
            if (!this.isPlaying || !this.audioCtx) return;
            
            const frequency = this.notes[this.noteIndex];
            this.noteIndex = (this.noteIndex + 1) % this.notes.length;
            
            // Synthesize note
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            
            // Choose nice warm triangle/sine synth shape
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);
            
            // Envelope
            const now = this.audioCtx.currentTime;
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.25, now + 0.05); // Attack
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4); // Release
            
            osc.connect(gain);
            gain.connect(this.synthGain);
            
            osc.start(now);
            osc.stop(now + 0.45);
        };
        
        // Trigger note immediately
        playSynthNote();
        this.synthInterval = setInterval(playSynthNote, this.tempo);
    }

    switchMode(mode) {
        if (this.currentMode === mode) return;
        this.currentMode = mode;
        
        if (this.audioCtx) {
            this.updateNoiseLevels();
        }
    }

    drawVisuals() {
        if (!this.isPlaying) return;
        
        requestAnimationFrame(() => this.drawVisuals());
        
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const w = this.canvas.width;
        const h = this.canvas.height;
        const ctx = this.canvasCtx;
        
        // Spectral/Frequency waterfall representation or glowing spectrogram bars
        if (this.currentMode === 'before') {
            this.analyser.getByteFrequencyData(dataArray);
            
            // Clear frame
            ctx.fillStyle = '#020617';
            ctx.fillRect(0, 0, w, h);
            
            // Draw grid lines
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.04)';
            ctx.lineWidth = 1;
            for (let i = 0; i < w; i += 40) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i, h);
                ctx.stroke();
            }
            for (let i = 0; i < h; i += 30) {
                ctx.beginPath();
                ctx.moveTo(0, i);
                ctx.lineTo(w, i);
                ctx.stroke();
            }
            
            // Draw frequency spectrum with glowing orange noise
            const barWidth = (w / bufferLength) * 1.5;
            let barHeight;
            let x = 0;
            
            for (let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i];
                
                // Add noise floor color (orange/amber)
                ctx.fillStyle = `rgba(249, 115, 22, ${barHeight / 255 * 0.4})`;
                ctx.fillRect(x, h - barHeight * 0.5 - 20, barWidth, barHeight * 0.5);
                
                // Highlight cyan peaks (representing the active musical notes)
                if (dataArray[i] > 180 && i > 5) {
                    ctx.fillStyle = `rgba(6, 182, 212, 0.8)`;
                    ctx.fillRect(x, h - barHeight * 0.6 - 20, barWidth, 4);
                }
                
                x += barWidth + 1;
            }
            
            // Overlay 60Hz hum line indicator
            ctx.strokeStyle = 'rgba(249, 115, 22, 0.3)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(w * 0.05, 0);
            ctx.lineTo(w * 0.05, h);
            ctx.stroke();
            
            // Random impulse line to visual clicks
            if (Math.random() < 0.1) {
                ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
                ctx.beginPath();
                ctx.moveTo(Math.random() * w, 0);
                ctx.lineTo(Math.random() * w, h);
                ctx.stroke();
            }
            
        } else {
            // RESTORED mode: Draw clean spectrum
            this.analyser.getByteFrequencyData(dataArray);
            
            ctx.fillStyle = '#020617';
            ctx.fillRect(0, 0, w, h);
            
            // Draw clean blue grid lines
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.06)';
            ctx.lineWidth = 1;
            for (let i = 0; i < w; i += 40) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i, h);
                ctx.stroke();
            }
            for (let i = 0; i < h; i += 30) {
                ctx.beginPath();
                ctx.moveTo(0, i);
                ctx.lineTo(w, i);
                ctx.stroke();
            }
            
            // Clean cyan peaks
            const barWidth = (w / bufferLength) * 1.5;
            let barHeight;
            let x = 0;
            
            for (let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i];
                
                if (barHeight > 40) {
                    // surgical clean peaks
                    ctx.fillStyle = `rgba(56, 189, 248, ${barHeight / 255 * 0.7})`;
                    ctx.fillRect(x, h - barHeight * 0.5 - 20, barWidth, barHeight * 0.5);
                }
                
                x += barWidth + 1;
            }
        }
        
        // Draw baseline
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
        ctx.beginPath();
        ctx.moveTo(0, h - 20);
        ctx.lineTo(w, h - 20);
        ctx.stroke();
    }
}

// Initialize all players on page
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.audio-restoration-player').forEach(player => {
        new AudioRestorationPlayer(player.id);
    });
});
