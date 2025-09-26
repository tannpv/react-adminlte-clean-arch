import React, { useEffect, useState } from 'react';
import { useTranslation } from '../../../shared/hooks/useTranslation';

const TranslationEditModal = ({
    isOpen,
    toggle,
    translation,
    languageCode,
    onSave,
    isLoading
}) => {
    const [formData, setFormData] = useState({
        value: '',
        notes: ''
    });
    const [errors, setErrors] = useState({});
    const { t } = useTranslation('en', 'translations');

    useEffect(() => {
        if (translation) {
            setFormData({
                value: translation.value || '',
                notes: translation.notes || ''
            });
        } else {
            setFormData({
                value: '',
                notes: ''
            });
        }
        setErrors({});
    }, [translation, isOpen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
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

        if (!formData.value.trim()) {
            newErrors.value = 'Translation value is required';
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

    return (
        <div className={`modal fade ${isOpen ? 'show' : ''}`}
            style={{ display: isOpen ? 'block' : 'none' }}
            tabIndex="-1"
            role="dialog">
            <div className="modal-dialog modal-lg" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            {translation ? t('edit_language', 'Edit Translation') : 'Add Translation'}
                        </h5>
                        <button type="button" className="close" onClick={toggle}>
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            {translation && (
                                <div className="form-group">
                                    <label>Translation Key</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={translation.keyPath || ''}
                                        readOnly
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="value">Translation Value *</label>
                                <textarea
                                    className={`form-control ${errors.value ? 'is-invalid' : ''}`}
                                    name="value"
                                    id="value"
                                    rows="3"
                                    value={formData.value}
                                    onChange={handleInputChange}
                                    placeholder="Enter the translated text..."
                                />
                                {errors.value && <div className="invalid-feedback">{errors.value}</div>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="notes">Notes (Optional)</label>
                                <textarea
                                    className="form-control"
                                    name="notes"
                                    id="notes"
                                    rows="2"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    placeholder="Add any notes for translators..."
                                />
                                <small className="form-text text-muted">
                                    These notes are only visible to translators and administrators.
                                </small>
                            </div>

                            {languageCode && (
                                <div className="form-group">
                                    <label>Language</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={languageCode.toUpperCase()}
                                        readOnly
                                    />
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={toggle}
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Saving...' : (translation ? 'Update' : 'Create')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            {isOpen && <div className="modal-backdrop fade show"></div>}
        </div>
    );
};

export default TranslationEditModal;


