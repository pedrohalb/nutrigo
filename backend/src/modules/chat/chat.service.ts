import { AppError } from '../../middleware/errorHandler';
import { prisma } from '../../config/db';
import { aiService } from '../../ai/aiService';
import { chatRepo } from './chat.repo';

function toFrontendMessage(m: { id: string; role: string; content: string; createdAt: Date }) {
  return { id: m.id, role: m.role as 'user' | 'assistant', content: m.content };
}

async function assertUnitOwner(unitId: string, userId: string) {
  const unit = await prisma.unit.findFirst({ where: { id: unitId, userId } });
  if (!unit) throw new AppError(404, 'NOT_FOUND', 'Unit not found');
  return unit;
}

export const chatService = {
  async getMessages(unitId: string, userId: string) {
    await assertUnitOwner(unitId, userId);
    const thread = await chatRepo.getOrCreateThread(userId, unitId);
    const messages = await chatRepo.getMessages(thread.id);
    return { messages: messages.map(toFrontendMessage) };
  },

  async sendMessage(unitId: string, userId: string, content: string) {
    const unit = await assertUnitOwner(unitId, userId);

    const thread = await chatRepo.getOrCreateThread(userId, unitId);

    // Load last 6 messages for context
    const history = await chatRepo.getLastN(thread.id, 6);

    // Save user message
    const userMessage = await chatRepo.saveMessage(thread.id, 'user', content);

    // Call Haiku
    const replyText = await aiService.chat(
      unit.title,
      unit.studyMaterial,
      history.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      content
    );

    // Save assistant message
    const assistantMessage = await chatRepo.saveMessage(thread.id, 'assistant', replyText);

    return {
      userMessage: toFrontendMessage(userMessage),
      assistantMessage: toFrontendMessage(assistantMessage),
    };
  },
};
