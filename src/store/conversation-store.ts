import { create } from 'zustand';
import type { Message, MessageRole } from '@/types';
import { MESSAGE_ROLE } from '@/types';

interface ConversationState {
  messages: Message[];
  tutorialMessages: Message[];
  isTutorialMode: boolean;
  isLoading: boolean;
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
  
  loadSessionMessages: (messages: Message[], tutorialMessages: Message[]) => void;
  getMessagesForSession: () => { messages: Message[], tutorialMessages: Message[] };
}


export const useConversationStore = create<ConversationState>((set, get) => ({
  messages: [],
  tutorialMessages: [],
  isTutorialMode: false,
  isLoading: true,

  sendMessage: (content: string, role: MessageRole) => {
    const newMessage: Message = {
      // 使用時間戳作為 ID 存在重複風險，但在單一客戶端環境下概率極低
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

  clearMessages: () => {
    const state = get();
    if (state.isTutorialMode) {
      set({ tutorialMessages: [] });
    } else {
      set({ messages: [] });
    }
  },

  clearTutorialMessages: () => {
    set({ tutorialMessages: [] });
  },

  switchToTutorialMode: () => {
    set({ isTutorialMode: true });
  },

  switchToNormalMode: () => {
    set({ isTutorialMode: false });
  },

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

  initialize: async () => {
    try {
      set({ isLoading: false });
    } catch (error) {
      console.error('對話初始化失敗:', error);
      set({ isLoading: false });
    }
  },

  loadSessionMessages: (messages: Message[], tutorialMessages: Message[]) => {
    set({ 
      messages: [...messages], 
      tutorialMessages: [...tutorialMessages] 
    });
  },

  getMessagesForSession: () => {
    const state = get();
    return {
      messages: state.messages,
      tutorialMessages: state.tutorialMessages,
    };
  },
}));