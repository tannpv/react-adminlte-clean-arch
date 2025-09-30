import React, { useEffect, useState } from 'react';
import Button from '../../../shared/components/ui/Button';
import Form from '../../../shared/components/ui/Form';
import Modal from '../../../shared/components/ui/Modal';
import { useCreateAttribute, useUpdateAttribute } from '../hooks/useAttributes';

export const AttributeForm = ({ attribute, onClose }) => {

    const [formData, setFormData] = useState({
        code: '',
        name: '',
        inputType: 'select',
        dataType: 'string',
        unit: '',
    });

    const [errors, setErrors] = useState({});

    const createAttributeMutation = useCreateAttribute();
    const updateAttributeMutation = useUpdateAttribute();

    const isEditing = !!attribute;
    const isLoading = createAttributeMutation.isPending || updateAttributeMutation.isPending;

    useEffect(() => {
        if (attribute) {
            setFormData({
                code: attribute.code,
                name: attribute.name,
                inputType: attribute.inputType,
                dataType: attribute.dataType,
                unit: attribute.unit || '',
            });
        }
    }, [attribute]);

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

        if (!formData.code.trim()) {
            newErrors.code = 'Code is required';
        } else if (!/^[a-z0-9_]+$/.test(formData.code)) {
            newErrors.code = 'Code must contain only lowercase letters, numbers, and underscores';
        }

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.inputType) {
            newErrors.inputType = 'Input type is required';
        }

        if (!formData.dataType) {
            newErrors.dataType = 'Data type is required';
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
            unit: formData.unit || undefined,
        };

        if (isEditing) {
            updateAttributeMutation.mutate(
                { id: attribute.id, data: submitData },
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
            createAttributeMutation.mutate(submitData, {
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
                    {isEditing ? 'Edit Attribute' : 'Add New Attribute'}
                </div>
            </Modal.Header>

            <Modal.Body>
                <div className="mb-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start">
                            <i className="fas fa-info-circle text-blue-600 mr-2 mt-0.5"></i>
                            <div>
                                <strong className="text-blue-800">Attribute Management:</strong>
                                <span className="text-blue-700 ml-1">
                                    Create or edit attributes to define product characteristics like color, size, and material.
                                    All fields marked with * are required.
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <form id="attribute-form" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Form.Group>
                            <Form.Label htmlFor="code">
                                <i className="fas fa-code mr-2 text-blue-600"></i>
                                Code *
                            </Form.Label>
                            <Form.Control
                                type="text"
                                id="code"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                placeholder="e.g., color, size, weight"
                                disabled={isLoading}
                                className={errors.code ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
                            />
                            {errors.code && (
                                <Form.Error>
                                    <i className="fas fa-exclamation-triangle mr-1"></i>
                                    {errors.code}
                                </Form.Error>
                            )}
                            <Form.Help>
                                Unique identifier for the attribute (lowercase, numbers, underscores only)
                            </Form.Help>
                        </Form.Group>
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
                                placeholder="e.g., Color, Size, Weight"
                                disabled={isLoading}
                                className={errors.name ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
                            />
                            {errors.name && (
                                <Form.Error>
                                    <i className="fas fa-exclamation-triangle mr-1"></i>
                                    {errors.name}
                                </Form.Error>
                            )}
                        </Form.Group>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Form.Group>
                            <Form.Label htmlFor="inputType">
                                <i className="fas fa-keyboard mr-2 text-blue-600"></i>
                                Input Type *
                            </Form.Label>
                            <Form.Select
                                id="inputType"
                                name="inputType"
                                value={formData.inputType}
                                onChange={handleChange}
                                disabled={isLoading}
                                className={errors.inputType ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
                            >
                                <option value="select">Select (Single Choice)</option>
                                <option value="multiselect">Multi-select (Multiple Choices)</option>
                                <option value="text">Text Input</option>
                                <option value="number">Number Input</option>
                                <option value="boolean">Boolean (Yes/No)</option>
                            </Form.Select>
                            {errors.inputType && (
                                <Form.Error>
                                    <i className="fas fa-exclamation-triangle mr-1"></i>
                                    {errors.inputType}
                                </Form.Error>
                            )}
                        </Form.Group>
                        <Form.Group>
                            <Form.Label htmlFor="dataType">
                                <i className="fas fa-database mr-2 text-blue-600"></i>
                                Data Type *
                            </Form.Label>
                            <Form.Select
                                id="dataType"
                                name="dataType"
                                value={formData.dataType}
                                onChange={handleChange}
                                disabled={isLoading}
                                className={errors.dataType ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
                            >
                                <option value="string">String</option>
                                <option value="number">Number</option>
                                <option value="boolean">Boolean</option>
                            </Form.Select>
                            {errors.dataType && (
                                <Form.Error>
                                    <i className="fas fa-exclamation-triangle mr-1"></i>
                                    {errors.dataType}
                                </Form.Error>
                            )}
                        </Form.Group>
                    </div>

                    <Form.Group>
                        <Form.Label htmlFor="unit">
                            <i className="fas fa-ruler mr-2 text-blue-600"></i>
                            Unit
                        </Form.Label>
                        <Form.Control
                            type="text"
                            id="unit"
                            name="unit"
                            value={formData.unit}
                            onChange={handleChange}
                            placeholder="e.g., kg, cm, ml"
                            disabled={isLoading}
                        />
                        <Form.Help>
                            Optional unit of measurement
                        </Form.Help>
                    </Form.Group>
                </form>
            </Modal.Body>

            <Modal.Footer>
                <div className="flex justify-between items-center w-full">
                    <div className="text-gray-500 text-sm">
                        <i className="fas fa-lightbulb mr-1"></i>
                        {isEditing ? 'Update the attribute details' : 'Create a new attribute for products'}
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
                            form="attribute-form"
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
                                    {isEditing ? 'Update Attribute' : 'Create Attribute'}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default AttributeForm;
