import { api } from './client';
import type { Message } from '../../types/chat';

export const chatApi = {
  getMessages(unitId: string) {
    return api.get<{ messages: Message[] }>(`/units/${unitId}/chat/messages`);
  },

  sendMessage(unitId: string, content: string) {
    return api.post<{ userMessage: Message; assistantMessage: Message }>(
      `/units/${unitId}/chat/messages`,
      { content }
    );
  },
};
