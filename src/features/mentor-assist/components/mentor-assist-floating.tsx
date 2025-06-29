import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { MENTOR_ASSIST_FRAMEWORK, type MentorAssistFramework } from '@/types';
import { CompactFrameworkGuide } from './compact-framework-guide';
import { ProgressiveQuickPrompts } from './progressive-quick-prompts';
import { MENTOR_ASSIST } from '@/constants';

interface MentorAssistFloatingProps {
  isVisible: boolean;
  anchorRef: React.RefObject<HTMLElement | null>;
  currentFramework: MentorAssistFramework;
  customPrompts: string[];
  expandedSections: { frameworkGuide: boolean; quickPrompts: boolean };
  onFrameworkChange: (framework: MentorAssistFramework) => void;
  onPromptSelect: (prompt: string) => void;
  onRemoveCustomPrompt: (index: number) => void;
  onToggleSection: (section: 'frameworkGuide' | 'quickPrompts') => void;
  shouldStayVisible?: boolean; // 新增：是否強制保持可見
}

export function MentorAssistFloating({
  isVisible,
  anchorRef,
  currentFramework,
  customPrompts,
  expandedSections,
  onFrameworkChange,
  onPromptSelect,
  onRemoveCustomPrompt,
  onToggleSection,
  shouldStayVisible = false,
}: MentorAssistFloatingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ bottom: number; left: number; width: number }>({
    bottom: 0,
    left: 0,
    width: 0,
  });
  // 使用 Store 中的展開狀態，不再使用本地 state
  const [opacity, setOpacity] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const interactionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 檢測是否為手機設備
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 計算浮動位置
  useEffect(() => {
    if (!anchorRef.current || !isVisible) return;

    const updatePosition = () => {
      const anchorRect = anchorRef.current!.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      
      if (isMobile) {
        // 手機版定位算法：解決面板在小螢幕上被截斷的問題
        // 使用 Math.max 確保面板既能接近輸入框，又不會超出螢幕範圍
        const availableSpace = anchorRect.top - 16; // 輸入框上方可用空間（減去16px邊距）
        const bottomPosition = Math.max(
          windowHeight - anchorRect.top + 8, // 理想位置：輸入框上方8px
          windowHeight - availableSpace + 16 // 保底位置：確保面板頂部不超出螢幕
        );
        
        setPosition({
          bottom: bottomPosition,
          left: 16, // 左右各 16px 邊距
          width: windowWidth - 32, // 減去左右邊距
        });
      } else {
        // 桌面版：使用浮動於輸入框上方
        setPosition({
          bottom: windowHeight - anchorRect.top + 8, // 8px 間距
          left: anchorRect.left,
          width: anchorRect.width,
        });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
      // 清理 timeout
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current);
      }
    };
  }, [anchorRef, isVisible, isMobile]);

  // 監聽輸入框的輸入事件
  useEffect(() => {
    if (!anchorRef.current || !isVisible) return;

    const inputElement = anchorRef.current.querySelector('textarea');
    if (!inputElement) return;

    const handleInput = () => {
      setIsUserTyping(true);
      setOpacity(0.3);
      
      // 清除之前的 timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // 1秒後恢復透明度
      typingTimeoutRef.current = setTimeout(() => {
        setIsUserTyping(false);
        if (!isHovered) {
          setOpacity(0.7);
        }
      }, 1000);
    };

    inputElement.addEventListener('input', handleInput);

    return () => {
      inputElement.removeEventListener('input', handleInput);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [anchorRef, isVisible, isHovered]);

  // 處理滑鼠懸停
  useEffect(() => {
    if (isHovered || !isUserTyping) {
      setOpacity(1);
    } else {
      setOpacity(0.3);
    }
  }, [isHovered, isUserTyping]);

  // 框架標籤樣式
  const getFrameworkTabStyle = (framework: MentorAssistFramework) => {
    const isActive = currentFramework === framework;
    const baseStyle = cn(
      'font-medium transition-all duration-200',
      isMobile ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'
    );
    
    if (isActive) {
      switch (framework) {
        case MENTOR_ASSIST_FRAMEWORK.WHAT:
          return cn(baseStyle, 'bg-blue-600 text-white border-b-4 border-blue-800 shadow-sm');
        case MENTOR_ASSIST_FRAMEWORK.SO_WHAT:
          return cn(baseStyle, 'bg-green-600 text-white border-b-4 border-green-800 shadow-sm');
        case MENTOR_ASSIST_FRAMEWORK.NOW_WHAT:
          return cn(baseStyle, 'bg-orange-600 text-white border-b-4 border-orange-800 shadow-sm');
      }
    }
    
    return cn(baseStyle, 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-b-2 border-transparent');
  };

  // 處理提示選擇：管理互動狀態避免面板意外關閉
  const handlePromptSelect = (prompt: string) => {
    // 設定為互動狀態，防止立即關閉
    setIsInteracting(true);
    
    // 執行提示選擇
    onPromptSelect(prompt);
    
    // 選擇後重置透明度
    setOpacity(1);
    setIsUserTyping(false);
    
    // 延遲結束互動狀態，確保文字插入和 UI 更新完成
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current);
    }
    interactionTimeoutRef.current = setTimeout(() => {
      setIsInteracting(false);
    }, 300);
  };

  // 當在互動狀態時，即使 isVisible 為 false 也要保持顯示
  const shouldShow = isVisible || isInteracting || shouldStayVisible;
  
  if (!shouldShow) return null;

  return (
    <div
      ref={containerRef}
      className={cn(
        'fixed z-50 rounded-lg shadow-lg border border-gray-200',
        'overflow-hidden',
        isMobile ? 'max-h-[50vh] bg-white/95 backdrop-blur-sm' : 'max-h-[400px] bg-white'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={(e) => {
        // 防止點擊面板時讓輸入框失去焦點
        e.preventDefault();
      }}
      style={{
        bottom: `${position.bottom}px`,
        left: `${position.left}px`,
        width: `${position.width}px`,
        opacity,
      }}
    >
      {/* 框架切換標籤 */}
      <div className="flex items-center border-b-2 border-gray-200 bg-gray-50">
        <button
          onClick={() => onFrameworkChange(MENTOR_ASSIST_FRAMEWORK.WHAT)}
          className={getFrameworkTabStyle(MENTOR_ASSIST_FRAMEWORK.WHAT)}
        >
          What
        </button>
        <button
          onClick={() => onFrameworkChange(MENTOR_ASSIST_FRAMEWORK.SO_WHAT)}
          className={getFrameworkTabStyle(MENTOR_ASSIST_FRAMEWORK.SO_WHAT)}
        >
          So What
        </button>
        <button
          onClick={() => onFrameworkChange(MENTOR_ASSIST_FRAMEWORK.NOW_WHAT)}
          className={getFrameworkTabStyle(MENTOR_ASSIST_FRAMEWORK.NOW_WHAT)}
        >
          Now What
        </button>
      </div>

      {/* 手機版提示文字 */}
      {isMobile && (
        <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
          <div className="flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
            <p className="text-xs text-blue-800 text-center font-semibold">
              點擊下方提示可插入到輸入框
            </p>
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
          </div>
        </div>
      )}
      
      <div className={cn(
        "overflow-y-auto",
        isMobile ? "max-h-[42vh]" : "max-h-[350px]" // 手機版適中高度，確保按鈕可見
      )}>
        {/* 框架指引區域 */}
        <div className="bg-white">
          <CompactFrameworkGuide
            framework={currentFramework}
            isExpanded={expandedSections.frameworkGuide}
            onToggleExpand={() => onToggleSection('frameworkGuide')}
            onPromptSelect={handlePromptSelect}
            isMobile={isMobile}
          />
        </div>

        {/* 快速提示區域 */}
        <div className={cn(
          "bg-gray-50 border-t-2 border-gray-200",
          // 滾動容器底部 margin：解決 overflow-y-auto 中最後元素貼底問題
          // 手機版需要更多空間避免按鈕被虛擬鍵盤或輸入框遮擋
          isMobile ? "mb-6" : "mb-4"
        )}>
          <ProgressiveQuickPrompts
            prompts={[...MENTOR_ASSIST.QUICK_PROMPTS]}
            initialCount={3} // 固定顯示 3 條訊息
            isExpanded={expandedSections.quickPrompts}
            onToggleExpand={() => onToggleSection('quickPrompts')}
            onPromptSelect={handlePromptSelect}
            isMobile={isMobile}
          />
        </div>

        {/* 自訂提示區域 */}
        {customPrompts.length > 0 && (
          <div className={cn(
            "bg-white border-t border-gray-200",
            isMobile ? "p-3" : "p-4"
          )}>
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200 mb-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <h4 className={cn(
                "font-semibold text-gray-800",
                isMobile ? "text-xs" : "text-sm"
              )}>自訂提示</h4>
            </div>
            <div className="space-y-1">
              {customPrompts.map((prompt, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between group"
                >
                  <button
                    onMouseDown={(e) => {
                      // 防止點擊時輸入框失去焦點
                      e.preventDefault();
                    }}
                    onClick={() => {
                      handlePromptSelect(prompt);
                      // 點擊後重新焦點輸入框
                      const inputElement = anchorRef.current?.querySelector('textarea');
                      if (inputElement) {
                        setTimeout(() => {
                          inputElement.focus();
                        }, 50);
                      }
                    }}
                    className={cn(
                      "flex-1 text-left px-2 py-1.5 rounded-md",
                      isMobile ? "text-xs" : "text-sm",
                      "text-gray-600 hover:text-purple-700 hover:bg-purple-50",
                      "border border-transparent hover:border-purple-200"
                    )}
                  >
                    {prompt}
                  </button>
                  <button
                    onClick={() => onRemoveCustomPrompt(index)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 ml-2"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}