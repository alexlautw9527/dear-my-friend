# 小幫手模組

## 📋 模組概述

**小幫手** 是一個輕量級的導師輔助功能模組，設計用來幫助使用者在導師視角時避免思考空白。基於結構化思考框架，提供漸進式的引導提示，協助使用者深入分析問題並給出有建設性的回應。

### 核心設計理念

- **情境感知**：僅在導師視角下啟用，不干擾學徒模式的思考
- **框架引導**：採用 What-So What-Now What 三階段思考框架
- **漸進深化**：從現況釐清到意義洞察，最終形成行動建議
- **個人化**：支援自訂提示，適應不同使用者的思考習慣

## 🏗️ 檔案結構

```
src/features/mentor-assist/
├── components/
│   ├── mentor-assist-panel.tsx     # 主輔助面板元件（含 useClickOutside）
│   ├── framework-guide.tsx         # 框架指引元件
│   └── quick-prompts.tsx          # 快速提示元件
├── index.ts                       # Barrel exports
└── CLAUDE.md                      # 模組說明文件
```

## 🔧 主要元件說明

### MentorAssistPanel 元件

**主要輔助面板**，作為整個導師輔助功能的容器和協調者。

```typescript
interface MentorAssistPanelProps {
  isOpen: boolean;                    // 面板開關狀態
  currentFramework: MentorAssistFramework;  // 當前思考框架
  customPrompts: string[];            // 自訂提示列表
  onClose: () => void;               // 關閉面板
  onSetFramework: (framework: MentorAssistFramework) => void;  // 設定框架
  onNextFramework: () => void;       // 切換至下一框架
  onPromptSelect: (prompt: string) => void;  // 選擇提示
  onRemoveCustomPrompt: (index: number) => void;  // 移除自訂提示
}
```

**主要功能特色**：
- 固定於螢幕右側的側邊面板設計
- 思考框架區域固定展開，快速提示和自訂提示可折疊
- 響應式寬度調整（桌面 320px，手機適應）
- ESC 鍵快速關閉支援
- 插入模式：點擊提示插入到輸入框，而非直接發送
- **點擊外部自動關閉**：使用 `useClickOutside` Hook 實現
- **選擇提示後自動關閉**：提升使用流暢度

### FrameworkGuide 元件

**框架指引元件**，提供當前思考階段的詳細引導。

```typescript
interface FrameworkGuideProps {
  framework: MentorAssistFramework;  // 當前框架類型
  onPromptSelect: (prompt: string) => void;  // 提示選擇回調
}
```

**三階段框架內容**：

1. **What（現況釐清）**
   - 圖示：MessageCircle
   - 顏色：藍色系
   - 引導問題：客觀分析具體情況、關鍵人物、核心問題、時間脈絡

2. **So What（意義洞察）**
   - 圖示：Eye
   - 顏色：綠色系  
   - 引導問題：深入探索重要性、影響、內在需求、學習機會

3. **Now What（行動建議）**
   - 圖示：Target
   - 顏色：橙色系
   - 引導問題：制定具體行動計畫、資源配置、時間規劃、追蹤機制

### QuickPrompts 元件

**快速提示工具**，提供常用的引導語句供快速選擇。

```typescript
interface QuickPromptsProps {
  onPromptSelect: (prompt: string) => void;  // 提示選擇回調
}
```

**內建提示內容**（對話開場和轉場語句）：
- 我理解你現在的感受...
- 讓我們換個角度來看這件事。
- 聽起來這對你很重要。
- 我想先了解一下...
- 這確實是個值得思考的問題。
- 或許我們可以這樣思考：
- 我覺得你提到的重點是...
- 從你的描述中，我注意到...

## 📊 資料流程

### 狀態管理流程
```
MentorAssistStore → 狀態變更 → localStorage 持久化
     ↓
use-app-state.ts → 狀態整合 → ChatInterface
     ↓
MentorAssistPanel → 使用者互動 → 提示選擇
     ↓
handlePromptSelect → 插入到輸入框 → MessageInput
```

### 使用者互動流程
1. **啟動**：在導師視角下點擊「小幫手」按鈕
2. **框架選擇**：選擇或循環切換思考框架（固定展開）
3. **提示瀏覽**：查看當前框架的引導問題
4. **快速選擇**：從快速提示中選擇對話開場語句
5. **自訂管理**：新增或移除個人化提示
6. **應用**：點擊提示插入到輸入框，可編輯後發送（面板自動關閉）
7. **關閉方式**：
   - 點擊關閉按鈕 (X)
   - 按下 ESC 鍵
   - 點擊面板外部區域
   - 選擇任一提示後自動關閉

## 💡 使用方式

### 基本整合範例

```typescript
import { MentorAssistPanel } from '@/features/mentor-assist';
import { useAppState } from '@/store/use-app-state';

function ChatInterface() {
  const {
    currentViewMode,
    isMentorAssistEnabled,
    isMentorAssistPanelOpen,
    getCurrentFramework,
    getCustomPrompts,
    togglePanel,
    closePanel,
    setFramework,
    nextFramework,
    removeCustomPrompt,
  } = useAppState();

  const handlePromptSelect = (prompt: string) => {
    // 處理提示選擇邏輯
    insertTextCallback(prompt); // 插入到輸入框
    closePanel(); // 插入後自動關閉面板
  };

  return (
    <div>
      {/* 小幫手按鈕 */}
      {currentViewMode === 'mentor' && isMentorAssistEnabled() && (
        <Button onClick={togglePanel}>
          小幫手
        </Button>
      )}

      {/* 小幫手面板 */}
      <MentorAssistPanel
        isOpen={isMentorAssistPanelOpen()}
        currentFramework={getCurrentFramework()}
        customPrompts={getCustomPrompts()}
        onClose={closePanel}
        onSetFramework={setFramework}
        onNextFramework={nextFramework}
        onPromptSelect={handlePromptSelect}
        onRemoveCustomPrompt={removeCustomPrompt}
      />
    </div>
  );
}
```

### Store 操作範例

```typescript
import { useMentorAssistStore } from '@/store/mentor-assist-store';

// 基本狀態操作
const mentorAssist = useMentorAssistStore();

// 啟用/停用輔助功能
mentorAssist.enableAssist();
mentorAssist.disableAssist();

// 面板控制
mentorAssist.openPanel();
mentorAssist.closePanel();
mentorAssist.togglePanel();

// 框架操作
mentorAssist.setFramework('what');
mentorAssist.nextFramework();

// 自訂提示管理
mentorAssist.addCustomPrompt('我的自訂提示');
mentorAssist.removeCustomPrompt(0);
```

## 🔗 元件間關係

### 階層結構
```
ChatInterface
    └── MentorAssistPanel (主容器)
            ├── 思考框架區 (固定展開)
            ├── FrameworkGuide (當前框架指引)
            ├── QuickPrompts (快速提示 - 可折疊)
            └── 自訂提示區 (可折疊)
```

### 資料依賴關係
- **MentorAssistPanel** ← Store 狀態 + useClickOutside Hook
- **FrameworkGuide** ← 當前框架類型
- **QuickPrompts** ← 內建提示常數
- **自訂提示** ← Store 中的 customPrompts 陣列

### 事件流向
```
使用者點擊 → 元件事件 → Store 更新 → localStorage 同步 → UI 重渲染
           ↓
      選擇提示 → 插入文字 → 自動關閉面板
```

## 🛠️ 重要函數和介面

### 核心類型定義

```typescript
// 框架類型
export const MENTOR_ASSIST_FRAMEWORK = {
  WHAT: 'what',
  SO_WHAT: 'so_what', 
  NOW_WHAT: 'now_what',
} as const;

export type MentorAssistFramework = typeof MENTOR_ASSIST_FRAMEWORK[keyof typeof MENTOR_ASSIST_FRAMEWORK];

// 狀態介面
export type MentorAssistState = {
  isEnabled: boolean;              // 是否啟用輔助功能
  isPanelOpen: boolean;           // 面板是否開啟
  currentFramework: MentorAssistFramework;  // 當前框架
  customPrompts: string[];        // 自訂提示列表
};
```

### 常數配置

```typescript
// 框架內容定義
export const MENTOR_ASSIST = {
  FRAMEWORK_PROMPTS: {
    WHAT: {
      title: '現況釐清',
      description: '客觀分析問題的具體情況',
      prompts: [/* 深度分析問題列表 */],
      placeholder: '試著客觀描述目前的情況...'
    },
    SO_WHAT: {
      title: '意義洞察', 
      description: '深入探索問題的重要性和影響',
      prompts: [/* 意義探索問題列表 */],
      placeholder: '思考這個問題對你的深層意義...'
    },
    NOW_WHAT: {
      title: '行動建議',
      description: '制定具體可執行的行動方案', 
      prompts: [/* 行動規劃問題列表 */],
      placeholder: '想想具體可行的行動計畫...'
    }
  },
  QUICK_PROMPTS: [/* 對話開場和轉場語句 */]
} as const;
```

### 核心 Store 方法

```typescript
interface MentorAssistStoreState {
  // 狀態檢查
  isEnabled: () => boolean;
  isPanelOpen: () => boolean;
  getCurrentFramework: () => MentorAssistFramework;
  getCustomPrompts: () => string[];

  // 基本操作
  enableAssist: () => void;
  disableAssist: () => void;
  togglePanel: () => void;
  openPanel: () => void;
  closePanel: () => void;

  // 框架操作
  setFramework: (framework: MentorAssistFramework) => void;
  nextFramework: () => void;

  // 自訂提示
  addCustomPrompt: (prompt: string) => void;
  removeCustomPrompt: (index: number) => void;

  // 持久化
  initialize: () => void;
  saveToStorage: () => void;
  loadFromStorage: () => void;
}
```

## 🎨 設計模式和最佳實務

### 單一職責原則
- **MentorAssistPanel**：負責 UI 協調和使用者互動
- **FrameworkGuide**：專注於框架內容展示
- **QuickPrompts**：處理快速提示功能
- **MentorAssistStore**：負責狀態管理和持久化
- **useClickOutside Hook**：專門處理點擊外部關閉邏輯

### 狀態管理模式
- 使用 **Zustand** 進行輕量級狀態管理
- **單向資料流**：Store → Component → User Interaction → Store
- **持久化策略**：自動同步至 localStorage
- **狀態隔離**：獨立於其他功能模組

### 響應式設計模式
- **條件渲染**：基於視角和啟用狀態
- **彈性佈局**：適應不同螢幕尺寸
- **觸控友善**：適當的按鈕大小和間距

### 使用者體驗優化
- **自動關閉機制**：選擇提示後自動關閉面板，減少額外操作
- **多種關閉方式**：支援按鈕、ESC 鍵、點擊外部等多種關閉方式
- **流暢的操作流程**：最小化使用者需要的點擊次數

## ⚡ 效能考量

### 記憶化優化
- 框架內容使用 `const` 定義，避免重複創建
- 事件處理函數在父元件中定義，避免子元件重渲染

### 條件載入
- 僅在導師視角時載入相關功能
- 面板關閉時不渲染內部複雜元件

### 本地儲存優化
- 僅在狀態變更時觸發 localStorage 寫入
- 使用 try-catch 處理儲存異常

## 🚀 未來擴展方向

### 功能增強
- 支援多種思考框架（SWOT、5W1H、Design Thinking 等）
- AI 智能提示建議
- 提示使用頻率統計
- 匯出和匯入自訂提示
- ~~插入並發送的組合功能~~（已透過自動關閉面板優化流程）

### 使用者體驗
- 更豐富的視覺回饋和動畫效果
- 鍵盤快捷鍵支援（除 ESC 外的更多快捷鍵）
- 語音輸入整合
- 主題自訂功能
- 提示預覽功能
- 面板位置記憶（如調整寬度）

### 技術改進
- 提示內容的多語言支援
- 雲端同步功能
- 使用行為分析
- 效能監控和優化
- 更進階的文字插入功能

## 🐛 疑難排解

### 常見問題

**Q: 小幫手按鈕不顯示**
A: 確認當前是否為導師視角，且 `isMentorAssistEnabled()` 回傳 `true`

**Q: 自訂提示無法儲存**  
A: 檢查 localStorage 是否可用，確認瀏覽器未阻擋本地儲存

**Q: 框架切換無反應**
A: 確認 `nextFramework()` 方法正確呼叫，檢查 Store 狀態更新

### 除錯技巧

1. **檢查 Store 狀態**：
   ```typescript
   console.log(useMentorAssistStore.getState());
   ```

2. **驗證 localStorage**：
   ```typescript
   console.log(localStorage.getItem('dear-my-friend-mentor-assist'));
   ```

3. **監控狀態變化**：
   在 Store 中添加 console.log 來追蹤狀態更新

## 📝 最近更新

### 2025-06-27 - 使用者體驗優化
- **新增點擊外部關閉功能**：使用 `useClickOutside` Hook 實現，提升操作便利性
- **實作選擇後自動關閉**：選擇任一提示後面板自動關閉，減少額外操作步驟
- **整合至 ChatInterface**：在主介面中同步處理面板關閉邏輯

這些改進讓使用者在選擇提示後能更流暢地繼續編輯和發送訊息，無需手動關閉面板。