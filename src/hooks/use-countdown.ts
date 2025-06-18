import { useState, useCallback, useRef, useEffect } from 'react';
import { COUNTDOWN } from '@/constants';

type CountdownOptions = {
  duration?: number;
  onComplete?: () => void;
  onTick?: (remainingTime: number) => void;
};

const useCountdown = (options: CountdownOptions = {}) => {
  const {
    duration = COUNTDOWN.DURATION,
    onComplete,
    onTick,
  } = options;

  const [isActive, setIsActive] = useState(false);
  const [remainingTime, setRemainingTime] = useState(duration);
  const [isPaused, setIsPaused] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  // 清理計時器
  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // 開始倒數
  const startCountdown = useCallback((customDuration?: number) => {
    const countdownDuration = customDuration ?? duration;
    
    setIsActive(true);
    setIsPaused(false);
    setRemainingTime(countdownDuration);
    
    startTimeRef.current = Date.now();
    pausedTimeRef.current = 0;

    clearTimer();
    
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - startTimeRef.current - pausedTimeRef.current) / 1000;
      const remaining = Math.max(0, countdownDuration - elapsed);
      
      setRemainingTime(remaining);
      onTick?.(remaining);
      
      if (remaining <= 0) {
        clearTimer();
        setIsActive(false);
        onComplete?.();
      }
    }, COUNTDOWN.TICK_INTERVAL);
  }, [duration, onComplete, onTick, clearTimer]);

  // 停止倒數
  const stopCountdown = useCallback(() => {
    clearTimer();
    setIsActive(false);
    setIsPaused(false);
    setRemainingTime(duration);
  }, [clearTimer, duration]);

  // 暫停倒數
  const pauseCountdown = useCallback(() => {
    if (!isActive || isPaused) return;
    
    clearTimer();
    setIsPaused(true);
    pausedTimeRef.current += Date.now() - startTimeRef.current;
  }, [isActive, isPaused, clearTimer]);

  // 恢復倒數
  const resumeCountdown = useCallback(() => {
    if (!isActive || !isPaused) return;
    
    setIsPaused(false);
    startTimeRef.current = Date.now();
    
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - startTimeRef.current + pausedTimeRef.current) / 1000;
      const remaining = Math.max(0, duration - elapsed);
      
      setRemainingTime(remaining);
      onTick?.(remaining);
      
      if (remaining <= 0) {
        clearTimer();
        setIsActive(false);
        onComplete?.();
      }
    }, COUNTDOWN.TICK_INTERVAL);
  }, [isActive, isPaused, duration, onComplete, onTick, clearTimer]);

  // 跳過倒數
  const skipCountdown = useCallback(() => {
    if (!isActive) return;
    
    clearTimer();
    setIsActive(false);
    setIsPaused(false);
    setRemainingTime(0);
    onComplete?.();
  }, [isActive, clearTimer, onComplete]);

  // 重置倒數
  const resetCountdown = useCallback(() => {
    clearTimer();
    setIsActive(false);
    setIsPaused(false);
    setRemainingTime(duration);
    pausedTimeRef.current = 0;
  }, [clearTimer, duration]);

  // 獲取倒數進度 (0-1)
  const getProgress = useCallback(() => {
    return 1 - (remainingTime / duration);
  }, [remainingTime, duration]);

  // 獲取格式化的時間顯示
  const getFormattedTime = useCallback(() => {
    const seconds = Math.ceil(remainingTime);
    return seconds.toString();
  }, [remainingTime]);

  // 清理副作用
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  return {
    isActive,
    remainingTime,
    isPaused,
    startCountdown,
    stopCountdown,
    pauseCountdown,
    resumeCountdown,
    skipCountdown,
    resetCountdown,
    getProgress,
    getFormattedTime,
  };
};

export default useCountdown; 