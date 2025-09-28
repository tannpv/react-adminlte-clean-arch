import React, { useState } from 'react';
import Button from '../../../shared/components/ui/Button';
import Table from '../../../shared/components/ui/Table';
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
            <div className="flex justify-between items-center mb-6">
                <h5 className="text-lg font-medium text-gray-900 mb-0">{t('languages.title', 'Supported Languages')}</h5>
                <Button
                    variant="primary"
                    onClick={handleCreateLanguage}
                >
                    <i className="fas fa-plus mr-2"></i>
                    {t('add_language', 'Add Language')}
                </Button>
            </div>

            {languages.length > 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h5 className="text-lg font-semibold text-gray-900 flex items-center">
                            <i className="fas fa-list mr-2 text-blue-600"></i>
                            Language Management
                        </h5>
                        <p className="text-gray-600 mt-1">
                            Manage supported languages for your application. Add new languages, set default language, and control language availability.
                        </p>
                    </div>

                    <Table hover darkHeader>
                        <Table.Header>
                            <Table.HeaderCell>
                                <i className="fas fa-flag mr-2"></i>
                                Flag
                            </Table.HeaderCell>
                            <Table.HeaderCell>
                                <i className="fas fa-code mr-2"></i>
                                Code
                            </Table.HeaderCell>
                            <Table.HeaderCell>
                                <i className="fas fa-language mr-2"></i>
                                Name
                            </Table.HeaderCell>
                            <Table.HeaderCell>
                                <i className="fas fa-globe mr-2"></i>
                                Native Name
                            </Table.HeaderCell>
                            <Table.HeaderCell>
                                <i className="fas fa-toggle-on mr-2"></i>
                                Status
                            </Table.HeaderCell>
                            <Table.HeaderCell>
                                <i className="fas fa-star mr-2"></i>
                                Default
                            </Table.HeaderCell>
                            <Table.HeaderCell className="text-center">
                                <i className="fas fa-cogs mr-2"></i>
                                Actions
                            </Table.HeaderCell>
                        </Table.Header>
                        <Table.Body>
                            {languages.map((language) => (
                                <Table.Row key={language.id}>
                                    <Table.Cell>
                                        <span style={{ fontSize: '1.5em' }}>
                                            {language.flagIcon || '🌐'}
                                        </span>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {language.code}
                                        </span>
                                    </Table.Cell>
                                    <Table.Cell className="font-medium text-gray-900">
                                        {language.name}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {language.nativeName}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${language.isActive
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {language.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </Table.Cell>
                                    <Table.Cell>
                                        {language.isDefault && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                Default
                                            </span>
                                        )}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <div className="flex justify-center space-x-2">
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                outline
                                                onClick={() => handleEditLanguage(language)}
                                                title="Edit Language"
                                            >
                                                <i className="fas fa-edit mr-1"></i>
                                                Edit
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                outline
                                                onClick={() => handleDeleteLanguage(language)}
                                                disabled={language.isDefault}
                                                title="Delete Language"
                                            >
                                                <i className="fas fa-trash mr-1"></i>
                                                Delete
                                            </Button>
                                        </div>
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table>
                </div>
            ) : (
                <div className="text-center py-12">
                    <i className="fas fa-language text-6xl text-gray-400 mb-4"></i>
                    <p className="text-gray-500 mb-4">No languages configured yet.</p>
                    <Button
                        variant="primary"
                        onClick={handleCreateLanguage}
                    >
                        <i className="fas fa-plus mr-2"></i>
                        {t('add_language', 'Add Your First Language')}
                    </Button>
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
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setDeleteConfirm(null)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <i className="fas fa-exclamation-triangle text-red-600"></i>
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                            {t('delete_language', 'Confirm Delete')}
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                Are you sure you want to delete the language "{deleteConfirm?.name}"?
                                                This action cannot be undone.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <Button
                                    variant="danger"
                                    onClick={confirmDelete}
                                    disabled={deleteLanguageMutation.isPending}
                                >
                                    {deleteLanguageMutation.isPending ? 'Deleting...' : t('delete_language', 'Delete')}
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => setDeleteConfirm(null)}
                                    className="ml-3"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LanguagesTab;