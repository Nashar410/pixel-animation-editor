import { Vector2 } from './base';

export interface DialogueBox {
  id: string;
  text: string;
  position: 'top' | 'bottom' | 'custom';
  customPosition?: Vector2;
  style: DialogueStyle;
  displayTime: number;
  typewriterEffect: boolean;
  typewriterSpeed: number;
  portrait?: DialoguePortrait;
  textEffects: TextEffect[];
}

export interface DialogueStyle {
  fontFamily: string;
  fontSize: number;
  color: string;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  padding: number;
  borderRadius: number;
  boxShadow?: string;
}

export interface DialoguePortrait {
  source: string;
  position: 'left' | 'right';
  size: Vector2;
}

export interface TextEffect {
  type: 'blink' | 'color' | 'shake' | 'wave';
  startIndex: number;
  endIndex: number;
  parameters: any;
}