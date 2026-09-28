// Chatbot and Flagging Log Types

export interface ChatSourceCitation {
  id: string;
  title: string;
  type: 'course' | 'resource';
  stage?: string;
  category?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isFlagged?: boolean;
  flagReason?: string;
  sources?: ChatSourceCitation[];
}

export interface FlaggedQuestion {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  businessStage?: string;
  question: string;
  timestamp: string;
  status: 'Pending Review' | 'Answered' | 'Dismissed';
  adminAnswer?: string;
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface ChatInteractionLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  businessStage?: string;
  query: string;
  response: string;
  timestamp: string;
  isFlagged: boolean;
  flagReason?: string;
  sourcesCount: number;
}
