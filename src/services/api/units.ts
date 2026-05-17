import { api } from './client';

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
