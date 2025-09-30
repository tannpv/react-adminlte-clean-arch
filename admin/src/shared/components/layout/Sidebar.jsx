import React from 'react';
import { useNavigation } from '../../hooks/useNavigation';
import { useTranslation } from '../../hooks/useTranslation';
import NavigationItem from '../ui/NavigationItem';
import NavigationToggle from '../ui/NavigationToggle';
import Translation from '../Translation';

/**
 * Enhanced Sidebar Component
 * 
 * Provides a collapsible sidebar with navigation items.
 * Automatically adjusts width and content based on collapse state.
 */
export const Sidebar = ({ currentPage, onPageChange }) => {
    const { isCollapsed, isMobile } = useNavigation();
    const { t } = useTranslation();

    const navigationItems = [
        {
            icon: 'fas fa-home',
            labelKey: 'nav.dashboard',
            fallbackLabel: 'Dashboard',
            page: 'dashboard',
        },
        {
            icon: 'fas fa-users',
            labelKey: 'nav.users',
            fallbackLabel: 'Users',
            page: 'users',
        },
        {
            icon: 'fas fa-user-tag',
            labelKey: 'nav.roles',
            fallbackLabel: 'Roles',
            page: 'roles',
        },
        {
            icon: 'fas fa-tags',
            labelKey: 'nav.categories',
            fallbackLabel: 'Categories',
            page: 'categories',
        },
        {
            icon: 'fas fa-box',
            labelKey: 'nav.products',
            fallbackLabel: 'Products',
            page: 'products',
        },
        {
            icon: 'fas fa-sliders-h',
            labelKey: 'nav.attributes',
            fallbackLabel: 'Attributes',
            page: 'attributes',
        },
        {
            icon: 'fas fa-list',
            labelKey: 'nav.attribute_values',
            fallbackLabel: 'Attribute Values',
            page: 'attribute-values',
        },
        {
            icon: 'fas fa-layer-group',
            labelKey: 'nav.attribute_sets',
            fallbackLabel: 'Attribute Sets',
            page: 'attribute-sets',
        },
        {
            icon: 'fas fa-store',
            labelKey: 'nav.stores',
            fallbackLabel: 'Stores',
            page: 'stores',
        },
        {
            icon: 'fas fa-shopping-cart',
            labelKey: 'nav.orders',
            fallbackLabel: 'Orders',
            page: 'orders',
        },
        {
            icon: 'fas fa-language',
            labelKey: 'nav.translations',
            fallbackLabel: 'Translations',
            page: 'translations',
        },
    ];

    const handleItemClick = (page) => {
        if (onPageChange) {
            onPageChange(page);
        }
    };

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : 'expanded'} ${isMobile ? 'mobile' : ''}`}>
            {/* Sidebar Header */}
            <div className="sidebar-header">
                {!isCollapsed && (
                    <div className="sidebar-brand">
                        <img
                            src="/company-logo.svg"
                            alt="Company Logo"
                            className="w-8 h-8 mr-2 object-contain"
                        />
                        <span className="brand-text">
                            <Translation k="nav.admin_panel" fallback="Admin Panel" />
                        </span>
                    </div>
                )}
                {isCollapsed && (
                    <div className="sidebar-brand-collapsed">
                        <img
                            src="/company-logo.svg"
                            alt="Company Logo"
                            className="w-6 h-6 object-contain"
                        />
                    </div>
                )}
            </div>

            {/* Navigation Toggle */}
            <div className="sidebar-toggle-container">
                <NavigationToggle />
            </div>

            {/* Navigation Menu */}
            <nav className="sidebar-nav">
                <ul className="nav-list">
                    {navigationItems.map((item) => (
                        <li key={item.page} className="nav-list-item">
                            <NavigationItem
                                icon={item.icon}
                                label={item.fallbackLabel}
                                labelKey={item.labelKey}
                                fallbackLabel={item.fallbackLabel}
                                active={currentPage === item.page}
                                onClick={() => handleItemClick(item.page)}
                            />
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Sidebar Footer */}
            <div className="sidebar-footer">
                {!isCollapsed && (
                    <div className="sidebar-footer-content">
                        <div className="text-xs text-gray-500">
                            <Translation k="nav.admin_panel_version" fallback="Admin Panel v1.0" />
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;