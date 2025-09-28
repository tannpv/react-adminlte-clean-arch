import React, { useState } from 'react';
import Button from '../../../shared/components/ui/Button';
import Card from '../../../shared/components/ui/Card';
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
        <div>
            {/* Page Header */}
            <div className="mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                            <i className="fas fa-globe mr-3 text-blue-600"></i>
                            {t('title', 'Translation Management')}
                        </h1>
                        <p className="mt-2 text-gray-600 max-w-2xl">
                            Manage multi-language support for your application.
                            Add new languages, manage translations, and optimize performance with caching.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i className="fas fa-search text-gray-400"></i>
                            </div>
                            <input
                                type="search"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Search translations..."
                                disabled
                            />
                        </div>
                        <Button
                            variant="outline-secondary"
                            onClick={() => window.location.reload()}
                            title="Refresh translations"
                        >
                            <i className="fas fa-sync-alt mr-2"></i>
                            Refresh
                        </Button>
                    </div>
                </div>
            </div>

            {/* Translations Content */}
            <div className="space-y-6">
                {languagesLoading && (
                    <Card>
                        <Card.Body>
                            <div className="text-center py-12">
                                <i className="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
                                <h4 className="text-lg font-medium text-gray-900 mb-2">Loading Translations</h4>
                                <p className="text-gray-600">Please wait while we fetch the translation data...</p>
                            </div>
                        </Card.Body>
                    </Card>
                )}

                {!languagesLoading && (
                    <>
                        {/* Statistics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                                <div className="flex items-center">
                                    <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                                        <i className="fas fa-globe text-2xl"></i>
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-3xl font-bold">{totalLanguages}</div>
                                        <div className="text-blue-100">Total Languages</div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                                <div className="flex items-center">
                                    <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                                        <i className="fas fa-check-circle text-2xl"></i>
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-3xl font-bold">{activeLanguages}</div>
                                        <div className="text-green-100">Active Languages</div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
                                <div className="flex items-center">
                                    <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                                        <i className="fas fa-star text-2xl"></i>
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-3xl font-bold">{defaultLanguage}</div>
                                        <div className="text-yellow-100">Default Language</div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                                <div className="flex items-center">
                                    <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                                        <i className="fas fa-database text-2xl"></i>
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-3xl font-bold">{cachedEntries}</div>
                                        <div className="text-purple-100">Cached Entries</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Translation Management Section */}
                        <Card>
                            <Card.Header>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                            <i className="fas fa-list mr-2 text-blue-600"></i>
                                            Translation Management
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-600">
                                            Manage languages, translations, and cache settings for optimal performance.
                                        </p>
                                    </div>
                                </div>
                            </Card.Header>
                            <Card.Body>
                                <div className="border-b border-gray-200">
                                    <nav className="-mb-px flex space-x-8">
                                        <button
                                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'languages'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                }`}
                                            onClick={() => toggleTab('languages')}
                                        >
                                            <i className="fas fa-globe mr-2"></i>
                                            {t('languages.title', 'Languages')}
                                        </button>
                                        <button
                                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'translations'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                }`}
                                            onClick={() => toggleTab('translations')}
                                        >
                                            <i className="fas fa-language mr-2"></i>
                                            {t('translations.title', 'Translations')}
                                        </button>
                                        <button
                                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'edit-translations'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                }`}
                                            onClick={() => toggleTab('edit-translations')}
                                        >
                                            <i className="fas fa-edit mr-2"></i>
                                            Edit Translations
                                        </button>
                                        <button
                                            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'cache'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                                }`}
                                            onClick={() => toggleTab('cache')}
                                        >
                                            <i className="fas fa-database mr-2"></i>
                                            {t('cache.title', 'Cache Management')}
                                        </button>
                                    </nav>
                                </div>

                                <div className="mt-6">
                                    {activeTab === 'languages' && (
                                        <div>
                                            <LanguagesTab languages={languages} />
                                        </div>
                                    )}
                                    {activeTab === 'translations' && (
                                        <div>
                                            <TranslationsTab languages={languages} />
                                        </div>
                                    )}
                                    {activeTab === 'edit-translations' && (
                                        <div>
                                            <EditableTranslationsTab languages={languages} />
                                        </div>
                                    )}
                                    {activeTab === 'cache' && (
                                        <div>
                                            <CacheManagementTab
                                                cacheStats={cacheStats}
                                                isLoading={cacheStatsLoading}
                                            />
                                        </div>
                                    )}
                                </div>
                            </Card.Body>
                        </Card>
                    </>
                )}
            </div>
        </div>
    );
};

export { TranslationsPage };
export default TranslationsPage;
