import React, { useEffect, useState } from 'react';
import LanguageSwitcher from '../../../shared/components/LanguageSwitcher';
import { useTranslation } from '../../../shared/hooks/useTranslation';
import { ApiClient } from '../../../shared/lib/apiClient';

const TranslationsPage = () => {
    const { t, language } = useTranslation();
    const [activeTab, setActiveTab] = useState('languages');
    const [languages, setLanguages] = useState([]);
    const [translations, setTranslations] = useState([]);
    const [cacheStats, setCacheStats] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadLanguages();
        loadCacheStats();
    }, []);

    useEffect(() => {
        if (language) {
            loadTranslations(language);
        }
    }, [language]);

    const loadLanguages = async () => {
        try {
            setLoading(true);
            const response = await ApiClient.get('/translations/languages');
            setLanguages(response.data);
        } catch (error) {
            console.error('Failed to load languages:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadTranslations = async (langCode) => {
        try {
            setLoading(true);
            const response = await ApiClient.get(`/translations/languages/${langCode}/translations`);
            setTranslations(response.data);
        } catch (error) {
            console.error('Failed to load translations:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadCacheStats = async () => {
        try {
            const response = await ApiClient.get('/translations/cache/stats');
            setCacheStats(response.data);
        } catch (error) {
            console.error('Failed to load cache stats:', error);
        }
    };

    const clearCache = async () => {
        try {
            await ApiClient.post('/translations/cache/clear');
            await loadCacheStats();
            if (window.toastr) {
                window.toastr.success('Cache cleared successfully');
            }
        } catch (error) {
            console.error('Failed to clear cache:', error);
            if (window.toastr) {
                window.toastr.error('Failed to clear cache');
            }
        }
    };

    const warmUpCache = async () => {
        try {
            await ApiClient.post('/translations/cache/warmup', { languageCode: language });
            await loadCacheStats();
            if (window.toastr) {
                window.toastr.success('Cache warmed up successfully');
            }
        } catch (error) {
            console.error('Failed to warm up cache:', error);
            if (window.toastr) {
                window.toastr.error('Failed to warm up cache');
            }
        }
    };

    const refreshTranslations = async () => {
        try {
            await ApiClient.post('/translations/refresh', { languageCode: language });
            await loadTranslations(language);
            if (window.toastr) {
                window.toastr.success('Translations refreshed successfully');
            }
        } catch (error) {
            console.error('Failed to refresh translations:', error);
            if (window.toastr) {
                window.toastr.error('Failed to refresh translations');
            }
        }
    };

    const renderLanguagesTab = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Available Languages</h3>
                <button
                    onClick={loadLanguages}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Refresh
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {languages.map((lang) => (
                    <div
                        key={lang.id}
                        className={`p-4 border rounded-lg ${lang.isDefault ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-gray-900">{lang.name}</h4>
                                {lang.nativeName && lang.nativeName !== lang.name && (
                                    <p className="text-sm text-gray-600">{lang.nativeName}</p>
                                )}
                                <p className="text-xs text-gray-500">Code: {lang.code}</p>
                            </div>
                            <div className="flex flex-col items-end space-y-1">
                                {lang.isDefault && (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded">
                                        Default
                                    </span>
                                )}
                                <span className={`px-2 py-1 text-xs rounded ${lang.isActive
                                        ? 'bg-green-100 text-green-600'
                                        : 'bg-red-100 text-red-600'
                                    }`}>
                                    {lang.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderTranslationsTab = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                    Translations for {languages.find(l => l.code === language)?.name || language}
                </h3>
                <div className="flex space-x-2">
                    <button
                        onClick={refreshTranslations}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Refresh
                    </button>
                    <button
                        onClick={() => loadTranslations(language)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Reload
                    </button>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Original Key
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Translation
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Key Hash
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {translations.map((translation) => (
                                <tr key={translation.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {translation.originalKey}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {translation.destinationValue}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                        {translation.keyHash}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderCacheTab = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Cache Management</h3>
                <div className="flex space-x-2">
                    <button
                        onClick={warmUpCache}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                        Warm Up Cache
                    </button>
                    <button
                        onClick={clearCache}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Clear Cache
                    </button>
                </div>
            </div>

            {cacheStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 border border-gray-200 rounded-lg">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Cache Statistics</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Cached Items:</span>
                                <span className="font-medium">{cacheStats.size}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Current Language:</span>
                                <span className="font-medium">{language}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 border border-gray-200 rounded-lg">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Cache Keys (Sample)</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {cacheStats.keys.slice(0, 10).map((key, index) => (
                                <div key={index} className="text-sm font-mono text-gray-600 bg-gray-50 p-2 rounded">
                                    {key}
                                </div>
                            ))}
                            {cacheStats.keys.length > 10 && (
                                <div className="text-sm text-gray-500 text-center">
                                    ... and {cacheStats.keys.length - 10} more
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Translation Management</h1>
                            <p className="mt-2 text-gray-600">
                                Manage languages and translations for your application
                            </p>
                        </div>
                        <LanguageSwitcher variant="dropdown" />
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8 px-6">
                            {[
                                { id: 'languages', label: 'Languages', icon: 'fas fa-globe' },
                                { id: 'translations', label: 'Translations', icon: 'fas fa-language' },
                                { id: 'cache', label: 'Cache', icon: 'fas fa-database' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <i className={`${tab.icon} mr-2`}></i>
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {loading && (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <span className="ml-2 text-gray-600">Loading...</span>
                            </div>
                        )}

                        {!loading && (
                            <>
                                {activeTab === 'languages' && renderLanguagesTab()}
                                {activeTab === 'translations' && renderTranslationsTab()}
                                {activeTab === 'cache' && renderCacheTab()}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TranslationsPage;
