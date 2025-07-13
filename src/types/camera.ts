import { Vector2, AnimationTrack } from './base';

export interface Camera {
  id: string;
  position: Vector2;
  zoom: number;
  rotation: number;
  viewport: Viewport;
  target?: string;
  followSettings: CameraFollowSettings;
  animations: AnimationTrack[];
}

export interface Viewport {
  width: number;
  height: number;
  x: number;
  y: number;
}

export interface CameraFollowSettings {
  enabled: boolean;
  targetId?: string;
  smoothing: number;
  offset: Vector2;
  deadZone: Viewport;
}