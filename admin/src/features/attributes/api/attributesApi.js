import { ApiClient } from '../../../shared/lib/ApiClient';

// Attributes API
export const attributesApi = {
    // Get all attributes
    getAll: () => ApiClient.get('/attributes'),
    
    // Get attribute by ID
    getById: (id) => ApiClient.get(`/attributes/${id}`),
    
    // Create new attribute
    create: (data) => ApiClient.post('/attributes', data),
    
    // Update attribute
    update: (id, data) => ApiClient.put(`/attributes/${id}`, data),
    
    // Delete attribute
    delete: (id) => ApiClient.delete(`/attributes/${id}`),
};

// Attribute Values API
export const attributeValuesApi = {
    // Get all attribute values
    getAll: () => ApiClient.get('/attribute-values'),
    
    // Get attribute values by attribute ID
    getByAttributeId: (attributeId) => ApiClient.get(`/attribute-values/by-attribute/${attributeId}`),
    
    // Get attribute value by ID
    getById: (id) => ApiClient.get(`/attribute-values/${id}`),
    
    // Create new attribute value
    create: (data) => ApiClient.post('/attribute-values', data),
    
    // Update attribute value
    update: (id, data) => ApiClient.put(`/attribute-values/${id}`, data),
    
    // Delete attribute value
    delete: (id) => ApiClient.delete(`/attribute-values/${id}`),
};

// Attribute Sets API
export const attributeSetsApi = {
    // Get all attribute sets
    getAll: () => ApiClient.get('/attribute-sets'),

    // Get attribute set by ID
    getById: (id) => ApiClient.get(`/attribute-sets/${id}`),

    // Get attribute set by name
    getByName: (name) => ApiClient.get(`/attribute-sets/by-name/${name}`),

    // Create new attribute set
    create: (data) => ApiClient.post('/attribute-sets', data),

    // Update attribute set
    update: (id, data) => ApiClient.put(`/attribute-sets/${id}`, data),

    // Delete attribute set
    delete: (id) => ApiClient.delete(`/attribute-sets/${id}`),

    // Add attribute to set
    addAttribute: (setId, attributeId, data = {}) =>
        ApiClient.post(`/attribute-sets/${setId}/attributes/${attributeId}`, data),

    // Remove attribute from set
    removeAttribute: (setId, attributeId) =>
        ApiClient.delete(`/attribute-sets/${setId}/attributes/${attributeId}`),
};
