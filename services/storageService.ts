import type { ChatSession, SavedItem, Devotional } from '../types';

const HISTORY_KEY = 'bible-expert-ai-history';
const STUDY_KEY = 'bible-expert-ai-study';
const DEVOTIONALS_KEY = 'bible-expert-ai-devotionals';
const USER_ID_KEY = 'bible-expert-ai-user-id';

// --- Chat History ---
export const getHistory = (): ChatSession[] => {
  try {
    const rawHistory = window.localStorage.getItem(HISTORY_KEY);
    if (rawHistory) {
      const parsed = JSON.parse(rawHistory) as ChatSession[];
      return parsed.sort((a, b) => b.createdAt - a.createdAt);
    }
  } catch (error) {
    console.error("Failed to load chat history:", error);
  }
  return [];
};

export const saveHistory = (sessions: ChatSession[]): void => {
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error("Failed to save chat history:", error);
  }
};

// --- Study Items ---
export const getStudyItems = (): SavedItem[] => {
    try {
        const rawItems = window.localStorage.getItem(STUDY_KEY);
        if(rawItems) {
            const parsed = JSON.parse(rawItems) as SavedItem[];
            return parsed.sort((a, b) => b.savedAt - a.savedAt);
        }
    } catch(error) {
        console.error("Failed to load study items:", error);
    }
    return [];
};

export const saveStudyItems = (items: SavedItem[]): void => {
    try {
        window.localStorage.setItem(STUDY_KEY, JSON.stringify(items));
    } catch(error) {
        console.error("Failed to save study items:", error);
    }
};

// --- Devotionals ---
export const getDevotionals = (): Devotional[] => {
    try {
        const rawDevotionals = window.localStorage.getItem(DEVOTIONALS_KEY);
        if(rawDevotionals) {
            const parsed = JSON.parse(rawDevotionals) as Devotional[];
            return parsed.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }
    } catch(error) {
        console.error("Failed to load devotionals:", error);
    }
    return [];
};

export const saveDevotionals = (devotionals: Devotional[]): void => {
    try {
        window.localStorage.setItem(DEVOTIONALS_KEY, JSON.stringify(devotionals));
    } catch(error) {
        console.error("Failed to save devotionals:", error);
    }
};

// --- User ID ---
export const getUserId = (): string => {
    try {
        let userId = window.localStorage.getItem(USER_ID_KEY);
        if (!userId) {
            userId = crypto.randomUUID();
            window.localStorage.setItem(USER_ID_KEY, userId);
        }
        return userId;
    } catch (error) {
        console.error("Failed to manage user ID:", error);
        // Fallback for older browsers or non-secure contexts
        return 'anonymous-user-' + Date.now();
    }
};