import { motion } from 'framer-motion';
import React from 'react';
import { slideVariants } from '../../utils/animations';
import Button from '../ui/Button';

/**
 * Individual slide component for slideshow
 * @param {object} props - Component props
 * @param {object} props.slide - Slide data
 * @param {number} props.direction - Slide direction (-1, 0, 1)
 * @param {boolean} props.isActive - Whether slide is active
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} Slide component
 */
const Slide = ({
    slide,
    direction = 0,
    isActive = false,
    className = '',
    ...props
}) => {
    const {
        id,
        title,
        subtitle,
        description,
        buttonText,
        backgroundImage,
        textColor = 'text-white',
        buttonColor = 'bg-yellow-500 hover:bg-yellow-600'
    } = slide;

    const slideContent = (
        <div
            className={`relative min-h-[500px] flex items-center justify-center bg-cover bg-center bg-no-repeat ${className}`}
            style={{
                backgroundImage: `url(${backgroundImage})`
            }}
            {...props}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>

            {/* Content */}
            <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    {subtitle && (
                        <motion.p
                            className={`text-lg sm:text-xl font-medium mb-4 ${textColor}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            {subtitle}
                        </motion.p>
                    )}

                    <motion.h1
                        className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 ${textColor}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                    >
                        {title}
                    </motion.h1>

                    {description && (
                        <motion.p
                            className={`text-lg sm:text-xl mb-8 max-w-2xl mx-auto ${textColor}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.8 }}
                        >
                            {description}
                        </motion.p>
                    )}

                    {buttonText && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 1.0 }}
                        >
                            <Button
                                variant="primary"
                                size="lg"
                                className={`${buttonColor} text-white font-semibold px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300`}
                            >
                                {buttonText}
                            </Button>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </div>
    );

    return (
        <motion.div
            className="absolute inset-0 w-full h-full"
            variants={slideVariants}
            custom={direction}
            initial="enter"
            animate={isActive ? "center" : "exit"}
            exit="exit"
            transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
            }}
            style={{
                zIndex: isActive ? 2 : 1
            }}
        >
            {slideContent}
        </motion.div>
    );
};

export default Slide;
