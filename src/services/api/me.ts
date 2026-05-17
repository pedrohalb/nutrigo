import { api } from './client';

export type GoalKind = 'casual' | 'regular' | 'serio' | 'intenso';

export interface Profile {
  userId: string;
  name: string;
  objectives: string[];
  topics: string[];
  goal: GoalKind;
  level: number;
  xp: number;
  streakDays: number;
}

export interface MeResponse {
  user: { id: string; email: string };
  profile: Profile | null;
  stats: { level: number; xp: number; xp_for_next_level: number; streak_days: number };
  currentUnitId: string | null;
}

export const meApi = {
  onboarding(data: {
    name: string;
    objectives: string[];
    topics: string[];
    goal: GoalKind;
  }) {
    return api.post<{ profile: Profile; units: unknown[] }>('/me/onboarding', data);
  },

  getMe() {
    return api.get<MeResponse>('/me');
  },

  updateMe(data: { name?: string }) {
    return api.put<{ profile: Profile }>('/me', data);
  },
};
