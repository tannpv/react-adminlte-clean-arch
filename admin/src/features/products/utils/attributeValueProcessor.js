/**
 * Utility functions for processing and managing attribute values
 */

/**
 * Group existing attribute values by attributeId to handle multiple values per attribute
 * @param {Array} existingAttributeValues - Array of existing attribute values from API
 * @param {Array} attributeSets - Array of available attribute sets
 * @returns {Object} Object with grouped values and detected attribute set ID
 */
export function groupAttributeValuesByAttributeId(existingAttributeValues, attributeSets) {
    if (!existingAttributeValues || existingAttributeValues.length === 0) {
        return { groupedValues: {}, attributeSetId: null };
    }

    const groupedValues = {};
    let attributeSetId = null;

    existingAttributeValues.forEach(attrValue => {
        if (!groupedValues[attrValue.attributeId]) {
            groupedValues[attrValue.attributeId] = {
                attributeValueIds: [],
                valueText: attrValue.valueText,
                valueNumber: attrValue.valueNumber,
                valueBoolean: attrValue.valueBoolean,
            };
        }

        // Add attributeValueId if it exists (normalized approach)
        if (attrValue.attributeValueId) {
            groupedValues[attrValue.attributeId].attributeValueIds.push(attrValue.attributeValueId);
        }

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

    return { groupedValues, attributeSetId };
}

/**
 * Create attribute value change handler for normalized values
 * @param {Function} setAttributeValues - State setter for attribute values
 * @returns {Function} Handler function for normalized attribute value changes
 */
export function createNormalizedAttributeValueHandler(setAttributeValues) {
    return (attributeId, attributeValueIds) => {
        setAttributeValues(prev => ({
            ...prev,
            [attributeId]: {
                ...prev[attributeId],
                attributeValueIds: attributeValueIds,
            }
        }));
    };
}

/**
 * Create attribute value change handler for regular values
 * @param {Function} setAttributeValues - State setter for attribute values
 * @returns {Function} Handler function for regular attribute value changes
 */
export function createAttributeValueHandler(setAttributeValues) {
    return (attributeId, value, valueType) => {
        setAttributeValues(prev => ({
            ...prev,
            [attributeId]: {
                ...prev[attributeId],
                [valueType]: value,
            }
        }));
    };
}

/**
 * Get attribute value by ID and type
 * @param {Object} attributeValues - Current attribute values state
 * @param {number} attributeId - Attribute ID
 * @param {string} valueType - Type of value to get
 * @returns {any} The requested attribute value
 */
export function getAttributeValue(attributeValues, attributeId, valueType) {
    return attributeValues[attributeId]?.[valueType] || '';
}
