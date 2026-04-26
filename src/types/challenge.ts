export interface Challenge {
  emoji: string;
  title: string;
  desc: string;
  exp: number;
  progress: number;
  total: number;
  done?: boolean;
}
