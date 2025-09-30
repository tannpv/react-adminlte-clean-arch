import React, { useState } from 'react';
import { useTranslation } from '../../../shared/hooks/useTranslation';
import { useAllTranslations, useCreateTranslation, useDeleteTranslation, useUpdateTranslation } from '../hooks/useTranslations';
import TranslationEditModal from './TranslationEditModal';

const EditableTranslationsTab = ({ languages = [] }) => {
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [selectedNamespace, setSelectedNamespace] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTranslation, setEditingTranslation] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const { data: translations, isLoading, error } = useAllTranslations(selectedLanguage, selectedNamespace);
    const createTranslationMutation = useCreateTranslation();
    const updateTranslationMutation = useUpdateTranslation();
    const deleteTranslationMutation = useDeleteTranslation();
    const { t } = useTranslation('en', 'translations');

    const namespaces = [
        'common', 'auth', 'products', 'users', 'categories',
        'roles', 'attributes', 'storage', 'validation', 'translations'
    ];

    const handleLanguageChange = (e) => {
        setSelectedLanguage(e.target.value);
        setSearchTerm(''); // Clear search when changing language
    };

    const handleNamespaceChange = (e) => {
        setSelectedNamespace(e.target.value);
        setSearchTerm(''); // Clear search when changing namespace
    };

    const handleCreateTranslation = () => {
        setEditingTranslation(null);
        setIsModalOpen(true);
    };

    const handleEditTranslation = (translation) => {
        setEditingTranslation(translation);
        setIsModalOpen(true);
    };

    const handleDeleteTranslation = (translation) => {
        setDeleteConfirm(translation);
    };

    const confirmDelete = () => {
        if (deleteConfirm) {
            deleteTranslationMutation.mutate(deleteConfirm.id);
            setDeleteConfirm(null);
        }
    };

    const handleSaveTranslation = (formData) => {
        if (editingTranslation) {
            // Update existing translation
            updateTranslationMutation.mutate({
                id: editingTranslation.id,
                data: formData
            });
        } else {
            // Create new translation (would need keyPath from parent)
            // For now, we'll just show an error
            alert('Creating new translations requires selecting a translation key. This feature will be enhanced.');
        }
        setIsModalOpen(false);
    };

    const filteredTranslations = translations?.filter(translation =>
        !searchTerm ||
        translation.keyPath?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        translation.value?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

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
                <div className="col-md-4">
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
                <div className="col-md-4">
                    <div className="form-group">
                        <label htmlFor="namespaceSelect">Select Namespace</label>
                        <select
                            className="form-control"
                            name="namespaceSelect"
                            id="namespaceSelect"
                            value={selectedNamespace}
                            onChange={handleNamespaceChange}
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
                <div className="col-md-4">
                    <div className="form-group">
                        <label htmlFor="searchTerm">Search Translations</label>
                        <input
                            type="text"
                            className="form-control"
                            name="searchTerm"
                            id="searchTerm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by key or value..."
                            disabled={!selectedLanguage}
                        />
                    </div>
                </div>
            </div>

            {!selectedLanguage && (
                <div className="alert alert-info">
                    <i className="fas fa-info-circle mr-2"></i>
                    Please select a language to view and edit translations.
                </div>
            )}

            {selectedLanguage && (
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">
                        {t('translations.title', 'Translations')} for {languages.find(l => l.code === selectedLanguage)?.name}
                        {selectedNamespace && ` - ${selectedNamespace}`}
                    </h5>
                    <div>
                        <span className="badge badge-info mr-2">
                            {filteredTranslations.length} translation(s)
                        </span>
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={handleCreateTranslation}
                            disabled={!selectedLanguage}
                        >
                            <i className="fas fa-plus mr-1"></i>
                            Add Translation
                        </button>
                    </div>
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
                    {filteredTranslations.length === 0 ? (
                        <div className="alert alert-warning">
                            <i className="fas fa-exclamation-triangle mr-2"></i>
                            {searchTerm ? 'No translations found matching your search.' : 'No translations available for this language and namespace.'}
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th style={{ width: '25%' }}>Key</th>
                                        <th style={{ width: '45%' }}>Translation</th>
                                        <th style={{ width: '20%' }}>Notes</th>
                                        <th style={{ width: '10%' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTranslations.map((translation) => (
                                        <tr key={translation.id}>
                                            <td>
                                                <code className="text-primary">{translation.keyPath}</code>
                                            </td>
                                            <td>
                                                <div className="translation-value">
                                                    {translation.value}
                                                </div>
                                            </td>
                                            <td>
                                                <small className="text-muted">
                                                    {translation.notes || '-'}
                                                </small>
                                            </td>
                                            <td>
                                                <div className="btn-group" role="group">
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => handleEditTranslation(translation)}
                                                        title="Edit translation"
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleDeleteTranslation(translation)}
                                                        title="Delete translation"
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            <TranslationEditModal
                isOpen={isModalOpen}
                toggle={() => setIsModalOpen(false)}
                translation={editingTranslation}
                languageCode={selectedLanguage}
                onSave={handleSaveTranslation}
                isLoading={createTranslationMutation.isPending || updateTranslationMutation.isPending}
            />

            {deleteConfirm && (
                <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" role="dialog">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirm Delete</h5>
                                <button type="button" className="close" onClick={() => setDeleteConfirm(null)}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                Are you sure you want to delete this translation?
                                <br />
                                <strong>Key:</strong> {deleteConfirm?.keyPath}
                                <br />
                                <strong>Value:</strong> {deleteConfirm?.value}
                                <br />
                                <br />
                                This action cannot be undone.
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={confirmDelete}
                                    disabled={deleteTranslationMutation.isPending}
                                >
                                    {deleteTranslationMutation.isPending ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show"></div>
                </div>
            )}
        </div>
    );
};

export default EditableTranslationsTab;

