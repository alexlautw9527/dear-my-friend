# CLAUDE.md

此檔案為 Claude Code (claude.ai/code) 在此專案中工作時提供指導。

## MUST

- 寫註解的原則，不輕易產出註解，除非：
    - 當程式碼涉及特定商業規則或計算公式時
    - 複雜的數學公式或演算法邏輯，程式碼本身難以表達原理
    - 解釋為什麼選擇特定實作方式，特別是看起來「不優雅」但有原因的程式碼
    - 需要說明與第三方 API、舊系統整合時的限制
    - 需要標記技術債務和未來改進點
    - 正規表達式和複雜字串處理
    - 錯誤處理和邊界條件
- `src/components/ui`：是引入的 shadcn ui 庫，不要改動


## 專案概述

「Dear My Friend」是一個基於 React 的對話介面，透過切換兩種視角幫助使用者跳脫當局者迷：
- **學徒視角**：帶著困惑尋求幫助的自己
- **導師視角**：以第三者角度提供建議的自己

技術架構：React 19、TypeScript、Vite、shadcn UI 元件、TailwindCSS，使用 Zustand 進行狀態管理。

## 開發指令

```bash
# 開發伺服器
npm run dev

# 建置產品版本
npm run build

# 程式碼檢查
npm run lint

# 預覽產品版本
npm run preview
```

## 架構概述

### 狀態管理模式
應用程式使用 **Zustand stores** 按領域劃分：
- `conversation-store.ts` - 訊息管理、CRUD 操作、匯出功能
- `view-mode-store.ts` - 學徒/導師視角切換
- `countdown-store.ts` - 10 秒轉場倒數邏輯
- `tutorial-store.ts` - 互動式教學系統
- `ui-store.ts` - UI 狀態（彈窗、覆蓋層）

所有 stores 通過 `use-app-state.ts` 整合，提供統一 API 並處理跨 store 協調。

### 功能模組化組織
```
src/features/
├── conversation/    # 主聊天介面、匯出對話框
├── message/        # 訊息氣泡、輸入框、列表元件
├── view-switch/    # 視角切換 UI
├── tutorial/       # 互動式教學系統
└── welcome/        # 歡迎彈窗
```

### 核心資料流
1. **訊息流程**: MessageInput → useAppState → ConversationStore → MessageList → MessageBubble
2. **視角切換**: ViewSwitchButton → CountdownOverlay → ViewModeStore → UI 更新
3. **教學流程**: TutorialStore → TutorialOverlay → 引導互動

### 核心元件架構
- **ChatInterface**: 主要協調器，使用 useAppState hook
- **MessageBubble**: 支援行內編輯，基於當前視角的響應式定位
- **CountdownOverlay**: 10 秒模糊轉場效果，可跳過
- **MessageInput**: 手機優化，支援中文輸入法 composition 事件

## 技術規格

### 編碼規範（來自 .cursor/rules）
- 主元件預設匯出使用 `function declaration`，其他使用 `arrow functions`
- 基於功能的資料夾組織，使用 barrel exports
- 檔名：`kebab-case`，元件：`PascalCase`
- Props 型別：`MyComponentProps` 模式
- 使用 `const object + as const` 取代 enum
- 盡可能分離 Container/UI 模式
- 不可變陣列操作（map、reduce 等）

### UI 設計原則
- Notion 風格：簡潔、現代、優雅美學
- shadcn 元件系統確保一致性
- 響應式設計適配各種螢幕尺寸
- 清晰視覺層次區分視角
- 平滑動畫轉場

### 視角系統邏輯
- **學徒視角**：使用者訊息右對齊，導師訊息左對齊
- **導師視角**：使用者訊息右對齊，學徒訊息左對齊
- 訊息根據當前視角自動重新定位
- 空狀態自動重置為學徒視角

### Local Storage 整合
- 對話和視角狀態自動持久化
- 一般對話與教學對話分開儲存
- 應用程式重載時狀態復原

### 手機優化
- 觸控友善的輸入處理
- 支援中文/日文 composition 事件
- 鍵盤感知滾動
- 響應式按鈕大小和間距

## 常見開發模式

### 新增功能
1. 在 `src/features/` 下建立功能資料夾
2. 如需要在 `src/store/` 新增 Zustand store
3. 透過 `src/store/index.ts` 匯出
4. 如需跨 store 協調，更新 `use-app-state.ts`
5. 在功能的 `index.ts` 新增 barrel exports

### 訊息處理
訊息型別為 `Message`，包含 `id`、`content`、`role`、`timestamp` 和可選的 `isEditing` 標記。CRUD 操作請始終使用 store 方法以保持一致性。

### 視角感知渲染
使用 useAppState 的 `currentViewMode` 決定訊息定位和 UI 行為。系統會自動處理視角切換時的訊息重排。

### 教學系統整合
教學系統獨立於一般對話流程。使用 `isTutorialMode` 標記有條件渲染教學專用 UI，避免干擾正常操作。

## 功能追蹤

- **對話列表功能**：實現儲存和管理多個對話，支援切換、刪除和重新命名對話