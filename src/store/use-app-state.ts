import { useEffect } from 'react';
import { 
  useConversationStore, 
  useViewModeStore, 
  useCountdownStore, 
  useTutorialStore, 
  useUIStore,
  useSessionStore,
  useMentorAssistStore
} from './index';
import { VIEW_MODE } from '@/types';
import type { MessageRole } from '@/types';

// 組合所有store的狀態和操作
export const useAppState = () => {
  // 會話管理相關
  const sessionStore = useSessionStore();
  const {
    sessions,
    currentSessionId,
    isLoading: sessionLoading,
    createSession,
    deleteSession,
    renameSession,
    switchToSession,
    getCurrentSession,
    updateSessionMessages,
  } = sessionStore;

  // 對話相關
  const conversationStore = useConversationStore();
  const { 
    messages: normalMessages,
    tutorialMessages,
    isLoading, 
    isTutorialMode,
    sendMessage: originalSendMessage,
    editMessage: originalEditMessage,
    startEditMessage,
    cancelEditMessage,
    deleteMessage: originalDeleteMessage,
    clearMessages: originalClearMessages,
    clearTutorialMessages: originalClearTutorialMessages,
    switchToTutorialMode,
    switchToNormalMode,
    exportMessages,
    loadSessionMessages,
    getMessagesForSession,
  } = conversationStore;

  // 根據模式選擇正確的訊息數組
  const messages = isTutorialMode ? tutorialMessages : normalMessages;

  // 包裝的訊息操作，會同步更新到會話
  const sendMessage = (content: string, role: MessageRole) => {
    originalSendMessage(content, role);
    // 使用 setTimeout(0) 確保 Zustand 狀態更新在當前事件循環完成後再執行
    setTimeout(() => {
      const currentSession = getCurrentSession();
      if (currentSession) {
        const { messages, tutorialMessages } = getMessagesForSession();
        updateSessionMessages(currentSession.id, messages, tutorialMessages);
      }
    }, 0);
  };

  const editMessage = (messageId: string, newContent: string) => {
    originalEditMessage(messageId, newContent);
    setTimeout(() => {
      const currentSession = getCurrentSession();
      if (currentSession) {
        const { messages, tutorialMessages } = getMessagesForSession();
        updateSessionMessages(currentSession.id, messages, tutorialMessages);
      }
    }, 0);
  };

  const deleteMessage = (messageId: string) => {
    originalDeleteMessage(messageId);
    setTimeout(() => {
      const currentSession = getCurrentSession();
      if (currentSession) {
        const { messages, tutorialMessages } = getMessagesForSession();
        updateSessionMessages(currentSession.id, messages, tutorialMessages);
      }
    }, 0);
  };

  const clearMessages = () => {
    originalClearMessages();
    setTimeout(() => {
      const currentSession = getCurrentSession();
      if (currentSession) {
        const { messages, tutorialMessages } = getMessagesForSession();
        updateSessionMessages(currentSession.id, messages, tutorialMessages);
      }
    }, 0);
  };

  const clearTutorialMessages = () => {
    originalClearTutorialMessages();
    setTimeout(() => {
      const currentSession = getCurrentSession();
      if (currentSession) {
        const { messages, tutorialMessages } = getMessagesForSession();
        updateSessionMessages(currentSession.id, messages, tutorialMessages);
      }
    }, 0);
  };

  // 視角模式相關
  const viewModeStore = useViewModeStore();
  const {
    currentViewMode,
    isTransitioning,
    switchViewMode,
    resetToApprentice,
    setTransitioning,
    getTargetViewMode,
    getCurrentRoleLabel,
    getTargetRoleLabel,
  } = viewModeStore;

  // 倒數相關
  const countdownStore = useCountdownStore();
  const {
    isActive: countdownActive,
    remainingTime,
    startCountdown,
    stopCountdown,
    pauseCountdown,
    resumeCountdown,
    skipCountdown,
    resetCountdown,
    getProgress,
    getFormattedTime,
  } = countdownStore;

  // 教學相關
  const tutorialStore = useTutorialStore();
  const {
    tutorialState,
    startTutorial,
    nextStep: nextTutorialStep,
    skipTutorial,
    pauseTutorial,
    completeTutorial,
    hideOverlay,
    showOverlay,
    isTutorialCompleted,
    shouldAutoStartTutorial,
    getCurrentStepTitle,
    getDemoMessage,
  } = tutorialStore;

  // UI 相關
  const uiStore = useUIStore();
  const {
    showIntroductionModal,
    showTutorialAnalysisButton,
    setShowIntroductionModal,
    setShowTutorialAnalysisButton,
  } = uiStore;

  // 導師輔助相關
  const mentorAssistStore = useMentorAssistStore();
  const {
    mentorAssistState,
    enableAssist,
    disableAssist,
    togglePanel,
    openPanel,
    closePanel,
    setFramework,
    nextFramework,
    addCustomPrompt,
    removeCustomPrompt,
    setInputFocused,
    toggleSection,
    recordPromptUsage,
    isEnabled: isMentorAssistEnabled,
    isPanelOpen: isMentorAssistPanelOpen,
    getCurrentFramework,
    getCustomPrompts,
    isInputFocusedState,
    getExpandedSections,
    getRecentPrompts,
  } = mentorAssistStore;

  // 初始化應用
  useEffect(() => {
    const initialize = async () => {
      // 先初始化會話管理
      await sessionStore.initialize();
      // 再初始化其他store
      await conversationStore.initialize();
      viewModeStore.initialize();
      tutorialStore.initialize();
      mentorAssistStore.initialize();
    };
    
    initialize();
  }, []);

  // 監聽當前會話變化，載入對應的訊息
  useEffect(() => {
    const currentSession = getCurrentSession();
    if (currentSession && !sessionLoading) {
      loadSessionMessages(currentSession.messages, currentSession.tutorialMessages);
    }
  }, [currentSessionId, sessionLoading]);

  // 監聽訊息數量變化，當訊息數為 0 且為導師視角時，自動切回學徒視角
  // 但在教學模式中不執行此邏輯
  useEffect(() => {
    if (!isTutorialMode && messages.length === 0 && currentViewMode === VIEW_MODE.MENTOR && !isTransitioning) {
      resetToApprentice();
    }
  }, [messages.length, currentViewMode, isTransitioning, isTutorialMode, resetToApprentice]);

  // 監聽教學狀態變化，當教學開始時切換到教學模式並重置視角
  useEffect(() => {
    if (tutorialState.isActive && !isTutorialMode) {
      // 教學開始時確保在學徒視角
      resetToApprentice();
      switchToTutorialMode();
    } else if (!tutorialState.isActive && isTutorialMode) {
      switchToNormalMode();
    }
  }, [tutorialState.isActive, isTutorialMode, resetToApprentice, switchToTutorialMode, switchToNormalMode]);

  // 包裝倒數開始函數，添加回調支援
  const startCountdownWithCallback = (duration?: number, onComplete?: () => void) => {
    startCountdown(duration, onComplete);
  };

  return {
    // 狀態
    messages,
    isLoading: isLoading || sessionLoading,
    isTutorialMode,
    currentViewMode,
    isTransitioning,
    countdownActive,
    remainingTime,
    tutorialState,
    showIntroductionModal,
    showTutorialAnalysisButton,
    
    // 會話管理狀態
    sessions,
    currentSessionId,
    getCurrentSession,
    
    // 對話操作
    sendMessage,
    editMessage,
    startEditMessage,
    cancelEditMessage,
    deleteMessage,
    clearMessages,
    clearTutorialMessages,
    switchToTutorialMode,
    switchToNormalMode,
    exportMessages,
    
    // 視角操作
    switchViewMode,
    resetToApprentice,
    setTransitioning,
    getTargetViewMode,
    getCurrentRoleLabel,
    getTargetRoleLabel,
    
    // 倒數操作
    startCountdown: startCountdownWithCallback,
    stopCountdown,
    pauseCountdown,
    resumeCountdown,
    skipCountdown,
    resetCountdown,
    getProgress,
    getFormattedTime,
    
    // 教學操作
    startTutorial,
    nextTutorialStep,
    skipTutorial,
    pauseTutorial,
    completeTutorial,
    hideOverlay,
    showOverlay,
    isTutorialCompleted,
    shouldAutoStartTutorial,
    getCurrentStepTitle,
    getDemoMessage,
    
    // UI 操作
    setShowIntroductionModal,
    setShowTutorialAnalysisButton,
    
    // 導師輔助操作
    mentorAssistState,
    enableAssist,
    disableAssist,
    togglePanel,
    openPanel,
    closePanel,
    setFramework,
    nextFramework,
    addCustomPrompt,
    removeCustomPrompt,
    setInputFocused,
    toggleSection,
    recordPromptUsage,
    isMentorAssistEnabled,
    isMentorAssistPanelOpen,
    getCurrentFramework,
    getCustomPrompts,
    isInputFocusedState,
    getExpandedSections,
    getRecentPrompts,
    
    // 會話管理操作
    createSession,
    deleteSession,
    renameSession,
    switchToSession,
  };
};