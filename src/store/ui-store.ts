import { create } from 'zustand';

interface UIState {
  showIntroductionModal: boolean;
  showTutorialAnalysisButton: boolean;
  setShowIntroductionModal: (show: boolean) => void;
  setShowTutorialAnalysisButton: (show: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  showIntroductionModal: false,
  showTutorialAnalysisButton: false,

  setShowIntroductionModal: (show: boolean) => {
    set({ showIntroductionModal: show });
  },

  setShowTutorialAnalysisButton: (show: boolean) => {
    set({ showTutorialAnalysisButton: show });
  },
}));