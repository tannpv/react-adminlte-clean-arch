import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import {
    clearTranslationCache,
    createLanguage,
    createTranslation,
    deleteLanguage,
    deleteTranslation,
    getActiveLanguages,
    getAllTranslations,
    getAllTranslationsForLanguage,
    getCacheStats,
    getLanguageByCode,
    getLanguages,
    getTranslation,
    getTranslationsByNamespace,
    updateLanguage,
    updateTranslation,
    warmUpCache
} from '../api/translationsApi';

// Language queries
export const useLanguages = () => {
    return useQuery({
        queryKey: ['languages'],
        queryFn: getLanguages,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useActiveLanguages = () => {
    return useQuery({
        queryKey: ['languages', 'active'],
        queryFn: getActiveLanguages,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useLanguage = (code) => {
    return useQuery({
        queryKey: ['languages', code],
        queryFn: () => getLanguageByCode(code),
        enabled: !!code,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// Translation queries
export const useTranslationsByNamespace = (languageCode, namespace) => {
    return useQuery({
        queryKey: ['translations', languageCode, namespace],
        queryFn: () => getTranslationsByNamespace(languageCode, namespace),
        enabled: !!languageCode && !!namespace,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useAllTranslationsForLanguage = (languageCode) => {
    return useQuery({
        queryKey: ['translations', languageCode, 'all'],
        queryFn: () => getAllTranslationsForLanguage(languageCode),
        enabled: !!languageCode,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useTranslation = (languageCode, keyPath) => {
    return useQuery({
        queryKey: ['translations', languageCode, keyPath],
        queryFn: () => getTranslation(languageCode, keyPath),
        enabled: !!languageCode && !!keyPath,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// Cache queries
export const useCacheStats = () => {
    return useQuery({
        queryKey: ['translations', 'cache', 'stats'],
        queryFn: getCacheStats,
        staleTime: 30 * 1000, // 30 seconds
    });
};

// Language mutations
export const useCreateLanguage = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: createLanguage,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['languages'] });
            toastr.success('Language created successfully');
        },
        onError: (error) => {
            toastr.error(error?.response?.data?.message || 'Failed to create language');
        },
    });
};

export const useUpdateLanguage = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => updateLanguage(id, data),
        onSuccess: (data, variables) => {
            qc.invalidateQueries({ queryKey: ['languages'] });
            qc.invalidateQueries({ queryKey: ['languages', variables.data.code] });
            toastr.success('Language updated successfully');
        },
        onError: (error) => {
            toastr.error(error?.response?.data?.message || 'Failed to update language');
        },
    });
};

export const useDeleteLanguage = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: deleteLanguage,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['languages'] });
            toastr.success('Language deleted successfully');
        },
        onError: (error) => {
            toastr.error(error?.response?.data?.message || 'Failed to delete language');
        },
    });
};

// Cache mutations
export const useClearCache = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({ languageCode, namespace }) => clearTranslationCache(languageCode, namespace),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['translations'] });
            qc.invalidateQueries({ queryKey: ['translations', 'cache', 'stats'] });
            toastr.success('Cache cleared successfully');
        },
        onError: (error) => {
            toastr.error(error?.response?.data?.message || 'Failed to clear cache');
        },
    });
};

export const useWarmUpCache = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: ({ languageCode, namespaces }) => warmUpCache(languageCode, namespaces),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['translations'] });
            qc.invalidateQueries({ queryKey: ['translations', 'cache', 'stats'] });
            toastr.success('Cache warmed up successfully');
        },
        onError: (error) => {
            toastr.error(error?.response?.data?.message || 'Failed to warm up cache');
        },
    });
};

// Translation management queries
export const useAllTranslations = (languageCode, namespace) => {
    return useQuery({
        queryKey: ['allTranslations', languageCode, namespace],
        queryFn: () => getAllTranslations(languageCode, namespace),
        enabled: !!languageCode,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
};

// Translation management mutations
export const useCreateTranslation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => createTranslation(data),
        onSuccess: (data, variables) => {
            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ['allTranslations'] });
            queryClient.invalidateQueries({
                queryKey: ['translationsByNamespace', variables.languageCode]
            });
            queryClient.invalidateQueries({
                queryKey: ['allTranslationsForLanguage', variables.languageCode]
            });
            toastr.success('Translation created successfully');
        },
        onError: (error) => {
            toastr.error(`Error creating translation: ${error.message}`);
        }
    });
};

export const useUpdateTranslation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => updateTranslation(id, data),
        onSuccess: (data, variables) => {
            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ['allTranslations'] });
            queryClient.invalidateQueries({ queryKey: ['translationsByNamespace'] });
            queryClient.invalidateQueries({ queryKey: ['allTranslationsForLanguage'] });
            toastr.success('Translation updated successfully');
        },
        onError: (error) => {
            toastr.error(`Error updating translation: ${error.message}`);
        }
    });
};

export const useDeleteTranslation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => deleteTranslation(id),
        onSuccess: () => {
            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ['allTranslations'] });
            queryClient.invalidateQueries({ queryKey: ['translationsByNamespace'] });
            queryClient.invalidateQueries({ queryKey: ['allTranslationsForLanguage'] });
            toastr.success('Translation deleted successfully');
        },
        onError: (error) => {
            toastr.error(`Error deleting translation: ${error.message}`);
        }
    });
};
