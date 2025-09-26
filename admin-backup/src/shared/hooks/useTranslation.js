import { useQuery } from '@tanstack/react-query';
import { ApiClient } from '../lib/apiClient';

// Get translations for a specific language and namespace
const getTranslations = async (languageCode, namespace) => {
    const response = await ApiClient.get(`/translations/languages/${languageCode}/namespaces/${namespace}`);
    return response.data.translations;
};

// Get a single translation
const getTranslation = async (languageCode, keyPath) => {
    const response = await ApiClient.get(`/translations/translate/${languageCode}/${keyPath}`);
    return response.data.translation;
};

// Main translation hook
export const useTranslation = (languageCode = 'en', namespace = 'common') => {
    const { data: translations, isLoading, error } = useQuery({
        queryKey: ['translations', languageCode, namespace],
        queryFn: () => getTranslations(languageCode, namespace),
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
    });

    // Translation function
    const t = (key, fallback = key) => {
        if (isLoading || error) {
            return fallback;
        }

        if (!translations || !translations[key]) {
            console.warn(`Translation missing for key: ${key} in namespace: ${namespace}`);
            return fallback;
        }

        return translations[key];
    };

    return {
        t,
        translations,
        isLoading,
        error,
        hasTranslations: !!translations && Object.keys(translations).length > 0
    };
};

// Hook for single translation
export const useSingleTranslation = (languageCode, keyPath, fallback) => {
    const { data: translation, isLoading, error } = useQuery({
        queryKey: ['translations', languageCode, keyPath],
        queryFn: () => getTranslation(languageCode, keyPath),
        enabled: !!languageCode && !!keyPath,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
    });

    return {
        translation: translation || fallback,
        isLoading,
        error
    };
};

// Hook for multiple namespaces
export const useTranslations = (languageCode = 'en', namespaces = ['common']) => {
    const queries = namespaces.map(namespace => ({
        queryKey: ['translations', languageCode, namespace],
        queryFn: () => getTranslations(languageCode, namespace),
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
    }));

    const results = useQuery({
        queryKey: ['translations', languageCode, 'multiple', namespaces],
        queryFn: async () => {
            const promises = namespaces.map(namespace => getTranslations(languageCode, namespace));
            const results = await Promise.all(promises);

            // Combine all translations into a single object
            const combined = {};
            results.forEach((translations, index) => {
                const namespace = namespaces[index];
                Object.keys(translations).forEach(key => {
                    combined[`${namespace}.${key}`] = translations[key];
                });
            });

            return combined;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
    });

    // Translation function for combined namespaces
    const t = (key, fallback = key) => {
        if (results.isLoading || results.error) {
            return fallback;
        }

        if (!results.data || !results.data[key]) {
            console.warn(`Translation missing for key: ${key}`);
            return fallback;
        }

        return results.data[key];
    };

    return {
        t,
        translations: results.data,
        isLoading: results.isLoading,
        error: results.error,
        hasTranslations: !!results.data && Object.keys(results.data).length > 0
    };
};

// Language context hook (for future language switching)
export const useLanguage = () => {
    // This would typically come from a context or localStorage
    const languageCode = localStorage.getItem('selectedLanguage') || 'en';

    const setLanguage = (code) => {
        localStorage.setItem('selectedLanguage', code);
        // Trigger a page reload or context update
        window.location.reload();
    };

    return {
        languageCode,
        setLanguage
    };
};


