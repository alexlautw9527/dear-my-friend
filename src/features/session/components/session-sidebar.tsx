import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { UI_TEXT } from '@/constants';
import { useAppState } from '@/store/use-app-state';
import SessionItem from './session-item';

interface SessionSidebarProps {
  className?: string;
  onClose?: () => void;
  showCloseButton?: boolean;
}

function SessionSidebar({ className = '', onClose, showCloseButton = false }: SessionSidebarProps) {
  const {
    sessions,
    currentSessionId,
    createSession,
    deleteSession,
    renameSession,
    switchToSession,
  } = useAppState();

  const handleCreateSession = () => {
    createSession();
  };

  const handleSelectSession = (sessionId: string) => {
    if (sessionId !== currentSessionId) {
      switchToSession(sessionId);
    }
  };

  const handleRenameSession = (sessionId: string, newTitle: string) => {
    renameSession(sessionId, newTitle);
  };

  const handleDeleteSession = (sessionId: string) => {
    // 確保至少保留一個會話
    if (sessions.length <= 1) {
      alert('至少需要保留一個對話');
      return;
    }
    deleteSession(sessionId);
  };

  return (
    <div className={`flex flex-col h-full bg-background border-r ${className}`}>
      {/* 標題 */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{UI_TEXT.SESSION_LIST}</h2>
          {showCloseButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* 會話列表 */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          {sessions.map((session) => (
            <SessionItem
              key={session.id}
              session={session}
              isActive={session.id === currentSessionId}
              onSelect={handleSelectSession}
              onRename={handleRenameSession}
              onDelete={handleDeleteSession}
            />
          ))}
        </div>
      </div>

      {/* 新增對話按鈕 */}
      <div className="p-4 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCreateSession}
          className="w-full flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {UI_TEXT.NEW_SESSION}
        </Button>
      </div>
    </div>
  );
}

export default SessionSidebar;