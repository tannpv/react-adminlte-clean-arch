import React from 'react';
import { Link } from 'react-router-dom';
import Badge from './Badge';
import Button from './Button';

const OfferCard = ({
    offer,
    className = '',
    size = 'default'
}) => {
    const sizeClasses = {
        small: 'p-4',
        default: 'p-6',
        large: 'p-8',
    };

    const imageSizeClasses = {
        small: 'h-32',
        default: 'h-48',
        large: 'h-64',
    };

    return (
        <div className={`relative overflow-hidden rounded-lg bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 ${sizeClasses[size]} ${className}`}>
            <Link to={offer.link || '#'} className="block">
                {/* Background Image */}
                <div className={`relative ${imageSizeClasses[size]} overflow-hidden rounded-lg mb-4`}>
                    <img
                        src={offer.image}
                        alt={offer.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-30" />

                    {/* Badge */}
                    {offer.badge && (
                        <div className="absolute top-4 left-4">
                            <Badge variant="danger" size="lg">
                                {offer.badge}
                            </Badge>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {offer.title}
                    </h3>

                    {offer.subtitle && (
                        <p className="text-gray-600 mb-4">
                            {offer.subtitle}
                        </p>
                    )}

                    {offer.description && (
                        <p className="text-sm text-gray-500 mb-4">
                            {offer.description}
                        </p>
                    )}

                    {offer.price && (
                        <div className="mb-4">
                            <span className="text-2xl font-bold text-primary-600">
                                {offer.price}
                            </span>
                            {offer.originalPrice && (
                                <span className="text-lg text-gray-500 line-through ml-2">
                                    {offer.originalPrice}
                                </span>
                            )}
                        </div>
                    )}

                    {offer.buttonText && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                        >
                            {offer.buttonText}
                        </Button>
                    )}
                </div>
            </Link>
        </div>
    );
};

export default OfferCard;
