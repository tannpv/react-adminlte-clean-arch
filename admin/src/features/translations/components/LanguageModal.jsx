import React, { useEffect, useState } from 'react';
import Button from '../../../shared/components/ui/Button';
import Modal from '../../../shared/components/ui/Modal';
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
        <Modal isOpen={isOpen} onClose={toggle} className="max-w-2xl">
            <Modal.Header onClose={toggle}>
                <div className="flex items-center">
                    <i className={`fas ${language ? 'fa-edit' : 'fa-plus'} mr-3 text-blue-600`}></i>
                    {language ? t('edit_language', 'Edit Language') : t('add_language', 'Add New Language')}
                </div>
            </Modal.Header>

            <Modal.Body>
                <div className="mb-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start">
                            <i className="fas fa-info-circle text-blue-600 mr-2 mt-0.5"></i>
                            <div>
                                <strong className="text-blue-800">Language Configuration:</strong>
                                <span className="text-blue-700 ml-1">
                                    Configure language settings for your application. All fields marked with * are required.
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} id="language-form">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                                Language Code *
                            </label>
                            <input
                                type="text"
                                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.code ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                name="code"
                                id="code"
                                value={formData.code}
                                onChange={handleInputChange}
                                placeholder="e.g., en, es, fr"
                            />
                            {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
                            <p className="mt-1 text-sm text-gray-500">ISO language code (2-5 characters)</p>
                        </div>

                        <div>
                            <label htmlFor="flagIcon" className="block text-sm font-medium text-gray-700 mb-2">
                                Flag Icon
                            </label>
                            <input
                                type="text"
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                name="flagIcon"
                                id="flagIcon"
                                value={formData.flagIcon}
                                onChange={handleInputChange}
                                placeholder="🇺🇸"
                            />
                            <p className="mt-1 text-sm text-gray-500">Emoji flag or icon</p>
                        </div>

                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Language Name *
                            </label>
                            <input
                                type="text"
                                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.name ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                name="name"
                                id="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="e.g., English, Spanish, French"
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                        </div>

                        <div>
                            <label htmlFor="nativeName" className="block text-sm font-medium text-gray-700 mb-2">
                                Native Name *
                            </label>
                            <input
                                type="text"
                                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${errors.nativeName ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                name="nativeName"
                                id="nativeName"
                                value={formData.nativeName}
                                onChange={handleInputChange}
                                placeholder="e.g., English, Español, Français"
                            />
                            {errors.nativeName && <p className="mt-1 text-sm text-red-600">{errors.nativeName}</p>}
                        </div>
                    </div>

                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">Settings</label>
                        <div className="space-y-3">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="isDefault"
                                    id="isDefault"
                                    checked={formData.isDefault}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-900">
                                    Set as default language
                                </label>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                                    Active (available for selection)
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">Common Flag Icons</label>
                        <div className="grid grid-cols-10 gap-2">
                            {commonFlagIcons.map((icon, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    className={`p-2 border rounded-md text-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${formData.flagIcon === icon ? 'bg-blue-50 border-blue-300' : 'border-gray-300'
                                        }`}
                                    onClick={() => setFormData(prev => ({ ...prev, flagIcon: icon }))}
                                >
                                    {icon}
                                </button>
                            ))}
                        </div>
                    </div>
                </form>
            </Modal.Body>

            <Modal.Footer>
                <div className="flex justify-between items-center w-full">
                    <div className="text-gray-500 text-sm">
                        <i className="fas fa-globe mr-1"></i>
                        Language settings affect the entire application
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
                            variant={language ? 'warning' : 'success'}
                            type="submit"
                            form="language-form"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin mr-1"></i>
                                    {language ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (
                                <>
                                    <i className={`fas ${language ? 'fa-save' : 'fa-plus'} mr-1`}></i>
                                    {language ? 'Update Language' : 'Create Language'}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default LanguageModal;