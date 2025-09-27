import { motion } from 'framer-motion';
import React from 'react';
import { fadeInVariants, staggerContainerVariants, staggerItemVariants } from '../../utils/animations';
import { CONTACT_INFO } from '../../utils/constants';

/**
 * Contact information section component
 * @param {object} props - Component props
 * @param {Array} props.contactData - Array of contact information
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onContactClick - Contact click handler
 * @returns {JSX.Element} Contact info component
 */
const ContactInfo = ({
    contactData = CONTACT_INFO,
    className = '',
    onContactClick,
    ...props
}) => {
    // Icon mapping for contact types
    const getContactIcon = (iconName) => {
        const icons = {
            location: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            phone: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
            ),
            email: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            )
        };
        return icons[iconName] || icons.email;
    };

    return (
        <motion.section
            className={`py-16 bg-white ${className}`}
            variants={fadeInVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            {...props}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Contact Cards */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
                    variants={staggerContainerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                >
                    {Object.values(contactData).map((contact, index) => (
                        <motion.div
                            key={index}
                            className="bg-white border border-gray-200 rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-shadow duration-200"
                            variants={staggerItemVariants}
                            whileHover={{ y: -5 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* Icon */}
                            <motion.div
                                className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ duration: 0.2 }}
                            >
                                {getContactIcon(contact.icon)}
                            </motion.div>

                            {/* Content */}
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 font-heading">
                                {contact.title}
                            </h3>

                            <p className="text-gray-600 font-body whitespace-pre-line">
                                {contact.content}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Live Chat Section */}
                <motion.div
                    className="bg-gray-50 rounded-lg p-8 text-center"
                    variants={fadeInVariants}
                >
                    <motion.div
                        className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.2 }}
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </motion.div>

                    <motion.h3
                        className="text-2xl font-bold text-gray-900 mb-2 font-heading"
                        variants={fadeInVariants}
                    >
                        Need Help?
                    </motion.h3>

                    <motion.p
                        className="text-gray-600 mb-6 font-body"
                        variants={fadeInVariants}
                    >
                        Our customer support team is here to help you with any questions or concerns.
                    </motion.p>

                    <motion.div
                        variants={fadeInVariants}
                    >
                        <motion.button
                            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onContactClick && onContactClick('chat')}
                        >
                            Start Chat
                        </motion.button>
                    </motion.div>
                </motion.div>
            </div>
        </motion.section>
    );
};

export default ContactInfo;
