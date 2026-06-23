import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../../middleware/auth';
import { chatService } from './chat.service';

const sendSchema = z.object({ content: z.string().min(1).max(2000) });

export const chatController = {
  async getMessages(req: AuthRequest, res: Response) {
    const result = await chatService.getMessages(String(req.params.id), req.userId);
    res.json(result);
  },

  async sendMessage(req: AuthRequest, res: Response) {
    const { content } = sendSchema.parse(req.body);
    const result = await chatService.sendMessage(String(req.params.id), req.userId, content);
    res.json(result);
  },
};
