import React, { useEffect, useState } from 'react';
import Button from '../../../shared/components/ui/Button';
import Form from '../../../shared/components/ui/Form';
import Modal from '../../../shared/components/ui/Modal';
import { useLanguage, useTranslation } from '../../../shared/hooks/useTranslation';
import { useCreateAttributeValue, useUpdateAttributeValue } from '../hooks/useAttributeValues';
import { useAttributes } from '../hooks/useAttributes';

export const AttributeValueForm = ({ show, attributeValue, onClose }) => {
    const { languageCode } = useLanguage();
    const { t } = useTranslation(languageCode, 'attributes');

    const [formData, setFormData] = useState({
        attributeId: '',
        value: '',
        sortOrder: 0,
    });
    const [errors, setErrors] = useState({});

    const { data: attributes = [] } = useAttributes();
    const createMutation = useCreateAttributeValue();
    const updateMutation = useUpdateAttributeValue();

    const isEditing = !!attributeValue;
    const isLoading = createMutation.isLoading || updateMutation.isLoading;

    useEffect(() => {
        if (attributeValue) {
            setFormData({
                attributeId: attributeValue.attributeId || '',
                value: attributeValue.value || '',
                sortOrder: attributeValue.sortOrder || 0,
            });
        } else {
            setFormData({
                attributeId: '',
                value: '',
                sortOrder: 0,
            });
        }
        setErrors({});
    }, [attributeValue, show]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'sortOrder' ? parseInt(value) || 0 : value,
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null,
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.attributeId) {
            newErrors.attributeId = 'Please select an attribute';
        }

        if (!formData.value.trim()) {
            newErrors.value = 'Value is required';
        }

        if (formData.value.length > 255) {
            newErrors.value = 'Value must be less than 255 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const payload = {
            attributeId: parseInt(formData.attributeId),
            value: formData.value.trim(),
            sortOrder: formData.sortOrder,
        };

        if (isEditing) {
            updateMutation.mutate(
                { id: attributeValue.id, data: payload },
                {
                    onSuccess: () => {
                        onClose();
                    },
                    onError: (error) => {
                        console.error('Update error:', error);
                        setErrors({ submit: 'Failed to update attribute value' });
                    },
                }
            );
        } else {
            createMutation.mutate(payload, {
                onSuccess: () => {
                    onClose();
                },
                onError: (error) => {
                    console.error('Create error:', error);
                    setErrors({ submit: 'Failed to create attribute value' });
                },
            });
        }
    };

    if (!show) return null;

    return (
        <Modal show={show} onClose={onClose} className="max-w-2xl">
            <Modal.Header onClose={onClose}>
                <div className="flex items-center">
                    <i className={`fas ${isEditing ? 'fa-edit' : 'fa-plus'} mr-3 text-blue-600`}></i>
                    {isEditing ? t('edit_attribute_value', 'Edit Attribute Value') : t('add_new_attribute_value', 'Add New Attribute Value')}
                </div>
            </Modal.Header>

            <Modal.Body>
                <div className="mb-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start">
                            <i className="fas fa-info-circle text-blue-600 mr-2 mt-0.5"></i>
                            <div>
                                <strong className="text-blue-800">{t('attribute_values', 'Attribute Values')}:</strong>
                                <span className="text-blue-700 ml-1">
                                    {t('attribute_values_description', 'Create values like "Red", "Blue", "Small", "Large" for your attributes.')}
                                    {t('required_fields_note', 'All fields marked with * are required.')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Form.Group>
                            <Form.Label htmlFor="attributeId">
                                <i className="fas fa-tag mr-2 text-blue-600"></i>
                                {t('attribute', 'Attribute')} *
                            </Form.Label>
                            <Form.Select
                                id="attributeId"
                                name="attributeId"
                                value={formData.attributeId}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                required
                                className={errors.attributeId ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
                            >
                                <option value="">{t('select_attribute', 'Select an attribute...')}</option>
                                {attributes.map(attribute => (
                                    <option key={attribute.id} value={attribute.id}>
                                        {attribute.name} ({attribute.inputType})
                                    </option>
                                ))}
                            </Form.Select>
                            {errors.attributeId && (
                                <Form.Error>
                                    <i className="fas fa-exclamation-triangle mr-1"></i>
                                    {errors.attributeId}
                                </Form.Error>
                            )}
                            <Form.Help>
                                {t('choose_attribute_help_text', 'Choose the attribute this value belongs to')}
                            </Form.Help>
                        </Form.Group>

                        <Form.Group>
                            <Form.Label htmlFor="value">
                                <i className="fas fa-list mr-2 text-blue-600"></i>
                                {t('value', 'Value')} *
                            </Form.Label>
                            <Form.Control
                                type="text"
                                id="value"
                                name="value"
                                value={formData.value}
                                onChange={handleInputChange}
                                placeholder={t('value_placeholder', 'e.g., Red, Blue, Small, Large')}
                                disabled={isLoading}
                                required
                                className={errors.value ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
                            />
                            {errors.value && (
                                <Form.Error>
                                    <i className="fas fa-exclamation-triangle mr-1"></i>
                                    {errors.value}
                                </Form.Error>
                            )}
                            <Form.Help>
                                {t('value_help_text', 'The actual value (e.g., "Red" for Color attribute)')}
                            </Form.Help>
                        </Form.Group>
                    </div>

                    <Form.Group>
                        <Form.Label htmlFor="sortOrder">
                            <i className="fas fa-sort-numeric-up mr-2 text-blue-600"></i>
                            {t('sort_order', 'Sort Order')}
                        </Form.Label>
                        <Form.Control
                            type="number"
                            id="sortOrder"
                            name="sortOrder"
                            value={formData.sortOrder}
                            onChange={handleInputChange}
                            min="0"
                            disabled={isLoading}
                        />
                        <Form.Help>
                            {t('sort_order_help_text', 'Lower numbers appear first in dropdowns')}
                        </Form.Help>
                    </Form.Group>

                    {errors.submit && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start">
                                <i className="fas fa-exclamation-triangle text-red-600 mr-2 mt-0.5"></i>
                                <span className="text-red-800">{errors.submit}</span>
                            </div>
                        </div>
                    )}
                </form>
            </Modal.Body>

            <Modal.Footer>
                <div className="flex justify-between items-center w-full">
                    <div className="text-gray-500 text-sm">
                        <i className="fas fa-lightbulb mr-1"></i>
                        {isEditing ? t('update_attribute_value_details', 'Update the attribute value details') : t('create_new_attribute_value', 'Create a new value for an attribute')}
                    </div>
                    <div className="flex space-x-2">
                        <Button
                            variant="secondary"
                            outline
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            <i className="fas fa-times mr-1"></i>
                            {t('cancel', 'Cancel')}
                        </Button>
                        <Button
                            variant={isEditing ? 'warning' : 'success'}
                            onClick={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin mr-1"></i>
                                    {isEditing ? t('updating', 'Updating...') : t('creating', 'Creating...')}
                                </>
                            ) : (
                                <>
                                    <i className={`fas ${isEditing ? 'fa-save' : 'fa-plus'} mr-1`}></i>
                                    {isEditing ? t('update_value', 'Update Value') : t('create_value', 'Create Value')}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default AttributeValueForm;
