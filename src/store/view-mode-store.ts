import { create } from 'zustand';
import type { ViewMode } from '@/types';
import { VIEW_MODE } from '@/types';
import { STORAGE_KEYS } from '@/constants';

interface ViewModeState {
  // 狀態
  currentViewMode: ViewMode;
  isTransitioning: boolean;
  
  // 操作
  switchViewMode: () => void;
  resetToApprentice: () => void;
  setTransitioning: (transitioning: boolean) => void;
  getTargetViewMode: () => ViewMode;
  getCurrentRoleLabel: () => string;
  getTargetRoleLabel: () => string;
  initialize: () => void;
}

// 儲存和載入函數
const saveToStorage = (key: string, data: unknown) => {
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

export const useViewModeStore = create<ViewModeState>((set, get) => ({
  // 初始狀態
  currentViewMode: VIEW_MODE.APPRENTICE,
  isTransitioning: false,

  // 切換視角
  switchViewMode: () => {
    const state = get();
    const newViewMode = state.currentViewMode === VIEW_MODE.APPRENTICE ? VIEW_MODE.MENTOR : VIEW_MODE.APPRENTICE;
    set({ currentViewMode: newViewMode });
    saveToStorage(STORAGE_KEYS.VIEW_MODE, newViewMode);
  },

  // 重置到學徒視角
  resetToApprentice: () => {
    const state = get();
    if (state.currentViewMode === VIEW_MODE.MENTOR) {
      set({ currentViewMode: VIEW_MODE.APPRENTICE });
      saveToStorage(STORAGE_KEYS.VIEW_MODE, VIEW_MODE.APPRENTICE);
    }
  },

  // 設置轉場狀態
  setTransitioning: (transitioning: boolean) => {
    set({ isTransitioning: transitioning });
  },

  // 獲取目標視角
  getTargetViewMode: () => {
    const state = get();
    return state.currentViewMode === VIEW_MODE.APPRENTICE ? VIEW_MODE.MENTOR : VIEW_MODE.APPRENTICE;
  },

  // 獲取當前角色標籤
  getCurrentRoleLabel: () => {
    const state = get();
    return state.currentViewMode === VIEW_MODE.APPRENTICE ? '學徒' : '導師';
  },

  // 獲取目標角色標籤
  getTargetRoleLabel: () => {
    const state = get();
    const targetMode = state.getTargetViewMode();
    return targetMode === VIEW_MODE.APPRENTICE ? '學徒' : '導師';
  },

  // 初始化
  initialize: () => {
    const savedViewMode = loadFromStorage<ViewMode>(STORAGE_KEYS.VIEW_MODE, VIEW_MODE.APPRENTICE);
    set({ currentViewMode: savedViewMode });
  },
}));