import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { Chat } from '@google/genai';
import { startChat, generateTitle, generateDevotional, enrichStudyItem, isAiReady } from './services/geminiService';
import { getHistory, saveHistory, getStudyItems, saveStudyItems, getDevotionals, saveDevotionals, getUserId } from './services/storageService';
import type { ChatMessage, ChatSession, SavedItem, Devotional } from './types';
import { getSystemInstruction, BIBLE_VERSIONS } from './constants';
import { translations } from './translations';

import Sidebar from './components/Sidebar';
import ChatFlow from './components/ChatFlow';
import StudyView from './components/StudyView';
import DevotionalView from './components/DevotionalView';
import SaveModal from './components/SaveModal';
import Notification from './components/Notification';
import { XCircle } from 'lucide-react';

type View = 'chat' | 'study' | 'devotional';

const App: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [chatInstances, setChatInstances] = useState<Record<string, Chat>>({});
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGeneratingDevotional, setIsGeneratingDevotional] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  
  const [currentView, setCurrentView] = useState<View>('chat');
  const [studyItems, setStudyItems] = useState<SavedItem[]>([]);
  const [devotionals, setDevotionals] = useState<Devotional[]>([]);
  const [modalData, setModalData] = useState<{message: ChatMessage; session: ChatSession} | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'info' | 'success' | 'error' } | null>(null);
  const notificationTimerRef = useRef<number | null>(null);
  const [isAiAvailable, setIsAiAvailable] = useState<boolean>(true);

  const showNotification = (notif: { message: string; type: 'info' | 'success' | 'error' }) => {
    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
    }
    setNotification(notif);
    notificationTimerRef.current = window.setTimeout(() => {
      setNotification(null);
      notificationTimerRef.current = null;
    }, 5000); // Disappears after 5 seconds
  };

  useEffect(() => {
    if (!isAiReady()) {
      setIsAiAvailable(false);
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current);
    };
  }, []);
  
  const getInitialLanguage = (): string => {
    const storedLang = typeof window !== 'undefined' ? window.localStorage.getItem('app-language') : null;
    if (storedLang && translations[storedLang as keyof typeof translations]) return storedLang;
    const browserLang = typeof window !== 'undefined' ? navigator.language.split('-')[0] : 'en';
    return translations[browserLang as keyof typeof translations] ? browserLang : 'en';
  };

  const [language, setLanguage] = useState<string>(getInitialLanguage);

  useEffect(() => {
    try {
        window.localStorage.setItem('app-language', language);
    } catch(e) { console.error("Could not save language to localStorage:", e); }
  }, [language]);

  const t = useMemo(() => translations[language as keyof typeof translations] || translations.en, [language]);

  const getInitialItem = <T extends string>(key: string, options: readonly T[], fallback: T): T => {
    const storedPref = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
    return storedPref && options.includes(storedPref as T) ? storedPref as T : fallback;
  };
  
  const getInitialTheme = (): 'light' | 'dark' => {
    const storedPrefs = typeof window !== 'undefined' ? window.localStorage.getItem('color-theme') : null;
    if (storedPrefs === 'light' || storedPrefs === 'dark') return storedPrefs;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  };

  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);
  const [bibleVersion, setBibleVersion] = useState<string>(() => getInitialItem('bible-version', BIBLE_VERSIONS, 'NIV'));

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    try {
      window.localStorage.setItem('color-theme', theme);
    } catch (e) { console.error("Could not save theme to localStorage:", e); }
  }, [theme]);
  
  useEffect(() => {
    try {
        window.localStorage.setItem('bible-version', bibleVersion);
    } catch (e) { console.error("Could not save bible version to localStorage:", e); }
  }, [bibleVersion]);

  const toggleTheme = () => setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));

  const activeSession = useMemo(() => sessions.find(s => s.id === activeSessionId) || null, [sessions, activeSessionId]);

  const handleNewChat = useCallback(() => {
    const newSessionId = Date.now().toString();
    const newSession: ChatSession = {
      id: newSessionId,
      title: t.newChat,
      messages: [{ role: 'model', content: t.initialMessage, id: `initial-${newSessionId}` }],
      bibleVersion: bibleVersion,
      language: language,
      createdAt: Date.now(),
    };
    
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setError(null);
    setCurrentView('chat');
    if (window.innerWidth < 768) setSidebarOpen(false);
  }, [bibleVersion, language, t]);

  useEffect(() => {
    if (!isAiAvailable) return;
    const loadedSessions = getHistory();
    if (loadedSessions.length > 0) {
      setSessions(loadedSessions);
      setActiveSessionId(loadedSessions[0].id);
    } else {
      handleNewChat();
    }
    setStudyItems(getStudyItems());
    setDevotionals(getDevotionals());
  }, [handleNewChat, isAiAvailable]);

  useEffect(() => { if (sessions.length > 0) saveHistory(sessions); }, [sessions]);
  useEffect(() => { saveStudyItems(studyItems); }, [studyItems]);
  useEffect(() => { saveDevotionals(devotionals); }, [devotionals]);
  
  useEffect(() => {
    if (activeSessionId && !chatInstances[activeSessionId] && activeSession && isAiAvailable) {
      const newChatInstance = startChat(getSystemInstruction(activeSession.bibleVersion, activeSession.language));
      setChatInstances(prev => ({ ...prev, [activeSessionId]: newChatInstance }));
    }
  }, [activeSessionId, sessions, chatInstances, activeSession, isAiAvailable]);


  const handleSelectSession = (id: string) => {
    if (activeSessionId !== id) {
      setActiveSessionId(id);
      setError(null);
      setIsLoading(false);
    }
  };

  const handleDeleteSession = (id: string) => {
    const sessionToDelete = sessions.find(s => s.id === id);
    if (!sessionToDelete || !window.confirm(`${t.deleteConfirmation} "${sessionToDelete.title}"?`)) return;
    
    const remainingSessions = sessions.filter(s => s.id !== id);
    setSessions(remainingSessions);
    
    setChatInstances(prev => {
        const newInstances = { ...prev };
        delete newInstances[id];
        return newInstances;
    });

    if (activeSessionId === id) {
      setActiveSessionId(remainingSessions.length > 0 ? remainingSessions[0].id : null);
      if(remainingSessions.length === 0) handleNewChat();
    }
  };

  const handleSendMessage = useCallback(async (messageText: string) => {
    if (!isOnline) { setError(t.offlineMessage); return; }
    if (!activeSessionId || !messageText.trim() || !activeSession) return;

    setIsLoading(true);
    setError(null);

    let chat = chatInstances[activeSessionId];

    // If chat instance doesn't exist, create it now. This handles race conditions
    // where a user sends a message before the useEffect for chat creation has finished.
    if (!chat) {
        const newChatInstance = startChat(getSystemInstruction(activeSession.bibleVersion, activeSession.language));
        if (newChatInstance) {
            setChatInstances(prev => {
                const newInstances = { ...prev, [activeSessionId]: newChatInstance };
                return newInstances;
            });
            chat = newChatInstance;
        } else {
            // This case typically happens if the API key is missing/invalid.
            setError(t.chatInitFailed);
            setIsLoading(false);
            return;
        }
    }
    
    const userMessage: ChatMessage = { role: 'user', content: messageText, id: Date.now().toString() };
    const isFirstUserMessage = activeSession.messages.filter(m => m.role === 'user').length === 0;

    setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: [...s.messages, userMessage] } : s));
    
    if (isFirstUserMessage) {
        generateTitle(messageText, activeSession.language).then(title => {
            setSessions(prev => prev.map(s => s.id === activeSessionId ? {...s, title: title || t.newChat } : s));
        });
    }

    const modelMessageId = (Date.now() + 1).toString();
    setSessions(prev =>
      prev.map(s => s.id === activeSessionId ? { ...s, messages: [...s.messages, { role: 'model', content: '', id: modelMessageId }] } : s)
    );

    try {
      const stream = await chat.sendMessageStream({ message: messageText });
      let fullResponse = '';
      for await (const chunk of stream) {
        fullResponse += chunk.text;
        // Clean up excessive newlines to prevent large gaps in rendering.
        // This replaces any sequence of 3 or more newlines with just two.
        const cleanedResponse = fullResponse.replace(/\n{3,}/g, '\n\n');
        setSessions(prev =>
          prev.map(s => s.id !== activeSessionId ? s : { ...s, messages: s.messages.map(msg => msg.id === modelMessageId ? { ...msg, content: cleanedResponse } : msg) }
        ));
      }
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An error occurred.';
      setError(`Error: ${errorMessage}`);
      setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: s.messages.filter(msg => msg.id !== modelMessageId) } : s));
    } finally {
      setIsLoading(false);
    }
  }, [activeSessionId, activeSession, chatInstances, isOnline, t]);

  const handleSaveMessage = (message: ChatMessage) => {
    if (activeSession) {
        setModalData({ message, session: activeSession });
    }
  };

  const handleSaveStudyItem = async (message: ChatMessage, session: ChatSession, note: string) => {
    setModalData(null);

    if (!isOnline) {
      const newItem: SavedItem = {
        id: `study-${Date.now()}`, message, note, savedAt: Date.now(), sessionId: session.id, sessionTitle: session.title,
      };
      setStudyItems(prev => [newItem, ...prev]);
      showNotification({ message: t.itemSaved, type: 'success' });
      showNotification({ message: t.enrichmentOffline, type: 'info' });
      return;
    }

    const tempId = `study-${Date.now()}`;
    const newItem: SavedItem = {
      id: tempId, message, note, savedAt: Date.now(), sessionId: session.id, sessionTitle: session.title,
      isEnriching: true,
    };
    setStudyItems(prev => [newItem, ...prev]);
    showNotification({ message: t.enrichingStudyItem, type: 'info' });

    try {
      const enrichedData = await enrichStudyItem(message.content, session.bibleVersion, session.language);
      // Clean up excessive newlines from enriched content
      const cleanedEnrichedData = {
          ...enrichedData,
          aiReflection: (enrichedData.aiReflection || '').replace(/\n{3,}/g, '\n\n'),
          crossReferences: (enrichedData.crossReferences || []).map(cr => ({
              ...cr,
              text: (cr.text || '').replace(/\n{3,}/g, '\n\n')
          }))
      };

      setStudyItems(prev => prev.map(item =>
          item.id === tempId ? { ...item, ...cleanedEnrichedData, isEnriching: false } : item
      ));
      showNotification({ message: t.itemEnriched, type: 'success' });
    } catch (e) {
      console.error("Failed to enrich study item:", e);
      setStudyItems(prev => prev.map(item =>
          item.id === tempId ? { ...item, isEnriching: false } : item
      ));
      const errorMessage = e instanceof Error ? e.message : 'Could not enrich item.';
      showNotification({ message: `${t.itemSaved}. ${t.enrichmentFailed}: ${errorMessage}`, type: 'error' });
    }
  };
  
  const handleDeleteStudyItem = (id: string) => {
      if(window.confirm(`${t.deleteConfirmation} this saved item?`)) {
          setStudyItems(prev => prev.filter(item => item.id !== id));
      }
  };

  const handleGenerateDevotional = async () => {
    if (!isOnline) {
      showNotification({ message: t.offlineMessage, type: 'error' });
      return;
    }

    const today = new Date();
    const dayId = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const existingDevotional = devotionals.find(d => d.dayId === dayId);
    if (existingDevotional) {
      showNotification({ message: t.devotionalExists, type: 'info' });
      return;
    }

    setIsGeneratingDevotional(true);
    showNotification({ message: t.generatingDevotional, type: 'info' });
    try {
      const userId = getUserId();
      const dailySeed = `${userId}-${dayId}`;
      const devotionalContent = await generateDevotional(language, dailySeed);
      
      // Clean up excessive newlines from devotional content
      const newDevotional: Devotional = {
        id: `devo-${Date.now()}`,
        dayId: dayId,
        date: today.toISOString(),
        reading: {
          reference: devotionalContent.reading.reference,
          text: (devotionalContent.reading.text || '').replace(/\n{3,}/g, '\n\n'),
        },
        reflection: (devotionalContent.reflection || '').replace(/\n{3,}/g, '\n\n'),
        prayer: (devotionalContent.prayer || '').replace(/\n{3,}/g, '\n\n'),
      };

      setDevotionals(prev => [newDevotional, ...prev]);
      showNotification({ message: t.devotionalReady, type: 'success' });
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'Could not generate devotional.';
      showNotification({ message: `Error: ${errorMessage}`, type: 'error' });
    } finally {
      setIsGeneratingDevotional(false);
    }
  };
  
  const handleDeleteDevotional = (id: string) => {
    if(window.confirm(`${t.deleteConfirmation} this devotional?`)) {
        setDevotionals(prev => prev.filter(devo => devo.id !== id));
    }
  };
  
  const handleViewChat = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setCurrentView('chat');
  };

  if (!isAiAvailable) {
      return (
          <div className="flex h-screen items-center justify-center bg-gray-100 dark:bg-slate-950 p-4">
              <div className="w-full max-w-md text-center p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-2xl border border-red-500/30">
                  <XCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
                  <h1 className="text-2xl font-bold text-red-500 mb-2">Configuration Error</h1>
                  <p className="text-gray-700 dark:text-gray-300 mb-6">
                      The Bible Expert AI service could not be initialized.
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-left">
                      <p className="font-semibold text-gray-800 dark:text-gray-200">What happened?</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          The application could not find the required 
                          <code className="bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 font-mono text-xs p-1 rounded-md mx-1">API_KEY</code>. 
                          This is necessary to connect to the AI service.
                      </p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200 mt-4">How to fix it?</p>
                       <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Please ensure that the <code className="bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 font-mono text-xs p-1 rounded-md mx-1">API_KEY</code> environment variable is correctly set up in your hosting environment.
                      </p>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="flex h-screen bg-transparent text-gray-800 dark:text-stone-200 transition-colors duration-300">
        <Sidebar
            sessions={sessions}
            activeSessionId={activeSessionId}
            onNewChat={handleNewChat}
            onSelectSession={handleSelectSession}
            onDeleteSession={handleDeleteSession}
            isOpen={isSidebarOpen}
            setIsOpen={setSidebarOpen}
            currentView={currentView}
            onSetView={setCurrentView}
            t={t}
        />
        <div className="flex flex-col flex-1 h-screen overflow-hidden">
            {currentView === 'chat' && activeSession && (
                <ChatFlow 
                    session={activeSession}
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                    error={error}
                    isOnline={isOnline}
                    theme={theme}
                    toggleTheme={toggleTheme}
                    onNewChat={handleNewChat}
                    bibleVersion={bibleVersion}
                    onVersionChange={setBibleVersion}
                    toggleSidebar={() => setSidebarOpen(p => !p)}
                    language={language}
                    onLanguageChange={setLanguage}
                    onSaveMessage={handleSaveMessage}
                    onGenerateDevotional={handleGenerateDevotional}
                    isGeneratingDevotional={isGeneratingDevotional}
                    t={t}
                />
            )}
            {currentView === 'study' && (
                <StudyView
                    items={studyItems}
                    onDelete={handleDeleteStudyItem}
                    onViewChat={handleViewChat}
                    toggleSidebar={() => setSidebarOpen(p => !p)}
                    t={t}
                />
            )}
            {currentView === 'devotional' && (
                <DevotionalView
                    devotionals={devotionals}
                    onDelete={handleDeleteDevotional}
                    toggleSidebar={() => setSidebarOpen(p => !p)}
                    t={t}
                />
            )}
        </div>
        {modalData && (
            <SaveModal
                messageToSave={modalData.message}
                session={modalData.session}
                onClose={() => setModalData(null)}
                onSave={handleSaveStudyItem}
                t={t}
            />
        )}
        {notification && (
          <Notification 
            message={notification.message}
            type={notification.type}
          />
        )}
    </div>
  );
};

export default App;