/* 
    ==================================================
    PUREWAVE AUDIO PLAYER - CUSTOM LOGIC
    ==================================================
*/

class AudioRestorationPlayer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.beforeSrc = this.container.getAttribute('data-before');
        this.afterSrc = this.container.getAttribute('data-after');
        
        this.currentMode = 'after'; // Default to restored version
        this.isPlaying = false;
        
        this.init();
    }

    init() {
        this.container.innerHTML = `
            <div class="player-inner">
                <div class="mode-toggle mb-4 d-flex justify-content-center">
                    <div class="btn-group p-1 bg-black rounded-pill">
                        <button class="btn btn-sm rounded-pill px-4 mode-btn active" data-mode="after">Restored</button>
                        <button class="btn btn-sm rounded-pill px-4 mode-btn" data-mode="before">Original</button>
                    </div>
                </div>
                
                <div class="waveform-container">
                    <canvas class="waveform-canvas w-100 h-100"></canvas>
                    <div class="progress-overlay"></div>
                </div>

                <div class="controls d-flex align-items-center justify-content-between mt-3">
                    <div class="main-btns d-flex align-items-center gap-3">
                        <button class="btn-play bg-accent p-3 rounded-circle border-0">
                            <i class="bi bi-play-fill text-dark fs-4"></i>
                        </button>
                        <div class="time-display small text-muted">0:00 / 0:00</div>
                    </div>
                    
                    <div class="volume-ctrl d-flex align-items-center gap-2">
                        <i class="bi bi-volume-up text-muted"></i>
                        <input type="range" class="form-range" style="width: 80px;">
                    </div>
                </div>

                <audio id="audio-after" src="${this.afterSrc}"></audio>
                <audio id="audio-before" src="${this.beforeSrc}"></audio>
            </div>
        `;

        this.audioAfter = this.container.querySelector('#audio-after');
        this.audioBefore = this.container.querySelector('#audio-before');
        this.playBtn = this.container.querySelector('.btn-play');
        this.modeBtns = this.container.querySelectorAll('.mode-btn');
        this.timeDisplay = this.container.querySelector('.time-display');

        this.bindEvents();
    }

    bindEvents() {
        this.playBtn.addEventListener('click', () => this.togglePlay());
        
        this.modeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchMode(e.target.getAttribute('data-mode'));
                this.modeBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Sync time
        [this.audioAfter, this.audioBefore].forEach(audio => {
            audio.addEventListener('timeupdate', () => {
                if (this.currentMode === 'after' && audio === this.audioAfter) {
                    this.updateUI(audio);
                } else if (this.currentMode === 'before' && audio === this.audioBefore) {
                    this.updateUI(audio);
                }
            });
        });
    }

    togglePlay() {
        const activeAudio = this.currentMode === 'after' ? this.audioAfter : this.audioBefore;
        if (this.isPlaying) {
            this.audioAfter.pause();
            this.audioBefore.pause();
            this.playBtn.querySelector('i').classList.replace('bi-pause-fill', 'bi-play-fill');
        } else {
            activeAudio.play();
            this.playBtn.querySelector('i').classList.replace('bi-play-fill', 'bi-pause-fill');
        }
        this.isPlaying = !this.isPlaying;
    }

    switchMode(mode) {
        if (this.currentMode === mode) return;

        const oldAudio = this.currentMode === 'after' ? this.audioAfter : this.audioBefore;
        const newAudio = mode === 'after' ? this.audioAfter : this.audioBefore;
        
        const currentTime = oldAudio.currentTime;
        newAudio.currentTime = currentTime;
        
        if (this.isPlaying) {
            oldAudio.pause();
            newAudio.play();
        }
        
        this.currentMode = mode;
    }

    updateUI(audio) {
        const formatTime = (s) => {
            const min = Math.floor(s / 60);
            const sec = Math.floor(s % 60);
            return `${min}:${sec < 10 ? '0' : ''}${sec}`;
        };
        this.timeDisplay.innerText = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration || 0)}`;
    }
}

// Initialize all players on page
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.audio-restoration-player').forEach(player => {
        new AudioRestorationPlayer(player.id);
    });
});
