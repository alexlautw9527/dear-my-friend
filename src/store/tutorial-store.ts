import { create } from 'zustand';
import type { TutorialState, TutorialStep } from '@/types';
import { TUTORIAL_STEP } from '@/types';
import { STORAGE_KEYS, TUTORIAL } from '@/constants';

interface TutorialStoreState {
  // 狀態
  tutorialState: TutorialState;
  
  // 操作
  startTutorial: () => void;
  nextStep: () => void;
  skipTutorial: () => void;
  pauseTutorial: () => void;
  completeTutorial: () => void;
  hideOverlay: () => void;
  showOverlay: () => void;
  
  // 檢查函數
  isTutorialCompleted: () => boolean;
  shouldAutoStartTutorial: () => boolean;
  
  // 教學內容
  getCurrentStepTitle: () => string;
  getDemoMessage: (role: 'apprentice' | 'mentor') => string;
  
  // 初始化
  initialize: () => void;
}

const initialTutorialState: TutorialState = {
  isActive: false,
  currentStep: TUTORIAL_STEP.WELCOME,
  isStepTransitioning: false,
  canSkip: true,
  isOverlayVisible: false,
};

export const useTutorialStore = create<TutorialStoreState>((set, get) => ({
  // 初始狀態
  tutorialState: initialTutorialState,

  // 開始教學
  startTutorial: () => {
    set({
      tutorialState: {
        isActive: true,
        currentStep: TUTORIAL_STEP.WELCOME,
        isStepTransitioning: false,
        canSkip: true,
        isOverlayVisible: true,
      }
    });
  },

  // 進入下一步
  nextStep: () => {
    const state = get();
    const nextStepValue = state.tutorialState.currentStep + 1;
    
    if (nextStepValue > TUTORIAL_STEP.COMPLETE) {
      set({
        tutorialState: {
          ...state.tutorialState,
          isActive: false,
        }
      });
      return;
    }

    set({
      tutorialState: {
        ...state.tutorialState,
        currentStep: nextStepValue as TutorialStep,
        isStepTransitioning: true,
      }
    });

    setTimeout(() => {
      set({
        tutorialState: {
          ...get().tutorialState,
          isStepTransitioning: false,
        }
      });
    }, TUTORIAL.STEP_DURATION);
  },

  // 跳過教學
  skipTutorial: () => {
    set({
      tutorialState: {
        ...get().tutorialState,
        isActive: false,
      }
    });
    localStorage.setItem(STORAGE_KEYS.TUTORIAL_COMPLETED, 'true');
  },

  // 暫停教學（不標記為已完成）
  pauseTutorial: () => {
    set({
      tutorialState: {
        ...get().tutorialState,
        isActive: false,
      }
    });
  },

  // 完成教學
  completeTutorial: () => {
    set({
      tutorialState: {
        ...get().tutorialState,
        isActive: false,
      }
    });
    localStorage.setItem(STORAGE_KEYS.TUTORIAL_COMPLETED, 'true');
  },

  // 隱藏覆蓋層
  hideOverlay: () => {
    set({
      tutorialState: {
        ...get().tutorialState,
        isOverlayVisible: false,
      }
    });
  },

  // 顯示覆蓋層
  showOverlay: () => {
    set({
      tutorialState: {
        ...get().tutorialState,
        isOverlayVisible: true,
      }
    });
  },

  // 檢查是否已完成教學
  isTutorialCompleted: () => {
    return localStorage.getItem(STORAGE_KEYS.TUTORIAL_COMPLETED) === 'true';
  },

  // 檢查是否應該自動開始教學
  shouldAutoStartTutorial: () => {
    const state = get();
    return !state.isTutorialCompleted();
  },

  // 獲取當前步驟標題
  getCurrentStepTitle: () => {
    const state = get();
    switch (state.tutorialState.currentStep) {
      case TUTORIAL_STEP.WELCOME:
        return TUTORIAL.STEP_TITLES.WELCOME;
      case TUTORIAL_STEP.APPRENTICE_DEMO:
        return TUTORIAL.STEP_TITLES.APPRENTICE_DEMO;
      case TUTORIAL_STEP.SWITCH_GUIDE:
        return TUTORIAL.STEP_TITLES.SWITCH_GUIDE;
      case TUTORIAL_STEP.MENTOR_INTRO:
        return TUTORIAL.STEP_TITLES.MENTOR_INTRO;
      case TUTORIAL_STEP.MENTOR_DEMO:
        return TUTORIAL.STEP_TITLES.MENTOR_DEMO;
      case TUTORIAL_STEP.MENTOR_RESPONSE_REVIEW:
        return TUTORIAL.STEP_TITLES.MENTOR_RESPONSE_REVIEW;
      case TUTORIAL_STEP.COMPLETE:
        return TUTORIAL.STEP_TITLES.COMPLETE;
      default:
        return '';
    }
  },

  // 獲取示範訊息
  getDemoMessage: (role: 'apprentice' | 'mentor') => {
    return TUTORIAL.DEMO_MESSAGES[role.toUpperCase() as 'APPRENTICE' | 'MENTOR'];
  },

  // 初始化
  initialize: () => {
    const state = get();
    if (state.shouldAutoStartTutorial()) {
      state.startTutorial();
    }
  },
}));