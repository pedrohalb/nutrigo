export interface LessonNode {
  id: string;
  lessonId: string;
  type: 'star' | 'flame' | 'zap' | 'target' | 'medal' | 'brain' | 'heart' | 'leaf' | 'sun' | 'shield' | 'chest';
  status: 'completed' | 'current' | 'locked';
  offsetX: number;
  label?: string;
  xpReward: number;
  position: number;
  total: number;
}

export interface Mascot {
  nodeIdx: number;
  side: 'left' | 'right';
  image: 'cheer' | 'reading' | 'thumbsup' | 'love';
}

type LessonInput = {
  id: string;
  status: string;
  title: string;
  _count?: { questions: number };
};

type PlayableType = Exclude<LessonNode['type'], 'chest'>;

const PLAYABLE_TYPES: PlayableType[] = [
  'star', 'flame', 'zap', 'target', 'medal',
  'brain', 'heart', 'leaf', 'sun', 'shield',
];

// Smooth wave: right side then left side, completing a full curve over 8 nodes.
const WAVE = [0, 60, 80, 60, 0, -60, -80, -60];
const MASCOT_IMAGES: Array<'cheer' | 'reading' | 'thumbsup' | 'love'> = [
  'cheer', 'reading', 'thumbsup', 'love',
];

function offsetAt(idx: number, direction: 1 | -1) {
  return WAVE[idx % WAVE.length] * direction;
}

function lessonStatus(lesson: LessonInput): LessonNode['status'] {
  if (lesson.status === 'completed') return 'completed';
  if (lesson.status === 'generated') return 'current';
  return 'locked';
}

export function buildLayout(
  lessons: LessonInput[],
  unitNumber: number,
): {
  nodes: LessonNode[];
  mascots: Mascot[];
} {
  // Odd units curve to the right; even units mirror to the left.
  const direction: 1 | -1 = unitNumber % 2 === 1 ? 1 : -1;

  const total = lessons.length;

  // One node per lesson
  const nodes: LessonNode[] = lessons.map((lesson, i) => {
    const status = lessonStatus(lesson);
    const numQuestions = lesson._count?.questions ?? 0;
    // Same base formula used at submit time, minus the conditional streak bonus.
    // Redoing a completed lesson awards half XP.
    const baseXp = numQuestions * 20 + 100;
    const xpReward = status === 'completed' ? Math.floor(baseXp / 2) : baseXp;
    return {
      id: lesson.id,
      lessonId: lesson.id,
      type: PLAYABLE_TYPES[i % PLAYABLE_TYPES.length],
      status,
      offsetX: offsetAt(i, direction),
      // Label always carries the lesson title — frontend decides when to show it.
      label: lesson.title,
      xpReward,
      position: i + 1,
      total,
    };
  });

  // One mascot per unit, around the middle of the path
  const mascots: Mascot[] = [];
  if (total > 0) {
    const nodeIdx = Math.min(2, total - 1);
    const offset = offsetAt(nodeIdx, direction);
    const side: Mascot['side'] = offset > 0 ? 'left' : offset < 0 ? 'right' : 'left';
    mascots.push({
      nodeIdx,
      side,
      image: MASCOT_IMAGES[(unitNumber - 1) % MASCOT_IMAGES.length],
    });
  }

  return { nodes, mascots };
}
