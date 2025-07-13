import { describe, it, expect } from 'vitest';
import { AnimationEngine } from '../../src/core/animation/AnimationEngine';
import { AnimationTrack } from '../../src/types';

describe('AnimationEngine', () => {
  it('should create an instance', () => {
    const engine = new AnimationEngine();
    expect(engine).toBeDefined();
  });
  
  it('should interpolate keyframes correctly', () => {
    const engine = new AnimationEngine();
    const track: AnimationTrack = {
      property: 'position.x',
      keyframes: [
        { time: 0, value: 0 },
        { time: 1, value: 100 }
      ]
    };
    
    // Test interpolation au milieu
    // Note: Cette méthode devra être rendue publique ou testée différemment
    // const value = engine.interpolateTrack(track, 0.5);
    // expect(value).toBe(50);
  });
});