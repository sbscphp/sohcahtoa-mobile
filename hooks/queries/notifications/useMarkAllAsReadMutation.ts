import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markAllAsRead } from '../../../services/notifications';
import { GetUnreadCountResponse } from '../../../types/api/notifications';

export const useMarkAllAsReadMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: markAllAsRead,
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['notifications', 'unread-count'] });
            const previous = queryClient.getQueryData<GetUnreadCountResponse>(['notifications', 'unread-count']);
            queryClient.setQueryData<GetUnreadCountResponse>(['notifications', 'unread-count'], {
                success: true,
                data: { count: 0 },
            });
            return { previous };
        },
        onError: (_err, _variables, context) => {
            if (context?.previous) {
                queryClient.setQueryData(['notifications', 'unread-count'], context.previous);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
};
