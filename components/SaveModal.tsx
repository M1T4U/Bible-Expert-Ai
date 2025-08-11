import React, { useState } from 'react';
import type { ChatMessage, ChatSession } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface SaveModalProps {
    messageToSave: ChatMessage;
    session: ChatSession;
    onClose: () => void;
    onSave: (message: ChatMessage, session: ChatSession, note: string) => void;
    t: any;
}

const SaveModal: React.FC<SaveModalProps> = ({ messageToSave, session, onClose, onSave, t }) => {
    const [note, setNote] = useState('');

    const handleSave = () => {
        onSave(messageToSave, session, note);
    };

    return (
        <div 
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-stone-200">{t.saveToStudy}</h2>
                </div>
                <div className="p-6 flex-1 overflow-y-auto">
                    <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                        <div className="prose dark:prose-invert max-w-none font-serif text-sm">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{messageToSave.content}</ReactMarkdown>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="note-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                           {t.addANote}
                        </label>
                        <textarea
                            id="note-input"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gospel-cyan-500 transition duration-200 font-serif"
                            placeholder={t.addANote}
                        ></textarea>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                        {t.cancel}
                    </button>
                    <button 
                        onClick={handleSave}
                        className="px-6 py-2 text-sm font-semibold text-white bg-gospel-cyan-600 hover:bg-gospel-cyan-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gospel-cyan-500"
                    >
                        {t.save}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SaveModal;
