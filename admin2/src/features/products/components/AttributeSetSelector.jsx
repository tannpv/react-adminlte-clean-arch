import React from 'react';

/**
 * Component for attribute set selection
 */
export function AttributeSetSelector({
    attributeSets,
    selectedAttributeSetId,
    onAttributeSetChange,
    disabled
}) {
    return (
        <div className="attribute-set-selector bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                    <i className="fas fa-tags text-indigo-600"></i>
                </div>
                <div>
                    <label htmlFor="attributeSet" className="block text-sm font-semibold text-gray-900">
                        Attribute Set
                    </label>
                    <p className="text-xs text-gray-600">Choose an attribute set to define product-specific attributes</p>
                </div>
            </div>

            <div className="relative">
                <select
                    id="attributeSet"
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white transition-colors duration-200"
                    value={selectedAttributeSetId || ''}
                    onChange={onAttributeSetChange}
                    disabled={disabled}
                >
                    <option value="">Select an attribute set...</option>
                    {attributeSets?.map(set => (
                        <option key={set.id} value={set.id}>
                            {set.name} {set.isSystem ? '(System)' : ''}
                        </option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <i className="fas fa-chevron-down text-gray-400"></i>
                </div>
            </div>

            {selectedAttributeSetId && (
                <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <div className="flex items-center">
                        <i className="fas fa-info-circle text-indigo-500 mr-2"></i>
                        <span className="text-sm text-indigo-700">
                            Selected attribute set will define the available product attributes
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
