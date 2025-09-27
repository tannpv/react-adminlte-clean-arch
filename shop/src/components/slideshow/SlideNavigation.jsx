import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import React from 'react';

/**
 * Slide navigation component with arrows and dots
 * @param {object} props - Component props
 * @param {number} props.currentSlide - Current slide index
 * @param {number} props.totalSlides - Total number of slides
 * @param {Function} props.onPrev - Previous slide handler
 * @param {Function} props.onNext - Next slide handler
 * @param {Function} props.onGoToSlide - Go to specific slide handler
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} Slide navigation component
 */
const SlideNavigation = ({
    currentSlide,
    totalSlides,
    onPrev,
    onNext,
    onGoToSlide,
    className = '',
    ...props
}) => {
    return (
        <div className={`relative ${className}`} {...props}>
            {/* Arrow Navigation */}
            <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 pointer-events-none">
                {/* Previous Button */}
                <motion.button
                    className="slide-nav prev bg-white bg-opacity-80 hover:bg-opacity-90 text-gray-800 p-3 rounded-full shadow-lg pointer-events-auto transition-all duration-300 ease-in-out hover:scale-105 active:scale-95"
                    onClick={onPrev}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Previous slide"
                >
                    <ChevronLeftIcon className="w-6 h-6" />
                </motion.button>

                {/* Next Button */}
                <motion.button
                    className="slide-nav next bg-white bg-opacity-80 hover:bg-opacity-90 text-gray-800 p-3 rounded-full shadow-lg pointer-events-auto transition-all duration-300 ease-in-out hover:scale-105 active:scale-95"
                    onClick={onNext}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Next slide"
                >
                    <ChevronRightIcon className="w-6 h-6" />
                </motion.button>
            </div>

            {/* Dot Navigation */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                {Array.from({ length: totalSlides }, (_, index) => (
                    <motion.button
                        key={index}
                        className={`slide-dot w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide
                                ? 'bg-white scale-125'
                                : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                            }`}
                        onClick={() => onGoToSlide(index)}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default SlideNavigation;
