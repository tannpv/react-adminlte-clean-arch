import React, { useEffect, useState } from 'react';
import { useLanguage, useTranslation } from '../../../shared/hooks/useTranslation';
import { useCreateAttributeValue, useUpdateAttributeValue } from '../hooks/useAttributeValues';
import { useAttributes } from '../hooks/useAttributes';

export const AttributeValueForm = ({ show, attributeValue, onClose }) => {
    const { languageCode } = useLanguage();
    const { t } = useTranslation(languageCode, 'attributes');

    const [formData, setFormData] = useState({
        attributeId: '',
        value: '',
        sortOrder: 0,
    });
    const [errors, setErrors] = useState({});

    const { data: attributes = [] } = useAttributes();
    const createMutation = useCreateAttributeValue();
    const updateMutation = useUpdateAttributeValue();

    const isEditing = !!attributeValue;
    const isLoading = createMutation.isLoading || updateMutation.isLoading;

    useEffect(() => {
        if (attributeValue) {
            setFormData({
                attributeId: attributeValue.attributeId || '',
                value: attributeValue.value || '',
                sortOrder: attributeValue.sortOrder || 0,
            });
        } else {
            setFormData({
                attributeId: '',
                value: '',
                sortOrder: 0,
            });
        }
        setErrors({});
    }, [attributeValue, show]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'sortOrder' ? parseInt(value) || 0 : value,
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null,
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.attributeId) {
            newErrors.attributeId = 'Please select an attribute';
        }

        if (!formData.value.trim()) {
            newErrors.value = 'Value is required';
        }

        if (formData.value.length > 255) {
            newErrors.value = 'Value must be less than 255 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const payload = {
            attributeId: parseInt(formData.attributeId),
            value: formData.value.trim(),
            sortOrder: formData.sortOrder,
        };

        if (isEditing) {
            updateMutation.mutate(
                { id: attributeValue.id, data: payload },
                {
                    onSuccess: () => {
                        onClose();
                    },
                    onError: (error) => {
                        console.error('Update error:', error);
                        setErrors({ submit: 'Failed to update attribute value' });
                    },
                }
            );
        } else {
            createMutation.mutate(payload, {
                onSuccess: () => {
                    onClose();
                },
                onError: (error) => {
                    console.error('Create error:', error);
                    setErrors({ submit: 'Failed to create attribute value' });
                },
            });
        }
    };

    if (!show) return null;

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title">
                            <i className={`fas ${isEditing ? 'fa-edit' : 'fa-plus'} mr-2`}></i>
                            {isEditing ? t('edit_attribute_value', 'Edit Attribute Value') : t('add_new_attribute_value', 'Add New Attribute Value')}
                        </h5>
                        <button
                            type="button"
                            className="close text-white"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>

                    <div className="modal-body">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-12">
                                    <div className="alert alert-info" role="alert">
                                        <i className="fas fa-info-circle mr-2"></i>
                                        <strong>{t('attribute_values', 'Attribute Values')}:</strong> {t('attribute_values_description', 'Create values like "Red", "Blue", "Small", "Large" for your attributes.')}
                                        {t('required_fields_note', 'All fields marked with * are required.')}
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label htmlFor="attributeId" className="form-label">
                                                <i className="fas fa-tag mr-2"></i>
                                                {t('attribute', 'Attribute')} *
                                            </label>
                                            <select
                                                id="attributeId"
                                                name="attributeId"
                                                className={`form-control ${errors.attributeId ? 'is-invalid' : ''}`}
                                                value={formData.attributeId}
                                                onChange={handleInputChange}
                                                disabled={isLoading}
                                                required
                                            >
                                                <option value="">{t('select_attribute', 'Select an attribute...')}</option>
                                                {attributes.map(attribute => (
                                                    <option key={attribute.id} value={attribute.id}>
                                                        {attribute.name} ({attribute.inputType})
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.attributeId && (
                                                <div className="invalid-feedback">
                                                    <i className="fas fa-exclamation-triangle mr-1"></i>
                                                    {errors.attributeId}
                                                </div>
                                            )}
                                            <small className="form-text text-muted">
                                                {t('choose_attribute_help_text', 'Choose the attribute this value belongs to')}
                                            </small>
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label htmlFor="value" className="form-label">
                                                <i className="fas fa-list mr-2"></i>
                                                {t('value', 'Value')} *
                                            </label>
                                            <input
                                                type="text"
                                                id="value"
                                                name="value"
                                                className={`form-control ${errors.value ? 'is-invalid' : ''}`}
                                                value={formData.value}
                                                onChange={handleInputChange}
                                                placeholder={t('value_placeholder', 'e.g., Red, Blue, Small, Large')}
                                                disabled={isLoading}
                                                required
                                            />
                                            {errors.value && (
                                                <div className="invalid-feedback">
                                                    <i className="fas fa-exclamation-triangle mr-1"></i>
                                                    {errors.value}
                                                </div>
                                            )}
                                            <small className="form-text text-muted">
                                                {t('value_help_text', 'The actual value (e.g., "Red" for Color attribute)')}
                                            </small>
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label htmlFor="sortOrder" className="form-label">
                                                <i className="fas fa-sort-numeric-up mr-2"></i>
                                                {t('sort_order', 'Sort Order')}
                                            </label>
                                            <input
                                                type="number"
                                                id="sortOrder"
                                                name="sortOrder"
                                                className="form-control"
                                                value={formData.sortOrder}
                                                onChange={handleInputChange}
                                                min="0"
                                                disabled={isLoading}
                                            />
                                            <small className="form-text text-muted">
                                                {t('sort_order_help_text', 'Lower numbers appear first in dropdowns')}
                                            </small>
                                        </div>
                                    </div>
                                </div>

                                {errors.submit && (
                                    <div className="alert alert-danger" role="alert">
                                        <i className="fas fa-exclamation-triangle mr-2"></i>
                                        {errors.submit}
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>

                    <div className="modal-footer bg-light border-top">
                        <div className="d-flex justify-content-between w-100">
                            <div className="text-muted">
                                <small>
                                    <i className="fas fa-lightbulb mr-1"></i>
                                    {isEditing ? t('update_attribute_value_details', 'Update the attribute value details') : t('create_new_attribute_value', 'Create a new value for an attribute')}
                                </small>
                            </div>
                            <div>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary mr-2"
                                    onClick={onClose}
                                    disabled={isLoading}
                                >
                                    <i className="fas fa-times mr-1"></i>
                                    {t('cancel', 'Cancel')}
                                </button>
                                <button
                                    type="button"
                                    className={`btn ${isEditing ? 'btn-warning' : 'btn-success'}`}
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin mr-1"></i>
                                            {isEditing ? t('updating', 'Updating...') : t('creating', 'Creating...')}
                                        </>
                                    ) : (
                                        <>
                                            <i className={`fas ${isEditing ? 'fa-save' : 'fa-plus'} mr-1`}></i>
                                            {isEditing ? t('update_value', 'Update Value') : t('create_value', 'Create Value')}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

