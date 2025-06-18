// 倒數計時相關常數
export const COUNTDOWN = {
  DURATION: 10, // 10秒倒數
  TICK_INTERVAL: 100, // 每100ms更新一次
} as const;

// Local Storage keys
export const STORAGE_KEYS = {
  CONVERSATION: 'dear-my-friend-conversation',
  VIEW_MODE: 'dear-my-friend-view-mode',
} as const;

// 動畫時間
export const ANIMATION = {
  TRANSITION_DURATION: 300, // 視角切換動畫時間 (ms)
  BLUR_DURATION: 200, // 模糊效果時間 (ms)
  MESSAGE_ENTER: 150, // 訊息進入動畫時間 (ms)
} as const;

// UI 文字
export const UI_TEXT = {
  APPRENTICE_LABEL: '學徒',
  MENTOR_LABEL: '導師',
  SWITCH_TO_MENTOR: '切換至導師視角',
  SWITCH_TO_APPRENTICE: '切換至學徒視角',
  SKIP_COUNTDOWN: '跳過',
  MESSAGE_PLACEHOLDER: '輸入您的訊息...',
  SEND: '發送',
  EDIT: '編輯',
  DELETE: '刪除',
  EXPORT: '匯出',
} as const; 