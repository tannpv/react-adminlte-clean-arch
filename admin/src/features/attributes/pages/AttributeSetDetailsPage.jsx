import React, { useState } from 'react';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';
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
            <div className="page-card">
                <div className="page-header">
                    <div>
                        <h2 className="page-title">Loading...</h2>
                    </div>
                </div>
                <div className="page-body">
                    <div className="text-center">
                        <div className="spinner-border" role="status">
                            <span className="sr-only">Loading...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (setError) {
        return (
            <div className="page-card">
                <div className="page-header">
                    <div>
                        <h2 className="page-title">Error</h2>
                    </div>
                </div>
                <div className="page-body">
                    <div className="alert alert-danger" role="alert">
                        {setError?.message || 'Failed to load attribute set'}
                    </div>
                </div>
            </div>
        );
    }

    if (!attributeSet) {
        return (
            <div className="page-card">
                <div className="page-header">
                    <div>
                        <h2 className="page-title">Not Found</h2>
                    </div>
                </div>
                <div className="page-body">
                    <div className="alert alert-warning" role="alert">
                        Attribute set not found.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="page-card">
                <div className="page-header">
                    <div>
                        <h2 className="page-title">
                            <button
                                className="btn btn-sm btn-outline-secondary mr-3"
                                onClick={onBack}
                                title={t('back_to_attribute_sets', 'Back to Attribute Sets')}
                            >
                                <i className="fas fa-arrow-left"></i>
                            </button>
                            <i className="fas fa-layer-group mr-2"></i>
                            {attributeSet.name}
                        </h2>
                        <p className="page-subtitle">
                            {attributeSet.description || t('manage_attributes_assigned_to_set', 'Manage attributes assigned to this set.')}
                        </p>
                    </div>
                    <div className="page-actions">
                        <button
                            className="btn btn-primary"
                            onClick={handleAddAttribute}
                            disabled={addAttributeMutation.isPending || !can('attribute-sets:update')}
                            title={!can('attribute-sets:update') ? t('not_allowed', 'Not allowed') : undefined}
                        >
                            <i className="fas fa-plus mr-2"></i>
                            {t('add_attribute', 'Add Attribute')}
                        </button>
                    </div>
                </div>

                <div className="page-body">
                    <div className="row mb-4">
                        <div className="col-md-6">
                            <div className="info-box">
                                <span className="info-box-icon bg-primary">
                                    <i className="fas fa-layer-group"></i>
                                </span>
                                <div className="info-box-content">
                                    <span className="info-box-text">{t('total_attributes', 'Total Attributes')}</span>
                                    <span className="info-box-number">
                                        {attributeSet.attributes?.length || 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="info-box">
                                <span className="info-box-icon bg-success">
                                    <i className="fas fa-tag"></i>
                                </span>
                                <div className="info-box-content">
                                    <span className="info-box-text">{t('set_type', 'Set Type')}</span>
                                    <span className="info-box-number">
                                        {attributeSet.isSystem ? t('system', 'System') : t('custom', 'Custom')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h5 className="card-title mb-0">{t('assigned_attributes', 'Assigned Attributes')}</h5>
                        </div>
                        <div className="card-body">
                            {!attributeSet.attributes || attributeSet.attributes.length === 0 ? (
                                <div className="empty-state">
                                    <h5>{t('no_attributes_assigned', 'No attributes assigned')}</h5>
                                    <p className="mb-0 text-muted">{t('add_attributes_to_set', 'Add attributes to this set to get started.')}</p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-bordered table-striped">
                                        <thead>
                                            <tr>
                                                <th>{t('sort_order', 'Sort Order')}</th>
                                                <th>{t('code', 'Code')}</th>
                                                <th>{t('name', 'Name')}</th>
                                                <th>{t('input_type', 'Input Type')}</th>
                                                <th>{t('data_type', 'Data Type')}</th>
                                                <th>{t('unit', 'Unit')}</th>
                                                <th>{t('required', 'Required')}</th>
                                                <th>{t('actions', 'Actions')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {attributeSet.attributes
                                                .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                                                .map((attribute) => (
                                                    <tr key={attribute.id}>
                                                        <td>{attribute.sortOrder || 0}</td>
                                                        <td>
                                                            <code>{attribute.code}</code>
                                                        </td>
                                                        <td>{attribute.name}</td>
                                                        <td>
                                                            <span className="badge badge-info">
                                                                {getInputTypeLabel(attribute.inputType)}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span className="badge badge-secondary">
                                                                {getDataTypeLabel(attribute.dataType)}
                                                            </span>
                                                        </td>
                                                        <td>{attribute.unit || '-'}</td>
                                                        <td>
                                                            {attribute.isRequired ? (
                                                                <span className="badge badge-danger">{t('required', 'Required')}</span>
                                                            ) : (
                                                                <span className="badge badge-light">{t('optional', 'Optional')}</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <button
                                                                className="btn btn-sm btn-danger"
                                                                onClick={() => handleRemoveAttribute(attribute)}
                                                                disabled={removeAttributeMutation.isPending || !can('attribute-sets:update')}
                                                                title={!can('attribute-sets:update') ? t('not_allowed', 'Not allowed') : undefined}
                                                            >
                                                                <i className="fas fa-trash"></i> {t('remove', 'Remove')}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
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