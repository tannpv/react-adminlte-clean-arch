import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import { useSlideshow } from '../../hooks/useSlideshow';
import { SLIDESHOW_DATA } from '../../utils/constants';
import Slide from './Slide';
import SlideNavigation from './SlideNavigation';

/**
 * Hero slideshow component
 * @param {object} props - Component props
 * @param {Array} props.slides - Array of slide data
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.autoPlay - Whether to auto-play slides
 * @param {number} props.autoPlayDelay - Auto-play delay in milliseconds
 * @returns {JSX.Element} Hero slideshow component
 */
const HeroSlideshow = ({
    slides = SLIDESHOW_DATA,
    className = '',
    autoPlay = true,
    autoPlayDelay = 5000,
    ...props
}) => {
    const {
        currentSlide,
        direction,
        isAutoPlaying,
        nextSlide,
        prevSlide,
        goToSlide,
        setIsAutoPlaying,
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd
    } = useSlideshow(slides.length, autoPlayDelay);

    // Pause auto-play on hover
    const handleMouseEnter = () => {
        if (autoPlay) {
            setIsAutoPlaying(false);
        }
    };

    const handleMouseLeave = () => {
        if (autoPlay) {
            setIsAutoPlaying(true);
        }
    };

    return (
        <section
            className={`relative overflow-hidden ${className}`}
            style={{ minHeight: '500px' }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            {...props}
        >
            {/* Slides Container */}
            <div className="relative w-full h-full" style={{ minHeight: '500px' }}>
                <AnimatePresence mode="wait" custom={direction}>
                    {slides.map((slide, index) => (
                        <Slide
                            key={slide.id}
                            slide={slide}
                            direction={direction}
                            isActive={index === currentSlide}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {/* Navigation */}
            <SlideNavigation
                currentSlide={currentSlide}
                totalSlides={slides.length}
                onPrev={prevSlide}
                onNext={nextSlide}
                onGoToSlide={goToSlide}
            />

            {/* Auto-play Indicator */}
            {autoPlay && (
                <div className="absolute top-4 right-4 z-20">
                    <motion.button
                        className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all duration-200"
                        onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label={isAutoPlaying ? 'Pause slideshow' : 'Play slideshow'}
                    >
                        {isAutoPlaying ? (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                            </svg>
                        ) : (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        )}
                    </motion.button>
                </div>
            )}

            {/* Progress Bar */}
            {autoPlay && isAutoPlaying && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-20">
                    <motion.div
                        className="h-full bg-white"
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: autoPlayDelay / 1000, ease: 'linear' }}
                        key={currentSlide} // Reset animation on slide change
                    />
                </div>
            )}
        </section>
    );
};

export default HeroSlideshow;
