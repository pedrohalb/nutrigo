import { api } from './client';

export type UserAnswer =
  | { selectedIndex: number }
  | { selectedChip: string };

export interface SubmitResult {
  results: Array<{ questionId: string; isCorrect: boolean; explanation: string }>;
  xpEarned: number;
  levelUp: boolean;
  streakDays: number;
  unitCompleted: boolean;
}

export const lessonsApi = {
  getLesson(id: string) {
    return api.get<{ id: string; title: string; questions: any[] }>(`/lessons/${id}`);
  },

  submit(id: string, answers: Array<{ questionId: string; userAnswer: UserAnswer }>) {
    return api.post<SubmitResult>(`/lessons/${id}/submit`, { answers });
  },
};
