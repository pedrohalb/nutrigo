import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.challengeTemplate.deleteMany();

  await prisma.challengeTemplate.createMany({
    data: [
      {
        kind: 'daily',
        emoji: '🏆',
        title: 'Mestre da nutrição',
        description: 'Complete 3 lições perfeitas hoje',
        exp: 500,
        rule: 'complete_lessons_perfect_today',
        ruleParams: { target: 3 },
      },
      {
        kind: 'weekly',
        emoji: '🔥',
        title: 'Desafio de ofensiva',
        description: 'Mantenha uma ofensiva de 10 dias',
        exp: 500,
        rule: 'streak_days',
        ruleParams: { target: 10 },
      },
      {
        kind: 'weekly',
        emoji: '📚',
        title: 'Hora de avançar',
        description: 'Complete 8 lições nesta semana',
        exp: 500,
        rule: 'complete_lessons_week',
        ruleParams: { target: 8 },
      },
      {
        kind: 'weekly',
        emoji: '🔬',
        title: 'Adquirindo conhecimento',
        description: 'Visite o Guia de Estudos',
        exp: 300,
        rule: 'enter_study_guide',
        ruleParams: { target: 1 },
      },
      {
        kind: 'weekly',
        emoji: '🎓',
        title: 'Sabe o básico',
        description: 'Conclua sua primeira unidade',
        exp: 800,
        rule: 'complete_unit',
        ruleParams: { target: 1 },
      },
      {
        kind: 'weekly',
        emoji: '⭐',
        title: 'Primeira lição',
        description: 'Complete sua primeira lição',
        exp: 0,
        rule: 'complete_first_lesson',
        ruleParams: { target: 1 },
      },
    ],
  });

  console.log('Seed concluído: 6 challenge templates criados');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
