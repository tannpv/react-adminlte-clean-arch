import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

const TranslatedButton = ({
    translationKey,
    namespace = 'common',
    fallback,
    children,
    className = 'btn btn-primary',
    ...props
}) => {
    const { t } = useTranslation('en', namespace);

    // Use translation if available, otherwise use fallback or children
    const text = t(translationKey, fallback || children || translationKey);

    return (
        <button className={className} {...props}>
            {text}
        </button>
    );
};

export default TranslatedButton;
