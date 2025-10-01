import { useState, useEffect, useCallback } from 'react';
import { productAttributesApi } from '../api/productAttributesApi';

// Product Attribute Values Hooks
export const useProductAttributeValues = (productId) => {
    return useQuery({
        queryKey: ['productAttributeValues', productId],
        queryFn: () => productAttributesApi.getProductAttributeValues(productId),
        enabled: !!productId,
    });
};

export const useProductAttributeValue = (id) => {
    return useQuery({
        queryKey: ['productAttributeValue', id],
        queryFn: () => productAttributesApi.getProductAttributeValue(id),
        enabled: !!id,
    });
};

export const useCreateProductAttributeValue = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: productAttributesApi.createProductAttributeValue,
        onSuccess: (data, variables) => {
            // Invalidate and refetch product attribute values
            queryClient.invalidateQueries(['productAttributeValues', variables.productId]);
        },
    });
};

export const useUpdateProductAttributeValue = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => productAttributesApi.updateProductAttributeValue(id, data),
        onSuccess: (data, variables) => {
            // Invalidate and refetch product attribute values
            queryClient.invalidateQueries(['productAttributeValues', data.productId]);
            queryClient.invalidateQueries(['productAttributeValue', variables.id]);
        },
    });
};

export const useDeleteProductAttributeValue = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: productAttributesApi.deleteProductAttributeValue,
        onSuccess: (_, id) => {
            // Invalidate and refetch product attribute values
            queryClient.invalidateQueries(['productAttributeValues']);
            queryClient.invalidateQueries(['productAttributeValue', id]);
        },
    });
};

export const useDeleteProductAttributeValues = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: productAttributesApi.deleteProductAttributeValues,
        onSuccess: (_, productId) => {
            // Invalidate and refetch product attribute values
            queryClient.invalidateQueries(['productAttributeValues', productId]);
        },
    });
};

// Product Variants Hooks
export const useProductVariants = (productId) => {
    return useQuery({
        queryKey: ['productVariants', productId],
        queryFn: () => productAttributesApi.getProductVariants(productId),
        enabled: !!productId,
    });
};

export const useProductVariant = (id) => {
    return useQuery({
        queryKey: ['productVariant', id],
        queryFn: () => productAttributesApi.getProductVariant(id),
        enabled: !!id,
    });
};

export const useCreateProductVariant = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: productAttributesApi.createProductVariant,
        onSuccess: (data, variables) => {
            // Invalidate and refetch product variants
            queryClient.invalidateQueries(['productVariants', variables.productId]);
        },
    });
};

export const useUpdateProductVariant = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => productAttributesApi.updateProductVariant(id, data),
        onSuccess: (data, variables) => {
            // Invalidate and refetch product variants
            queryClient.invalidateQueries(['productVariants', data.productId]);
            queryClient.invalidateQueries(['productVariant', variables.id]);
        },
    });
};

export const useDeleteProductVariant = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: productAttributesApi.deleteProductVariant,
        onSuccess: (_, id) => {
            // Invalidate and refetch product variants
            queryClient.invalidateQueries(['productVariants']);
            queryClient.invalidateQueries(['productVariant', id]);
        },
    });
};

