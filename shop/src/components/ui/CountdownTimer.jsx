import { motion } from 'framer-motion';
import React from 'react';
import { useCountdown } from '../../hooks/useCountdown';
import { countdownVariants } from '../../utils/animations';

/**
 * Countdown timer component
 * @param {object} props - Component props
 * @param {Date} props.endDate - End date for countdown
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.showLabels - Whether to show time labels
 * @param {boolean} props.animate - Whether to animate the timer
 * @returns {JSX.Element} Countdown timer component
 */
const CountdownTimer = ({
    endDate,
    className = '',
    showLabels = true,
    animate = true,
    ...props
}) => {
    const { days, hours, minutes, seconds, isExpired } = useCountdown(endDate);

    if (isExpired) {
        return (
            <div className={`text-center ${className}`} {...props}>
                <div className="text-2xl font-bold text-red-600">
                    Deal Expired!
                </div>
            </div>
        );
    }

    const timeUnits = [
        { value: days, label: 'Days' },
        { value: hours, label: 'Hours' },
        { value: minutes, label: 'Minutes' },
        { value: seconds, label: 'Seconds' }
    ];

    const TimeUnit = ({ value, label, index }) => {
        const unitContent = (
            <div className="bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-center shadow-sm">
                <div className="text-3xl font-bold text-primary-600 mb-1">
                    {value}
                </div>
                {showLabels && (
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                        {label}
                    </div>
                )}
            </div>
        );

        if (animate) {
            return (
                <motion.div
                    key={`${value}-${index}`}
                    variants={countdownVariants}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: index * 0.1 }}
                >
                    {unitContent}
                </motion.div>
            );
        }

        return unitContent;
    };

    return (
        <div className={`grid grid-cols-4 gap-2 ${className}`} {...props}>
            {timeUnits.map((unit, index) => (
                <TimeUnit
                    key={unit.label}
                    value={unit.value}
                    label={unit.label}
                    index={index}
                />
            ))}
        </div>
    );
};

export default CountdownTimer;
