import {
    HeartIcon,
    ShieldCheckIcon,
    ShoppingBagIcon,
    TruckIcon
} from '@heroicons/react/24/outline';
import React from 'react';
import { Link } from 'react-router-dom';
import Hero from '../../components/ui/Hero';
import Section from '../../components/ui/Section';
import ProductGrid from '../../components/product/ProductGrid';
import CategoryCard from '../../components/product/CategoryCard';
import Newsletter from '../../components/ui/Newsletter';
import { sampleProducts, sampleCategories, sampleFeatures } from '../../data/sampleData';

const HomePage = () => {
    const features = sampleFeatures.map(feature => ({
        ...feature,
        icon: {
            ShoppingBagIcon,
            TruckIcon,
            ShieldCheckIcon,
            HeartIcon
        }[feature.icon]
    }));

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <Hero
                title="Welcome to Our Shop"
                subtitle="Discover Amazing Products"
                description="Find the perfect products at unbeatable prices with fast shipping and excellent customer service"
                primaryButton={{ text: "Shop Now", to: "/products" }}
                secondaryButton={{ text: "Learn More", to: "/about" }}
                background="gradient-to-r from-primary-600 to-primary-800"
            />

            {/* Features Section */}
            <Section
                title="Why Choose Us?"
                subtitle="We're committed to providing the best shopping experience"
                background="white"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="text-center">
                            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <feature.icon className="h-8 w-8 text-primary-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </Section>

            {/* Featured Products Section */}
            <Section
                title="Featured Products"
                subtitle="Discover our most popular items"
                background="gray"
            >
                <ProductGrid 
                    products={sampleProducts.filter(product => product.isFeatured)}
                    columns={4}
                />
                <div className="text-center mt-8">
                    <Link
                        to="/products"
                        className="btn-primary text-lg px-8 py-3"
                    >
                        View All Products
                    </Link>
                </div>
            </Section>

            {/* Categories Section */}
            <Section
                title="Shop by Category"
                subtitle="Find exactly what you're looking for"
                background="white"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sampleCategories.slice(0, 6).map((category) => (
                        <CategoryCard
                            key={category.id}
                            category={category}
                            size="default"
                        />
                    ))}
                </div>
            </Section>

            {/* Newsletter Section */}
            <Section
                background="primary"
                padding="lg"
            >
                <Newsletter
                    title="Stay Updated"
                    subtitle="Subscribe to our newsletter for the latest updates and exclusive offers"
                    className="text-white"
                />
            </Section>
        </div>
    );
};

export default HomePage;
