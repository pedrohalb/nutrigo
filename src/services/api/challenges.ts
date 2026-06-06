import { api } from './client';

export interface ChallengeItem {
  id: string;
  kind: 'daily' | 'weekly';
  emoji: string;
  title: string;
  desc: string;
  exp: number;
  progress: number;
  total: number;
  done: boolean;
  claimed: boolean;
  periodStart: string;
}

export interface ChallengesResponse {
  daily: ChallengeItem[];
  weekly: ChallengeItem[];
  pendingClaims: number;
}

export interface ClaimResponse {
  xpEarned: number;
  levelUp: boolean;
  newLevel: number;
}

export const challengesApi = {
  getChallenges() {
    return api.get<ChallengesResponse>('/challenges');
  },
  claim(templateId: string) {
    return api.post<ClaimResponse>(`/challenges/${templateId}/claim`, {});
  },
};
