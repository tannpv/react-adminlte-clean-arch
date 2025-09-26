import React from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';

const Hero = ({ 
    title,
    subtitle,
    description,
    primaryButton,
    secondaryButton,
    backgroundImage,
    overlay = true,
    height = 'large',
    className = ''
}) => {
    const heightClasses = {
        small: 'py-16',
        medium: 'py-24',
        large: 'py-32',
        full: 'min-h-screen flex items-center',
    };

    const backgroundStyle = backgroundImage ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
    } : {};

    return (
        <section 
            className={`relative ${heightClasses[height]} ${className}`}
            style={backgroundStyle}
        >
            {/* Overlay */}
            {overlay && (
                <div className="absolute inset-0 bg-black bg-opacity-40" />
            )}
            
            {/* Content */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    {subtitle && (
                        <p className="text-lg text-primary-100 mb-4 font-medium">
                            {subtitle}
                        </p>
                    )}
                    
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                        {title}
                    </h1>
                    
                    {description && (
                        <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto">
                            {description}
                        </p>
                    )}
                    
                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {primaryButton && (
                            <Button
                                as={Link}
                                to={primaryButton.to}
                                size="lg"
                                className="bg-white text-primary-600 hover:bg-gray-100"
                            >
                                {primaryButton.text}
                            </Button>
                        )}
                        
                        {secondaryButton && (
                            <Button
                                as={Link}
                                to={secondaryButton.to}
                                variant="outline"
                                size="lg"
                                className="border-white text-white hover:bg-white hover:text-primary-600"
                            >
                                {secondaryButton.text}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
