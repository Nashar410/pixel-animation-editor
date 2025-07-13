import { SpriteSheet, SpriteSheetConfig } from '../../types';

export class ResourceManager {
  private images: Map<string, HTMLImageElement> = new Map();
  private audio: Map<string, HTMLAudioElement> = new Map();
  private loadingPromises: Map<string, Promise<any>> = new Map();
  
  public async loadImage(url: string): Promise<HTMLImageElement> {
    if (this.images.has(url)) {
      return this.images.get(url)!;
    }
    
    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url)!;
    }
    
    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.images.set(url, img);
        this.loadingPromises.delete(url);
        resolve(img);
      };
      img.onerror = () => {
        this.loadingPromises.delete(url);
        reject(new Error(`Failed to load image: ${url}`));
      };
      img.src = url;
    });
    
    this.loadingPromises.set(url, promise);
    return promise;
  }
  
  public async loadSpriteSheet(config: SpriteSheetConfig): Promise<SpriteSheet> {
    const image = await this.loadImage(config.source);
    
    return {
      image,
      frameWidth: config.frameWidth,
      frameHeight: config.frameHeight,
      totalFrames: config.totalFrames,
      columns: config.columns,
      rows: config.rows
    };
  }
  
  public async loadAudio(url: string): Promise<HTMLAudioElement> {
    if (this.audio.has(url)) {
      return this.audio.get(url)!;
    }
    
    const audio = new Audio(url);
    await new Promise((resolve, reject) => {
      audio.oncanplaythrough = resolve;
      audio.onerror = reject;
    });
    
    this.audio.set(url, audio);
    return audio;
  }
  
  public getImage(url: string): HTMLImageElement | null {
    return this.images.get(url) || null;
  }
  
  public getAudio(url: string): HTMLAudioElement | null {
    return this.audio.get(url) || null;
  }
}