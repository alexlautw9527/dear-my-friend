import { useState, useEffect, useCallback } from 'react';
import type { ViewMode } from '@/types';
import { VIEW_MODE } from '@/types';
import { STORAGE_KEYS } from '@/constants';

const useViewMode = () => {
  const [currentViewMode, setCurrentViewMode] = useState<ViewMode>(VIEW_MODE.APPRENTICE);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 從 Local Storage 載入視角模式
  useEffect(() => {
    try {
      const savedViewMode = localStorage.getItem(STORAGE_KEYS.VIEW_MODE);
      if (savedViewMode && (savedViewMode === VIEW_MODE.APPRENTICE || savedViewMode === VIEW_MODE.MENTOR)) {
        setCurrentViewMode(savedViewMode as ViewMode);
      }
    } catch (error) {
      console.error('載入視角模式失敗:', error);
    }
  }, []);

  // 保存視角模式到 Local Storage
  const saveViewMode = useCallback((viewMode: ViewMode) => {
    try {
      localStorage.setItem(STORAGE_KEYS.VIEW_MODE, viewMode);
    } catch (error) {
      console.error('保存視角模式失敗:', error);
    }
  }, []);

  // 切換視角
  const switchViewMode = useCallback(() => {
    const newViewMode = currentViewMode === VIEW_MODE.APPRENTICE ? VIEW_MODE.MENTOR : VIEW_MODE.APPRENTICE;
    setCurrentViewMode(newViewMode);
    saveViewMode(newViewMode);
  }, [currentViewMode, saveViewMode]);

  // 重置到學徒視角（當訊息數為 0 且為導師視角時使用）
  const resetToApprentice = useCallback(() => {
    if (currentViewMode === VIEW_MODE.MENTOR) {
      setCurrentViewMode(VIEW_MODE.APPRENTICE);
      saveViewMode(VIEW_MODE.APPRENTICE);
    }
  }, [currentViewMode, saveViewMode]);

  // 設置轉場狀態
  const setTransitioning = useCallback((transitioning: boolean) => {
    setIsTransitioning(transitioning);
  }, []);

  // 獲取目標視角
  const getTargetViewMode = useCallback((): ViewMode => {
    return currentViewMode === VIEW_MODE.APPRENTICE ? VIEW_MODE.MENTOR : VIEW_MODE.APPRENTICE;
  }, [currentViewMode]);

  // 獲取當前角色標籤
  const getCurrentRoleLabel = useCallback((): string => {
    return currentViewMode === VIEW_MODE.APPRENTICE ? '學徒' : '導師';
  }, [currentViewMode]);

  // 獲取目標角色標籤
  const getTargetRoleLabel = useCallback((): string => {
    const targetMode = getTargetViewMode();
    return targetMode === VIEW_MODE.APPRENTICE ? '學徒' : '導師';
  }, [getTargetViewMode]);

  return {
    currentViewMode,
    isTransitioning,
    switchViewMode,
    resetToApprentice,
    setTransitioning,
    getTargetViewMode,
    getCurrentRoleLabel,
    getTargetRoleLabel,
  };
};

export default useViewMode; 