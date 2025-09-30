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
                <div className="flex flex-col items-center justify-center py-12 text-gray-500 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                        <i className="fas fa-lightbulb text-2xl text-yellow-500"></i>
                    </div>
                    <div className="text-sm font-medium text-gray-600 mb-1">Select an Attribute Set</div>
                    <div className="text-xs text-gray-500">Choose an attribute set above to add product-specific attributes</div>
                </div>
            )}
        </div>
    );
}

export default ProductAttributeForm;
