import React, { useEffect, useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';

const Translation = ({
    key: translationKey,
    fallback,
    params = [],
    className = '',
    children,
    ...props
}) => {
    const { t, tWithFormat } = useTranslation();
    const [translation, setTranslation] = useState(fallback || translationKey);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTranslation = async () => {
            try {
                setLoading(true);
                let result;

                if (params && params.length > 0) {
                    result = await tWithFormat(translationKey, ...params);
                } else {
                    result = await t(translationKey);
                }

                setTranslation(result);
            } catch (error) {
                setTranslation(fallback || translationKey);
            } finally {
                setLoading(false);
            }
        };

        if (translationKey) {
            loadTranslation();
        }
    }, [translationKey, params, t, tWithFormat, fallback]);

    if (loading) {
        return (
            <span className={`translation-loading ${className}`} {...props}>
                {fallback || translationKey}
            </span>
        );
    }

    if (children) {
        return React.cloneElement(children, {
            ...props,
            className: `${className} ${children.props.className || ''}`.trim(),
            children: translation
        });
    }

    return (
        <span className={className} {...props}>
            {translation}
        </span>
    );
};

// Higher-order component for easy translation
export const withTranslation = (WrappedComponent) => {
    return (props) => {
        const { t, tWithFormat, translateArray, language, changeLanguage } = useTranslation();

        return (
            <WrappedComponent
                {...props}
                t={t}
                tWithFormat={tWithFormat}
                translateArray={translateArray}
                language={language}
                changeLanguage={changeLanguage}
            />
        );
    };
};

// Translation provider for context
export const TranslationProvider = ({ children }) => {
    const { language, changeLanguage } = useTranslation();

    return (
        <div className="translation-provider" data-language={language}>
            {children}
        </div>
    );
};

export default Translation;
