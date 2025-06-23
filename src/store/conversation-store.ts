import { create } from 'zustand';
import type { Message, MessageRole } from '@/types';
import { MESSAGE_ROLE } from '@/types';

interface ConversationState {
  // 狀態 (保持原有介面以確保兼容性)
  messages: Message[];
  tutorialMessages: Message[];
  isTutorialMode: boolean;
  isLoading: boolean;
  
  // 操作
  sendMessage: (content: string, role: MessageRole) => void;
  editMessage: (messageId: string, newContent: string) => void;
  startEditMessage: (messageId: string) => void;
  cancelEditMessage: (messageId: string) => void;
  deleteMessage: (messageId: string) => void;
  clearMessages: () => void;
  clearTutorialMessages: () => void;
  switchToTutorialMode: () => void;
  switchToNormalMode: () => void;
  exportMessages: (format?: 'markdown' | 'text') => string;
  initialize: () => Promise<void>;
  
  // 新增：支援多會話的方法
  loadSessionMessages: (messages: Message[], tutorialMessages: Message[]) => void;
  getMessagesForSession: () => { messages: Message[], tutorialMessages: Message[] };
}


export const useConversationStore = create<ConversationState>((set, get) => ({
  // 初始狀態
  messages: [],
  tutorialMessages: [],
  isTutorialMode: false,
  isLoading: true,

  // 發送訊息（不再直接儲存到 localStorage，改為返回新的訊息陣列供 session store 處理）
  sendMessage: (content: string, role: MessageRole) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      role,
      timestamp: Date.now(),
    };
    
    const state = get();
    if (state.isTutorialMode) {
      const updatedMessages = [...state.tutorialMessages, newMessage];
      set({ tutorialMessages: updatedMessages });
    } else {
      const updatedMessages = [...state.messages, newMessage];
      set({ messages: updatedMessages });
    }
  },

  // 編輯訊息
  editMessage: (messageId: string, newContent: string) => {
    const state = get();
    const targetMessages = state.isTutorialMode ? state.tutorialMessages : state.messages;
    const updatedMessages = targetMessages.map(msg => 
      msg.id === messageId 
        ? { ...msg, content: newContent.trim(), isEditing: false }
        : msg
    );
    
    if (state.isTutorialMode) {
      set({ tutorialMessages: updatedMessages });
    } else {
      set({ messages: updatedMessages });
    }
  },

  // 開始編輯訊息
  startEditMessage: (messageId: string) => {
    const state = get();
    const targetMessages = state.isTutorialMode ? state.tutorialMessages : state.messages;
    const updatedMessages = targetMessages.map(msg => 
      msg.id === messageId 
        ? { ...msg, isEditing: true }
        : { ...msg, isEditing: false }
    );
    
    if (state.isTutorialMode) {
      set({ tutorialMessages: updatedMessages });
    } else {
      set({ messages: updatedMessages });
    }
  },

  // 取消編輯訊息
  cancelEditMessage: (messageId: string) => {
    const state = get();
    const targetMessages = state.isTutorialMode ? state.tutorialMessages : state.messages;
    const updatedMessages = targetMessages.map(msg => 
      msg.id === messageId ? { ...msg, isEditing: false } : msg
    );
    
    if (state.isTutorialMode) {
      set({ tutorialMessages: updatedMessages });
    } else {
      set({ messages: updatedMessages });
    }
  },

  // 刪除訊息
  deleteMessage: (messageId: string) => {
    const state = get();
    const targetMessages = state.isTutorialMode ? state.tutorialMessages : state.messages;
    const updatedMessages = targetMessages.filter(msg => msg.id !== messageId);
    
    if (state.isTutorialMode) {
      set({ tutorialMessages: updatedMessages });
    } else {
      set({ messages: updatedMessages });
    }
  },

  // 清空對話
  clearMessages: () => {
    const state = get();
    if (state.isTutorialMode) {
      set({ tutorialMessages: [] });
    } else {
      set({ messages: [] });
    }
  },

  // 清空教學對話
  clearTutorialMessages: () => {
    set({ tutorialMessages: [] });
  },

  // 切換到教學模式
  switchToTutorialMode: () => {
    set({ isTutorialMode: true });
  },

  // 切換到一般模式
  switchToNormalMode: () => {
    set({ isTutorialMode: false });
  },

  // 匯出對話
  exportMessages: (format: 'markdown' | 'text' = 'markdown') => {
    const state = get();
    const messagesToExport = state.isTutorialMode ? state.tutorialMessages : state.messages;
    
    if (messagesToExport.length === 0) {
      return '';
    }

    const formatDate = (timestamp: number) => {
      return new Date(timestamp).toLocaleString('zh-TW');
    };

    const modeLabel = state.isTutorialMode ? '教學模式' : '一般模式';

    if (format === 'markdown') {
      const content = messagesToExport.map(message => {
        const roleLabel = message.role === MESSAGE_ROLE.APPRENTICE ? '🧑‍🎓 學徒' : '🎓 導師';
        const time = formatDate(message.timestamp);
        return `## ${roleLabel} - ${time}\n\n${message.content}\n\n---\n`;
      }).join('\n');

      return `# Dear My Friend - 對話記錄 (${modeLabel})\n\n匯出時間: ${formatDate(Date.now())}\n\n${content}`;
    } else {
      const content = messagesToExport.map(message => {
        const roleLabel = message.role === MESSAGE_ROLE.APPRENTICE ? '[學徒]' : '[導師]';
        const time = formatDate(message.timestamp);
        return `${roleLabel} ${time}\n${message.content}\n\n`;
      }).join('');

      return `Dear My Friend - 對話記錄 (${modeLabel})\n匯出時間: ${formatDate(Date.now())}\n\n${content}`;
    }
  },

  // 初始化（現在只設置載入狀態，實際數據由 session store 提供）
  initialize: async () => {
    try {
      set({ isLoading: false });
    } catch (error) {
      console.error('對話初始化失敗:', error);
      set({ isLoading: false });
    }
  },

  // 新增：載入會話訊息
  loadSessionMessages: (messages: Message[], tutorialMessages: Message[]) => {
    set({ 
      messages: [...messages], 
      tutorialMessages: [...tutorialMessages] 
    });
  },

  // 新增：取得當前會話的訊息（供 session store 儲存使用）
  getMessagesForSession: () => {
    const state = get();
    return {
      messages: state.messages,
      tutorialMessages: state.tutorialMessages,
    };
  },
}));