import { useCallback, useEffect, useRef, useState } from 'react';
import { SLIDESHOW_CONFIG } from '../utils/constants';

/**
 * Custom hook for managing slideshow functionality
 * @param {number} totalSlides - Total number of slides
 * @param {number} autoPlayDelay - Auto-play delay in milliseconds
 * @returns {object} Slideshow state and controls
 */
export const useSlideshow = (totalSlides = SLIDESHOW_CONFIG.totalSlides, autoPlayDelay = SLIDESHOW_CONFIG.autoPlayDelay) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [direction, setDirection] = useState(0);
    const intervalRef = useRef(null);

    // Auto-play functionality
    const startAutoPlay = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        intervalRef.current = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % totalSlides);
            setDirection(1);
        }, autoPlayDelay);
    }, [totalSlides, autoPlayDelay]);

    const stopAutoPlay = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    // Navigation functions
    const nextSlide = useCallback(() => {
        setCurrentSlide(prev => (prev + 1) % totalSlides);
        setDirection(1);
    }, [totalSlides]);

    const prevSlide = useCallback(() => {
        setCurrentSlide(prev => (prev - 1 + totalSlides) % totalSlides);
        setDirection(-1);
    }, [totalSlides]);

    const goToSlide = useCallback((index) => {
        if (index >= 0 && index < totalSlides && index !== currentSlide) {
            setCurrentSlide(index);
            setDirection(index > currentSlide ? 1 : -1);
        }
    }, [currentSlide, totalSlides]);

    // Touch/swipe support
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    const handleTouchStart = useCallback((e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    }, []);

    const handleTouchMove = useCallback((e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    }, []);

    const handleTouchEnd = useCallback(() => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe) {
            nextSlide();
        } else if (isRightSwipe) {
            prevSlide();
        }
    }, [touchStart, touchEnd, nextSlide, prevSlide]);

    // Keyboard navigation
    const handleKeyDown = useCallback((e) => {
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                prevSlide();
                break;
            case 'ArrowRight':
                e.preventDefault();
                nextSlide();
                break;
            case ' ':
                e.preventDefault();
                setIsAutoPlaying(prev => !prev);
                break;
            default:
                break;
        }
    }, [nextSlide, prevSlide]);

    // Auto-play control
    useEffect(() => {
        if (isAutoPlaying) {
            startAutoPlay();
        } else {
            stopAutoPlay();
        }

        return () => stopAutoPlay();
    }, [isAutoPlaying, startAutoPlay, stopAutoPlay]);

    // Keyboard event listener
    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    return {
        currentSlide,
        direction,
        isAutoPlaying,
        nextSlide,
        prevSlide,
        goToSlide,
        setIsAutoPlaying,
        startAutoPlay,
        stopAutoPlay,
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd
    };
};
