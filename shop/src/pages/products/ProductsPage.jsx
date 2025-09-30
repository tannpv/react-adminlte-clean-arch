import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductGrid from '../../components/product/ProductGrid';
import Section from '../../components/ui/Section';
import { sampleProducts } from '../../data/sampleData';

const ProductsPage = () => {
    const [searchParams] = useSearchParams();
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [sortBy, setSortBy] = useState('name');
    const [filterCategory, setFilterCategory] = useState('all');

    // Filter and sort products
    let filteredProducts = [...sampleProducts];

    // Filter by search query
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
        filteredProducts = filteredProducts.filter(product =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    // Filter by category
    if (filterCategory !== 'all') {
        filteredProducts = filteredProducts.filter(product =>
            product.category.toLowerCase() === filterCategory.toLowerCase()
        );
    }

    // Sort products
    filteredProducts.sort((a, b) => {
        switch (sortBy) {
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            case 'rating':
                return (b.rating || 0) - (a.rating || 0);
            case 'newest':
                return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
            default:
                return a.name.localeCompare(b.name);
        }
    });

    const categories = ['all', 'electronics', 'clothing', 'accessories', 'shoes', 'home & kitchen'];

    return (
        <Section
            title={searchQuery ? `Search Results for "${searchQuery}"` : "All Products"}
            subtitle={searchQuery ? `${filteredProducts.length} products found` : "Browse our complete collection"}
            background="white"
            padding="default"
        >
            {/* Filters and Controls */}
            <div className="mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setFilterCategory(category)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterCategory === category
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Sort and View Controls */}
                    <div className="flex items-center gap-4">
                        {/* Sort Dropdown */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="name">Sort by Name</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="rating">Highest Rated</option>
                            <option value="newest">Newest First</option>
                        </select>

                        {/* View Mode Toggle */}
                        <div className="flex border border-gray-300 rounded-lg">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Grid/List */}
            <ProductGrid
                products={filteredProducts}
                columns={4}
                viewMode={viewMode}
                showQuickView={true}
                showWishlist={true}
            />

            {/* Results Summary */}
            <div className="mt-8 text-center text-gray-600">
                Showing {filteredProducts.length} of {sampleProducts.length} products
            </div>
        </Section>
    );
};

export default ProductsPage;
