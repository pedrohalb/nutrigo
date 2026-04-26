import type { Challenge } from '../types/challenge';

// TODO: substituir por chamada API

export const dailyChallenge: Challenge = {
  emoji: '🥦',
  title: 'Mestre da nutrição',
  desc: 'complete 3 lições hoje sem errar nenhuma questão',
  exp: 500,
  progress: 1,
  total: 3,
};

export const weeklyChallenges: Challenge[] = [
  {
    emoji: '🔥',
    title: 'Desafio de ofensiva',
    desc: 'mantenha a ofensiva por 10 dias',
    exp: 500,
    progress: 3,
    total: 10,
  },
  {
    emoji: '📈',
    title: 'Hora de avançar',
    desc: 'complete 8 lições',
    exp: 500,
    progress: 6,
    total: 8,
  },
  {
    emoji: '🎓',
    title: 'Adquirindo conhecimento',
    desc: 'Entre no guia de estudo',
    exp: 300,
    progress: 0,
    total: 1,
  },
  {
    emoji: '📚',
    title: 'Sabe o básico',
    desc: 'complete a 1° unidade',
    exp: 800,
    progress: 1,
    total: 5,
  },
  {
    emoji: '📕',
    title: 'Primeira lição',
    desc: 'complete a primeira lição',
    exp: 0,
    progress: 1,
    total: 1,
    done: true,
  },
];

// Subconjunto exibido na tela de perfil
export const profileChallenges: Challenge[] = [
  {
    emoji: '🔥',
    title: 'Desafio de ofensiva',
    desc: 'mantenha a ofensiva por 10 dias',
    exp: 500,
    progress: 3,
    total: 10,
  },
  {
    emoji: '📈',
    title: 'Hora de avançar',
    desc: 'complete 8 lições',
    exp: 800,
    progress: 6,
    total: 8,
  },
  {
    emoji: '📕',
    title: 'Primeira lição',
    desc: 'complete a primeira lição',
    exp: 0,
    progress: 1,
    total: 1,
    done: true,
  },
];
