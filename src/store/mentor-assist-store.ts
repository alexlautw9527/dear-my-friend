import { create } from 'zustand';
import type { MentorAssistFramework } from '@/types';
import { MENTOR_ASSIST_FRAMEWORK } from '@/types';
import { STORAGE_KEYS } from '@/constants';

// 導出狀態介面供其他模組使用
export interface MentorAssistState {
  isEnabled: boolean;
  isPanelOpen: boolean;
  currentFramework: MentorAssistFramework;
  customPrompts: string[];
  isInputFocused: boolean;        // 新增：輸入框焦點狀態
  expandedSections: {             // 新增：各區塊展開狀態
    frameworkGuide: boolean;
    quickPrompts: boolean;
  };
  recentPrompts: string[];        // 新增：最近使用的提示（用於排序）
}

interface MentorAssistStoreState {
  mentorAssistState: MentorAssistState;
  enableAssist: () => void;
  disableAssist: () => void;
  togglePanel: () => void;
  openPanel: () => void;
  closePanel: () => void;
  setFramework: (framework: MentorAssistFramework) => void;
  nextFramework: () => void;
  addCustomPrompt: (prompt: string) => void;
  removeCustomPrompt: (index: number) => void;
  
  setInputFocused: (focused: boolean) => void;
  toggleSection: (section: 'frameworkGuide' | 'quickPrompts') => void;
  recordPromptUsage: (prompt: string) => void;
  
  isEnabled: () => boolean;
  isPanelOpen: () => boolean;
  getCurrentFramework: () => MentorAssistFramework;
  getCustomPrompts: () => string[];
  isInputFocusedState: () => boolean;
  getExpandedSections: () => { frameworkGuide: boolean; quickPrompts: boolean };
  getRecentPrompts: () => string[];
  
  initialize: () => void;
  saveToStorage: () => void;
  loadFromStorage: () => void;
}

const initialMentorAssistState: MentorAssistState = {
  isEnabled: true,
  isPanelOpen: false,
  currentFramework: MENTOR_ASSIST_FRAMEWORK.WHAT,
  customPrompts: [],
  isInputFocused: false,
  expandedSections: {
    frameworkGuide: true,  // 框架指引預設展開
    quickPrompts: false,   // 快速提示預設收合
  },
  recentPrompts: [],
};

export const useMentorAssistStore = create<MentorAssistStoreState>((set, get) => ({
  mentorAssistState: initialMentorAssistState,

  enableAssist: () => {
    set((state) => ({
      mentorAssistState: {
        ...state.mentorAssistState,
        isEnabled: true,
      }
    }));
    get().saveToStorage();
  },

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

  closePanel: () => {
    set((state) => ({
      mentorAssistState: {
        ...state.mentorAssistState,
        isPanelOpen: false,
      }
    }));
    get().saveToStorage();
  },

  setFramework: (framework: MentorAssistFramework) => {
    set((state) => ({
      mentorAssistState: {
        ...state.mentorAssistState,
        currentFramework: framework,
      }
    }));
    get().saveToStorage();
  },

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

  removeCustomPrompt: (index: number) => {
    set((state) => ({
      mentorAssistState: {
        ...state.mentorAssistState,
        customPrompts: state.mentorAssistState.customPrompts.filter((_, i) => i !== index),
      }
    }));
    get().saveToStorage();
  },

  isEnabled: () => {
    return get().mentorAssistState.isEnabled;
  },

  isPanelOpen: () => {
    return get().mentorAssistState.isPanelOpen;
  },

  getCurrentFramework: () => {
    return get().mentorAssistState.currentFramework;
  },

  getCustomPrompts: () => {
    return get().mentorAssistState.customPrompts;
  },

  setInputFocused: (focused: boolean) => {
    set((state) => ({
      mentorAssistState: {
        ...state.mentorAssistState,
        isInputFocused: focused,
      }
    }));
  },

  toggleSection: (section: 'frameworkGuide' | 'quickPrompts') => {
    set((state) => ({
      mentorAssistState: {
        ...state.mentorAssistState,
        expandedSections: {
          ...state.mentorAssistState.expandedSections,
          [section]: !state.mentorAssistState.expandedSections[section],
        }
      }
    }));
    get().saveToStorage();
  },

  recordPromptUsage: (prompt: string) => {
    set((state) => {
      const recentPrompts = state.mentorAssistState.recentPrompts.filter(p => p !== prompt);
      recentPrompts.unshift(prompt);
      if (recentPrompts.length > 10) {
        recentPrompts.pop();
      }
      
      return {
        mentorAssistState: {
          ...state.mentorAssistState,
          recentPrompts,
        }
      };
    });
    get().saveToStorage();
  },

  isInputFocusedState: () => {
    return get().mentorAssistState.isInputFocused;
  },

  getExpandedSections: () => {
    return get().mentorAssistState.expandedSections;
  },

  getRecentPrompts: () => {
    return get().mentorAssistState.recentPrompts;
  },

  saveToStorage: () => {
    const state = get();
    try {
      localStorage.setItem(STORAGE_KEYS.MENTOR_ASSIST, JSON.stringify(state.mentorAssistState));
    } catch (error) {
      console.warn('Failed to save mentor assist state to localStorage:', error);
    }
  },

  loadFromStorage: () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MENTOR_ASSIST);
      if (saved) {
        const parsedState = JSON.parse(saved) as MentorAssistState;
        if (parsedState && typeof parsedState === 'object') {
          set({
            mentorAssistState: {
              ...initialMentorAssistState,
              ...parsedState,
                  customPrompts: Array.isArray(parsedState.customPrompts) ? parsedState.customPrompts : [],
              isInputFocused: false,
              expandedSections: parsedState.expandedSections || initialMentorAssistState.expandedSections,
              recentPrompts: Array.isArray(parsedState.recentPrompts) ? parsedState.recentPrompts : [],
            }
          });
        }
      }
    } catch (error) {
      console.warn('Failed to load mentor assist state from localStorage:', error);
      set({ mentorAssistState: initialMentorAssistState });
    }
  },

  initialize: () => {
    get().loadFromStorage();
  },
}));