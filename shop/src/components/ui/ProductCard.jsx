import { motion } from 'framer-motion';
import React from 'react';
import { cardHoverVariants } from '../../utils/animations';
import { calculateDiscount, formatPrice } from '../../utils/helpers';

/**
 * Product card component
 * @param {object} props - Component props
 * @param {object} props.product - Product data
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.animate - Whether to animate the card
 * @param {Function} props.onAddToCart - Add to cart handler
 * @param {Function} props.onViewDetails - View details handler
 * @returns {JSX.Element} Product card component
 */
const ProductCard = ({
    product,
    className = '',
    animate = true,
    onAddToCart,
    onViewDetails,
    ...props
}) => {
    const {
        id,
        name,
        author,
        price,
        originalPrice,
        image,
        badge,
        isNew = false,
        discount = 0
    } = product;

    // Calculate discount if not provided
    const discountPercentage = discount || (originalPrice ? calculateDiscount(originalPrice, price) : 0);

    const handleAddToCart = (e) => {
        e.stopPropagation();
        if (onAddToCart) {
            onAddToCart(product);
        }
    };

    const handleViewDetails = () => {
        if (onViewDetails) {
            onViewDetails(product);
        }
    };

    const cardContent = (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
            {/* Image Container */}
            <div className="relative h-64 bg-gray-100 overflow-hidden">
                {image ? (
                    <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-3 bg-gray-300 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <p className="text-sm text-gray-500">No Image</p>
                        </div>
                    </div>
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {isNew && (
                        <span className="bg-primary-600 text-white text-xs font-medium px-2 py-1 rounded">
                            New
                        </span>
                    )}
                    {discountPercentage > 0 && (
                        <span className="bg-accent-600 text-white text-xs font-medium px-2 py-1 rounded">
                            -{discountPercentage}%
                        </span>
                    )}
                    {badge && (
                        <span className="bg-gray-800 text-white text-xs font-medium px-2 py-1 rounded">
                            {badge}
                        </span>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                        onClick={handleAddToCart}
                        className="bg-white text-gray-700 p-2 rounded-full shadow-md hover:bg-gray-50 transition-colors duration-200"
                        title="Add to cart"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Product Info */}
            <div className="p-6 flex-1 flex flex-col">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {name}
                    </h3>
                    {author && (
                        <p className="text-base text-gray-600 mb-3">
                            by {author}
                        </p>
                    )}
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <span className="text-xl font-bold text-gray-900">
                            {formatPrice(price)}
                        </span>
                        {originalPrice && originalPrice > price && (
                            <span className="text-base text-gray-500 line-through">
                                {formatPrice(originalPrice)}
                            </span>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                    <button
                        onClick={handleViewDetails}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                        View Details
                    </button>
                    <button
                        onClick={handleAddToCart}
                        className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );

    if (animate) {
        return (
            <motion.div
                className={`group cursor-pointer ${className}`}
                variants={cardHoverVariants}
                whileHover="hover"
                onClick={handleViewDetails}
                {...props}
            >
                {cardContent}
            </motion.div>
        );
    }

    return (
        <div
            className={`group cursor-pointer ${className}`}
            onClick={handleViewDetails}
            {...props}
        >
            {cardContent}
        </div>
    );
};

export default ProductCard;
