export interface Challenge {
  id?: string;
  emoji: string;
  title: string;
  desc: string;
  exp: number;
  progress: number;
  total: number;
  done?: boolean;
  claimed?: boolean;
}
