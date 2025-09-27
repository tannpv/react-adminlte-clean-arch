// Animation utilities and configurations

import { useAnimation } from 'framer-motion';
import { useEffect } from 'react';

// Fade in animation variants
export const fadeInVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: "easeOut"
        }
    }
};

// Slide in from left animation
export const slideInLeftVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.6,
            ease: "easeOut"
        }
    }
};

// Slide in from right animation
export const slideInRightVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.6,
            ease: "easeOut"
        }
    }
};

// Scale up animation
export const scaleUpVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.5,
            ease: "easeOut"
        }
    }
};

// Stagger animation for lists
export const staggerContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

// Stagger item animation
export const staggerItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: "easeOut"
        }
    }
};

// Hover animation variants
export const hoverVariants = {
    hover: {
        scale: 1.05,
        transition: {
            duration: 0.2,
            ease: "easeInOut"
        }
    },
    tap: {
        scale: 0.95,
        transition: {
            duration: 0.1
        }
    }
};

// Button hover animation
export const buttonHoverVariants = {
    hover: {
        scale: 1.02,
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        transition: {
            duration: 0.2,
            ease: "easeInOut"
        }
    },
    tap: {
        scale: 0.98,
        transition: {
            duration: 0.1
        }
    }
};

// Card hover animation
export const cardHoverVariants = {
    hover: {
        y: -5,
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        transition: {
            duration: 0.3,
            ease: "easeInOut"
        }
    }
};

// Slideshow transition variants
export const slideVariants = {
    enter: (direction) => ({
        x: direction > 0 ? 1000 : -1000,
        opacity: 0
    }),
    center: {
        zIndex: 1,
        x: 0,
        opacity: 1
    },
    exit: (direction) => ({
        zIndex: 0,
        x: direction < 0 ? 1000 : -1000,
        opacity: 0
    })
};

// Countdown timer animation
export const countdownVariants = {
    initial: { scale: 1 },
    animate: {
        scale: [1, 1.1, 1],
        transition: {
            duration: 0.3,
            ease: "easeInOut"
        }
    }
};

// Loading spinner animation
export const spinnerVariants = {
    animate: {
        rotate: 360,
        transition: {
            duration: 1,
            repeat: Infinity,
            ease: "linear"
        }
    }
};

// Pulse animation for loading states
export const pulseVariants = {
    animate: {
        opacity: [0.5, 1, 0.5],
        transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
};

// Bounce animation for notifications
export const bounceVariants = {
    initial: { y: -100, opacity: 0 },
    animate: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 20
        }
    },
    exit: {
        y: -100,
        opacity: 0,
        transition: {
            duration: 0.3
        }
    }
};

// Page transition variants
export const pageVariants = {
    initial: { opacity: 0, x: -20 },
    in: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.4,
            ease: "easeOut"
        }
    },
    out: {
        opacity: 0,
        x: 20,
        transition: {
            duration: 0.3,
            ease: "easeIn"
        }
    }
};

// Intersection observer animation
export const useIntersectionAnimation = (threshold = 0.1) => {
    return {
        initial: "hidden",
        whileInView: "visible",
        viewport: { once: true, amount: threshold },
        variants: fadeInVariants
    };
};

// Custom animation hooks
export const useAnimationOnScroll = () => {
    const controls = useAnimation();

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;

            // Trigger animation when element is 50% visible
            if (scrollY > windowHeight * 0.5) {
                controls.start("visible");
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [controls]);

    return controls;
};

// Animation presets for common use cases
export const animationPresets = {
    fadeIn: fadeInVariants,
    slideInLeft: slideInLeftVariants,
    slideInRight: slideInRightVariants,
    scaleUp: scaleUpVariants,
    stagger: {
        container: staggerContainerVariants,
        item: staggerItemVariants
    },
    hover: hoverVariants,
    button: buttonHoverVariants,
    card: cardHoverVariants,
    slide: slideVariants,
    countdown: countdownVariants,
    spinner: spinnerVariants,
    pulse: pulseVariants,
    bounce: bounceVariants,
    page: pageVariants
};
