import React, { useEffect, useState } from 'react';
import { useAttributeSets } from '../../attributes/hooks/useAttributeSets';
import { useAttributeValuesByAttribute } from '../../attributes/hooks/useAttributeValues';
import { useProductAttributeValues } from '../hooks/useProducts';

export function ProductAttributeForm({
    productId,
    onAttributeChange,
    initialValues = {},
    errors = {},
    disabled = false
}) {
    const [selectedAttributeSetId, setSelectedAttributeSetId] = useState(null);
    const [attributeValues, setAttributeValues] = useState(initialValues);
    const [generatedVariants, setGeneratedVariants] = useState([]);

    const { data: attributeSets, isLoading: attributeSetsLoading } = useAttributeSets();
    const { data: existingAttributeValues, isLoading: attributeValuesLoading } = useProductAttributeValues(productId);

    // Initialize attribute values from existing data
    useEffect(() => {
        if (existingAttributeValues && existingAttributeValues.length > 0) {
            const values = {};
            let attributeSetId = null;

            existingAttributeValues.forEach(attrValue => {
                values[attrValue.attributeId] = {
                    valueText: attrValue.valueText,
                    valueNumber: attrValue.valueNumber,
                    valueBoolean: attrValue.valueBoolean,
                };

                // Try to find the attribute set that contains this attribute
                if (!attributeSetId && attributeSets) {
                    const attributeSet = attributeSets.find(set =>
                        set.attributes && set.attributes.some(attr => attr.id === attrValue.attributeId)
                    );
                    if (attributeSet) {
                        attributeSetId = attributeSet.id;
                    }
                }
            });

            setAttributeValues(values);
            if (attributeSetId) {
                setSelectedAttributeSetId(attributeSetId);
            }
        }
    }, [existingAttributeValues, attributeSets]);

    // Notify parent component of changes
    useEffect(() => {
        if (onAttributeChange) {
            onAttributeChange(attributeValues);
        }
    }, [attributeValues, onAttributeChange]);

    const handleAttributeSetChange = (e) => {
        const setId = parseInt(e.target.value);
        setSelectedAttributeSetId(setId);

        // Clear attribute values when changing attribute set
        setAttributeValues({});
    };

    const handleAttributeValueChange = (attributeId, value, valueType) => {
        setAttributeValues(prev => ({
            ...prev,
            [attributeId]: {
                ...prev[attributeId],
                [valueType]: value,
            }
        }));
    };

    const getAttributeValue = (attributeId, valueType) => {
        return attributeValues[attributeId]?.[valueType] || '';
    };

    const generateVariants = () => {
        if (!selectedAttributeSetId) return;

        const selectedAttributeSet = attributeSets?.find(set => set.id === selectedAttributeSetId);
        if (!selectedAttributeSet?.attributes) return;

        // Get all selected values for each attribute
        const attributeSelections = {};
        selectedAttributeSet.attributes.forEach(attribute => {
            const value = getAttributeValue(attribute.id, 'valueText');
            if (value) {
                if (attribute.inputType === 'multiselect') {
                    attributeSelections[attribute.name] = value.split(',').filter(v => v.trim());
                } else {
                    attributeSelections[attribute.name] = [value];
                }
            }
        });

        // Generate all combinations
        const combinations = generateCombinations(attributeSelections);
        setGeneratedVariants(combinations);
    };

    const generateCombinations = (selections) => {
        const attributes = Object.keys(selections);
        if (attributes.length === 0) return [];

        const combinations = [];

        const generateRecursive = (currentCombination, remainingAttributes) => {
            if (remainingAttributes.length === 0) {
                combinations.push(currentCombination.join(' - '));
                return;
            }

            const currentAttribute = remainingAttributes[0];
            const values = selections[currentAttribute];

            values.forEach(value => {
                generateRecursive(
                    [...currentCombination, `${currentAttribute}: ${value}`],
                    remainingAttributes.slice(1)
                );
            });
        };

        generateRecursive([], attributes);
        return combinations;
    };

    const renderAttributeInput = (attribute) => {
        const { id, inputType, dataType, name } = attribute;
        const hasError = errors[`attribute_${id}`];

        switch (inputType) {
            case 'text':
                return (
                    <input
                        type="text"
                        className={`form-control ${hasError ? 'is-invalid' : ''}`}
                        value={getAttributeValue(id, 'valueText')}
                        onChange={(e) => handleAttributeValueChange(id, e.target.value, 'valueText')}
                        disabled={disabled}
                        placeholder={`Enter ${name.toLowerCase()}`}
                    />
                );

            case 'number':
                return (
                    <input
                        type="number"
                        step="0.01"
                        className={`form-control ${hasError ? 'is-invalid' : ''}`}
                        value={getAttributeValue(id, 'valueNumber')}
                        onChange={(e) => handleAttributeValueChange(id, parseFloat(e.target.value) || 0, 'valueNumber')}
                        disabled={disabled}
                        placeholder={`Enter ${name.toLowerCase()}`}
                    />
                );

            case 'boolean':
                return (
                    <div className="form-check">
                        <input
                            type="checkbox"
                            className={`form-check-input ${hasError ? 'is-invalid' : ''}`}
                            checked={getAttributeValue(id, 'valueBoolean') || false}
                            onChange={(e) => handleAttributeValueChange(id, e.target.checked, 'valueBoolean')}
                            disabled={disabled}
                        />
                        <label className="form-check-label">
                            {name}
                        </label>
                    </div>
                );

            case 'select':
                return <AttributeSelectInput
                    attribute={attribute}
                    value={getAttributeValue(id, 'valueText')}
                    onChange={(value) => handleAttributeValueChange(id, value, 'valueText')}
                    disabled={disabled}
                    hasError={hasError}
                    multiple={false}
                />;
            case 'multiselect':
                return <AttributeMultiSelectInput
                    attribute={attribute}
                    values={getAttributeValue(id, 'valueText') ? getAttributeValue(id, 'valueText').split(',') : []}
                    onChange={(values) => handleAttributeValueChange(id, values.join(','), 'valueText')}
                    disabled={disabled}
                    hasError={hasError}
                />;

            default:
                return (
                    <input
                        type="text"
                        className={`form-control ${hasError ? 'is-invalid' : ''}`}
                        value={getAttributeValue(id, 'valueText')}
                        onChange={(e) => handleAttributeValueChange(id, e.target.value, 'valueText')}
                        disabled={disabled}
                        placeholder={`Enter ${name.toLowerCase()}`}
                    />
                );
        }
    };

    const selectedAttributeSet = attributeSets?.find(set => set.id === selectedAttributeSetId);

    if (attributeSetsLoading) {
        return (
            <div className="form-group">
                <label>Product Attributes</label>
                <div className="text-muted">Loading attribute sets...</div>
            </div>
        );
    }

    return (
        <div className="product-attribute-form">
            <div className="form-group">
                <label htmlFor="attributeSet">
                    <i className="fas fa-tags mr-2"></i>
                    Attribute Set
                </label>
                <select
                    id="attributeSet"
                    className="form-control"
                    value={selectedAttributeSetId || ''}
                    onChange={handleAttributeSetChange}
                    disabled={disabled}
                >
                    <option value="">Select an attribute set...</option>
                    {attributeSets?.map(set => (
                        <option key={set.id} value={set.id}>
                            {set.name} {set.isSystem ? '(System)' : ''}
                        </option>
                    ))}
                </select>
                <small className="form-text text-muted">
                    Choose an attribute set to define product-specific attributes
                </small>
            </div>

            {selectedAttributeSet && (
                <div className="attribute-set-attributes">
                    <h6 className="mb-3">
                        <i className="fas fa-list mr-2"></i>
                        {selectedAttributeSet.name} Attributes
                    </h6>

                    {selectedAttributeSet.attributes?.length > 0 ? (
                        <div className="row">
                            {selectedAttributeSet.attributes.map(attribute => (
                                <div key={attribute.id} className="col-md-6 mb-3">
                                    <div className="form-group">
                                        <label htmlFor={`attribute_${attribute.id}`}>
                                            {attribute.name}
                                            {attribute.unit && (
                                                <span className="text-muted ml-1">({attribute.unit})</span>
                                            )}
                                        </label>
                                        {renderAttributeInput(attribute)}
                                        {errors[`attribute_${attribute.id}`] && (
                                            <div className="invalid-feedback">
                                                <i className="fas fa-exclamation-triangle mr-1"></i>
                                                {errors[`attribute_${attribute.id}`]}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="alert alert-info">
                            <i className="fas fa-info-circle mr-2"></i>
                            No attributes assigned to this attribute set.
                        </div>
                    )}

                    {/* Variant Generation Section */}
                    <div className="variant-generation-section mt-4 p-3 bg-light rounded">
                        <h6 className="mb-3">
                            <i className="fas fa-cogs mr-2"></i>
                            Product Variants
                        </h6>
                        <p className="text-muted mb-3">
                            Select multiple values for attributes to generate product variants automatically.
                        </p>
                        <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={generateVariants}
                            disabled={disabled}
                        >
                            <i className="fas fa-magic mr-2"></i>
                            Generate Variants
                        </button>
                        {generatedVariants.length > 0 && (
                            <div className="mt-3">
                                <h6 className="text-success">
                                    <i className="fas fa-check-circle mr-2"></i>
                                    Generated {generatedVariants.length} variants
                                </h6>
                                <div className="variant-preview">
                                    {generatedVariants.slice(0, 5).map((variant, index) => (
                                        <span key={index} className="badge badge-light mr-2 mb-2">
                                            {variant}
                                        </span>
                                    ))}
                                    {generatedVariants.length > 5 && (
                                        <span className="badge badge-secondary">
                                            +{generatedVariants.length - 5} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {!selectedAttributeSetId && (
                <div className="alert alert-light">
                    <i className="fas fa-lightbulb mr-2"></i>
                    Select an attribute set above to add product-specific attributes.
                </div>
            )}
        </div>
    );
}

// Component for rendering select dropdowns with attribute values
function AttributeSelectInput({ attribute, value, onChange, disabled, hasError, multiple = false }) {
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

// Component for rendering multi-select with checkboxes
function AttributeMultiSelectInput({ attribute, values = [], onChange, disabled, hasError }) {
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

    const handleCheckboxChange = (value, checked) => {
        let newValues;
        if (checked) {
            newValues = [...values, value];
        } else {
            newValues = values.filter(v => v !== value);
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
                            onClick={() => onChange(attributeValues.map(av => av.label))}
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
                            checked={values.includes(attrValue.label)}
                            onChange={(e) => handleCheckboxChange(attrValue.label, e.target.checked)}
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
                        {values.map((value, index) => (
                            <span key={index} className="badge">
                                {value}
                            </span>
                        ))}
                    </small>
                </div>
            )}
        </div>
    );
}
