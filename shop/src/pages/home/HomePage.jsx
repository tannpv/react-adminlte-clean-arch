import {
    ClockIcon,
    CurrencyDollarIcon,
    EnvelopeIcon,
    HeartIcon,
    MagnifyingGlassIcon,
    MapPinIcon,
    PhoneIcon,
    ShoppingCartIcon,
    TruckIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Top Bar */}
            <div className="bg-gray-100 text-sm py-2">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-600">E: Aresthemis@gmail.com</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <select className="bg-transparent text-gray-600 border-none text-sm">
                                <option>+ Eng</option>
                            </select>
                            <select className="bg-transparent text-gray-600 border-none text-sm">
                                <option>Usd</option>
                            </select>
                            <Link to="/account" className="text-gray-600 hover:text-gray-800">My account</Link>
                            <Link to="/wishlist" className="text-gray-600 hover:text-gray-800">Wish List (3)</Link>
                            <Link to="/cart" className="text-gray-600 hover:text-gray-800">Shopping Cart</Link>
                            <Link to="/checkout" className="text-gray-600 hover:text-gray-800">Checkout</Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-4">
                        {/* Logo */}
                        <div className="flex items-center">
                            <div className="text-2xl font-bold text-gray-900">
                                <div className="text-sm text-gray-600">Aresthemis</div>
                                <div>HAND MADE</div>
                            </div>
                        </div>

                        {/* Center Info */}
                        <div className="hidden lg:flex items-center space-x-8">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <ClockIcon className="h-5 w-5" />
                                <div>
                                    <div>Mon - Sat 9h30 - 21h</div>
                                    <div>Sunday CLOSED</div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <PhoneIcon className="h-5 w-5" />
                                <div>
                                    <div>Have a Questions</div>
                                    <div className="font-semibold">800 070 599 Call us</div>
                                </div>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="flex-1 max-w-md mx-8">
                            <form onSubmit={handleSearch} className="relative">
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            </form>
                        </div>

                        {/* Right Icons */}
                        <div className="flex items-center space-x-4">
                            <Link to="/account" className="p-2 text-gray-600 hover:text-gray-800">
                                <UserIcon className="h-6 w-6" />
                            </Link>
                            <Link to="/wishlist" className="p-2 text-gray-600 hover:text-gray-800">
                                <HeartIcon className="h-6 w-6" />
                            </Link>
                            <Link to="/cart" className="p-2 text-gray-600 hover:text-gray-800">
                                <ShoppingCartIcon className="h-6 w-6" />
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Navigation */}
            <nav className="bg-gray-50 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-3">
                        {/* Categories Button */}
                        <div className="flex items-center space-x-4">
                            <button className="flex items-center space-x-2 bg-gray-200 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-300">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                                <span>Categories</span>
                            </button>
                        </div>

                        {/* Main Navigation */}
                        <div className="hidden md:flex items-center space-x-8">
                            <Link to="/" className="text-gray-700 hover:text-primary-600 font-medium">Home</Link>
                            <Link to="/jewellery" className="text-gray-700 hover:text-primary-600 font-medium">Jewellery</Link>
                            <Link to="/clothing" className="text-gray-700 hover:text-primary-600 font-medium">Clothing & Accessories</Link>
                            <Link to="/celebrations" className="text-gray-700 hover:text-primary-600 font-medium">Celebrations</Link>
                            <Link to="/vintage" className="text-gray-700 hover:text-primary-600 font-medium">Vintage</Link>
                            <Link to="/sale" className="text-red-600 hover:text-red-700 font-medium">Sale</Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Banner */}
            <section className="bg-neutral-50 py-20 border-b border-neutral-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                        {/* Left Info */}
                        <div className="text-center lg:text-left">
                            <div className="text-sm text-gray-600 mb-2 font-body">Street Victoria 8007 Australia</div>
                            <div className="text-sm text-gray-600 font-body">10:30</div>
                        </div>

                        {/* Center Content */}
                        <div className="text-center">
                            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 font-heading leading-tight">
                                WOODEN KITCHEN TOOLS
                            </h1>
                            <div className="text-2xl text-accent-600 font-semibold mb-2 font-body">Extra 35% off</div>
                            <div className="text-lg text-gray-600 mb-4 font-body">
                                <div>10% Cake Molds</div>
                                <div>25% Chopping Boards</div>
                            </div>
                            <button className="bg-primary-600 text-white px-10 py-4 rounded-lg hover:bg-primary-700 transition-colors font-semibold text-lg">
                                View more
                            </button>
                        </div>

                        {/* Right Info */}
                        <div className="text-center lg:text-right">
                            <div className="text-sm text-gray-600 font-body">September 05</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Promotional Banners */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Teapot Set */}
                        <div className="bg-neutral-50 p-10 rounded-lg text-center border border-neutral-200 hover:shadow-lg transition-shadow">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2 font-heading">TEAPOT SET</h3>
                            <div className="text-xl text-accent-600 font-semibold mb-2 font-body">30% off</div>
                            <div className="text-gray-600 mb-4 font-body">For all teapot set</div>
                            <button className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                                View more
                            </button>
                        </div>

                        {/* Women's Slippers */}
                        <div className="bg-primary-50 p-10 rounded-lg text-center border border-primary-200 hover:shadow-lg transition-shadow">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2 font-heading">WOMEN'S SLIPPERS</h3>
                            <div className="text-xl text-accent-600 font-semibold mb-2 font-body">25% off</div>
                            <div className="text-gray-600 mb-4 font-body">For all women's slippers</div>
                            <button className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                                View more
                            </button>
                        </div>

                        {/* Baby */}
                        <div className="bg-accent-50 p-10 rounded-lg text-center border border-accent-200 hover:shadow-lg transition-shadow">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2 font-heading">BABY</h3>
                            <div className="text-xl text-accent-600 font-semibold mb-2 font-body">10% off</div>
                            <div className="text-gray-600 mb-4 font-body">For all baby clothing</div>
                            <button className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                                View more
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Today's Deal & New Arrivals */}
            <section className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-stretch">
                        {/* Today's Deal - Left Side (30%) */}
                        <div className="lg:col-span-3 flex flex-col h-full">
                            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm h-full flex flex-col">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-4xl font-bold text-gray-900 font-heading">Today deal</h2>
                                    <div className="flex space-x-2">
                                        <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Countdown Timer */}
                                <div className="flex justify-start space-x-3 mb-6">
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-center">
                                        <div className="text-3xl font-bold text-primary-600 mb-1">136</div>
                                        <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Days</div>
                                    </div>
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-center">
                                        <div className="text-3xl font-bold text-primary-600 mb-1">24</div>
                                        <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Hours</div>
                                    </div>
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-center">
                                        <div className="text-3xl font-bold text-primary-600 mb-1">40</div>
                                        <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Mins</div>
                                    </div>
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-center">
                                        <div className="text-3xl font-bold text-primary-600 mb-1">01</div>
                                        <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Secs</div>
                                    </div>
                                </div>

                                {/* Deal Product */}
                                <div className="flex-1 flex flex-col justify-center">
                                    <div className="w-full">
                                        <div className="relative mb-4">
                                            <div className="w-full h-48 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-lg flex items-center justify-center relative overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-br from-primary-50/20 to-accent-50/20"></div>
                                                <div className="relative z-10 text-center">
                                                    <div className="w-16 h-16 bg-primary-200 rounded-full mx-auto mb-2 flex items-center justify-center">
                                                        <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                    <span className="text-sm text-neutral-600 font-medium">Product Image</span>
                                                </div>
                                            </div>
                                            <div className="absolute top-2 right-2 bg-accent-600 text-white px-2 py-1 rounded text-sm">
                                                -35%
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <h3 className="font-semibold text-gray-900">Bear Cream Large</h3>
                                            <p className="text-sm text-gray-600">by June</p>
                                            <div className="flex items-center justify-center space-x-2 mt-2">
                                                <span className="text-lg font-bold text-gray-900">$150.8</span>
                                                <span className="text-sm text-gray-500 line-through">$200.8</span>
                                            </div>
                                            <div className="flex justify-center space-x-2 mt-4">
                                                <button className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                                                    <ShoppingCartIcon className="h-5 w-5" />
                                                </button>
                                                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </button>
                                                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                                    <HeartIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* New Arrivals - Right Side (70%) */}
                            <div className="lg:col-span-7 flex flex-col h-full">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-4xl font-bold text-gray-900 font-heading">New Arrivals</h2>
                                    <div className="flex space-x-2">
                                        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm">All item</button>
                                        <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Jewellery</button>
                                        <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Clothing & Accessories</button>
                                        <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Celebrations</button>
                                    </div>
                                </div>

                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {/* Product Cards */}
                                    {[
                                        { name: "Beach Towel", author: "Henne Elyse", price: "$150.79", badge: "New" },
                                        { name: "Elodie Unicorn Teapot Set", author: "Monotik", price: "$40.80" },
                                        { name: "Square Form Field Flowers", author: "Faneti Arra", price: "$120.6" },
                                        { name: "Mini Pouch", author: "Rose Rise", price: "$90.6", originalPrice: "$100.6", badge: "-10%" },
                                        { name: "Cotton Slippers", author: "Kate Sung", price: "$120.5" },
                                        { name: "Chopsticks", author: "Ely Lusto", price: "$10.20", badge: "New" }
                                    ].map((product, index) => (
                                        <div key={index} className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="relative mb-6">
                                                <div className="w-full h-64 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-lg flex items-center justify-center relative overflow-hidden">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-primary-50/20 to-accent-50/20"></div>
                                                    <div className="relative z-10 text-center">
                                                        <div className="w-16 h-16 bg-primary-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                                                            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                        <span className="text-sm text-neutral-600 font-medium">Product</span>
                                                    </div>
                                                </div>
                                                {product.badge && (
                                                    <div className={`absolute top-2 right-2 px-2 py-1 rounded text-sm ${product.badge === 'New' ? 'bg-primary-600 text-white' : 'bg-accent-600 text-white'
                                                        }`}>
                                                        {product.badge}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-center">
                                                <h3 className="text-lg font-semibold text-gray-900 font-body mb-2">{product.name}</h3>
                                                <p className="text-base text-gray-600 font-body mb-3">by {product.author}</p>
                                                <div className="flex items-center justify-center space-x-2 mt-3">
                                                    <span className="text-xl font-bold text-gray-900">{product.price}</span>
                                                    {product.originalPrice && (
                                                        <span className="text-base text-gray-500 line-through">{product.originalPrice}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
            </section>

            {/* Kitchenware Banner */}
            <section className="bg-primary-50 py-20 border-b border-primary-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-5xl font-bold text-gray-900 mb-6 font-heading">KITCHENWARE</h2>
                    <div className="text-2xl text-accent-600 font-semibold mb-4 font-body">10% Off</div>
                    <div className="text-lg text-gray-600 mb-6 font-body">
                        <div>25% Oven gloves</div>
                        <div>40% Wooden spoon</div>
                    </div>
                    <button className="bg-primary-600 text-white px-10 py-4 rounded-lg hover:bg-primary-700 transition-colors font-semibold text-lg">
                        View more
                    </button>
                </div>
            </section>

            {/* Most Famous */}
            <section className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-4xl font-bold text-gray-900 font-heading">Most famous</h2>
                        <div className="flex space-x-2">
                            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm">All Item</button>
                            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Sale</button>
                            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Clothing</button>
                            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Jewellery</button>
                            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Accessories</button>
                            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Vintage</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { name: "Cord Necklace Conch Shells", author: "Ema Hossen", price: "$120.70" },
                            { name: "Hairband Unicorn Horn", author: "Susy Land", price: "$15.5", badge: "New" },
                            { name: "Wool Cap For Children", author: "Alex Drame", price: "$150.8", originalPrice: "$200.8", badge: "-25%" },
                            { name: "Hairband With Flowers", author: "Daisy Moon", price: "$13.90" }
                        ].map((product, index) => (
                            <div key={index} className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="relative mb-4">
                                    <div className="w-full h-48 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-lg flex items-center justify-center relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/20 to-accent-50/20"></div>
                                        <div className="relative z-10 text-center">
                                            <div className="w-12 h-12 bg-primary-200 rounded-full mx-auto mb-2 flex items-center justify-center">
                                                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <span className="text-xs text-neutral-600 font-medium">Product</span>
                                        </div>
                                    </div>
                                    {product.badge && (
                                        <div className={`absolute top-2 right-2 px-2 py-1 rounded text-sm ${product.badge === 'New' ? 'bg-primary-600 text-white' : 'bg-accent-600 text-white'
                                            }`}>
                                            {product.badge}
                                        </div>
                                    )}
                                </div>
                                <div className="text-center">
                                    <h3 className="font-semibold text-gray-900 font-body">{product.name}</h3>
                                    <p className="text-sm text-gray-600 font-body">by {product.author}</p>
                                    <div className="flex items-center justify-center space-x-2 mt-2">
                                        <span className="text-lg font-bold text-gray-900">{product.price}</span>
                                        {product.originalPrice && (
                                            <span className="text-sm text-gray-500 line-through">{product.originalPrice}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Service Guarantees */}
            <section className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div className="p-6 rounded-lg border border-neutral-200 hover:shadow-md transition-shadow">
                            <div className="w-16 h-16 bg-primary-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                                <TruckIcon className="h-8 w-8 text-primary-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 font-body">Free Shipping & Returns</h3>
                            <p className="text-sm text-gray-600 font-body">Free shipping on orders over $50</p>
                        </div>
                        <div className="p-6 rounded-lg border border-neutral-200 hover:shadow-md transition-shadow">
                            <div className="w-16 h-16 bg-accent-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                                <CurrencyDollarIcon className="h-8 w-8 text-accent-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 font-body">100% Money refund</h3>
                            <p className="text-sm text-gray-600 font-body">30-day money back guarantee</p>
                        </div>
                        <div className="p-6 rounded-lg border border-neutral-200 hover:shadow-md transition-shadow">
                            <div className="w-16 h-16 bg-secondary-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                                <ClockIcon className="h-8 w-8 text-secondary-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 font-body">Fast send and delivery</h3>
                            <p className="text-sm text-gray-600 font-body">Same day processing available</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Newsletter */}
            <section className="bg-secondary-50 py-16 border-b border-secondary-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="bg-white p-8 rounded-lg shadow-sm border border-secondary-200">
                        <div className="w-16 h-16 bg-primary-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4 font-heading">Join Our Newsletter</h2>
                        <p className="text-lg text-gray-600 mb-8 font-body">
                            Stay updated with our latest products, offers, and handcrafted collections.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-body"
                            />
                            <button className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Information */}
            <section className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center p-6 rounded-lg border border-neutral-200 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-primary-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                                <MapPinIcon className="h-6 w-6 text-primary-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2 font-body">Address</h3>
                            <p className="text-gray-700 font-body text-sm">Street Victoria 8007 Australia</p>
                        </div>
                        <div className="text-center p-6 rounded-lg border border-neutral-200 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-accent-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                                <PhoneIcon className="h-6 w-6 text-accent-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2 font-body">Phone</h3>
                            <p className="text-gray-700 font-body text-sm">Call us 800 070 609 80</p>
                        </div>
                        <div className="text-center p-6 rounded-lg border border-neutral-200 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-secondary-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                                <EnvelopeIcon className="h-6 w-6 text-secondary-600" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2 font-body">Email</h3>
                            <p className="text-gray-700 font-body text-sm">Aresthemis@gmail.com</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Live Chat */}
            <section className="bg-accent-50 py-16 border-b border-accent-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="bg-white p-10 rounded-lg shadow-lg border border-accent-200">
                        <div className="w-20 h-20 bg-accent-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                            <svg className="w-10 h-10 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2 font-heading">Can't wait</h3>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4 font-heading">Use live chat</h2>
                        <p className="text-gray-600 mb-6 font-body">Get instant help from our support team</p>
                        <button className="bg-primary-600 text-white px-10 py-4 rounded-lg hover:bg-primary-700 transition-colors font-semibold text-lg">
                            Start chat
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 font-body">About</h3>
                            <ul className="space-y-2 text-gray-600">
                                <li><Link to="/news" className="hover:text-primary-600">News & Stories</Link></li>
                                <li><Link to="/history" className="hover:text-primary-600">History</Link></li>
                                <li><Link to="/studio" className="hover:text-primary-600">Our Studio</Link></li>
                                <li><Link to="/shop" className="hover:text-primary-600">Shop</Link></li>
                                <li><Link to="/stockists" className="hover:text-primary-600">Stockists</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 font-body">Customer services</h3>
                            <ul className="space-y-2 text-gray-600">
                                <li><Link to="/contact" className="hover:text-primary-600">Contact Us</Link></li>
                                <li><Link to="/trade" className="hover:text-primary-600">Trade Services</Link></li>
                                <li><Link to="/login" className="hover:text-primary-600">Login/Register</Link></li>
                                <li><Link to="/delivery" className="hover:text-primary-600">Delivery & Returns</Link></li>
                                <li><Link to="/faq" className="hover:text-primary-600">FAQs</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 font-body">New arrivals</h3>
                            <ul className="space-y-2 text-gray-600">
                                <li><Link to="/all-items" className="hover:text-primary-600">All item</Link></li>
                                <li><Link to="/jewellery" className="hover:text-primary-600">Jewellery</Link></li>
                                <li><Link to="/clothing" className="hover:text-primary-600">Clothing & Accessories</Link></li>
                                <li><Link to="/celebrations" className="hover:text-primary-600">Celebrations</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 font-body">Accessories</h3>
                            <ul className="space-y-2 text-gray-600">
                                <li><Link to="/jewellery" className="hover:text-primary-600">Jewellery</Link></li>
                                <li><Link to="/beachwear" className="hover:text-primary-600">Beachwear</Link></li>
                                <li><Link to="/hats" className="hover:text-primary-600">Hats / Headbands</Link></li>
                                <li><Link to="/eyewear" className="hover:text-primary-600">Eyewear</Link></li>
                                <li><Link to="/scarves" className="hover:text-primary-600">Scarves</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 mt-8 pt-8">
                        <div className="flex flex-col md:flex-row justify-between items-center">
                            <p className="text-gray-600 text-sm font-body">
                                Copyright © 2018 By Peel Creative All Rights Reserved.
                            </p>
                            <div className="flex space-x-4 mt-4 md:mt-0">
                                <a href="#" className="text-gray-400 hover:text-gray-600">
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-400 hover:text-gray-600">
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-400 hover:text-gray-600">
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z" />
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-400 hover:text-gray-600">
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;