import React, { useState } from 'react';
import { useTranslation } from '../../../shared/hooks/useTranslation';
import CacheManagementTab from '../components/CacheManagementTab';
import EditableTranslationsTab from '../components/EditableTranslationsTab';
import LanguagesTab from '../components/LanguagesTab';
import TranslationsTab from '../components/TranslationsTab';
import { useCacheStats, useLanguages } from '../hooks/useTranslations';

const TranslationsPage = () => {
    const [activeTab, setActiveTab] = useState('languages');

    const { data: languages, isLoading: languagesLoading } = useLanguages();
    const { data: cacheStats, isLoading: cacheStatsLoading } = useCacheStats();
    const { t } = useTranslation('en', 'translations');

    // Calculate statistics
    const totalLanguages = languages?.length || 0;
    const activeLanguages = languages?.filter(lang => lang.isActive !== false).length || 0;
    const defaultLanguage = languages?.find(lang => lang.isDefault)?.name || 'None';
    const cachedEntries = cacheStats?.size || 0;

    const toggleTab = (tab) => {
        if (activeTab !== tab) {
            setActiveTab(tab);
        }
    };

    return (
        <>
            <div className="page-card">
                <div className="page-header">
                    <div>
                        <h2 className="page-title">
                            <i className="fas fa-language mr-2"></i>
                            {t('title', 'Translation Management')}
                        </h2>
                        <p className="page-subtitle">
                            Manage multi-language support for your application.
                            Add new languages, manage translations, and optimize performance with caching.
                        </p>
                    </div>
                    <div className="page-actions">
                        <div className="search-control">
                            <div className="input-group">
                                <div className="input-group-prepend">
                                    <span className="input-group-text">
                                        <i className="fas fa-search"></i>
                                    </span>
                                </div>
                                <input
                                    type="search"
                                    className="form-control"
                                    placeholder="Search translations..."
                                    disabled
                                />
                            </div>
                        </div>
                        <button
                            className="btn btn-outline-secondary"
                            onClick={() => window.location.reload()}
                            title="Refresh translations"
                        >
                            <i className="fas fa-sync-alt mr-2"></i>
                            Refresh
                        </button>
                    </div>
                </div>

                <div className="page-body">
                    {languagesLoading && (
                        <div className="loading-state">
                            <div className="loading-content">
                                <i className="fas fa-spinner fa-spin loading-icon"></i>
                                <h4 className="loading-title">Loading Translations</h4>
                                <p className="loading-description">Please wait while we fetch the translation data...</p>
                            </div>
                        </div>
                    )}

                    {!languagesLoading && (
                        <div className="translations-content">
                            {/* Statistics Dashboard */}
                            <div className="translations-stats mb-4">
                                <div className="row">
                                    <div className="col-md-3">
                                        <div className="stat-card">
                                            <div className="stat-icon">
                                                <i className="fas fa-globe"></i>
                                            </div>
                                            <div className="stat-content">
                                                <div className="stat-number">{totalLanguages}</div>
                                                <div className="stat-label">Total Languages</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="stat-card">
                                            <div className="stat-icon">
                                                <i className="fas fa-check-circle"></i>
                                            </div>
                                            <div className="stat-content">
                                                <div className="stat-number">{activeLanguages}</div>
                                                <div className="stat-label">Active Languages</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="stat-card">
                                            <div className="stat-icon">
                                                <i className="fas fa-star"></i>
                                            </div>
                                            <div className="stat-content">
                                                <div className="stat-number">{defaultLanguage}</div>
                                                <div className="stat-label">Default Language</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="stat-card">
                                            <div className="stat-icon">
                                                <i className="fas fa-database"></i>
                                            </div>
                                            <div className="stat-content">
                                                <div className="stat-number">{cachedEntries}</div>
                                                <div className="stat-label">Cached Entries</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Translation Management Section */}
                            <div className="translations-table-section">
                                <div className="section-header">
                                    <h5 className="section-title">
                                        <i className="fas fa-list mr-2"></i>
                                        Translation Management
                                    </h5>
                                    <p className="section-description">
                                        Manage languages, translations, and cache settings for optimal performance.
                                    </p>
                                </div>

                                <div className="card">
                                    <div className="card-body">
                                        <ul className="nav nav-tabs" role="tablist">
                                            <li className="nav-item">
                                                <a
                                                    className={`nav-link ${activeTab === 'languages' ? 'active' : ''}`}
                                                    onClick={() => toggleTab('languages')}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <i className="fas fa-globe mr-1"></i>
                                                    {t('languages.title', 'Languages')}
                                                </a>
                                            </li>
                                            <li className="nav-item">
                                                <a
                                                    className={`nav-link ${activeTab === 'translations' ? 'active' : ''}`}
                                                    onClick={() => toggleTab('translations')}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <i className="fas fa-language mr-1"></i>
                                                    {t('translations.title', 'Translations')}
                                                </a>
                                            </li>
                                            <li className="nav-item">
                                                <a
                                                    className={`nav-link ${activeTab === 'edit-translations' ? 'active' : ''}`}
                                                    onClick={() => toggleTab('edit-translations')}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <i className="fas fa-edit mr-1"></i>
                                                    Edit Translations
                                                </a>
                                            </li>
                                            <li className="nav-item">
                                                <a
                                                    className={`nav-link ${activeTab === 'cache' ? 'active' : ''}`}
                                                    onClick={() => toggleTab('cache')}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <i className="fas fa-database mr-1"></i>
                                                    {t('cache.title', 'Cache Management')}
                                                </a>
                                            </li>
                                        </ul>

                                        <div className="tab-content mt-3">
                                            {activeTab === 'languages' && (
                                                <div className="tab-pane active">
                                                    <LanguagesTab languages={languages} />
                                                </div>
                                            )}
                                            {activeTab === 'translations' && (
                                                <div className="tab-pane active">
                                                    <TranslationsTab languages={languages} />
                                                </div>
                                            )}
                                            {activeTab === 'edit-translations' && (
                                                <div className="tab-pane active">
                                                    <EditableTranslationsTab languages={languages} />
                                                </div>
                                            )}
                                            {activeTab === 'cache' && (
                                                <div className="tab-pane active">
                                                    <CacheManagementTab
                                                        cacheStats={cacheStats}
                                                        isLoading={cacheStatsLoading}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default TranslationsPage;
