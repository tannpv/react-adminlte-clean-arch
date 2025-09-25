import React from 'react';
import {
    BooleanAttributeInput,
    MultiSelectAttributeInput,
    NumberAttributeInput,
    SelectAttributeInput,
    TextAttributeInput
} from './AttributeInputs';

/**
 * Component for rendering the list of attributes in an attribute set
 */
export function AttributeList({
    selectedAttributeSet,
    attributeValues,
    errors,
    disabled,
    onAttributeValueChange,
    onNormalizedAttributeValueChange,
    getAttributeValue
}) {
    if (!selectedAttributeSet) return null;

    const renderAttributeInput = (attribute) => {
        const { id, inputType, name } = attribute;
        const hasError = errors[`attribute_${id}`];

        const commonProps = {
            attribute,
            disabled,
            hasError
        };

        switch (inputType) {
            case 'text':
                return (
                    <TextAttributeInput
                        {...commonProps}
                        value={getAttributeValue(id, 'valueText')}
                        onChange={(value) => onAttributeValueChange(id, value, 'valueText')}
                    />
                );

            case 'number':
                return (
                    <NumberAttributeInput
                        {...commonProps}
                        value={getAttributeValue(id, 'valueNumber')}
                        onChange={(value) => onAttributeValueChange(id, value, 'valueNumber')}
                    />
                );

            case 'boolean':
                return (
                    <BooleanAttributeInput
                        {...commonProps}
                        value={getAttributeValue(id, 'valueBoolean')}
                        onChange={(value) => onAttributeValueChange(id, value, 'valueBoolean')}
                    />
                );

            case 'select':
                return (
                    <SelectAttributeInput
                        {...commonProps}
                        value={getAttributeValue(id, 'valueText')}
                        onChange={(value) => onAttributeValueChange(id, value, 'valueText')}
                        multiple={false}
                    />
                );

            case 'multiselect':
                return (
                    <MultiSelectAttributeInput
                        {...commonProps}
                        values={getAttributeValue(id, 'attributeValueIds') || []}
                        onChange={(attributeValueIds) => onNormalizedAttributeValueChange(id, attributeValueIds)}
                    />
                );

            default:
                return (
                    <TextAttributeInput
                        {...commonProps}
                        value={getAttributeValue(id, 'valueText')}
                        onChange={(value) => onAttributeValueChange(id, value, 'valueText')}
                    />
                );
        }
    };

    return (
        <div className="attribute-set-attributes">
            <h6 className="mb-3">
                <i className="fas fa-list mr-2"></i>
                {selectedAttributeSet.name} Attributes
            </h6>

            {selectedAttributeSet.attributes?.length > 0 ? (
                <div className="row">
                    {selectedAttributeSet.attributes.map(attribute => (
                        <div key={attribute.id} className="col-md-6 mb-3">
                            <div className="mb-4">
                                <label htmlFor={`attribute_${attribute.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                                    {attribute.name}
                                    {attribute.unit && (
                                        <span className="text-gray-500 ml-1">({attribute.unit})</span>
                                    )}
                                </label>
                                {renderAttributeInput(attribute)}
                                {errors[`attribute_${attribute.id}`] && (
                                    <div className="mt-1 text-sm text-red-600">
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
        </div>
    );
}
