import React, { useEffect, useState } from 'react';
import { useLanguage, useTranslation } from '../../../shared/hooks/useTranslation';
import { useCreateAttribute, useUpdateAttribute } from '../hooks/useAttributes';

export const AttributeForm = ({ attribute, onClose }) => {
    const { languageCode } = useLanguage();
    const { t } = useTranslation(languageCode, 'attributes');

    const [formData, setFormData] = useState({
        code: '',
        name: '',
        inputType: 'select',
        dataType: 'string',
        unit: '',
    });

    const [errors, setErrors] = useState({});

    const createAttributeMutation = useCreateAttribute();
    const updateAttributeMutation = useUpdateAttribute();

    const isEditing = !!attribute;
    const isLoading = createAttributeMutation.isPending || updateAttributeMutation.isPending;

    useEffect(() => {
        if (attribute) {
            setFormData({
                code: attribute.code,
                name: attribute.name,
                inputType: attribute.inputType,
                dataType: attribute.dataType,
                unit: attribute.unit || '',
            });
        }
    }, [attribute]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.code.trim()) {
            newErrors.code = 'Code is required';
        } else if (!/^[a-z0-9_]+$/.test(formData.code)) {
            newErrors.code = 'Code must contain only lowercase letters, numbers, and underscores';
        }

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.inputType) {
            newErrors.inputType = 'Input type is required';
        }

        if (!formData.dataType) {
            newErrors.dataType = 'Data type is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const submitData = {
            ...formData,
            unit: formData.unit || undefined,
        };

        if (isEditing) {
            updateAttributeMutation.mutate(
                { id: attribute.id, data: submitData },
                {
                    onSuccess: () => {
                        onClose();
                    },
                    onError: (error) => {
                        if (error.response?.data?.fieldErrors) {
                            setErrors(error.response.data.fieldErrors);
                        }
                    },
                }
            );
        } else {
            createAttributeMutation.mutate(submitData, {
                onSuccess: () => {
                    onClose();
                },
                onError: (error) => {
                    if (error.response?.data?.fieldErrors) {
                        setErrors(error.response.data.fieldErrors);
                    }
                },
            });
        }
    };

    return (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header bg-primary text-white">
                        <h5 className="modal-title">
                            <i className={`fas ${isEditing ? 'fa-edit' : 'fa-plus'} mr-2`}></i>
                            {isEditing ? t('edit_attribute', 'Edit Attribute') : t('add_new_attribute', 'Add New Attribute')}
                        </h5>
                        <button
                            type="button"
                            className="close text-white"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            <span>&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-12">
                                    <div className="alert alert-info" role="alert">
                                        <i className="fas fa-info-circle mr-2"></i>
                                        <strong>{t('attribute_management', 'Attribute Management')}:</strong> {t('attribute_management_description', 'Create or edit attributes to define product characteristics like color, size, and material.')}
                                        {t('required_fields_note', 'All fields marked with * are required.')}
                                    </div>
                                </div>
                            </div>

                            <form id="attribute-form" onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label htmlFor="code" className="form-label">
                                                <i className="fas fa-code mr-2"></i>
                                                {t('code', 'Code')} *
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-control ${errors.code ? 'is-invalid' : ''}`}
                                                id="code"
                                                name="code"
                                                value={formData.code}
                                                onChange={handleChange}
                                                placeholder={t('code_placeholder', 'e.g., color, size, weight')}
                                                disabled={isLoading}
                                            />
                                            {errors.code && (
                                                <div className="invalid-feedback">
                                                    <i className="fas fa-exclamation-triangle mr-1"></i>
                                                    {errors.code}
                                                </div>
                                            )}
                                            <small className="form-text text-muted">
                                                {t('code_help_text', 'Unique identifier for the attribute (lowercase, numbers, underscores only)')}
                                            </small>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label htmlFor="name" className="form-label">
                                                <i className="fas fa-tag mr-2"></i>
                                                {t('name', 'Name')} *
                                            </label>
                                            <input
                                                type="text"
                                                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder={t('name_placeholder', 'e.g., Color, Size, Weight')}
                                                disabled={isLoading}
                                            />
                                            {errors.name && (
                                                <div className="invalid-feedback">
                                                    <i className="fas fa-exclamation-triangle mr-1"></i>
                                                    {errors.name}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label htmlFor="inputType" className="form-label">
                                                <i className="fas fa-keyboard mr-2"></i>
                                                {t('input_type', 'Input Type')} *
                                            </label>
                                            <select
                                                className={`form-control ${errors.inputType ? 'is-invalid' : ''}`}
                                                id="inputType"
                                                name="inputType"
                                                value={formData.inputType}
                                                onChange={handleChange}
                                                disabled={isLoading}
                                            >
                                                <option value="select">{t('select_single_choice', 'Select (Single Choice)')}</option>
                                                <option value="multiselect">{t('multiselect_multiple_choices', 'Multi-select (Multiple Choices)')}</option>
                                                <option value="text">{t('text_input', 'Text Input')}</option>
                                                <option value="number">{t('number_input', 'Number Input')}</option>
                                                <option value="boolean">{t('boolean_yes_no', 'Boolean (Yes/No)')}</option>
                                            </select>
                                            {errors.inputType && (
                                                <div className="invalid-feedback">
                                                    <i className="fas fa-exclamation-triangle mr-1"></i>
                                                    {errors.inputType}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label htmlFor="dataType" className="form-label">
                                                <i className="fas fa-database mr-2"></i>
                                                {t('data_type', 'Data Type')} *
                                            </label>
                                            <select
                                                className={`form-control ${errors.dataType ? 'is-invalid' : ''}`}
                                                id="dataType"
                                                name="dataType"
                                                value={formData.dataType}
                                                onChange={handleChange}
                                                disabled={isLoading}
                                            >
                                                <option value="string">{t('string', 'String')}</option>
                                                <option value="number">{t('number', 'Number')}</option>
                                                <option value="boolean">{t('boolean', 'Boolean')}</option>
                                            </select>
                                            {errors.dataType && (
                                                <div className="invalid-feedback">
                                                    <i className="fas fa-exclamation-triangle mr-1"></i>
                                                    {errors.dataType}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label htmlFor="unit" className="form-label">
                                                <i className="fas fa-ruler mr-2"></i>
                                                {t('unit', 'Unit')}
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="unit"
                                                name="unit"
                                                value={formData.unit}
                                                onChange={handleChange}
                                                placeholder={t('unit_placeholder', 'e.g., kg, cm, ml')}
                                                disabled={isLoading}
                                            />
                                            <small className="form-text text-muted">
                                                {t('unit_help_text', 'Optional unit of measurement')}
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="modal-footer bg-light border-top">
                            <div className="d-flex justify-content-between w-100">
                                <div className="text-muted">
                                    <small>
                                        <i className="fas fa-lightbulb mr-1"></i>
                                        {isEditing ? t('update_attribute_details', 'Update the attribute details') : t('create_new_attribute', 'Create a new attribute for products')}
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
                                        type="submit"
                                        form="attribute-form"
                                        className={`btn ${isEditing ? 'btn-warning' : 'btn-success'}`}
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
                                                {isEditing ? t('update_attribute', 'Update Attribute') : t('create_attribute', 'Create Attribute')}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
