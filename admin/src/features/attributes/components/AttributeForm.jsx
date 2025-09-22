import React, { useEffect, useState } from 'react';
import { useCreateAttribute, useUpdateAttribute } from '../hooks/useAttributes';

export const AttributeForm = ({ attribute, onClose }) => {
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
                    <div className="modal-header">
                        <h4 className="modal-title">
                            {isEditing ? 'Edit Attribute' : 'Add New Attribute'}
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
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label htmlFor="code">Code *</label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.code ? 'is-invalid' : ''}`}
                                            id="code"
                                            name="code"
                                            value={formData.code}
                                            onChange={handleChange}
                                            placeholder="e.g., color, size, weight"
                                            disabled={isLoading}
                                        />
                                        {errors.code && (
                                            <div className="invalid-feedback">{errors.code}</div>
                                        )}
                                        <small className="form-text text-muted">
                                            Unique identifier for the attribute (lowercase, numbers, underscores only)
                                        </small>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label htmlFor="name">Name *</label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="e.g., Color, Size, Weight"
                                            disabled={isLoading}
                                        />
                                        {errors.name && (
                                            <div className="invalid-feedback">{errors.name}</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label htmlFor="inputType">Input Type *</label>
                                        <select
                                            className={`form-control ${errors.inputType ? 'is-invalid' : ''}`}
                                            id="inputType"
                                            name="inputType"
                                            value={formData.inputType}
                                            onChange={handleChange}
                                            disabled={isLoading}
                                        >
                                            <option value="select">Select (Single Choice)</option>
                                            <option value="multiselect">Multi-select (Multiple Choices)</option>
                                            <option value="text">Text Input</option>
                                            <option value="number">Number Input</option>
                                            <option value="boolean">Boolean (Yes/No)</option>
                                        </select>
                                        {errors.inputType && (
                                            <div className="invalid-feedback">{errors.inputType}</div>
                                        )}
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label htmlFor="dataType">Data Type *</label>
                                        <select
                                            className={`form-control ${errors.dataType ? 'is-invalid' : ''}`}
                                            id="dataType"
                                            name="dataType"
                                            value={formData.dataType}
                                            onChange={handleChange}
                                            disabled={isLoading}
                                        >
                                            <option value="string">String</option>
                                            <option value="number">Number</option>
                                            <option value="boolean">Boolean</option>
                                        </select>
                                        {errors.dataType && (
                                            <div className="invalid-feedback">{errors.dataType}</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label htmlFor="unit">Unit</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="unit"
                                            name="unit"
                                            value={formData.unit}
                                            onChange={handleChange}
                                            placeholder="e.g., kg, cm, ml"
                                            disabled={isLoading}
                                        />
                                        <small className="form-text text-muted">
                                            Optional unit of measurement
                                        </small>
                                    </div>
                                </div>
                            </div>
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
                                    isEditing ? 'Update Attribute' : 'Create Attribute'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
