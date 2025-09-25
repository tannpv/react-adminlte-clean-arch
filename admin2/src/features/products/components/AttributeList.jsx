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
        <div className="attribute-set-attributes bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                    <i className="fas fa-list text-indigo-600"></i>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedAttributeSet.name} Attributes</h3>
                    <p className="text-sm text-gray-600">Configure product-specific attributes and values</p>
                </div>
            </div>

            {selectedAttributeSet.attributes?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedAttributeSet.attributes.map(attribute => (
                        <div key={attribute.id} className="attribute-item">
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <label htmlFor={`attribute_${attribute.id}`} className="block text-sm font-semibold text-gray-900 mb-3">
                                    <div className="flex items-center">
                                        <i className="fas fa-tag text-indigo-500 mr-2"></i>
                                        {attribute.name}
                                        {attribute.unit && (
                                            <span className="ml-2 text-xs font-normal text-gray-500 bg-gray-200 px-2 py-1 rounded">
                                                {attribute.unit}
                                            </span>
                                        )}
                                    </div>
                                </label>
                                {renderAttributeInput(attribute)}
                                {errors[`attribute_${attribute.id}`] && (
                                    <div className="mt-2 flex items-center text-sm text-red-600">
                                        <i className="fas fa-exclamation-triangle mr-2"></i>
                                        {errors[`attribute_${attribute.id}`]}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <i className="fas fa-info-circle text-2xl text-gray-400"></i>
                    </div>
                    <div className="text-sm font-medium text-gray-600 mb-1">No attributes assigned</div>
                    <div className="text-xs text-gray-500">No attributes are currently assigned to this attribute set</div>
                </div>
            )}
        </div>
    );
}
