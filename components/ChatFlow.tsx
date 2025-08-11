import React, { useState } from 'react';
import type { ChatSession, ChatMessage } from '../types';
import Header from './Header';
import ChatWindow from './ChatWindow';
import ChatInput from './ChatInput';
import FaqButtons from './FaqButtons';
import { Github } from 'lucide-react';

interface ChatFlowProps {
    session: ChatSession;
    onSendMessage: (message: string) => void;
    isLoading: boolean;
    error: string | null;
    isOnline: boolean;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    onNewChat: () => void;
    bibleVersion: string;
    onVersionChange: (version: string) => void;
    toggleSidebar: () => void;
    language: string;
    onLanguageChange: (lang: string) => void;
    onSaveMessage: (message: ChatMessage) => void;
    onGenerateDevotional: () => void;
    isGeneratingDevotional: boolean;
    t: any;
}

const XLogo = ({ className }: { className?: string }) => (
    <svg
      viewBox="0 0 1200 1227"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" />
    </svg>
);

const ChatFlow: React.FC<ChatFlowProps> = (props) => {
    const [inputValue, setInputValue] = useState<string>('');
    const { session, onSendMessage, isLoading, error, isOnline, t } = props;

    const handleSend = (message: string) => {
        onSendMessage(message);
        setInputValue('');
    };
    
    const handleFaqClick = (question: string) => {
        handleSend(question);
    };

    return (
        <>
            {!isOnline && (
                <div className="bg-red-600 text-white text-center p-1 text-sm font-semibold flex-shrink-0">
                    {t.offlineMessage}
                </div>
            )}
            <Header 
                theme={props.theme} 
                toggleTheme={props.toggleTheme} 
                onNewChat={props.onNewChat}
                bibleVersion={props.bibleVersion}
                onVersionChange={props.onVersionChange}
                toggleSidebar={props.toggleSidebar}
                language={props.language}
                onLanguageChange={props.onLanguageChange}
                onGenerateDevotional={props.onGenerateDevotional}
                isGeneratingDevotional={props.isGeneratingDevotional}
                t={t}
            />
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="max-w-4xl mx-auto h-full">
                    <ChatWindow 
                        messages={session.messages || []} 
                        isLoading={isLoading} 
                        onSaveMessage={props.onSaveMessage}
                        t={t}
                    />
                </div>
            </main>
            <footer className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="max-w-4xl mx-auto">
                    {session.messages.length === 1 && (
                        <FaqButtons 
                            questions={t.faqQuestions} 
                            title={t.faqTitle} 
                            onQuestionClick={handleFaqClick} 
                            isLoading={isLoading}
                        />
                    )}
                    {error && <p className="text-center text-red-500 mb-2">{error}</p>}
                    <ChatInput
                        onSendMessage={handleSend}
                        isLoading={isLoading}
                        value={inputValue}
                        setValue={setInputValue}
                        placeholder={t.askAQuestion}
                    />
                    <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3">
                        <p>
                            {t.footerDisclaimer} &bull;{' '}
                            <span className="text-gradient-vite font-semibold">
                                {t.footerAttribution}
                            </span>
                        </p>
                        <div className="flex justify-center items-center gap-6 mt-2">
                            <a
                                href="https://x.com/M1T4U"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Follow Zac Mitau on X"
                                className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                <XLogo className="w-3 h-3" />
                                <span>M1T4U</span>
                            </a>
                            <a
                                href="https://github.com/M1T4U"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Explore Zac Mitau's profile on GitHub"
                                className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                <Github className="w-3.5 h-3.5" />
                                <span>M1T4U</span>
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default ChatFlow;