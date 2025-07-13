import { Scene } from './scene';
import { Variable, Condition } from './variables';

export interface ProjectData {
  version: string;
  metadata: ProjectMetadata;
  scene: Scene;
  resources: ResourceManifest;
  variables: Variable[];
  conditions: Condition[];
  timeline: TimelineData;
}

export interface ProjectMetadata {
  name: string;
  description: string;
  author: string;
  created: Date;
  modified: Date;
  version: string;
}

export interface ResourceManifest {
  images: ResourceEntry[];
  audio: ResourceEntry[];
  fonts: ResourceEntry[];
}

export interface ResourceEntry {
  id: string;
  name: string;
  source: string;
  type: string;
  size: number;
}

export interface TimelineData {
  duration: number;
  tracks: TimelineTrackData[];
}

export interface TimelineTrackData {
  objectId: string;
  property: string;
  keyframes: any[];
}