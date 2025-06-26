# Welcome 模組 - CLAUDE.md

此檔案說明 Welcome 模組的設計架構、功能實現與使用方式。

## 模組概述

Welcome 模組負責為新使用者和返回使用者提供應用程式的使用說明與導引。該模組包含一個互動式的說明 Modal，以清晰易懂的方式介紹「Dear My Friend」應用程式的核心概念和使用流程。

### 主要功能
- **使用說明展示**：透過圖文並茂的方式介紹學徒視角與導師視角的概念
- **互動式教學啟動**：提供進入教學模式的入口點
- **響應式 UI 設計**：適配各種螢幕尺寸，提供最佳使用體驗
- **智慧化顯示邏輯**：根據使用者教學完成狀態決定顯示內容

## 檔案結構

```
src/features/welcome/
├── components/
│   └── welcome-modal.tsx          # 說明 Modal 元件
└── index.ts                       # Barrel export
```

## 主要元件說明

### IntroductionModal

**檔案位置**: `/src/features/welcome/components/welcome-modal.tsx`

說明 Modal 的核心元件，負責展示應用程式的使用指南和概念介紹。

#### Props 介面

```typescript
type IntroductionModalProps = {
  open: boolean;                    // Modal 顯示狀態
  onOpenChange: (open: boolean) => void;  // Modal 狀態變更回調
  onStartTutorial?: () => void;     // 啟動教學模式回調（可選）
};
```

#### 主要功能區塊

1. **視角概念介紹**
   - 學徒視角：帶著困惑尋求幫助的自己
   - 導師視角：以第三者角度提供建議的自己
   - 使用卡片式設計展示，包含圖示和徽章

2. **使用步驟指引**
   - 四步驟操作流程說明
   - 數字標記 + 圖示 + 描述文字的設計模式
   - 涵蓋從學徒開始到對話匯出的完整流程

3. **互動按鈕區域**
   - 教學模式按鈕：觸發互動式教學
   - 關閉按鈕：關閉說明 Modal

#### UI 設計特色

- **響應式佈局**：使用 `w-[calc(100%-2rem)]` 確保手機端適當邊距
- **視覺層次**：透過卡片、徽章、圖示建立清晰的資訊層級
- **無障礙設計**：支援鍵盤導航和螢幕閱讀器
- **動畫效果**：平滑的開關動畫提升使用體驗

## 資料流程

### 1. Modal 顯示觸發流程

```
使用者點擊說明按鈕 → ChatInterface.handleOpenWelcome() → 判斷教學狀態 → 
├─ 教學未完成 → 啟動互動式教學
└─ 教學已完成 → 顯示說明 Modal (setShowIntroductionModal(true))
```

### 2. Modal 狀態管理

```
UI Store (showIntroductionModal) ↔ useAppState ↔ ChatInterface ↔ IntroductionModal
```

### 3. 教學模式啟動流程

```
IntroductionModal.handleStartTutorial() → ChatInterface.handleStartTutorial() → 
清除教學對話 → 重置視角 → 切換教學模式 → 啟動教學系統
```

## 使用方式

### 在其他元件中導入

```typescript
import { IntroductionModal } from '@/features/welcome';

// 或者
import { IntroductionModal } from '@/features/welcome/components/welcome-modal';
```

### 基本使用範例

```typescript
function MyComponent() {
  const [showModal, setShowModal] = useState(false);
  
  const handleStartTutorial = () => {
    // 啟動教學邏輯
    console.log('Starting tutorial...');
  };

  return (
    <IntroductionModal
      open={showModal}
      onOpenChange={setShowModal}
      onStartTutorial={handleStartTutorial}
    />
  );
}
```

### 與狀態管理整合

```typescript
// 透過 useAppState hook 使用
const {
  showIntroductionModal,
  setShowIntroductionModal,
} = useAppState();

return (
  <IntroductionModal
    open={showIntroductionModal}
    onOpenChange={setShowIntroductionModal}
    onStartTutorial={handleStartTutorial}
  />
);
```

## 元件間關係

### 狀態依賴關係

```
UI Store (ui-store.ts)
├── showIntroductionModal: boolean
└── setShowIntroductionModal: (show: boolean) => void
    ↓
App State (use-app-state.ts)
├── 整合多個 stores 的狀態
└── 提供統一的 API 介面
    ↓
Chat Interface (chat-interface.tsx)
├── 處理說明按鈕點擊邏輯
├── 判斷教學完成狀態
└── 控制 Modal 顯示時機
    ↓
Introduction Modal (welcome-modal.tsx)
├── 展示使用說明內容
└── 提供教學模式入口
```

### 功能整合關係

```
Welcome Module
├── 與 Tutorial System 整合
│   ├── 檢查教學完成狀態
│   └── 啟動互動式教學
├── 與 UI Store 整合
│   ├── Modal 顯示狀態管理
│   └── 響應使用者操作
└── 與 Chat Interface 整合
    ├── 說明按鈕觸發
    └── 教學啟動協調
```

## 重要函數和介面

### 核心函數

#### `handleStartTutorial()`

```typescript
const handleStartTutorial = () => {
  onStartTutorial?.();     // 呼叫外部傳入的教學啟動函數
  onOpenChange(false);     // 關閉說明 Modal
};
```

**功能**：處理啟動教學模式的邏輯，確保 Modal 關閉並觸發教學系統。

#### `ChatInterface.handleOpenWelcome()`

```typescript
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
```

**功能**：智慧判斷使用者狀態，決定是顯示說明 Modal 還是直接啟動教學。

### 型別定義

#### `IntroductionModalProps`

```typescript
type IntroductionModalProps = {
  open: boolean;                    // Modal 的顯示狀態
  onOpenChange: (open: boolean) => void;  // 狀態變更的回調函數
  onStartTutorial?: () => void;     // 啟動教學的可選回調函數
};
```

### UI Store 介面

```typescript
interface UIState {
  showIntroductionModal: boolean;              // 說明 Modal 顯示狀態
  setShowIntroductionModal: (show: boolean) => void;  // 設置顯示狀態的函數
}
```

## 設計原則

### 1. 使用者導向設計
- **漸進式引導**：從基本概念到具體操作步驟的邏輯順序
- **視覺化説明**：使用圖示和顏色區分不同視角概念
- **互動式選擇**：提供「閱讀說明」和「互動教學」兩種學習方式

### 2. 響應式適配
- **螢幕尺寸適應**：支援桌面端和行動端的最佳顯示效果
- **內容捲動**：長內容支援垂直捲動，確保所有資訊可訪問
- **按鈕佈局**：按鈕間距和大小針對觸控操作優化

### 3. 系統整合
- **狀態一致性**：透過 Zustand store 確保狀態管理的一致性
- **模組解耦**：透過 props 和回調函數與其他模組鬆耦合
- **錯誤處理**：優雅處理可選的回調函數，避免執行時錯誤

### 4. 無障礙支援
- **語義化 HTML**：正確使用 Dialog 語義結構
- **鍵盤導航**：支援 Tab 鍵和 Enter 鍵操作
- **螢幕閱讀器**：提供適當的 aria 標籤和描述文字

## 未來擴展方向

### 功能增強
- **多語言支援**：國際化介面文字和說明內容
- **個性化設定**：記住使用者偏好，避免重複顯示
- **進階說明**：增加更多進階功能的使用技巧

### 互動改進
- **動畫效果**：增加步驟引導的視覺動畫
- **影片教學**：整合影片或 GIF 動畫說明
- **互動式 Demo**：在說明中直接展示功能操作

### 整合優化
- **使用分析**：追蹤使用者在說明 Modal 中的行為
- **智慧推薦**：根據使用情況推薦相關功能
- **回饋機制**：收集使用者對說明內容的意見回饋