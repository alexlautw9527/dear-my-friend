import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageList, MessageInput } from '../../message';
import { ViewSwitchButton, CountdownOverlay, ViewIndicator } from '../../view-switch';
import { ExportDialog } from '../';
import { IntroductionModal } from '../../welcome';
import { TutorialOverlay } from '../../tutorial';
import { useConversation, useViewMode, useCountdown, useTutorial } from '@/hooks';
import { MESSAGE_ROLE, TUTORIAL_STEP } from '@/types';
import { Download, HelpCircle, Trash2, GraduationCap } from 'lucide-react';

function ChatInterface() {
  // 使用 Custom Hooks 管理狀態
  const {
    messages,
    isLoading,
    isTutorialMode,
    sendMessage,
    editMessage,
    startEditMessage,
    cancelEditMessage,
    deleteMessage,
    clearMessages,
    clearTutorialMessages,
    switchToTutorialMode,
    switchToNormalMode,
  } = useConversation();

  const {
    currentViewMode,
    isTransitioning,
    switchViewMode,
    resetToApprentice,
    setTransitioning,
    getTargetViewMode,
  } = useViewMode();

  const {
    isActive: countdownActive,
    remainingTime,
    startCountdown,
    skipCountdown,
  } = useCountdown({
    onComplete: () => {
      setTransitioning(false);
      switchViewMode();
      
      // 教學模式：切換到導師視角後顯示導師介紹
      if (tutorialState.isActive && 
          (tutorialState.currentStep === TUTORIAL_STEP.SWITCH_GUIDE || 
           tutorialState.currentStep === TUTORIAL_STEP.MENTOR_INTRO)) {
        setTimeout(() => {
          showOverlay(); // 切換完成後顯示覆蓋層
          // 如果還在 SWITCH_GUIDE 步驟，進入 MENTOR_INTRO
          if (tutorialState.currentStep === TUTORIAL_STEP.SWITCH_GUIDE) {
            nextTutorialStep();
          }
        }, 500);
      }
    },
  });

  // 教學系統
  const {
    tutorialState,
    startTutorial,
    nextStep: nextTutorialStep,
    skipTutorial,
    completeTutorial,
    hideOverlay,
    showOverlay,
    getCurrentStepTitle,
    getDemoMessage,
    isTutorialCompleted,
  } = useTutorial();

  // Introduction Modal 狀態
  const [showIntroductionModal, setShowIntroductionModal] = useState(false);
  
  // 教學中顯示「查看分析」浮動按鈕的狀態
  const [showTutorialAnalysisButton, setShowTutorialAnalysisButton] = useState(false);

  // 監聽訊息數量變化，當訊息數為 0 且為導師視角時，自動切回學徒視角
  useEffect(() => {
    if (messages.length === 0 && currentViewMode === 'mentor' && !isTransitioning) {
      resetToApprentice();
    }
  }, [messages.length, currentViewMode, isTransitioning, resetToApprentice]);

  // 監聽教學狀態變化，當教學開始時切換到教學模式
  useEffect(() => {
    if (tutorialState.isActive && !isTutorialMode) {
      switchToTutorialMode();
    } else if (!tutorialState.isActive && isTutorialMode) {
      switchToNormalMode();
    }
  }, [tutorialState.isActive, isTutorialMode, switchToTutorialMode, switchToNormalMode]);

  // 處理發送訊息
  const handleSendMessage = (content: string) => {
    const role = currentViewMode === 'apprentice' ? MESSAGE_ROLE.APPRENTICE : MESSAGE_ROLE.MENTOR;
    sendMessage(content, role);
  };

  // 處理視角切換
  const handleViewSwitch = () => {
    // 教學模式：特殊處理 - 允許在 SWITCH_GUIDE 和 MENTOR_INTRO 步驟切換
    if (tutorialState.isActive && 
        (tutorialState.currentStep === TUTORIAL_STEP.SWITCH_GUIDE || 
         tutorialState.currentStep === TUTORIAL_STEP.MENTOR_INTRO)) {
      setTransitioning(true);
      startCountdown();
      return;
    }
    
    // 正常模式：如果沒有訊息，不允許切換視角
    if (messages.length === 0) {
      return;
    }
    
    setTransitioning(true);
    startCountdown();
  };

  // 處理跳過倒數
  const handleSkipCountdown = () => {
    skipCountdown();
  };

  // 處理編輯訊息
  const handleEditMessage = (messageId: string) => {
    startEditMessage(messageId);
  };

  // 處理保存編輯
  const handleSaveEdit = (messageId: string, newContent: string) => {
    editMessage(messageId, newContent);
  };

  // 處理取消編輯
  const handleCancelEdit = (messageId: string) => {
    cancelEditMessage(messageId);
  };

  // 處理刪除訊息
  const handleDeleteMessage = (messageId: string) => {
    deleteMessage(messageId);
  };

  // 處理開啟說明
  // 處理開始教學 (包裝原本的 startTutorial，增加清除對話功能)
  const handleStartTutorial = useCallback(() => {
    // 先清除教學對話記錄
    clearTutorialMessages();
    // 確保進入教學模式
    switchToTutorialMode();
    // 然後開始教學
    startTutorial();
  }, [clearTutorialMessages, switchToTutorialMode, startTutorial]);

  // 處理點擊「查看教學分析」浮動按鈕
  const handleShowTutorialAnalysis = useCallback(() => {
    setShowTutorialAnalysisButton(false);
    showOverlay();
    nextTutorialStep(); // 進入 MENTOR_RESPONSE_REVIEW 步驟
  }, [showOverlay, nextTutorialStep]);

  const handleOpenWelcome = () => {
    // 檢查教學是否已完成，而不是檢查是否活躍
    if (!isTutorialCompleted()) {
      // 如果教學尚未完成，啟動互動式教學
      handleStartTutorial();
    } else {
      // 如果教學已完成，顯示說明 modal
      setShowIntroductionModal(true);
    }
  };

  // 處理教學下一步
  const handleTutorialNext = () => {
    const { currentStep } = tutorialState;
    
    switch (currentStep) {
      case TUTORIAL_STEP.WELCOME:
        // 從歡迎步驟進入學徒示範
        nextTutorialStep();
        break;
        
      case TUTORIAL_STEP.APPRENTICE_DEMO: {
        // 暫時隱藏覆蓋層，讓使用者看到訊息
        hideOverlay();
        // 自動發送學徒示範訊息
        const apprenticeMessage = getDemoMessage('apprentice');
        handleSendMessage(apprenticeMessage);
        // 發送完學徒回應後，顯示浮動提示按鈕
        setTimeout(() => {
          setShowTutorialAnalysisButton(true);
          // 不自動倒數，讓使用者自主決定何時回到教學
        }, 1000); // 1秒後顯示提示按鈕
        break;
      }
        
      case TUTORIAL_STEP.SWITCH_GUIDE:
        // 隱藏教學覆蓋層，讓使用者點擊切換按鈕
        // 不要立即進入下一步，等待使用者點擊切換按鈕
        hideOverlay();
        break;
        
      case TUTORIAL_STEP.MENTOR_INTRO:
        // 導師介紹完成，進入導師示範
        showOverlay(); // 確保覆蓋層顯示
        nextTutorialStep();
        break;
        
      case TUTORIAL_STEP.MENTOR_DEMO: {
        // 暫時隱藏覆蓋層，讓使用者看到訊息
        hideOverlay();
        // 確保處於導師視角，然後發送導師示範回應
        if (currentViewMode !== 'mentor') {
          // 如果不在導師視角，等待視角切換完成
          setTimeout(() => {
            const mentorMessage = getDemoMessage('mentor');
            handleSendMessage(mentorMessage);
            // 發送完導師回應後，顯示浮動提示按鈕
            setTimeout(() => {
              setShowTutorialAnalysisButton(true);
              // 不自動倒數，讓使用者自主決定何時回到教學
            }, 1000); // 1秒後顯示提示按鈕
          }, 500);
        } else {
          const mentorMessage = getDemoMessage('mentor');
          handleSendMessage(mentorMessage);
          // 發送完導師回應後，顯示浮動提示按鈕
          setTimeout(() => {
            setShowTutorialAnalysisButton(true);
            // 不自動倒數，讓使用者自主決定何時回到教學
          }, 1000); // 1秒後顯示提示按鈕
        }
        break;
      }
        
      case TUTORIAL_STEP.MENTOR_RESPONSE_REVIEW:
        // 使用者確認已查看導師回應，進入完成步驟
        nextTutorialStep();
        break;
        
      case TUTORIAL_STEP.COMPLETE:
        // 完成教學
        completeTutorial();
        // 清除教學對話記錄並切換回正常模式
        clearTutorialMessages();
        switchToNormalMode();
        break;
        
      default:
        nextTutorialStep();
    }
  };

  // 處理跳過教學
  const handleSkipTutorial = () => {
    skipTutorial();
    // 清除教學對話記錄並切換回正常模式
    clearTutorialMessages();
    switchToNormalMode();
  };



  // 處理清除對話
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

  // 如果正在載入，顯示載入狀態
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
    <div className="h-full flex flex-col bg-background">
      {/* 頂部視角指示器 */}
      <ViewIndicator currentViewMode={currentViewMode} />
      
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
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={
            countdownActive || 
            (tutorialState.isActive && tutorialState.currentStep !== TUTORIAL_STEP.SWITCH_GUIDE && tutorialState.currentStep !== TUTORIAL_STEP.COMPLETE)
          }
        />
      </Card>

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
    </div>
  );
}

export default ChatInterface; 