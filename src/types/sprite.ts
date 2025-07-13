import { Transform, AnimationTrack } from './base';

export interface Sprite {
  id: string;
  name: string;
  type: 'static' | 'animated';
  source: string;
  transform: Transform;
  animations: AnimationTrack[];
  properties: SpriteProperties;
  group?: string;
}

export interface SpriteProperties {
  visible: boolean;
  opacity: number;
  flipX: boolean;
  flipY: boolean;
  tint?: string;
  blendMode: string;
}

export interface AnimatedSprite extends Sprite {
  spriteSheet: SpriteSheet;
  currentFrame: number;
  frameRate: number;
  loop: boolean;
  autoPlay: boolean;
}

export interface SpriteSheet {
  image: HTMLImageElement;
  frameWidth: number;
  frameHeight: number;
  totalFrames: number;
  columns: number;
  rows: number;
}

export interface SpriteSheetConfig {
  source: string;
  frameWidth: number;
  frameHeight: number;
  totalFrames: number;
  columns: number;
  rows: number;
}