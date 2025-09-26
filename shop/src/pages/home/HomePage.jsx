import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBagIcon, 
  TruckIcon, 
  ShieldCheckIcon, 
  HeartIcon 
} from '@heroicons/react/24/outline';

const HomePage = () => {
  const features = [
    {
      icon: ShoppingBagIcon,
      title: 'Wide Selection',
      description: 'Browse thousands of products across multiple categories'
    },
    {
      icon: TruckIcon,
      title: 'Fast Shipping',
      description: 'Free shipping on orders over $50 with 2-day delivery'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure Payment',
      description: 'Your payment information is safe and secure'
    },
    {
      icon: HeartIcon,
      title: 'Customer Care',
      description: '24/7 customer support to help with any questions'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to Our Shop
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Discover amazing products at unbeatable prices
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/products" 
                className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
              >
                Shop Now
              </Link>
              <Link 
                to="/about" 
                className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Us?
            </h2>
            <p className="text-lg text-gray-600">
              We're committed to providing the best shopping experience
            </p>
          </div>
          
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
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start Shopping?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of satisfied customers and discover your next favorite product
          </p>
          <Link 
            to="/products" 
            className="btn-primary text-lg px-8 py-3"
          >
            Browse Products
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
