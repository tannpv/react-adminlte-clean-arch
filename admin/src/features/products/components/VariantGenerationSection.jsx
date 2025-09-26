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
        <div className="variant-generation-section bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <i className="fas fa-cogs text-purple-600"></i>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Product Variants</h3>
                    <p className="text-sm text-gray-600">Generate product variants automatically from attribute combinations</p>
                </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                    <i className="fas fa-lightbulb text-purple-500 mr-3 mt-0.5"></i>
                    <div>
                        <div className="text-sm font-medium text-purple-800 mb-1">How it works</div>
                        <div className="text-sm text-purple-700">
                            Select multiple values for attributes to automatically generate all possible product variant combinations.
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <i className="fas fa-magic text-purple-500 mr-2"></i>
                    <span className="text-sm font-medium text-gray-700">
                        {generatedVariants.length > 0
                            ? `${generatedVariants.length} variants generated`
                            : 'No variants generated yet'
                        }
                    </span>
                </div>
                <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    onClick={onGenerateVariants}
                    disabled={disabled}
                >
                    <i className="fas fa-magic mr-2"></i>
                    Generate Variants
                </button>
            </div>

            {generatedVariants.length > 0 && (
                <div className="mt-6">
                    <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                            <i className="fas fa-check-circle text-green-600"></i>
                        </div>
                        <div>
                            <h4 className="text-md font-semibold text-gray-900">Generated Variants</h4>
                            <p className="text-sm text-gray-600">Preview of the generated product variants</p>
                        </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex flex-wrap gap-2">
                            {generatedVariants.slice(0, 8).map((variant, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-purple-800 bg-purple-100 border border-purple-200 rounded-md"
                                >
                                    <i className="fas fa-tag mr-1.5"></i>
                                    {variant}
                                </span>
                            ))}
                            {generatedVariants.length > 8 && (
                                <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 rounded-md">
                                    <i className="fas fa-ellipsis-h mr-1.5"></i>
                                    +{generatedVariants.length - 8} more
                                </span>
                            )}
                        </div>

                        {generatedVariants.length > 8 && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                        Showing 8 of {generatedVariants.length} variants
                                    </span>
                                    <button
                                        type="button"
                                        className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                                    >
                                        View All Variants
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
