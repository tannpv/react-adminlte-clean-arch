import React from 'react';

const Section = ({
    children,
    title,
    subtitle,
    className = '',
    container = true,
    background = 'white',
    padding = 'default',
    ...props
}) => {
    const backgroundClasses = {
        white: 'bg-white',
        gray: 'bg-gray-50',
        primary: 'bg-primary-600',
        dark: 'bg-gray-900',
    };

    const paddingClasses = {
        none: '',
        sm: 'py-8',
        default: 'py-16',
        lg: 'py-24',
        xl: 'py-32',
    };

    const classes = `${backgroundClasses[background]} ${paddingClasses[padding]} ${className}`;

    const content = (
        <>
            {(title || subtitle) && (
                <div className="text-center mb-12">
                    {subtitle && (
                        <p className="text-lg text-gray-600 mb-4">
                            {subtitle}
                        </p>
                    )}
                    {title && (
                        <h2 className={`text-3xl md:text-4xl font-bold ${background === 'primary' || background === 'dark'
                                ? 'text-white'
                                : 'text-gray-900'
                            }`}>
                            {title}
                        </h2>
                    )}
                </div>
            )}
            {children}
        </>
    );

    return (
        <section className={classes} {...props}>
            {container ? (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {content}
                </div>
            ) : (
                content
            )}
        </section>
    );
};

export default Section;
