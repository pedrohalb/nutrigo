import { AppError } from '../../middleware/errorHandler';
import { unitsRepo } from './units.repo';
import { buildLayout } from './unitLayoutService';

export const unitsService = {
  async getUnits(userId: string) {
    const units = await unitsRepo.findAllByUser(userId);

    const sectionMap = new Map<number, typeof units>();
    for (const unit of units) {
      if (!sectionMap.has(unit.section)) sectionMap.set(unit.section, []);
      sectionMap.get(unit.section)!.push(unit);
    }

    const sections = Array.from(sectionMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([section, sectionUnits]) => ({
        section,
        units: sectionUnits.map((u) => {
          const { nodes, mascots } = buildLayout(u.lessons, u.unitNumber);
          return {
            id: u.id,
            section: u.section,
            unit: u.unitNumber,
            title: u.title,
            status: u.status,
            nodes,
            mascots,
          };
        }),
      }));

    return { sections };
  },

  async getUnit(unitId: string, userId: string) {
    const unit = await unitsRepo.findById(unitId, userId);
    if (!unit) throw new AppError(404, 'NOT_FOUND', 'Unit not found');

    const { nodes, mascots } = buildLayout(unit.lessons, unit.unitNumber);

    return {
      id: unit.id,
      section: unit.section,
      unit: unit.unitNumber,
      title: unit.title,
      status: unit.status,
      nodes,
      mascots,
      studyMaterial: unit.studyMaterial,
      summary: unit.summary,
      lessons: unit.lessons.map((l) => ({
        id: l.id,
        orderIndex: l.orderIndex,
        title: l.title,
        status: l.status,
        completed: l.status === 'completed',
      })),
    };
  },
};
