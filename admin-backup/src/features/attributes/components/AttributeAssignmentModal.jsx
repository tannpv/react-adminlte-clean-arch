import React, { useState } from 'react';

export const AttributeAssignmentModal = ({ availableAttributes, onSubmit, onClose, isLoading }) => {
    const [formData, setFormData] = useState({
        attributeId: '',
        sortOrder: 0,
        isRequired: false,
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
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

        if (!formData.attributeId) {
            newErrors.attributeId = 'Please select an attribute';
        }

        if (formData.sortOrder < 0) {
            newErrors.sortOrder = 'Sort order must be 0 or greater';
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
            sortOrder: parseInt(formData.sortOrder) || 0,
            isRequired: formData.isRequired,
        };

        onSubmit(parseInt(formData.attributeId), submitData);
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
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h4 className="modal-title">Add Attribute to Set</h4>
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
                                        <label htmlFor="attributeId">Select Attribute *</label>
                                        <select
                                            className={`form-control ${errors.attributeId ? 'is-invalid' : ''}`}
                                            id="attributeId"
                                            name="attributeId"
                                            value={formData.attributeId}
                                            onChange={handleChange}
                                            disabled={isLoading}
                                        >
                                            <option value="">Choose an attribute...</option>
                                            {availableAttributes.map((attribute) => (
                                                <option key={attribute.id} value={attribute.id}>
                                                    {attribute.name} ({attribute.code}) - {getInputTypeLabel(attribute.inputType)} / {getDataTypeLabel(attribute.dataType)}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.attributeId && (
                                            <div className="invalid-feedback">{errors.attributeId}</div>
                                        )}
                                        <small className="form-text text-muted">
                                            Select an attribute to add to this attribute set
                                        </small>
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label htmlFor="sortOrder">Sort Order</label>
                                        <input
                                            type="number"
                                            className={`form-control ${errors.sortOrder ? 'is-invalid' : ''}`}
                                            id="sortOrder"
                                            name="sortOrder"
                                            value={formData.sortOrder}
                                            onChange={handleChange}
                                            min="0"
                                            disabled={isLoading}
                                        />
                                        {errors.sortOrder && (
                                            <div className="invalid-feedback">{errors.sortOrder}</div>
                                        )}
                                        <small className="form-text text-muted">
                                            Order in which this attribute appears in the set (0 = first)
                                        </small>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <div className="form-check mt-4">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id="isRequired"
                                                name="isRequired"
                                                checked={formData.isRequired}
                                                onChange={handleChange}
                                                disabled={isLoading}
                                            />
                                            <label className="form-check-label" htmlFor="isRequired">
                                                Required Attribute
                                            </label>
                                        </div>
                                        <small className="form-text text-muted">
                                            Mark this attribute as required for products using this set
                                        </small>
                                    </div>
                                </div>
                            </div>

                            {formData.attributeId && (
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="alert alert-info">
                                            <h6>Selected Attribute Details:</h6>
                                            {(() => {
                                                const selectedAttribute = availableAttributes.find(
                                                    attr => attr.id === parseInt(formData.attributeId)
                                                );
                                                if (!selectedAttribute) return null;

                                                return (
                                                    <div>
                                                        <strong>Name:</strong> {selectedAttribute.name}<br />
                                                        <strong>Code:</strong> <code>{selectedAttribute.code}</code><br />
                                                        <strong>Input Type:</strong> {getInputTypeLabel(selectedAttribute.inputType)}<br />
                                                        <strong>Data Type:</strong> {getDataTypeLabel(selectedAttribute.dataType)}<br />
                                                        {selectedAttribute.unit && (
                                                            <>
                                                                <strong>Unit:</strong> {selectedAttribute.unit}<br />
                                                            </>
                                                        )}
                                                    </div>
                                                );
                                            })()}
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
                                disabled={isLoading || !formData.attributeId}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                                        Adding...
                                    </>
                                ) : (
                                    'Add Attribute to Set'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
