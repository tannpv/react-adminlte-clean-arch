import React, { useState } from 'react';
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
        'roles', 'storage', 'validation'
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

    const handleNamespaceToggle = (namespace) => {
        setWarmupNamespaces(prev =>
            prev.includes(namespace)
                ? prev.filter(n => n !== namespace)
                : [...prev, namespace]
        );
    };

    const handleSelectAllNamespaces = () => {
        setWarmupNamespaces(namespaces);
    };

    const handleClearAllNamespaces = () => {
        setWarmupNamespaces([]);
    };

    return (
        <div>
            <div className="row">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">
                                <i className="fas fa-chart-bar mr-2"></i>
                                Cache Statistics
                            </h3>
                        </div>
                        <div className="card-body">
                            {isLoading ? (
                                <div className="text-center">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="sr-only">Loading...</span>
                                    </div>
                                </div>
                            ) : cacheStats ? (
                                <div>
                                    <div className="mb-3">
                                        <h5 className="text-primary">{cacheStats.size}</h5>
                                        <p className="text-muted mb-0">Cached entries</p>
                                    </div>

                                    {cacheStats.keys && cacheStats.keys.length > 0 && (
                                        <div>
                                            <h6>Cached Keys:</h6>
                                            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                                {cacheStats.keys.map((key, index) => (
                                                    <span key={index} className="badge badge-info mr-1 mb-1">
                                                        {key}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="alert alert-warning">
                                    No cache statistics available.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">
                                <i className="fas fa-broom mr-2"></i>
                                {t('clear_cache', 'Clear Cache')}
                            </h3>
                        </div>
                        <div className="card-body">
                            <form>
                                <div className="form-group">
                                    <label htmlFor="clearLanguage">Language (Optional)</label>
                                    <select
                                        className="form-control"
                                        name="clearLanguage"
                                        id="clearLanguage"
                                        value={clearLanguage}
                                        onChange={(e) => setClearLanguage(e.target.value)}
                                    >
                                        <option value="">All languages</option>
                                        {languages?.map(language => (
                                            <option key={language.id} value={language.code}>
                                                {language.flagIcon} {language.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="clearNamespace">Namespace (Optional)</label>
                                    <select
                                        className="form-control"
                                        name="clearNamespace"
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

                                <button
                                    type="button"
                                    className="btn btn-warning btn-block"
                                    onClick={handleClearCache}
                                    disabled={clearCacheMutation.isPending}
                                >
                                    {clearCacheMutation.isPending ? 'Clearing...' : t('clear_cache', 'Clear Cache')}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row mt-4">
                <div className="col-md-12">
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">
                                <i className="fas fa-fire mr-2"></i>
                                {t('warm_up_cache', 'Warm Up Cache')}
                            </h3>
                        </div>
                        <div className="card-body">
                            <form>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label htmlFor="warmupLanguage">Language *</label>
                                            <select
                                                className="form-control"
                                                name="warmupLanguage"
                                                id="warmupLanguage"
                                                value={warmupLanguage}
                                                onChange={(e) => setWarmupLanguage(e.target.value)}
                                            >
                                                <option value="">Select language...</option>
                                                {languages?.map(language => (
                                                    <option key={language.id} value={language.code}>
                                                        {language.flagIcon} {language.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label>Namespaces *</label>
                                            <div className="d-flex mb-2" style={{ gap: '8px' }}>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={handleSelectAllNamespaces}
                                                >
                                                    Select All
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-secondary"
                                                    onClick={handleClearAllNamespaces}
                                                >
                                                    Clear All
                                                </button>
                                            </div>
                                            <div className="d-flex flex-wrap" style={{ gap: '8px' }}>
                                                {namespaces.map(namespace => (
                                                    <button
                                                        key={namespace}
                                                        type="button"
                                                        className={`btn btn-sm ${warmupNamespaces.includes(namespace) ? 'btn-primary' : 'btn-outline-primary'}`}
                                                        onClick={() => handleNamespaceToggle(namespace)}
                                                    >
                                                        {namespace}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="btn btn-success btn-block"
                                    onClick={handleWarmUpCache}
                                    disabled={warmUpCacheMutation.isPending || !warmupLanguage || warmupNamespaces.length === 0}
                                >
                                    {warmUpCacheMutation.isPending ? 'Warming Up...' : t('warm_up_cache', 'Warm Up Cache')}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row mt-4">
                <div className="col-md-12">
                    <div className="alert alert-info">
                        <h6><i className="fas fa-info-circle mr-2"></i>Cache Management Tips</h6>
                        <ul className="mb-0">
                            <li><strong>Clear Cache:</strong> Use this when translations are updated to ensure fresh data is served.</li>
                            <li><strong>Warm Up Cache:</strong> Pre-load frequently used translations for better performance.</li>
                            <li><strong>Cache TTL:</strong> Cache entries expire after 5 minutes automatically.</li>
                            <li><strong>Performance:</strong> Cached translations load in &lt;1ms vs 100-200ms from database.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CacheManagementTab;
