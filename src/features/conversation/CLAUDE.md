# Conversation 模組文件

## 模組概述

Conversation 模組是「Dear My Friend」應用程式的核心對話介面模組，負責協調整個對話體驗的所有主要功能。此模組整合了訊息管理、視角切換、教學系統、倒數計時、會話管理、導師輔助等多個子系統，提供完整的雙視角對話體驗。

### 主要職責
- **統一協調器**：作為應用程式的主要介面，協調各個功能模組
- **狀態管理整合**：透過 `useAppState` hook 整合所有 Zustand stores
- **用戶體驗控制**：管理各種互動流程和轉場效果
- **響應式設計**：支援桌面版和手機版的不同佈局需求

## 目錄結構

```
conversation/
├── components/
│   ├── chat-interface.tsx    # 主要對話介面元件
│   └── export-dialog.tsx     # 對話匯出對話框
└── index.ts                  # 模組匯出入口
```

## 主要元件說明

### ChatInterface 元件

**核心協調器元件**，負責管理整個對話介面的狀態和行為。

#### 主要功能特性

1. **多模式支援**
   - 正常對話模式
   - 互動式教學模式
   - 側邊欄會話管理

2. **響應式佈局**
   - 桌面版：固定側邊欄 + 水平按鈕佈局
   - 手機版：可切換側邊欄 + 垂直按鈕佈局
   - 支援 Escape 鍵關閉側邊欄

3. **視角切換系統**
   - 學徒視角 ↔ 導師視角切換
   - 10秒倒數轉場效果（可跳過）
   - 教學模式下的特殊切換邏輯

4. **互動式教學流程**
   - 歡迎 → 學徒示範 → 切換引導 → 導師介紹 → 導師示範 → 完成
   - 浮動教學提示按鈕
   - 教學步驟間的智能轉場

#### 狀態管理整合

```typescript
const {
  // 對話狀態
  messages, isLoading, isTutorialMode,
  
  // 視角狀態  
  currentViewMode, isTransitioning, 
  
  // 倒數狀態
  countdownActive, remainingTime,
  
  // 教學狀態
  tutorialState, showTutorialAnalysisButton,
  
  // 導師輔助狀態
  mentorAssistEnabled, mentorAssistPanelOpen,
  
  // 操作方法
  sendMessage, editMessage, switchViewMode,
  startTutorial, nextTutorialStep,
  // ... 更多方法
} = useAppState();
```

#### 核心事件處理器

1. **訊息處理**
   ```typescript
   handleSendMessage(content: string) // 發送訊息（依據當前視角設定角色）
   handleEditMessage(messageId: string) // 開始編輯訊息
   handleSaveEdit(messageId: string, newContent: string) // 保存編輯
   handleDeleteMessage(messageId: string) // 刪除訊息
   ```

2. **視角切換**
   ```typescript
   handleViewSwitch() // 處理視角切換（含教學模式特殊邏輯）
   handleSkipCountdown() // 跳過倒數計時
   ```

3. **教學流程**
   ```typescript
   handleStartTutorial() // 開始互動式教學
   handleTutorialNext() // 教學下一步（含步驟特定邏輯）
   handleSkipTutorial() // 跳過教學
   handleShowTutorialAnalysis() // 回到教學分析
   ```

4. **會話管理**
   ```typescript  
   handleClearMessages() // 清除對話（含確認對話框）
   ```

### ExportDialog 元件

**對話匯出功能元件**，提供多格式對話匯出能力。

#### 功能特性

1. **多格式支援**
   - Markdown (.md) 格式
   - 純文字 (.txt) 格式

2. **匯出方式**
   - 下載檔案到本地
   - 複製到剪貼簿

3. **預覽功能**
   - 即時預覽匯出內容
   - 支援滾動查看完整內容

#### 核心邏輯

```typescript
// 動態計算匯出內容
const exportContent = useMemo(() => {
  return exportMessages(selectedFormat);
}, [exportMessages, selectedFormat, messages, tutorialMessages, isTutorialMode]);

// 檔案下載
const handleExport = () => {
  const filename = `dear-my-friend-${new Date().toISOString().split('T')[0]}.${extension}`;
  const blob = new Blob([exportContent], { type: 'text/plain;charset=utf-8' });
  // 建立下載連結並觸發下載
};

// 剪貼簿複製
const handleCopyToClipboard = async () => {
  await navigator.clipboard.writeText(exportContent);
};
```

## 資料流程

### 1. 訊息傳送流程

```
用戶輸入 → MessageInput → handleSendMessage() 
→ 判斷當前視角設定角色 → sendMessage() → ConversationStore 
→ 更新 messages 狀態 → MessageList 重新渲染
```

### 2. 視角切換流程

```
用戶點擊切換按鈕 → handleViewSwitch() → 檢查切換條件
→ 設定轉場狀態 → 啟動倒數計時 → CountdownOverlay 顯示
→ 倒數結束/跳過 → switchViewMode() → 更新視角狀態
→ UI 重新排列訊息位置
```

### 3. 教學模式流程

```
用戶點擊說明 → handleOpenWelcome() → 檢查教學完成狀態
→ 未完成：啟動教學 → handleStartTutorial() → 清除教學訊息
→ 重置到學徒視角 → 進入教學模式 → TutorialOverlay 顯示
→ 逐步引導用戶體驗功能 → 教學完成 → 回到正常模式
```

### 4. 對話匯出流程

```
用戶點擊匯出按鈕 → ExportDialog 開啟 → 選擇匯出格式
→ 即時預覽內容 → 用戶確認 → 選擇匯出方式（下載/複製）
→ 執行對應操作 → 關閉對話框
```

## 使用方式

### 基本使用

```typescript
import { ChatInterface } from '@/features/conversation';

function App() {
  return (
    <div className="h-screen">
      <ChatInterface />
    </div>
  );
}
```

### 匯出對話功能

```typescript
import { ExportDialog } from '@/features/conversation';

function SomeComponent() {
  return (
    <ExportDialog>
      <Button>匯出對話</Button>
    </ExportDialog>
  );
}
```

## 元件間關係

### 依賴關係圖

```
ChatInterface (主協調器)
├── MessageList (訊息列表) ← message模組
├── MessageInput (訊息輸入) ← message模組  
├── ViewSwitchButton (視角切換) ← view-switch模組
├── CountdownOverlay (倒數覆蓋層) ← view-switch模組  
├── ViewIndicator (視角指示器) ← view-switch模組
├── ExportDialog (匯出對話框) ← 本模組
├── IntroductionModal (說明彈窗) ← welcome模組
├── TutorialOverlay (教學覆蓋層) ← tutorial模組
├── SessionSidebar (會話側邊欄) ← session模組
└── MentorAssistPanel (導師輔助面板) ← mentor-assist模組
```

### 狀態共享

- **useAppState hook**：整合所有 store 的狀態和操作
- **Zustand stores**：各功能領域的狀態管理
- **Props drilling**：特定元件間的狀態傳遞

## 重要函數和介面

### 核心類型定義

```typescript
// 來自 @/types
export type ViewMode = 'apprentice' | 'mentor';
export type MessageRole = 'apprentice' | 'mentor';

export type Message = {
  id: string;
  content: string;
  role: MessageRole;
  timestamp: number;
  isEditing?: boolean;
};

// ExportDialog 專用
type ExportFormat = 'markdown' | 'text';
type ExportDialogProps = {
  children: React.ReactNode;
};
```

### 重要常數

```typescript
// 教學步驟
export const TUTORIAL_STEP = {
  WELCOME: 0,
  APPRENTICE_DEMO: 1,
  SWITCH_GUIDE: 2,
  MENTOR_INTRO: 3,
  MENTOR_DEMO: 4,
  MENTOR_RESPONSE_REVIEW: 5,
  COMPLETE: 6,
} as const;

// 視角模式
export const VIEW_MODE = {
  APPRENTICE: 'apprentice',
  MENTOR: 'mentor',
} as const;

// 訊息角色
export const MESSAGE_ROLE = {
  APPRENTICE: 'apprentice',
  MENTOR: 'mentor',
} as const;
```

### 核心工具函數

```typescript
// 判斷切換按鈕是否應該禁用
const isViewSwitchDisabled = () => {
  return countdownActive || 
    (messages.length === 0 && (!tutorialState.isActive || tutorialState.currentStep < TUTORIAL_STEP.SWITCH_GUIDE)) ||
    (tutorialState.isActive && tutorialState.currentStep < TUTORIAL_STEP.SWITCH_GUIDE);
};

// 判斷是否應該顯示脈動效果
const shouldShowPulse = () => {
  return tutorialState.isActive && 
    tutorialState.currentStep === TUTORIAL_STEP.SWITCH_GUIDE && 
    !tutorialState.isOverlayVisible;
};

// 格式化匯出檔案名稱
const formatExportFilename = (format: ExportFormat) => {
  const date = new Date().toISOString().split('T')[0];
  const extension = format === 'markdown' ? 'md' : 'txt';
  return `dear-my-friend-${date}.${extension}`;
};
```

## 設計模式和最佳實踐

### 1. 單一職責原則
- ChatInterface 作為協調器，不直接處理具體業務邏輯
- ExportDialog 專注於匯出功能，與其他功能解耦

### 2. 狀態管理模式
- 使用 useAppState hook 作為統一狀態介面
- 避免 props drilling，提高元件可維護性

### 3. 條件渲染模式
- 基於狀態的動態 UI 渲染
- 教學模式、正常模式的條件切換

### 4. 事件處理模式  
- 使用 useCallback 優化事件處理器
- 集中處理複雜的業務邏輯

### 5. 響應式設計模式
- 使用 Tailwind 的響應式類別
- 桌面版和手機版的差異化處理

## 效能考量

### 1. 記憶化優化
```typescript
// ExportDialog 中的內容計算優化
const exportContent = useMemo(() => {
  return exportMessages(selectedFormat);
}, [exportMessages, selectedFormat, messages, tutorialMessages, isTutorialMode]);

// 預覽內容優化
const previewContent = useMemo(() => {
  return exportContent || '沒有對話記錄可匯出';
}, [exportContent]);
```

### 2. 事件處理優化
```typescript
// 使用 useCallback 避免不必要的重新渲染
const handleStartTutorial = useCallback(() => {
  clearTutorialMessages();
  resetToApprentice();
  switchToTutorialMode();
  startTutorial();
}, [clearTutorialMessages, resetToApprentice, switchToTutorialMode, startTutorial]);
```

### 3. 條件載入
- 載入狀態的統一處理
- 避免在載入期間渲染複雜 UI

## 未來擴展方向

1. **多語言支援**：國際化文字內容
2. **主題系統**：深色模式和自訂主題
3. **快捷鍵支援**：鍵盤快捷操作
4. **語音輸入**：語音轉文字功能
5. **雲端同步**：跨裝置對話同步
6. **插件系統**：第三方功能擴展

## 疑難排解

### 常見問題

1. **視角切換無反應**
   - 檢查是否有訊息存在（正常模式下需要至少一則訊息）
   - 確認不在倒數計時期間
   - 檢查教學模式狀態

2. **匯出功能異常**
   - 確認瀏覽器支援 Clipboard API
   - 檢查檔案下載權限

3. **教學模式異常**
   - 檢查教學狀態是否正確初始化
   - 確認各教學步驟的轉場邏輯

### 除錯技巧

1. **使用 React DevTools** 檢查 store 狀態
2. **Console 日誌** 追蹤狀態變化
3. **斷點除錯** 複雜事件處理流程