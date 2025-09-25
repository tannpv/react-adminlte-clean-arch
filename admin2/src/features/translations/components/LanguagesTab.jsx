import React, { useState } from 'react';
import { useTranslation } from '../../../shared/hooks/useTranslation';
import { useCreateLanguage, useDeleteLanguage, useUpdateLanguage } from '../hooks/useTranslations';
import LanguageModal from './LanguageModal';

const LanguagesTab = ({ languages = [] }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLanguage, setEditingLanguage] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const createLanguageMutation = useCreateLanguage();
    const updateLanguageMutation = useUpdateLanguage();
    const deleteLanguageMutation = useDeleteLanguage();
    const { t } = useTranslation('en', 'translations');

    const handleCreateLanguage = () => {
        setEditingLanguage(null);
        setIsModalOpen(true);
    };

    const handleEditLanguage = (language) => {
        setEditingLanguage(language);
        setIsModalOpen(true);
    };

    const handleDeleteLanguage = (language) => {
        setDeleteConfirm(language);
    };

    const confirmDelete = () => {
        if (deleteConfirm) {
            deleteLanguageMutation.mutate(deleteConfirm.id);
            setDeleteConfirm(null);
        }
    };

    const handleSaveLanguage = (languageData) => {
        if (editingLanguage) {
            updateLanguageMutation.mutate({
                id: editingLanguage.id,
                data: languageData
            });
        } else {
            createLanguageMutation.mutate(languageData);
        }
        setIsModalOpen(false);
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">{t('languages.title', 'Supported Languages')}</h5>
                <button className="btn btn-primary" onClick={handleCreateLanguage}>
                    <i className="fas fa-plus mr-1"></i>
                    {t('add_language', 'Add Language')}
                </button>
            </div>

            <div className="table-responsive">
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>Flag</th>
                            <th>Code</th>
                            <th>Name</th>
                            <th>Native Name</th>
                            <th>Status</th>
                            <th>Default</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {languages.map((language) => (
                            <tr key={language.id}>
                                <td>
                                    <span style={{ fontSize: '1.5em' }}>
                                        {language.flagIcon || '🌐'}
                                    </span>
                                </td>
                                <td>
                                    <span className="badge badge-info">{language.code}</span>
                                </td>
                                <td>{language.name}</td>
                                <td>{language.nativeName}</td>
                                <td>
                                    <span className={`badge ${language.isActive ? 'badge-success' : 'badge-secondary'}`}>
                                        {language.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>
                                    {language.isDefault && (
                                        <span className="badge badge-warning">Default</span>
                                    )}
                                </td>
                                <td>
                                    <div className="btn-group" role="group">
                                        <button
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => handleEditLanguage(language)}
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDeleteLanguage(language)}
                                            disabled={language.isDefault}
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

            {languages.length === 0 && (
                <div className="text-center py-4">
                    <i className="fas fa-language fa-3x text-muted mb-3"></i>
                    <p className="text-muted">No languages configured yet.</p>
                    <button className="btn btn-primary" onClick={handleCreateLanguage}>
                        {t('add_language', 'Add Your First Language')}
                    </button>
                </div>
            )}

            <LanguageModal
                isOpen={isModalOpen}
                toggle={() => setIsModalOpen(false)}
                language={editingLanguage}
                onSave={handleSaveLanguage}
                isLoading={createLanguageMutation.isPending || updateLanguageMutation.isPending}
            />

            {deleteConfirm && (
                <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" role="dialog">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{t('delete_language', 'Confirm Delete')}</h5>
                                <button type="button" className="close" onClick={() => setDeleteConfirm(null)}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                Are you sure you want to delete the language "{deleteConfirm?.name}"?
                                This action cannot be undone.
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={confirmDelete}
                                    disabled={deleteLanguageMutation.isPending}
                                >
                                    {deleteLanguageMutation.isPending ? 'Deleting...' : t('delete_language', 'Delete')}
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

export default LanguagesTab;
