import React, { useState } from 'react';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';
import Button from '../../../shared/components/ui/Button';
import Card from '../../../shared/components/ui/Card';
import Table from '../../../shared/components/ui/Table';
import { usePermissions } from '../../../shared/hooks/usePermissions';
import { useLanguage, useTranslation } from '../../../shared/hooks/useTranslation';
import { AttributeSetForm } from '../components/AttributeSetForm';
import { useAttributeSets, useDeleteAttributeSet } from '../hooks/useAttributeSets';

export const AttributeSetsPage = ({ onViewDetails }) => {
    const [showForm, setShowForm] = useState(false);
    const [editingAttributeSet, setEditingAttributeSet] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const { data: attributeSets = [], isLoading, error } = useAttributeSets();
    const deleteAttributeSetMutation = useDeleteAttributeSet();
    const { can } = usePermissions();
    const { languageCode } = useLanguage();
    const { t } = useTranslation(languageCode, 'attributes');

    const handleEdit = (attributeSet) => {
        if (!can('attribute-sets:update')) return;
        setEditingAttributeSet(attributeSet);
        setShowForm(true);
    };

    const handleDelete = (attributeSet) => {
        if (!can('attribute-sets:delete')) return;
        setDeleteConfirm(attributeSet);
    };

    const confirmDelete = () => {
        if (deleteConfirm) {
            deleteAttributeSetMutation.mutate(deleteConfirm.id, {
                onSuccess: () => {
                    setDeleteConfirm(null);
                },
            });
        }
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditingAttributeSet(null);
    };

    const handleViewDetails = (attributeSet) => {
        if (!can('attribute-sets:read')) return;
        if (onViewDetails) {
            onViewDetails(attributeSet.id);
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto">
                <Card>
                    <Card.Body>
                        <div className="text-center py-12">
                            <i className="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
                            <h4 className="text-lg font-medium text-gray-900 mb-2">{t('loading_attribute_sets', 'Loading Attribute Sets')}</h4>
                            <p className="text-gray-600">{t('loading_attribute_sets_description', 'Please wait while we fetch the attribute sets...')}</p>
                        </div>
                    </Card.Body>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto">
                <Card>
                    <Card.Body>
                        <div className="text-center py-12">
                            <i className="fas fa-exclamation-circle text-4xl text-red-400 mb-4"></i>
                            <h4 className="text-lg font-medium text-gray-900 mb-2">{t('failed_to_load_attribute_sets', 'Failed to Load Attribute Sets')}</h4>
                            <p className="text-gray-600 mb-6">
                                {error?.message || t('unexpected_error_loading_attribute_sets', 'An unexpected error occurred while loading attribute sets.')}
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
            <div className="max-w-7xl mx-auto">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                <i className="fas fa-layer-group mr-3 text-blue-600"></i>
                                {t('attribute_sets', 'Attribute Sets')}
                            </h1>
                            <p className="mt-2 text-gray-600 max-w-2xl">
                                {t('manage_attribute_sets_description', 'Organize attributes into reusable sets for products. Create attribute sets to define common product characteristics like size, color, and material.')}
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            {can('attribute-sets:create') && (
                                <Button
                                    variant="primary"
                                    onClick={() => setShowForm(true)}
                                >
                                    <i className="fas fa-plus mr-2"></i>
                                    {t('add_attribute_set', 'Add Attribute Set')}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Attribute Sets Content */}
                <div className="space-y-6">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                            <div className="flex items-center">
                                <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                                    <i className="fas fa-layer-group text-2xl"></i>
                                </div>
                                <div className="ml-4">
                                    <div className="text-3xl font-bold">{attributeSets.length}</div>
                                    <div className="text-blue-100">{t('total_attribute_sets', 'Total Attribute Sets')}</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                            <div className="flex items-center">
                                <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                                    <i className="fas fa-lock text-2xl"></i>
                                </div>
                                <div className="ml-4">
                                    <div className="text-3xl font-bold">
                                        {attributeSets.filter(set => set.isSystem).length}
                                    </div>
                                    <div className="text-green-100">{t('system_sets', 'System Sets')}</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                            <div className="flex items-center">
                                <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                                    <i className="fas fa-user text-2xl"></i>
                                </div>
                                <div className="ml-4">
                                    <div className="text-3xl font-bold">
                                        {attributeSets.filter(set => !set.isSystem).length}
                                    </div>
                                    <div className="text-purple-100">{t('custom_sets', 'Custom Sets')}</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                            <div className="flex items-center">
                                <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                                    <i className="fas fa-list text-2xl"></i>
                                </div>
                                <div className="ml-4">
                                    <div className="text-3xl font-bold">
                                        {attributeSets.reduce((total, set) => total + (set.attributes?.length || 0), 0)}
                                    </div>
                                    <div className="text-orange-100">{t('total_attributes', 'Total Attributes')}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Attribute Sets List Section */}
                    <Card>
                        <Card.Header>
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                        <i className="fas fa-list mr-2 text-blue-600"></i>
                                        {t('attribute_set_management', 'Attribute Set Management')}
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-600">
                                        {t('attribute_set_management_description', 'Manage existing attribute sets, their assigned attributes, and properties. Attribute sets help organize product characteristics into reusable groups.')}
                                    </p>
                                </div>
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
                                        <i className="fas fa-layer-group mr-2"></i>
                                        {t('name', 'Name')}
                                    </Table.HeaderCell>
                                    <Table.HeaderCell>
                                        <i className="fas fa-info-circle mr-2"></i>
                                        {t('description', 'Description')}
                                    </Table.HeaderCell>
                                    <Table.HeaderCell>
                                        <i className="fas fa-tag mr-2"></i>
                                        {t('type', 'Type')}
                                    </Table.HeaderCell>
                                    <Table.HeaderCell>
                                        <i className="fas fa-list mr-2"></i>
                                        {t('attributes', 'Attributes')}
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
                                    {attributeSets.map((attributeSet) => (
                                        <Table.Row key={attributeSet.id}>
                                            <Table.Cell className="font-medium text-gray-900">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    #{attributeSet.id}
                                                </span>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <div>
                                                    <span className="font-medium text-gray-900">{attributeSet.name}</span>
                                                    {attributeSet.isSystem && (
                                                        <div className="text-sm text-gray-500">
                                                            {t('system_attribute_set', 'System attribute set')}
                                                        </div>
                                                    )}
                                                </div>
                                            </Table.Cell>
                                            <Table.Cell>
                                                {attributeSet.description ? (
                                                    <span className="text-gray-600">
                                                        {attributeSet.description.length > 50
                                                            ? `${attributeSet.description.substring(0, 50)}...`
                                                            : attributeSet.description
                                                        }
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </Table.Cell>
                                            <Table.Cell>
                                                {attributeSet.isSystem ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        <i className="fas fa-lock mr-1"></i>
                                                        {t('system', 'System')}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        <i className="fas fa-user mr-1"></i>
                                                        {t('custom', 'Custom')}
                                                    </span>
                                                )}
                                            </Table.Cell>
                                            <Table.Cell>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    <i className="fas fa-list mr-1"></i>
                                                    {attributeSet.attributes?.length || 0} {t('attributes', 'attributes')}
                                                </span>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <span className="text-gray-500">
                                                    {new Date(attributeSet.createdAt).toLocaleDateString()}
                                                </span>
                                            </Table.Cell>
                                            <Table.Cell className="whitespace-nowrap">
                                                <div className="flex justify-center gap-2">
                                                    {can('attribute-sets:read') && (
                                                        <Button
                                                            variant="info"
                                                            size="sm"
                                                            outline
                                                            onClick={() => handleViewDetails(attributeSet)}
                                                            title={t('view_details', 'View Details & Manage Attributes')}
                                                        >
                                                            <i className="fas fa-eye mr-1"></i>
                                                            {t('view', 'View')}
                                                        </Button>
                                                    )}
                                                    {can('attribute-sets:update') && (
                                                        <Button
                                                            variant="primary"
                                                            size="sm"
                                                            outline
                                                            onClick={() => handleEdit(attributeSet)}
                                                            title={t('edit_attribute_set', 'Edit Attribute Set')}
                                                        >
                                                            <i className="fas fa-edit mr-1"></i>
                                                            {t('edit', 'Edit')}
                                                        </Button>
                                                    )}
                                                    {can('attribute-sets:delete') && !attributeSet.isSystem && (
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            outline
                                                            onClick={() => handleDelete(attributeSet)}
                                                            title={t('delete_attribute_set', 'Delete Attribute Set')}
                                                        >
                                                            <i className="fas fa-trash mr-1"></i>
                                                            {t('delete', 'Delete')}
                                                        </Button>
                                                    )}
                                                    {attributeSet.isSystem && (
                                                        <span className="text-gray-400" title={t('system_sets_cannot_be_deleted', 'System attribute sets cannot be deleted')}>
                                                            <i className="fas fa-lock"></i>
                                                        </span>
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

                {/* Empty State */}
                {attributeSets.length === 0 && (
                    <Card>
                        <Card.Body>
                            <div className="text-center py-12">
                                <i className="fas fa-layer-group text-6xl text-gray-300 mb-4"></i>
                                <h4 className="text-xl font-medium text-gray-900 mb-2">{t('no_attribute_sets_yet', 'No Attribute Sets Yet')}</h4>
                                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                    {t('get_started_create_attribute_set', 'Get started by creating your first attribute set to organize product attributes into reusable groups.')}
                                </p>
                                {can('attribute-sets:create') && (
                                    <Button
                                        variant="primary"
                                        onClick={() => setShowForm(true)}
                                    >
                                        <i className="fas fa-plus mr-2"></i>
                                        {t('add_first_attribute_set', 'Add First Attribute Set')}
                                    </Button>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                )}
            </div>

            {showForm && (
                <AttributeSetForm
                    attributeSet={editingAttributeSet}
                    onClose={handleFormClose}
                />
            )}

            {deleteConfirm && (
                <ConfirmModal
                    show={!!deleteConfirm}
                    title={t('delete_attribute_set', 'Delete Attribute Set')}
                    message={t('confirm_delete_attribute_set', 'Are you sure you want to delete the attribute set "{{name}}"? This action cannot be undone.', { name: deleteConfirm.name })}
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteConfirm(null)}
                    confirmText={t('delete', 'Delete')}
                    confirmClass="btn-danger"
                    loading={deleteAttributeSetMutation.isPending}
                />
            )}
        </>
    );
};

export default AttributeSetsPage;