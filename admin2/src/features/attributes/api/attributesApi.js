import { apiClient } from '../../../shared/lib/apiClient';

// Attributes API
export const attributesApi = {
    // Get all attributes
    getAll: () => apiClient.get('/attributes'),
    
    // Get attribute by ID
    getById: (id) => apiClient.get(`/attributes/${id}`),
    
    // Create new attribute
    create: (data) => apiClient.post('/attributes', data),
    
    // Update attribute
    update: (id, data) => apiClient.put(`/attributes/${id}`, data),
    
    // Delete attribute
    delete: (id) => apiClient.delete(`/attributes/${id}`),
};

// Attribute Values API
export const attributeValuesApi = {
    // Get all attribute values
    getAll: () => apiClient.get('/attribute-values'),
    
    // Get attribute values by attribute ID
    getByAttributeId: (attributeId) => apiClient.get(`/attribute-values/by-attribute/${attributeId}`),
    
    // Get attribute value by ID
    getById: (id) => apiClient.get(`/attribute-values/${id}`),
    
    // Create new attribute value
    create: (data) => apiClient.post('/attribute-values', data),
    
    // Update attribute value
    update: (id, data) => apiClient.put(`/attribute-values/${id}`, data),
    
    // Delete attribute value
    delete: (id) => apiClient.delete(`/attribute-values/${id}`),
};

// Attribute Sets API
export const attributeSetsApi = {
    // Get all attribute sets
    getAll: () => apiClient.get('/attribute-sets'),

    // Get attribute set by ID
    getById: (id) => apiClient.get(`/attribute-sets/${id}`),

    // Get attribute set by name
    getByName: (name) => apiClient.get(`/attribute-sets/by-name/${name}`),

    // Create new attribute set
    create: (data) => apiClient.post('/attribute-sets', data),

    // Update attribute set
    update: (id, data) => apiClient.put(`/attribute-sets/${id}`, data),

    // Delete attribute set
    delete: (id) => apiClient.delete(`/attribute-sets/${id}`),

    // Add attribute to set
    addAttribute: (setId, attributeId, data = {}) =>
        apiClient.post(`/attribute-sets/${setId}/attributes/${attributeId}`, data),

    // Remove attribute from set
    removeAttribute: (setId, attributeId) =>
        apiClient.delete(`/attribute-sets/${setId}/attributes/${attributeId}`),
};
