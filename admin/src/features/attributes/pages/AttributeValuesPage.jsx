import React, { useState } from 'react';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';
import Button from '../../../shared/components/ui/Button';
import Card from '../../../shared/components/ui/Card';
import Form from '../../../shared/components/ui/Form';
import Table from '../../../shared/components/ui/Table';
import { usePermissions } from '../../../shared/hooks/usePermissions';
import { useLanguage, useTranslation } from '../../../shared/hooks/useTranslation';
import { AttributeValueForm } from '../components/AttributeValueForm';
import { useAttributeValues, useDeleteAttributeValue } from '../hooks/useAttributeValues';
import { useAttributes } from '../hooks/useAttributes';

export const AttributeValuesPage = () => {
    const [showForm, setShowForm] = useState(false);
    const [editingAttributeValue, setEditingAttributeValue] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [selectedAttributeId, setSelectedAttributeId] = useState('');

    const { data: attributeValues = [], isLoading, error } = useAttributeValues();
    const { data: attributes = [] } = useAttributes();
    const deleteAttributeValueMutation = useDeleteAttributeValue();
    const { can } = usePermissions();
    const { languageCode } = useLanguage();
    const { t } = useTranslation(languageCode, 'attributes');

    const handleEdit = (attributeValue) => {
        if (!can('attribute-values:update')) return;
        setEditingAttributeValue(attributeValue);
        setShowForm(true);
    };

    const handleDelete = (attributeValue) => {
        if (!can('attribute-values:delete')) return;
        setDeleteConfirm(attributeValue);
    };

    const confirmDelete = () => {
        if (deleteConfirm) {
            deleteAttributeValueMutation.mutate(deleteConfirm.id, {
                onSuccess: () => {
                    setDeleteConfirm(null);
                },
            });
        }
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditingAttributeValue(null);
    };

    const getAttributeName = (attributeId) => {
        const attribute = attributes.find(attr => attr.id === attributeId);
        return attribute ? attribute.name : `Attribute ${attributeId}`;
    };

    const filteredAttributeValues = selectedAttributeId
        ? attributeValues.filter(av => av.attributeId === parseInt(selectedAttributeId))
        : attributeValues;

    if (isLoading) {
        return (
            <div>
                <Card>
                    <Card.Body>
                        <div className="text-center py-12">
                            <i className="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
                            <h4 className="text-lg font-medium text-gray-900 mb-2">{t('loading_attribute_values', 'Loading Attribute Values')}</h4>
                            <p className="text-gray-600">{t('loading_attribute_values_description', 'Please wait while we fetch the attribute values...')}</p>
                        </div>
                    </Card.Body>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <Card>
                    <Card.Body>
                        <div className="text-center py-12">
                            <i className="fas fa-exclamation-circle text-4xl text-red-400 mb-4"></i>
                            <h4 className="text-lg font-medium text-gray-900 mb-2">{t('failed_to_load_attribute_values', 'Failed to Load Attribute Values')}</h4>
                            <p className="text-gray-600 mb-6">
                                {error?.message || t('unexpected_error_loading_attribute_values', 'An unexpected error occurred while loading attribute values.')}
                            </p>
                            <Button
                                variant="outline-primary"
                                onClick={() => window.location.reload()}
                            >
                                <i className="fas fa-redo mr-2"></i>
                                {t('try_again', 'Try Again')}
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            </div>
        );
    }

    return (
        <>
            <div>
                {/* Page Header */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                <i className="fas fa-list mr-3 text-blue-600"></i>
                                {t('attribute_values', 'Attribute Values')}
                            </h1>
                            <p className="mt-2 text-gray-600 max-w-2xl">
                                {t('manage_attribute_values_description', 'Manage attribute values like "Red", "Blue", "Small", "Large" for your attributes')}
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            {can('attribute-values:create') && (
                                <Button
                                    variant="primary"
                                    onClick={() => setShowForm(true)}
                                >
                                    <i className="fas fa-plus mr-2"></i>
                                    {t('add_new_value', 'Add New Value')}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Attribute Values Content */}
                <div className="space-y-6">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                            <div className="flex items-center">
                                <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                                    <i className="fas fa-list-ul text-2xl"></i>
                                </div>
                                <div className="ml-4">
                                    <div className="text-3xl font-bold">{attributeValues.length}</div>
                                    <div className="text-blue-100">{t('total_values', 'Total Values')}</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                            <div className="flex items-center">
                                <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                                    <i className="fas fa-tag text-2xl"></i>
                                </div>
                                <div className="ml-4">
                                    <div className="text-3xl font-bold">
                                        {new Set(attributeValues.map(av => av.attributeId)).size}
                                    </div>
                                    <div className="text-green-100">{t('unique_attributes', 'Unique Attributes')}</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                            <div className="flex items-center">
                                <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                                    <i className="fas fa-filter text-2xl"></i>
                                </div>
                                <div className="ml-4">
                                    <div className="text-3xl font-bold">
                                        {filteredAttributeValues.length}
                                    </div>
                                    <div className="text-purple-100">{t('filtered_values', 'Filtered Values')}</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                            <div className="flex items-center">
                                <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                                    <i className="fas fa-sort-numeric-up text-2xl"></i>
                                </div>
                                <div className="ml-4">
                                    <div className="text-3xl font-bold">
                                        {attributeValues.filter(av => av.sortOrder > 0).length}
                                    </div>
                                    <div className="text-orange-100">{t('sorted_values', 'Sorted Values')}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Attribute Values List Section */}
                    <Card>
                        <Card.Header>
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                        <i className="fas fa-list mr-2 text-blue-600"></i>
                                        {t('attribute_value_management', 'Attribute Value Management')}
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-600">
                                        {t('attribute_value_management_description', 'Manage attribute values and their sorting order. Filter by specific attributes to focus on relevant values.')}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center space-x-2">
                                <i className="fas fa-filter text-gray-400"></i>
                                <Form.Select
                                    value={selectedAttributeId}
                                    onChange={(e) => setSelectedAttributeId(e.target.value)}
                                    className="max-w-xs"
                                >
                                    <option value="">{t('all_attributes', 'All Attributes')}</option>
                                    {attributes.map(attr => (
                                        <option key={attr.id} value={attr.id}>
                                            {attr.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </div>
                        </Card.Header>
                        <Card.Body>

                            <Table hover darkHeader>
                                <Table.Header>
                                    <Table.HeaderCell>
                                        <i className="fas fa-hashtag mr-2"></i>
                                        {t('id', 'ID')}
                                    </Table.HeaderCell>
                                    <Table.HeaderCell>
                                        <i className="fas fa-tag mr-2"></i>
                                        {t('attribute', 'Attribute')}
                                    </Table.HeaderCell>
                                    <Table.HeaderCell>
                                        <i className="fas fa-list mr-2"></i>
                                        {t('value', 'Value')}
                                    </Table.HeaderCell>
                                    <Table.HeaderCell>
                                        <i className="fas fa-sort-numeric-up mr-2"></i>
                                        {t('sort_order', 'Sort Order')}
                                    </Table.HeaderCell>
                                    <Table.HeaderCell className="text-center">
                                        <i className="fas fa-cogs mr-2"></i>
                                        {t('actions', 'Actions')}
                                    </Table.HeaderCell>
                                </Table.Header>
                                <Table.Body>
                                    {filteredAttributeValues.map((attributeValue) => (
                                        <Table.Row key={attributeValue.id}>
                                            <Table.Cell className="font-medium text-gray-900">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    #{attributeValue.id}
                                                </span>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <div className="flex items-center">
                                                    <i className="fas fa-tag text-blue-600 mr-2"></i>
                                                    <span className="font-medium text-gray-900">
                                                        {getAttributeName(attributeValue.attributeId)}
                                                    </span>
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    {attributeValue.label}
                                                </span>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <span className="text-gray-500">
                                                    {attributeValue.sortOrder || 0}
                                                </span>
                                            </Table.Cell>
                                            <Table.Cell className="whitespace-nowrap">
                                                <div className="flex justify-center gap-2">
                                                    {can('attribute-values:update') && (
                                                        <Button
                                                            variant="primary"
                                                            size="sm"
                                                            outline
                                                            onClick={() => handleEdit(attributeValue)}
                                                            title={t('edit_attribute_value', 'Edit Attribute Value')}
                                                        >
                                                            <i className="fas fa-edit mr-1"></i>
                                                            {t('edit', 'Edit')}
                                                        </Button>
                                                    )}
                                                    {can('attribute-values:delete') && (
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            outline
                                                            onClick={() => handleDelete(attributeValue)}
                                                            title={t('delete_attribute_value', 'Delete Attribute Value')}
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
                        </Card.Body>
                    </Card>
                </div>

                {/* Empty States */}
                {attributeValues.length === 0 && (
                    <Card>
                        <Card.Body>
                            <div className="text-center py-12">
                                <i className="fas fa-list-ul text-6xl text-gray-300 mb-4"></i>
                                <h4 className="text-xl font-medium text-gray-900 mb-2">{t('no_attribute_values_yet', 'No Attribute Values Yet')}</h4>
                                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                    {t('get_started_add_attribute_value', 'Get started by adding your first attribute value to define product characteristics.')}
                                </p>
                                {can('attribute-values:create') && (
                                    <Button
                                        variant="primary"
                                        onClick={() => setShowForm(true)}
                                    >
                                        <i className="fas fa-plus mr-2"></i>
                                        {t('add_first_value', 'Add First Value')}
                                    </Button>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                )}

                {attributeValues.length > 0 && filteredAttributeValues.length === 0 && selectedAttributeId && (
                    <Card>
                        <Card.Body>
                            <div className="text-center py-12">
                                <i className="fas fa-filter text-6xl text-gray-300 mb-4"></i>
                                <h4 className="text-xl font-medium text-gray-900 mb-2">{t('no_values_for_attribute', 'No Values for This Attribute')}</h4>
                                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                    {t('no_values_found_for_attribute', 'No attribute values found for {{attributeName}}. Try selecting a different attribute or add new values.', { attributeName: getAttributeName(parseInt(selectedAttributeId)) })}
                                </p>
                                {can('attribute-values:create') && (
                                    <Button
                                        variant="primary"
                                        onClick={() => setShowForm(true)}
                                    >
                                        <i className="fas fa-plus mr-2"></i>
                                        {t('add_value_for_attribute', 'Add Value for {{attributeName}}', { attributeName: getAttributeName(parseInt(selectedAttributeId)) })}
                                    </Button>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                )}
            </div>

            {/* Attribute Value Form Modal */}
            {showForm && (
                <AttributeValueForm
                    show={showForm}
                    attributeValue={editingAttributeValue}
                    onClose={() => {
                        setShowForm(false);
                        setEditingAttributeValue(null);
                    }}
                />
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                show={!!deleteConfirm}
                title={t('delete_attribute_value', 'Delete Attribute Value')}
                message={t('confirm_delete_attribute_value', 'Are you sure you want to delete the value "{{label}}"? This action cannot be undone.', { label: deleteConfirm?.label })}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteConfirm(null)}
                confirmText={t('delete', 'Delete')}
                confirmClass="btn-danger"
                loading={deleteAttributeValueMutation.isLoading}
            />
        </>
    );
};

export default AttributeValuesPage;
