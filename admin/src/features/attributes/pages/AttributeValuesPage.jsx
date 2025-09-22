import React, { useState } from 'react';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';
import { usePermissions } from '../../../shared/hooks/usePermissions';
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
            <div className="page-card">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Loading attribute values...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-card">
                <div className="alert alert-danger" role="alert">
                    <i className="fas fa-exclamation-triangle mr-2"></i>
                    <strong>Error loading attribute values:</strong> {error.message}
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="page-card">
                {/* Page Header */}
                <div className="page-header">
                    <div className="page-header-content">
                        <h1 className="page-title">
                            <i className="fas fa-list-ul mr-2"></i>
                            Attribute Values
                        </h1>
                        <p className="page-subtitle">
                            Manage attribute values like "Red", "Blue", "Small", "Large" for your attributes
                        </p>
                    </div>
                    <div className="page-actions">
                        {can('attribute-values:create') && (
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowForm(true)}
                            >
                                <i className="fas fa-plus mr-2"></i>
                                Add New Value
                            </button>
                        )}
                    </div>
                </div>

                {/* Statistics Dashboard */}
                <div className="row mb-4">
                    <div className="col-md-3">
                        <div className="stat-card">
                            <div className="stat-icon bg-primary">
                                <i className="fas fa-list-ul"></i>
                            </div>
                            <div className="stat-content">
                                <div className="stat-number">{attributeValues.length}</div>
                                <div className="stat-label">Total Values</div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="stat-card">
                            <div className="stat-icon bg-success">
                                <i className="fas fa-tags"></i>
                            </div>
                            <div className="stat-content">
                                <div className="stat-number">{attributes.length}</div>
                                <div className="stat-label">Attributes</div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="stat-card">
                            <div className="stat-icon bg-info">
                                <i className="fas fa-filter"></i>
                            </div>
                            <div className="stat-content">
                                <div className="stat-number">
                                    {new Set(attributeValues.map(av => av.attributeId)).size}
                                </div>
                                <div className="stat-label">With Values</div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="stat-card">
                            <div className="stat-icon bg-warning">
                                <i className="fas fa-chart-bar"></i>
                            </div>
                            <div className="stat-content">
                                <div className="stat-number">
                                    {attributes.length > 0 ? Math.round((new Set(attributeValues.map(av => av.attributeId)).size / attributes.length) * 100) : 0}%
                                </div>
                                <div className="stat-label">Coverage</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="row mb-4">
                    <div className="col-md-6">
                        <div className="form-group">
                            <label htmlFor="attributeFilter">Filter by Attribute:</label>
                            <select
                                id="attributeFilter"
                                className="form-control"
                                value={selectedAttributeId}
                                onChange={(e) => setSelectedAttributeId(e.target.value)}
                            >
                                <option value="">All Attributes</option>
                                {attributes.map(attribute => (
                                    <option key={attribute.id} value={attribute.id}>
                                        {attribute.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Attribute Values List */}
                <div className="card">
                    <div className="card-header">
                        <h5 className="card-title mb-0">
                            <i className="fas fa-list mr-2"></i>
                            Attribute Values
                            {selectedAttributeId && (
                                <span className="badge badge-primary ml-2">
                                    {getAttributeName(parseInt(selectedAttributeId))}
                                </span>
                            )}
                        </h5>
                    </div>
                    <div className="card-body p-0">
                        {filteredAttributeValues.length === 0 ? (
                            <div className="text-center py-5">
                                <i className="fas fa-list-ul fa-3x text-muted mb-3"></i>
                                <h5 className="text-muted">No attribute values found</h5>
                                <p className="text-muted">
                                    {selectedAttributeId
                                        ? `No values found for ${getAttributeName(parseInt(selectedAttributeId))}`
                                        : 'Create your first attribute value to get started'
                                    }
                                </p>
                                {can('attribute-values:create') && (
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => setShowForm(true)}
                                    >
                                        <i className="fas fa-plus mr-2"></i>
                                        Add First Value
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead className="thead-light">
                                        <tr>
                                            <th>ID</th>
                                            <th>Attribute</th>
                                            <th>Value</th>
                                            <th>Sort Order</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredAttributeValues.map((attributeValue) => (
                                            <tr key={attributeValue.id}>
                                                <td>
                                                    <span className="badge badge-secondary">
                                                        #{attributeValue.id}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <i className="fas fa-tag text-primary mr-2"></i>
                                                        <span className="font-weight-medium">
                                                            {getAttributeName(attributeValue.attributeId)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="badge badge-light">
                                                        {attributeValue.label}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="text-muted">
                                                        {attributeValue.sortOrder || 0}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="btn-group" role="group">
                                                        {can('attribute-values:update') && (
                                                            <button
                                                                className="btn btn-sm btn-outline-primary"
                                                                onClick={() => handleEdit(attributeValue)}
                                                                title="Edit"
                                                            >
                                                                <i className="fas fa-edit"></i>
                                                            </button>
                                                        )}
                                                        {can('attribute-values:delete') && (
                                                            <button
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() => handleDelete(attributeValue)}
                                                                title="Delete"
                                                            >
                                                                <i className="fas fa-trash"></i>
                                                            </button>
                                                        )}
                                                    </div>
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

            {/* Attribute Value Form Modal */}
            {showForm && (
                <AttributeValueForm
                    show={showForm}
                    attributeValue={editingAttributeValue}
                    onClose={handleFormClose}
                />
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                show={!!deleteConfirm}
                title="Delete Attribute Value"
                message={`Are you sure you want to delete the value "${deleteConfirm?.label}"? This action cannot be undone.`}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteConfirm(null)}
                confirmText="Delete"
                confirmClass="btn-danger"
                loading={deleteAttributeValueMutation.isLoading}
            />
        </>
    );
};
