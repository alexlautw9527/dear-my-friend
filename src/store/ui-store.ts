import { create } from 'zustand';

interface UIState {
  // 狀態
  showIntroductionModal: boolean;
  showTutorialAnalysisButton: boolean;
  
  // 操作
  setShowIntroductionModal: (show: boolean) => void;
  setShowTutorialAnalysisButton: (show: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  // 初始狀態
  showIntroductionModal: false,
  showTutorialAnalysisButton: false,

  // 設置說明 Modal 顯示狀態
  setShowIntroductionModal: (show: boolean) => {
    set({ showIntroductionModal: show });
  },

  // 設置教學分析按鈕顯示狀態
  setShowTutorialAnalysisButton: (show: boolean) => {
    set({ showTutorialAnalysisButton: show });
  },
}));