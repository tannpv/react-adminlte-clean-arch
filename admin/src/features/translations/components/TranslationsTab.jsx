import React, { useState } from 'react';
import Table from '../../../shared/components/ui/Table';
import { useTranslation } from '../../../shared/hooks/useTranslation';
import { useAllTranslationsForLanguage } from '../hooks/useTranslations';

const TranslationsTab = ({ languages = [] }) => {
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const {
        data: translations,
        isLoading,
        error
    } = useAllTranslationsForLanguage(selectedLanguage);
    const { t } = useTranslation('en', 'translations');

    const filteredTranslations = translations?.filter(translation =>
        translation.namespace.toLowerCase().includes(searchTerm.toLowerCase()) ||
        Object.keys(translation.translations).some(key =>
            key.toLowerCase().includes(searchTerm.toLowerCase()) ||
            translation.translations[key].toLowerCase().includes(searchTerm.toLowerCase())
        )
    ) || [];

    const handleLanguageChange = (e) => {
        setSelectedLanguage(e.target.value);
        setSearchTerm(''); // Clear search when changing language
    };

    if (languages.length === 0) {
        return (
            <div className="rounded-md bg-blue-50 p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <i className="fas fa-info-circle text-blue-400"></i>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-blue-700">
                            No languages available. Please add languages first.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <label htmlFor="languageSelect" className="block text-sm font-medium text-gray-700 mb-2">
                        Select Language
                    </label>
                    <select
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        name="languageSelect"
                        id="languageSelect"
                        value={selectedLanguage}
                        onChange={handleLanguageChange}
                    >
                        <option value="">Choose a language...</option>
                        {languages.map(language => (
                            <option key={language.id} value={language.code}>
                                {language.flagIcon} {language.name} ({language.code})
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700 mb-2">
                        Search Translations
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i className="fas fa-search text-gray-400"></i>
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                            name="searchTerm"
                            id="searchTerm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by namespace or translation..."
                            disabled={!selectedLanguage}
                        />
                    </div>
                </div>
            </div>

            {!selectedLanguage && (
                <div className="rounded-md bg-blue-50 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <i className="fas fa-info-circle text-blue-400"></i>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-blue-700">
                                Please select a language to view translations.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {selectedLanguage && isLoading && (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">Loading Translations</h4>
                        <p className="text-gray-600">Please wait while we fetch the translation data...</p>
                    </div>
                </div>
            )}

            {selectedLanguage && error && (
                <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <i className="fas fa-exclamation-circle text-red-400"></i>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">
                                Error loading translations: {error.message}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {selectedLanguage && translations && (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h5 className="text-lg font-medium text-gray-900 mb-0">
                            {t('translations.title', 'Translations')} for {languages.find(l => l.code === selectedLanguage)?.name}
                        </h5>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {filteredTranslations.length} namespace(s)
                        </span>
                    </div>

                    {filteredTranslations.length === 0 ? (
                        <div className="rounded-md bg-yellow-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <i className="fas fa-exclamation-triangle text-yellow-400"></i>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-yellow-700">
                                        {searchTerm ? 'No translations found matching your search.' : 'No translations available for this language.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredTranslations.map((translation, index) => (
                                <div key={translation.namespace} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                                    <div
                                        className="px-6 py-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
                                        onClick={() => {
                                            const collapse = document.getElementById(`collapse-${index}`);
                                            if (collapse) {
                                                collapse.classList.toggle('hidden');
                                            }
                                        }}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center">
                                                <i className="fas fa-folder mr-3 text-blue-600"></i>
                                                <h6 className="text-lg font-medium text-gray-900">
                                                    {translation.namespace}
                                                </h6>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    {Object.keys(translation.translations).length} keys
                                                </span>
                                                <i className="fas fa-chevron-down text-gray-400"></i>
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        id={`collapse-${index}`}
                                        className="hidden"
                                        aria-labelledby={`heading-${index}`}
                                    >
                                        <div className="p-6">
                                            <Table hover darkHeader>
                                                <Table.Header>
                                                    <Table.HeaderCell>
                                                        <i className="fas fa-key mr-2"></i>
                                                        Key
                                                    </Table.HeaderCell>
                                                    <Table.HeaderCell>
                                                        <i className="fas fa-language mr-2"></i>
                                                        Translation
                                                    </Table.HeaderCell>
                                                </Table.Header>
                                                <Table.Body>
                                                    {Object.entries(translation.translations).map(([key, value]) => (
                                                        <Table.Row key={key}>
                                                            <Table.Cell className="font-medium text-gray-900">
                                                                <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">
                                                                    {key}
                                                                </code>
                                                            </Table.Cell>
                                                            <Table.Cell>
                                                                {value}
                                                            </Table.Cell>
                                                        </Table.Row>
                                                    ))}
                                                </Table.Body>
                                            </Table>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TranslationsTab;
