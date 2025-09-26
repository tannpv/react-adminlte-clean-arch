import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    HeartIcon, 
    ShoppingCartIcon, 
    EyeIcon,
    StarIcon 
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useCart } from '../../context/CartContext';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

const ProductList = ({ 
    product, 
    showQuickView = true,
    showWishlist = true,
    className = '' 
}) => {
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const { addToCart } = useCart();

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product);
    };

    const handleWishlistToggle = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsWishlisted(!isWishlisted);
    };

    const handleQuickView = (e) => {
        e.preventDefault();
        e.stopPropagation();
        // TODO: Implement quick view modal
        console.log('Quick view for product:', product.id);
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <StarIcon key={i} className="h-4 w-4 text-yellow-400 fill-current" />
            );
        }

        if (hasHalfStar) {
            stars.push(
                <StarIcon key="half" className="h-4 w-4 text-yellow-400 fill-current opacity-50" />
            );
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(
                <StarIcon key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
            );
        }

        return stars;
    };

    return (
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 ${className}`}>
            <Link to={`/products/${product.id}`} className="block">
                <div className="flex flex-col md:flex-row">
                    {/* Product Image */}
                    <div className="relative w-full md:w-64 h-64 md:h-48 overflow-hidden rounded-l-lg bg-gray-100">
                        {!imageLoaded && (
                            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                        )}
                        <img
                            src={product.image || '/placeholder-product.jpg'}
                            alt={product.name}
                            className={`w-full h-full object-cover transition-transform duration-300 hover:scale-105 ${
                                imageLoaded ? 'opacity-100' : 'opacity-0'
                            }`}
                            onLoad={() => setImageLoaded(true)}
                        />
                        
                        {/* Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                            {product.isNew && (
                                <Badge variant="success" size="sm">New</Badge>
                            )}
                            {product.discount && (
                                <Badge variant="danger" size="sm">-{product.discount}%</Badge>
                            )}
                            {product.isFeatured && (
                                <Badge variant="primary" size="sm">Featured</Badge>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            {showWishlist && (
                                <button
                                    onClick={handleWishlistToggle}
                                    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                                >
                                    {isWishlisted ? (
                                        <HeartSolidIcon className="h-4 w-4 text-red-500" />
                                    ) : (
                                        <HeartIcon className="h-4 w-4 text-gray-600" />
                                    )}
                                </button>
                            )}
                            
                            {showQuickView && (
                                <button
                                    onClick={handleQuickView}
                                    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                                >
                                    <EyeIcon className="h-4 w-4 text-gray-600" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 p-6">
                        <div className="flex flex-col h-full">
                            {/* Category */}
                            {product.category && (
                                <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                            )}
                            
                            {/* Product Name */}
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                {product.name}
                            </h3>
                            
                            {/* Description */}
                            <p className="text-gray-600 mb-4 flex-1">
                                {product.description}
                            </p>
                            
                            {/* Rating */}
                            {product.rating && (
                                <div className="flex items-center gap-1 mb-4">
                                    <div className="flex">
                                        {renderStars(product.rating)}
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        ({product.reviewCount || 0})
                                    </span>
                                </div>
                            )}
                            
                            {/* Price and Actions */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold text-gray-900">
                                        ${product.price?.toFixed(2) || '0.00'}
                                    </span>
                                    {product.originalPrice && product.originalPrice > product.price && (
                                        <span className="text-lg text-gray-500 line-through">
                                            ${product.originalPrice.toFixed(2)}
                                        </span>
                                    )}
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <Button
                                        onClick={handleAddToCart}
                                        size="sm"
                                        variant="outline"
                                    >
                                        <ShoppingCartIcon className="h-4 w-4 mr-2" />
                                        Add to Cart
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default ProductList;
