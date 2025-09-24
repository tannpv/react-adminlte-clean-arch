import React from 'react';

const Card = ({ children, className = '', ...props }) => {
    return (
        <div className={`bg-white shadow rounded-lg ${className}`} {...props}>
            {children}
        </div>
    );
};

const CardHeader = ({ children, className = '', ...props }) => {
    return (
        <div className={`px-6 py-4 border-b border-gray-200 ${className}`} {...props}>
            {children}
        </div>
    );
};

const CardBody = ({ children, className = '', ...props }) => {
    return (
        <div className={`p-6 ${className}`} {...props}>
            {children}
        </div>
    );
};

const CardFooter = ({ children, className = '', ...props }) => {
    return (
        <div className={`px-6 py-4 border-t border-gray-200 ${className}`} {...props}>
            {children}
        </div>
    );
};

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
