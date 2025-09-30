import React, { useEffect, useState } from 'react';
import Button from '../../../shared/components/ui/Button';
import Form from '../../../shared/components/ui/Form';
import Modal from '../../../shared/components/ui/Modal';
import { useCreateAttributeSet, useUpdateAttributeSet } from '../hooks/useAttributeSets';

export const AttributeSetForm = ({ attributeSet, onClose }) => {

    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });

    const [errors, setErrors] = useState({});

    const createAttributeSetMutation = useCreateAttributeSet();
    const updateAttributeSetMutation = useUpdateAttributeSet();

    const isEditing = !!attributeSet;
    const isLoading = createAttributeSetMutation.isPending || updateAttributeSetMutation.isPending;

    useEffect(() => {
        if (attributeSet) {
            setFormData({
                name: attributeSet.name,
                description: attributeSet.description || '',
            });
        }
    }, [attributeSet]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const submitData = {
            ...formData,
            description: formData.description || undefined,
        };

        if (isEditing) {
            updateAttributeSetMutation.mutate(
                { id: attributeSet.id, data: submitData },
                {
                    onSuccess: () => {
                        onClose();
                    },
                    onError: (error) => {
                        if (error.response?.data?.fieldErrors) {
                            setErrors(error.response.data.fieldErrors);
                        }
                    },
                }
            );
        } else {
            createAttributeSetMutation.mutate(submitData, {
                onSuccess: () => {
                    onClose();
                },
                onError: (error) => {
                    if (error.response?.data?.fieldErrors) {
                        setErrors(error.response.data.fieldErrors);
                    }
                },
            });
        }
    };

    return (
        <Modal show={true} onClose={onClose} className="max-w-2xl">
            <Modal.Header onClose={onClose}>
                <div className="flex items-center">
                    <i className={`fas ${isEditing ? 'fa-edit' : 'fa-plus'} mr-3 text-blue-600`}></i>
                    {isEditing ? 'Edit Attribute Set' : 'Add New Attribute Set'}
                </div>
            </Modal.Header>

            <Modal.Body>
                <div className="mb-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start">
                            <i className="fas fa-info-circle text-blue-600 mr-2 mt-0.5"></i>
                            <div>
                                <strong className="text-blue-800">Attribute Set Management:</strong>
                                <span className="text-blue-700 ml-1">
                                    Create or edit attribute sets to organize attributes into reusable groups for products.
                                    All fields marked with * are required.
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <form id="attribute-set-form" onSubmit={handleSubmit}>
                    <Form.Group>
                        <Form.Label htmlFor="name">
                            <i className="fas fa-tag mr-2 text-blue-600"></i>
                            Name *
                        </Form.Label>
                        <Form.Control
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g., Clothing, Electronics, Books"
                            disabled={isLoading}
                            className={errors.name ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
                        />
                        {errors.name && (
                            <Form.Error>
                                <i className="fas fa-exclamation-triangle mr-1"></i>
                                {errors.name}
                            </Form.Error>
                        )}
                        <Form.Help>
                            A descriptive name for the attribute set
                        </Form.Help>
                    </Form.Group>

                    <Form.Group>
                        <Form.Label htmlFor="description">
                            <i className="fas fa-align-left mr-2 text-blue-600"></i>
                            Description
                        </Form.Label>
                        <Form.Textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Optional description of what this attribute set is used for"
                            rows="3"
                            disabled={isLoading}
                        />
                        <Form.Help>
                            Optional description to help identify the purpose of this attribute set
                        </Form.Help>
                    </Form.Group>

                    {isEditing && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start">
                                <i className="fas fa-info-circle text-blue-600 mr-2 mt-0.5"></i>
                                <div>
                                    <strong className="text-blue-800">Note:</strong>
                                    <span className="text-blue-700 ml-1">
                                        After creating the attribute set, you can add attributes to it from the attribute set details page.
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </form>
            </Modal.Body>

            <Modal.Footer>
                <div className="flex justify-between items-center w-full">
                    <div className="text-gray-500 text-sm">
                        <i className="fas fa-lightbulb mr-1"></i>
                        {isEditing ? 'Update the attribute set details' : 'Create a new attribute set to organize attributes'}
                    </div>
                    <div className="flex space-x-2">
                        <Button
                            variant="secondary"
                            outline
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            <i className="fas fa-times mr-1"></i>
                            Cancel
                        </Button>
                        <Button
                            variant={isEditing ? 'warning' : 'success'}
                            type="submit"
                            form="attribute-set-form"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin mr-1"></i>
                                    {isEditing ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (
                                <>
                                    <i className={`fas ${isEditing ? 'fa-save' : 'fa-plus'} mr-1`}></i>
                                    {isEditing ? 'Update Attribute Set' : 'Create Attribute Set'}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default AttributeSetForm;
