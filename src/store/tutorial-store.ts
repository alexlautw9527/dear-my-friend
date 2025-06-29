import { create } from 'zustand';
import type { TutorialState, TutorialStep } from '@/types';
import { TUTORIAL_STEP } from '@/types';
import { STORAGE_KEYS, TUTORIAL } from '@/constants';

interface TutorialStoreState {
  tutorialState: TutorialState;
  startTutorial: () => void;
  nextStep: () => void;
  skipTutorial: () => void;
  pauseTutorial: () => void;
  completeTutorial: () => void;
  hideOverlay: () => void;
  showOverlay: () => void;
  
  isTutorialCompleted: () => boolean;
  shouldAutoStartTutorial: () => boolean;
  
  getCurrentStepTitle: () => string;
  getDemoMessage: (role: 'apprentice' | 'mentor') => string;
  
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
  tutorialState: initialTutorialState,

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

  skipTutorial: () => {
    set({
      tutorialState: {
        ...get().tutorialState,
        isActive: false,
      }
    });
    localStorage.setItem(STORAGE_KEYS.TUTORIAL_COMPLETED, 'true');
  },

  pauseTutorial: () => {
    set({
      tutorialState: {
        ...get().tutorialState,
        isActive: false,
      }
    });
  },

  completeTutorial: () => {
    set({
      tutorialState: {
        ...get().tutorialState,
        isActive: false,
      }
    });
    localStorage.setItem(STORAGE_KEYS.TUTORIAL_COMPLETED, 'true');
  },

  hideOverlay: () => {
    set({
      tutorialState: {
        ...get().tutorialState,
        isOverlayVisible: false,
      }
    });
  },

  showOverlay: () => {
    set({
      tutorialState: {
        ...get().tutorialState,
        isOverlayVisible: true,
      }
    });
  },

  isTutorialCompleted: () => {
    return localStorage.getItem(STORAGE_KEYS.TUTORIAL_COMPLETED) === 'true';
  },

  shouldAutoStartTutorial: () => {
    const state = get();
    return !state.isTutorialCompleted();
  },

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

  getDemoMessage: (role: 'apprentice' | 'mentor') => {
    return TUTORIAL.DEMO_MESSAGES[role.toUpperCase() as 'APPRENTICE' | 'MENTOR'];
  },

  initialize: () => {
    const state = get();
    if (state.shouldAutoStartTutorial()) {
      state.startTutorial();
    }
  },
}));