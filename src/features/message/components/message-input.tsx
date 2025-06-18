import * as React from 'react';
import { useState, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { UI_TEXT } from '@/constants';
import { cn } from '@/lib/utils';

interface MessageInputProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onSendMessage: (content: string) => void;
}

const MessageInput = React.forwardRef<HTMLTextAreaElement, MessageInputProps>(
  ({ 
    onSendMessage,
    disabled = false,
    placeholder = UI_TEXT.MESSAGE_PLACEHOLDER,
    className,
    ...props 
  }, ref) => {
    const [content, setContent] = useState('');
    const [isComposing, setIsComposing] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    
    // 檢測是否為手機設備
    useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
      };
      
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }, []);
    
    // 合併 refs
    const mergedRef = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        textareaRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    const handleSend = () => {
      const trimmedContent = content.trim();
      if (trimmedContent && !disabled) {
        onSendMessage(trimmedContent);
        setContent('');
        // 重置 textarea 高度
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      // 在手機上，Enter 通常是換行，不是發送
      if (e.key === 'Enter' && !e.shiftKey && !isMobile && !isComposing) {
        e.preventDefault();
        handleSend();
      }
      // 如果 props 中有 onKeyDown，也要調用它
      props.onKeyDown?.(e);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setContent(value);
      // 自動調整高度，但限制最大高度
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        const scrollHeight = textareaRef.current.scrollHeight;
        const maxHeight = isMobile ? 120 : 200; // 手機上限制更小的最大高度
        textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
      }
      // 如果 props 中有 onChange，也要調用它
      props.onChange?.(e);
    };

    // 處理中文輸入法
    const handleCompositionStart = () => {
      setIsComposing(true);
    };

    const handleCompositionEnd = () => {
      setIsComposing(false);
    };

    // 防止手機鍵盤彈出時的視窗問題
    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      if (isMobile) {
        // 延遲滾動，確保鍵盤完全彈出
        setTimeout(() => {
          e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
      props.onFocus?.(e);
    };

    return (
      <div className={cn(
        "flex gap-2 bg-background border-t border-border",
        isMobile ? "p-3" : "p-4"
      )}>
        <div className="flex-1 relative">
          <Textarea
            autoComplete="off"
            autoCorrect="on"
            autoCapitalize="sentences"
            spellCheck="true"
            inputMode="text"
            ref={mergedRef}
            name="message"
            value={content}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            onFocus={handleFocus}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={cn(
              // 基礎樣式
              "w-full rounded-lg resize-none transition-all duration-200",
              "bg-background text-sm placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              // 手機優化樣式
              isMobile 
                ? "min-h-12 px-4 py-3 pr-14 text-base" // 手機上使用 text-base 避免縮放
                : "min-h-12 px-4 py-3 pr-12 text-sm",
              // 邊框和陰影
              "border border-input hover:border-ring/50",
              "shadow-sm focus-visible:shadow-md",
              className
            )}
            style={{
              // 防止 iOS 縮放
              fontSize: isMobile ? '16px' : undefined,
            }}
            {...props}
          />
          
          {/* 發送按鈕 */}
          <Button
            type="button"
            size={isMobile ? "default" : "sm"}
            onClick={handleSend}
            disabled={disabled || !content.trim()}
            className={cn(
              "absolute bottom-1/2 translate-y-1/2 transition-all duration-200",
              "flex items-center justify-center", // 確保 icon 置中
              "right-2 h-8 w-8 p-0",
              "bg-primary text-primary-foreground hover:bg-primary/90",
              // 按鈕狀態樣式
              disabled || !content.trim()
                ? "opacity-50"
                : "hover:scale-105 active:scale-95"
            )}
            aria-label="發送訊息"
          >
            <Send className={isMobile ? "h-5 w-5" : "h-4 w-4"} />
          </Button>
        </div>
        
        {/* 提示文字 - 根據設備調整 */}
        <div className={cn(
          "text-xs text-muted-foreground self-center pb-2 transition-opacity duration-200",
          isMobile ? "hidden" : "hidden sm:block"
        )}>
          {isMobile ? "點擊發送" : "Enter 發送 • Shift+Enter 換行"}
        </div>
      </div>
    );
  }
);

MessageInput.displayName = "MessageInput";

export default MessageInput; 