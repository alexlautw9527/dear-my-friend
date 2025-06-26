import { create } from 'zustand';
import type { MentorAssistState, MentorAssistFramework } from '@/types';
import { MENTOR_ASSIST_FRAMEWORK } from '@/types';
import { STORAGE_KEYS } from '@/constants';

interface MentorAssistStoreState {
  // 狀態
  mentorAssistState: MentorAssistState;
  
  // 操作
  enableAssist: () => void;
  disableAssist: () => void;
  togglePanel: () => void;
  openPanel: () => void;
  closePanel: () => void;
  setFramework: (framework: MentorAssistFramework) => void;
  nextFramework: () => void;
  addCustomPrompt: (prompt: string) => void;
  removeCustomPrompt: (index: number) => void;
  
  // 檢查函數
  isEnabled: () => boolean;
  isPanelOpen: () => boolean;
  getCurrentFramework: () => MentorAssistFramework;
  getCustomPrompts: () => string[];
  
  // 初始化和持久化
  initialize: () => void;
  saveToStorage: () => void;
  loadFromStorage: () => void;
}

const initialMentorAssistState: MentorAssistState = {
  isEnabled: true,
  isPanelOpen: false,
  currentFramework: MENTOR_ASSIST_FRAMEWORK.WHAT,
  customPrompts: [],
};

export const useMentorAssistStore = create<MentorAssistStoreState>((set, get) => ({
  // 初始狀態
  mentorAssistState: initialMentorAssistState,

  // 啟用輔助功能
  enableAssist: () => {
    set((state) => ({
      mentorAssistState: {
        ...state.mentorAssistState,
        isEnabled: true,
      }
    }));
    get().saveToStorage();
  },

  // 停用輔助功能
  disableAssist: () => {
    set((state) => ({
      mentorAssistState: {
        ...state.mentorAssistState,
        isEnabled: false,
        isPanelOpen: false, // 停用時也關閉面板
      }
    }));
    get().saveToStorage();
  },

  // 切換面板開關
  togglePanel: () => {
    const state = get();
    if (!state.mentorAssistState.isEnabled) return; // 未啟用時不能開啟面板
    
    set((state) => ({
      mentorAssistState: {
        ...state.mentorAssistState,
        isPanelOpen: !state.mentorAssistState.isPanelOpen,
      }
    }));
    get().saveToStorage();
  },

  // 開啟面板
  openPanel: () => {
    const state = get();
    if (!state.mentorAssistState.isEnabled) return;
    
    set((state) => ({
      mentorAssistState: {
        ...state.mentorAssistState,
        isPanelOpen: true,
      }
    }));
    get().saveToStorage();
  },

  // 關閉面板
  closePanel: () => {
    set((state) => ({
      mentorAssistState: {
        ...state.mentorAssistState,
        isPanelOpen: false,
      }
    }));
    get().saveToStorage();
  },

  // 設定當前框架
  setFramework: (framework: MentorAssistFramework) => {
    set((state) => ({
      mentorAssistState: {
        ...state.mentorAssistState,
        currentFramework: framework,
      }
    }));
    get().saveToStorage();
  },

  // 切換到下一個框架
  nextFramework: () => {
    const state = get();
    const frameworks = Object.values(MENTOR_ASSIST_FRAMEWORK);
    const currentIndex = frameworks.indexOf(state.mentorAssistState.currentFramework);
    const nextIndex = (currentIndex + 1) % frameworks.length;
    
    set((state) => ({
      mentorAssistState: {
        ...state.mentorAssistState,
        currentFramework: frameworks[nextIndex],
      }
    }));
    get().saveToStorage();
  },

  // 新增自訂提示
  addCustomPrompt: (prompt: string) => {
    if (!prompt.trim()) return;
    
    set((state) => ({
      mentorAssistState: {
        ...state.mentorAssistState,
        customPrompts: [...state.mentorAssistState.customPrompts, prompt.trim()],
      }
    }));
    get().saveToStorage();
  },

  // 移除自訂提示
  removeCustomPrompt: (index: number) => {
    set((state) => ({
      mentorAssistState: {
        ...state.mentorAssistState,
        customPrompts: state.mentorAssistState.customPrompts.filter((_, i) => i !== index),
      }
    }));
    get().saveToStorage();
  },

  // 檢查是否啟用
  isEnabled: () => {
    return get().mentorAssistState.isEnabled;
  },

  // 檢查面板是否開啟
  isPanelOpen: () => {
    return get().mentorAssistState.isPanelOpen;
  },

  // 獲取當前框架
  getCurrentFramework: () => {
    return get().mentorAssistState.currentFramework;
  },

  // 獲取自訂提示
  getCustomPrompts: () => {
    return get().mentorAssistState.customPrompts;
  },

  // 儲存到 localStorage
  saveToStorage: () => {
    const state = get();
    try {
      localStorage.setItem(STORAGE_KEYS.MENTOR_ASSIST, JSON.stringify(state.mentorAssistState));
    } catch (error) {
      console.warn('Failed to save mentor assist state to localStorage:', error);
    }
  },

  // 從 localStorage 載入
  loadFromStorage: () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MENTOR_ASSIST);
      if (saved) {
        const parsedState = JSON.parse(saved) as MentorAssistState;
        // 驗證資料結構
        if (parsedState && typeof parsedState === 'object') {
          set({
            mentorAssistState: {
              ...initialMentorAssistState,
              ...parsedState,
              // 確保 customPrompts 是陣列
              customPrompts: Array.isArray(parsedState.customPrompts) ? parsedState.customPrompts : [],
            }
          });
        }
      }
    } catch (error) {
      console.warn('Failed to load mentor assist state from localStorage:', error);
      // 載入失敗時使用預設狀態
      set({ mentorAssistState: initialMentorAssistState });
    }
  },

  // 初始化
  initialize: () => {
    get().loadFromStorage();
  },
}));