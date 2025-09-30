import { useCallback, useEffect, useState } from 'react';
import { ApiClient } from '../lib/apiClient';

// Local translation cache
let localTranslations = {};
let loadedLanguages = new Set();

// Translation context for global language state
let globalLanguage = 'en';
let languageChangeListeners = [];

const setGlobalLanguage = (langCode) => {
    globalLanguage = langCode;
    localStorage.setItem('selectedLanguage', langCode);
    languageChangeListeners.forEach(listener => listener(langCode));
};

const addLanguageChangeListener = (listener) => {
    languageChangeListeners.push(listener);
    return () => {
        languageChangeListeners = languageChangeListeners.filter(l => l !== listener);
    };
};

// Load local translation file
const loadLocalTranslations = async (langCode) => {
    if (loadedLanguages.has(langCode)) {
        return localTranslations[langCode];
    }

    try {
        const response = await fetch(`/translations/${langCode}.json`);
        if (response.ok) {
            const translations = await response.json();
            localTranslations[langCode] = translations;
            loadedLanguages.add(langCode);
            return translations;
        }
    } catch (error) {
        console.warn(`Failed to load local translations for ${langCode}:`, error);
    }

    // Fallback to English if available
    if (langCode !== 'en') {
        return loadLocalTranslations('en');
    }

    return {};
};

// Get nested value from object using dot notation
const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
};

export const useTranslation = () => {
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('selectedLanguage') || 'en';
    });

    // Sync with global language state
    useEffect(() => {
        const removeListener = addLanguageChangeListener((newLang) => {
            setLanguage(newLang);
        });
        return removeListener;
    }, []);

    const t = useCallback(async (key) => {
        try {
            // Try backend first with language header
            const response = await ApiClient.get(`/translations/translate/${encodeURIComponent(key)}`, {
                headers: {
                    'X-Language-Code': language
                }
            });
            return response.data.translation;
        } catch (error) {
            console.warn(`Backend translation failed for key: ${key}, trying local fallback`, error);
            
            try {
                // Fallback to local translations
                const localTranslations = await loadLocalTranslations(language);
                const translation = getNestedValue(localTranslations, key);
                
                if (translation) {
                    return translation;
                }
                
                // If not found in current language, try English
                if (language !== 'en') {
                    const englishTranslations = await loadLocalTranslations('en');
                    const englishTranslation = getNestedValue(englishTranslations, key);
                    if (englishTranslation) {
                        return englishTranslation;
                    }
                }
            } catch (localError) {
                console.warn(`Local translation failed for key: ${key}`, localError);
            }
            
            return key; // Final fallback to original key
        }
    }, [language]);

    const tWithFormat = useCallback(async (text, ...params) => {
        try {
            const response = await ApiClient.post('/translations/translate/format', {
                text,
                params
            });
            return response.data.translation;
        } catch (error) {
            console.warn(`Translation with format failed for text: ${text}`, error);
            return text;
        }
    }, [language]);

    const translateArray = useCallback(async (array) => {
        try {
            const response = await ApiClient.post('/translations/translate/array', array);
            return response.data;
        } catch (error) {
            console.warn('Array translation failed', error);
            return array;
        }
    }, [language]);

    const changeLanguage = useCallback((newLanguage) => {
        setGlobalLanguage(newLanguage);
    }, []);

    const refreshTranslations = useCallback(async (key) => {
        try {
            await ApiClient.post('/translations/refresh', {
                languageCode: language,
                key
            });
        } catch (error) {
            console.error('Failed to refresh translations', error);
        }
    }, [language]);

    return {
        t,
        tWithFormat,
        translateArray,
        language,
        changeLanguage,
        refreshTranslations
    };
};

// Hook for single translation
export const useSingleTranslation = (key, fallback = key) => {
    const [translation, setTranslation] = useState(fallback);
    const { t } = useTranslation();

    useEffect(() => {
        const loadTranslation = async () => {
            try {
                const result = await t(key);
                setTranslation(result);
            } catch (error) {
                setTranslation(fallback);
            }
        };

        loadTranslation();
    }, [key, t, fallback]);

    return translation;
};

// Hook for multiple translations
export const useTranslations = (keys) => {
    const [translations, setTranslations] = useState({});
    const { translateArray } = useTranslation();

    useEffect(() => {
        const loadTranslations = async () => {
            try {
                const result = await translateArray(keys);
                setTranslations(result);
            } catch (error) {
                setTranslations(keys); // Fallback to original keys
            }
        };

        loadTranslations();
    }, [keys, translateArray]);

    return translations;
};
