import React, { createContext, useContext, useEffect, useState } from 'react';

// Create the Navigation Context
const NavigationContext = createContext({
    isCollapsed: false,
    toggleCollapse: () => { },
    setCollapsed: () => { },
    isMobile: false,
});

// Navigation Provider Component
export const NavigationProvider = ({ children }) => {
    // State for sidebar collapse/expand
    const [isCollapsed, setIsCollapsed] = useState(false);

    // State for mobile detection
    const [isMobile, setIsMobile] = useState(false);

    // Load saved preference from localStorage on mount
    useEffect(() => {
        const savedPreference = localStorage.getItem('sidebar-collapsed');
        if (savedPreference !== null) {
            setIsCollapsed(JSON.parse(savedPreference));
        }
    }, []);

    // Handle window resize for mobile detection
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);

            // Auto-collapse on mobile
            if (mobile) {
                setIsCollapsed(true);
            }
        };

        // Initial check
        handleResize();

        // Add event listener
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Save preference to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
    }, [isCollapsed]);

    // Toggle collapse state
    const toggleCollapse = () => {
        setIsCollapsed(prev => !prev);
    };

    // Set collapse state directly
    const setCollapsed = (collapsed) => {
        setIsCollapsed(collapsed);
    };

    // Context value
    const value = {
        isCollapsed,
        toggleCollapse,
        setCollapsed,
        isMobile,
    };

    return (
        <NavigationContext.Provider value={value}>
            {children}
        </NavigationContext.Provider>
    );
};

// Custom hook to use navigation context
export const useNavigation = () => {
    const context = useContext(NavigationContext);

    if (!context) {
        throw new Error('useNavigation must be used within a NavigationProvider');
    }

    return context;
};

export default NavigationContext;
