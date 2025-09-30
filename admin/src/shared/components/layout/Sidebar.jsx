import React from 'react';
import { useNavigation } from '../../hooks/useNavigation';
import NavigationItem from '../ui/NavigationItem';
import NavigationToggle from '../ui/NavigationToggle';

/**
 * Enhanced Sidebar Component
 * 
 * Provides a collapsible sidebar with navigation items.
 * Automatically adjusts width and content based on collapse state.
 */
export const Sidebar = ({ currentPage, onPageChange }) => {
    const { isCollapsed, isMobile } = useNavigation();

    const navigationItems = [
        {
            icon: 'fas fa-home',
            label: 'Dashboard',
            page: 'dashboard',
        },
        {
            icon: 'fas fa-users',
            label: 'Users',
            page: 'users',
        },
        {
            icon: 'fas fa-user-tag',
            label: 'Roles',
            page: 'roles',
        },
        {
            icon: 'fas fa-tags',
            label: 'Categories',
            page: 'categories',
        },
        {
            icon: 'fas fa-box',
            label: 'Products',
            page: 'products',
        },
        {
            icon: 'fas fa-sliders-h',
            label: 'Attributes',
            page: 'attributes',
        },
        {
            icon: 'fas fa-list',
            label: 'Attribute Values',
            page: 'attribute-values',
        },
        {
            icon: 'fas fa-layer-group',
            label: 'Attribute Sets',
            page: 'attribute-sets',
        },
        {
            icon: 'fas fa-store',
            label: 'Stores',
            page: 'stores',
        },
        {
            icon: 'fas fa-shopping-cart',
            label: 'Orders',
            page: 'orders',
        },
        {
            icon: 'fas fa-language',
            label: 'Translations',
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
                        <span className="brand-text">Admin Panel</span>
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
                                label={item.label}
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
                            Admin Panel v1.0
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;