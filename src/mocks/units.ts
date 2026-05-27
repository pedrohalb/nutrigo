import type { Unit } from '../types/lesson';

// TODO: substituir por chamada API
export const units: Unit[] = [
  {
    id: 'mock-1',
    section: 1,
    unit: 1,
    title: 'Fundamentos da Nutrição',
    status: 'generated',
    mascots: [{ nodeIdx: 2, side: 'right', image: 'cheer' }],
    nodes: [
      { id: '1', lessonId: '1', type: 'star',   status: 'current', offsetX: 0,   label: 'Introdução' },
      { id: '2', lessonId: '2', type: 'flame',  status: 'locked',  offsetX: 60 },
      { id: '3', lessonId: '3', type: 'brain',  status: 'locked',  offsetX: 80 },
      { id: '4', lessonId: '',  type: 'chest',  status: 'locked',  offsetX: 60 },
    ],
  },
  {
    id: 'mock-2',
    section: 1,
    unit: 2,
    title: 'Macronutrientes',
    status: 'skeleton',
    mascots: [],
    nodes: [],
  },
];
