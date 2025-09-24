import React from 'react';
import { useActiveLanguages } from '../../features/translations/hooks/useTranslations';
import { useLanguage } from '../hooks/useTranslation';

const LanguageSwitcher = () => {
    const { languageCode, setLanguage } = useLanguage();
    const { data: languages, isLoading } = useActiveLanguages();
    const [dropdownOpen, setDropdownOpen] = React.useState(false);

    const toggle = () => setDropdownOpen(prevState => !prevState);

    const handleLanguageChange = (newLanguageCode) => {
        if (newLanguageCode !== languageCode) {
            setLanguage(newLanguageCode);
        }
        setDropdownOpen(false);
    };

    if (isLoading || !languages || languages.length === 0) {
        return null;
    }

    const currentLanguage = languages.find(lang => lang.code === languageCode);

    return (
        <div className="dropdown">
            <button
                className="btn btn-outline-light dropdown-toggle d-flex align-items-center"
                type="button"
                id="languageDropdown"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
                onClick={toggle}
            >
                <span style={{ fontSize: '1.2em', marginRight: '8px' }}>
                    {currentLanguage?.flagIcon || '🌐'}
                </span>
                <span className="d-none d-md-inline">
                    {currentLanguage?.name || currentLanguage?.code || 'Language'}
                </span>
            </button>
            <div className={`dropdown-menu dropdown-menu-right ${dropdownOpen ? 'show' : ''}`} aria-labelledby="languageDropdown">
                {languages.map(language => (
                    <button
                        key={language.id}
                        className={`dropdown-item ${language.code === languageCode ? 'active' : ''}`}
                        onClick={() => handleLanguageChange(language.code)}
                    >
                        <span style={{ fontSize: '1.2em', marginRight: '8px' }}>
                            {language.flagIcon || '🌐'}
                        </span>
                        {language.name || language.code || 'Unknown'}
                        {(language.isDefault === true || language.isDefault === 1) && (
                            <span className="text-muted ml-2">(Default)</span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default LanguageSwitcher;
