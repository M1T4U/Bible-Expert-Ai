import React from 'react';
import type { SavedItem } from '../types';
import { Menu, Trash2, ArrowRight, Tags, Lightbulb, BookText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface StudyViewProps {
  items: SavedItem[];
  onDelete: (id: string) => void;
  onViewChat: (sessionId: string) => void;
  toggleSidebar: () => void;
  t: any;
}

const StudyView: React.FC<StudyViewProps> = ({ items, onDelete, onViewChat, toggleSidebar, t }) => {
  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gospel-cyan-500 md:hidden"
                aria-label={t.openSidebarAria}
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold tracking-tight text-gray-800 dark:text-stone-200">{t.myStudy}</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {items.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 dark:text-gray-400">{t.noStudyItems}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => (
                <div key={item.id} className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-sm transition-shadow hover:shadow-md flex flex-col">
                  <div className="p-4">
                    <div className="prose dark:prose-invert max-w-none font-serif text-sm highlight-verse">
                         <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.message.content}</ReactMarkdown>
                    </div>

                    {item.note && (
                        <div className="mt-4 pt-4 border-t border-dashed border-gray-300 dark:border-gray-600">
                             <p className="font-serif italic text-gray-600 dark:text-gray-300">"{item.note}"</p>
                        </div>
                    )}
                  </div>

                  {item.isEnriching && (
                    <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 text-center">
                        <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            <span>{t.enrichingStudyItem}</span>
                        </div>
                    </div>
                  )}

                  {(item.keywords && item.keywords.length > 0) && (
                    <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            <Tags size={16} className="text-gospel-cyan-500" />
                            {t.keywords}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {item.keywords.map(kw => (
                                <span key={kw} className="px-2.5 py-1 bg-gospel-cyan-500/10 text-gospel-cyan-700 dark:bg-gospel-glow/20 dark:text-gospel-glow rounded-full text-xs font-medium">
                                    {kw}
                                </span>
                            ))}
                        </div>
                    </div>
                  )}

                  {item.aiReflection && (
                     <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            <Lightbulb size={16} className="text-gospel-cyan-500" />
                            {t.deeperReflection}
                        </h4>
                        <p className="font-serif text-sm text-gray-600 dark:text-gray-400 italic">"{item.aiReflection}"</p>
                    </div>
                  )}
                  
                  {(item.crossReferences && item.crossReferences.length > 0) && (
                    <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            <BookText size={16} className="text-gospel-cyan-500" />
                            {t.relatedVerses}
                        </h4>
                        <div className="space-y-3 font-serif text-sm">
                            {item.crossReferences.map(cr => (
                                <div key={cr.reference}>
                                     <p>
                                        <strong className="text-gray-800 dark:text-gray-200">{cr.reference}:</strong>{" "}
                                        <span className="text-gray-600 dark:text-gray-400">"{cr.text}"</span>
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                  )}

                  <div className="mt-auto bg-gray-100/50 dark:bg-gray-900/50 px-4 py-2 flex justify-between items-center text-xs rounded-b-xl">
                    <div className='flex items-center gap-2'>
                          <button onClick={() => onViewChat(item.sessionId)} className="text-gray-500 dark:text-gray-400 hover:text-gospel-cyan-600 dark:hover:text-gospel-glow transition-colors flex items-center gap-1.5" title={t.viewChat}>
                            {t.studyItemFrom} <span className="font-semibold truncate max-w-xs">{item.sessionTitle}</span> <ArrowRight size={14} />
                          </button>
                    </div>
                    <button onClick={() => onDelete(item.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors" aria-label={t.deleteItemAria}>
                        <Trash2 size={16}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudyView;