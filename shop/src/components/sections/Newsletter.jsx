import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { fadeInVariants, scaleUpVariants } from '../../utils/animations';
import { NEWSLETTER_CONFIG } from '../../utils/constants';
import { isValidEmail } from '../../utils/helpers';
import Button from '../ui/Button';

/**
 * Newsletter subscription section component
 * @param {object} props - Component props
 * @param {object} props.config - Newsletter configuration
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onSubscribe - Subscribe handler
 * @returns {JSX.Element} Newsletter component
 */
const Newsletter = ({
    config = NEWSLETTER_CONFIG,
    className = '',
    onSubscribe,
    ...props
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [error, setError] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm();

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        setError('');

        try {
            // Validate email
            if (!isValidEmail(data.email)) {
                setError('Please enter a valid email address');
                setIsSubmitting(false);
                return;
            }

            // Call subscribe handler if provided
            if (onSubscribe) {
                await onSubscribe(data.email);
            } else {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            setIsSubscribed(true);
            reset();
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubscribed) {
        return (
            <motion.section
                className={`py-16 ${className}`}
                style={{ backgroundColor: '#F4F4F4' }}
                variants={scaleUpVariants}
                initial="hidden"
                animate="visible"
                {...props}
            >
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg"
                        variants={scaleUpVariants}
                    >
                        <div className="flex items-center justify-center">
                            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="font-semibold">Successfully subscribed to our newsletter!</span>
                        </div>
                    </motion.div>
                </div>
            </motion.section>
        );
    }

    return (
        <motion.section
            className={`py-16 ${className}`}
            style={{ backgroundColor: '#F4F4F4' }}
            variants={fadeInVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            {...props}
        >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="text-center"
                    variants={fadeInVariants}
                >
                    {/* Header */}
                    <motion.div
                        className="mb-8"
                        variants={fadeInVariants}
                    >
                        <motion.h2
                            className="text-3xl font-bold text-gray-900 mb-4 font-heading"
                            variants={fadeInVariants}
                        >
                            {config.title}
                        </motion.h2>

                        <motion.div
                            className="text-2xl font-bold text-accent-600 mb-4"
                            variants={fadeInVariants}
                        >
                            {config.subtitle}
                        </motion.div>

                        <motion.p
                            className="text-lg text-gray-700 font-body"
                            variants={fadeInVariants}
                        >
                            {config.description}
                        </motion.p>
                    </motion.div>

                    {/* Form */}
                    <motion.form
                        onSubmit={handleSubmit(onSubmit)}
                        className="max-w-md mx-auto"
                        variants={scaleUpVariants}
                    >
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Email Input */}
                            <div className="flex-1">
                                <input
                                    type="email"
                                    placeholder={config.placeholder}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 ${errors.email ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    {...register('email', {
                                        required: 'Email is required',
                                        pattern: {
                                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                            message: 'Please enter a valid email address'
                                        }
                                    })}
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                                )}
                            </div>

                            {/* Subscribe Button */}
                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                loading={isSubmitting}
                                disabled={isSubmitting}
                                className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                                animate={true}
                            >
                                {isSubmitting ? 'Subscribing...' : config.buttonText}
                            </Button>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {error}
                            </motion.div>
                        )}
                    </motion.form>

                    {/* Benefits */}
                    <motion.div
                        className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600"
                        variants={fadeInVariants}
                    >
                        <div className="flex items-center justify-center">
                            <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Exclusive offers
                        </div>
                        <div className="flex items-center justify-center">
                            <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            New product alerts
                        </div>
                        <div className="flex items-center justify-center">
                            <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Free shipping
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </motion.section>
    );
};

export default Newsletter;
