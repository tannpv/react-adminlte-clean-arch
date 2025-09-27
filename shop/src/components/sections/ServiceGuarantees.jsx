import { motion } from 'framer-motion';
import React from 'react';
import { fadeInVariants, staggerContainerVariants, staggerItemVariants } from '../../utils/animations';
import { SERVICE_GUARANTEES } from '../../utils/constants';

/**
 * Service guarantees section component
 * @param {object} props - Component props
 * @param {Array} props.services - Array of service data
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} Service guarantees component
 */
const ServiceGuarantees = ({
    services = SERVICE_GUARANTEES,
    className = '',
    ...props
}) => {
    // Icon mapping for services
    const getServiceIcon = (iconName) => {
        const icons = {
            truck: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
            ),
            shield: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            ),
            support: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                </svg>
            )
        };
        return icons[iconName] || icons.support;
    };

    return (
        <motion.section
            className={`py-16 bg-gray-50 ${className}`}
            variants={fadeInVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            {...props}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    variants={staggerContainerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                >
                    {services.map((service, index) => (
                        <motion.div
                            key={index}
                            className="text-center"
                            variants={staggerItemVariants}
                        >
                            {/* Icon */}
                            <motion.div
                                className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ duration: 0.2 }}
                            >
                                {getServiceIcon(service.icon)}
                            </motion.div>

                            {/* Content */}
                            <motion.h3
                                className="text-xl font-semibold text-gray-900 mb-2 font-heading"
                                variants={staggerItemVariants}
                            >
                                {service.title}
                            </motion.h3>

                            <motion.p
                                className="text-gray-600 font-body"
                                variants={staggerItemVariants}
                            >
                                {service.description}
                            </motion.p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </motion.section>
    );
};

export default ServiceGuarantees;
