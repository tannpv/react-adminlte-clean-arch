import React, { useEffect, useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { ApiClient } from '../lib/apiClient';

const LanguageSwitcher = ({
    className = '',
    showFlags = true,
    showNames = true,
    size = 'md',
    variant = 'dropdown' // 'dropdown' or 'buttons'
}) => {
    const { language, changeLanguage } = useTranslation();
    const [languages, setLanguages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const loadLanguages = async () => {
            try {
                const response = await ApiClient.get('/translations/languages');
                setLanguages(response.data);
            } catch (error) {
                console.error('Failed to load languages:', error);
                // If server fails, show empty array - user will see loading state
                setLanguages([]);
            } finally {
                setLoading(false);
            }
        };

        loadLanguages();
    }, []);

    const handleLanguageChange = async (newLanguage) => {
        try {
            changeLanguage(newLanguage);
            setIsOpen(false);

            // Refresh translations for new language
            await ApiClient.post('/translations/refresh', { languageCode: newLanguage });

            // Show success message
            if (window.toastr) {
                window.toastr.success(`Language changed to ${languages.find(l => l.code === newLanguage)?.name}`);
            }
        } catch (error) {
            console.error('Failed to change language:', error);
            if (window.toastr) {
                window.toastr.error('Failed to change language');
            }
        }
    };

    const getSizeClasses = () => {
        switch (size) {
            case 'sm': return 'text-sm px-2 py-1';
            case 'lg': return 'text-lg px-4 py-2';
            default: return 'text-base px-3 py-2';
        }
    };

    const getFlagEmoji = (code) => {
        const flags = {
            'en': '🇺🇸',
            'es': '🇪🇸',
            'fr': '🇫🇷',
            'de': '🇩🇪',
            'it': '🇮🇹',
            'pt': '🇵🇹',
            'ru': '🇷🇺',
            'zh': '🇨🇳',
            'ja': '🇯🇵',
            'ko': '🇰🇷',
            'ar': '🇸🇦',
        };
        return flags[code] || '🌐';
    };

    if (loading) {
        return (
            <div className={`language-switcher-loading ${className}`}>
                <div className="animate-pulse bg-gray-200 rounded h-8 w-20"></div>
            </div>
        );
    }

    if (variant === 'buttons') {
        return (
            <div className={`language-switcher-buttons flex space-x-2 ${className}`}>
                {languages.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`
              flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-200
              ${language === lang.code
                                ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                            }
              ${getSizeClasses()}
            `}
                    >
                        {showFlags && <span className="text-lg">{getFlagEmoji(lang.code)}</span>}
                        {showNames && <span>{lang.nativeName || lang.name}</span>}
                    </button>
                ))}
            </div>
        );
    }

    // Dropdown variant
    return (
        <div className={`language-switcher-dropdown relative ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
          flex items-center space-x-2 bg-white border border-gray-300 rounded-lg
          hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500
          transition-all duration-200
          ${getSizeClasses()}
        `}
            >
                {showFlags && <span className="text-lg">{getFlagEmoji(language)}</span>}
                {showNames && (
                    <span>
                        {languages.find(l => l.code === language)?.nativeName ||
                            languages.find(l => l.code === language)?.name ||
                            language.toUpperCase()}
                    </span>
                )}
                <svg
                    className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-20">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                className={`
                  w-full flex items-center space-x-3 px-4 py-3 text-left
                  hover:bg-gray-50 transition-colors duration-200
                  ${language === lang.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
                  ${lang.isDefault ? 'border-b border-gray-200' : ''}
                `}
                            >
                                {showFlags && <span className="text-lg">{getFlagEmoji(lang.code)}</span>}
                                <div className="flex-1">
                                    <div className="font-medium">{lang.nativeName || lang.name}</div>
                                    {lang.nativeName && lang.nativeName !== lang.name && (
                                        <div className="text-sm text-gray-500">{lang.name}</div>
                                    )}
                                </div>
                                {lang.isDefault && (
                                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                                        Default
                                    </span>
                                )}
                                {language === lang.code && (
                                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default LanguageSwitcher;
