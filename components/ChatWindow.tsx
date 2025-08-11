import React, { useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';
import Message from './Message';

interface ChatWindowProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSaveMessage: (message: ChatMessage) => void;
  t: any;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, onSaveMessage, t }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="space-y-6">
      {messages.map((msg, index) => (
        <Message
          key={msg.id}
          message={msg}
          isStreaming={msg.role === 'model' && index === messages.length - 1 && isLoading}
          onSave={onSaveMessage}
          t={t}
        />
      ))}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default ChatWindow;