import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Edit, Trash2 } from 'lucide-react';
import { UI_TEXT } from '@/constants';
import type { Session } from '@/types';

interface SessionItemProps {
  session: Session;
  isActive: boolean;
  onSelect: (sessionId: string) => void;
  onRename: (sessionId: string, newTitle: string) => void;
  onDelete: (sessionId: string) => void;
}

function SessionItem({ 
  session, 
  isActive, 
  onSelect, 
  onRename, 
  onDelete 
}: SessionItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(session.title);

  const handleRename = () => {
    if (editValue.trim() && editValue.trim() !== session.title) {
      onRename(session.id, editValue.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setEditValue(session.title);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm(UI_TEXT.CONFIRM_DELETE_SESSION)) {
      onDelete(session.id);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('zh-TW', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffDays === 1) {
      return '昨天';
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return date.toLocaleDateString('zh-TW', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    <div
      className={`
        group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors
        ${isActive 
          ? 'bg-primary/10 border border-primary/20' 
          : 'hover:bg-muted/50'
        }
      `}
      onClick={() => !isEditing && onSelect(session.id)}
    >
      {/* 會話圖示 */}
      <MessageSquare className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
      
      {/* 會話內容 */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleRename}
            onKeyDown={handleKeyDown}
            className="h-6 text-sm"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div>
            <p className={`text-sm font-medium truncate ${isActive ? 'text-primary' : 'text-foreground'}`}>
              {session.title}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDate(session.updatedAt)}
            </p>
          </div>
        )}
      </div>
      
      {/* 操作按鈕 */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          title={UI_TEXT.RENAME_SESSION}
        >
          <Edit className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            handleDelete();
          }}
          title={UI_TEXT.DELETE_SESSION}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

export default SessionItem;