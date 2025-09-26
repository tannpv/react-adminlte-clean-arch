import React, { useState } from 'react';
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
            <div className="alert alert-info">
                <i className="fas fa-info-circle mr-2"></i>
                No languages available. Please add languages first.
            </div>
        );
    }

    return (
        <div>
            <div className="row mb-3">
                <div className="col-md-6">
                    <div className="form-group">
                        <label htmlFor="languageSelect">Select Language</label>
                        <select
                            className="form-control"
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
                </div>
                <div className="col-md-6">
                    <div className="form-group">
                        <label htmlFor="searchTerm">Search Translations</label>
                        <input
                            type="text"
                            className="form-control"
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
                <div className="alert alert-info">
                    <i className="fas fa-info-circle mr-2"></i>
                    Please select a language to view translations.
                </div>
            )}

            {selectedLanguage && isLoading && (
                <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                    <p className="mt-2">Loading translations...</p>
                </div>
            )}

            {selectedLanguage && error && (
                <div className="alert alert-danger">
                    <i className="fas fa-exclamation-triangle mr-2"></i>
                    Error loading translations: {error.message}
                </div>
            )}

            {selectedLanguage && translations && (
                <div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">
                            {t('translations.title', 'Translations')} for {languages.find(l => l.code === selectedLanguage)?.name}
                        </h5>
                        <span className="badge badge-info">
                            {filteredTranslations.length} namespace(s)
                        </span>
                    </div>

                    {filteredTranslations.length === 0 ? (
                        <div className="alert alert-warning">
                            <i className="fas fa-exclamation-triangle mr-2"></i>
                            {searchTerm ? 'No translations found matching your search.' : 'No translations available for this language.'}
                        </div>
                    ) : (
                        <div className="accordion" id="translationsAccordion">
                            {filteredTranslations.map((translation, index) => (
                                <div key={translation.namespace} className="card mb-2">
                                    <div
                                        className="card-header"
                                        id={`heading-${index}`}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => {
                                            const collapse = document.getElementById(`collapse-${index}`);
                                            if (collapse) {
                                                collapse.classList.toggle('show');
                                            }
                                        }}
                                    >
                                        <h6 className="mb-0 d-flex justify-content-between align-items-center">
                                            <span>
                                                <i className="fas fa-folder mr-2"></i>
                                                {translation.namespace}
                                            </span>
                                            <span className="badge badge-secondary">
                                                {Object.keys(translation.translations).length} keys
                                            </span>
                                        </h6>
                                    </div>
                                    <div
                                        id={`collapse-${index}`}
                                        className="collapse"
                                        aria-labelledby={`heading-${index}`}
                                        data-parent="#translationsAccordion"
                                    >
                                        <div className="card-body">
                                            <div className="table-responsive">
                                                <table className="table table-sm">
                                                    <thead>
                                                        <tr>
                                                            <th style={{ width: '30%' }}>Key</th>
                                                            <th style={{ width: '70%' }}>Translation</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {Object.entries(translation.translations).map(([key, value]) => (
                                                            <tr key={key}>
                                                                <td>
                                                                    <code className="text-primary">{key}</code>
                                                                </td>
                                                                <td>
                                                                    <span className="text-dark">{value}</span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
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
