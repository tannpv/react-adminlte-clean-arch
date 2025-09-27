import { motion } from 'framer-motion';
import React from 'react';
import Container from '../common/Container';

const Footer = () => {
    return (
        <>
            {/* Footer */}
            <footer className="bg-white text-gray-800 py-12">
                <Container>
                    {/* Upper Section - Navigation Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        {/* About Column */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h3 className="text-lg font-semibold mb-4 text-gray-900 font-body">About</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-body">News & Stories</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-body">History</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-body">Our Studio</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-body">Shop</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-body">Stockists</a></li>
                            </ul>
                        </motion.div>

                        {/* Customer Services Column */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                        >
                            <h3 className="text-lg font-semibold mb-4 text-gray-900 font-body">Customer services</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-body">Contact Us</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-body">Trade Services</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-body">Login/Register</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-body">Delivery & Returns</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-body">FAQs</a></li>
                            </ul>
                        </motion.div>

                        {/* New Arrivals Column */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <h3 className="text-lg font-semibold mb-4 text-gray-900 font-body">New arrivals</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-body">All Item</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-body">Jewellery</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-body">Clothing & Accessories</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-body">Celebrations</a></li>
                            </ul>
                        </motion.div>

                        {/* Accessories Column */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            <h3 className="text-lg font-semibold mb-4 text-gray-900 font-body">Accessories</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-body">Jewellery</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-body">Beachwear</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-body">Hats | Headbands</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-body">Eyewear</a></li>
                                <li><a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-body">Scarves</a></li>
                            </ul>
                        </motion.div>
                    </div>
                </Container>
            </footer>

            {/* Bottom Copyright Bar (Full Width) */}
            <div className="w-full py-8" style={{ backgroundColor: '#F4F4F4' }}>
                <Container>
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        {/* Copyright */}
                        <motion.div
                            className="text-gray-500 text-sm font-body mb-4 md:mb-0"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            Copyright © 2018 by Pixel Creative All Rights Reserved
                        </motion.div>

                        {/* Social Media Icons */}
                        <motion.div
                            className="flex space-x-3"
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            {/* Facebook */}
                            <motion.a
                                href="#"
                                className="w-8 h-8 rounded flex items-center justify-center hover:opacity-80 transition-opacity"
                                style={{ backgroundColor: '#6B7280' }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <span className="text-white text-sm font-bold">f</span>
                            </motion.a>
                            {/* Vimeo */}
                            <motion.a
                                href="#"
                                className="w-8 h-8 rounded flex items-center justify-center hover:opacity-80 transition-opacity"
                                style={{ backgroundColor: '#6B7280' }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <span className="text-white text-sm font-bold">v</span>
                            </motion.a>
                            {/* Pinterest */}
                            <motion.a
                                href="#"
                                className="w-8 h-8 rounded flex items-center justify-center hover:opacity-80 transition-opacity"
                                style={{ backgroundColor: '#6B7280' }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <span className="text-white text-sm font-bold">p</span>
                            </motion.a>
                            {/* LinkedIn */}
                            <motion.a
                                href="#"
                                className="w-8 h-8 rounded flex items-center justify-center hover:opacity-80 transition-opacity"
                                style={{ backgroundColor: '#6B7280' }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <span className="text-white text-xs font-bold">in</span>
                            </motion.a>
                            {/* Google+ */}
                            <motion.a
                                href="#"
                                className="w-8 h-8 rounded flex items-center justify-center hover:opacity-80 transition-opacity"
                                style={{ backgroundColor: '#6B7280' }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <span className="text-white text-xs font-bold">G+</span>
                            </motion.a>
                        </motion.div>
                    </div>
                </Container>
            </div>
        </>
    );
};

export default Footer;
