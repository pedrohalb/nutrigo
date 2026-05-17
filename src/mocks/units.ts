import type { Unit } from '../types/lesson';

// TODO: substituir por chamada API
export const units: Unit[] = [
  {
    id: 'mock-1',
    section: 1,
    unit: 1,
    title: 'Fundamentos da Nutrição',
    status: 'generated',
    mascots: [
      { nodeIdx: 2, side: 'right', image: 'cheer' },
      { nodeIdx: 5, side: 'left', image: 'thumbsup' },
    ],
    nodes: [
      { id: "1", type: 'star', status: 'current', offsetX: 0, label: 'COMEÇAR' },
      { id: "2", type: 'lock', status: 'locked', offsetX: -15 },
      { id: "3", type: 'book', status: 'locked', offsetX: -45 },
      { id: "4", type: 'chest', status: 'locked', offsetX: -10 },
      { id: "5", type: 'lock', status: 'locked', offsetX: 20 },
      { id: "6", type: 'book', status: 'locked', offsetX: 45 },
      { id: "7", type: 'lock', status: 'locked', offsetX: 20 },
    ],
  },
  {
    id: 'mock-2',
    section: 1,
    unit: 2,
    title: 'Macronutrientes',
    status: 'skeleton',
    mascots: [
      { nodeIdx: 2, side: 'left', image: 'reading' },
      { nodeIdx: 5, side: 'right', image: 'love' },
    ],
    nodes: [
      { id: "8", type: 'star', status: 'locked', offsetX: 0 },
      { id: "9", type: 'lock', status: 'locked', offsetX: 20 },
      { id: "10", type: 'book', status: 'locked', offsetX: 45 },
      { id: "11", type: 'chest', status: 'locked', offsetX: 10 },
      { id: "12", type: 'lock', status: 'locked', offsetX: -20 },
      { id: "13", type: 'book', status: 'locked', offsetX: -45 },
      { id: "14", type: 'lock', status: 'locked', offsetX: -20 },
    ],
  },
  {
    id: 'mock-3',
    section: 1,
    unit: 3,
    title: 'Micronutrientes',
    status: 'skeleton',
    mascots: [
      { nodeIdx: 2, side: 'right', image: 'thumbsup' },
      { nodeIdx: 5, side: 'left', image: 'cheer' },
    ],
    nodes: [
      { id: "15", type: 'star', status: 'locked', offsetX: 0 },
      { id: "16", type: 'lock', status: 'locked', offsetX: -20 },
      { id: "17", type: 'book', status: 'locked', offsetX: -42 },
      { id: "18", type: 'chest', status: 'locked', offsetX: -8 },
      { id: "19", type: 'lock', status: 'locked', offsetX: 22 },
      { id: "20", type: 'book', status: 'locked', offsetX: 42 },
      { id: "21", type: 'lock', status: 'locked', offsetX: 22 },
    ],
  },
];
