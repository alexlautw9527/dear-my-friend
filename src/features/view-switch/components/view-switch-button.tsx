import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ViewMode } from '@/types';
import { VIEW_MODE } from '@/types';
import { UI_TEXT } from '@/constants';

type ViewSwitchButtonProps = {
  currentViewMode: ViewMode;
  onSwitch: () => void;
  disabled?: boolean;
  isTransitioning?: boolean;
  className?: string;
};

function ViewSwitchButton({
  currentViewMode,
  onSwitch,
  disabled = false,
  isTransitioning = false,
  className,
}: ViewSwitchButtonProps) {
  const getButtonText = () => {
    return currentViewMode === VIEW_MODE.APPRENTICE
      ? UI_TEXT.SWITCH_TO_MENTOR
      : UI_TEXT.SWITCH_TO_APPRENTICE;
  };

  const getButtonIcon = () => {
    return (
      <RefreshCw
        className={cn(
          'h-4 w-4 transition-transform duration-200',
          isTransitioning && 'animate-spin'
        )}
      />
    );
  };

  return (
    <Button
      onClick={onSwitch}
      disabled={disabled || isTransitioning}
      variant="outline"
      size="sm"
      className={cn(
        'flex items-center gap-2 font-medium transition-all duration-200',
        'hover:bg-primary hover:text-primary-foreground',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      {getButtonIcon()}
      <span className="text-xs sm:text-sm">
        {getButtonText()}
      </span>
    </Button>
  );
}

export default ViewSwitchButton; 