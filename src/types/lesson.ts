export type MascotImage = 'cheer' | 'reading' | 'thumbsup' | 'love';

export interface LessonNode {
  id: number;
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
  section: number;
  unit: number;
  title: string;
  mascots: Mascot[];
  nodes: LessonNode[];
}
