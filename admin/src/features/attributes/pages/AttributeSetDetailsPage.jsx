import React, { useState } from 'react';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';
import Button from '../../../shared/components/ui/Button';
import Card from '../../../shared/components/ui/Card';
import Table from '../../../shared/components/ui/Table';
import { usePermissions } from '../../../shared/hooks/usePermissions';
import { useLanguage, useTranslation } from '../../../shared/hooks/useTranslation';
import { AttributeAssignmentModal } from '../components/AttributeAssignmentModal';
import { useAddAttributeToSet, useAttributeSet, useRemoveAttributeFromSet } from '../hooks/useAttributeSets';
import { useAttributes } from '../hooks/useAttributes';

export const AttributeSetDetailsPage = ({ id, onBack }) => {
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);
    const [removeConfirm, setRemoveConfirm] = useState(null);

    const { data: attributeSet, isLoading: setLoading, error: setError } = useAttributeSet(parseInt(id));
    const { data: allAttributes = [], isLoading: attributesLoading } = useAttributes();
    const addAttributeMutation = useAddAttributeToSet();
    const removeAttributeMutation = useRemoveAttributeFromSet();
    const { can } = usePermissions();
    const { languageCode } = useLanguage();
    const { t } = useTranslation(languageCode, 'attributes');

    const handleAddAttribute = () => {
        if (!can('attribute-sets:update')) return;
        setShowAssignmentModal(true);
    };

    const handleRemoveAttribute = (attribute) => {
        if (!can('attribute-sets:update')) return;
        console.log('handleRemoveAttribute called with:', attribute);
        setRemoveConfirm(attribute);
    };

    const confirmRemove = () => {
        console.log('confirmRemove called, removeConfirm:', removeConfirm);
        if (removeConfirm) {
            console.log('Calling mutation with:', { setId: parseInt(id), attributeId: removeConfirm.id });
            removeAttributeMutation.mutate(
                { setId: parseInt(id), attributeId: removeConfirm.id },
                {
                    onSuccess: () => {
                        console.log('Remove mutation successful');
                        setRemoveConfirm(null);
                    },
                    onError: (error) => {
                        console.error('Remove mutation failed:', error);
                    },
                }
            );
        }
    };

    const handleAssignmentSubmit = (selectedAttributeId, data) => {
        addAttributeMutation.mutate(
            { setId: parseInt(id), attributeId: selectedAttributeId, data },
            {
                onSuccess: () => {
                    setShowAssignmentModal(false);
                },
            }
        );
    };

    const getInputTypeLabel = (inputType) => {
        const labels = {
            select: 'Select',
            multiselect: 'Multi-select',
            text: 'Text',
            number: 'Number',
            boolean: 'Boolean',
        };
        return labels[inputType] || inputType;
    };

    const getDataTypeLabel = (dataType) => {
        const labels = {
            string: 'String',
            number: 'Number',
            boolean: 'Boolean',
        };
        return labels[dataType] || dataType;
    };

    if (setLoading) {
        return (
            <div className="max-w-7xl mx-auto">
                <Card>
                    <Card.Body>
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="mt-4 text-gray-600">Loading attribute set details...</p>
                        </div>
                    </Card.Body>
                </Card>
            </div>
        );
    }

    if (setError) {
        return (
            <div className="max-w-7xl mx-auto">
                <Card>
                    <Card.Body>
                        <div className="text-center py-12">
                            <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                            <h4 className="text-lg font-medium text-gray-900 mb-2">Error Loading Attribute Set</h4>
                            <p className="text-red-600">
                                {setError?.message || 'Failed to load attribute set'}
                            </p>
                        </div>
                    </Card.Body>
                </Card>
            </div>
        );
    }

    if (!attributeSet) {
        return (
            <div className="max-w-7xl mx-auto">
                <Card>
                    <Card.Body>
                        <div className="text-center py-12">
                            <i className="fas fa-search text-4xl text-gray-400 mb-4"></i>
                            <h4 className="text-lg font-medium text-gray-900 mb-2">Attribute Set Not Found</h4>
                            <p className="text-gray-600">
                                The requested attribute set could not be found.
                            </p>
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
                            <div className="flex items-center mb-2">
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={onBack}
                                    title={t('back_to_attribute_sets', 'Back to Attribute Sets')}
                                    className="mr-3"
                                >
                                    <i className="fas fa-arrow-left mr-2"></i>
                                    Back
                                </Button>
                                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                    <i className="fas fa-layer-group mr-3 text-blue-600"></i>
                                    {attributeSet.name}
                                </h1>
                            </div>
                            <p className="mt-2 text-gray-600 max-w-2xl">
                                {attributeSet.description || t('manage_attributes_assigned_to_set', 'Manage attributes assigned to this set.')}
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            {can('attribute-sets:update') && (
                                <Button
                                    variant="primary"
                                    onClick={handleAddAttribute}
                                    disabled={addAttributeMutation.isPending}
                                >
                                    <i className="fas fa-plus mr-2"></i>
                                    {t('add_attribute', 'Add Attribute')}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <i className="fas fa-layer-group text-2xl"></i>
                            </div>
                            <div className="ml-4">
                                <p className="text-blue-100 text-sm font-medium">{t('total_attributes', 'Total Attributes')}</p>
                                <p className="text-3xl font-bold">{attributeSet.attributes?.length || 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <i className="fas fa-tag text-2xl"></i>
                            </div>
                            <div className="ml-4">
                                <p className="text-green-100 text-sm font-medium">{t('set_type', 'Set Type')}</p>
                                <p className="text-3xl font-bold">
                                    {attributeSet.isSystem ? t('system', 'System') : t('custom', 'Custom')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="space-y-6">
                    <Card>
                        <Card.Header>
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                    <i className="fas fa-list mr-2 text-blue-600"></i>
                                    {t('assigned_attributes', 'Assigned Attributes')}
                                </h3>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            {!attributeSet.attributes || attributeSet.attributes.length === 0 ? (
                                <div className="text-center py-12">
                                    <i className="fas fa-tags text-4xl text-gray-300 mb-4"></i>
                                    <h4 className="text-xl font-medium text-gray-900 mb-2">{t('no_attributes_assigned', 'No Attributes Assigned')}</h4>
                                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                        {t('add_attributes_to_set', 'Add attributes to this set to get started.')}
                                    </p>
                                    {can('attribute-sets:update') && (
                                        <Button
                                            variant="primary"
                                            onClick={handleAddAttribute}
                                        >
                                            <i className="fas fa-plus mr-2"></i>
                                            {t('add_first_attribute', 'Add First Attribute')}
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <Table hover darkHeader>
                                    <Table.Header>
                                        <Table.HeaderCell>
                                            <i className="fas fa-sort mr-2"></i>
                                            {t('sort_order', 'Sort Order')}
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
                                            <i className="fas fa-exclamation-circle mr-2"></i>
                                            {t('required', 'Required')}
                                        </Table.HeaderCell>
                                        <Table.HeaderCell className="text-center">
                                            <i className="fas fa-cogs mr-2"></i>
                                            {t('actions', 'Actions')}
                                        </Table.HeaderCell>
                                    </Table.Header>
                                    <Table.Body>
                                        {attributeSet.attributes
                                            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                                            .map((attribute) => (
                                                <Table.Row key={attribute.id}>
                                                    <Table.Cell>
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                            {attribute.sortOrder || 0}
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
                                                        <span className="text-gray-500">{attribute.unit || '-'}</span>
                                                    </Table.Cell>
                                                    <Table.Cell>
                                                        {attribute.isRequired ? (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                <i className="fas fa-exclamation-circle mr-1"></i>
                                                                {t('required', 'Required')}
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                                <i className="fas fa-check-circle mr-1"></i>
                                                                {t('optional', 'Optional')}
                                                            </span>
                                                        )}
                                                    </Table.Cell>
                                                    <Table.Cell className="whitespace-nowrap">
                                                        <div className="flex justify-center gap-2">
                                                            {can('attribute-sets:update') && (
                                                                <Button
                                                                    variant="danger"
                                                                    size="sm"
                                                                    onClick={() => handleRemoveAttribute(attribute)}
                                                                    disabled={removeAttributeMutation.isPending}
                                                                    title={t('remove_attribute_from_set', 'Remove attribute from set')}
                                                                >
                                                                    <i className="fas fa-trash mr-1"></i>
                                                                    {t('remove', 'Remove')}
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </Table.Cell>
                                                </Table.Row>
                                            ))}
                                    </Table.Body>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                </div>
            </div>

            {showAssignmentModal && (
                <AttributeAssignmentModal
                    show={showAssignmentModal}
                    attributeSetId={parseInt(id)}
                    availableAttributes={allAttributes.filter(attr =>
                        !attributeSet.attributes?.some(assigned => assigned.id === attr.id)
                    )}
                    onClose={() => setShowAssignmentModal(false)}
                    onSubmit={handleAssignmentSubmit}
                    isLoading={addAttributeMutation.isPending}
                />
            )}

            {removeConfirm && (
                <ConfirmModal
                    show={!!removeConfirm}
                    title="Remove Attribute from Set"
                    message={`Are you sure you want to remove the attribute "${removeConfirm.name}" from this attribute set?`}
                    onConfirm={confirmRemove}
                    onCancel={() => setRemoveConfirm(null)}
                    isLoading={removeAttributeMutation.isPending}
                />
            )}
        </>
    );
};

export default AttributeSetDetailsPage;