import React from 'react';
import type { Devotional } from '../types';
import { Menu, Trash2 } from 'lucide-react';

interface DevotionalViewProps {
  devotionals: Devotional[];
  onDelete: (id: string) => void;
  toggleSidebar: () => void;
  t: any;
}

const DevotionalView: React.FC<DevotionalViewProps> = ({ devotionals, onDelete, toggleSidebar, t }) => {
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
              <h1 className="text-2xl font-bold tracking-tight text-gray-800 dark:text-stone-200">{t.devotionals}</h1>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
            {devotionals.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-gray-500 dark:text-gray-400">{t.noDevotionals}</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {devotionals.map(devo => (
                        <div key={devo.id} className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-sm overflow-hidden">
                            <div className="p-5">
                                <h2 className="text-lg font-bold text-gospel-cyan-700 dark:text-gospel-glow mb-1">{t.reading}: {devo.reading.reference}</h2>
                                <p className="font-serif text-base mb-4 italic">"{devo.reading.text}"</p>

                                <h3 className="text-md font-bold text-gospel-cyan-700 dark:text-gospel-glow mb-1">{t.reflection}</h3>
                                <p className="font-serif text-base mb-4">{devo.reflection}</p>

                                <h3 className="text-md font-bold text-gospel-cyan-700 dark:text-gospel-glow mb-1">{t.prayer}</h3>
                                <p className="font-serif text-base italic">{devo.prayer}</p>
                            </div>
                             <div className="bg-gray-100/50 dark:bg-gray-900/50 px-4 py-2 flex justify-between items-center text-xs">
                                <p className="text-gray-500 dark:text-gray-400">{new Date(devo.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                <button onClick={() => onDelete(devo.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors" aria-label={t.deleteItemAria}>
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

export default DevotionalView;