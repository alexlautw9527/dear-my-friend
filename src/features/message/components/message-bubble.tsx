import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Edit3, Trash2, Check, X } from 'lucide-react';
import type { Message, ViewMode } from '@/types';
import { VIEW_MODE, MESSAGE_ROLE } from '@/types';
import { UI_TEXT } from '@/constants';

type MessageBubbleProps = {
  message: Message;
  currentViewMode: ViewMode;
  onEdit?: (messageId: string) => void;
  onSaveEdit?: (messageId: string, newContent: string) => void;
  onCancelEdit?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  className?: string;
};

function MessageBubble({
  message,
  currentViewMode,
  onEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  className,
}: MessageBubbleProps) {
  const [editContent, setEditContent] = useState(message.content);

  // 判斷是否為自己的訊息（當前視角的訊息）
  const isOwnMessage = 
    (currentViewMode === VIEW_MODE.APPRENTICE && message.role === MESSAGE_ROLE.APPRENTICE) ||
    (currentViewMode === VIEW_MODE.MENTOR && message.role === MESSAGE_ROLE.MENTOR);

  // 格式化時間
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 取得角色標籤
  const getRoleLabel = (role: string) => {
    return role === MESSAGE_ROLE.APPRENTICE ? UI_TEXT.APPRENTICE_LABEL : UI_TEXT.MENTOR_LABEL;
  };

  // 根據角色和是否為自己的訊息決定顏色方案
  const getMessageStyling = () => {
    if (isOwnMessage) {
      // 自己的訊息：無論是導師還是學徒，都使用 primary 色系
      return {
        badgeVariant: 'default' as const,
        cardClasses: 'bg-primary text-primary-foreground ml-4'
      };
    } else {
      // 別人的訊息：在當前視角下，對方的 badge 應該是 secondary
      return {
        badgeVariant: 'secondary' as const,
        cardClasses: 'bg-muted mr-4'
      };
    }
  };

  const styling = getMessageStyling();

  // 處理開始編輯
  const handleStartEdit = () => {
    setEditContent(message.content);
    onEdit?.(message.id);
  };

  // 處理保存編輯
  const handleSaveEdit = () => {
    if (editContent.trim() && editContent.trim() !== message.content) {
      onSaveEdit?.(message.id, editContent.trim());
    } else {
      onCancelEdit?.(message.id);
    }
  };

  // 處理取消編輯
  const handleCancelEdit = () => {
    setEditContent(message.content);
    onCancelEdit?.(message.id);
  };

  // 處理鍵盤快捷鍵
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  return (
    <div
      className={cn(
        'flex w-full mb-4 group',
        isOwnMessage ? 'justify-end' : 'justify-start',
        className
      )}
    >
      <div className={cn('flex flex-col max-w-[70%]', isOwnMessage ? 'items-end' : 'items-start')}>
        {/* 角色標籤和時間 */}
        <div className={cn('flex items-center gap-2 mb-1', isOwnMessage ? 'flex-row-reverse' : 'flex-row')}>
          <Badge variant={styling.badgeVariant}>
            {getRoleLabel(message.role)}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatTime(message.timestamp)}
          </span>
        </div>

        {/* 訊息內容 */}
        <Card
          className={cn(
            'p-3 relative transition-all duration-200',
            styling.cardClasses,
            'hover:shadow-md',
            message.isEditing && 'ring-2 ring-primary'
          )}
        >
          {message.isEditing ? (
            // 編輯模式
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className={cn(
                  'text-sm leading-relaxed resize-none',
                  isOwnMessage 
                    ? 'bg-primary-foreground text-primary border-primary-foreground' 
                    : 'bg-background text-foreground'
                )}
                autoFocus
              />
              <div className="flex gap-1 justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 px-2 bg-background text-foreground"
                  onClick={handleSaveEdit}
                  disabled={!editContent.trim()}
                >
                  <Check className="h-3 w-3 mr-1" />
                  保存
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 px-2 bg-background text-foreground"
                  onClick={handleCancelEdit}
                >
                  <X className="h-3 w-3 mr-1" />
                  取消
                </Button>
              </div>
            </div>
          ) : (
            // 顯示模式
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          )}

          {/* 編輯和刪除按鈕（只在非編輯模式下顯示） */}
          {!message.isEditing && (
            <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="flex gap-1">
                {onEdit && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 w-6 p-0 bg-background text-foreground shadow-lg border-2 border-border hover:bg-foreground hover:text-background hover:border-foreground"
                    onClick={handleStartEdit}
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 w-6 p-0 bg-background text-foreground shadow-lg border-2 border-border hover:bg-red-100 hover:text-red-600 hover:border-red-200"
                    onClick={() => onDelete(message.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default MessageBubble; 