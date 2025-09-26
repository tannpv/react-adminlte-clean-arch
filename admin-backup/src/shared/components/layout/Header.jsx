import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useTranslation } from '../../hooks/useTranslation';
import LanguageSwitcher from '../LanguageSwitcher';

const Header = () => {
    const { languageCode } = useLanguage();
    const t = useTranslation(languageCode, 'common');

    return (
        <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="flex items-center justify-between h-16 px-6">
                <div className="flex items-center">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {/* Page title will be set by individual pages */}
                    </h2>
                </div>
                <div className="flex items-center space-x-4">
                    <LanguageSwitcher />
                    <button className="text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors duration-200">
                        {t('logout')}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
