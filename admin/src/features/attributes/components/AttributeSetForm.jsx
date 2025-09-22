import React, { useEffect, useState } from 'react';
import { useCreateAttributeSet, useUpdateAttributeSet } from '../hooks/useAttributeSets';

export const AttributeSetForm = ({ attributeSet, onClose }) => {
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
                    <div className="modal-header">
                        <h4 className="modal-title">
                            {isEditing ? 'Edit Attribute Set' : 'Add New Attribute Set'}
                        </h4>
                        <button
                            type="button"
                            className="close"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            <span>&times;</span>
                        </button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <label htmlFor="name">Name *</label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="e.g., Clothing, Electronics, Books"
                                            disabled={isLoading}
                                        />
                                        {errors.name && (
                                            <div className="invalid-feedback">{errors.name}</div>
                                        )}
                                        <small className="form-text text-muted">
                                            A descriptive name for the attribute set
                                        </small>
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <label htmlFor="description">Description</label>
                                        <textarea
                                            className="form-control"
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            placeholder="Optional description of what this attribute set is used for"
                                            rows="3"
                                            disabled={isLoading}
                                        />
                                        <small className="form-text text-muted">
                                            Optional description to help identify the purpose of this attribute set
                                        </small>
                                    </div>
                                </div>
                            </div>

                            {isEditing && (
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="alert alert-info">
                                            <i className="fas fa-info-circle"></i>
                                            <strong>Note:</strong> After creating the attribute set, you can add attributes to it from the attribute set details page.
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={onClose}
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                                        {isEditing ? 'Updating...' : 'Creating...'}
                                    </>
                                ) : (
                                    isEditing ? 'Update Attribute Set' : 'Create Attribute Set'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
