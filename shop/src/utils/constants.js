// Constants for the shop application

export const SLIDESHOW_CONFIG = {
    autoPlayDelay: 5000, // 5 seconds
    transitionDuration: 600, // 0.6 seconds
    totalSlides: 3
};

export const COUNTDOWN_CONFIG = {
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    updateInterval: 1000 // 1 second
};

export const SOCIAL_MEDIA_LINKS = {
    facebook: '#',
    vimeo: '#',
    pinterest: '#',
    linkedin: '#',
    googlePlus: '#'
};

export const CONTACT_INFO = {
    address: {
        title: 'Address',
        content: '123 E-commerce St, Suite 100\nCity, State 12345',
        icon: 'location'
    },
    phone: {
        title: 'Call us',
        content: '(123) 456-7890',
        icon: 'phone'
    },
    email: {
        title: 'Or send email',
        content: 'info@shop.com',
        icon: 'email'
    }
};

export const SERVICE_GUARANTEES = [
    {
        icon: 'truck',
        title: 'Free shipping & return',
        description: 'Free shipping on orders over $50'
    },
    {
        icon: 'shield',
        title: 'Secure payment',
        description: '100% secure payment processing'
    },
    {
        icon: 'support',
        title: '24/7 support',
        description: 'Round-the-clock customer support'
    }
];

export const CATEGORIES = [
    {
        name: 'Kitchenware',
        icon: 'kitchen',
        subcategories: ['Cookware', 'Utensils', 'Appliances', 'Storage']
    },
    {
        name: 'Home Decor',
        icon: 'home',
        subcategories: ['Wall Art', 'Lighting', 'Textiles', 'Accessories']
    },
    {
        name: 'Textiles',
        icon: 'textile',
        subcategories: ['Bedding', 'Curtains', 'Towels', 'Rugs']
    },
    {
        name: 'Accessories',
        icon: 'accessories',
        subcategories: ['Jewelry', 'Bags', 'Watches', 'Sunglasses']
    },
    {
        name: 'Seasonal',
        icon: 'seasonal',
        subcategories: ['Holiday', 'Summer', 'Winter', 'Spring']
    }
];

export const SLIDESHOW_DATA = [
    {
        id: 1,
        title: 'Handcrafted Kitchen Tools',
        subtitle: 'Premium Quality',
        description: 'Discover our collection of artisan-made kitchen essentials',
        buttonText: 'Shop Now',
        backgroundImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
        textColor: 'text-white',
        buttonColor: 'bg-yellow-500 hover:bg-yellow-600'
    },
    {
        id: 2,
        title: 'Handmade Jewelry',
        subtitle: 'Unique Designs',
        description: 'Exquisite pieces crafted with love and attention to detail',
        buttonText: 'Explore Collection',
        backgroundImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
        textColor: 'text-white',
        buttonColor: 'bg-yellow-500 hover:bg-yellow-600'
    },
    {
        id: 3,
        title: 'Home Decor',
        subtitle: 'Stylish Living',
        description: 'Transform your space with our curated home decor collection',
        buttonText: 'View Collection',
        backgroundImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
        textColor: 'text-white',
        buttonColor: 'bg-yellow-500 hover:bg-yellow-600'
    }
];

export const NEWSLETTER_CONFIG = {
    title: 'Join our newsletter',
    subtitle: 'Get 10% off',
    description: 'Subscribe to get updates on new products and exclusive offers',
    placeholder: 'Enter your email address',
    buttonText: 'Subscribe'
};
