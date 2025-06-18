import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageList, MessageInput } from '../../message';
import { ViewSwitchButton, CountdownOverlay, ViewIndicator } from '../../view-switch';
import { ExportDialog } from '../';
import { WelcomeModal } from '../../welcome';
import { useConversation, useViewMode, useCountdown } from '@/hooks';
import { MESSAGE_ROLE } from '@/types';
import { Download, HelpCircle } from 'lucide-react';

function ChatInterface() {
  // 使用 Custom Hooks 管理狀態
  const {
    messages,
    isLoading,
    sendMessage,
    editMessage,
    startEditMessage,
    cancelEditMessage,
    deleteMessage,
  } = useConversation();

  const {
    currentViewMode,
    isTransitioning,
    switchViewMode,
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
    },
  });

  // Welcome Modal 狀態
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // 處理發送訊息
  const handleSendMessage = (content: string) => {
    const role = currentViewMode === 'apprentice' ? MESSAGE_ROLE.APPRENTICE : MESSAGE_ROLE.MENTOR;
    sendMessage(content, role);
  };

  // 處理視角切換
  const handleViewSwitch = () => {
    // 如果沒有訊息，不允許切換視角
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
  const handleOpenWelcome = () => {
    setShowWelcomeModal(true);
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
                disabled={countdownActive || messages.length === 0}
                isTransitioning={isTransitioning}
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
                disabled={countdownActive}
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
                    disabled={countdownActive}
                  >
                    <Download className="h-4 w-4" />
                    匯出
                  </Button>
                </ExportDialog>
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
                disabled={countdownActive || messages.length === 0}
                isTransitioning={isTransitioning}
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
                disabled={countdownActive}
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
                    disabled={countdownActive}
                  >
                    <Download className="h-4 w-4" />
                    匯出
                  </Button>
                </ExportDialog>
              )}
            </div>
          </div>
        </div>
        
        {/* 訊息輸入 */}
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={countdownActive}
        />
      </Card>

      {/* 倒數覆蓋層 */}
      <CountdownOverlay
        isActive={countdownActive}
        remainingTime={remainingTime}
        targetViewMode={getTargetViewMode()}
        onSkip={handleSkipCountdown}
      />

      {/* 歡迎引導 Modal */}
      <WelcomeModal 
        open={showWelcomeModal} 
        onOpenChange={setShowWelcomeModal} 
      />
    </div>
  );
}

export default ChatInterface; 