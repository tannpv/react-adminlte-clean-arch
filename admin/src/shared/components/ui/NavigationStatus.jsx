import React from 'react';
import { useNavigation } from '../../hooks/useNavigation';

/**
 * Navigation Status Indicator
 * 
 * Shows a small visual indicator of the current sidebar state.
 * Useful for users to quickly see if the sidebar is collapsed or expanded.
 */
export const NavigationStatus = () => {
    const { isCollapsed, isMobile } = useNavigation();

    if (isMobile) {
        return null;
    }

    return (
        <div className="navigation-status">
            <div className={`status-indicator ${isCollapsed ? 'collapsed' : 'expanded'}`}>
                <i className={`fas ${isCollapsed ? 'fa-compress' : 'fa-expand'}`} />
            </div>
        </div>
    );
};

export default NavigationStatus;
