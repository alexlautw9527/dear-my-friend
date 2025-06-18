import * as React from 'react';
import { useState } from 'react';
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
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    
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
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
      // 如果 props 中有 onKeyDown，也要調用它
      props.onKeyDown?.(e);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setContent(value);
      // 自動調整高度
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
      // 如果 props 中有 onChange，也要調用它
      props.onChange?.(e);
    };

    return (
      <div className="flex gap-2 p-4 bg-background">
        <div className="flex-1 relative">
          <Textarea
            autoComplete="off"
            ref={mergedRef}
            name="message"
            value={content}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={cn(
              "min-h-12 px-4 py-3 bg-background text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 w-full rounded-md resize-none pr-12",
              className
            )}
            {...props}
          />
          {/* 發送按鈕 */}
          <Button
            size="sm"
            onClick={handleSend}
            disabled={disabled || !content.trim()}
            className="absolute right-2 bottom-2 h-8 w-8 p-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {/* 提示文字 */}
        <div className="text-xs text-muted-foreground self-center pb-2 hidden sm:block">
          Enter 發送 • Shift+Enter 換行
        </div>
      </div>
    );
  }
);

MessageInput.displayName = "MessageInput";

export default MessageInput; 