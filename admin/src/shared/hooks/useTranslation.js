import { useCallback, useEffect, useState } from 'react';
import { ApiClient } from '../lib/apiClient';

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
            // Get translation from server with language header
            const response = await ApiClient.get(`/translations/translate/${encodeURIComponent(key)}`, {
                headers: {
                    'X-Language-Code': language
                }
            });
            return response.data.translation;
        } catch (error) {
            console.warn(`Server translation failed for key: ${key}`, error);
            return key; // Fallback to original key
        }
    }, [language]);

    const tWithFormat = useCallback(async (text, ...params) => {
        try {
            const response = await ApiClient.post('/translations/translate/format', {
                text,
                params
            }, {
                headers: {
                    'X-Language-Code': language
                }
            });
            return response.data.translation;
        } catch (error) {
            console.warn(`Translation with format failed for text: ${text}`, error);
            return text;
        }
    }, [language]);

    const translateArray = useCallback(async (array) => {
        try {
            const response = await ApiClient.post('/translations/translate/array', array, {
                headers: {
                    'X-Language-Code': language
                }
            });
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
