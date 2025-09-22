import React, { useState } from 'react';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';
import { usePermissions } from '../../../shared/hooks/usePermissions';
import { AttributeForm } from '../components/AttributeForm';
import { useAttributes, useDeleteAttribute } from '../hooks/useAttributes';

export const AttributesPage = () => {
    const [showForm, setShowForm] = useState(false);
    const [editingAttribute, setEditingAttribute] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const { data: attributes = [], isLoading, error } = useAttributes();
    const deleteAttributeMutation = useDeleteAttribute();
    const { can } = usePermissions();

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

    return (
        <>
            <div className="page-card">
                <div className="page-header">
                    <div>
                        <h2 className="page-title">Attributes</h2>
                        <p className="page-subtitle">Manage product attributes and their properties.</p>
                    </div>
                    <div className="page-actions">
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowForm(true)}
                            disabled={!can('attributes:create')}
                            title={!can('attributes:create') ? 'Not allowed' : undefined}
                        >
                            <i className="fas fa-plus"></i> Add Attribute
                        </button>
                    </div>
                </div>

                <div className="page-body">
                    {isLoading && <div>Loading...</div>}
                    {!isLoading && error && (
                        <div className="alert alert-danger" role="alert">
                            {error?.message || 'Failed to load attributes'}
                        </div>
                    )}
                    {!isLoading && !error && attributes.length > 0 && (
                        <div className="table-responsive">
                            <table className="table table-bordered table-striped">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Code</th>
                                        <th>Name</th>
                                        <th>Input Type</th>
                                        <th>Data Type</th>
                                        <th>Unit</th>
                                        <th>Created</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attributes.map((attribute) => (
                                        <tr key={attribute.id}>
                                            <td>{attribute.id}</td>
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
                                                {new Date(attribute.createdAt).toLocaleDateString()}
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-primary mr-1"
                                                    onClick={() => handleEdit(attribute)}
                                                    disabled={!can('attributes:update')}
                                                    title={!can('attributes:update') ? 'Not allowed' : undefined}
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleDelete(attribute)}
                                                    disabled={!can('attributes:delete')}
                                                    title={!can('attributes:delete') ? 'Not allowed' : undefined}
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {!isLoading && !error && attributes.length === 0 && (
                        <div className="empty-state">
                            <h5>No attributes found</h5>
                            <p className="mb-0 text-muted">Create your first attribute to get started.</p>
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
                    title="Delete Attribute"
                    message={`Are you sure you want to delete the attribute "${deleteConfirm.name}"? This action cannot be undone.`}
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteConfirm(null)}
                    isLoading={deleteAttributeMutation.isPending}
                />
            )}
        </>
    );
};