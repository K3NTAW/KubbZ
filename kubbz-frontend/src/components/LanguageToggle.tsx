import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageToggle: React.FC = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];

  return (
    <div className="relative inline-block text-left">
      <select
        value={i18n.language}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg pl-3 pr-10 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer transition-colors duration-200"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code} className="py-1">
            {`${lang.flag} ${lang.name}`}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};

export default LanguageToggle;
