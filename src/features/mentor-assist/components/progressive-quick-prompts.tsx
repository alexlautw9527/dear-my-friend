import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressiveQuickPromptsProps {
  prompts: string[];
  initialCount: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onPromptSelect: (prompt: string) => void;
  isMobile?: boolean;
}

export function ProgressiveQuickPrompts({
  prompts,
  initialCount,
  isExpanded,
  onToggleExpand,
  onPromptSelect,
  isMobile = false,
}: ProgressiveQuickPromptsProps) {
  const displayPrompts = isExpanded ? prompts : prompts.slice(0, initialCount);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <h4 className={cn(
          "font-semibold text-gray-800",
          isMobile ? "text-xs" : "text-sm"
        )}>快速提示</h4>
      </div>
      
      {/* 提示列表 */}
      <div className="space-y-2">
        {displayPrompts.map((prompt, index) => (
          <button
            key={index}
            onMouseDown={(e) => {
              // 防止點擊時輸入框失去焦點
              e.preventDefault();
            }}
            onClick={() => onPromptSelect(prompt)}
            className={cn(
              'w-full text-left px-3 py-2 rounded-lg',
              isMobile ? 'text-xs' : 'text-sm',
              'text-gray-600 hover:text-green-700 hover:bg-green-50',
              'border border-transparent hover:border-green-200',
              'hover:shadow-sm'
            )}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* 展開/收合按鈕 */}
      {prompts.length > initialCount && (
        <button
          onClick={onToggleExpand}
          className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-full',
            'text-xs font-medium',
            'text-gray-500 hover:text-green-700 hover:bg-green-50',
            'border border-gray-200 hover:border-green-300'
          )}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-3 h-3" />
              顯示較少
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3" />
              顯示更多（還有 {prompts.length - initialCount} 個）
            </>
          )}
        </button>
      )}
    </div>
  );
}