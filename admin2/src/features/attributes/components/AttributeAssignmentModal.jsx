import React, { useState } from 'react';
import Button from '../../../shared/components/ui/Button';
import Modal from '../../../shared/components/ui/Modal';

export const AttributeAssignmentModal = ({ availableAttributes, onSubmit, onClose, isLoading }) => {
    const [formData, setFormData] = useState({
        attributeId: '',
        sortOrder: 0,
        isRequired: false,
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
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

        if (!formData.attributeId) {
            newErrors.attributeId = 'Please select an attribute';
        }

        if (formData.sortOrder < 0) {
            newErrors.sortOrder = 'Sort order must be 0 or greater';
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
            sortOrder: parseInt(formData.sortOrder, 10),
        };

        onSubmit(submitData);
    };

    return (
        <Modal isOpen={true} onClose={onClose} className="max-w-2xl">
            <Modal.Header onClose={onClose}>
                <div className="flex items-center">
                    <i className="fas fa-plus mr-3 text-blue-600"></i>
                    Add Attribute to Set
                </div>
            </Modal.Header>

            <Modal.Body>
                <div className="mb-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start">
                            <i className="fas fa-info-circle text-blue-600 mr-2 mt-0.5"></i>
                            <div>
                                <strong className="text-blue-800">Attribute Assignment:</strong>
                                <span className="text-blue-700 ml-1">
                                    Select an attribute to add to this attribute set and configure its settings.
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} id="attribute-assignment-form">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="attributeId" className="block text-sm font-medium text-gray-700 mb-2">
                                Select Attribute *
                            </label>
                            <select
                                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                                    errors.attributeId ? 'border-red-300' : 'border-gray-300'
                                }`}
                                name="attributeId"
                                id="attributeId"
                                value={formData.attributeId}
                                onChange={handleChange}
                            >
                                <option value="">Choose an attribute...</option>
                                {availableAttributes.map((attr) => (
                                    <option key={attr.id} value={attr.id}>
                                        {attr.name} ({attr.code})
                                    </option>
                                ))}
                            </select>
                            {errors.attributeId && <p className="mt-1 text-sm text-red-600">{errors.attributeId}</p>}
                            <p className="mt-1 text-sm text-gray-500">
                                Select an attribute to add to this attribute set
                            </p>
                        </div>

                        <div>
                            <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-2">
                                Sort Order
                            </label>
                            <input
                                type="number"
                                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                                    errors.sortOrder ? 'border-red-300' : 'border-gray-300'
                                }`}
                                name="sortOrder"
                                id="sortOrder"
                                value={formData.sortOrder}
                                onChange={handleChange}
                                min="0"
                            />
                            {errors.sortOrder && <p className="mt-1 text-sm text-red-600">{errors.sortOrder}</p>}
                            <p className="mt-1 text-sm text-gray-500">
                                Order in which this attribute appears in the set (0 = first)
                            </p>
                        </div>

                        <div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="isRequired"
                                    id="isRequired"
                                    checked={formData.isRequired}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="isRequired" className="ml-2 block text-sm text-gray-900">
                                    Required Attribute
                                </label>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                                Mark this attribute as required for products in this set
                            </p>
                        </div>
                    </div>
                </form>
            </Modal.Body>

            <Modal.Footer>
                <div className="flex justify-between items-center w-full">
                    <div className="text-gray-500 text-sm">
                        <i className="fas fa-list mr-1"></i>
                        Attribute will be added to the current set
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
                            variant="success"
                            type="submit"
                            form="attribute-assignment-form"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin mr-1"></i>
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-plus mr-1"></i>
                                    Add Attribute
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </Modal.Footer>
        </Modal>
    );
};