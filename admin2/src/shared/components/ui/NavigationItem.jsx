import React from 'react';
import { useNavigation } from '../../hooks/useNavigation';

/**
 * Navigation Item Component
 * 
 * Renders a navigation item with icon and optional text label.
 * Automatically adjusts display based on sidebar collapse state.
 * 
 * @param {Object} props
 * @param {string} props.icon - Font Awesome icon class
 * @param {string} props.label - Text label for the navigation item
 * @param {string} props.href - Link destination (optional)
 * @param {boolean} props.active - Whether this item is currently active
 * @param {function} props.onClick - Click handler (optional)
 * @param {boolean} props.disabled - Whether the item is disabled
 */
export const NavigationItem = ({
    icon,
    label,
    href,
    active = false,
    onClick,
    disabled = false
}) => {
    const { isCollapsed } = useNavigation();

    // Debug logging to help identify width issues
    React.useEffect(() => {
        if (active) {
            console.log(`Active navigation item: ${label}, isCollapsed: ${isCollapsed}`);
        }
    }, [active, label, isCollapsed]);

    const handleClick = (e) => {
        if (disabled) {
            e.preventDefault();
            return;
        }

        if (onClick) {
            onClick(e);
        }
    };

    const itemClasses = `
        nav-item
        ${active ? 'active' : ''}
        ${disabled ? 'disabled' : ''}
        ${isCollapsed ? 'collapsed' : 'expanded'}
    `.trim();

    const content = (
        <>
            <i className={`${icon} nav-item-icon`} />
            <span className="nav-item-label">{label}</span>
        </>
    );

    // If href is provided, render as link
    if (href && !disabled) {
        return (
            <a
                href={href}
                className={itemClasses}
                onClick={handleClick}
                title={isCollapsed ? label : ''}
                aria-label={label}
            >
                {content}
            </a>
        );
    }

    // Otherwise render as button
    return (
        <button
            className={itemClasses}
            onClick={handleClick}
            disabled={disabled}
            title={isCollapsed ? label : ''}
            aria-label={label}
        >
            {content}
        </button>
    );
};

export default NavigationItem;
