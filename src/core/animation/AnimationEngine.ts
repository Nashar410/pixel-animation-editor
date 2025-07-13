import { AnimationTrack, TimelineKeyframe } from '../../types';

export class AnimationEngine {
  private animations: Map<string, AnimationTrack[]> = new Map();
  private currentTime: number = 0;
  private isPlaying: boolean = false;
  
  public updateAnimations(deltaTime: number): void {
    if (!this.isPlaying) return;
    
    this.currentTime += deltaTime;
    
    this.animations.forEach((tracks, objectId) => {
      tracks.forEach(track => {
        const value = this.interpolateTrack(track, this.currentTime);
        this.applyAnimationValue(objectId, track.property, value);
      });
    });
  }
  
  private interpolateTrack(track: AnimationTrack, time: number): any {
    const keyframes = track.keyframes;
    if (keyframes.length === 0) return null;
    
    const before = keyframes.filter(k => k.time <= time).pop();
    const after = keyframes.find(k => k.time > time);
    
    if (!before) return keyframes[0].value;
    if (!after) return before.value;
    
    const progress = (time - before.time) / (after.time - before.time);
    const easedProgress = before.easing ? before.easing(progress) : progress;
    
    return this.interpolateValues(before.value, after.value, easedProgress);
  }
  
  private interpolateValues(start: any, end: any, progress: number): any {
    if (typeof start === 'number' && typeof end === 'number') {
      return start + (end - start) * progress;
    }
    
    if (start && end && typeof start === 'object') {
      const result: any = {};
      for (const key in start) {
        if (key in end) {
          result[key] = this.interpolateValues(start[key], end[key], progress);
        }
      }
      return result;
    }
    
    return progress < 0.5 ? start : end;
  }
  
  private applyAnimationValue(objectId: string, property: string, value: any): void {
    // TODO: Appliquer la valeur animée à l'objet
    console.log(`Setting ${objectId}.${property} = `, value);
  }
  
  public play(): void {
    this.isPlaying = true;
  }
  
  public pause(): void {
    this.isPlaying = false;
  }
  
  public setTime(time: number): void {
    this.currentTime = time;
  }
}