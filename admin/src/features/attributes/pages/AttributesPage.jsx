import React, { useState } from 'react';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';
import { usePermissions } from '../../../shared/hooks/usePermissions';
import { useLanguage, useTranslation } from '../../../shared/hooks/useTranslation';
import { AttributeForm } from '../components/AttributeForm';
import { useAttributes, useDeleteAttribute } from '../hooks/useAttributes';

export const AttributesPage = () => {
    const { can } = usePermissions();
    const { languageCode } = useLanguage();
    const { t } = useTranslation(languageCode, 'attributes');
    const [showForm, setShowForm] = useState(false);
    const [editingAttribute, setEditingAttribute] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const { data: attributes = [], isLoading, error } = useAttributes();
    const deleteAttributeMutation = useDeleteAttribute();

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
            select: t('input_type_select', 'Select'),
            multiselect: t('input_type_multiselect', 'Multi-select'),
            text: t('input_type_text', 'Text'),
            number: t('input_type_number', 'Number'),
            boolean: t('input_type_boolean', 'Boolean'),
        };
        return labels[inputType] || inputType;
    };

    const getDataTypeLabel = (dataType) => {
        const labels = {
            string: t('data_type_string', 'String'),
            number: t('data_type_number', 'Number'),
            boolean: t('data_type_boolean', 'Boolean'),
        };
        return labels[dataType] || dataType;
    };

    if (isLoading) {
        return (
            <div className="page-card">
                <div className="loading-state">
                    <div className="loading-content">
                        <i className="fas fa-spinner fa-spin loading-icon"></i>
                        <h4 className="loading-title">{t('loading_attributes', 'Loading Attributes')}</h4>
                        <p className="loading-description">{t('loading_attributes_description', 'Please wait while we fetch the attributes...')}</p>
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
                        <h4 className="error-title">{t('failed_to_load_attributes', 'Failed to Load Attributes')}</h4>
                        <p className="error-description">
                            {error?.message || t('unexpected_error_loading_attributes', 'An unexpected error occurred while loading attributes.')}
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
                            <i className="fas fa-tags mr-2"></i>
                            {t('attributes', 'Attributes')}
                        </h2>
                        <p className="page-subtitle">
                            {t('page_subtitle', 'Manage product attributes and their properties. Define characteristics like color, size, and material for your products.')}
                        </p>
                    </div>
                    <div className="page-actions">
                        {can('attributes:create') && (
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowForm(true)}
                            >
                                <i className="fas fa-plus mr-2"></i>
                                {t('add_attribute', 'Add Attribute')}
                            </button>
                        )}
                    </div>
                </div>

                <div className="page-body">
                    {attributes.length > 0 && (
                        <div className="attributes-content">
                            <div className="attributes-stats mb-4">
                                <div className="row">
                                    <div className="col-md-3">
                                        <div className="stat-card">
                                            <div className="stat-icon">
                                                <i className="fas fa-tags"></i>
                                            </div>
                                            <div className="stat-content">
                                                <div className="stat-number">{attributes.length}</div>
                                                <div className="stat-label">{t('total_attributes', 'Total Attributes')}</div>
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
                                                    {attributes.filter(attr => attr.inputType === 'select' || attr.inputType === 'multiselect').length}
                                                </div>
                                                <div className="stat-label">{t('select_attributes', 'Select Attributes')}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="stat-card">
                                            <div className="stat-icon">
                                                <i className="fas fa-keyboard"></i>
                                            </div>
                                            <div className="stat-content">
                                                <div className="stat-number">
                                                    {attributes.filter(attr => attr.inputType === 'text' || attr.inputType === 'number').length}
                                                </div>
                                                <div className="stat-label">{t('input_attributes', 'Input Attributes')}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="stat-card">
                                            <div className="stat-icon">
                                                <i className="fas fa-ruler"></i>
                                            </div>
                                            <div className="stat-content">
                                                <div className="stat-number">
                                                    {attributes.filter(attr => attr.unit).length}
                                                </div>
                                                <div className="stat-label">{t('with_units', 'With Units')}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="attributes-table-section">
                                <div className="section-header">
                                    <h5 className="section-title">
                                        <i className="fas fa-list mr-2"></i>
                                        {t('attribute_management', 'Attribute Management')}
                                    </h5>
                                    <p className="section-description">
                                        {t('attribute_management_description', 'Manage existing attributes, their input types, and data types. Attributes define the characteristics that can be assigned to products.')}
                                    </p>
                                </div>

                                <div className="attributes-list-container">
                                    <div className="table-responsive">
                                        <table className="table table-hover attributes-table align-middle mb-0">
                                            <thead className="table-dark">
                                                <tr>
                                                    <th className="attribute-id-column">
                                                        <i className="fas fa-hashtag mr-2"></i>
                                                        {t('id', 'ID')}
                                                    </th>
                                                    <th className="attribute-code-column">
                                                        <i className="fas fa-code mr-2"></i>
                                                        {t('code', 'Code')}
                                                    </th>
                                                    <th className="attribute-name-column">
                                                        <i className="fas fa-tag mr-2"></i>
                                                        {t('name', 'Name')}
                                                    </th>
                                                    <th className="attribute-input-type-column">
                                                        <i className="fas fa-keyboard mr-2"></i>
                                                        {t('input_type', 'Input Type')}
                                                    </th>
                                                    <th className="attribute-data-type-column">
                                                        <i className="fas fa-database mr-2"></i>
                                                        {t('data_type', 'Data Type')}
                                                    </th>
                                                    <th className="attribute-unit-column">
                                                        <i className="fas fa-ruler mr-2"></i>
                                                        {t('unit', 'Unit')}
                                                    </th>
                                                    <th className="attribute-created-column">
                                                        <i className="fas fa-calendar mr-2"></i>
                                                        {t('created', 'Created')}
                                                    </th>
                                                    <th className="attribute-actions-column text-center">
                                                        <i className="fas fa-cogs mr-2"></i>
                                                        {t('actions', 'Actions')}
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {attributes.map((attribute) => (
                                                    <tr key={attribute.id} className="attribute-row">
                                                        <td className="attribute-id-cell">
                                                            <span className="attribute-id-badge">#{attribute.id}</span>
                                                        </td>
                                                        <td className="attribute-code-cell">
                                                            <code className="attribute-code">{attribute.code}</code>
                                                        </td>
                                                        <td className="attribute-name-cell">
                                                            <span className="attribute-name">{attribute.name}</span>
                                                        </td>
                                                        <td className="attribute-input-type-cell">
                                                            <span className="badge badge-info">
                                                                {getInputTypeLabel(attribute.inputType)}
                                                            </span>
                                                        </td>
                                                        <td className="attribute-data-type-cell">
                                                            <span className="badge badge-secondary">
                                                                {getDataTypeLabel(attribute.dataType)}
                                                            </span>
                                                        </td>
                                                        <td className="attribute-unit-cell">
                                                            {attribute.unit ? (
                                                                <span className="attribute-unit">{attribute.unit}</span>
                                                            ) : (
                                                                <span className="text-muted">-</span>
                                                            )}
                                                        </td>
                                                        <td className="attribute-created-cell">
                                                            <span className="text-muted">
                                                                {new Date(attribute.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </td>
                                                        <td className="attribute-actions-cell">
                                                            <div className="d-flex gap-2">
                                                                {can('attributes:update') && (
                                                                    <button
                                                                        className="btn btn-sm btn-outline-primary"
                                                                        onClick={() => handleEdit(attribute)}
                                                                        title={t('edit_attribute', 'Edit Attribute')}
                                                                        data-toggle="tooltip"
                                                                        data-placement="top"
                                                                    >
                                                                        <i className="fas fa-edit mr-1"></i>
                                                                        {t('edit', 'Edit')}
                                                                    </button>
                                                                )}
                                                                {can('attributes:delete') && (
                                                                    <button
                                                                        className="btn btn-sm btn-outline-danger"
                                                                        onClick={() => handleDelete(attribute)}
                                                                        title={t('delete_attribute', 'Delete Attribute')}
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

                    {attributes.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-state-content">
                                <i className="fas fa-tags empty-state-icon"></i>
                                <h4 className="empty-state-title">{t('no_attributes_yet', 'No Attributes Yet')}</h4>
                                <p className="empty-state-description">
                                    {t('get_started_add_attribute', 'Get started by adding your first attribute to define product characteristics like color, size, and material.')}
                                </p>
                                {can('attributes:create') && (
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => setShowForm(true)}
                                    >
                                        <i className="fas fa-plus mr-2"></i>
                                        {t('add_first_attribute', 'Add First Attribute')}
                                    </button>
                                )}
                            </div>
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
                    title={t('delete_attribute', 'Delete Attribute')}
                    message={`${t('confirm_delete_attribute', 'Are you sure you want to delete the attribute')} "${deleteConfirm.name}"? ${t('action_cannot_be_undone', 'This action cannot be undone.')}`}
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteConfirm(null)}
                    isLoading={deleteAttributeMutation.isPending}
                />
            )}
        </>
    );
};