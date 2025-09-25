import React, { useEffect, useState } from 'react';
import { useTranslation } from '../../../shared/hooks/useTranslation';
import Button from '../../../shared/components/ui/Button';
import Modal from '../../../shared/components/ui/Modal';

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
        <Modal isOpen={isOpen} onClose={toggle} className="max-w-2xl">
            <Modal.Header onClose={toggle}>
                <div className="flex items-center">
                    <i className="fas fa-edit mr-3 text-blue-600"></i>
                    {t('edit_translation', 'Edit Translation')}
                </div>
            </Modal.Header>

            <Modal.Body>
                <div className="mb-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start">
                            <i className="fas fa-info-circle text-blue-600 mr-2 mt-0.5"></i>
                            <div>
                                <strong className="text-blue-800">Translation Details:</strong>
                                <span className="text-blue-700 ml-1">
                                    Edit the translation value and add notes for better context.
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {translation && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600">
                            <strong>Key:</strong> <code className="bg-gray-200 px-2 py-1 rounded text-xs">{translation.keyPath}</code>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                            <strong>Language:</strong> {languageCode}
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} id="translation-form">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-2">
                                Translation Value *
                            </label>
                            <textarea
                                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                                    errors.value ? 'border-red-300' : 'border-gray-300'
                                }`}
                                name="value"
                                id="value"
                                rows={4}
                                value={formData.value}
                                onChange={handleInputChange}
                                placeholder="Enter the translation..."
                            />
                            {errors.value && <p className="mt-1 text-sm text-red-600">{errors.value}</p>}
                            <p className="mt-1 text-sm text-gray-500">
                                The actual translation text that will be displayed to users
                            </p>
                        </div>

                        <div>
                            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                                Notes (Optional)
                            </label>
                            <textarea
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                name="notes"
                                id="notes"
                                rows={3}
                                value={formData.notes}
                                onChange={handleInputChange}
                                placeholder="Add context or notes about this translation..."
                            />
                            <p className="mt-1 text-sm text-gray-500">
                                Internal notes to help translators understand the context
                            </p>
                        </div>
                    </div>
                </form>
            </Modal.Body>

            <Modal.Footer>
                <div className="flex justify-between items-center w-full">
                    <div className="text-gray-500 text-sm">
                        <i className="fas fa-language mr-1"></i>
                        Changes will be applied immediately
                    </div>
                    <div className="flex space-x-2">
                        <Button
                            variant="secondary"
                            outline
                            onClick={toggle}
                            disabled={isLoading}
                        >
                            <i className="fas fa-times mr-1"></i>
                            Cancel
                        </Button>
                        <Button
                            variant="success"
                            type="submit"
                            form="translation-form"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin mr-1"></i>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-save mr-1"></i>
                                    Save Translation
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default TranslationEditModal;