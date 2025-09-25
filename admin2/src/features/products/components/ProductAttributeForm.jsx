import React, { useEffect, useState } from 'react';
import { useAttributeSets } from '../../attributes/hooks/useAttributeSets';
import { useProductAttributeValues } from '../hooks/useProducts';
import {
    createAttributeValueHandler,
    createNormalizedAttributeValueHandler,
    getAttributeValue,
    groupAttributeValuesByAttributeId
} from '../utils/attributeValueProcessor';
import { generateVariants } from '../utils/variantGenerator';
import { AttributeList } from './AttributeList';
import { AttributeSetSelector } from './AttributeSetSelector';
import { VariantGenerationSection } from './VariantGenerationSection';

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
        const { groupedValues, attributeSetId } = groupAttributeValuesByAttributeId(
            existingAttributeValues,
            attributeSets
        );

        setAttributeValues(groupedValues);
        if (attributeSetId) {
            setSelectedAttributeSetId(attributeSetId);
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

    // Create handlers using utility functions
    const handleAttributeValueChange = createAttributeValueHandler(setAttributeValues);
    const handleNormalizedAttributeValueChange = createNormalizedAttributeValueHandler(setAttributeValues);

    // Create getter function using utility
    const getAttributeValueById = (attributeId, valueType) => getAttributeValue(attributeValues, attributeId, valueType);

    const handleGenerateVariants = () => {
        if (!selectedAttributeSetId) return;

        const selectedAttributeSet = attributeSets?.find(set => set.id === selectedAttributeSetId);
        if (!selectedAttributeSet) return;

        const variants = generateVariants(selectedAttributeSet, attributeValues, getAttributeValueById);
        setGeneratedVariants(variants);
    };


    const selectedAttributeSet = attributeSets?.find(set => set.id === selectedAttributeSetId);

    if (attributeSetsLoading) {
        return (
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Attributes</label>
                <div className="text-gray-500">Loading attribute sets...</div>
            </div>
        );
    }

    return (
        <div className="product-attribute-form">
            <AttributeSetSelector
                attributeSets={attributeSets}
                selectedAttributeSetId={selectedAttributeSetId}
                onAttributeSetChange={handleAttributeSetChange}
                disabled={disabled}
            />

            {selectedAttributeSet && (
                <>
                    <AttributeList
                        selectedAttributeSet={selectedAttributeSet}
                        attributeValues={attributeValues}
                        errors={errors}
                        disabled={disabled}
                        onAttributeValueChange={handleAttributeValueChange}
                        onNormalizedAttributeValueChange={handleNormalizedAttributeValueChange}
                        getAttributeValue={getAttributeValueById}
                    />

                    <VariantGenerationSection
                        generatedVariants={generatedVariants}
                        onGenerateVariants={handleGenerateVariants}
                        disabled={disabled}
                    />
                </>
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
