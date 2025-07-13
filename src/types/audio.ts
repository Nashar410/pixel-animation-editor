export interface AudioTrack {
  id: string;
  name: string;
  type: 'music' | 'sfx' | 'voice' | 'ambient';
  source: string;
  volume: number;
  loop: boolean;
  startTime: number;
  duration?: number;
  fadeIn?: number;
  fadeOut?: number;
}

export interface AudioManager {
  tracks: Map<string, AudioTrack>;
  masterVolume: number;
  play(trackId: string): void;
  pause(trackId: string): void;
  stop(trackId: string): void;
  setVolume(trackId: string, volume: number): void;
  synchronizeWithTimeline(currentTime: number): void;
}