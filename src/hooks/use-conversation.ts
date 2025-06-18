import { useState, useEffect, useCallback } from 'react';
import type { Message, MessageRole } from '@/types';
import { MESSAGE_ROLE } from '@/types';
import { STORAGE_KEYS } from '@/constants';

// 模擬資料
const DEFAULT_MESSAGES: Message[] = [
  {
    id: '1',
    content: '我最近在工作上遇到一個難題，覺得自己處理得不夠好，總是在同樣的問題上打轉，不知道該怎麼辦...',
    role: MESSAGE_ROLE.APPRENTICE,
    timestamp: Date.now() - 300000,
  },
  {
    id: '2',
    content: '聽起來你正面臨一個常見的挑戰。首先，能夠意識到自己在同樣問題上打轉，這本身就是一個重要的洞察。建議你可以嘗試跳出當下的情境，從更高的角度來審視這個問題。\n\n你能具體描述一下是什麼樣的問題嗎？',
    role: MESSAGE_ROLE.MENTOR,
    timestamp: Date.now() - 240000,
  },
  {
    id: '3',
    content: '主要是在專案管理上，我總是低估任務的複雜度，導致時程一再延遲，團隊成員也開始對我失去信心...',
    role: MESSAGE_ROLE.APPRENTICE,
    timestamp: Date.now() - 180000,
  },
];

const useConversation = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 從 Local Storage 載入對話記錄
  useEffect(() => {
    const loadMessages = () => {
      try {
        const savedMessages = localStorage.getItem(STORAGE_KEYS.CONVERSATION);
        if (savedMessages) {
          const parsedMessages = JSON.parse(savedMessages) as Message[];
          setMessages(parsedMessages);
        } else {
          // 如果沒有保存的資料，使用預設訊息
          setMessages(DEFAULT_MESSAGES);
        }
      } catch (error) {
        console.error('載入對話記錄失敗:', error);
        setMessages(DEFAULT_MESSAGES);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, []);

  // 保存對話記錄到 Local Storage
  const saveMessages = useCallback((newMessages: Message[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.CONVERSATION, JSON.stringify(newMessages));
    } catch (error) {
      console.error('保存對話記錄失敗:', error);
    }
  }, []);

  // 發送訊息
  const sendMessage = useCallback((content: string, role: MessageRole) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      role,
      timestamp: Date.now(),
    };
    
    setMessages(prev => {
      const updatedMessages = [...prev, newMessage];
      saveMessages(updatedMessages);
      return updatedMessages;
    });
  }, [saveMessages]);

  // 編輯訊息
  const editMessage = useCallback((messageId: string, newContent: string) => {
    setMessages(prev => {
      const updatedMessages = prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: newContent.trim(), isEditing: false }
          : msg
      );
      saveMessages(updatedMessages);
      return updatedMessages;
    });
  }, [saveMessages]);

  // 開始編輯訊息
  const startEditMessage = useCallback((messageId: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, isEditing: true }
          : { ...msg, isEditing: false } // 確保只有一個訊息在編輯狀態
      )
    );
  }, []);

  // 取消編輯訊息
  const cancelEditMessage = useCallback((messageId: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, isEditing: false } : msg
      )
    );
  }, []);

  // 刪除訊息
  const deleteMessage = useCallback((messageId: string) => {
    setMessages(prev => {
      const updatedMessages = prev.filter(msg => msg.id !== messageId);
      saveMessages(updatedMessages);
      return updatedMessages;
    });
  }, [saveMessages]);

  // 清空對話
  const clearMessages = useCallback(() => {
    setMessages([]);
    saveMessages([]);
  }, [saveMessages]);

  // 匯出對話
  const exportMessages = useCallback((format: 'markdown' | 'text' = 'markdown') => {
    if (messages.length === 0) {
      return '';
    }

    const formatDate = (timestamp: number) => {
      return new Date(timestamp).toLocaleString('zh-TW');
    };

    if (format === 'markdown') {
      const content = messages.map(message => {
        const roleLabel = message.role === MESSAGE_ROLE.APPRENTICE ? '🧑‍🎓 學徒' : '🎓 導師';
        const time = formatDate(message.timestamp);
        return `## ${roleLabel} - ${time}\n\n${message.content}\n\n---\n`;
      }).join('\n');

      return `# Dear My Friend - 對話記錄\n\n匯出時間: ${formatDate(Date.now())}\n\n${content}`;
    } else {
      // Text format
      const content = messages.map(message => {
        const roleLabel = message.role === MESSAGE_ROLE.APPRENTICE ? '[學徒]' : '[導師]';
        const time = formatDate(message.timestamp);
        return `${roleLabel} ${time}\n${message.content}\n\n`;
      }).join('');

      return `Dear My Friend - 對話記錄\n匯出時間: ${formatDate(Date.now())}\n\n${content}`;
    }
  }, [messages]);

  return {
    messages,
    isLoading,
    sendMessage,
    editMessage,
    startEditMessage,
    cancelEditMessage,
    deleteMessage,
    clearMessages,
    exportMessages,
  };
};

export default useConversation; 