import React from 'react';
import { useAttributeValuesByAttribute } from '../../attributes/hooks/useAttributeValues';

/**
 * Component for rendering text input
 */
export function TextAttributeInput({ attribute, value, onChange, disabled, hasError }) {
    const { name } = attribute;

    return (
        <input
            type="text"
            className={`form-control ${hasError ? 'is-invalid' : ''}`}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder={`Enter ${name.toLowerCase()}`}
        />
    );
}

/**
 * Component for rendering number input
 */
export function NumberAttributeInput({ attribute, value, onChange, disabled, hasError }) {
    const { name } = attribute;

    return (
        <input
            type="number"
            step="0.01"
            className={`form-control ${hasError ? 'is-invalid' : ''}`}
            value={value || ''}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            disabled={disabled}
            placeholder={`Enter ${name.toLowerCase()}`}
        />
    );
}

/**
 * Component for rendering boolean checkbox
 */
export function BooleanAttributeInput({ attribute, value, onChange, disabled, hasError }) {
    const { name } = attribute;

    return (
        <div className="form-check">
            <input
                type="checkbox"
                className={`form-check-input ${hasError ? 'is-invalid' : ''}`}
                checked={value || false}
                onChange={(e) => onChange(e.target.checked)}
                disabled={disabled}
            />
            <label className="form-check-label">
                {name}
            </label>
        </div>
    );
}

/**
 * Component for rendering select dropdown
 */
export function SelectAttributeInput({ attribute, value, onChange, disabled, hasError, multiple = false }) {
    const { data: attributeValues = [], isLoading } = useAttributeValuesByAttribute(attribute.id);

    if (isLoading) {
        return (
            <div className="form-control d-flex align-items-center" style={{ minHeight: '38px' }}>
                <span className="text-muted">
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Loading options...
                </span>
            </div>
        );
    }

    return (
        <select
            className={`form-control ${hasError ? 'is-invalid' : ''}`}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            multiple={multiple}
            size={multiple ? Math.min(attributeValues.length + 1, 6) : undefined}
        >
            <option value="">Select {attribute.name.toLowerCase()}...</option>
            {attributeValues.map((attrValue) => (
                <option key={attrValue.id} value={attrValue.label}>
                    {attrValue.label}
                </option>
            ))}
        </select>
    );
}

/**
 * Component for rendering multi-select with checkboxes
 */
export function MultiSelectAttributeInput({ attribute, values = [], onChange, disabled, hasError }) {
    const { data: attributeValues = [], isLoading } = useAttributeValuesByAttribute(attribute.id);

    if (isLoading) {
        return (
            <div className="form-control d-flex align-items-center" style={{ minHeight: '38px' }}>
                <span className="text-muted">
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Loading options...
                </span>
            </div>
        );
    }

    const handleCheckboxChange = (attributeValueId, checked) => {
        let newValues;
        if (checked) {
            newValues = [...values, attributeValueId];
        } else {
            newValues = values.filter(v => v !== attributeValueId);
        }
        onChange(newValues);
    };

    return (
        <div className={`attribute-multiselect ${hasError ? 'is-invalid' : ''}`}>
            <div className="multiselect-header">
                <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                        <i className="fas fa-check-square mr-1"></i>
                        Select multiple options ({values.length} selected)
                    </small>
                    <div className="multiselect-actions">
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-primary mr-1"
                            onClick={() => onChange(attributeValues.map(av => av.id))}
                            disabled={disabled || values.length === attributeValues.length}
                            title="Select All"
                        >
                            <i className="fas fa-check-double"></i>
                        </button>
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => onChange([])}
                            disabled={disabled || values.length === 0}
                            title="Clear All"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div className="multiselect-options">
                {attributeValues.map((attrValue) => (
                    <div key={attrValue.id} className="form-check">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            id={`${attribute.id}-${attrValue.id}`}
                            checked={values.includes(attrValue.id)}
                            onChange={(e) => handleCheckboxChange(attrValue.id, e.target.checked)}
                            disabled={disabled}
                        />
                        <label className="form-check-label" htmlFor={`${attribute.id}-${attrValue.id}`}>
                            {attrValue.label}
                        </label>
                    </div>
                ))}
            </div>
            {values.length > 0 && (
                <div className="selected-values">
                    <small>
                        Selected:
                        {values.map((attributeValueId, index) => {
                            const attrValue = attributeValues.find(av => av.id === attributeValueId);
                            return (
                                <span key={index} className="badge">
                                    {attrValue ? attrValue.label : `ID: ${attributeValueId}`}
                                </span>
                            );
                        })}
                    </small>
                </div>
            )}
        </div>
    );
}
