import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { fadeInVariants, staggerContainerVariants, staggerItemVariants } from '../../utils/animations';
import ProductCard from '../ui/ProductCard';

/**
 * New Arrivals section component
 * @param {object} props - Component props
 * @param {Array} props.products - Array of product data
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onAddToCart - Add to cart handler
 * @param {Function} props.onViewDetails - View details handler
 * @returns {JSX.Element} New Arrivals component
 */
const NewArrivals = ({
    products = [],
    className = '',
    onAddToCart,
    onViewDetails,
    ...props
}) => {
    const [activeFilter, setActiveFilter] = useState('all');

    // Sample products if not provided
    const defaultProducts = [
        {
            id: 1,
            name: "Handwoven Textile Art",
            author: "Textile Studio",
            price: 149.99,
            originalPrice: 199.99,
            image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            badge: "New",
            isNew: true,
            discount: 25
        },
        {
            id: 2,
            name: "Ceramic Vase Collection",
            author: "Pottery Works",
            price: 79.99,
            originalPrice: 99.99,
            image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            badge: "Limited",
            discount: 20
        },
        {
            id: 3,
            name: "Handcrafted Jewelry Set",
            author: "Jewelry Artisan",
            price: 199.99,
            originalPrice: 249.99,
            image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            badge: "New",
            isNew: true,
            discount: 20
        },
        {
            id: 4,
            name: "Wooden Kitchen Utensils",
            author: "Kitchen Crafts",
            price: 59.99,
            originalPrice: 79.99,
            image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            badge: "Popular",
            discount: 25
        },
        {
            id: 5,
            name: "Handmade Soap Collection",
            author: "Natural Soaps",
            price: 39.99,
            originalPrice: 49.99,
            image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            badge: "New",
            isNew: true,
            discount: 20
        },
        {
            id: 6,
            name: "Artisan Candle Set",
            author: "Candle Studio",
            price: 89.99,
            originalPrice: 119.99,
            image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            badge: "Limited",
            discount: 25
        }
    ];

    const productsData = products.length > 0 ? products : defaultProducts;

    const filters = [
        { id: 'all', label: 'All Items' },
        { id: 'new', label: 'New' },
        { id: 'popular', label: 'Popular' },
        { id: 'limited', label: 'Limited' }
    ];

    const filteredProducts = productsData.filter(product => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'new') return product.isNew;
        if (activeFilter === 'popular') return product.badge === 'Popular';
        if (activeFilter === 'limited') return product.badge === 'Limited';
        return true;
    });

    return (
        <motion.div
            className={`lg:col-span-7 ${className}`}
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
                    New Arrivals
                </motion.h2>

                {/* Filter Buttons */}
                <div className="flex space-x-2">
                    {filters.map((filter) => (
                        <motion.button
                            key={filter.id}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${activeFilter === filter.id
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            onClick={() => setActiveFilter(filter.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            variants={staggerItemVariants}
                        >
                            {filter.label}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Products Grid */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={staggerContainerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
            >
                {filteredProducts.map((product, index) => (
                    <motion.div
                        key={product.id}
                        variants={staggerItemVariants}
                        className="h-full"
                    >
                        <ProductCard
                            product={product}
                            onAddToCart={onAddToCart}
                            onViewDetails={onViewDetails}
                            animate={true}
                        />
                    </motion.div>
                ))}
            </motion.div>

            {/* View All Button */}
            <motion.div
                className="text-center mt-8"
                variants={staggerItemVariants}
            >
                <motion.button
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-8 rounded-lg transition-colors duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    View All Products
                </motion.button>
            </motion.div>
        </motion.div>
    );
};

export default NewArrivals;
