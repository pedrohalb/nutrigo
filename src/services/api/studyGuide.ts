import { api } from './client';
import type { LessonData } from '../../types/studyGuide';

export const studyGuideApi = {
  getStudyMaterial(unitId: string) {
    return api.get<{ studyMaterial: any }>(`/units/${unitId}/study-material`);
  },

  getReview(unitId: string) {
    return api.get<LessonData[]>(`/units/${unitId}/review`);
  },
};
