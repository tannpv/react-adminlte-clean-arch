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
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                type="button"
                id="languageDropdown"
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
                onClick={toggle}
            >
                <span className="text-lg mr-2">
                    {currentLanguage?.flagIcon || '🌐'}
                </span>
                <span className="hidden md:inline">
                    {currentLanguage?.name || currentLanguage?.code || 'Language'}
                </span>
                <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                    <div className="py-1">
                        {languages.map(language => (
                            <button
                                key={language.id}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center ${
                                    language.code === languageCode ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                }`}
                                onClick={() => handleLanguageChange(language.code)}
                            >
                                <span className="text-lg mr-3">
                                    {language.flagIcon || '🌐'}
                                </span>
                                <span className="flex-grow">
                                    {language.name || language.code || 'Unknown'}
                                </span>
                                {(language.isDefault === true || language.isDefault === 1) && (
                                    <span className="text-gray-500 text-xs">(Default)</span>
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
