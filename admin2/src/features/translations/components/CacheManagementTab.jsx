import React, { useState } from 'react';
import Button from '../../../shared/components/ui/Button';
import { useTranslation } from '../../../shared/hooks/useTranslation';
import { useActiveLanguages, useClearCache, useWarmUpCache } from '../hooks/useTranslations';

const CacheManagementTab = ({ cacheStats, isLoading }) => {
    const [clearLanguage, setClearLanguage] = useState('');
    const [clearNamespace, setClearNamespace] = useState('');
    const [warmupLanguage, setWarmupLanguage] = useState('');
    const [warmupNamespaces, setWarmupNamespaces] = useState([]);

    const { data: languages } = useActiveLanguages();
    const clearCacheMutation = useClearCache();
    const warmUpCacheMutation = useWarmUpCache();
    const { t } = useTranslation('en', 'translations');

    const namespaces = [
        'common', 'auth', 'products', 'users', 'categories',
        'roles', 'attributes', 'storage', 'validation', 'translations'
    ];

    const handleClearCache = () => {
        clearCacheMutation.mutate({
            languageCode: clearLanguage || undefined,
            namespace: clearNamespace || undefined
        });
    };

    const handleWarmUpCache = () => {
        if (warmupLanguage && warmupNamespaces.length > 0) {
            warmUpCacheMutation.mutate({
                languageCode: warmupLanguage,
                namespaces: warmupNamespaces
            });
        }
    };

    const toggleNamespace = (namespace) => {
        setWarmupNamespaces(prev =>
            prev.includes(namespace)
                ? prev.filter(n => n !== namespace)
                : [...prev, namespace]
        );
    };

    return (
        <div className="space-y-6">
            {/* Cache Statistics */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                        <i className="fas fa-chart-bar mr-3 text-blue-600"></i>
                        {t('cache.title', 'Cache Statistics')}
                    </h3>
                </div>
                <div className="p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <i className="fas fa-spinner fa-spin text-2xl text-blue-600 mr-3"></i>
                            <span className="text-gray-600">Loading cache statistics...</span>
                        </div>
                    ) : cacheStats ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-blue-50 rounded-lg p-4">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <i className="fas fa-database text-2xl text-blue-600"></i>
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-2xl font-semibold text-blue-900">
                                            {cacheStats.size || 0}
                                        </div>
                                        <div className="text-sm text-blue-700">Cached Entries</div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <i className="fas fa-memory text-2xl text-green-600"></i>
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-2xl font-semibold text-green-900">
                                            {cacheStats.hitRate || '0%'}
                                        </div>
                                        <div className="text-sm text-green-700">Hit Rate</div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-4">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <i className="fas fa-clock text-2xl text-purple-600"></i>
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-2xl font-semibold text-purple-900">
                                            {cacheStats.lastUpdated || 'Never'}
                                        </div>
                                        <div className="text-sm text-purple-700">Last Updated</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-md bg-yellow-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <i className="fas fa-exclamation-triangle text-yellow-400"></i>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-yellow-700">
                                        No cache statistics available.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Clear Cache */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                        <i className="fas fa-trash-alt mr-3 text-red-600"></i>
                        {t('clear_cache', 'Clear Cache')}
                    </h3>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label htmlFor="clearLanguage" className="block text-sm font-medium text-gray-700 mb-2">
                                Language (Optional)
                            </label>
                            <select
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                id="clearLanguage"
                                value={clearLanguage}
                                onChange={(e) => setClearLanguage(e.target.value)}
                            >
                                <option value="">All languages</option>
                                {languages?.map(language => (
                                    <option key={language.id} value={language.code}>
                                        {language.flagIcon} {language.name} ({language.code})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="clearNamespace" className="block text-sm font-medium text-gray-700 mb-2">
                                Namespace (Optional)
                            </label>
                            <select
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                id="clearNamespace"
                                value={clearNamespace}
                                onChange={(e) => setClearNamespace(e.target.value)}
                            >
                                <option value="">All namespaces</option>
                                {namespaces.map(namespace => (
                                    <option key={namespace} value={namespace}>
                                        {namespace}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <Button
                        variant="danger"
                        onClick={handleClearCache}
                        disabled={clearCacheMutation.isPending}
                        className="w-full"
                    >
                        <i className="fas fa-trash-alt mr-2"></i>
                        {clearCacheMutation.isPending ? 'Clearing...' : t('clear_cache', 'Clear Cache')}
                    </Button>
                </div>
            </div>

            {/* Warm Up Cache */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                        <i className="fas fa-fire mr-3 text-orange-600"></i>
                        {t('warm_up_cache', 'Warm Up Cache')}
                    </h3>
                </div>
                <div className="p-6">
                    <div className="mb-4">
                        <label htmlFor="warmupLanguage" className="block text-sm font-medium text-gray-700 mb-2">
                            Select Language
                        </label>
                        <select
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                            id="warmupLanguage"
                            value={warmupLanguage}
                            onChange={(e) => setWarmupLanguage(e.target.value)}
                        >
                            <option value="">Choose a language...</option>
                            {languages?.map(language => (
                                <option key={language.id} value={language.code}>
                                    {language.flagIcon} {language.name} ({language.code})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Namespaces
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {namespaces.map(namespace => (
                                <button
                                    key={namespace}
                                    type="button"
                                    className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${warmupNamespaces.includes(namespace)
                                        ? 'bg-orange-600 text-white border-orange-600'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                    onClick={() => toggleNamespace(namespace)}
                                >
                                    <i className={`fas fa-${warmupNamespaces.includes(namespace) ? 'check' : 'plus'} mr-2`}></i>
                                    {namespace}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button
                        variant="warning"
                        onClick={handleWarmUpCache}
                        disabled={!warmupLanguage || warmupNamespaces.length === 0 || warmUpCacheMutation.isPending}
                        className="w-full"
                    >
                        <i className="fas fa-fire mr-2"></i>
                        {warmUpCacheMutation.isPending ? 'Warming up...' : t('warm_up_cache', 'Warm Up Cache')}
                    </Button>
                </div>
            </div>

            {/* Information */}
            <div className="rounded-md bg-blue-50 p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <i className="fas fa-info-circle text-blue-400"></i>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">Cache Management Tips</h3>
                        <div className="mt-2 text-sm text-blue-700">
                            <ul className="list-disc list-inside space-y-1">
                                <li>Clearing cache will improve performance by removing stale data</li>
                                <li>Warming up cache pre-loads frequently used translations</li>
                                <li>Select specific languages and namespaces for targeted cache operations</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CacheManagementTab;