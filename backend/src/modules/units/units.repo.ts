import { prisma } from '../../config/db';

export const unitsRepo = {
  findAllByUser(userId: string) {
    return prisma.unit.findMany({
      where: { userId },
      include: { lessons: { orderBy: { orderIndex: 'asc' } } },
      orderBy: [{ section: 'asc' }, { unitNumber: 'asc' }],
    });
  },

  findById(id: string, userId: string) {
    return prisma.unit.findFirst({
      where: { id, userId },
      include: { lessons: { orderBy: { orderIndex: 'asc' } } },
    });
  },

  createSkeletons(
    userId: string,
    units: Array<{ section: number; unitNumber: number; title: string }>
  ) {
    return prisma.$transaction(
      units.map((u) =>
        prisma.unit.create({
          data: { userId, section: u.section, unitNumber: u.unitNumber, title: u.title },
        })
      )
    );
  },
};
