import {
    HeartIcon,
    ShieldCheckIcon,
    ShoppingBagIcon,
    TruckIcon
} from '@heroicons/react/24/outline';
import React from 'react';
import { Link } from 'react-router-dom';
import CategoryCard from '../../components/product/CategoryCard';
import ProductGrid from '../../components/product/ProductGrid';
import Banner from '../../components/ui/Banner';
import Newsletter from '../../components/ui/Newsletter';
import OfferCard from '../../components/ui/OfferCard';
import Section from '../../components/ui/Section';
import TestimonialCard from '../../components/ui/TestimonialCard';
import {
    sampleBanners,
    sampleCategories,
    sampleFeatures,
    sampleOffers,
    sampleProducts,
    sampleTestimonials
} from '../../data/sampleData';

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
            {/* Main Hero Banner */}
            <Banner
                title="New Collection 2024"
                subtitle="Spring Fashion"
                description="Discover the latest trends in fashion and lifestyle with our exclusive collection"
                buttonText="Shop Now"
                buttonLink="/products?collection=spring-2024"
                backgroundImage={sampleBanners[0].backgroundImage}
                height="large"
                textAlign="left"
            />

            {/* Features Section */}
            <Section
                title="Why Choose Us?"
                subtitle="We're committed to providing the best shopping experience"
                background="white"
                padding="lg"
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

            {/* Special Offers Section */}
            <Section
                title="Special Offers"
                subtitle="Don't miss out on these amazing deals"
                background="gray"
                padding="lg"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {sampleOffers.map((offer) => (
                        <OfferCard
                            key={offer.id}
                            offer={offer}
                            size="default"
                        />
                    ))}
                </div>
            </Section>

            {/* Categories Section */}
            <Section
                title="Shop by Category"
                subtitle="Find exactly what you're looking for"
                background="white"
                padding="lg"
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

            {/* New Arrivals Section */}
            <Section
                title="New Arrivals"
                subtitle="Fresh products just added to our collection"
                background="gray"
                padding="lg"
            >
                <ProductGrid
                    products={sampleProducts.filter(product => product.isNew)}
                    columns={4}
                />
                <div className="text-center mt-8">
                    <Link
                        to="/products?filter=new"
                        className="btn-primary text-lg px-8 py-3"
                    >
                        View All New Arrivals
                    </Link>
                </div>
            </Section>

            {/* Best Sellers Section */}
            <Section
                title="Best Sellers"
                subtitle="Our most popular products"
                background="white"
                padding="lg"
            >
                <ProductGrid
                    products={sampleProducts.filter(product => product.rating >= 4.5)}
                    columns={4}
                />
                <div className="text-center mt-8">
                    <Link
                        to="/products?sort=rating"
                        className="btn-primary text-lg px-8 py-3"
                    >
                        View All Best Sellers
                    </Link>
                </div>
            </Section>

            {/* Testimonials Section */}
            <Section
                title="What Our Customers Say"
                subtitle="Real reviews from satisfied customers"
                background="gray"
                padding="lg"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {sampleTestimonials.map((testimonial) => (
                        <TestimonialCard
                            key={testimonial.id}
                            testimonial={testimonial}
                        />
                    ))}
                </div>
            </Section>

            {/* Secondary Banner */}
            <Banner
                title="Electronics Sale"
                subtitle="Limited Time Offer"
                description="Up to 40% off on all electronics and gadgets. Don't miss out!"
                buttonText="Shop Electronics"
                buttonLink="/products?category=electronics&sale=true"
                backgroundImage={sampleBanners[1].backgroundImage}
                height="medium"
                textAlign="center"
            />

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
