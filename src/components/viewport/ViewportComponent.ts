import { Camera, Scene } from '../../types';
import { PixelRenderer } from '../../core/engine/PixelRenderer';

export interface ViewportConfig {
    canvas: HTMLCanvasElement;
    width: number;
    height: number;
}

export interface ViewportCallbacks {
    onCameraChange?: (camera: Camera) => void;
    onSelectionChange?: (selectedId: string | null) => void;
    onViewportClick?: (x: number, y: number) => void;
}

export class ViewportComponent {
    private canvas: HTMLCanvasElement;
    private renderer: PixelRenderer;
    private camera: Camera;
    private callbacks: ViewportCallbacks;

    // État du viewport
    private isPanning = false;
    private panStart = { x: 0, y: 0 };
    private zoom = 1;

    constructor(config: ViewportConfig, callbacks: ViewportCallbacks = {}) {
        this.canvas = config.canvas;
        this.callbacks = callbacks;
        this.renderer = new PixelRenderer(this.canvas);

        // Initialiser la caméra par défaut
        this.camera = {
            id: 'main-camera',
            position: { x: 0, y: 0 },
            zoom: 1,
            rotation: 0,
            viewport: {
                width: config.width,
                height: config.height,
                x: 0,
                y: 0
            },
            followSettings: {
                enabled: false,
                smoothing: 0.1,
                offset: { x: 0, y: 0 },
                deadZone: { width: 100, height: 100, x: -50, y: -50 }
            },
            animations: []
        };

        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        // Zoom avec la molette
        this.canvas.addEventListener('wheel', this.handleWheel.bind(this));

        // Pan avec le clic du milieu
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));

        // Clic pour sélection
        this.canvas.addEventListener('click', this.handleClick.bind(this));
    }

    private handleWheel(e: WheelEvent): void {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        this.setZoom(this.zoom * delta);
    }

    private handleMouseDown(e: MouseEvent): void {
        if (e.button === 1) { // Bouton du milieu
            this.isPanning = true;
            this.panStart = { x: e.clientX, y: e.clientY };
            e.preventDefault();
        }
    }

    private handleMouseMove(e: MouseEvent): void {
        if (this.isPanning) {
            const dx = e.clientX - this.panStart.x;
            const dy = e.clientY - this.panStart.y;

            this.camera.position.x -= dx / this.zoom;
            this.camera.position.y -= dy / this.zoom;

            this.panStart = { x: e.clientX, y: e.clientY };
            this.callbacks.onCameraChange?.(this.camera);
        }
    }

    private handleMouseUp(e: MouseEvent): void {
        if (e.button === 1) {
            this.isPanning = false;
        }
    }

    private handleClick(e: MouseEvent): void {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / this.zoom + this.camera.position.x;
        const y = (e.clientY - rect.top) / this.zoom + this.camera.position.y;

        this.callbacks.onViewportClick?.(x, y);
    }

    public setZoom(zoom: number): void {
        this.zoom = Math.max(0.1, Math.min(10, zoom));
        this.camera.zoom = this.zoom;
        this.updateCanvasTransform();
        this.callbacks.onCameraChange?.(this.camera);
    }

    public resetView(): void {
        this.zoom = 1;
        this.camera.position = { x: 0, y: 0 };
        this.camera.rotation = 0;
        this.updateCanvasTransform();
        this.callbacks.onCameraChange?.(this.camera);
    }

    private updateCanvasTransform(): void {
        this.canvas.style.transform = `translate(-50%, -50%) scale(${this.zoom})`;
    }

    public render(scene: Scene): void {
        this.renderer.render(scene, this.camera);
    }

    public getCamera(): Camera {
        return { ...this.camera };
    }

    public setCamera(camera: Camera): void {
        this.camera = { ...camera };
        this.zoom = camera.zoom;
        this.updateCanvasTransform();
    }

    public resize(width: number, height: number): void {
        this.canvas.width = width;
        this.canvas.height = height;
        this.camera.viewport.width = width;
        this.camera.viewport.height = height;
    }
}