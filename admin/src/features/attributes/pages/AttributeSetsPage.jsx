import React, { useState } from 'react';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';
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
            <div className="page-card">
                <div className="loading-state">
                    <div className="loading-content">
                        <i className="fas fa-spinner fa-spin loading-icon"></i>
                        <h4 className="loading-title">{t('loading_attribute_sets', 'Loading Attribute Sets')}</h4>
                        <p className="loading-description">{t('loading_attribute_sets_description', 'Please wait while we fetch the attribute sets...')}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-card">
                <div className="error-state">
                    <div className="error-content">
                        <i className="fas fa-exclamation-circle error-icon"></i>
                        <h4 className="error-title">{t('failed_to_load_attribute_sets', 'Failed to Load Attribute Sets')}</h4>
                        <p className="error-description">
                            {error?.message || t('unexpected_error_loading_attribute_sets', 'An unexpected error occurred while loading attribute sets.')}
                        </p>
                        <button
                            className="btn btn-outline-primary"
                            onClick={() => window.location.reload()}
                        >
                            <i className="fas fa-redo mr-2"></i>
                            {t('try_again', 'Try Again')}
                        </button>
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
                            <i className="fas fa-layer-group mr-2"></i>
                            {t('attribute_sets', 'Attribute Sets')}
                        </h2>
                        <p className="page-subtitle">
                            {t('manage_attribute_sets_description', 'Organize attributes into reusable sets for products. Create attribute sets to define common product characteristics like size, color, and material.')}
                        </p>
                    </div>
                    <div className="page-actions">
                        {can('attribute-sets:create') && (
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowForm(true)}
                            >
                                <i className="fas fa-plus mr-2"></i>
                                {t('add_attribute_set', 'Add Attribute Set')}
                            </button>
                        )}
                    </div>
                </div>

                <div className="page-body">
                    {attributeSets.length > 0 && (
                        <div className="attribute-sets-content">
                            <div className="attribute-sets-stats mb-4">
                                <div className="row">
                                    <div className="col-md-3">
                                        <div className="stat-card">
                                            <div className="stat-icon">
                                                <i className="fas fa-layer-group"></i>
                                            </div>
                                            <div className="stat-content">
                                                <div className="stat-number">{attributeSets.length}</div>
                                                <div className="stat-label">{t('total_attribute_sets', 'Total Attribute Sets')}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="stat-card">
                                            <div className="stat-icon">
                                                <i className="fas fa-lock"></i>
                                            </div>
                                            <div className="stat-content">
                                                <div className="stat-number">
                                                    {attributeSets.filter(set => set.isSystem).length}
                                                </div>
                                                <div className="stat-label">{t('system_sets', 'System Sets')}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="stat-card">
                                            <div className="stat-icon">
                                                <i className="fas fa-user"></i>
                                            </div>
                                            <div className="stat-content">
                                                <div className="stat-number">
                                                    {attributeSets.filter(set => !set.isSystem).length}
                                                </div>
                                                <div className="stat-label">{t('custom_sets', 'Custom Sets')}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="stat-card">
                                            <div className="stat-icon">
                                                <i className="fas fa-list"></i>
                                            </div>
                                            <div className="stat-content">
                                                <div className="stat-number">
                                                    {attributeSets.reduce((total, set) => total + (set.attributes?.length || 0), 0)}
                                                </div>
                                                <div className="stat-label">{t('total_attributes', 'Total Attributes')}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="attribute-sets-table-section">
                                <div className="section-header">
                                    <h5 className="section-title">
                                        <i className="fas fa-list mr-2"></i>
                                        {t('attribute_set_management', 'Attribute Set Management')}
                                    </h5>
                                    <p className="section-description">
                                        {t('attribute_set_management_description', 'Manage existing attribute sets, their assigned attributes, and properties. Attribute sets help organize product characteristics into reusable groups.')}
                                    </p>
                                </div>

                                <div className="attribute-sets-list-container">
                                    <div className="table-responsive">
                                        <table className="table table-hover attribute-sets-table align-middle mb-0">
                                            <thead className="table-dark">
                                                <tr>
                                                    <th className="attribute-set-id-column">
                                                        <i className="fas fa-hashtag mr-2"></i>
                                                        {t('id', 'ID')}
                                                    </th>
                                                    <th className="attribute-set-name-column">
                                                        <i className="fas fa-layer-group mr-2"></i>
                                                        {t('name', 'Name')}
                                                    </th>
                                                    <th className="attribute-set-description-column">
                                                        <i className="fas fa-info-circle mr-2"></i>
                                                        {t('description', 'Description')}
                                                    </th>
                                                    <th className="attribute-set-type-column">
                                                        <i className="fas fa-tag mr-2"></i>
                                                        {t('type', 'Type')}
                                                    </th>
                                                    <th className="attribute-set-attributes-column">
                                                        <i className="fas fa-list mr-2"></i>
                                                        {t('attributes', 'Attributes')}
                                                    </th>
                                                    <th className="attribute-set-created-column">
                                                        <i className="fas fa-calendar mr-2"></i>
                                                        {t('created', 'Created')}
                                                    </th>
                                                    <th className="attribute-set-actions-column text-center">
                                                        <i className="fas fa-cogs mr-2"></i>
                                                        {t('actions', 'Actions')}
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {attributeSets.map((attributeSet) => (
                                                    <tr key={attributeSet.id} className="attribute-set-row">
                                                        <td className="attribute-set-id-cell">
                                                            <span className="attribute-set-id-badge">#{attributeSet.id}</span>
                                                        </td>
                                                        <td className="attribute-set-name-cell">
                                                            <div>
                                                                <span className="attribute-set-name">{attributeSet.name}</span>
                                                                {attributeSet.isSystem && (
                                                                    <small className="d-block text-muted">
                                                                        {t('system_attribute_set', 'System attribute set')}
                                                                    </small>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="attribute-set-description-cell">
                                                            {attributeSet.description ? (
                                                                <span className="text-muted">
                                                                    {attributeSet.description.length > 50
                                                                        ? `${attributeSet.description.substring(0, 50)}...`
                                                                        : attributeSet.description
                                                                    }
                                                                </span>
                                                            ) : (
                                                                <span className="text-muted">-</span>
                                                            )}
                                                        </td>
                                                        <td className="attribute-set-type-cell">
                                                            {attributeSet.isSystem ? (
                                                                <span className="badge badge-success">
                                                                    <i className="fas fa-lock mr-1"></i>
                                                                    {t('system', 'System')}
                                                                </span>
                                                            ) : (
                                                                <span className="badge badge-primary">
                                                                    <i className="fas fa-user mr-1"></i>
                                                                    {t('custom', 'Custom')}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="attribute-set-attributes-cell">
                                                            <span className="badge badge-info">
                                                                <i className="fas fa-list mr-1"></i>
                                                                {attributeSet.attributes?.length || 0} {t('attributes', 'attributes')}
                                                            </span>
                                                        </td>
                                                        <td className="attribute-set-created-cell">
                                                            <span className="text-muted">
                                                                {new Date(attributeSet.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </td>
                                                        <td className="attribute-set-actions-cell">
                                                            <div className="d-flex gap-2">
                                                                {can('attribute-sets:read') && (
                                                                    <button
                                                                        className="btn btn-sm btn-outline-info"
                                                                        onClick={() => handleViewDetails(attributeSet)}
                                                                        title={t('view_details', 'View Details & Manage Attributes')}
                                                                        data-toggle="tooltip"
                                                                        data-placement="top"
                                                                    >
                                                                        <i className="fas fa-eye mr-1"></i>
                                                                        {t('view', 'View')}
                                                                    </button>
                                                                )}
                                                                {can('attribute-sets:update') && (
                                                                    <button
                                                                        className="btn btn-sm btn-outline-primary"
                                                                        onClick={() => handleEdit(attributeSet)}
                                                                        title={t('edit_attribute_set', 'Edit Attribute Set')}
                                                                        data-toggle="tooltip"
                                                                        data-placement="top"
                                                                    >
                                                                        <i className="fas fa-edit mr-1"></i>
                                                                        {t('edit', 'Edit')}
                                                                    </button>
                                                                )}
                                                                {can('attribute-sets:delete') && !attributeSet.isSystem && (
                                                                    <button
                                                                        className="btn btn-sm btn-outline-danger"
                                                                        onClick={() => handleDelete(attributeSet)}
                                                                        title={t('delete_attribute_set', 'Delete Attribute Set')}
                                                                        data-toggle="tooltip"
                                                                        data-placement="top"
                                                                    >
                                                                        <i className="fas fa-trash mr-1"></i>
                                                                        {t('delete', 'Delete')}
                                                                    </button>
                                                                )}
                                                                {attributeSet.isSystem && (
                                                                    <span className="text-muted" title={t('system_sets_cannot_be_deleted', 'System attribute sets cannot be deleted')}>
                                                                        <i className="fas fa-lock"></i>
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {attributeSets.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-state-content">
                                <i className="fas fa-layer-group empty-state-icon"></i>
                                <h4 className="empty-state-title">{t('no_attribute_sets_yet', 'No Attribute Sets Yet')}</h4>
                                <p className="empty-state-description">
                                    {t('get_started_create_attribute_set', 'Get started by creating your first attribute set to organize product attributes into reusable groups.')}
                                </p>
                                {can('attribute-sets:create') && (
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => setShowForm(true)}
                                    >
                                        <i className="fas fa-plus mr-2"></i>
                                        {t('add_first_attribute_set', 'Add First Attribute Set')}
                                    </button>
                                )}
                            </div>
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