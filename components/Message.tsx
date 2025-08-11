import React, { useState, useEffect } from 'react';
import type { ChatMessage } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bookmark } from 'lucide-react';

interface MessageProps {
  message: ChatMessage;
  isStreaming?: boolean;
  onSave: (message: ChatMessage) => void;
  t: any;
}

const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
);

const BotIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
);


const Message: React.FC<MessageProps> = ({ message, isStreaming, onSave, t }) => {
  const isUser = message.role === 'user';
  const isModel = message.role === 'model';
  const isThinking = isModel && message.content === '' && isStreaming;
  const isInitialMessage = message.id.startsWith('initial-');

  // Initialize state correctly: empty for initial message, full for others.
  const [displayedContent, setDisplayedContent] = useState(isInitialMessage ? '' : message.content);

  useEffect(() => {
    // Handle the real-time typing animation for the initial message
    if (isInitialMessage) {
      let i = 0;
      const timer = setInterval(() => {
        i++;
        setDisplayedContent(message.content.substring(0, i));
        if (i >= message.content.length) {
          clearInterval(timer);
        }
      }, 25);

      return () => clearInterval(timer);
    } else {
      // For all other messages (user, regular model responses, streaming updates),
      // update content directly. This is crucial for streaming.
      setDisplayedContent(message.content);
    }
  }, [message.content, message.id, isInitialMessage]);


  return (
    <div className={`flex items-start gap-4 ${isUser ? 'justify-end' : ''}`}>
      {isModel && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gospel-cyan-600 text-white flex items-center justify-center">
          <BotIcon className="w-5 h-5" />
        </div>
      )}

      <div className={`group relative max-w-xl`}>
          <div className={`relative rounded-2xl p-4 ${isUser ? 'bg-gospel-cyan-700 rounded-br-lg' : 'bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-bl-lg'}`}>
            {isModel ? (
                <div className="prose dark:prose-invert max-w-none font-serif whitespace-pre-wrap highlight-verse">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {displayedContent}
                    </ReactMarkdown>
                    {/* Typing cursor for initial message */}
                    {isInitialMessage && displayedContent.length < message.content.length && <span className="inline-block w-2 h-4 bg-gospel-glow animate-pulse ml-1" aria-label="typing..."></span>}
                    {/* Typing cursor for streaming response */}
                    {isStreaming && message.content.length > 0 && <span className="inline-block w-2 h-4 bg-gospel-glow animate-pulse ml-1" aria-label="typing..."></span>}
                    {isThinking && (
                        <div className="flex items-center space-x-1">
                            <span className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                            <span className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                            <span className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-pulse"></span>
                        </div>
                    )}
                </div>
            ) : (
                <div className="prose prose-invert max-w-none font-serif whitespace-pre-wrap">
                    {message.content}
                </div>
            )}
          </div>
          {isModel && !isThinking && !isStreaming && message.content.length > 0 && (
            <div className="absolute -top-2 -right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button 
                    onClick={() => onSave(message)}
                    title={t.saveToStudy}
                    aria-label={t.saveItemAria}
                    className="p-1.5 rounded-full bg-gospel-cyan-500/50 hover:bg-gospel-cyan-500 text-white backdrop-blur-sm shadow-lg transition-all hover:scale-110"
                >
                    <Bookmark size={14}/>
                </button>
            </div>
          )}
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-500 dark:bg-gray-600 text-gray-300 dark:text-gray-200 flex items-center justify-center">
          <UserIcon className="w-5 h-5" />
        </div>
      )}
    </div>
  );
};

export default Message;