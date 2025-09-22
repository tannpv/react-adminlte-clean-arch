import React, { useState } from 'react';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';
import { usePermissions } from '../../../shared/hooks/usePermissions';
import { AttributeSetForm } from '../components/AttributeSetForm';
import { useAttributeSets, useDeleteAttributeSet } from '../hooks/useAttributeSets';

export const AttributeSetsPage = ({ onViewDetails }) => {
    const [showForm, setShowForm] = useState(false);
    const [editingAttributeSet, setEditingAttributeSet] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const { data: attributeSets = [], isLoading, error } = useAttributeSets();
    const deleteAttributeSetMutation = useDeleteAttributeSet();
    const { can } = usePermissions();

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

    return (
        <>
            <div className="page-card">
                <div className="page-header">
                    <div>
                        <h2 className="page-title">Attribute Sets</h2>
                        <p className="page-subtitle">Manage attribute sets and their assigned attributes.</p>
                    </div>
                    <div className="page-actions">
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowForm(true)}
                            disabled={!can('attribute-sets:create')}
                            title={!can('attribute-sets:create') ? 'Not allowed' : undefined}
                        >
                            <i className="fas fa-plus"></i> Add Attribute Set
                        </button>
                    </div>
                </div>

                <div className="page-body">
                    {isLoading && <div>Loading...</div>}
                    {!isLoading && error && (
                        <div className="alert alert-danger" role="alert">
                            {error?.message || 'Failed to load attribute sets'}
                        </div>
                    )}
                    {!isLoading && !error && attributeSets.length > 0 && (
                        <div className="table-responsive">
                            <table className="table table-bordered table-striped">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Description</th>
                                        <th>Type</th>
                                        <th>Attributes</th>
                                        <th>Created</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attributeSets.map((attributeSet) => (
                                        <tr key={attributeSet.id}>
                                            <td>{attributeSet.id}</td>
                                            <td>
                                                <strong>{attributeSet.name}</strong>
                                            </td>
                                            <td>{attributeSet.description || '-'}</td>
                                            <td>
                                                {attributeSet.isSystem ? (
                                                    <span className="badge badge-success">System</span>
                                                ) : (
                                                    <span className="badge badge-primary">Custom</span>
                                                )}
                                            </td>
                                            <td>
                                                <span className="badge badge-info">
                                                    {attributeSet.attributes?.length || 0} attributes
                                                </span>
                                            </td>
                                            <td>
                                                {new Date(attributeSet.createdAt).toLocaleDateString()}
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-info mr-1"
                                                    onClick={() => handleViewDetails(attributeSet)}
                                                    title="View Details & Manage Attributes"
                                                    disabled={!can('attribute-sets:read')}
                                                >
                                                    <i className="fas fa-eye"></i>
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-primary mr-1"
                                                    onClick={() => handleEdit(attributeSet)}
                                                    disabled={!can('attribute-sets:update')}
                                                    title={!can('attribute-sets:update') ? 'Not allowed' : undefined}
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                {!attributeSet.isSystem && (
                                                    <button
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => handleDelete(attributeSet)}
                                                        disabled={!can('attribute-sets:delete')}
                                                        title={!can('attribute-sets:delete') ? 'Not allowed' : undefined}
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {!isLoading && !error && attributeSets.length === 0 && (
                        <div className="empty-state">
                            <h5>No attribute sets found</h5>
                            <p className="mb-0 text-muted">Create your first attribute set to get started.</p>
                        </div>
                    )}
                </div>
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
                    title="Delete Attribute Set"
                    message={`Are you sure you want to delete the attribute set "${deleteConfirm.name}"? This action cannot be undone.`}
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteConfirm(null)}
                    isLoading={deleteAttributeSetMutation.isPending}
                />
            )}
        </>
    );
};