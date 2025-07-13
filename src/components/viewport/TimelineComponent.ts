import { TimelineKeyframe, AnimationTrack } from '../../types';

export interface TimelineTrack {
    id: string;
    name: string;
    type: 'scene' | 'camera' | 'sprite' | 'audio' | 'dialogue';
    keyframes: TimelineKeyframe[];
    expanded?: boolean;
    locked?: boolean;
}

export interface TimelineCallbacks {
    onTimeChange?: (time: number) => void;
    onKeyframeAdd?: (trackId: string, keyframe: TimelineKeyframe) => void;
    onKeyframeMove?: (trackId: string, keyframeIndex: number, newTime: number) => void;
    onKeyframeDelete?: (trackId: string, keyframeIndex: number) => void;
    onTrackSelect?: (trackId: string) => void;
}

export class TimelineComponent {
    private container: HTMLElement;
    private duration: number = 600; // 10 minutes par défaut
    private currentTime: number = 0;
    private isPlaying: boolean = false;
    private playbackRate: number = 1;
    private tracks: Map<string, TimelineTrack> = new Map();
    private callbacks: TimelineCallbacks;

    // Éléments DOM
    private playhead: HTMLElement | null = null;
    private timeDisplay: HTMLElement | null = null;
    private tracksContainer: HTMLElement | null = null;

    constructor(container: HTMLElement, callbacks: TimelineCallbacks = {}) {
        this.container = container;
        this.callbacks = callbacks;
        this.setupDOM();
        this.setupEventListeners();
    }

    private setupDOM(): void {
        this.playhead = this.container.querySelector('.playhead');
        this.timeDisplay = this.container.querySelector('.timeline-time');
        this.tracksContainer = this.container.querySelector('.timeline-tracks');
    }

    private setupEventListeners(): void {
        // Boutons de contrôle
        const playBtn = this.container.querySelector('.timeline-controls .toolbar-btn:nth-child(2)');
        const pauseBtn = this.container.querySelector('.timeline-controls .toolbar-btn:nth-child(3)');
        const startBtn = this.container.querySelector('.timeline-controls .toolbar-btn:nth-child(1)');
        const endBtn = this.container.querySelector('.timeline-controls .toolbar-btn:nth-child(4)');

        playBtn?.addEventListener('click', () => this.play());
        pauseBtn?.addEventListener('click', () => this.pause());
        startBtn?.addEventListener('click', () => this.setTime(0));
        endBtn?.addEventListener('click', () => this.setTime(this.duration));

        // Double-clic pour ajouter des keyframes
        this.tracksContainer?.addEventListener('dblclick', this.handleTrackDoubleClick.bind(this));
    }

    private handleTrackDoubleClick(e: MouseEvent): void {
        const trackElement = (e.target as HTMLElement).closest('.timeline-track');
        if (!trackElement) return;

        const trackContent = trackElement.querySelector('.track-content');
        if (!trackContent || e.target !== trackContent) return;

        const trackId = trackElement.getAttribute('data-track-id');
        if (!trackId) return;

        const rect = trackContent.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const time = (x / rect.width) * this.duration;

        const keyframe: TimelineKeyframe = {
            time,
            value: {} // La valeur sera définie par le composant parent
        };

        this.callbacks.onKeyframeAdd?.(trackId, keyframe);
    }

    public play(): void {
        this.isPlaying = true;
        this.animate();
    }

    public pause(): void {
        this.isPlaying = false;
    }

    public setTime(time: number): void {
        this.currentTime = Math.max(0, Math.min(this.duration, time));
        this.updateTimeDisplay();
        this.callbacks.onTimeChange?.(this.currentTime);
    }

    private animate(): void {
        if (!this.isPlaying) return;

        const deltaTime = (1 / 60) * this.playbackRate; // 60 FPS
        this.setTime(this.currentTime + deltaTime);

        if (this.currentTime >= this.duration) {
            this.currentTime = 0;
        }

        requestAnimationFrame(() => this.animate());
    }

    private updateTimeDisplay(): void {
        if (this.timeDisplay) {
            this.timeDisplay.textContent = `${this.formatTime(this.currentTime)} / ${this.formatTime(this.duration)}`;
        }

        if (this.playhead) {
            const percent = (this.currentTime / this.duration) * 100;
            this.playhead.style.left = `${percent}%`;
        }
    }

    private formatTime(seconds: number): string {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    public addTrack(track: TimelineTrack): void {
        this.tracks.set(track.id, track);
        this.renderTrack(track);
    }

    private renderTrack(track: TimelineTrack): void {
        if (!this.tracksContainer) return;

        const trackElement = document.createElement('div');
        trackElement.className = 'timeline-track';
        trackElement.setAttribute('data-track-id', track.id);

        const label = document.createElement('div');
        label.className = 'track-label';
        label.textContent = track.name;

        const content = document.createElement('div');
        content.className = 'track-content';

        // Ajouter les keyframes existants
        track.keyframes.forEach((keyframe, index) => {
            const keyframeElement = this.createKeyframeElement(keyframe, index);
            content.appendChild(keyframeElement);
        });

        trackElement.appendChild(label);
        trackElement.appendChild(content);

        // Insérer après le ruler
        const ruler = this.tracksContainer.querySelector('.timeline-ruler');
        if (ruler && ruler.nextSibling) {
            this.tracksContainer.insertBefore(trackElement, ruler.nextSibling);
        } else {
            this.tracksContainer.appendChild(trackElement);
        }
    }

    private createKeyframeElement(keyframe: TimelineKeyframe, index: number): HTMLElement {
        const element = document.createElement('div');
        element.className = 'keyframe';
        element.setAttribute('data-keyframe-index', index.toString());

        const percent = (keyframe.time / this.duration) * 100;
        element.style.left = `${percent}%`;

        // Rendre draggable
        this.setupKeyframeDrag(element);

        return element;
    }

    private setupKeyframeDrag(keyframeElement: HTMLElement): void {
        let isDragging = false;
        let trackId: string | null = null;
        let keyframeIndex: number = -1;

        keyframeElement.addEventListener('mousedown', (e) => {
            isDragging = true;
            const track = keyframeElement.closest('.timeline-track');
            trackId = track?.getAttribute('data-track-id') || null;
            keyframeIndex = parseInt(keyframeElement.getAttribute('data-keyframe-index') || '-1');

            keyframeElement.style.cursor = 'grabbing';
            e.preventDefault();
            e.stopPropagation();
        });

        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !trackId || keyframeIndex === -1) return;

            const trackContent = keyframeElement.parentElement;
            if (!trackContent) return;

            const rect = trackContent.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
            const newTime = (percent / 100) * this.duration;

            keyframeElement.style.left = `${percent}%`;
            this.callbacks.onKeyframeMove?.(trackId, keyframeIndex, newTime);
        };

        const handleMouseUp = () => {
            isDragging = false;
            keyframeElement.style.cursor = 'pointer';
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    public updateKeyframes(trackId: string, keyframes: TimelineKeyframe[]): void {
        const track = this.tracks.get(trackId);
        if (!track) return;

        track.keyframes = keyframes;

        // Re-render les keyframes
        const trackElement = this.tracksContainer?.querySelector(`[data-track-id="${trackId}"]`);
        const content = trackElement?.querySelector('.track-content');
        if (!content) return;

        // Supprimer les anciens keyframes
        content.innerHTML = '';

        // Ajouter les nouveaux
        keyframes.forEach((keyframe, index) => {
            const element = this.createKeyframeElement(keyframe, index);
            content.appendChild(element);
        });
    }

    public setDuration(duration: number): void {
        this.duration = duration;
        this.updateTimeDisplay();
    }

    public getCurrentTime(): number {
        return this.currentTime;
    }

    public getDuration(): number {
        return this.duration;
    }
}