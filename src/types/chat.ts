export interface Message {
  id: string | number;
  role: 'user' | 'assistant';
  content: string;
}
