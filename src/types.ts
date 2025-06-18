// 視角模式
export const VIEW_MODE = {
  APPRENTICE: 'apprentice',
  MENTOR: 'mentor',
} as const;

export type ViewMode = typeof VIEW_MODE[keyof typeof VIEW_MODE];

// 訊息角色
export const MESSAGE_ROLE = {
  APPRENTICE: 'apprentice',
  MENTOR: 'mentor',
} as const;

export type MessageRole = typeof MESSAGE_ROLE[keyof typeof MESSAGE_ROLE];

// 訊息型別
export type Message = {
  id: string;
  content: string;
  role: MessageRole;
  timestamp: number;
  isEditing?: boolean;
};

// 對話狀態
export type ConversationState = {
  messages: Message[];
  currentViewMode: ViewMode;
  isTransitioning: boolean;
};

// 倒數計時狀態
export type CountdownState = {
  isActive: boolean;
  remainingTime: number;
  canSkip: boolean;
};

// 導出類型
export type ExportFormat = 'markdown' | 'text';

// 應用程式狀態
export type AppState = {
  conversation: ConversationState;
  countdown: CountdownState;
  isLoading: boolean;
};

// 保留舊有型別以維持相容性（稍後可移除）
export type Role = MessageRole;
export interface ChatState {
  messages: Message[];
  currentRole: MessageRole;
  friendName: string;
} 