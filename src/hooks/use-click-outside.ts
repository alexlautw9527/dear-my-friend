import { useEffect, useRef } from 'react';

export const useClickOutside = <T extends HTMLElement>(
  callback: () => void,
  enabled: boolean = true
): React.RefObject<T | null> => {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      // 類型轉換處理：event.target 可能為 null，contains 需要 Node 類型
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    // 使用 mousedown 而非 click：避免與元素內部的 click 事件產生競爭條件
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [callback, enabled]);

  return ref;
};