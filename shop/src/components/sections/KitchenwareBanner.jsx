import { motion } from 'framer-motion';
import React from 'react';
import { fadeInVariants, slideInRightVariants } from '../../utils/animations';
import Button from '../ui/Button';

/**
 * Kitchenware banner section component
 * @param {object} props - Component props
 * @param {object} props.banner - Banner data
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onButtonClick - Button click handler
 * @returns {JSX.Element} Kitchenware banner component
 */
const KitchenwareBanner = ({
    banner,
    className = '',
    onButtonClick,
    ...props
}) => {
    // Default banner data if not provided
    const defaultBanner = {
        title: "Kitchenware Collection",
        subtitle: "10% Off",
        description: "Discover our premium collection of handcrafted kitchen essentials. Limited time offer on selected items.",
        buttonText: "Shop Now",
        backgroundImage: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
    };

    const bannerData = banner || defaultBanner;

    return (
        <motion.section
            className={`py-16 ${className}`}
            style={{ backgroundColor: '#EFEBEC' }}
            variants={fadeInVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            {...props}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Content */}
                    <motion.div
                        className="text-right"
                        variants={slideInRightVariants}
                    >
                        <motion.h2
                            className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 font-heading"
                            variants={slideInRightVariants}
                        >
                            {bannerData.title}
                        </motion.h2>

                        <motion.div
                            className="text-2xl font-bold text-accent-600 mb-4"
                            variants={slideInRightVariants}
                        >
                            {bannerData.subtitle}
                        </motion.div>

                        <motion.p
                            className="text-lg text-gray-700 mb-8 font-body"
                            variants={slideInRightVariants}
                        >
                            {bannerData.description}
                        </motion.p>

                        <motion.div
                            variants={slideInRightVariants}
                        >
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={onButtonClick}
                                className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                                animate={true}
                            >
                                {bannerData.buttonText}
                            </Button>
                        </motion.div>
                    </motion.div>

                    {/* Image */}
                    <motion.div
                        className="relative"
                        variants={fadeInVariants}
                    >
                        {bannerData.backgroundImage ? (
                            <img
                                src={bannerData.backgroundImage}
                                alt={bannerData.title}
                                className="w-full h-80 object-cover rounded-lg shadow-lg"
                            />
                        ) : (
                            <div className="w-full h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg shadow-lg flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-20 h-20 mx-auto mb-4 bg-gray-300 rounded-full flex items-center justify-center">
                                        <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-500 font-body">Kitchenware Image</p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </motion.section>
    );
};

export default KitchenwareBanner;
