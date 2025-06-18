import { Badge } from '@/components/ui/badge';
import { User, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ViewMode } from '@/types';
import { VIEW_MODE } from '@/types';
import { UI_TEXT } from '@/constants';

type ViewIndicatorProps = {
  currentViewMode: ViewMode;
  className?: string;
};

function ViewIndicator({ currentViewMode, className }: ViewIndicatorProps) {
  const getViewInfo = () => {
    if (currentViewMode === VIEW_MODE.APPRENTICE) {
      return {
        label: UI_TEXT.APPRENTICE_LABEL,
        description: '以學習者的心態提出問題和困惑',
        icon: <User className="h-4 w-4" />,
        badgeVariant: 'default' as const,
        bgClass: 'bg-secondary/50 border-secondary/50',
      };
    } else {
      return {
        label: UI_TEXT.MENTOR_LABEL,
        description: '以第三者角度提供客觀的建議和指導',
        icon: <GraduationCap className="h-4 w-4" />,
        badgeVariant: 'default' as const,
        bgClass: 'bg-secondary/50 border-secondary/50',
      };
    }
  };

  const viewInfo = getViewInfo();

  return (
    <div className={cn('flex items-center justify-center p-3', className)}>
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-2 rounded-lg border transition-all duration-200',
          'flex-wrap sm:flex-nowrap justify-center',
          viewInfo.bgClass
        )}
      >
        {/* 視角圖示和標籤 */}
        <div className="flex items-center gap-2">
          {viewInfo.icon}
          <Badge variant={viewInfo.badgeVariant} className="font-medium">
            當前：{viewInfo.label}視角
          </Badge>
        </div>

        {/* 分隔線 - 在手機版隱藏 */}
        <div className="hidden sm:block w-px h-4 bg-border" />

        {/* 說明文字 - 在手機版調整字體大小 */}
        <span className="text-xs sm:text-sm text-muted-foreground text-center">
          {viewInfo.description}
        </span>
      </div>
    </div>
  );
}

export default ViewIndicator; 