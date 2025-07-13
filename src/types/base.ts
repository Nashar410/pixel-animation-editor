// Types de base
export interface Vector2 {
  x: number;
  y: number;
}

export interface Transform {
  position: Vector2;
  scale: Vector2;
  rotation: number;
}

export interface TimelineKeyframe {
  time: number;
  value: any;
  easing?: (t: number) => number;
}

export interface AnimationTrack {
  property: string;
  keyframes: TimelineKeyframe[];
}