import { useState, useEffect, useCallback } from 'react';
import type { TutorialState, TutorialStep } from '@/types';
import { TUTORIAL_STEP } from '@/types';
import { STORAGE_KEYS, TUTORIAL } from '@/constants';

type UseTutorialReturn = {
  // 狀態
  tutorialState: TutorialState;
  
  // 操作函數
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
};

const initialTutorialState: TutorialState = {
  isActive: false,
  currentStep: TUTORIAL_STEP.WELCOME,
  isStepTransitioning: false,
  canSkip: true,
  isOverlayVisible: false,
};

export function useTutorial(): UseTutorialReturn {
  const [tutorialState, setTutorialState] = useState<TutorialState>(initialTutorialState);

  // 檢查是否已完成教學
  const isTutorialCompleted = useCallback((): boolean => {
    return localStorage.getItem(STORAGE_KEYS.TUTORIAL_COMPLETED) === 'true';
  }, []);

  // 檢查是否應該自動開始教學
  const shouldAutoStartTutorial = useCallback((): boolean => {
    return !isTutorialCompleted();
  }, [isTutorialCompleted]);

  // 開始教學
  const startTutorial = useCallback(() => {
    setTutorialState({
      isActive: true,
      currentStep: TUTORIAL_STEP.WELCOME,
      isStepTransitioning: false,
      canSkip: true,
      isOverlayVisible: true,
    });
  }, []);

  // 進入下一步
  const nextStep = useCallback(() => {
    setTutorialState(prev => {
      const nextStepValue = prev.currentStep + 1;
      
      // 如果超過最後一步，完成教學
      if (nextStepValue > TUTORIAL_STEP.COMPLETE) {
        return {
          ...prev,
          isActive: false,
        };
      }

      return {
        ...prev,
        currentStep: nextStepValue as TutorialStep,
        isStepTransitioning: true,
      };
    });

    // 短暫延遲後結束轉場狀態
    setTimeout(() => {
      setTutorialState(prev => ({
        ...prev,
        isStepTransitioning: false,
      }));
    }, TUTORIAL.STEP_DURATION);
  }, []);

  // 跳過教學
  const skipTutorial = useCallback(() => {
    setTutorialState(prev => ({
      ...prev,
      isActive: false,
    }));
    // 記錄已完成教學
    localStorage.setItem(STORAGE_KEYS.TUTORIAL_COMPLETED, 'true');
  }, []);

  // 暫停教學（不標記為已完成）
  const pauseTutorial = useCallback(() => {
    setTutorialState(prev => ({
      ...prev,
      isActive: false,
    }));
    // 不設置 TUTORIAL_COMPLETED，讓用戶下次還能繼續
  }, []);

  // 完成教學
  const completeTutorial = useCallback(() => {
    setTutorialState(prev => ({
      ...prev,
      isActive: false,
    }));
    // 記錄已完成教學
    localStorage.setItem(STORAGE_KEYS.TUTORIAL_COMPLETED, 'true');
  }, []);

  // 獲取當前步驟標題
  const getCurrentStepTitle = useCallback((): string => {
    switch (tutorialState.currentStep) {
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
  }, [tutorialState.currentStep]);

  // 獲取示範訊息
  const getDemoMessage = useCallback((role: 'apprentice' | 'mentor'): string => {
    return TUTORIAL.DEMO_MESSAGES[role.toUpperCase() as 'APPRENTICE' | 'MENTOR'];
  }, []);

  // 隱藏覆蓋層
  const hideOverlay = useCallback(() => {
    setTutorialState(prev => ({
      ...prev,
      isOverlayVisible: false,
    }));
  }, []);

  // 顯示覆蓋層
  const showOverlay = useCallback(() => {
    setTutorialState(prev => ({
      ...prev,
      isOverlayVisible: true,
    }));
  }, []);

  // 初始化時檢查是否需要自動開始教學
  useEffect(() => {
    if (shouldAutoStartTutorial()) {
      startTutorial();
    }
  }, [shouldAutoStartTutorial, startTutorial]);

  return {
    tutorialState,
    startTutorial,
    nextStep,
    skipTutorial,
    pauseTutorial,
    completeTutorial,
    hideOverlay,
    showOverlay,
    isTutorialCompleted,
    shouldAutoStartTutorial,
    getCurrentStepTitle,
    getDemoMessage,
  };
} 