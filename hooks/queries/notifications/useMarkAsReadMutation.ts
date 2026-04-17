import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markAsRead } from '../../../services/notifications';

export const useMarkAsReadMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
};
