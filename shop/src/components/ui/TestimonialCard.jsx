import { StarIcon } from '@heroicons/react/24/solid';
import React from 'react';

const TestimonialCard = ({
    testimonial,
    className = ''
}) => {
    const renderStars = (rating) => {
        const stars = [];
        for (let i = 0; i < 5; i++) {
            stars.push(
                <StarIcon
                    key={i}
                    className={`h-5 w-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                />
            );
        }
        return stars;
    };

    return (
        <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
            {/* Rating */}
            <div className="flex items-center mb-4">
                <div className="flex">
                    {renderStars(testimonial.rating)}
                </div>
                <span className="ml-2 text-sm text-gray-500">
                    {testimonial.rating}/5
                </span>
            </div>

            {/* Review Text */}
            <blockquote className="text-gray-700 mb-4 italic">
                "{testimonial.text}"
            </blockquote>

            {/* Customer Info */}
            <div className="flex items-center">
                <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                    <p className="font-semibold text-gray-900">
                        {testimonial.name}
                    </p>
                    <p className="text-sm text-gray-500">
                        {testimonial.location}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TestimonialCard;
