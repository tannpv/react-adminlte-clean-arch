import { motion } from 'framer-motion';
import React from 'react';
import { buttonHoverVariants } from '../../utils/animations';

/**
 * Button component with variants and animations
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.variant - Button variant (primary, secondary, outline, ghost)
 * @param {string} props.size - Button size (sm, md, lg, xl)
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {boolean} props.loading - Whether button is in loading state
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.animate - Whether to animate the button
 * @param {Function} props.onClick - Click handler
 * @returns {JSX.Element} Button component
 */
const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    className = '',
    animate = true,
    onClick,
    type = 'button',
    ...props
}) => {
    // Variant styles
    const variants = {
        primary: 'bg-primary-600 hover:bg-primary-700 text-white border-primary-600',
        secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 border-gray-200',
        outline: 'border border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50',
        ghost: 'text-gray-700 hover:bg-gray-100 border-transparent',
        danger: 'bg-red-600 hover:bg-red-700 text-white border-red-600',
        success: 'bg-green-600 hover:bg-green-700 text-white border-green-600'
    };

    // Size styles
    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
        xl: 'px-8 py-4 text-xl'
    };

    // Base styles
    const baseStyles = `
    inline-flex items-center justify-center
    font-medium rounded-lg
    border transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
    disabled:opacity-50 disabled:cursor-not-allowed
    ${variants[variant]}
    ${sizes[size]}
    ${className}
  `.trim();

    // Loading spinner
    const LoadingSpinner = () => (
        <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            />
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
        </svg>
    );

    const buttonContent = (
        <>
            {loading && <LoadingSpinner />}
            {children}
        </>
    );

    if (animate && !disabled) {
        return (
            <motion.button
                type={type}
                className={baseStyles}
                variants={buttonHoverVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={onClick}
                disabled={disabled || loading}
                {...props}
            >
                {buttonContent}
            </motion.button>
        );
    }

    return (
        <button
            type={type}
            className={baseStyles}
            onClick={onClick}
            disabled={disabled || loading}
            {...props}
        >
            {buttonContent}
        </button>
    );
};

export default Button;