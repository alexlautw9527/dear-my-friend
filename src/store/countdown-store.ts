import { create } from 'zustand';
import { COUNTDOWN } from '@/constants';

interface CountdownState {
  // 狀態
  isActive: boolean;
  remainingTime: number;
  isPaused: boolean;
  
  // 操作
  startCountdown: (duration?: number, onComplete?: () => void) => void;
  stopCountdown: () => void;
  pauseCountdown: () => void;
  resumeCountdown: () => void;
  skipCountdown: () => void;
  resetCountdown: () => void;
  getProgress: () => number;
  getFormattedTime: () => string;
}

// 倒數計時器管理
let countdownInterval: NodeJS.Timeout | null = null;
let countdownStartTime = 0;
let countdownPausedTime = 0;
let countdownOnComplete: (() => void) | null = null;
let countdownDuration: number = COUNTDOWN.DURATION;

const clearCountdownTimer = () => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
};

export const useCountdownStore = create<CountdownState>((set, get) => ({
  // 初始狀態
  isActive: false,
  remainingTime: COUNTDOWN.DURATION,
  isPaused: false,

  // 開始倒數
  startCountdown: (duration: number = COUNTDOWN.DURATION, onComplete?: () => void) => {
    clearCountdownTimer();
    
    countdownDuration = duration;
    countdownStartTime = Date.now();
    countdownPausedTime = 0;
    countdownOnComplete = onComplete || null;
    
    set({ 
      isActive: true, 
      remainingTime: duration, 
      isPaused: false 
    });

    countdownInterval = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - countdownStartTime - countdownPausedTime) / 1000;
      const remaining = Math.max(0, countdownDuration - elapsed);
      
      set({ 
        isActive: remaining > 0, 
        remainingTime: remaining, 
        isPaused: false 
      });
      
      if (remaining <= 0) {
        clearCountdownTimer();
        countdownOnComplete?.();
      }
    }, COUNTDOWN.TICK_INTERVAL as number);
  },

  // 停止倒數
  stopCountdown: () => {
    clearCountdownTimer();
    set({ 
      isActive: false, 
      remainingTime: COUNTDOWN.DURATION, 
      isPaused: false 
    });
  },

  // 暫停倒數
  pauseCountdown: () => {
    const state = get();
    if (!state.isActive || state.isPaused) return;
    
    clearCountdownTimer();
    countdownPausedTime += Date.now() - countdownStartTime;
    set({ isPaused: true });
  },

  // 恢復倒數
  resumeCountdown: () => {
    const state = get();
    if (!state.isActive || !state.isPaused) return;
    
    countdownStartTime = Date.now();
    set({ isPaused: false });

    countdownInterval = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - countdownStartTime + countdownPausedTime) / 1000;
      const remaining = Math.max(0, countdownDuration - elapsed);
      
      set({ 
        isActive: remaining > 0, 
        remainingTime: remaining, 
        isPaused: false 
      });
      
      if (remaining <= 0) {
        clearCountdownTimer();
        countdownOnComplete?.();
      }
    }, COUNTDOWN.TICK_INTERVAL as number);
  },

  // 跳過倒數
  skipCountdown: () => {
    const state = get();
    if (!state.isActive) return;
    
    clearCountdownTimer();
    set({ 
      isActive: false, 
      remainingTime: 0, 
      isPaused: false 
    });
    countdownOnComplete?.();
  },

  // 重置倒數
  resetCountdown: () => {
    clearCountdownTimer();
    countdownPausedTime = 0;
    set({ 
      isActive: false, 
      remainingTime: COUNTDOWN.DURATION, 
      isPaused: false 
    });
  },

  // 獲取倒數進度 (0-1)
  getProgress: () => {
    const state = get();
    return 1 - (state.remainingTime / countdownDuration);
  },

  // 獲取格式化的時間顯示
  getFormattedTime: () => {
    const state = get();
    const seconds = Math.ceil(state.remainingTime);
    return seconds.toString();
  },
}));