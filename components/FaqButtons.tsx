import React from 'react';

interface FaqButtonsProps {
  questions: string[];
  title: string;
  onQuestionClick: (question: string) => void;
  isLoading: boolean;
}

const FaqButtons: React.FC<FaqButtonsProps> = ({ questions, title, onQuestionClick, isLoading }) => {
  return (
    <div className="mb-4">
        <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-3">{title}</p>
        <div className="flex flex-wrap justify-center gap-2">
        {questions.map((q) => (
            <button
            key={q}
            onClick={() => onQuestionClick(q)}
            disabled={isLoading}
            className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gospel-cyan-500 text-gray-700 dark:text-stone-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
            {q}
            </button>
        ))}
        </div>
    </div>
  );
};

export default FaqButtons;
