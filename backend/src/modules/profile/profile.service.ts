import { GoalKind } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler';
import { profileRepo } from './profile.repo';
import { unitsRepo } from '../units/units.repo';
import { aiService } from '../../ai/aiService';
import { jobs } from '../../queue/jobs';
import { buildLayout } from '../units/unitLayoutService';

function deriveUnit3Title(objectives: string[], topics: string[]): string {
  const first = objectives[0] ?? '';

  const map: Array<[string, string]> = [
    ['Perder peso',                                    'Estratégias para Emagrecer com Saúde'],
    ['Ganhar músculo',                                 'Nutrição para Construção Muscular'],
    ['Melhorar performance atlética',                  'Nutrição Esportiva e Performance'],
    ['Adotar alimentação vegetariana',                 'Nutrição Plant-Based: Guia Vegetariano'],
    ['Adotar veganismo',                               'Nutrição Plant-Based: Guia Vegano'],
    ['Controlar diabetes',                             'Alimentação e Controle da Diabetes'],
    ['Reduzir colesterol',                             'Saúde Cardiovascular e Alimentação'],
    ['Melhorar saúde intestinal',                      'Saúde Intestinal, Microbioma e Digestão'],
    ['Fortalecer imunidade',                           'Nutrição e Sistema Imunológico'],
    ['Melhorar energia e disposição',                  'Nutrição para Energia e Vitalidade'],
    ['Envelhecer com saúde',                           'Nutrição para Longevidade e Qualidade de Vida'],
    ['Reduzir consumo de açúcar e ultraprocessados',   'Desvendando o Açúcar e os Ultraprocessados'],
    ['Desenvolver relação saudável com a comida',      'Mindful Eating e Comportamento Alimentar'],
    ['Ganhar peso saudável',                           'Nutrição para Ganho de Peso Saudável'],
    ['Manter o peso',                                  'Equilíbrio Alimentar e Manutenção do Peso'],
  ];

  const match = map.find(([key]) => key === first);
  if (match) return match[1];

  // Fallback: usa o primeiro tópico escolhido
  const topic = topics[0];
  if (topic) return `Aprofundando em: ${topic}`;

  return 'Nutrição Personalizada para Você';
}

export const profileService = {
  async onboarding(
    userId: string,
    data: {
      name: string;
      objectives: string[];
      topics: string[];
      goal: GoalKind;
    }
  ) {
    const existing = await profileRepo.findByUserId(userId);
    if (existing) throw new AppError(409, 'PROFILE_EXISTS', 'Profile already created');

    const profile = await profileRepo.create({ userId, ...data });
    console.log(`[onboarding] Perfil criado para userId=${userId}`);

    const unit3Title = deriveUnit3Title(data.objectives, data.topics);
    const FIXED_UNITS = [
      { section: 1, unitNumber: 1, title: 'Fundamentos da Nutrição' },
      { section: 1, unitNumber: 2, title: 'Alimentação Saudável na Prática' },
      { section: 1, unitNumber: 3, title: unit3Title },
    ];
    console.log(`[onboarding] Unidades: [1] Fundamentos da Nutrição | [2] Alimentação Saudável na Prática | [3] ${unit3Title}`);

    const createdUnits = await unitsRepo.createSkeletons(userId, FIXED_UNITS);
    console.log(`[onboarding] ${createdUnits.length} unidades skeleton salvas no banco`);

    const unit1 = createdUnits[0];
    console.log(`[onboarding] Enfileirando generate-unit para unitId=${unit1.id} ("${unit1.title}")`);
    await jobs.enqueueGenerateUnit({ unitId: unit1.id, userId });
    console.log('[onboarding] Job enfileirado com sucesso. Onboarding concluído.');

    const units = createdUnits.map((u) => ({
      id: u.id,
      section: u.section,
      unit: u.unitNumber,
      title: u.title,
      status: u.status,
      nodes: buildLayout([], u.unitNumber).nodes,
      mascots: buildLayout([], u.unitNumber).mascots,
    }));

    return { profile, units };
  },

  async getMe(userId: string) {
    const [user, profile] = await Promise.all([
      profileRepo.findUserById(userId),
      profileRepo.findByUserId(userId),
    ]);
    if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User not found');

    // Find current unit: first non-completed generated unit
    const currentUnit = profile
      ? await import('../../config/db').then(({ prisma }) =>
          prisma.unit.findFirst({
            where: { userId, status: { in: ['generated', 'generating'] } },
            orderBy: [{ section: 'asc' }, { unitNumber: 'asc' }],
          })
        )
      : null;

    return {
      user: { id: user.id, email: user.email },
      profile,
      stats: {
        level: profile?.level ?? 1,
        xp: profile?.xp ?? 0,
        xp_for_next_level: (profile?.level ?? 1) * 1000,
        streak_days: profile?.streakDays ?? 0,
      },
      currentUnitId: currentUnit?.id ?? null,
    };
  },

  async updateMe(userId: string, data: { name?: string }) {
    const profile = await profileRepo.update(userId, data);
    return { profile };
  },
};
