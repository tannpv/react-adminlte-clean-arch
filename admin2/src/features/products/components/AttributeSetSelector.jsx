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
        <div className="mb-4">
            <label htmlFor="attributeSet" className="block text-sm font-medium text-gray-700 mb-2">
                <i className="fas fa-tags mr-2"></i>
                Attribute Set
            </label>
            <select
                id="attributeSet"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
            <small className="form-text text-muted">
                Choose an attribute set to define product-specific attributes
            </small>
        </div>
    );
}
