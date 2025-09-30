import React from 'react';

const Card = ({
    children,
    className = '',
    hover = false,
    padding = 'default',
    ...props
}) => {
    const baseClasses = 'bg-white rounded-lg border border-gray-200 overflow-hidden';
    const hoverClasses = hover ? 'hover:shadow-lg hover:border-gray-300 transition-all duration-200' : '';

    const paddingClasses = {
        none: '',
        sm: 'p-4',
        default: 'p-6',
        lg: 'p-8',
    };

    const classes = `${baseClasses} ${hoverClasses} ${paddingClasses[padding]} ${className}`;

    return (
        <div className={classes} {...props}>
            {children}
        </div>
    );
};

const CardHeader = ({ children, className = '', ...props }) => (
    <div className={`border-b border-gray-200 pb-4 mb-4 ${className}`} {...props}>
        {children}
    </div>
);

const CardBody = ({ children, className = '', ...props }) => (
    <div className={className} {...props}>
        {children}
    </div>
);

const CardFooter = ({ children, className = '', ...props }) => (
    <div className={`border-t border-gray-200 pt-4 mt-4 ${className}`} {...props}>
        {children}
    </div>
);

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
