export type MascotImage = 'cheer' | 'reading' | 'thumbsup' | 'love';

export interface LessonNode {
  id: string;
  type: 'star' | 'lock' | 'chest' | 'book';
  status: 'completed' | 'current' | 'locked';
  offsetX: number;
  label?: string;
}

export interface Mascot {
  nodeIdx: number;
  side: 'left' | 'right';
  image: MascotImage;
}

export interface Unit {
  id: string;
  section: number;
  unit: number;
  title: string;
  status: string;
  mascots: Mascot[];
  nodes: LessonNode[];
}
