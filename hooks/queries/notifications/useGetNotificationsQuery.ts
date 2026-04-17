import { useQuery } from '@tanstack/react-query';
import { getNotifications } from '../../../services/notifications';

export const useGetNotificationsQuery = () => {
    return useQuery({
        queryKey: ['notifications'],
        queryFn: getNotifications,
    });
};
