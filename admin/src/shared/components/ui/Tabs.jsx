import React, { useState } from 'react';

const Tabs = ({ children, defaultTab = 0, className = '' }) => {
    const [activeTab, setActiveTab] = useState(defaultTab);

    const tabs = React.Children.toArray(children).filter(child => child.type === Tab);
    const activeTabContent = tabs[activeTab]?.props.children;

    return (
        <div className={`tabs-container ${className}`}>
            {/* Tab Navigation */}
            <div className="tabs-nav bg-white border-b border-gray-200 rounded-t-xl">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                    {tabs.map((tab, index) => {
                        const isActive = index === activeTab;
                        const hasError = tab.props.hasError;
                        return (
                            <button
                                key={index}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveTab(index);
                                }}
                                className={`tab-button py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${isActive
                                    ? hasError
                                        ? 'border-red-500 text-red-600 bg-red-50'
                                        : 'border-indigo-500 text-indigo-600'
                                    : hasError
                                        ? 'border-transparent text-red-500 hover:text-red-700 hover:border-red-300 bg-red-25'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                aria-selected={isActive}
                                role="tab"
                            >
                                <div className="flex items-center">
                                    {tab.props.icon && (
                                        <i className={`${tab.props.icon} mr-2 ${isActive
                                            ? hasError ? 'text-red-600' : 'text-indigo-600'
                                            : hasError ? 'text-red-500' : 'text-gray-400'
                                            }`}></i>
                                    )}
                                    {tab.props.label}
                                    {tab.props.badge && (
                                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${hasError
                                            ? 'bg-red-100 text-red-800'
                                            : isActive
                                                ? 'bg-indigo-100 text-indigo-800'
                                                : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {tab.props.badge}
                                        </span>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="tabs-content bg-white rounded-b-xl">
                <div className="p-6">
                    {activeTabContent}
                </div>
            </div>
        </div>
    );
};

const Tab = ({ label, icon, badge, hasError, children }) => {
    return <div>{children}</div>;
};

Tabs.Tab = Tab;

export default Tabs;