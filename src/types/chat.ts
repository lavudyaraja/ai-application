export type ChatMode = 'chat' | 'think' | 'search';
export type ChatModel = 'gemini-1.5-flash' | 'gpt-4o' | 'claude-3-opus' | 'grok-1';

export interface Attachment {
  type: 'image' | 'file' | 'pdf';
  name: string;
  url: string; // For images, this will be a data URL
  size: number;
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  attachments?: Attachment[];
  created_at: Date
  conversation_id: string
  user_id: string
  error?: string;
}

export interface Conversation {
  id:string
  title: string
  created_at: Date
  updated_at: Date
  user_id: string
  messages: Message[]
}
