import { ApiClient } from '../../../shared/lib/apiClient';

// Product Attribute Values API
export const productAttributesApi = {
    // Get all product attribute values for a product
    getProductAttributeValues: async (productId) => {
        const response = await ApiClient.get(`/product-attribute-values/product/${productId}`);
        return response.data;
    },

    // Get product attribute value by ID
    getProductAttributeValue: async (id) => {
        const response = await ApiClient.get(`/product-attribute-values/${id}`);
        return response.data;
    },

    // Create product attribute value
    createProductAttributeValue: async (data) => {
        const response = await ApiClient.post('/product-attribute-values', data);
        return response.data;
    },

    // Update product attribute value
    updateProductAttributeValue: async (id, data) => {
        const response = await ApiClient.patch(`/product-attribute-values/${id}`, data);
        return response.data;
    },

    // Delete product attribute value
    deleteProductAttributeValue: async (id) => {
        await ApiClient.delete(`/product-attribute-values/${id}`);
    },

    // Delete all product attribute values for a product
    deleteProductAttributeValues: async (productId) => {
        await ApiClient.delete(`/product-attribute-values/product/${productId}`);
    },

    // Get product attribute value by product and attribute
    getProductAttributeValueByProductAndAttribute: async (productId, attributeId) => {
        const response = await ApiClient.get(`/product-attribute-values/product/${productId}/attribute/${attributeId}`);
        return response.data;
    },

    // Delete product attribute value by product and attribute
    deleteProductAttributeValueByProductAndAttribute: async (productId, attributeId) => {
        await ApiClient.delete(`/product-attribute-values/product/${productId}/attribute/${attributeId}`);
    }
};

// Product Variants API
export const productVariantsApi = {
    // Get all variants for a product
    getProductVariants: async (productId) => {
        const response = await ApiClient.get(`/product-variants/by-product/${productId}`);
        return response.data;
    },

    // Get variant by ID
    getProductVariant: async (id) => {
        const response = await ApiClient.get(`/product-variants/${id}`);
        return response.data;
    },

    // Create product variant
    createProductVariant: async (data) => {
        const response = await ApiClient.post('/product-variants', data);
        return response.data;
    },

    // Update product variant
    updateProductVariant: async (id, data) => {
        const response = await ApiClient.patch(`/product-variants/${id}`, data);
        return response.data;
    },

    // Delete product variant
    deleteProductVariant: async (id) => {
        await ApiClient.delete(`/product-variants/${id}`);
    }
};
