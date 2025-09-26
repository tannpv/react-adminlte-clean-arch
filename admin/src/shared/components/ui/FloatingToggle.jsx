import React from 'react';
import { useNavigation } from '../../hooks/useNavigation';

/**
 * Floating Navigation Toggle Button
 * 
 * A floating action button that provides quick access to toggle the sidebar.
 * Positioned fixed on the screen for easy access from anywhere.
 */
export const FloatingToggle = () => {
    const { isCollapsed, toggleCollapse, isMobile } = useNavigation();

    // Don't show on mobile as it might interfere with mobile navigation
    if (isMobile) {
        return null;
    }

    return (
        <button
            onClick={toggleCollapse}
            className="floating-toggle"
            title={`${isCollapsed ? 'Expand menu' : 'Collapse menu'} (Ctrl+B)`}
            aria-label={isCollapsed ? 'Expand navigation menu' : 'Collapse navigation menu'}
        >
            <i className={`fas ${isCollapsed ? 'fa-bars' : 'fa-times'}`} />
        </button>
    );
};

export default FloatingToggle;
