import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MENTOR_ASSIST_FRAMEWORK, type MentorAssistFramework } from '@/types';
import { MENTOR_ASSIST } from '@/constants';

interface CompactFrameworkGuideProps {
  framework: MentorAssistFramework;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onPromptSelect: (prompt: string) => void;
  isMobile?: boolean;
}

export function CompactFrameworkGuide({
  framework,
  isExpanded,
  onToggleExpand,
  onPromptSelect,
  isMobile = false,
}: CompactFrameworkGuideProps) {
  const frameworkData = getFrameworkData(framework);
  // 預設顯示前 4 個提示，展開後顯示全部
  const defaultCount = isMobile ? 3 : 4;
  const displayPrompts = isExpanded 
    ? frameworkData.prompts 
    : frameworkData.prompts.slice(0, defaultCount);

  return (
    <div className="space-y-3">
      {/* 框架標題和描述 */}
      <div className="pb-2 border-b border-gray-100">
        <h3 className={cn(
          'font-semibold mb-1',
          isMobile ? 'text-xs' : 'text-sm',
          getFrameworkColor(framework)
        )}>
          {frameworkData.title}
        </h3>
        <p className={cn(
          'text-gray-600',
          isMobile ? 'text-xs' : 'text-xs'
        )}>
          {frameworkData.description}
        </p>
      </div>

      {/* 引導問題 */}
      <div className="space-y-1">
        {displayPrompts.map((prompt, index) => (
          <button
            key={index}
            onMouseDown={(e) => {
              // 防止點擊時輸入框失去焦點
              e.preventDefault();
            }}
            onClick={() => onPromptSelect(prompt)}
            className={cn(
              'w-full text-left px-3 rounded-md',
              isMobile ? 'text-xs py-2' : 'text-sm py-2.5',
              'text-gray-700 hover:bg-blue-50 hover:text-blue-700',
              'border border-transparent hover:border-blue-200'
            )}
          >
            • {prompt}
          </button>
        ))}
      </div>

      {/* 展開/收合按鈕 */}
      {frameworkData.prompts.length > defaultCount && (
        <button
          onClick={onToggleExpand}
          className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-full',
            'text-xs font-medium',
            'text-gray-500 hover:text-blue-700 hover:bg-blue-50',
            'border border-gray-200 hover:border-blue-300'
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
              顯示更多（還有 {frameworkData.prompts.length - defaultCount} 個）
            </>
          )}
        </button>
      )}
    </div>
  );
}

function getFrameworkData(framework: MentorAssistFramework) {
  switch (framework) {
    case MENTOR_ASSIST_FRAMEWORK.WHAT:
      return MENTOR_ASSIST.FRAMEWORK_PROMPTS.WHAT;
    case MENTOR_ASSIST_FRAMEWORK.SO_WHAT:
      return MENTOR_ASSIST.FRAMEWORK_PROMPTS.SO_WHAT;
    case MENTOR_ASSIST_FRAMEWORK.NOW_WHAT:
      return MENTOR_ASSIST.FRAMEWORK_PROMPTS.NOW_WHAT;
    default:
      return MENTOR_ASSIST.FRAMEWORK_PROMPTS.WHAT;
  }
}

function getFrameworkColor(framework: MentorAssistFramework) {
  switch (framework) {
    case MENTOR_ASSIST_FRAMEWORK.WHAT:
      return 'text-blue-700 font-bold';
    case MENTOR_ASSIST_FRAMEWORK.SO_WHAT:
      return 'text-green-700 font-bold';
    case MENTOR_ASSIST_FRAMEWORK.NOW_WHAT:
      return 'text-orange-700 font-bold';
    default:
      return 'text-gray-700 font-bold';
  }
}