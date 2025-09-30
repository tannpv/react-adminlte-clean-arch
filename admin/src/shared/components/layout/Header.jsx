import React from 'react';

const Header = () => {

    return (
        <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="flex items-center justify-between h-16 px-6">
                <div className="flex items-center">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {/* Page title will be set by individual pages */}
                    </h2>
                </div>
                <div className="flex items-center space-x-4">
                    <button className="text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors duration-200">
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
