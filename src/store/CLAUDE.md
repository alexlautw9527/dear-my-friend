# Store 架構文件

此目錄包含管理「Dear My Friend」對話介面應用程式狀態的 Zustand stores。

## Store 概覽

### 核心 Stores
- `conversation-store.ts` - 訊息管理、CRUD 操作、匯出功能
- `view-mode-store.ts` - 學徒/導師視角切換
- `countdown-store.ts` - 10 秒轉場倒數邏輯
- `tutorial-store.ts` - 互動式教學系統
- `ui-store.ts` - UI 狀態（彈窗、覆蓋層）

### 整合
- `use-app-state.ts` - 整合所有 stores 的統一 API，處理跨 store 協調
- `index.ts` - Barrel exports 提供乾淨的匯入

## 狀態管理模式

### Store 結構
每個 store 遵循以下模式：
```typescript
interface StoreState {
  // 狀態屬性
}

interface StoreActions {
  // 動作方法
}

export const useStore = create<StoreState & StoreActions>((set, get) => ({
  // 實作
}))
```

### 跨 Store 溝通
`use-app-state.ts` hook 提供：
- 統一存取所有 store 狀態
- 影響多個 stores 的協調動作
- 衍生狀態計算
- 跨越多個領域的業務邏輯

### 持久化
Stores 使用 Zustand 的持久化中介軟體處理：
- 對話歷史
- 視角模式偏好
- 教學進度
- UI 狀態復原

## 開發指南

### 新增狀態
1. 判斷狀態是否屬於現有 store 或需要新建 store
2. 如需新建 store，在此目錄中建立
3. 加入 `index.ts` 的 barrel exports
4. 如需跨 store 協調，更新 `use-app-state.ts`

### 狀態更新
- 始終使用 store 動作，絕不直接修改狀態
- 保持動作純淨且可預測
- 對複雜巢狀更新使用 immer 模式
- 在動作內處理非同步操作

### 測試 Stores
- 獨立測試 store 動作
- 模擬外部相依性
- 驗證狀態轉換
- 測試持久化行為