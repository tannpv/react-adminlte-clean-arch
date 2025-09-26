import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { attributeValuesApi } from '../api/attributesApi';

export const useAttributeValues = () => {
    return useQuery({
        queryKey: ['attribute-values'],
        queryFn: attributeValuesApi.getAll,
        select: (response) => response.data,
    });
};

export const useAttributeValuesByAttribute = (attributeId) => {
    return useQuery({
        queryKey: ['attribute-values', 'by-attribute', attributeId],
        queryFn: () => attributeValuesApi.getByAttributeId(attributeId),
        select: (response) => response.data,
        enabled: !!attributeId,
    });
};

export const useAttributeValue = (id) => {
    return useQuery({
        queryKey: ['attribute-values', id],
        queryFn: () => attributeValuesApi.getById(id),
        select: (response) => response.data,
        enabled: !!id,
    });
};

export const useCreateAttributeValue = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: attributeValuesApi.create,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['attribute-values'] });
            queryClient.invalidateQueries({
                queryKey: ['attribute-values', 'by-attribute', variables.attributeId]
            });
        },
    });
};

export const useUpdateAttributeValue = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => attributeValuesApi.update(id, data),
        onSuccess: (_, { id, data }) => {
            queryClient.invalidateQueries({ queryKey: ['attribute-values'] });
            queryClient.invalidateQueries({ queryKey: ['attribute-values', id] });
            // Invalidate by-attribute query if we have the attributeId
            if (data.attributeId) {
                queryClient.invalidateQueries({
                    queryKey: ['attribute-values', 'by-attribute', data.attributeId]
                });
            }
        },
    });
};

export const useDeleteAttributeValue = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: attributeValuesApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attribute-values'] });
        },
    });
};
