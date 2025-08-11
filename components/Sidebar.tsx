import React from 'react';
import type { ChatSession } from '../types';
import { PlusCircle, MessageSquareText, Trash2, NotebookText, Sparkles } from 'lucide-react';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  currentView: 'chat' | 'study' | 'devotional';
  onSetView: (view: 'chat' | 'study' | 'devotional') => void;
  t: any;
}

const Sidebar: React.FC<SidebarProps> = ({ sessions, activeSessionId, onNewChat, onSelectSession, onDeleteSession, isOpen, setIsOpen, currentView, onSetView, t }) => {
  
  const NavButton = ({ view, label, icon: Icon }: { view: 'chat' | 'study' | 'devotional', label: string, icon: React.ElementType }) => (
    <button
        onClick={() => onSetView(view)}
        title={label}
        aria-label={label}
        className={`flex-1 p-2 flex flex-col items-center justify-center text-xs font-medium transition-colors duration-200 rounded-md ${currentView === view ? 'bg-gospel-cyan-500/20 text-gospel-glow' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200/70 dark:hover:bg-gray-800/70'}`}
    >
        <Icon className="w-5 h-5 mb-1" />
        {label}
    </button>
  );
  
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden" 
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        ></div>
      )}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-gray-100/80 dark:bg-gray-900/80 backdrop-blur-md border-r border-gray-200 dark:border-gray-800 flex flex-col transition-transform duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        <div className="p-3 border-b border-gray-200 dark:border-gray-800 space-y-3">
            <div className="flex items-center gap-2">
                <NavButton view="chat" label={t.chats} icon={MessageSquareText} />
                <NavButton view="study" label={t.myStudy} icon={NotebookText} />
                <NavButton view="devotional" label={t.devotionals} icon={Sparkles} />
            </div>
             <button
                onClick={() => {
                    onSetView('chat');
                    onNewChat();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gospel-cyan-600 rounded-lg hover:bg-gospel-cyan-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-gospel-cyan-500 shadow-md"
            >
                <PlusCircle size={18} />
                {t.newChat}
            </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.map(session => (
            <a
              key={session.id}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onSetView('chat');
                onSelectSession(session.id);
                if (window.innerWidth < 768) {
                    setIsOpen(false);
                }
              }}
              className={`group flex items-center justify-between p-3 rounded-md text-sm font-medium transition-colors duration-200 ${activeSessionId === session.id && currentView === 'chat' ? 'bg-gospel-cyan-500/20 text-gospel-cyan-600 dark:text-gospel-glow' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-gray-800/70'}`}
            >
              <div className="flex items-center gap-3 truncate">
                <MessageSquareText size={16} className="flex-shrink-0" />
                <span className="truncate">{session.title}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(session.id);
                }}
                className="p-1 rounded-md text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-500/10 transition-opacity"
                aria-label={`${t.deleteItemAria}: ${session.title}`}
              >
                <Trash2 size={16} />
              </button>
            </a>
          ))}
        </nav>
        
        <div className="p-4 text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800">
          {t.sidebarStoredLocally}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
