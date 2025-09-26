import React, { useEffect } from 'react';
import { useNavigation } from '../../hooks/useNavigation';

/**
 * Navigation Toggle Button Component
 * 
 * Provides a prominent button to toggle between expanded and collapsed sidebar states.
 * Shows different icons and tooltips based on current state.
 * Includes keyboard shortcut support (Ctrl/Cmd + B).
 */
export const NavigationToggle = ({ variant = 'sidebar' }) => {
    const { isCollapsed, toggleCollapse, isMobile } = useNavigation();

    // Add keyboard shortcut (Ctrl/Cmd + B)
    useEffect(() => {
        const handleKeyDown = (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
                event.preventDefault();
                toggleCollapse();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [toggleCollapse]);

    const getToggleClasses = () => {
        if (variant === 'header') {
            return `
                nav-toggle-header
                inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700
                bg-white border border-gray-300 rounded-lg shadow-sm
                hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                transition-all duration-200
            `;
        }

        return `
            nav-toggle
            p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        `;
    };

    const getIconClasses = () => {
        if (variant === 'header') {
            return `fas ${isCollapsed ? 'fa-bars' : 'fa-times'} mr-2`;
        }
        return `fas ${isCollapsed ? 'fa-bars' : 'fa-times'}`;
    };

    const getLabel = () => {
        if (variant === 'header') {
            return isCollapsed ? 'Expand Menu' : 'Collapse Menu';
        }
        return '';
    };

    return (
        <button
            onClick={toggleCollapse}
            className={getToggleClasses()}
            title={`${isCollapsed ? 'Expand menu' : 'Collapse menu'} (Ctrl+B)`}
            aria-label={isCollapsed ? 'Expand navigation menu' : 'Collapse navigation menu'}
        >
            <i className={getIconClasses()} />
            {getLabel()}
        </button>
    );
};

export default NavigationToggle;
