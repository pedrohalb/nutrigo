import { api } from './client';

export interface LessonNode {
  id: string;
  lessonId: string;
  type: 'star' | 'flame' | 'zap' | 'target' | 'medal' | 'brain' | 'heart' | 'leaf' | 'sun' | 'shield' | 'chest';
  status: 'completed' | 'current' | 'locked';
  offsetX: number;
  label?: string;
  xpReward: number;
  position: number;
  total: number;
}

export interface Mascot {
  nodeIdx: number;
  side: 'left' | 'right';
  image: 'cheer' | 'reading' | 'thumbsup' | 'love';
}

export interface UnitListItem {
  id: string;
  section: number;
  unit: number;
  title: string;
  status: string;
  nodes: LessonNode[];
  mascots: Mascot[];
}

export interface Section {
  section: number;
  units: UnitListItem[];
}

export const unitsApi = {
  getUnits() {
    return api.get<{ sections: Section[] }>('/units');
  },

  getUnit(id: string) {
    return api.get<UnitListItem & {
      studyMaterial?: unknown;
      summary?: string;
      lessons: Array<{ id: string; orderIndex: number; title: string; status: string; completed: boolean }>;
    }>(`/units/${id}`);
  },
};
