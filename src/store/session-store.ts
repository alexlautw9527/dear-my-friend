import { create } from 'zustand';
import type { Session, SessionState, SessionOperations, Message } from '@/types';
import { STORAGE_KEYS } from '@/constants';

// 擴展的會話狀態介面，包含操作方法
interface SessionStoreState extends SessionState, SessionOperations {
  initialize: () => Promise<void>;
}

// 儲存和載入函數
const saveToStorage = (key: string, data: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`儲存 ${key} 失敗:`, error);
  }
};

const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (error) {
    console.error(`載入 ${key} 失敗:`, error);
    return defaultValue;
  }
};

// 組合時間戳 + 随機數確保 ID 唯一性，避免同時建立多個會話的衝突
const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// 生成預設會話標題
const generateDefaultTitle = (sessionNumber: number): string => {
  return `對話 ${sessionNumber}`;
};


export const useSessionStore = create<SessionStoreState>((set, get) => ({
  sessions: [],
  currentSessionId: null,
  isLoading: true,

  createSession: (title?: string) => {
    const state = get();
    const sessionNumber = state.sessions.length + 1;
    const newSession: Session = {
      id: generateId(),
      title: title || generateDefaultTitle(sessionNumber),
      messages: [],
      tutorialMessages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const updatedSessions = [...state.sessions, newSession];
    set({
      sessions: updatedSessions,
      currentSessionId: newSession.id,
    });

    // 儲存到 localStorage
    saveToStorage(STORAGE_KEYS.SESSIONS, updatedSessions);
    saveToStorage(STORAGE_KEYS.CURRENT_SESSION_ID, newSession.id);

    return newSession;
  },

  deleteSession: (sessionId: string) => {
    const state = get();
    const updatedSessions = state.sessions.filter(session => session.id !== sessionId);
    
    let newCurrentSessionId = state.currentSessionId;
    
    // 如果刪除的是當前會話，需要選擇新的當前會話
    if (state.currentSessionId === sessionId) {
      if (updatedSessions.length > 0) {
        // 選擇最後更新的會話作為新的當前會話
        const latestSession = updatedSessions.reduce((latest, session) => 
          session.updatedAt > latest.updatedAt ? session : latest
        );
        newCurrentSessionId = latestSession.id;
      } else {
        newCurrentSessionId = null;
      }
    }

    set({
      sessions: updatedSessions,
      currentSessionId: newCurrentSessionId,
    });

    // 儲存到 localStorage
    saveToStorage(STORAGE_KEYS.SESSIONS, updatedSessions);
    saveToStorage(STORAGE_KEYS.CURRENT_SESSION_ID, newCurrentSessionId);
  },

  renameSession: (sessionId: string, newTitle: string) => {
    const state = get();
    const updatedSessions = state.sessions.map(session =>
      session.id === sessionId
        ? { ...session, title: newTitle.trim(), updatedAt: Date.now() }
        : session
    );

    set({ sessions: updatedSessions });
    saveToStorage(STORAGE_KEYS.SESSIONS, updatedSessions);
  },

  switchToSession: (sessionId: string) => {
    const state = get();
    const sessionExists = state.sessions.some(session => session.id === sessionId);
    
    if (sessionExists) {
      set({ currentSessionId: sessionId });
      saveToStorage(STORAGE_KEYS.CURRENT_SESSION_ID, sessionId);
    } else {
      console.error(`會話 ${sessionId} 不存在`);
    }
  },

  getCurrentSession: () => {
    const state = get();
    if (!state.currentSessionId) return null;
    
    return state.sessions.find(session => session.id === state.currentSessionId) || null;
  },

  updateSessionMessages: (sessionId: string, messages: Message[], tutorialMessages: Message[]) => {
    const state = get();
    const updatedSessions = state.sessions.map(session =>
      session.id === sessionId
        ? { 
            ...session, 
            messages: [...messages],
            tutorialMessages: [...tutorialMessages],
            updatedAt: Date.now() 
          }
        : session
    );

    set({ sessions: updatedSessions });
    saveToStorage(STORAGE_KEYS.SESSIONS, updatedSessions);
  },

  initialize: async () => {
    try {
      const savedSessions = loadFromStorage<Session[]>(STORAGE_KEYS.SESSIONS, []);
      const savedCurrentSessionId = loadFromStorage<string | null>(STORAGE_KEYS.CURRENT_SESSION_ID, null);

      // 如果沒有會話，建立預設會話
      if (savedSessions.length === 0) {
        const defaultSession: Session = {
          id: generateId(),
          title: generateDefaultTitle(1),
          messages: [],
          tutorialMessages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        const sessions = [defaultSession];
        set({
          sessions,
          currentSessionId: defaultSession.id,
          isLoading: false,
        });

        // 儲存預設會話
        saveToStorage(STORAGE_KEYS.SESSIONS, sessions);
        saveToStorage(STORAGE_KEYS.CURRENT_SESSION_ID, defaultSession.id);
      } else {
        // 驗證當前會話 ID 是否有效
        const validCurrentSessionId = savedSessions.some(session => session.id === savedCurrentSessionId)
          ? savedCurrentSessionId
          : savedSessions[0]?.id || null;

        set({
          sessions: savedSessions,
          currentSessionId: validCurrentSessionId,
          isLoading: false,
        });

        // 如果當前會話 ID 無效，更新儲存
        if (validCurrentSessionId !== savedCurrentSessionId) {
          saveToStorage(STORAGE_KEYS.CURRENT_SESSION_ID, validCurrentSessionId);
        }
      }
    } catch (error) {
      console.error('會話初始化失敗:', error);
      
      // 發生錯誤時建立預設會話
      const defaultSession: Session = {
        id: generateId(),
        title: generateDefaultTitle(1),
        messages: [],
        tutorialMessages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      set({
        sessions: [defaultSession],
        currentSessionId: defaultSession.id,
        isLoading: false,
      });
    }
  },
}));