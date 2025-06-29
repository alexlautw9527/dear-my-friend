import { create } from 'zustand';
import { COUNTDOWN } from '@/constants';

interface CountdownState {
  isActive: boolean;
  remainingTime: number;
  isPaused: boolean;
  startCountdown: (duration?: number, onComplete?: () => void) => void;
  stopCountdown: () => void;
  pauseCountdown: () => void;
  resumeCountdown: () => void;
  skipCountdown: () => void;
  resetCountdown: () => void;
  getProgress: () => number;
  getFormattedTime: () => string;
}

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
  isActive: false,
  remainingTime: COUNTDOWN.DURATION,
  isPaused: false,

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
      // 計算已經過的時間：當前時間 - 開始時間 - 暫停的累積時間
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

  stopCountdown: () => {
    clearCountdownTimer();
    set({ 
      isActive: false, 
      remainingTime: COUNTDOWN.DURATION, 
      isPaused: false 
    });
  },

  pauseCountdown: () => {
    const state = get();
    if (!state.isActive || state.isPaused) return;
    
    clearCountdownTimer();
    countdownPausedTime += Date.now() - countdownStartTime;
    set({ isPaused: true });
  },

  resumeCountdown: () => {
    const state = get();
    if (!state.isActive || !state.isPaused) return;
    
    countdownStartTime = Date.now();
    set({ isPaused: false });

    countdownInterval = setInterval(() => {
      const now = Date.now();
      // 恢復後的時間計算：新的開始時間 + 之前暫停的累積時間
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

  resetCountdown: () => {
    clearCountdownTimer();
    countdownPausedTime = 0;
    set({ 
      isActive: false, 
      remainingTime: COUNTDOWN.DURATION, 
      isPaused: false 
    });
  },

  getProgress: () => {
    const state = get();
    return 1 - (state.remainingTime / countdownDuration);
  },

  getFormattedTime: () => {
    const state = get();
    const seconds = Math.ceil(state.remainingTime);
    return seconds.toString();
  },
}));