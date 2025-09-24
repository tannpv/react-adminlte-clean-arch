import React from 'react';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    className = '',
    type = 'button',
    ...props
}) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200';

    const variants = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
        success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
        info: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500',
        outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
        'outline-primary': 'border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white focus:ring-blue-500',
        'outline-secondary': 'border border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white focus:ring-gray-500',
        'outline-danger': 'border border-red-600 text-red-600 hover:bg-red-600 hover:text-white focus:ring-red-500',
        'outline-success': 'border border-green-600 text-green-600 hover:bg-green-600 hover:text-white focus:ring-green-500',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
        xl: 'px-8 py-4 text-lg',
    };

    const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

    return (
        <button
            type={type}
            className={classes}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
