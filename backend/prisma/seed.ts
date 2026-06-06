import { PrismaClient, ChallengeKind, ChallengeRule } from '@prisma/client';

const prisma = new PrismaClient();

const challenges = [
  // ── Daily ────────────────────────────────────────────────────────────────
  {
    kind: ChallengeKind.daily,
    emoji: '🌱',
    title: 'Comece o dia',
    description: 'Complete 1 lição hoje',
    exp: 100,
    rule: ChallengeRule.complete_lessons_today,
    ruleParams: { target: 1 },
  },
  {
    kind: ChallengeKind.daily,
    emoji: '🥗',
    title: 'Prato cheio',
    description: 'Complete 3 lições hoje',
    exp: 250,
    rule: ChallengeRule.complete_lessons_today,
    ruleParams: { target: 3 },
  },
  {
    kind: ChallengeKind.daily,
    emoji: '🥦',
    title: 'Brócoli aprova',
    description: 'Complete 5 lições hoje',
    exp: 500,
    rule: ChallengeRule.complete_lessons_today,
    ruleParams: { target: 5 },
  },
  {
    kind: ChallengeKind.daily,
    emoji: '🎯',
    title: 'Mira certeira',
    description: 'Acerte 1 lição inteira sem errar hoje',
    exp: 200,
    rule: ChallengeRule.complete_lessons_perfect_today,
    ruleParams: { target: 1 },
  },
  {
    kind: ChallengeKind.daily,
    emoji: '🏆',
    title: 'Mestre da nutrição',
    description: 'Complete 3 lições perfeitas hoje',
    exp: 500,
    rule: ChallengeRule.complete_lessons_perfect_today,
    ruleParams: { target: 3 },
  },
  {
    kind: ChallengeKind.daily,
    emoji: '📖',
    title: 'Hoje eu reviso',
    description: 'Abra o Guia de Estudos hoje',
    exp: 150,
    rule: ChallengeRule.enter_study_guide,
    ruleParams: { target: 1 },
  },

  // ── Weekly ───────────────────────────────────────────────────────────────
  {
    kind: ChallengeKind.weekly,
    emoji: '⭐',
    title: 'Primeira mordida',
    description: 'Complete sua primeira lição',
    exp: 0,
    rule: ChallengeRule.complete_first_lesson,
    ruleParams: { target: 1 },
  },
  {
    kind: ChallengeKind.weekly,
    emoji: '🍎',
    title: 'Aquecendo motores',
    description: 'Complete 5 lições nesta semana',
    exp: 250,
    rule: ChallengeRule.complete_lessons_week,
    ruleParams: { target: 5 },
  },
  {
    kind: ChallengeKind.weekly,
    emoji: '📚',
    title: 'Hora de avançar',
    description: 'Complete 8 lições nesta semana',
    exp: 500,
    rule: ChallengeRule.complete_lessons_week,
    ruleParams: { target: 8 },
  },
  {
    kind: ChallengeKind.weekly,
    emoji: '🚀',
    title: 'Quase lá',
    description: 'Complete 12 lições nesta semana',
    exp: 800,
    rule: ChallengeRule.complete_lessons_week,
    ruleParams: { target: 12 },
  },
  {
    kind: ChallengeKind.weekly,
    emoji: '🥇',
    title: 'Imparável',
    description: 'Complete 15 lições nesta semana',
    exp: 1000,
    rule: ChallengeRule.complete_lessons_week,
    ruleParams: { target: 15 },
  },
  {
    kind: ChallengeKind.weekly,
    emoji: '🐉',
    title: 'Devorando conteúdo',
    description: 'Complete 20 lições nesta semana',
    exp: 1500,
    rule: ChallengeRule.complete_lessons_week,
    ruleParams: { target: 20 },
  },
  {
    kind: ChallengeKind.weekly,
    emoji: '🔥',
    title: 'Três dias firme',
    description: 'Mantenha uma ofensiva de 3 dias',
    exp: 200,
    rule: ChallengeRule.streak_days,
    ruleParams: { target: 3 },
  },
  {
    kind: ChallengeKind.weekly,
    emoji: '🔥',
    title: 'Semana inteira',
    description: 'Mantenha uma ofensiva de 7 dias',
    exp: 400,
    rule: ChallengeRule.streak_days,
    ruleParams: { target: 7 },
  },
  {
    kind: ChallengeKind.weekly,
    emoji: '🔥',
    title: 'Desafio de ofensiva',
    description: 'Mantenha uma ofensiva de 10 dias',
    exp: 500,
    rule: ChallengeRule.streak_days,
    ruleParams: { target: 10 },
  },
  {
    kind: ChallengeKind.weekly,
    emoji: '🔥',
    title: 'Duas semanas no rolê',
    description: 'Mantenha uma ofensiva de 14 dias',
    exp: 800,
    rule: ChallengeRule.streak_days,
    ruleParams: { target: 14 },
  },
  {
    kind: ChallengeKind.weekly,
    emoji: '🔥',
    title: 'Mês de hábito',
    description: 'Mantenha uma ofensiva de 30 dias',
    exp: 2000,
    rule: ChallengeRule.streak_days,
    ruleParams: { target: 30 },
  },
  {
    kind: ChallengeKind.weekly,
    emoji: '🎓',
    title: 'Sabe o básico',
    description: 'Conclua sua primeira unidade',
    exp: 800,
    rule: ChallengeRule.complete_unit,
    ruleParams: { target: 1 },
  },
  {
    kind: ChallengeKind.weekly,
    emoji: '🥗',
    title: 'Cardápio variado',
    description: 'Conclua 3 unidades',
    exp: 1500,
    rule: ChallengeRule.complete_unit,
    ruleParams: { target: 3 },
  },
  {
    kind: ChallengeKind.weekly,
    emoji: '🧠',
    title: 'Nutricionista em formação',
    description: 'Conclua 5 unidades',
    exp: 3000,
    rule: ChallengeRule.complete_unit,
    ruleParams: { target: 5 },
  },
  {
    kind: ChallengeKind.weekly,
    emoji: '🔬',
    title: 'Adquirindo conhecimento',
    description: 'Visite o Guia de Estudos nesta semana',
    exp: 300,
    rule: ChallengeRule.enter_study_guide,
    ruleParams: { target: 1 },
  },
];

async function main() {
  await prisma.challengeTemplate.deleteMany();

  await prisma.challengeTemplate.createMany({ data: challenges });

  console.log(`Seed concluído: ${challenges.length} challenge templates criados`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
