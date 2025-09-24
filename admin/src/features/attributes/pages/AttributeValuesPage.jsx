import React, { useState } from 'react';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';
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
            <div className="page-card">
                <div className="loading-state">
                    <div className="loading-content">
                        <i className="fas fa-spinner fa-spin loading-icon"></i>
                        <h4 className="loading-title">{t('loading_attribute_values', 'Loading Attribute Values')}</h4>
                        <p className="loading-description">{t('loading_attribute_values_description', 'Please wait while we fetch the attribute values...')}</p>
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
                        <h4 className="error-title">{t('failed_to_load_attribute_values', 'Failed to Load Attribute Values')}</h4>
                        <p className="error-description">
                            {error?.message || t('unexpected_error_loading_attribute_values', 'An unexpected error occurred while loading attribute values.')}
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
                            <i className="fas fa-list-ul mr-2"></i>
                            {t('attribute_values', 'Attribute Values')}
                        </h2>
                        <p className="page-subtitle">
                            {t('manage_attribute_values_description', 'Manage attribute values like "Red", "Blue", "Small", "Large" for your attributes')}
                        </p>
                    </div>
                    <div className="page-actions">
                        {can('attribute-values:create') && (
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowForm(true)}
                            >
                                <i className="fas fa-plus mr-2"></i>
                                {t('add_new_value', 'Add New Value')}
                            </button>
                        )}
                    </div>
                </div>

                <div className="page-body">
                    {attributeValues.length > 0 && (
                        <div className="attribute-values-content">
                            <div className="attribute-values-stats mb-4">
                                <div className="row">
                                    <div className="col-md-3">
                                        <div className="stat-card">
                                            <div className="stat-icon">
                                                <i className="fas fa-list-ul"></i>
                                            </div>
                                            <div className="stat-content">
                                                <div className="stat-number">{attributeValues.length}</div>
                                                <div className="stat-label">{t('total_values', 'Total Values')}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="stat-card">
                                            <div className="stat-icon">
                                                <i className="fas fa-tag"></i>
                                            </div>
                                            <div className="stat-content">
                                                <div className="stat-number">
                                                    {new Set(attributeValues.map(av => av.attributeId)).size}
                                                </div>
                                                <div className="stat-label">{t('unique_attributes', 'Unique Attributes')}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="stat-card">
                                            <div className="stat-icon">
                                                <i className="fas fa-filter"></i>
                                            </div>
                                            <div className="stat-content">
                                                <div className="stat-number">
                                                    {filteredAttributeValues.length}
                                                </div>
                                                <div className="stat-label">{t('filtered_values', 'Filtered Values')}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="stat-card">
                                            <div className="stat-icon">
                                                <i className="fas fa-sort-numeric-up"></i>
                                            </div>
                                            <div className="stat-content">
                                                <div className="stat-number">
                                                    {attributeValues.filter(av => av.sortOrder > 0).length}
                                                </div>
                                                <div className="stat-label">{t('sorted_values', 'Sorted Values')}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="attribute-values-table-section">
                                <div className="section-header">
                                    <h5 className="section-title">
                                        <i className="fas fa-list mr-2"></i>
                                        {t('attribute_value_management', 'Attribute Value Management')}
                                    </h5>
                                    <p className="section-description">
                                        {t('attribute_value_management_description', 'Manage attribute values and their sorting order. Filter by specific attributes to focus on relevant values.')}
                                    </p>
                                    <div className="filter-controls">
                                        <div className="input-group">
                                            <div className="input-group-prepend">
                                                <span className="input-group-text">
                                                    <i className="fas fa-filter"></i>
                                                </span>
                                            </div>
                                            <select
                                                className="form-control"
                                                value={selectedAttributeId}
                                                onChange={(e) => setSelectedAttributeId(e.target.value)}
                                            >
                                                <option value="">{t('all_attributes', 'All Attributes')}</option>
                                                {attributes.map(attr => (
                                                    <option key={attr.id} value={attr.id}>
                                                        {attr.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="attribute-values-list-container">
                                    <div className="table-responsive">
                                        <table className="table table-hover attribute-values-table align-middle mb-0">
                                            <thead className="table-dark">
                                                <tr>
                                                    <th className="attribute-value-id-column">
                                                        <i className="fas fa-hashtag mr-2"></i>
                                                        {t('id', 'ID')}
                                                    </th>
                                                    <th className="attribute-value-attribute-column">
                                                        <i className="fas fa-tag mr-2"></i>
                                                        {t('attribute', 'Attribute')}
                                                    </th>
                                                    <th className="attribute-value-value-column">
                                                        <i className="fas fa-list mr-2"></i>
                                                        {t('value', 'Value')}
                                                    </th>
                                                    <th className="attribute-value-sort-order-column">
                                                        <i className="fas fa-sort-numeric-up mr-2"></i>
                                                        {t('sort_order', 'Sort Order')}
                                                    </th>
                                                    <th className="attribute-value-actions-column text-center">
                                                        <i className="fas fa-cogs mr-2"></i>
                                                        {t('actions', 'Actions')}
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredAttributeValues.map((attributeValue) => (
                                                    <tr key={attributeValue.id} className="attribute-value-row">
                                                        <td className="attribute-value-id-cell">
                                                            <span className="attribute-value-id-badge">#{attributeValue.id}</span>
                                                        </td>
                                                        <td className="attribute-value-attribute-cell">
                                                            <div className="d-flex align-items-center">
                                                                <i className="fas fa-tag text-primary mr-2"></i>
                                                                <span className="attribute-value-attribute-name">
                                                                    {getAttributeName(attributeValue.attributeId)}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="attribute-value-value-cell">
                                                            <span className="badge badge-light">
                                                                {attributeValue.label}
                                                            </span>
                                                        </td>
                                                        <td className="attribute-value-sort-order-cell">
                                                            <span className="text-muted">
                                                                {attributeValue.sortOrder || 0}
                                                            </span>
                                                        </td>
                                                        <td className="attribute-value-actions-cell">
                                                            <div className="d-flex gap-2">
                                                                {can('attribute-values:update') && (
                                                                    <button
                                                                        className="btn btn-sm btn-outline-primary"
                                                                        onClick={() => handleEdit(attributeValue)}
                                                                        title={t('edit_attribute_value', 'Edit Attribute Value')}
                                                                        data-toggle="tooltip"
                                                                        data-placement="top"
                                                                    >
                                                                        <i className="fas fa-edit mr-1"></i>
                                                                        {t('edit', 'Edit')}
                                                                    </button>
                                                                )}
                                                                {can('attribute-values:delete') && (
                                                                    <button
                                                                        className="btn btn-sm btn-outline-danger"
                                                                        onClick={() => handleDelete(attributeValue)}
                                                                        title={t('delete_attribute_value', 'Delete Attribute Value')}
                                                                        data-toggle="tooltip"
                                                                        data-placement="top"
                                                                    >
                                                                        <i className="fas fa-trash mr-1"></i>
                                                                        {t('delete', 'Delete')}
                                                                    </button>
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

                    {attributeValues.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-state-content">
                                <i className="fas fa-list-ul empty-state-icon"></i>
                                <h4 className="empty-state-title">{t('no_attribute_values_yet', 'No Attribute Values Yet')}</h4>
                                <p className="empty-state-description">
                                    {t('get_started_add_attribute_value', 'Get started by adding your first attribute value to define product characteristics.')}
                                </p>
                                {can('attribute-values:create') && (
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => setShowForm(true)}
                                    >
                                        <i className="fas fa-plus mr-2"></i>
                                        {t('add_first_value', 'Add First Value')}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {attributeValues.length > 0 && filteredAttributeValues.length === 0 && selectedAttributeId && (
                        <div className="empty-state">
                            <div className="empty-state-content">
                                <i className="fas fa-filter empty-state-icon"></i>
                                <h4 className="empty-state-title">{t('no_values_for_attribute', 'No Values for This Attribute')}</h4>
                                <p className="empty-state-description">
                                    {t('no_values_found_for_attribute', 'No attribute values found for {{attributeName}}. Try selecting a different attribute or add new values.', { attributeName: getAttributeName(parseInt(selectedAttributeId)) })}
                                </p>
                                {can('attribute-values:create') && (
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => setShowForm(true)}
                                    >
                                        <i className="fas fa-plus mr-2"></i>
                                        {t('add_value_for_attribute', 'Add Value for {{attributeName}}', { attributeName: getAttributeName(parseInt(selectedAttributeId)) })}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

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
