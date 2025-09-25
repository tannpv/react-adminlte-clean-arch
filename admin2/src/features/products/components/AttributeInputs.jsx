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
            className={`block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-colors duration-200 ${hasError
                    ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                } ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
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
            className={`block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-colors duration-200 ${hasError
                    ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                } ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
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
        <div className="flex items-center space-x-3">
            <div className="relative">
                <input
                    type="checkbox"
                    className={`w-5 h-5 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2 ${hasError ? 'border-red-300 focus:ring-red-500' : ''
                        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    checked={value || false}
                    onChange={(e) => onChange(e.target.checked)}
                    disabled={disabled}
                />
            </div>
            <label className={`text-sm font-medium ${disabled ? 'text-gray-500' : 'text-gray-900 cursor-pointer'}`}>
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
            <div className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white flex items-center" style={{ minHeight: '48px' }}>
                <span className="text-gray-500 text-sm">
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Loading options...
                </span>
            </div>
        );
    }

    return (
        <div className="relative">
            <select
                className={`block w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-colors duration-200 appearance-none ${hasError
                        ? 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    } ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
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
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <i className="fas fa-chevron-down text-gray-400"></i>
            </div>
        </div>
    );
}

/**
 * Component for rendering multi-select with checkboxes
 */
export function MultiSelectAttributeInput({ attribute, values = [], onChange, disabled, hasError }) {
    const { data: attributeValues = [], isLoading } = useAttributeValuesByAttribute(attribute.id);

    if (isLoading) {
        return (
            <div className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white flex items-center" style={{ minHeight: '48px' }}>
                <span className="text-gray-500 text-sm">
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
        <div className={`attribute-multiselect bg-white border rounded-lg shadow-sm p-4 ${hasError ? 'border-red-300' : 'border-gray-200'
            }`}>
            {/* Header with actions */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                    <i className="fas fa-check-square text-indigo-500 mr-2"></i>
                    <span className="text-sm text-gray-600">
                        Select multiple options ({values.length} selected)
                    </span>
                </div>
                <div className="flex space-x-2">
                    <button
                        type="button"
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-300 rounded-lg hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        onClick={() => onChange(attributeValues.map(av => av.id))}
                        disabled={disabled || values.length === attributeValues.length}
                        title="Select All"
                    >
                        <i className="fas fa-check-double mr-1"></i>
                        Select All
                    </button>
                    <button
                        type="button"
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        onClick={() => onChange([])}
                        disabled={disabled || values.length === 0}
                        title="Clear All"
                    >
                        <i className="fas fa-times mr-1"></i>
                        Clear All
                    </button>
                </div>
            </div>

            {/* Options list */}
            <div className="space-y-3 max-h-48 overflow-y-auto">
                {attributeValues.map((attrValue) => (
                    <div key={attrValue.id} className="flex items-center space-x-3">
                        <div className="relative">
                            <input
                                type="checkbox"
                                className={`w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                    }`}
                                id={`${attribute.id}-${attrValue.id}`}
                                checked={values.includes(attrValue.id)}
                                onChange={(e) => handleCheckboxChange(attrValue.id, e.target.checked)}
                                disabled={disabled}
                            />
                        </div>
                        <label
                            className={`text-sm font-medium ${disabled ? 'text-gray-500' : 'text-gray-900 cursor-pointer'
                                }`}
                            htmlFor={`${attribute.id}-${attrValue.id}`}
                        >
                            {attrValue.label}
                        </label>
                    </div>
                ))}
            </div>

            {/* Selected values summary */}
            {values.length > 0 && (
                <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <div className="flex items-start">
                        <i className="fas fa-check-circle text-indigo-500 mr-2 mt-0.5"></i>
                        <div>
                            <div className="text-sm font-medium text-indigo-800 mb-1">
                                Selected Values ({values.length})
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {values.map((attributeValueId, index) => {
                                    const attrValue = attributeValues.find(av => av.id === attributeValueId);
                                    return (
                                        <span key={index} className="inline-flex items-center px-2 py-1 text-xs font-medium text-indigo-800 bg-indigo-100 rounded-md">
                                            {attrValue ? attrValue.label : `ID: ${attributeValueId}`}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
