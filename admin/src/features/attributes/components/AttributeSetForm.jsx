import React, { useEffect, useState } from 'react';
import { useLanguage, useTranslation } from '../../../shared/hooks/useTranslation';
import { useCreateAttributeSet, useUpdateAttributeSet } from '../hooks/useAttributeSets';

export const AttributeSetForm = ({ attributeSet, onClose }) => {
    const { languageCode } = useLanguage();
    const { t } = useTranslation(languageCode, 'attributes');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });

    const [errors, setErrors] = useState({});

    const createAttributeSetMutation = useCreateAttributeSet();
    const updateAttributeSetMutation = useUpdateAttributeSet();

    const isEditing = !!attributeSet;
    const isLoading = createAttributeSetMutation.isPending || updateAttributeSetMutation.isPending;

    useEffect(() => {
        if (attributeSet) {
            setFormData({
                name: attributeSet.name,
                description: attributeSet.description || '',
            });
        }
    }, [attributeSet]);

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

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
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
            description: formData.description || undefined,
        };

        if (isEditing) {
            updateAttributeSetMutation.mutate(
                { id: attributeSet.id, data: submitData },
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
            createAttributeSetMutation.mutate(submitData, {
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
                            {isEditing ? t('edit_attribute_set', 'Edit Attribute Set') : t('add_new_attribute_set', 'Add New Attribute Set')}
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
                                        <strong>{t('attribute_set_management', 'Attribute Set Management')}:</strong> {t('attribute_set_management_description', 'Create or edit attribute sets to organize attributes into reusable groups for products.')}
                                        {t('required_fields_note', 'All fields marked with * are required.')}
                                    </div>
                                </div>
                            </div>

                            <form id="attribute-set-form" onSubmit={handleSubmit}>
                                <div className="row">
                                    <div className="col-md-12">
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
                                                placeholder={t('attribute_set_name_placeholder', 'e.g., Clothing, Electronics, Books')}
                                                disabled={isLoading}
                                            />
                                            {errors.name && (
                                                <div className="invalid-feedback">
                                                    <i className="fas fa-exclamation-triangle mr-1"></i>
                                                    {errors.name}
                                                </div>
                                            )}
                                            <small className="form-text text-muted">
                                                {t('attribute_set_name_help_text', 'A descriptive name for the attribute set')}
                                            </small>
                                        </div>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <label htmlFor="description" className="form-label">
                                                <i className="fas fa-align-left mr-2"></i>
                                                {t('description', 'Description')}
                                            </label>
                                            <textarea
                                                className="form-control"
                                                id="description"
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                placeholder={t('attribute_set_description_placeholder', 'Optional description of what this attribute set is used for')}
                                                rows="3"
                                                disabled={isLoading}
                                            />
                                            <small className="form-text text-muted">
                                                {t('attribute_set_description_help_text', 'Optional description to help identify the purpose of this attribute set')}
                                            </small>
                                        </div>
                                    </div>
                                </div>

                                {isEditing && (
                                    <div className="row">
                                        <div className="col-md-12">
                                            <div className="alert alert-info">
                                                <i className="fas fa-info-circle mr-2"></i>
                                                <strong>{t('note', 'Note')}:</strong> {t('attribute_set_note', 'After creating the attribute set, you can add attributes to it from the attribute set details page.')}
                                            </div>
                                        </div>
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
                                    {isEditing ? t('update_attribute_set_details', 'Update the attribute set details') : t('create_new_attribute_set', 'Create a new attribute set to organize attributes')}
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
                                    form="attribute-set-form"
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
                                            {isEditing ? t('update_attribute_set', 'Update Attribute Set') : t('create_attribute_set', 'Create Attribute Set')}
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
