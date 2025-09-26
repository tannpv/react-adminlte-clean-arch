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
        <div className="form-group">
            <label htmlFor="attributeSet">
                <i className="fas fa-tags mr-2"></i>
                Attribute Set
            </label>
            <select
                id="attributeSet"
                className="form-control"
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
