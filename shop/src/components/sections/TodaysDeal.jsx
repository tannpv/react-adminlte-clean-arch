import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import React from 'react';
import { fadeInVariants, staggerContainerVariants, staggerItemVariants } from '../../utils/animations';
import CountdownTimer from '../ui/CountdownTimer';

/**
 * Today's Deal section component
 * @param {object} props - Component props
 * @param {object} props.deal - Deal data
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onAddToCart - Add to cart handler
 * @param {Function} props.onViewDetails - View details handler
 * @returns {JSX.Element} Today's Deal component
 */
const TodaysDeal = ({
    deal,
    className = '',
    onAddToCart,
    onViewDetails,
    ...props
}) => {
    // Sample deal data if not provided
    const defaultDeal = {
        id: 1,
        title: "Today's Deal",
        product: {
            id: 1,
            name: "Handcrafted Wooden Bowl Set",
            author: "Artisan Crafts",
            price: 89.99,
            originalPrice: 129.99,
            image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            badge: "Limited Time",
            discount: 31
        },
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    };

    const dealData = deal || defaultDeal;

    return (
        <motion.div
            className={`lg:col-span-3 ${className}`}
            variants={fadeInVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            {...props}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <motion.h2
                    className="text-2xl font-bold text-gray-900 font-heading"
                    variants={staggerItemVariants}
                >
                    {dealData.title}
                </motion.h2>

                {/* Navigation Arrows */}
                <div className="flex space-x-2">
                    <motion.button
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label="Previous deal"
                    >
                        <ChevronLeftIcon className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label="Next deal"
                    >
                        <ChevronRightIcon className="w-5 h-5" />
                    </motion.button>
                </div>
            </div>

            {/* Deal Content */}
            <motion.div
                className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm h-full flex flex-col"
                variants={staggerContainerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
            >
                {/* Countdown Timer */}
                <motion.div
                    className="mb-4"
                    variants={staggerItemVariants}
                >
                    <CountdownTimer
                        endDate={dealData.endDate}
                        className="justify-start"
                        animate={true}
                    />
                </motion.div>

                {/* Product Display */}
                <motion.div
                    className="flex-1 flex flex-col justify-center"
                    variants={staggerItemVariants}
                >
                    <div className="text-center">
                        {/* Product Image */}
                        <div className="mb-4">
                            {dealData.product.image ? (
                                <img
                                    src={dealData.product.image}
                                    alt={dealData.product.name}
                                    className="w-full h-48 object-cover rounded-lg mx-auto"
                                />
                            ) : (
                                <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mx-auto flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="w-16 h-16 mx-auto mb-3 bg-gray-300 rounded-full flex items-center justify-center">
                                            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <p className="text-sm text-gray-500">No Image</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {dealData.product.name}
                            </h3>
                            {dealData.product.author && (
                                <p className="text-base text-gray-600 mb-3">
                                    by {dealData.product.author}
                                </p>
                            )}

                            {/* Price */}
                            <div className="flex items-center justify-center space-x-2 mb-4">
                                <span className="text-xl font-bold text-gray-900">
                                    ${dealData.product.price.toFixed(2)}
                                </span>
                                {dealData.product.originalPrice && dealData.product.originalPrice > dealData.product.price && (
                                    <span className="text-base text-gray-500 line-through">
                                        ${dealData.product.originalPrice.toFixed(2)}
                                    </span>
                                )}
                                {dealData.product.discount && (
                                    <span className="bg-accent-600 text-white text-xs font-medium px-2 py-1 rounded">
                                        -{dealData.product.discount}%
                                    </span>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => onViewDetails && onViewDetails(dealData.product)}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                                >
                                    View Details
                                </button>
                                <button
                                    onClick={() => onAddToCart && onAddToCart(dealData.product)}
                                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                                >
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default TodaysDeal;
