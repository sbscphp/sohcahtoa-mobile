import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markAsRead } from '../../../services/notifications';
import { GetUnreadCountResponse } from '../../../types/api/notifications';

export const useMarkAsReadMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: markAsRead,
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['notifications', 'unread-count'] });
            const previous = queryClient.getQueryData<GetUnreadCountResponse>(['notifications', 'unread-count']);
            if (previous?.data?.count && previous.data.count > 0) {
                queryClient.setQueryData<GetUnreadCountResponse>(['notifications', 'unread-count'], {
                    ...previous,
                    data: { count: Math.max(0, previous.data.count - 1) },
                });
            }
            return { previous };
        },
        onError: (_err, _id, context) => {
            if (context?.previous) {
                queryClient.setQueryData(['notifications', 'unread-count'], context.previous);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
};
