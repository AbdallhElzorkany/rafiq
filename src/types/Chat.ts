export interface Conversation {
  partnerId: string;
  partnerName: string;
  lastMessage: Message;
  unreadCount: number;
}
export interface ConversationItemProps {
  conversation: Conversation;
}

export interface ConversationsSideBarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}
export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  sentAt: string;
  isRead: boolean;
  readAt: null | string;
}

export interface Chat {
  messages: Message[];
  partnerName: string;
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface Contact {
  id?: string;
  fullName?: string;
  familyId?: string;
  familyName?: string;
}