import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { attributeSetsApi } from '../api/attributesApi';

export const useAttributeSets = () => {
    return useQuery({
        queryKey: ['attribute-sets'],
        queryFn: attributeSetsApi.getAll,
        select: (response) => response.data,
    });
};

export const useAttributeSet = (id) => {
    return useQuery({
        queryKey: ['attribute-sets', id],
        queryFn: () => attributeSetsApi.getById(id),
        select: (response) => response.data,
        enabled: !!id,
    });
};

export const useAttributeSetByName = (name) => {
    return useQuery({
        queryKey: ['attribute-sets', 'by-name', name],
        queryFn: () => attributeSetsApi.getByName(name),
        select: (response) => response.data,
        enabled: !!name,
    });
};

export const useCreateAttributeSet = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: attributeSetsApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attribute-sets'] });
        },
    });
};

export const useUpdateAttributeSet = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => attributeSetsApi.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['attribute-sets'] });
            queryClient.invalidateQueries({ queryKey: ['attribute-sets', id] });
        },
    });
};

export const useDeleteAttributeSet = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: attributeSetsApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attribute-sets'] });
        },
    });
};

export const useAddAttributeToSet = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ setId, attributeId, data }) => {
            console.log('Adding attribute to set:', { setId, attributeId, data });
            return attributeSetsApi.addAttribute(setId, attributeId, data);
        },
        onSuccess: (_, variables) => {
            console.log('Successfully added attribute to set:', variables);
            queryClient.invalidateQueries({ queryKey: ['attribute-sets'] });
            queryClient.invalidateQueries({ queryKey: ['attribute-sets', variables.setId] });
        },
        onError: (error, variables) => {
            console.error('Error adding attribute to set:', error, variables);
        },
    });
};

export const useRemoveAttributeFromSet = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ setId, attributeId }) => {
            console.log('Removing attribute from set:', { setId, attributeId });
            return attributeSetsApi.removeAttribute(setId, attributeId);
        },
        onSuccess: (_, variables) => {
            console.log('Successfully removed attribute from set:', variables);
            queryClient.invalidateQueries({ queryKey: ['attribute-sets'] });
            queryClient.invalidateQueries({ queryKey: ['attribute-sets', variables.setId] });
        },
        onError: (error, variables) => {
            console.error('Error removing attribute from set:', error, variables);
        },
    });
};
