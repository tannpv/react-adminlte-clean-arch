import React from 'react';

/**
 * Component for the variant generation section
 */
export function VariantGenerationSection({
    generatedVariants,
    onGenerateVariants,
    disabled
}) {
    return (
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
                onClick={onGenerateVariants}
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
    );
}
