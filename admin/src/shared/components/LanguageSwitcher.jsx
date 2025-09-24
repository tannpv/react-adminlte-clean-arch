import React from 'react';
import { useActiveLanguages } from '../../features/translations/hooks/useTranslations';
import { useLanguage } from '../hooks/useTranslation';

const LanguageSwitcher = () => {
    const { languageCode, setLanguage } = useLanguage();
    const { data: languages, isLoading } = useActiveLanguages();
    const [dropdownOpen, setDropdownOpen] = React.useState(false);

    const toggle = () => setDropdownOpen(prevState => !prevState);

    const handleLanguageChange = (newLanguageCode) => {
        if (newLanguageCode !== languageCode) {
            setLanguage(newLanguageCode);
        }
        setDropdownOpen(false);
    };

    if (isLoading || !languages || languages.length === 0) {
        return null;
    }

    const currentLanguage = languages.find(lang => lang.code === languageCode);

    return (
        <div className="relative">
            <button
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
                type="button"
                id="languageDropdown"
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
                onClick={toggle}
            >
                <span className="text-lg mr-2">
                    {currentLanguage?.flagIcon || '🌐'}
                </span>
                <span className="hidden md:inline font-medium">
                    {currentLanguage?.name || currentLanguage?.code || 'Language'}
                </span>
                <svg className={`ml-2 h-4 w-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-50 border border-gray-200 overflow-hidden">
                    <div className="py-2">
                        {languages.map(language => (
                            <button
                                key={language.id}
                                className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center transition-colors duration-150 ${
                                    language.code === languageCode 
                                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500' 
                                        : 'text-gray-700'
                                }`}
                                onClick={() => handleLanguageChange(language.code)}
                            >
                                <span className="text-lg mr-3">
                                    {language.flagIcon || '🌐'}
                                </span>
                                <div className="flex-grow">
                                    <div className="font-medium">
                                        {language.name || language.code || 'Unknown'}
                                    </div>
                                    {(language.isDefault === true || language.isDefault === 1) && (
                                        <div className="text-xs text-gray-500 mt-0.5">Default Language</div>
                                    )}
                                </div>
                                {language.code === languageCode && (
                                    <svg className="h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LanguageSwitcher;
