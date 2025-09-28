import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { attributesApi } from '../api/attributesApi';

export const useAttributes = () => {
    return useQuery({
        queryKey: ['attributes'],
        queryFn: attributesApi.getAll,
        select: (response) => response.data,
    });
};

export const useAttribute = (id) => {
    return useQuery({
        queryKey: ['attributes', id],
        queryFn: () => attributesApi.getById(id),
        select: (response) => response.data,
        enabled: !!id,
    });
};

export const useCreateAttribute = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: attributesApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attributes'] });
        },
    });
};

export const useUpdateAttribute = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => attributesApi.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['attributes'] });
            queryClient.invalidateQueries({ queryKey: ['attributes', id] });
        },
    });
};

export const useDeleteAttribute = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: attributesApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attributes'] });
        },
    });
};
