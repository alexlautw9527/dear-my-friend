import { create } from 'zustand';
import type { Message, MessageRole } from '@/types';
import { MESSAGE_ROLE } from '@/types';
import { STORAGE_KEYS } from '@/constants';

interface ConversationState {
  // 狀態
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
}

// 儲存和載入函數
const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`儲存 ${key} 失敗:`, error);
  }
};

const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (error) {
    console.error(`載入 ${key} 失敗:`, error);
    return defaultValue;
  }
};

export const useConversationStore = create<ConversationState>((set, get) => ({
  // 初始狀態
  messages: [],
  tutorialMessages: [],
  isTutorialMode: false,
  isLoading: true,

  // 發送訊息
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
      saveToStorage(STORAGE_KEYS.TUTORIAL_CONVERSATION, updatedMessages);
    } else {
      const updatedMessages = [...state.messages, newMessage];
      set({ messages: updatedMessages });
      saveToStorage(STORAGE_KEYS.CONVERSATION, updatedMessages);
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
      saveToStorage(STORAGE_KEYS.TUTORIAL_CONVERSATION, updatedMessages);
    } else {
      set({ messages: updatedMessages });
      saveToStorage(STORAGE_KEYS.CONVERSATION, updatedMessages);
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
      saveToStorage(STORAGE_KEYS.TUTORIAL_CONVERSATION, updatedMessages);
    } else {
      set({ messages: updatedMessages });
      saveToStorage(STORAGE_KEYS.CONVERSATION, updatedMessages);
    }
  },

  // 清空對話
  clearMessages: () => {
    const state = get();
    if (state.isTutorialMode) {
      set({ tutorialMessages: [] });
      saveToStorage(STORAGE_KEYS.TUTORIAL_CONVERSATION, []);
    } else {
      set({ messages: [] });
      saveToStorage(STORAGE_KEYS.CONVERSATION, []);
    }
  },

  // 清空教學對話
  clearTutorialMessages: () => {
    set({ tutorialMessages: [] });
    saveToStorage(STORAGE_KEYS.TUTORIAL_CONVERSATION, []);
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

  // 初始化
  initialize: async () => {
    try {
      const savedMessages = loadFromStorage<Message[]>(STORAGE_KEYS.CONVERSATION, []);
      const savedTutorialMessages = loadFromStorage<Message[]>(STORAGE_KEYS.TUTORIAL_CONVERSATION, []);
      
      set({
        messages: savedMessages,
        tutorialMessages: savedTutorialMessages,
        isLoading: false,
      });
    } catch (error) {
      console.error('對話初始化失敗:', error);
      set({ isLoading: false });
    }
  },
}));