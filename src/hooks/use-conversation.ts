import { useState, useEffect, useCallback } from 'react';
import type { Message, MessageRole } from '@/types';
import { MESSAGE_ROLE } from '@/types';
import { STORAGE_KEYS } from '@/constants';



const useConversation = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [tutorialMessages, setTutorialMessages] = useState<Message[]>([]);
  const [isTutorialMode, setIsTutorialMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 從 Local Storage 載入對話記錄
  useEffect(() => {
    const loadMessages = () => {
      try {
        // 載入一般對話記錄
        const savedMessages = localStorage.getItem(STORAGE_KEYS.CONVERSATION);
        if (savedMessages) {
          const parsedMessages = JSON.parse(savedMessages) as Message[];
          setMessages(parsedMessages);
        } else {
          setMessages([]);
        }

        // 載入教學對話記錄
        const savedTutorialMessages = localStorage.getItem(STORAGE_KEYS.TUTORIAL_CONVERSATION);
        if (savedTutorialMessages) {
          const parsedTutorialMessages = JSON.parse(savedTutorialMessages) as Message[];
          setTutorialMessages(parsedTutorialMessages);
        } else {
          setTutorialMessages([]);
        }
      } catch (error) {
        console.error('載入對話記錄失敗:', error);
        setMessages([]);
        setTutorialMessages([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, []);

  // 保存對話記錄到 Local Storage
  const saveMessages = useCallback((newMessages: Message[], isForTutorial: boolean = false) => {
    try {
      const storageKey = isForTutorial ? STORAGE_KEYS.TUTORIAL_CONVERSATION : STORAGE_KEYS.CONVERSATION;
      localStorage.setItem(storageKey, JSON.stringify(newMessages));
    } catch (error) {
      console.error('保存對話記錄失敗:', error);
    }
  }, []);

  // 切換到教學模式
  const switchToTutorialMode = useCallback(() => {
    setIsTutorialMode(true);
  }, []);

  // 切換到一般模式
  const switchToNormalMode = useCallback(() => {
    setIsTutorialMode(false);
  }, []);

  // 清空教學對話記錄
  const clearTutorialMessages = useCallback(() => {
    setTutorialMessages([]);
    saveMessages([], true);
  }, [saveMessages]);

  // 發送訊息
  const sendMessage = useCallback((content: string, role: MessageRole) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      role,
      timestamp: Date.now(),
    };
    
    if (isTutorialMode) {
      setTutorialMessages(prev => {
        const updatedMessages = [...prev, newMessage];
        saveMessages(updatedMessages, true);
        return updatedMessages;
      });
    } else {
      setMessages(prev => {
        const updatedMessages = [...prev, newMessage];
        saveMessages(updatedMessages, false);
        return updatedMessages;
      });
    }
  }, [saveMessages, isTutorialMode]);

  // 取得當前顯示的對話記錄
  const currentMessages = isTutorialMode ? tutorialMessages : messages;

  // 編輯訊息
  const editMessage = useCallback((messageId: string, newContent: string) => {
    if (isTutorialMode) {
      setTutorialMessages(prev => {
        const updatedMessages = prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, content: newContent.trim(), isEditing: false }
            : msg
        );
        saveMessages(updatedMessages, true);
        return updatedMessages;
      });
    } else {
      setMessages(prev => {
        const updatedMessages = prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, content: newContent.trim(), isEditing: false }
            : msg
        );
        saveMessages(updatedMessages, false);
        return updatedMessages;
      });
    }
  }, [saveMessages, isTutorialMode]);

  // 開始編輯訊息
  const startEditMessage = useCallback((messageId: string) => {
    if (isTutorialMode) {
      setTutorialMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, isEditing: true }
            : { ...msg, isEditing: false } // 確保只有一個訊息在編輯狀態
        )
      );
    } else {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, isEditing: true }
            : { ...msg, isEditing: false } // 確保只有一個訊息在編輯狀態
        )
      );
    }
  }, [isTutorialMode]);

  // 取消編輯訊息
  const cancelEditMessage = useCallback((messageId: string) => {
    if (isTutorialMode) {
      setTutorialMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, isEditing: false } : msg
        )
      );
    } else {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, isEditing: false } : msg
        )
      );
    }
  }, [isTutorialMode]);

  // 刪除訊息
  const deleteMessage = useCallback((messageId: string) => {
    if (isTutorialMode) {
      setTutorialMessages(prev => {
        const updatedMessages = prev.filter(msg => msg.id !== messageId);
        saveMessages(updatedMessages, true);
        return updatedMessages;
      });
    } else {
      setMessages(prev => {
        const updatedMessages = prev.filter(msg => msg.id !== messageId);
        saveMessages(updatedMessages, false);
        return updatedMessages;
      });
    }
  }, [saveMessages, isTutorialMode]);

  // 清空對話
  const clearMessages = useCallback(() => {
    if (isTutorialMode) {
      setTutorialMessages([]);
      saveMessages([], true);
    } else {
      setMessages([]);
      saveMessages([], false);
    }
  }, [saveMessages, isTutorialMode]);

  // 匯出對話
  const exportMessages = useCallback((format: 'markdown' | 'text' = 'markdown') => {
    const messagesToExport = isTutorialMode ? tutorialMessages : messages;
    
    if (messagesToExport.length === 0) {
      return '';
    }

    const formatDate = (timestamp: number) => {
      return new Date(timestamp).toLocaleString('zh-TW');
    };

    const modeLabel = isTutorialMode ? '教學模式' : '一般模式';

    if (format === 'markdown') {
      const content = messagesToExport.map(message => {
        const roleLabel = message.role === MESSAGE_ROLE.APPRENTICE ? '🧑‍🎓 學徒' : '🎓 導師';
        const time = formatDate(message.timestamp);
        return `## ${roleLabel} - ${time}\n\n${message.content}\n\n---\n`;
      }).join('\n');

      return `# Dear My Friend - 對話記錄 (${modeLabel})\n\n匯出時間: ${formatDate(Date.now())}\n\n${content}`;
    } else {
      // Text format
      const content = messagesToExport.map(message => {
        const roleLabel = message.role === MESSAGE_ROLE.APPRENTICE ? '[學徒]' : '[導師]';
        const time = formatDate(message.timestamp);
        return `${roleLabel} ${time}\n${message.content}\n\n`;
      }).join('');

      return `Dear My Friend - 對話記錄 (${modeLabel})\n匯出時間: ${formatDate(Date.now())}\n\n${content}`;
    }
  }, [messages, tutorialMessages, isTutorialMode]);

  return {
    messages: currentMessages,
    isLoading,
    isTutorialMode,
    sendMessage,
    editMessage,
    startEditMessage,
    cancelEditMessage,
    deleteMessage,
    clearMessages,
    clearTutorialMessages,
    exportMessages,
    switchToTutorialMode,
    switchToNormalMode,
  };
};

export default useConversation; 