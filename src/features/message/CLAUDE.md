# Message 模組

Message 模組是 Dear My Friend 應用程式的核心訊息處理模組，負責處理所有與訊息相關的 UI 元件和互動邏輯。

## 模組概述

Message 模組實現了一個完整的訊息系統，支援雙向對話、訊息編輯、刪除和視角切換。模組遵循 React 最佳實務，提供響應式設計和良好的行動裝置體驗。

### 主要功能
- **訊息顯示**：支援學徒/導師雙視角的訊息呈現
- **訊息輸入**：多行文字輸入，支援快捷鍵和自動調整高度
- **訊息編輯**：行內編輯功能，支援取消和儲存
- **訊息管理**：刪除訊息功能
- **響應式設計**：手機和桌面設備最佳化
- **中文輸入支援**：處理中文輸入法的 composition 事件

## 檔案結構

```
message/
├── components/
│   ├── message-bubble.tsx    # 訊息氣泡元件
│   ├── message-input.tsx     # 訊息輸入元件
│   └── message-list.tsx      # 訊息列表元件
└── index.ts                  # Barrel exports
```

## 主要元件說明

### MessageBubble

訊息氣泡元件，負責顯示單一訊息並提供編輯/刪除功能。

#### 功能特色
- **視角感知佈局**：根據當前視角（學徒/導師）自動調整訊息對齊方式
- **角色標籤**：顯示訊息發送者角色和時間戳記
- **行內編輯**：支援點擊編輯，Enter 儲存，Escape 取消
- **手機最佳化**：觸控友善的互動設計
- **動作按鈕**：桌面版 hover 顯示，手機版點擊切換

#### 介面定義
```typescript
type MessageBubbleProps = {
  message: Message;
  currentViewMode: ViewMode;
  onEdit?: (messageId: string) => void;
  onSaveEdit?: (messageId: string, newContent: string) => void;
  onCancelEdit?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  className?: string;
};
```

#### 核心邏輯
- **視角判斷**：`isOwnMessage` 決定訊息是否為當前視角的訊息
- **樣式調整**：`getMessageStyling()` 根據視角返回對應的顏色方案
- **設備檢測**：自動偵測手機設備並調整互動方式

### MessageInput

訊息輸入元件，提供多行文字輸入和發送功能。

#### 功能特色
- **自動調整高度**：根據內容自動調整 textarea 高度
- **快捷鍵支援**：Enter 發送（桌面），Shift+Enter 換行
- **中文輸入支援**：處理 composition 事件避免誤觸發
- **手機最佳化**：防止縮放，改善鍵盤體驗
- **發送按鈕**：內嵌式發送按鈕，支援啟用/停用狀態

#### 介面定義
```typescript
interface MessageInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onSendMessage: (content: string) => void;
  'data-guide'?: string;
}
```

#### 核心功能
- **輸入處理**：`handleInputChange()` 處理內容變化和高度調整
- **發送邏輯**：`handleSend()` 處理訊息發送和狀態重置
- **設備適配**：不同設備使用不同的互動模式

### MessageList

訊息列表元件，管理多個訊息的顯示和滾動行為。

#### 功能特色
- **自動滾動**：新訊息自動滾動到底部
- **空狀態處理**：無訊息時顯示引導文字
- **平滑滾動**：CSS `scroll-smooth` 提供流暢體驗
- **自訂滾動條**：使用 Tailwind 的 scrollbar 樣式

#### 介面定義
```typescript
type MessageListProps = {
  messages: Message[];
  currentViewMode: ViewMode;
  onEditMessage?: (messageId: string) => void;
  onSaveEdit?: (messageId: string, newContent: string) => void;
  onCancelEdit?: (messageId: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  className?: string;
};
```

## 資料流程

### 訊息顯示流程
```
ConversationStore → MessageList → MessageBubble → 使用者介面
```

### 訊息輸入流程
```
使用者輸入 → MessageInput → onSendMessage → ConversationStore → 狀態更新
```

### 訊息編輯流程
```
點擊編輯 → MessageBubble.onEdit → 編輯模式 → 儲存/取消 → ConversationStore
```

## 使用方式

### 基本使用

```tsx
import { MessageList, MessageInput } from '@/features/message';

function ChatInterface() {
  const { messages, currentViewMode, addMessage, editMessage, deleteMessage } = useAppState();

  return (
    <div className="flex flex-col h-full">
      <MessageList
        messages={messages}
        currentViewMode={currentViewMode}
        onEditMessage={editMessage}
        onDeleteMessage={deleteMessage}
      />
      <MessageInput
        onSendMessage={addMessage}
        placeholder="輸入您的訊息..."
      />
    </div>
  );
}
```

### 進階配置

```tsx
// 自訂樣式
<MessageList 
  className="custom-message-list"
  messages={messages}
  // ... 其他 props
/>

// 教學模式
<MessageInput
  data-guide="message-input-guide"
  onSendMessage={handleTutorialMessage}
  disabled={isTutorialMode}
/>
```

## 元件間關係

```
MessageList
├── MessageBubble (多個實例)
│   ├── Badge (角色標籤)
│   ├── Card (訊息容器)
│   ├── Textarea (編輯模式)
│   └── Button (動作按鈕)
└── Empty State (無訊息時)

MessageInput
├── Textarea (輸入區域)
├── Button (發送按鈕)
└── Hint Text (快捷鍵提示)
```

## 重要函數和介面

### 核心型別

```typescript
// 來自 @/types
type Message = {
  id: string;
  content: string;
  role: MessageRole;
  timestamp: number;
  isEditing?: boolean;
};

type ViewMode = 'apprentice' | 'mentor';
type MessageRole = 'apprentice' | 'mentor';
```

### 重要函數

#### MessageBubble 核心函數

```typescript
// 判斷是否為當前視角的訊息
const isOwnMessage = 
  (currentViewMode === VIEW_MODE.APPRENTICE && message.role === MESSAGE_ROLE.APPRENTICE) ||
  (currentViewMode === VIEW_MODE.MENTOR && message.role === MESSAGE_ROLE.MENTOR);

// 取得訊息樣式配置
const getMessageStyling = () => {
  if (isOwnMessage) {
    return {
      badgeVariant: 'default' as const,
      cardClasses: 'bg-primary text-primary-foreground ml-4'
    };
  } else {
    return {
      badgeVariant: 'secondary' as const,
      cardClasses: 'bg-muted mr-4'
    };
  }
};
```

#### MessageInput 核心函數

```typescript
// 處理訊息發送
const handleSend = () => {
  const trimmedContent = content.trim();
  if (trimmedContent && !disabled) {
    onSendMessage(trimmedContent);
    setContent('');
    // 重置高度
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }
};

// 處理鍵盤事件
const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
  if (e.key === 'Enter' && !e.shiftKey && !isMobile && !isComposing) {
    e.preventDefault();
    handleSend();
  }
};
```

## 設計模式和最佳實務

### 響應式設計
- 使用 `useEffect` 和 `window.addEventListener` 偵測設備類型
- 不同設備使用不同的互動模式和樣式
- 手機版增加觸控區域大小和視覺回饋

### 狀態管理
- 元件內部狀態用於 UI 互動（編輯模式、顯示狀態）
- 業務邏輯狀態通過 props 傳遞
- 使用 `forwardRef` 支援 ref 傳遞

### 效能最佳化
- 使用 `useCallback` 和 `useMemo` 避免不必要的重新渲染
- 事件處理函數使用 `stopPropagation` 避免事件冒泡
- 自動滾動使用 `requestAnimationFrame` 最佳化效能

### 可存取性
- 使用語意化的 HTML 結構
- 提供 `aria-label` 和其他 ARIA 屬性
- 支援鍵盤導航和快捷鍵

## 常見使用模式

### 條件渲染
```tsx
{!message.isEditing && (onEdit || onDelete) && (
  <div className="action-buttons">
    {/* 動作按鈕 */}
  </div>
)}
```

### 設備適配
```tsx
const isMobile = window.innerWidth < 768 || 'ontouchstart' in window;

<Button
  size={isMobile ? "default" : "sm"}
  className={cn(
    "base-styles",
    isMobile ? "mobile-styles" : "desktop-styles"
  )}
/>
```

### 事件處理
```tsx
// 防止事件冒泡
onClick={(e) => {
  e.stopPropagation();
  handleAction();
}}

// 中文輸入法支援
onCompositionStart={() => setIsComposing(true)}
onCompositionEnd={() => setIsComposing(false)}
```

## 整合指南

### 與狀態管理整合
Message 模組通過 callback props 與上層狀態管理整合，不直接依賴 store 實現，保持元件解耦合。

### 與其他模組協作
- **conversation 模組**：提供訊息資料和操作方法
- **view-switch 模組**：提供當前視角狀態
- **tutorial 模組**：在教學模式下調整互動行為

### 樣式系統
使用 shadcn/ui 元件系統和 Tailwind CSS，確保與應用程式整體設計保持一致。