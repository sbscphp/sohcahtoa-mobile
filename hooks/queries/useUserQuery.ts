import { useQuery } from '@tanstack/react-query';
import { fetchUser } from '../../services/users';

// Custom Hook
export const useUserQuery = (userId: string) => {
    return useQuery({
        queryKey: ['user', userId],
        queryFn: () => fetchUser(userId),
        enabled: !!userId, // Only fetch if userId is present
        staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
    });
};
