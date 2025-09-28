import React, { useState } from 'react';
import Button from '../../../shared/components/ui/Button';
import Table from '../../../shared/components/ui/Table';
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
        'roles', 'attributes', 'storage', 'validation', 'translations',
        'stores', 'orders'
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
                    <label htmlFor="namespaceSelect" className="block text-sm font-medium text-gray-700 mb-2">
                        Select Namespace
                    </label>
                    <select
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        name="namespaceSelect"
                        id="namespaceSelect"
                        value={selectedNamespace}
                        onChange={handleNamespaceChange}
                    >
                        <option value="">Choose a namespace...</option>
                        {namespaces.map(namespace => (
                            <option key={namespace} value={namespace}>
                                {namespace}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="searchInput" className="block text-sm font-medium text-gray-700 mb-2">
                        Search Translations
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i className="fas fa-search text-gray-400"></i>
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Search translations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center mb-4">
                <h5 className="text-lg font-medium text-gray-900">
                    {selectedLanguage && selectedNamespace
                        ? `Translations for ${selectedLanguage} - ${selectedNamespace}`
                        : 'Select language and namespace to view translations'
                    }
                </h5>
                {selectedLanguage && selectedNamespace && (
                    <Button
                        variant="primary"
                        onClick={handleCreateTranslation}
                    >
                        <i className="fas fa-plus mr-2"></i>
                        Add Translation
                    </Button>
                )}
            </div>

            {!selectedLanguage && (
                <div className="rounded-md bg-blue-50 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <i className="fas fa-info-circle text-blue-400"></i>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-blue-700">
                                Please select a language to view and edit translations.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {selectedLanguage && !selectedNamespace && (
                <div className="rounded-md bg-yellow-50 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <i className="fas fa-exclamation-triangle text-yellow-400"></i>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                Please select a namespace to view translations.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {selectedLanguage && selectedNamespace && (
                <div>
                    {isLoading && (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
                                <h4 className="text-lg font-medium text-gray-900 mb-2">Loading Translations</h4>
                                <p className="text-gray-600">Please wait while we fetch the translation data...</p>
                            </div>
                        </div>
                    )}

                    {error && (
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

                    {!isLoading && !error && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h5 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <i className="fas fa-list mr-2 text-blue-600"></i>
                                    Translation Management
                                </h5>
                                <p className="text-gray-600 mt-1">
                                    Manage translations for the selected language and namespace. Edit existing translations or add new ones.
                                </p>
                            </div>

                            <Table hover darkHeader>
                                <Table.Header>
                                    <Table.HeaderCell>
                                        <i className="fas fa-key mr-2"></i>
                                        Key
                                    </Table.HeaderCell>
                                    <Table.HeaderCell>
                                        <i className="fas fa-language mr-2"></i>
                                        Value
                                    </Table.HeaderCell>
                                    <Table.HeaderCell>
                                        <i className="fas fa-sticky-note mr-2"></i>
                                        Notes
                                    </Table.HeaderCell>
                                    <Table.HeaderCell className="text-center">
                                        <i className="fas fa-cogs mr-2"></i>
                                        Actions
                                    </Table.HeaderCell>
                                </Table.Header>
                                <Table.Body>
                                    {filteredTranslations.map((translation) => (
                                        <Table.Row key={translation.id}>
                                            <Table.Cell className="font-medium text-gray-900">
                                                <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">
                                                    {translation.keyPath}
                                                </code>
                                            </Table.Cell>
                                            <Table.Cell>
                                                {translation.value || <span className="text-gray-400 italic">No translation</span>}
                                            </Table.Cell>
                                            <Table.Cell>
                                                {translation.notes || <span className="text-gray-400 italic">No notes</span>}
                                            </Table.Cell>
                                            <Table.Cell>
                                                <div className="flex justify-center space-x-2">
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        outline
                                                        onClick={() => handleEditTranslation(translation)}
                                                        title="Edit Translation"
                                                    >
                                                        <i className="fas fa-edit mr-1"></i>
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        outline
                                                        onClick={() => handleDeleteTranslation(translation)}
                                                        title="Delete Translation"
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
                    )}

                    {!isLoading && !error && filteredTranslations.length === 0 && (
                        <div className="text-center py-12">
                            <i className="fas fa-language text-6xl text-gray-400 mb-4"></i>
                            <p className="text-gray-500 mb-4">
                                {searchTerm ? 'No translations found matching your search.' : 'No translations found for this language and namespace.'}
                            </p>
                            {!searchTerm && (
                                <Button
                                    variant="primary"
                                    onClick={handleCreateTranslation}
                                >
                                    <i className="fas fa-plus mr-2"></i>
                                    Add First Translation
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            )}

            <TranslationEditModal
                isOpen={isModalOpen}
                toggle={() => setIsModalOpen(false)}
                translation={editingTranslation}
                onSave={handleSaveTranslation}
                isLoading={createTranslationMutation.isPending || updateTranslationMutation.isPending}
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
                                            Confirm Delete Translation
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                Are you sure you want to delete the translation for "{deleteConfirm?.keyPath}"?
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
                                    disabled={deleteTranslationMutation.isPending}
                                >
                                    {deleteTranslationMutation.isPending ? 'Deleting...' : 'Delete'}
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

export default EditableTranslationsTab;