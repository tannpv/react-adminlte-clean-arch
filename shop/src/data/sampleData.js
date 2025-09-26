// Sample data for development and testing

export const sampleProducts = [
    {
        id: 1,
        name: "Premium Wireless Headphones",
        description: "High-quality wireless headphones with noise cancellation",
        price: 199.99,
        originalPrice: 249.99,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
        category: "Electronics",
        rating: 4.5,
        reviewCount: 128,
        isNew: true,
        discount: 20,
        isFeatured: true,
    },
    {
        id: 2,
        name: "Smart Fitness Watch",
        description: "Track your fitness goals with this advanced smartwatch",
        price: 299.99,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
        category: "Electronics",
        rating: 4.8,
        reviewCount: 89,
        isNew: false,
        isFeatured: true,
    },
    {
        id: 3,
        name: "Organic Cotton T-Shirt",
        description: "Comfortable and sustainable cotton t-shirt",
        price: 29.99,
        originalPrice: 39.99,
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
        category: "Clothing",
        rating: 4.2,
        reviewCount: 45,
        isNew: false,
        discount: 25,
        isFeatured: false,
    },
    {
        id: 4,
        name: "Minimalist Backpack",
        description: "Sleek and functional backpack for everyday use",
        price: 79.99,
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
        category: "Accessories",
        rating: 4.6,
        reviewCount: 67,
        isNew: true,
        isFeatured: false,
    },
    {
        id: 5,
        name: "Bluetooth Speaker",
        description: "Portable speaker with excellent sound quality",
        price: 89.99,
        originalPrice: 119.99,
        image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop",
        category: "Electronics",
        rating: 4.4,
        reviewCount: 92,
        isNew: false,
        discount: 25,
        isFeatured: true,
    },
    {
        id: 6,
        name: "Leather Wallet",
        description: "Premium leather wallet with RFID protection",
        price: 49.99,
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
        category: "Accessories",
        rating: 4.7,
        reviewCount: 34,
        isNew: false,
        isFeatured: false,
    },
    {
        id: 7,
        name: "Running Shoes",
        description: "Comfortable running shoes for all terrains",
        price: 129.99,
        originalPrice: 159.99,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
        category: "Shoes",
        rating: 4.3,
        reviewCount: 156,
        isNew: true,
        discount: 19,
        isFeatured: true,
    },
    {
        id: 8,
        name: "Coffee Maker",
        description: "Automatic coffee maker for the perfect brew",
        price: 149.99,
        image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop",
        category: "Home & Kitchen",
        rating: 4.5,
        reviewCount: 78,
        isNew: false,
        isFeatured: false,
    },
];

export const sampleCategories = [
    {
        id: 1,
        name: "Electronics",
        slug: "electronics",
        image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop",
        productCount: 45,
        description: "Latest gadgets and electronic devices",
    },
    {
        id: 2,
        name: "Clothing",
        slug: "clothing",
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
        productCount: 120,
        description: "Fashion and apparel for all occasions",
    },
    {
        id: 3,
        name: "Accessories",
        slug: "accessories",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop",
        productCount: 67,
        description: "Stylish accessories to complete your look",
    },
    {
        id: 4,
        name: "Shoes",
        slug: "shoes",
        image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop",
        productCount: 89,
        description: "Comfortable and stylish footwear",
    },
    {
        id: 5,
        name: "Home & Kitchen",
        slug: "home-kitchen",
        image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
        productCount: 34,
        description: "Everything for your home and kitchen",
    },
    {
        id: 6,
        name: "Sports",
        slug: "sports",
        image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
        productCount: 56,
        description: "Sports equipment and activewear",
    },
];

export const sampleFeatures = [
    {
        icon: "ShoppingBagIcon",
        title: "Wide Selection",
        description: "Browse thousands of products across multiple categories"
    },
    {
        icon: "TruckIcon",
        title: "Fast Shipping",
        description: "Free shipping on orders over $50 with 2-day delivery"
    },
    {
        icon: "ShieldCheckIcon",
        title: "Secure Payment",
        description: "Your payment information is safe and secure"
    },
    {
        icon: "HeartIcon",
        title: "Customer Care",
        description: "24/7 customer support to help with any questions"
    }
];

export const sampleOffers = [
    {
        id: 1,
        title: "Summer Sale",
        subtitle: "Up to 50% Off",
        description: "Get ready for summer with our amazing deals",
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
        badge: "50% OFF",
        price: "$29.99",
        originalPrice: "$59.99",
        buttonText: "Shop Now",
        link: "/products?category=clothing"
    },
    {
        id: 2,
        title: "New Arrivals",
        subtitle: "Latest Collection",
        description: "Discover the newest trends in fashion",
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
        badge: "NEW",
        price: "From $19.99",
        buttonText: "Explore",
        link: "/products?filter=new"
    },
    {
        id: 3,
        title: "Electronics",
        subtitle: "Tech Deals",
        description: "Cutting-edge technology at unbeatable prices",
        image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop",
        badge: "30% OFF",
        price: "From $99.99",
        originalPrice: "$149.99",
        buttonText: "View Deals",
        link: "/products?category=electronics"
    }
];

export const sampleTestimonials = [
    {
        id: 1,
        name: "Sarah Johnson",
        location: "New York, USA",
        rating: 5,
        text: "Amazing quality and fast shipping! I've been shopping here for months and never disappointed.",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
    },
    {
        id: 2,
        name: "Michael Chen",
        location: "Los Angeles, USA",
        rating: 5,
        text: "Great customer service and excellent product selection. Highly recommended!",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
    },
    {
        id: 3,
        name: "Emily Davis",
        location: "Chicago, USA",
        rating: 4,
        text: "Love the variety of products and the competitive prices. Will definitely shop again!",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
    }
];

export const sampleBanners = [
    {
        id: 1,
        title: "New Collection",
        subtitle: "Spring 2024",
        description: "Discover the latest trends in fashion and lifestyle",
        backgroundImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop",
        buttonText: "Shop Collection",
        buttonLink: "/products?collection=spring-2024"
    },
    {
        id: 2,
        title: "Electronics Sale",
        subtitle: "Limited Time",
        description: "Up to 40% off on all electronics and gadgets",
        backgroundImage: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&h=600&fit=crop",
        buttonText: "View Deals",
        buttonLink: "/products?category=electronics&sale=true"
    }
];
