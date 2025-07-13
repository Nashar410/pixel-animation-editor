import { Vector2, Transform, AnimationTrack } from './base';

export interface Scene {
  id: string;
  name: string;
  background: Background;
  layers: Layer[];
  camera: Camera;
  duration: number;
  metadata: SceneMetadata;
}

export interface Layer {
  id: string;
  name: string;
  zIndex: number;
  visible: boolean;
  opacity: number;
  sprites: Sprite[];
  transform: Transform;
}

export interface Background {
  type: 'image' | 'color' | 'gradient';
  source?: string;
  color?: string;
  repeat: boolean;
  parallaxSpeed: number;
}

export interface SceneMetadata {
  created: Date;
  modified: Date;
  author: string;
  version: string;
}