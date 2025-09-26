/**
 * Utility functions for generating product variants from attribute combinations
 */

/**
 * Generate all possible combinations of attribute values
 * @param {Object} attributeSelections - Object with attribute names as keys and arrays of values as values
 * @returns {Array<string>} Array of combination strings
 */
export function generateCombinations(attributeSelections) {
    const attributes = Object.keys(attributeSelections);
    if (attributes.length === 0) return [];

    const combinations = [];

    const generateRecursive = (currentCombination, remainingAttributes) => {
        if (remainingAttributes.length === 0) {
            combinations.push(currentCombination.join(' - '));
            return;
        }

        const currentAttribute = remainingAttributes[0];
        const values = attributeSelections[currentAttribute];

        values.forEach(value => {
            generateRecursive(
                [...currentCombination, `${currentAttribute}: ${value}`],
                remainingAttributes.slice(1)
            );
        });
    };

    generateRecursive([], attributes);
    return combinations;
}

/**
 * Extract attribute selections from attribute values for variant generation
 * @param {Object} attributeSet - The selected attribute set
 * @param {Object} attributeValues - Current attribute values state
 * @param {Function} getAttributeValue - Function to get attribute value by ID and type
 * @returns {Object} Object with attribute selections for variant generation
 */
export function extractAttributeSelections(attributeSet, attributeValues, getAttributeValue) {
    if (!attributeSet?.attributes) return {};

    const attributeSelections = {};

    attributeSet.attributes.forEach(attribute => {
        const value = getAttributeValue(attribute.id, 'valueText');
        if (value) {
            if (attribute.inputType === 'multiselect') {
                attributeSelections[attribute.name] = value.split(',').filter(v => v.trim());
            } else {
                attributeSelections[attribute.name] = [value];
            }
        }
    });

    return attributeSelections;
}

/**
 * Generate variants from current attribute selections
 * @param {Object} attributeSet - The selected attribute set
 * @param {Object} attributeValues - Current attribute values state
 * @param {Function} getAttributeValue - Function to get attribute value by ID and type
 * @returns {Array<string>} Array of generated variant strings
 */
export function generateVariants(attributeSet, attributeValues, getAttributeValue) {
    const attributeSelections = extractAttributeSelections(attributeSet, attributeValues, getAttributeValue);
    return generateCombinations(attributeSelections);
}
