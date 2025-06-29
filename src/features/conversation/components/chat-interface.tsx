import * as React from 'react';
import { useCallback, useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageList, MessageInput } from '../../message';
import { ViewSwitchButton, CountdownOverlay, ViewIndicator } from '../../view-switch';
import { ExportDialog } from '../';
import { IntroductionModal } from '../../welcome';
import { TutorialOverlay } from '../../tutorial';
import { SessionSidebar } from '../../session';
import { MentorAssistFloating } from '../../mentor-assist';
import { useAppState } from '@/store/use-app-state';
import { MESSAGE_ROLE, TUTORIAL_STEP } from '@/types';
import { Download, HelpCircle, Trash2, GraduationCap, Menu } from 'lucide-react';

function ChatInterface() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const insertTextCallbackRef = React.useRef<((text: string) => void) | null>(null);
  const messageInputRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isSidebarOpen]);

  const {
    messages,
    isLoading,
    isTutorialMode,
    currentViewMode,
    isTransitioning,
    countdownActive,
    remainingTime,
    tutorialState,
    showIntroductionModal,
    showTutorialAnalysisButton,
    
    sendMessage,
    editMessage,
    startEditMessage,
    cancelEditMessage,
    deleteMessage,
    clearMessages,
    clearTutorialMessages,
    switchToTutorialMode,
    switchToNormalMode,
    
    switchViewMode,
    resetToApprentice,
    setTransitioning,
    getTargetViewMode,
    
    startCountdown,
    skipCountdown,
    
    startTutorial,
    nextTutorialStep,
    skipTutorial,
    completeTutorial,
    hideOverlay,
    showOverlay,
    getCurrentStepTitle,
    getDemoMessage,
    isTutorialCompleted,
    
    setShowIntroductionModal,
    setShowTutorialAnalysisButton,
    
    setFramework,
    removeCustomPrompt,
    setInputFocused,
    recordPromptUsage,
    toggleSection,
    getCurrentFramework,
    getCustomPrompts,
    isInputFocusedState,
    getExpandedSections,
  } = useAppState();

  const handleSendMessage = (content: string) => {
    const role = currentViewMode === 'apprentice' ? MESSAGE_ROLE.APPRENTICE : MESSAGE_ROLE.MENTOR;
    sendMessage(content, role);
  };

  const handleViewSwitch = () => {
    if (tutorialState.isActive && 
        (tutorialState.currentStep === TUTORIAL_STEP.SWITCH_GUIDE || 
         tutorialState.currentStep === TUTORIAL_STEP.MENTOR_INTRO)) {
      setTransitioning(true);
      startCountdown(undefined, () => {
        setTransitioning(false);
        switchViewMode();
        
        if (tutorialState.isActive && 
            (tutorialState.currentStep === TUTORIAL_STEP.SWITCH_GUIDE || 
             tutorialState.currentStep === TUTORIAL_STEP.MENTOR_INTRO)) {
          setTimeout(() => {
            showOverlay();
            if (tutorialState.currentStep === TUTORIAL_STEP.SWITCH_GUIDE) {
              nextTutorialStep();
            }
          }, 500);
        }
      });
      return;
    }
    
    if (messages.length === 0) {
      return;
    }
    
    setTransitioning(true);
    startCountdown(undefined, () => {
      setTransitioning(false);
      switchViewMode();
    });
  };

  const handleSkipCountdown = () => {
    skipCountdown();
  };

  const handleEditMessage = (messageId: string) => {
    startEditMessage(messageId);
  };

  const handleSaveEdit = (messageId: string, newContent: string) => {
    editMessage(messageId, newContent);
  };

  const handleCancelEdit = (messageId: string) => {
    cancelEditMessage(messageId);
  };

  const handleDeleteMessage = (messageId: string) => {
    deleteMessage(messageId);
  };

  const handleStartTutorial = useCallback(() => {
    clearTutorialMessages();
    resetToApprentice();
    switchToTutorialMode();
    startTutorial();
  }, [clearTutorialMessages, resetToApprentice, switchToTutorialMode, startTutorial]);

  const handleShowTutorialAnalysis = useCallback(() => {
    setShowTutorialAnalysisButton(false);
    showOverlay();
    nextTutorialStep();
  }, [showOverlay, nextTutorialStep]);

  const handleOpenWelcome = () => {
    if (!isTutorialCompleted()) {
      handleStartTutorial();
    } else {
      setShowIntroductionModal(true);
    }
  };

  const handleTutorialNext = () => {
    const { currentStep } = tutorialState;
    
    switch (currentStep) {
      case TUTORIAL_STEP.WELCOME:
        nextTutorialStep();
        break;
        
      case TUTORIAL_STEP.APPRENTICE_DEMO: {
        hideOverlay();
        const apprenticeMessage = getDemoMessage('apprentice');
        sendMessage(apprenticeMessage, MESSAGE_ROLE.APPRENTICE);
        setTimeout(() => {
          setShowTutorialAnalysisButton(true);
        }, 1000);
        break;
      }
        
      case TUTORIAL_STEP.SWITCH_GUIDE:
        hideOverlay();
        break;
        
      case TUTORIAL_STEP.MENTOR_INTRO:
        showOverlay();
        nextTutorialStep();
        break;
        
      case TUTORIAL_STEP.MENTOR_DEMO: {
        hideOverlay();
        if (currentViewMode !== 'mentor') {
          setTimeout(() => {
            const mentorMessage = getDemoMessage('mentor');
            sendMessage(mentorMessage, MESSAGE_ROLE.MENTOR);
            setTimeout(() => {
              setShowTutorialAnalysisButton(true);
            }, 1000);
          }, 500);
        } else {
          const mentorMessage = getDemoMessage('mentor');
          sendMessage(mentorMessage, MESSAGE_ROLE.MENTOR);
          setTimeout(() => {
            setShowTutorialAnalysisButton(true);
          }, 1000);
        }
        break;
      }
        
      case TUTORIAL_STEP.MENTOR_RESPONSE_REVIEW:
        nextTutorialStep();
        break;
        
      case TUTORIAL_STEP.COMPLETE:
        completeTutorial();
        clearTutorialMessages();
        resetToApprentice();
        switchToNormalMode();
        break;
        
      default:
        nextTutorialStep();
    }
  };

  const handleSkipTutorial = () => {
    skipTutorial();
    clearTutorialMessages();
    resetToApprentice();
    switchToNormalMode();
  };

  // 處理導師輔助提示選擇
  const handlePromptSelect = (prompt: string) => {
    recordPromptUsage(prompt);
    if (insertTextCallbackRef.current) {
      insertTextCallbackRef.current(prompt);
    }
  };
  
  const handleInsertTextCallback = React.useCallback((insertFunction: (text: string) => void) => {
    insertTextCallbackRef.current = insertFunction;
  }, []);

  const handleClearMessages = () => {
    const modeText = isTutorialMode ? '教學' : '';
    const confirmed = window.confirm(`確定要清除所有${modeText}對話內容嗎？此操作無法復原。`);
    if (confirmed) {
      if (isTutorialMode) {
        clearTutorialMessages();
      } else {
        clearMessages();
      }
      // 清除後重置到學徒視角
      if (currentViewMode === 'mentor') {
        resetToApprentice();
      }
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col bg-background">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">載入對話記錄中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-background">
      {/* 桌面版側邊欄 */}
      <div className="hidden md:block w-80 border-r">
        <SessionSidebar />
      </div>

      {/* 手機版側邊欄覆蓋層 */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* 背景遮罩 */}
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
          {/* 側邊欄 */}
          <div className="relative w-80 h-full bg-background border-r shadow-lg">
            <SessionSidebar 
              onClose={() => setIsSidebarOpen(false)}
              showCloseButton={true}
            />
          </div>
        </div>
      )}

      {/* 主要內容區域 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 頂部區域：手機版選單按鈕 + 視角指示器 */}
        <div className="flex items-center gap-2 p-2 md:p-0">
          {/* 手機版選單按鈕 */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>
          {/* 視角指示器 */}
          <div className="flex-1">
            <ViewIndicator currentViewMode={currentViewMode} />
          </div>
        </div>
        
        {/* 主要聊天區域 */}
        <Card className="flex-1 flex flex-col mx-4 mb-4 overflow-hidden pt-4">
        {/* 訊息列表 */}
        <MessageList
          messages={messages}
          currentViewMode={currentViewMode}
          onEditMessage={handleEditMessage}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={handleCancelEdit}
          onDeleteMessage={handleDeleteMessage}
        />
        
        {/* 視角切換按鈕 */}
        <div className="p-4 border-y">
          {/* 桌面版：水平排列，使用 justify-between 分佈 */}
          <div className="hidden md:flex justify-between items-center">
            {/* 左側佔位 */}
            <div className="flex-1"></div>
            
            {/* 中間：視角切換按鈕 */}
            <div className="flex justify-center">
              <ViewSwitchButton
                currentViewMode={currentViewMode}
                onSwitch={handleViewSwitch}
                disabled={
                  countdownActive || 
                  (messages.length === 0 && (!tutorialState.isActive || tutorialState.currentStep < TUTORIAL_STEP.SWITCH_GUIDE)) ||
                  (tutorialState.isActive && tutorialState.currentStep < TUTORIAL_STEP.SWITCH_GUIDE)
                }
                isTransitioning={isTransitioning}
                shouldPulse={
                  tutorialState.isActive && 
                  tutorialState.currentStep === TUTORIAL_STEP.SWITCH_GUIDE && 
                  !tutorialState.isOverlayVisible
                }
              />
            </div>
            
            {/* 右側：功能按鈕組 */}
            <div className="flex-1 flex justify-end items-center gap-2">
              {/* 說明按鈕 */}
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
                onClick={handleOpenWelcome}
                disabled={countdownActive || tutorialState.isActive}
              >
                <HelpCircle className="h-4 w-4" />
                說明
              </Button>
              
              {/* 導師輔助按鈕 - 舊版暂時保留，但隱藏 */}
              {/* {currentViewMode === 'mentor' && isMentorAssistEnabled() && (
                <Button
                  variant={isMentorAssistPanelOpen() ? "default" : "outline"}
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={togglePanel}
                  disabled={countdownActive || tutorialState.isActive}
                >
                  <Lightbulb className="h-4 w-4" />
                  小幫手
                </Button>
              )} */}

              {/* 匯出按鈕 */}
              {messages.length > 0 && (
                <ExportDialog>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    disabled={countdownActive || tutorialState.isActive}
                  >
                    <Download className="h-4 w-4" />
                    匯出
                  </Button>
                </ExportDialog>
              )}
              
              {/* 清除按鈕 */}
              {messages.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 text-destructive hover:text-destructive"
                  onClick={handleClearMessages}
                  disabled={countdownActive || tutorialState.isActive}
                >
                  <Trash2 className="h-4 w-4" />
                  清除
                </Button>
              )}
            </div>
          </div>

          {/* 手機版：垂直排列，避免重疊 */}
          <div className="md:hidden flex flex-col gap-3">
            {/* 視角切換按鈕 */}
            <div className="flex justify-center">
              <ViewSwitchButton
                currentViewMode={currentViewMode}
                onSwitch={handleViewSwitch}
                disabled={
                  countdownActive || 
                  (messages.length === 0 && (!tutorialState.isActive || tutorialState.currentStep < TUTORIAL_STEP.SWITCH_GUIDE)) ||
                  (tutorialState.isActive && tutorialState.currentStep < TUTORIAL_STEP.SWITCH_GUIDE)
                }
                isTransitioning={isTransitioning}
                shouldPulse={
                  tutorialState.isActive && 
                  tutorialState.currentStep === TUTORIAL_STEP.SWITCH_GUIDE && 
                  !tutorialState.isOverlayVisible
                }
              />
            </div>
            
            {/* 功能按鈕組 */}
            <div className="flex justify-center items-center gap-2">
              {/* 說明按鈕 */}
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
                onClick={handleOpenWelcome}
                disabled={countdownActive || tutorialState.isActive}
              >
                <HelpCircle className="h-4 w-4" />
                說明
              </Button>
              
              {/* 導師輔助按鈕 - 舊版暂時保留，但隱藏 */}
              {/* {currentViewMode === 'mentor' && isMentorAssistEnabled() && (
                <Button
                  variant={isMentorAssistPanelOpen() ? "default" : "outline"}
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={togglePanel}
                  disabled={countdownActive || tutorialState.isActive}
                >
                  <Lightbulb className="h-4 w-4" />
                  小幫手
                </Button>
              )} */}

              {/* 匯出按鈕 */}
              {messages.length > 0 && (
                <ExportDialog>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    disabled={countdownActive || tutorialState.isActive}
                  >
                    <Download className="h-4 w-4" />
                    匯出
                  </Button>
                </ExportDialog>
              )}
              
              {/* 清除按鈕 */}
              {messages.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 text-destructive hover:text-destructive"
                  onClick={handleClearMessages}
                  disabled={countdownActive || tutorialState.isActive}
                >
                  <Trash2 className="h-4 w-4" />
                  清除
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* 訊息輸入 */}
        <div ref={messageInputRef}>
          <MessageInput
            onSendMessage={handleSendMessage}
            onInsertText={handleInsertTextCallback}
            onInputFocus={() => setInputFocused(true)}
            onInputBlur={() => setInputFocused(false)}
            disabled={
              countdownActive || 
              (tutorialState.isActive && tutorialState.currentStep !== TUTORIAL_STEP.SWITCH_GUIDE && tutorialState.currentStep !== TUTORIAL_STEP.COMPLETE)
            }
          />
        </div>
        </Card>
      </div>

      {/* 倒數覆蓋層 */}
      <CountdownOverlay
        isActive={countdownActive}
        remainingTime={remainingTime}
        targetViewMode={getTargetViewMode()}
        onSkip={handleSkipCountdown}
      />

      {/* 使用說明 Modal */}
      <IntroductionModal 
        open={showIntroductionModal} 
        onOpenChange={setShowIntroductionModal} 
        onStartTutorial={handleStartTutorial}
      />

      {/* 互動式教學覆蓋層 */}
      <TutorialOverlay
        isVisible={tutorialState.isActive && tutorialState.isOverlayVisible}
        currentStep={tutorialState.currentStep}
        stepTitle={getCurrentStepTitle()}
        onNext={handleTutorialNext}
        onSkip={handleSkipTutorial}
        isTransitioning={tutorialState.isStepTransitioning}
        getDemoMessage={getDemoMessage}
      />

      {/* 教學中的浮動「回到教學」按鈕 */}
      {showTutorialAnalysisButton && (
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            onClick={handleShowTutorialAnalysis}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg animate-pulse"
            size="lg"
          >
            <GraduationCap className="h-5 w-5" />
            回到教學
          </Button>
        </div>
      )}
      
      {/* 舊版導師輔助面板 - 暂時保留但不顯示 */}
      {/* <MentorAssistPanel
        isOpen={isMentorAssistPanelOpen()}
        currentFramework={getCurrentFramework()}
        customPrompts={getCustomPrompts()}
        onClose={closePanel}
        onSetFramework={setFramework}
        onNextFramework={nextFramework}
        onPromptSelect={handlePromptSelect}
        onRemoveCustomPrompt={removeCustomPrompt}
      /> */}
      
      {/* 新版浮動導師輔助 */}
      <MentorAssistFloating
        isVisible={currentViewMode === 'mentor' && isInputFocusedState() && !countdownActive && !tutorialState.isActive}
        anchorRef={messageInputRef as React.RefObject<HTMLElement | null>}
        currentFramework={getCurrentFramework()}
        customPrompts={getCustomPrompts()}
        expandedSections={getExpandedSections()}
        onFrameworkChange={setFramework}
        onPromptSelect={handlePromptSelect}
        onRemoveCustomPrompt={removeCustomPrompt}
        onToggleSection={toggleSection}
      />
    </div>
  );
}

export default ChatInterface; 