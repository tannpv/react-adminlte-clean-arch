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
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

const ProductCard = ({ 
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
        <Card hover className={`group relative ${className}`}>
            <Link to={`/products/${product.id}`} className="block">
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                    {!imageLoaded && (
                        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                    )}
                    <img
                        src={product.image || '/placeholder-product.jpg'}
                        alt={product.name}
                        className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
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

                    {/* Add to Cart Button */}
                    <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                            onClick={handleAddToCart}
                            className="w-full"
                            size="sm"
                        >
                            <ShoppingCartIcon className="h-4 w-4 mr-2" />
                            Add to Cart
                        </Button>
                    </div>
                </div>

                {/* Product Info */}
                <div className="mt-4">
                    {/* Category */}
                    {product.category && (
                        <p className="text-sm text-gray-500 mb-1">{product.category}</p>
                    )}
                    
                    {/* Product Name */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {product.name}
                    </h3>
                    
                    {/* Rating */}
                    {product.rating && (
                        <div className="flex items-center gap-1 mb-2">
                            <div className="flex">
                                {renderStars(product.rating)}
                            </div>
                            <span className="text-sm text-gray-500">
                                ({product.reviewCount || 0})
                            </span>
                        </div>
                    )}
                    
                    {/* Price */}
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-gray-900">
                            ${product.price?.toFixed(2) || '0.00'}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-sm text-gray-500 line-through">
                                ${product.originalPrice.toFixed(2)}
                            </span>
                        )}
                    </div>
                </div>
            </Link>
        </Card>
    );
};

export default ProductCard;
