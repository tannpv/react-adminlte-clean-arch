import { EnvelopeIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';
import Button from './Button';

const Newsletter = ({
    title = "Stay Updated",
    subtitle = "Subscribe to our newsletter for the latest updates and exclusive offers",
    placeholder = "Enter your email address",
    buttonText = "Subscribe",
    className = '',
    onSubmit,
    ...props
}) => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;

        setIsSubmitting(true);
        try {
            if (onSubmit) {
                await onSubmit(email);
            } else {
                // Default behavior - just simulate success
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            setIsSubscribed(true);
            setEmail('');
        } catch (error) {
            console.error('Newsletter subscription error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubscribed) {
        return (
            <div className={`text-center py-8 ${className}`} {...props}>
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
                    <div className="flex items-center justify-center">
                        <EnvelopeIcon className="h-5 w-5 mr-2" />
                        <span>Thank you for subscribing!</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`text-center ${className}`} {...props}>
            <div className="max-w-md mx-auto">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {title}
                </h3>
                <p className="text-gray-600 mb-6">
                    {subtitle}
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={placeholder}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            required
                        />
                    </div>
                    <Button
                        type="submit"
                        loading={isSubmitting}
                        disabled={!email.trim()}
                        className="whitespace-nowrap"
                    >
                        {buttonText}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default Newsletter;
