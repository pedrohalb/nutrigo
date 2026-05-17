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
}

export interface ChallengesResponse {
  daily: ChallengeItem[];
  weekly: ChallengeItem[];
}

export const challengesApi = {
  getChallenges() {
    return api.get<ChallengesResponse>('/challenges');
  },
};
