import React from 'react';
import ProductCard from './ProductCard';

const ProductGrid = ({ 
    products = [], 
    columns = 4,
    loading = false,
    className = '',
    showQuickView = true,
    showWishlist = true,
    ...props 
}) => {
    const gridClasses = {
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
        6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
    };

    if (loading) {
        return (
            <div className={`grid ${gridClasses[columns]} gap-6 ${className}`} {...props}>
                {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="animate-pulse">
                        <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-500 text-lg mb-4">No products found</div>
                <p className="text-gray-400">Try adjusting your search or filter criteria</p>
            </div>
        );
    }

    return (
        <div className={`grid ${gridClasses[columns]} gap-6 ${className}`} {...props}>
            {products.map((product) => (
                <ProductCard
                    key={product.id}
                    product={product}
                    showQuickView={showQuickView}
                    showWishlist={showWishlist}
                />
            ))}
        </div>
    );
};

export default ProductGrid;
