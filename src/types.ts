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

// 教學步驟
export const TUTORIAL_STEP = {
  WELCOME: 0,
  APPRENTICE_DEMO: 1,
  SWITCH_GUIDE: 2,
  MENTOR_INTRO: 3,
  MENTOR_DEMO: 4,
  MENTOR_RESPONSE_REVIEW: 5,
  COMPLETE: 6,
} as const;

export type TutorialStep = typeof TUTORIAL_STEP[keyof typeof TUTORIAL_STEP];

// 教學狀態
export type TutorialState = {
  isActive: boolean;
  currentStep: TutorialStep;
  isStepTransitioning: boolean;
  canSkip: boolean;
  isOverlayVisible: boolean;
};

// 教學示範訊息
export type TutorialDemoMessages = {
  apprentice: string;
  mentor: string;
};

// 應用程式狀態
export type AppState = {
  conversation: ConversationState;
  countdown: CountdownState;
  tutorial: TutorialState;
  isLoading: boolean;
};

// 會話（Session）相關型別
export type Session = {
  id: string;
  title: string;
  messages: Message[];
  tutorialMessages: Message[];
  createdAt: number;
  updatedAt: number;
};

// 會話管理狀態
export type SessionState = {
  sessions: Session[];
  currentSessionId: string | null;
  isLoading: boolean;
};

// 會話操作型別
export type SessionOperations = {
  createSession: (title?: string) => Session;
  deleteSession: (sessionId: string) => void;
  renameSession: (sessionId: string, newTitle: string) => void;
  switchToSession: (sessionId: string) => void;
  getCurrentSession: () => Session | null;
  updateSessionMessages: (sessionId: string, messages: Message[], tutorialMessages: Message[]) => void;
};

// 保留舊有型別以維持相容性（稍後可移除）
export type Role = MessageRole;
export interface ChatState {
  messages: Message[];
  currentRole: MessageRole;
  friendName: string;
} 