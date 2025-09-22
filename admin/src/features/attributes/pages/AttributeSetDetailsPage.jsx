import React, { useState } from 'react';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';
import { usePermissions } from '../../../shared/hooks/usePermissions';
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
                                title="Back to Attribute Sets"
                            >
                                <i className="fas fa-arrow-left"></i>
                            </button>
                            {attributeSet.name}
                        </h2>
                        <p className="page-subtitle">
                            {attributeSet.description || 'Manage attributes assigned to this set.'}
                        </p>
                    </div>
                    <div className="page-actions">
                        <button
                            className="btn btn-primary"
                            onClick={handleAddAttribute}
                            disabled={addAttributeMutation.isPending || !can('attribute-sets:update')}
                            title={!can('attribute-sets:update') ? 'Not allowed' : undefined}
                        >
                            <i className="fas fa-plus"></i> Add Attribute
                        </button>
                    </div>
                </div>

                <div className="page-body">
                    <div className="row mb-4">
                        <div className="col-md-6">
                            <div className="card">
                                <div className="card-header">
                                    <h5 className="card-title mb-0">Set Information</h5>
                                </div>
                                <div className="card-body">
                                    <dl className="row">
                                        <dt className="col-sm-4">ID:</dt>
                                        <dd className="col-sm-8">{attributeSet.id}</dd>

                                        <dt className="col-sm-4">Name:</dt>
                                        <dd className="col-sm-8">{attributeSet.name}</dd>

                                        <dt className="col-sm-4">Type:</dt>
                                        <dd className="col-sm-8">
                                            {attributeSet.isSystem ? (
                                                <span className="badge badge-success">System</span>
                                            ) : (
                                                <span className="badge badge-primary">Custom</span>
                                            )}
                                        </dd>

                                        <dt className="col-sm-4">Created:</dt>
                                        <dd className="col-sm-8">
                                            {new Date(attributeSet.createdAt).toLocaleDateString()}
                                        </dd>

                                        {attributeSet.description && (
                                            <>
                                                <dt className="col-sm-4">Description:</dt>
                                                <dd className="col-sm-8">{attributeSet.description}</dd>
                                            </>
                                        )}
                                    </dl>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="card">
                                <div className="card-header">
                                    <h5 className="card-title mb-0">Statistics</h5>
                                </div>
                                <div className="card-body">
                                    <dl className="row">
                                        <dt className="col-sm-6">Total Attributes:</dt>
                                        <dd className="col-sm-6">
                                            <span className="badge badge-info">
                                                {attributeSet.attributes?.length || 0}
                                            </span>
                                        </dd>

                                        <dt className="col-sm-6">Required Attributes:</dt>
                                        <dd className="col-sm-6">
                                            <span className="badge badge-warning">
                                                {attributeSet.attributes?.filter(attr => attr.isRequired)?.length || 0}
                                            </span>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h5 className="card-title mb-0">Assigned Attributes</h5>
                        </div>
                        <div className="card-body">
                            {!attributeSet.attributes || attributeSet.attributes.length === 0 ? (
                                <div className="empty-state">
                                    <h5>No attributes assigned</h5>
                                    <p className="mb-0 text-muted">Add attributes to this set to get started.</p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-bordered table-striped">
                                        <thead>
                                            <tr>
                                                <th>Sort Order</th>
                                                <th>Code</th>
                                                <th>Name</th>
                                                <th>Input Type</th>
                                                <th>Data Type</th>
                                                <th>Unit</th>
                                                <th>Required</th>
                                                <th>Actions</th>
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
                                                                <span className="badge badge-danger">Required</span>
                                                            ) : (
                                                                <span className="badge badge-light">Optional</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <button
                                                                className="btn btn-sm btn-danger"
                                                                onClick={() => handleRemoveAttribute(attribute)}
                                                                disabled={removeAttributeMutation.isPending || !can('attribute-sets:update')}
                                                                title={!can('attribute-sets:update') ? 'Not allowed' : undefined}
                                                            >
                                                                <i className="fas fa-trash"></i> Remove
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