import { Scene, Camera } from '../../types';

export class PixelRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.setupPixelPerfectRendering();
  }
  
  private setupPixelPerfectRendering(): void {
    this.ctx.imageSmoothingEnabled = false;
    // @ts-ignore - Propriétés webkit/moz/ms pour compatibilité
    this.ctx.webkitImageSmoothingEnabled = false;
    // @ts-ignore
    this.ctx.mozImageSmoothingEnabled = false;
    // @ts-ignore
    this.ctx.msImageSmoothingEnabled = false;
  }
  
  public render(scene: Scene, camera: Camera): void {
    this.clearCanvas();
    this.applyCamera(camera);
    this.renderBackground(scene.background);
    this.renderLayers(scene.layers);
    this.renderUI();
  }
  
  private clearCanvas(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  private applyCamera(camera: Camera): void {
    this.ctx.save();
    this.ctx.translate(camera.viewport.width / 2, camera.viewport.height / 2);
    this.ctx.scale(camera.zoom, camera.zoom);
    this.ctx.rotate(camera.rotation);
    this.ctx.translate(-camera.position.x, -camera.position.y);
  }
  
  private renderBackground(background: any): void {
    // TODO: Implémenter le rendu du background
  }
  
  private renderLayers(layers: any[]): void {
    // TODO: Implémenter le rendu des layers
  }
  
  private renderUI(): void {
    // TODO: Implémenter le rendu de l'UI
  }
}