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
  SESSIONS: 'dear-my-friend-sessions',
  CURRENT_SESSION_ID: 'dear-my-friend-current-session-id',
  MENTOR_ASSIST: 'dear-my-friend-mentor-assist',
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
  NEW_SESSION: '新對話',
  RENAME_SESSION: '重新命名',
  DELETE_SESSION: '刪除對話',
  SESSION_LIST: '對話列表',
  CONFIRM_DELETE_SESSION: '確定要刪除這個對話嗎？此操作無法復原。',
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

// 導師輔助相關常數
export const MENTOR_ASSIST = {
  FRAMEWORK_PROMPTS: {
    WHAT: {
      title: '現況釐清',
      description: '客觀分析問題的具體情況',
      prompts: [
        '具體發生了什麼事？請客觀描述事實。',
        '這個問題涉及哪些關鍵人物？他們各自的立場是什麼？',
        '問題的核心癥結點在哪裡？',
        '這個情況從什麼時候開始的？有什麼變化？',
        '有哪些可以量化或具體描述的資訊？'
      ],
      placeholder: '試著客觀描述目前的情況...'
    },
    SO_WHAT: {
      title: '意義洞察',
      description: '深入探索問題的重要性和影響',
      prompts: [
        '為什麼這個問題對你來說很重要？它觸及了什麼核心價值？',
        '如果不解決這個問題，會對你的生活或目標產生什麼影響？',
        '這個經歷反映了你內在的什麼需求或恐懼？',
        '回顧過去，你是否有類似的模式或經驗？',
        '這個挑戰可能在教會你什麼重要的人生課題？'
      ],
      placeholder: '思考這個問題對你的深層意義...'
    },
    NOW_WHAT: {
      title: '行動建議',
      description: '制定具體可執行的行動方案',
      prompts: [
        '基於前面的分析，你認為最關鍵的第一步行動是什麼？',
        '你需要哪些具體的資源、技能或人脈支持？',
        '如何將這個複雜問題分解成可管理的小步驟？',
        '什麼時間點開始行動最合適？如何設定里程碑？',
        '如何建立持續追蹤進度和調整策略的機制？'
      ],
      placeholder: '想想具體可行的行動計畫...'
    }
  },
  QUICK_PROMPTS: [
    '我理解你現在的感受...',
    '讓我們換個角度來看這件事。',
    '聽起來這對你很重要。',
    '我想先了解一下...',
    '這確實是個值得思考的問題。',
    '或許我們可以這樣思考：',
    '我覺得你提到的重點是...',
    '從你的描述中，我注意到...'
  ]
} as const; 