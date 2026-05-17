import { prisma } from '../../config/db';

export const chatRepo = {
  async getOrCreateThread(userId: string, unitId: string) {
    return prisma.chatThread.upsert({
      where: { userId_unitId: { userId, unitId } },
      create: { userId, unitId },
      update: {},
    });
  },

  getMessages(threadId: string) {
    return prisma.chatMessage.findMany({
      where: { threadId },
      orderBy: { createdAt: 'asc' },
    });
  },

  getLastN(threadId: string, n: number) {
    return prisma.chatMessage.findMany({
      where: { threadId },
      orderBy: { createdAt: 'desc' },
      take: n,
    }).then((rows) => rows.reverse());
  },

  saveMessage(threadId: string, role: 'user' | 'assistant', content: string) {
    return prisma.chatMessage.create({
      data: { threadId, role, content },
    });
  },
};
