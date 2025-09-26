import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../ui/Card';

const CategoryCard = ({
    category,
    className = '',
    size = 'default',
    showProductCount = true,
    ...props
}) => {
    const sizeClasses = {
        small: 'aspect-square',
        default: 'aspect-[4/3]',
        large: 'aspect-[3/2]',
    };

    const textSizeClasses = {
        small: 'text-lg',
        default: 'text-xl',
        large: 'text-2xl',
    };

    return (
        <Card hover className={`group relative overflow-hidden ${className}`} {...props}>
            <Link to={`/products?category=${category.slug}`} className="block">
                <div className={`relative ${sizeClasses[size]} overflow-hidden`}>
                    {!category.imageLoaded && (
                        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                    )}
                    <img
                        src={category.image || '/placeholder-category.jpg'}
                        alt={category.name}
                        className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${category.imageLoaded ? 'opacity-100' : 'opacity-0'
                            }`}
                        onLoad={() => {
                            if (category.onImageLoad) {
                                category.onImageLoad();
                            }
                        }}
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-50 transition-all duration-300" />

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4">
                        <h3 className={`font-bold mb-2 ${textSizeClasses[size]}`}>
                            {category.name}
                        </h3>
                        {showProductCount && category.productCount && (
                            <p className="text-sm opacity-90">
                                {category.productCount} products
                            </p>
                        )}
                    </div>
                </div>
            </Link>
        </Card>
    );
};

export default CategoryCard;
