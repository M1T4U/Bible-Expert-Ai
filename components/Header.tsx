import React from 'react';
import { BIBLE_VERSIONS } from '../constants';
import { LANGUAGES } from '../translations';
import { Sun, Moon, BookOpenText, RotateCw, ChevronDown, Menu, Globe, Sparkles } from 'lucide-react';

interface HeaderProps {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    onNewChat: () => void;
    bibleVersion: string;
    onVersionChange: (version: string) => void;
    toggleSidebar: () => void;
    language: string;
    onLanguageChange: (lang: string) => void;
    onGenerateDevotional: () => void;
    isGeneratingDevotional: boolean;
    t: any;
}

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, onNewChat, bibleVersion, onVersionChange, toggleSidebar, language, onLanguageChange, onGenerateDevotional, isGeneratingDevotional, t }) => {
  const versionClass = `version-${bibleVersion.toLowerCase()}`;
    
  return (
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
                <div className="flex items-center">
                    <BookOpenText className="h-8 w-8 header-icon" />
                    <h1 className="ml-3 text-2xl font-bold">
                        <span className="app-title-gradient">
                            Bible Expert AI
                        </span>
                    </h1>
                </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3">
                 <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <select
                        value={language}
                        onChange={(e) => onLanguageChange(e.target.value)}
                        className="bg-gray-200/50 dark:bg-gray-700/50 appearance-none border-none rounded-full py-2 pl-10 pr-4 text-sm font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-gospel-cyan-500"
                        aria-label={t.selectLangAria}
                    >
                        {LANGUAGES.map(lang => <option key={lang.code} value={lang.code} className="bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-stone-200 font-semibold">{lang.name}</option>)}
                    </select>
                </div>

                 <div className="relative">
                    <select
                        value={bibleVersion}
                        onChange={(e) => onVersionChange(e.target.value)}
                        className={`version-select-animated ${versionClass} appearance-none border-none rounded-full py-2 pl-4 pr-9 text-sm font-semibold text-white shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 dark:focus:ring-offset-gray-900 focus:ring-gospel-glow transition-all duration-300`}
                        aria-label={t.selectVersionAria}
                    >
                        {BIBLE_VERSIONS.map(v => <option key={v} value={v} className="bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-stone-200 font-semibold">{v}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-white/80">
                       <ChevronDown className="h-4 w-4" />
                    </div>
                </div>
                <button
                    onClick={onGenerateDevotional}
                    disabled={isGeneratingDevotional}
                    className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gospel-cyan-500 disabled:cursor-not-allowed disabled:text-gospel-cyan-500/70"
                    title={t.generateDevotional}
                    aria-label={t.generateDevotional}
                >
                    {isGeneratingDevotional ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <Sparkles className="w-5 h-5" />}
                </button>
                 <button
                    onClick={onNewChat}
                    className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gospel-cyan-500"
                    aria-label={t.newChatAria}
                >
                    <RotateCw className="w-5 h-5" />
                </button>
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gospel-cyan-500"
                    aria-label={t.toggleThemeAria}
                >
                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;