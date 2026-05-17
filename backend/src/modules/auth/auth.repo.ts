import { prisma } from '../../config/db';

export const authRepo = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  },

  create(email: string, passwordHash: string) {
    return prisma.user.create({
      data: { email: email.toLowerCase(), passwordHash },
    });
  },

  resetPassword(email: string, passwordHash: string) {
    return prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { passwordHash },
    });
  },
};
