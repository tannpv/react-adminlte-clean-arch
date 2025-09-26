// Image path utilities for the Aresthemis Hand Made shop
// Update these paths once you extract images from your PSD

export const imagePaths = {
    // Hero section images
    hero: {
        woodenKitchenTools: '/images/hero/wooden-kitchen-tools.jpg',
        background: '/images/hero/hero-background.jpg',
    },

    // Product images
    products: {
        // Today's Deal
        bearCreamLarge: '/images/products/bear-cream-large.jpg',

        // New Arrivals
        beachTowel: '/images/products/beach-towel.jpg',
        elodieUnicornTeapot: '/images/products/elodie-unicorn-teapot.jpg',
        squareFormFieldFlowers: '/images/products/square-form-field-flowers.jpg',
        miniPouch: '/images/products/mini-pouch.jpg',
        cottonSlippers: '/images/products/cotton-slippers.jpg',
        chopsticks: '/images/products/chopsticks.jpg',

        // Most Famous
        cordNecklaceConchShells: '/images/products/cord-necklace-conch-shells.jpg',
        hairbandUnicornHorn: '/images/products/hairband-unicorn-horn.jpg',
        woolCapForChildren: '/images/products/wool-cap-for-children.jpg',
        hairbandWithFlowers: '/images/products/hairband-with-flowers.jpg',
    },

    // Promotional banners
    banners: {
        teapotSet: '/images/banners/teapot-set-banner.jpg',
        womensSlippers: '/images/banners/womens-slippers-banner.jpg',
        baby: '/images/banners/baby-banner.jpg',
        kitchenware: '/images/banners/kitchenware-banner.jpg',
    },

    // Icons and graphics
    icons: {
        logo: '/images/icons/company-logo.svg',
        favicon: '/images/icons/favicon.svg',
    },

    // Placeholder function for missing images
    placeholder: (category = 'product') => {
        return `/images/placeholders/${category}-placeholder.jpg`;
    }
};

// Helper function to get image path with fallback
export const getImagePath = (path, fallbackCategory = 'product') => {
    if (!path) return imagePaths.placeholder(fallbackCategory);
    return path;
};

// Helper function to check if image exists (for future use)
export const imageExists = async (path) => {
    try {
        const response = await fetch(path, { method: 'HEAD' });
        return response.ok;
    } catch {
        return false;
    }
};
