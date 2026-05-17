/**
 * Seed de teste — cria 1 usuário completo sem chamar a API da Anthropic.
 * Uso: npx tsx prisma/seed-test.ts
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const EMAIL = 'test@nutrigo.com';
const PASSWORD = 'test1234';

async function main() {
  // ── Limpa dados anteriores do usuário de teste ──────────────────────────
  const existing = await prisma.user.findUnique({ where: { email: EMAIL } });
  if (existing) {
    await prisma.user.delete({ where: { email: EMAIL } });
    console.log('Usuário anterior removido.');
  }

  // ── Usuário + Perfil ─────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  const user = await prisma.user.create({
    data: {
      email: EMAIL,
      passwordHash,
      profile: {
        create: {
          name: 'Pedro Teste',
          objectives: ['Perder peso', 'Comer mais saudável'],
          topics: ['Macronutrientes', 'Vitaminas', 'Hidratação'],
          goal: 'regular',
          level: 1,
          xp: 0,
          streakDays: 0,
        },
      },
    },
  });

  console.log(`Usuário criado: ${EMAIL} / ${PASSWORD}`);

  // ── Unidade 1 — Macronutrientes ─────────────────────────────────────────
  const unit = await prisma.unit.create({
    data: {
      userId: user.id,
      section: 1,
      unitNumber: 1,
      title: 'Macronutrientes Essenciais',
      status: 'generated',
      studyMaterial: {
        sections: [
          {
            title: 'O que são macronutrientes?',
            content:
              'Macronutrientes são os nutrientes que o corpo precisa em grandes quantidades para funcionar corretamente. São eles: carboidratos, proteínas e gorduras (lipídios). Cada um tem funções específicas e fornece energia ao organismo.',
          },
          {
            title: 'Carboidratos',
            content:
              'Os carboidratos são a principal fonte de energia do corpo. Cada grama fornece 4 kcal. São encontrados em alimentos como arroz, macarrão, pão, frutas e legumes. Existem carboidratos simples (absorção rápida, como açúcar) e complexos (absorção lenta, como aveia e batata-doce).',
          },
          {
            title: 'Proteínas',
            content:
              'As proteínas são essenciais para a construção e reparo de tecidos, incluindo os músculos. Cada grama fornece 4 kcal. Fontes ricas em proteína: frango, peixe, ovo, feijão, lentilha e iogurte grego. A ingestão diária recomendada varia entre 0,8 g e 2 g por kg de peso corporal, dependendo do nível de atividade física.',
          },
          {
            title: 'Gorduras (Lipídios)',
            content:
              'As gorduras são essenciais para a absorção de vitaminas lipossolúveis (A, D, E, K), produção hormonal e saúde cerebral. Cada grama fornece 9 kcal — o dobro dos outros macronutrientes. Prefira gorduras insaturadas (azeite, abacate, castanhas) e evite gorduras trans (presentes em alimentos ultraprocessados).',
          },
        ],
      },
    },
  });

  // ── Lição 1 — gerada com questões ───────────────────────────────────────
  const lesson1 = await prisma.lesson.create({
    data: {
      unitId: unit.id,
      title: 'O que são Macronutrientes?',
      orderIndex: 0,
      status: 'generated',
      questions: {
        create: [
          {
            orderIndex: 0,
            type: 'multiple_choice',
            payload: {
              type: 'multiple-choice',
              question: 'Qual é a principal função dos carboidratos no organismo?',
              options: [
                'Construir músculos',
                'Fornecer energia',
                'Absorver vitaminas',
                'Regular hormônios',
              ],
              correctIndex: 1,
              explanation:
                'Os carboidratos são a principal fonte de energia do corpo, fornecendo 4 kcal por grama.',
            },
          },
          {
            orderIndex: 1,
            type: 'fill_blank',
            payload: {
              type: 'fill-blank',
              question: 'Complete: As proteínas fornecem ___ kcal por grama.',
              chips: ['4', '9', '7', '2'],
              correctChip: '4',
              explanation:
                'Proteínas e carboidratos fornecem 4 kcal por grama. Já as gorduras fornecem 9 kcal por grama.',
            },
          },
          {
            orderIndex: 2,
            type: 'image_choice',
            payload: {
              type: 'image-choice',
              question: 'Qual alimento é a melhor fonte de proteína?',
              options: [
                { label: 'Arroz', emoji: '🍚' },
                { label: 'Frango', emoji: '🍗' },
                { label: 'Azeite', emoji: '🫒' },
                { label: 'Banana', emoji: '🍌' },
              ],
              correctIndex: 1,
              explanation:
                'O frango é uma excelente fonte de proteína magra, essencial para construção muscular.',
            },
          },
          {
            orderIndex: 3,
            type: 'multiple_choice',
            payload: {
              type: 'multiple-choice',
              question: 'Quantas kcal por grama as gorduras fornecem?',
              options: ['4 kcal', '6 kcal', '9 kcal', '12 kcal'],
              correctIndex: 2,
              explanation:
                'As gorduras fornecem 9 kcal por grama — o maior valor energético entre os macronutrientes.',
            },
          },
          {
            orderIndex: 4,
            type: 'multiple_choice',
            payload: {
              type: 'multiple-choice',
              question: 'Qual vitamina NÃO é lipossolúvel?',
              options: ['Vitamina A', 'Vitamina C', 'Vitamina D', 'Vitamina K'],
              correctIndex: 1,
              explanation:
                'A vitamina C é hidrossolúvel. As vitaminas A, D, E e K são lipossolúveis e precisam de gordura para serem absorvidas.',
            },
          },
        ],
      },
    },
  });

  // ── Lição 2 — skeleton ───────────────────────────────────────────────────
  const lesson2 = await prisma.lesson.create({
    data: {
      unitId: unit.id,
      title: 'Carboidratos e Energia',
      orderIndex: 1,
      status: 'skeleton',
    },
  });

  // ── Lição 3 — skeleton ───────────────────────────────────────────────────
  const lesson3 = await prisma.lesson.create({
    data: {
      unitId: unit.id,
      title: 'Proteínas e Construção Muscular',
      orderIndex: 2,
      status: 'skeleton',
    },
  });

  // ── Unidade 2 — skeleton (simula próxima unidade ainda não gerada) ───────
  await prisma.unit.create({
    data: {
      userId: user.id,
      section: 1,
      unitNumber: 2,
      title: 'Micronutrientes e Vitaminas',
      status: 'skeleton',
    },
  });

  console.log('\n✓ Seed concluído!');
  console.log('─────────────────────────────────────');
  console.log(`E-mail   : ${EMAIL}`);
  console.log(`Senha    : ${PASSWORD}`);
  console.log(`Unidade  : ${unit.title} (gerada)`);
  console.log(`Lição 1  : ${lesson1.title} (5 questões — pronta)`);
  console.log(`Lição 2  : ${lesson2.title} (skeleton)`);
  console.log(`Lição 3  : ${lesson3.title} (skeleton)`);
  console.log('─────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
