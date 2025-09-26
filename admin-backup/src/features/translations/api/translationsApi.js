import { ApiClient } from '../../../shared/lib/apiClient';

// Language management
export const getLanguages = async () => {
    const response = await ApiClient.get('/translations/languages');
    return response.data;
};

export const getActiveLanguages = async () => {
    const response = await ApiClient.get('/translations/languages/active');
    return response.data;
};

export const getLanguageByCode = async (code) => {
    const response = await ApiClient.get(`/translations/languages/${code}`);
    return response.data;
};

export const createLanguage = async (languageData) => {
    const response = await ApiClient.post('/translations/languages', languageData);
    return response.data;
};

export const updateLanguage = async (id, languageData) => {
    const response = await ApiClient.put(`/translations/languages/${id}`, languageData);
    return response.data;
};

export const deleteLanguage = async (id) => {
    const response = await ApiClient.delete(`/translations/languages/${id}`);
    return response.data;
};

// Translation management
export const getTranslationsByNamespace = async (languageCode, namespace) => {
    const response = await ApiClient.get(`/translations/languages/${languageCode}/namespaces/${namespace}`);
    return response.data;
};

export const getAllTranslationsForLanguage = async (languageCode) => {
    const response = await ApiClient.get(`/translations/languages/${languageCode}/translations`);
    return response.data;
};

export const getTranslation = async (languageCode, keyPath) => {
    const response = await ApiClient.get(`/translations/translate/${languageCode}/${keyPath}`);
    return response.data;
};

// Cache management
export const clearTranslationCache = async (languageCode, namespace) => {
    const params = new URLSearchParams();
    if (languageCode) params.append('languageCode', languageCode);
    if (namespace) params.append('namespace', namespace);

    const response = await ApiClient.post(`/translations/cache/clear?${params.toString()}`);
    return response.data;
};

export const getCacheStats = async () => {
    const response = await ApiClient.get('/translations/cache/stats');
    return response.data;
};

export const warmUpCache = async (languageCode, namespaces) => {
    const response = await ApiClient.post('/translations/cache/warmup', {
        languageCode,
        namespaces
    });
    return response.data;
};

// Translation CRUD operations
export const getAllTranslations = async (languageCode, namespace) => {
    const params = new URLSearchParams();
    if (languageCode) params.append('languageCode', languageCode);
    if (namespace) params.append('namespace', namespace);

    const response = await ApiClient.get(`/translations/all?${params.toString()}`);
    return response.data;
};

export const createTranslation = async (data) => {
    const response = await ApiClient.post('/translations', data);
    return response.data;
};

export const updateTranslation = async (id, data) => {
    const response = await ApiClient.put(`/translations/${id}`, data);
    return response.data;
};

export const deleteTranslation = async (id) => {
    const response = await ApiClient.delete(`/translations/${id}`);
    return response.data;
};
