import { useCallback, useEffect, useState } from 'react';
import { COUNTDOWN_CONFIG } from '../utils/constants';
import { formatTime } from '../utils/helpers';

/**
 * Custom hook for countdown timer functionality
 * @param {Date} endDate - End date for countdown
 * @param {number} updateInterval - Update interval in milliseconds
 * @returns {object} Countdown state and controls
 */
export const useCountdown = (endDate = COUNTDOWN_CONFIG.endDate, updateInterval = COUNTDOWN_CONFIG.updateInterval) => {
    const [timeLeft, setTimeLeft] = useState(0);
    const [isExpired, setIsExpired] = useState(false);
    const [isActive, setIsActive] = useState(true);

    // Calculate time left
    const calculateTimeLeft = useCallback(() => {
        const now = new Date().getTime();
        const end = new Date(endDate).getTime();
        const difference = end - now;

        if (difference > 0) {
            setTimeLeft(difference);
            setIsExpired(false);
        } else {
            setTimeLeft(0);
            setIsExpired(true);
        }
    }, [endDate]);

    // Update countdown
    useEffect(() => {
        if (!isActive) return;

        // Initial calculation
        calculateTimeLeft();

        // Set up interval
        const interval = setInterval(calculateTimeLeft, updateInterval);

        return () => clearInterval(interval);
    }, [isActive, calculateTimeLeft, updateInterval]);

    // Pause/resume functionality
    const pause = useCallback(() => {
        setIsActive(false);
    }, []);

    const resume = useCallback(() => {
        setIsActive(true);
    }, []);

    const reset = useCallback((newEndDate) => {
        setIsActive(false);
        setTimeLeft(0);
        setIsExpired(false);

        if (newEndDate) {
            setTimeout(() => {
                setIsActive(true);
            }, 100);
        }
    }, []);

    // Format time for display
    const formattedTime = formatTime(timeLeft);

    return {
        timeLeft,
        formattedTime,
        isExpired,
        isActive,
        pause,
        resume,
        reset,
        days: formattedTime.days,
        hours: formattedTime.hours,
        minutes: formattedTime.minutes,
        seconds: formattedTime.seconds
    };
};
