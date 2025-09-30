import React, { useEffect, useState } from 'react';
import { useNavigation } from '../../hooks/useNavigation';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * Navigation Item Component
 * 
 * Renders a navigation item with icon and optional text label.
 * Automatically adjusts display based on sidebar collapse state.
 * 
 * @param {Object} props
 * @param {string} props.icon - Font Awesome icon class
 * @param {string} props.label - Text label for the navigation item (fallback)
 * @param {string} props.labelKey - Translation key for the label (optional)
 * @param {string} props.fallbackLabel - Fallback label if translation fails (optional)
 * @param {string} props.href - Link destination (optional)
 * @param {boolean} props.active - Whether this item is currently active
 * @param {function} props.onClick - Click handler (optional)
 * @param {boolean} props.disabled - Whether the item is disabled
 */
export const NavigationItem = ({
    icon,
    label,
    labelKey,
    fallbackLabel,
    href,
    active = false,
    onClick,
    disabled = false
}) => {
    const { isCollapsed } = useNavigation();
    const { t } = useTranslation();
    const [translatedLabel, setTranslatedLabel] = useState(fallbackLabel || label);

    // Load translation when component mounts or labelKey changes
    useEffect(() => {
        const loadTranslation = async () => {
            if (labelKey) {
                try {
                    const translation = await t(labelKey);
                    setTranslatedLabel(translation);
                } catch (error) {
                    // Fallback to fallbackLabel or original label
                    setTranslatedLabel(fallbackLabel || label);
                }
            } else {
                setTranslatedLabel(fallbackLabel || label);
            }
        };

        loadTranslation();
    }, [labelKey, fallbackLabel, label, t]);

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
            <span className="nav-item-label">{translatedLabel}</span>
        </>
    );

    // If href is provided, render as link
    if (href && !disabled) {
        return (
            <a
                href={href}
                className={itemClasses}
                onClick={handleClick}
                title={isCollapsed ? translatedLabel : ''}
                aria-label={translatedLabel}
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
            title={isCollapsed ? translatedLabel : ''}
            aria-label={translatedLabel}
        >
            {content}
        </button>
    );
};

export default NavigationItem;
