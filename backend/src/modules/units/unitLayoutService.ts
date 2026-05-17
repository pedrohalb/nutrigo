import { Lesson } from '@prisma/client';

export interface LessonNode {
  id: string;
  type: 'star' | 'lock' | 'chest' | 'book';
  status: 'completed' | 'current' | 'locked';
  offsetX: number;
  label?: string;
}

export interface Mascot {
  nodeIdx: number;
  side: 'left' | 'right';
  image: 'cheer' | 'reading' | 'thumbsup' | 'love';
}

const ZIGZAG = [0, 60, 80, 60, 0, -60, -80, -60];
const MASCOT_IMAGES: Array<'cheer' | 'reading' | 'thumbsup' | 'love'> = [
  'cheer', 'reading', 'thumbsup', 'love',
];

function offsetAt(idx: number) {
  return ZIGZAG[idx % ZIGZAG.length];
}

function starStatus(lesson: Lesson): 'completed' | 'current' | 'locked' {
  if (lesson.status === 'completed') return 'completed';
  if (lesson.status === 'generated') return 'current';
  return 'locked';
}

export function buildLayout(lessons: Lesson[]): {
  nodes: LessonNode[];
  mascots: Mascot[];
} {
  const N = lessons.length;

  // Current star = first non-completed lesson
  const currentStarIndex = lessons.findIndex((l) => l.status !== 'completed');

  // Build node list: star0, sep, star1, sep, ..., book, starN-1, chest
  const nodeList: Array<{ type: LessonNode['type']; lessonIndex?: number }> = [];

  for (let i = 0; i < N; i++) {
    nodeList.push({ type: 'star', lessonIndex: i });
    if (i < N - 1) {
      nodeList.push({ type: i === N - 2 ? 'book' : 'lock' });
    }
  }
  nodeList.push({ type: 'chest' });

  // Find the node index of current star
  const currentNodeIdx = currentStarIndex === -1
    ? -1
    : nodeList.findIndex((n) => n.type === 'star' && n.lessonIndex === currentStarIndex);

  const nodes: LessonNode[] = nodeList.map((entry, idx) => {
    let status: LessonNode['status'];

    if (currentNodeIdx === -1) {
      // All lessons completed
      status = 'completed';
    } else if (entry.type === 'star' && entry.lessonIndex !== undefined) {
      status = starStatus(lessons[entry.lessonIndex]);
      // Downgrade: if this star would be current but lesson not generated yet
      if (status === 'current' && entry.lessonIndex !== currentStarIndex) {
        status = 'locked';
      }
    } else {
      // Decorative node
      status = idx < currentNodeIdx ? 'completed' : 'locked';
    }

    return {
      id: entry.type === 'star' && entry.lessonIndex !== undefined
        ? lessons[entry.lessonIndex].id
        : `${entry.type}-${idx}`,
      type: entry.type,
      status,
      offsetX: offsetAt(idx),
      label: entry.type === 'star' && entry.lessonIndex !== undefined
        ? lessons[entry.lessonIndex].title
        : undefined,
    };
  });

  // Mascots at node indices 2 and totalNodes-2
  const total = nodes.length;
  const mascotPositions = [
    Math.min(2, total - 1),
    Math.max(total - 2, 0),
  ].filter((v, i, arr) => arr.indexOf(v) === i);

  const mascots: Mascot[] = mascotPositions.map((nodeIdx, i) => ({
    nodeIdx,
    side: i % 2 === 0 ? 'left' : 'right',
    image: MASCOT_IMAGES[i % MASCOT_IMAGES.length],
  }));

  return { nodes, mascots };
}
