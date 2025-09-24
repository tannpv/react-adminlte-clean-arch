import React, { useState } from 'react';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';
import { usePermissions } from '../../../shared/hooks/usePermissions';
import { useLanguage, useTranslation } from '../../../shared/hooks/useTranslation';
import { AttributeForm } from '../components/AttributeForm';
import { useAttributes, useDeleteAttribute } from '../hooks/useAttributes';
import Button from '../../../shared/components/ui/Button';
import Table from '../../../shared/components/ui/Table';

export const AttributesPage = () => {
    const { can } = usePermissions();
    const { languageCode } = useLanguage();
    const { t } = useTranslation(languageCode, 'attributes');
    const [showForm, setShowForm] = useState(false);
    const [editingAttribute, setEditingAttribute] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const { data: attributes = [], isLoading, error } = useAttributes();
    const deleteAttributeMutation = useDeleteAttribute();

    const handleEdit = (attribute) => {
        if (!can('attributes:update')) return;
        setEditingAttribute(attribute);
        setShowForm(true);
    };

    const handleDelete = (attribute) => {
        if (!can('attributes:delete')) return;
        setDeleteConfirm(attribute);
    };

    const confirmDelete = () => {
        if (deleteConfirm) {
            deleteAttributeMutation.mutate(deleteConfirm.id, {
                onSuccess: () => {
                    setDeleteConfirm(null);
                },
            });
        }
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditingAttribute(null);
    };

    const getInputTypeLabel = (inputType) => {
        const labels = {
            select: t('input_type_select', 'Select'),
            multiselect: t('input_type_multiselect', 'Multi-select'),
            text: t('input_type_text', 'Text'),
            number: t('input_type_number', 'Number'),
            boolean: t('input_type_boolean', 'Boolean'),
        };
        return labels[inputType] || inputType;
    };

    const getDataTypeLabel = (dataType) => {
        const labels = {
            string: t('data_type_string', 'String'),
            number: t('data_type_number', 'Number'),
            boolean: t('data_type_boolean', 'Boolean'),
        };
        return labels[dataType] || dataType;
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center py-8">
                    <i className="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">{t('loading_attributes', 'Loading Attributes')}</h4>
                    <p className="text-gray-600">{t('loading_attributes_description', 'Please wait while we fetch the attributes...')}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center py-8">
                    <i className="fas fa-exclamation-circle text-4xl text-red-500 mb-4"></i>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">{t('failed_to_load_attributes', 'Failed to Load Attributes')}</h4>
                    <p className="text-gray-600 mb-4">
                        {error?.message || t('unexpected_error_loading_attributes', 'An unexpected error occurred while loading attributes.')}
                    </p>
                    <Button
                        variant="primary"
                        outline
                        onClick={() => window.location.reload()}
                    >
                        <i className="fas fa-redo mr-2"></i>
                        {t('try_again', 'Try Again')}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-lg shadow-md">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                                <i className="fas fa-tags mr-3 text-blue-600"></i>
                                {t('attributes', 'Attributes')}
                            </h2>
                            <p className="text-gray-600 mt-1">
                                {t('page_subtitle', 'Manage product attributes and their properties. Define characteristics like color, size, and material for your products.')}
                            </p>
                        </div>
                        <div>
                            {can('attributes:create') && (
                                <Button
                                    variant="primary"
                                    onClick={() => setShowForm(true)}
                                >
                                    <i className="fas fa-plus mr-2"></i>
                                    {t('add_attribute', 'Add Attribute')}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {attributes.length > 0 && (
                        <div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                                    <div className="flex items-center">
                                        <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                                            <i className="fas fa-tags text-2xl"></i>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-3xl font-bold">{attributes.length}</div>
                                            <div className="text-blue-100">{t('total_attributes', 'Total Attributes')}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                                    <div className="flex items-center">
                                        <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                                            <i className="fas fa-list text-2xl"></i>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-3xl font-bold">
                                                {attributes.filter(attr => attr.inputType === 'select' || attr.inputType === 'multiselect').length}
                                            </div>
                                            <div className="text-green-100">{t('select_attributes', 'Select Attributes')}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                                    <div className="flex items-center">
                                        <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                                            <i className="fas fa-keyboard text-2xl"></i>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-3xl font-bold">
                                                {attributes.filter(attr => attr.inputType === 'text' || attr.inputType === 'number').length}
                                            </div>
                                            <div className="text-purple-100">{t('input_attributes', 'Input Attributes')}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                                    <div className="flex items-center">
                                        <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                                            <i className="fas fa-ruler text-2xl"></i>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-3xl font-bold">
                                                {attributes.filter(attr => attr.unit).length}
                                            </div>
                                            <div className="text-orange-100">{t('with_units', 'With Units')}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h5 className="text-lg font-semibold text-gray-900 flex items-center">
                                        <i className="fas fa-list mr-2 text-blue-600"></i>
                                        {t('attribute_management', 'Attribute Management')}
                                    </h5>
                                    <p className="text-gray-600 mt-1">
                                        {t('attribute_management_description', 'Manage existing attributes, their input types, and data types. Attributes define the characteristics that can be assigned to products.')}
                                    </p>
                                </div>

                                <Table hover darkHeader>
                                    <Table.Header>
                                        <Table.HeaderCell>
                                            <i className="fas fa-hashtag mr-2"></i>
                                            {t('id', 'ID')}
                                        </Table.HeaderCell>
                                        <Table.HeaderCell>
                                            <i className="fas fa-code mr-2"></i>
                                            {t('code', 'Code')}
                                        </Table.HeaderCell>
                                        <Table.HeaderCell>
                                            <i className="fas fa-tag mr-2"></i>
                                            {t('name', 'Name')}
                                        </Table.HeaderCell>
                                        <Table.HeaderCell>
                                            <i className="fas fa-keyboard mr-2"></i>
                                            {t('input_type', 'Input Type')}
                                        </Table.HeaderCell>
                                        <Table.HeaderCell>
                                            <i className="fas fa-database mr-2"></i>
                                            {t('data_type', 'Data Type')}
                                        </Table.HeaderCell>
                                        <Table.HeaderCell>
                                            <i className="fas fa-ruler mr-2"></i>
                                            {t('unit', 'Unit')}
                                        </Table.HeaderCell>
                                        <Table.HeaderCell>
                                            <i className="fas fa-calendar mr-2"></i>
                                            {t('created', 'Created')}
                                        </Table.HeaderCell>
                                        <Table.HeaderCell className="text-center">
                                            <i className="fas fa-cogs mr-2"></i>
                                            {t('actions', 'Actions')}
                                        </Table.HeaderCell>
                                    </Table.Header>
                                    <Table.Body>
                                        {attributes.map((attribute) => (
                                            <Table.Row key={attribute.id}>
                                                <Table.Cell className="font-medium text-gray-900">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        #{attribute.id}
                                                    </span>
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">
                                                        {attribute.code}
                                                    </code>
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <span className="font-medium text-gray-900">{attribute.name}</span>
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {getInputTypeLabel(attribute.inputType)}
                                                    </span>
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        {getDataTypeLabel(attribute.dataType)}
                                                    </span>
                                                </Table.Cell>
                                                <Table.Cell>
                                                    {attribute.unit ? (
                                                        <span className="text-gray-700">{attribute.unit}</span>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <span className="text-gray-500">
                                                        {new Date(attribute.createdAt).toLocaleDateString()}
                                                    </span>
                                                </Table.Cell>
                                                <Table.Cell>
                                                    <div className="flex justify-center space-x-2">
                                                        {can('attributes:update') && (
                                                            <Button
                                                                variant="primary"
                                                                size="sm"
                                                                outline
                                                                onClick={() => handleEdit(attribute)}
                                                                title={t('edit_attribute', 'Edit Attribute')}
                                                            >
                                                                <i className="fas fa-edit mr-1"></i>
                                                                {t('edit', 'Edit')}
                                                            </Button>
                                                        )}
                                                        {can('attributes:delete') && (
                                                            <Button
                                                                variant="danger"
                                                                size="sm"
                                                                outline
                                                                onClick={() => handleDelete(attribute)}
                                                                title={t('delete_attribute', 'Delete Attribute')}
                                                            >
                                                                <i className="fas fa-trash mr-1"></i>
                                                                {t('delete', 'Delete')}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </Table.Cell>
                                            </Table.Row>
                                        ))}
                                    </Table.Body>
                                </Table>
                            </div>
                        </div>
                    )}

                    {attributes.length === 0 && (
                        <div className="text-center py-12">
                            <i className="fas fa-tags text-6xl text-gray-300 mb-4"></i>
                            <h4 className="text-xl font-medium text-gray-900 mb-2">{t('no_attributes_yet', 'No Attributes Yet')}</h4>
                            <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                {t('get_started_add_attribute', 'Get started by adding your first attribute to define product characteristics like color, size, and material.')}
                            </p>
                            {can('attributes:create') && (
                                <Button
                                    variant="primary"
                                    onClick={() => setShowForm(true)}
                                >
                                    <i className="fas fa-plus mr-2"></i>
                                    {t('add_first_attribute', 'Add First Attribute')}
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {showForm && (
                <AttributeForm
                    attribute={editingAttribute}
                    onClose={handleFormClose}
                />
            )}

            {deleteConfirm && (
                <ConfirmModal
                    show={!!deleteConfirm}
                    title={t('delete_attribute', 'Delete Attribute')}
                    message={`${t('confirm_delete_attribute', 'Are you sure you want to delete the attribute')} "${deleteConfirm.name}"? ${t('action_cannot_be_undone', 'This action cannot be undone.')}`}
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteConfirm(null)}
                    isLoading={deleteAttributeMutation.isPending}
                />
            )}
        </>
    );
};