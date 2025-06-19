import { Button } from '@/components/ui/button';
import { SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import type { ViewMode } from '@/types';
import { VIEW_MODE } from '@/types';
import { UI_TEXT, COUNTDOWN } from '@/constants';

type CountdownOverlayProps = {
  isActive: boolean;
  remainingTime: number;
  targetViewMode: ViewMode;
  onSkip: () => void;
  className?: string;
};

function CountdownOverlay({
  isActive,
  remainingTime,
  targetViewMode,
  onSkip,
  className,
}: CountdownOverlayProps) {
  // 鍵盤事件處理
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 只有在倒數活躍時才響應空格鍵
      if (isActive && event.code === 'Space') {
        event.preventDefault(); // 防止頁面滾動
        onSkip();
      }
    };

    // 只有在倒數活躍時才添加事件監聽器
    if (isActive) {
      document.addEventListener('keydown', handleKeyDown);
    }

    // 清理事件監聽器
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, onSkip]);

  if (!isActive) return null;

  const progress = ((COUNTDOWN.DURATION - remainingTime) / COUNTDOWN.DURATION) * 100;
  const seconds = Math.ceil(remainingTime);

  const getTransitionText = () => {
    return targetViewMode === VIEW_MODE.MENTOR
      ? '正在切換至導師視角...'
      : '正在切換至學徒視角...';
  };

  const getViewModeDescription = () => {
    if (targetViewMode === VIEW_MODE.MENTOR) {
      return '準備以第三者的角度，客觀地分析問題並提供建議';
    } else {
      return '準備以學習者的心態，接受指導並進一步思考';
    }
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        'bg-background/80 backdrop-blur-md transition-all duration-300',
        className
      )}
    >
      <div className="max-w-md w-full mx-4">
        <div className="bg-card rounded-lg shadow-2xl p-8 border">
          {/* 倒數計時圓圈 */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-muted flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">
                  {seconds}
                </span>
              </div>
              <svg
                className="absolute inset-0 w-20 h-20 transform -rotate-90"
                viewBox="0 0 80 80"
              >
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${progress * 2.26} 226`}
                  className="text-primary transition-all duration-100"
                />
              </svg>
            </div>
          </div>

          {/* 轉換文字 */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold mb-2">
              {getTransitionText()}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {getViewModeDescription()}
            </p>
          </div>



          {/* 跳過按鈕 */}
          <div className="flex justify-center">
            <Button
              onClick={onSkip}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <SkipForward className="h-4 w-4" />
              {UI_TEXT.SKIP_COUNTDOWN}
            </Button>
          </div>

          {/* 提示文字 */}
          <div className="text-center mt-4">
            <p className="text-xs text-muted-foreground">
              按空格鍵或點擊按鈕跳過倒數
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CountdownOverlay; 