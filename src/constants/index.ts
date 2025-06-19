// 倒數計時相關常數
export const COUNTDOWN = {
  DURATION: 10, // 10秒倒數
  TICK_INTERVAL: 100, // 每100ms更新一次
} as const;

// Local Storage keys
export const STORAGE_KEYS = {
  CONVERSATION: 'dear-my-friend-conversation',
  TUTORIAL_CONVERSATION: 'dear-my-friend-tutorial-conversation',
  VIEW_MODE: 'dear-my-friend-view-mode',
  TUTORIAL_COMPLETED: 'dear-my-friend-tutorial-completed',
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

// 教學相關常數
export const TUTORIAL = {
  STEP_DURATION: 1000, // 每個步驟之間的延遲 (ms)
  DEMO_MESSAGES: {
    APPRENTICE: '我在新專案中被指派為團隊負責人，但我從來沒有管理經驗，現在團隊成員都比我資深，我不知道該如何建立公信力，也擔心自己做不好會讓大家失望...',
    MENTOR: '親愛的朋友，我能感受到你內心的焦慮和壓力，這種感覺很正常，每個人第一次承擔新責任時都會有這樣的擔憂。讓我陪你一起看看這個挑戰：首先，你被選為負責人一定有原因，公司看到了你的潛力。關於建立權威，其實真正的領導力不是來自職位，而是來自你的專業能力、同理心和為團隊服務的態度。不如我們先從了解每位團隊成員的強項開始，讓他們感受到你的重視，這樣既能學習他們的經驗，也能建立信任基礎。你覺得這個方向如何？',
  },
  STEP_TITLES: {
    WELCOME: '歡迎使用 Dear My Friend',
    APPRENTICE_DEMO: '學徒視角 - 表達困擾',
    SWITCH_GUIDE: '視角切換 - 轉換思維',
    MENTOR_INTRO: '導師視角 - 客觀分析',
    MENTOR_DEMO: '導師回應 - 提供建議',
    MENTOR_RESPONSE_REVIEW: '查看導師回應',
    COMPLETE: '教學完成',
  },
} as const; 