export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  id: string;
}

export interface ChatSession {
  id:string;
  title: string;
  messages: ChatMessage[];
  bibleVersion: string;
  language: string;
  createdAt: number;
}

export interface SavedItem {
  id: string;
  message: ChatMessage;
  note: string;
  savedAt: number;
  sessionId: string;
  sessionTitle: string;
  isEnriching?: boolean;
  keywords?: string[];
  aiReflection?: string;
  crossReferences?: {
    reference: string;
    text: string;
  }[];
}

export interface Devotional {
  id: string;
  dayId: string;
  date: string;
  reading: {
    reference: string;
    text: string;
  };
  reflection: string;
  prayer: string;
}