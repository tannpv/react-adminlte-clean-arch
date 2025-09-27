import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
import { fadeInVariants, slideInLeftVariants } from '../../utils/animations';
import { CATEGORIES } from '../../utils/constants';

/**
 * Navigation component with category dropdown
 * @param {object} props - Component props
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onCategoryClick - Category click handler
 * @returns {JSX.Element} Navigation component
 */
const Navigation = ({
    className = '',
    onCategoryClick,
    ...props
}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState(null);
    const dropdownRef = useRef(null);
    const categoryRefs = useRef({});

    // Icon mapping for categories
    const getCategoryIcon = (iconName) => {
        const icons = {
            kitchen: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ),
            home: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
            textile: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                </svg>
            ),
            accessories: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
            ),
            seasonal: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            )
        };
        return icons[iconName] || icons.home;
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
                setActiveCategory(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCategoryClick = (category) => {
        if (onCategoryClick) {
            onCategoryClick(category);
        }
        setIsDropdownOpen(false);
        setActiveCategory(null);
    };

    const handleCategoryHover = (categoryName) => {
        setActiveCategory(categoryName);
    };

    const handleCategoryLeave = () => {
        setActiveCategory(null);
    };

    return (
        <nav className={`relative ${className}`} {...props}>
            {/* Categories Button */}
            <div className="relative group" ref={dropdownRef}>
                <motion.button
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <span>Categories</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </motion.button>

                {/* Main Dropdown */}
                <AnimatePresence>
                    {isDropdownOpen && (
                        <motion.div
                            className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                            variants={fadeInVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            transition={{ duration: 0.2 }}
                        >
                            {CATEGORIES.map((category, index) => (
                                <motion.div
                                    key={category.name}
                                    className="group/item relative"
                                    variants={slideInLeftVariants}
                                    initial="hidden"
                                    animate="visible"
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <motion.button
                                        className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-primary-50 hover:text-primary-700 rounded transition-all duration-200 ease-in-out"
                                        onMouseEnter={() => handleCategoryHover(category.name)}
                                        onMouseLeave={handleCategoryLeave}
                                        onClick={() => handleCategoryClick(category)}
                                        whileHover={{ x: 5 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="text-primary-600">
                                            {getCategoryIcon(category.icon)}
                                        </div>
                                        <span className="font-medium">{category.name}</span>
                                        <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </motion.button>

                                    {/* Subcategory Dropdown */}
                                    <AnimatePresence>
                                        {activeCategory === category.name && (
                                            <motion.div
                                                className="absolute left-full top-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                                                variants={fadeInVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit="hidden"
                                                transition={{ duration: 0.2 }}
                                            >
                                                {category.subcategories.map((subcategory, subIndex) => (
                                                    <motion.button
                                                        key={subcategory}
                                                        className="w-full text-left px-4 py-2 hover:bg-primary-50 hover:text-primary-700 rounded transition-all duration-200 ease-in-out"
                                                        onClick={() => handleCategoryClick({ ...category, subcategory })}
                                                        variants={slideInLeftVariants}
                                                        initial="hidden"
                                                        animate="visible"
                                                        transition={{ delay: subIndex * 0.05 }}
                                                        whileHover={{ x: 5 }}
                                                    >
                                                        {subcategory}
                                                    </motion.button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    );
};

export default Navigation;
