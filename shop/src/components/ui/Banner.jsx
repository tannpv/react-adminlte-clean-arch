import React from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';

const Banner = ({ 
    title,
    subtitle,
    description,
    buttonText,
    buttonLink,
    backgroundImage,
    overlay = true,
    height = 'medium',
    textAlign = 'left',
    className = ''
}) => {
    const heightClasses = {
        small: 'py-12',
        medium: 'py-20',
        large: 'py-32',
        full: 'min-h-[400px] flex items-center',
    };

    const textAlignClasses = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
    };

    const backgroundStyle = backgroundImage ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
    } : {};

    return (
        <div 
            className={`relative ${heightClasses[height]} ${className}`}
            style={backgroundStyle}
        >
            {/* Overlay */}
            {overlay && (
                <div className="absolute inset-0 bg-black bg-opacity-50" />
            )}
            
            {/* Content */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
                <div className={`${textAlignClasses[textAlign]} max-w-2xl`}>
                    {subtitle && (
                        <p className="text-lg text-primary-300 mb-4 font-medium">
                            {subtitle}
                        </p>
                    )}
                    
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        {title}
                    </h2>
                    
                    {description && (
                        <p className="text-lg text-gray-200 mb-8">
                            {description}
                        </p>
                    )}
                    
                    {buttonText && buttonLink && (
                        <Button
                            as={Link}
                            to={buttonLink}
                            size="lg"
                            className="bg-white text-gray-900 hover:bg-gray-100"
                        >
                            {buttonText}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Banner;
