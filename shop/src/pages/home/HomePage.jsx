import { motion } from 'framer-motion';
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

// Components
import Section from '../../components/common/Section';
import ContactInfo from '../../components/sections/ContactInfo';
import KitchenwareBanner from '../../components/sections/KitchenwareBanner';
import NewArrivals from '../../components/sections/NewArrivals';
import Newsletter from '../../components/sections/Newsletter';
import ServiceGuarantees from '../../components/sections/ServiceGuarantees';
import TodaysDeal from '../../components/sections/TodaysDeal';
import HeroSlideshow from '../../components/slideshow/HeroSlideshow';

/**
 * HomePage component - Main landing page
 * @returns {JSX.Element} HomePage component
 */
const HomePage = () => {
    const { addToCart } = useCart();
    const { user } = useAuth();

    // Handle add to cart
    const handleAddToCart = (product) => {
        addToCart(product);
        // You could add a toast notification here
        console.log('Added to cart:', product);
    };

    // Handle view product details
    const handleViewDetails = (product) => {
        // Navigate to product detail page
        window.location.href = `/products/${product.id}`;
    };

    // Handle newsletter subscription
    const handleNewsletterSubscribe = async (email) => {
        try {
            // Here you would typically make an API call to subscribe the user
            console.log('Newsletter subscription:', email);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error('Newsletter subscription error:', error);
            throw error;
        }
    };

    // Handle contact actions
    const handleContactClick = (type) => {
        console.log('Contact action:', type);
        // Handle different contact actions (chat, phone, email)
    };

    // Handle kitchenware banner click
    const handleKitchenwareClick = () => {
        window.location.href = '/products?category=kitchenware';
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Slideshow */}
            <motion.section
                className="relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                <HeroSlideshow />
            </motion.section>

            {/* Today's Deal & New Arrivals Section */}
            <Section className="py-16" bgColor="bg-white">
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-stretch">
                    <TodaysDeal
                        onAddToCart={handleAddToCart}
                        onViewDetails={handleViewDetails}
                    />
                    <NewArrivals
                        onAddToCart={handleAddToCart}
                        onViewDetails={handleViewDetails}
                    />
                </div>
            </Section>

            {/* Kitchenware Banner */}
            <KitchenwareBanner onButtonClick={handleKitchenwareClick} />

            {/* Service Guarantees */}
            <ServiceGuarantees />

            {/* Newsletter */}
            <Newsletter onSubscribe={handleNewsletterSubscribe} />

            {/* Contact Information */}
            <ContactInfo onContactClick={handleContactClick} />

        </div>
    );
};

export default HomePage;