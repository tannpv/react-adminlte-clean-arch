import { motion } from 'framer-motion';
import React from 'react';
import Container from './Container';

/**
 * Section component for consistent section layout
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.bgColor - Background color class
 * @param {string} props.textColor - Text color class
 * @param {string} props.padding - Padding class (py-8, py-12, py-16, py-20)
 * @param {boolean} props.animate - Whether to animate the section
 * @param {object} props.animationProps - Animation properties
 * @returns {JSX.Element} Section component
 */
const Section = ({
    children,
    className = '',
    bgColor = 'bg-white',
    textColor = 'text-gray-900',
    padding = 'py-12',
    animate = false,
    animationProps = {},
    ...props
}) => {
    const defaultAnimationProps = {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.1 },
        transition: { duration: 0.6, ease: "easeOut" },
        ...animationProps
    };

    const sectionClasses = `
    ${bgColor} ${textColor} ${padding}
    ${className}
  `.trim();

    if (animate) {
        return (
            <motion.section
                className={sectionClasses}
                {...defaultAnimationProps}
                {...props}
            >
                <Container>
                    {children}
                </Container>
            </motion.section>
        );
    }

    return (
        <section className={sectionClasses} {...props}>
            <Container>
                {children}
            </Container>
        </section>
    );
};

export default Section;
