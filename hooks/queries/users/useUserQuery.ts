import { useQuery } from '@tanstack/react-query';
import { fetchUser } from '../../../services/users';

// Custom Hook
export const useUserQuery = (userId: string) => {
    return useQuery({
        queryKey: ['user', userId],
        queryFn: () => fetchUser(userId),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5, 
    });
};
