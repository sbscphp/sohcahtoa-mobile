import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markAllAsRead } from '../../../services/notifications';

export const useMarkAllAsReadMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: markAllAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
};
