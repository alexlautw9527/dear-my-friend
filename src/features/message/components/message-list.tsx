import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { Message, ViewMode } from '@/types';
import MessageBubble from './message-bubble';

type MessageListProps = {
  messages: Message[];
  currentViewMode: ViewMode;
  onEditMessage?: (messageId: string) => void;
  onSaveEdit?: (messageId: string, newContent: string) => void;
  onCancelEdit?: (messageId: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  className?: string;
};

function MessageList({
  messages,
  currentViewMode,
  onEditMessage,
  onSaveEdit,
  onCancelEdit,
  onDeleteMessage,
  className,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // 自動捲動到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // 如果沒有訊息，顯示空狀態
  if (messages.length === 0) {
    return (
      <div className={cn('flex-1 flex items-center justify-center', className)}>
        <div className="text-center text-muted-foreground">
          <div className="text-2xl mb-2">💭</div>
          <p className="text-sm">開始您的內在對話</p>
          <p className="text-xs mt-1">以學徒的心態提出問題，然後切換至導師視角給予建議</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className={cn(
        'flex-1 overflow-y-auto p-4 space-y-2 scroll-smooth',
        'scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent',
        className
      )}
    >
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          currentViewMode={currentViewMode}
          onEdit={onEditMessage}
          onSaveEdit={onSaveEdit}
          onCancelEdit={onCancelEdit}
          onDelete={onDeleteMessage}
        />
      ))}
    </div>
  );
}

export default MessageList; 