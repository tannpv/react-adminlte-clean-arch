import React, { useEffect, useState } from 'react';
import { useTranslation } from '../../../shared/hooks/useTranslation';

const LanguageModal = ({ isOpen, toggle, language, onSave, isLoading }) => {
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        nativeName: '',
        isDefault: false,
        isActive: true,
        flagIcon: ''
    });

    const [errors, setErrors] = useState({});
    const { t } = useTranslation('en', 'translations');

    useEffect(() => {
        if (language) {
            setFormData({
                code: language.code || '',
                name: language.name || '',
                nativeName: language.nativeName || '',
                isDefault: language.isDefault || false,
                isActive: language.isActive !== undefined ? language.isActive : true,
                flagIcon: language.flagIcon || ''
            });
        } else {
            setFormData({
                code: '',
                name: '',
                nativeName: '',
                isDefault: false,
                isActive: true,
                flagIcon: ''
            });
        }
        setErrors({});
    }, [language, isOpen]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.code.trim()) {
            newErrors.code = 'Language code is required';
        } else if (formData.code.length < 2 || formData.code.length > 5) {
            newErrors.code = 'Language code must be 2-5 characters';
        }

        if (!formData.name.trim()) {
            newErrors.name = 'Language name is required';
        }

        if (!formData.nativeName.trim()) {
            newErrors.nativeName = 'Native name is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSave(formData);
        }
    };

    const commonFlagIcons = [
        '🇺🇸', '🇬🇧', '🇪🇸', '🇫🇷', '🇩🇪', '🇮🇹', '🇵🇹', '🇳🇱', '🇧🇪', '🇨🇭',
        '🇦🇹', '🇸🇪', '🇳🇴', '🇩🇰', '🇫🇮', '🇵🇱', '🇨🇿', '🇭🇺', '🇷🇴', '🇧🇬',
        '🇬🇷', '🇹🇷', '🇷🇺', '🇺🇦', '🇧🇾', '🇱🇹', '🇱🇻', '🇪🇪', '🇲🇩', '🇸🇰',
        '🇸🇮', '🇭🇷', '🇷🇸', '🇧🇦', '🇲🇰', '🇦🇱', '🇲🇪', '🇽🇰', '🇯🇵', '🇰🇷',
        '🇨🇳', '🇹🇼', '🇭🇰', '🇸🇬', '🇲🇾', '🇹🇭', '🇻🇳', '🇮🇩', '🇵🇭', '🇮🇳'
    ];

    return (
        <div className={`modal fade ${isOpen ? 'show' : ''}`} style={{ display: isOpen ? 'block' : 'none' }} tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-lg" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            {language ? t('edit_language', 'Edit Language') : t('add_language', 'Add New Language')}
                        </h5>
                        <button type="button" className="close" onClick={toggle}>
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label htmlFor="code">Language Code *</label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.code ? 'is-invalid' : ''}`}
                                            name="code"
                                            id="code"
                                            value={formData.code}
                                            onChange={handleInputChange}
                                            placeholder="e.g., en, es, fr"
                                        />
                                        {errors.code && <div className="invalid-feedback">{errors.code}</div>}
                                        <small className="form-text text-muted">
                                            ISO language code (2-5 characters)
                                        </small>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label htmlFor="flagIcon">Flag Icon</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="flagIcon"
                                            id="flagIcon"
                                            value={formData.flagIcon}
                                            onChange={handleInputChange}
                                            placeholder="🇺🇸"
                                        />
                                        <small className="form-text text-muted">
                                            Emoji flag or icon
                                        </small>
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label htmlFor="name">Language Name *</label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                            name="name"
                                            id="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="e.g., English"
                                        />
                                        {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label htmlFor="nativeName">Native Name *</label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.nativeName ? 'is-invalid' : ''}`}
                                            name="nativeName"
                                            id="nativeName"
                                            value={formData.nativeName}
                                            onChange={handleInputChange}
                                            placeholder="e.g., English"
                                        />
                                        {errors.nativeName && <div className="invalid-feedback">{errors.nativeName}</div>}
                                    </div>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <div className="form-check">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                name="isDefault"
                                                id="isDefault"
                                                checked={formData.isDefault}
                                                onChange={handleInputChange}
                                            />
                                            <label className="form-check-label" htmlFor="isDefault">
                                                Set as default language
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <div className="form-check">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                name="isActive"
                                                id="isActive"
                                                checked={formData.isActive}
                                                onChange={handleInputChange}
                                            />
                                            <label className="form-check-label" htmlFor="isActive">
                                                Active
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {commonFlagIcons.length > 0 && (
                                <div className="form-group">
                                    <label>Common Flag Icons</label>
                                    <div className="d-flex flex-wrap" style={{ gap: '8px' }}>
                                        {commonFlagIcons.map((icon, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                className="btn btn-sm btn-outline-secondary"
                                                onClick={() => setFormData(prev => ({ ...prev, flagIcon: icon }))}
                                                style={{ fontSize: '1.2em' }}
                                            >
                                                {icon}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={toggle} disabled={isLoading}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={isLoading}>
                                {isLoading ? 'Saving...' : (language ? t('edit_language', 'Update') : t('add_language', 'Create'))}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            {isOpen && <div className="modal-backdrop fade show"></div>}
        </div>
    );
};

export default LanguageModal;
