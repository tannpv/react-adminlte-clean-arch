import { motion } from 'framer-motion';
import React from 'react';

/**
 * Container component for consistent layout and spacing
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.animate - Whether to animate the container
 * @param {object} props.animationProps - Animation properties
 * @returns {JSX.Element} Container component
 */
const Container = ({
    children,
    className = '',
    animate = false,
    animationProps = {},
    ...props
}) => {
    const defaultAnimationProps = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, ease: "easeOut" },
        ...animationProps
    };

    const containerClasses = `
    max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
    ${className}
  `.trim();

    if (animate) {
        return (
            <motion.div
                className={containerClasses}
                {...defaultAnimationProps}
                {...props}
            >
                {children}
            </motion.div>
        );
    }

    return (
        <div className={containerClasses} {...props}>
            {children}
        </div>
    );
};

export default Container;
