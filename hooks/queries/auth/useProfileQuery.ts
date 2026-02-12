import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getUserProfile } from '../../../services/auth';
import { useAuthStore } from '../../../stores/useAuthStore';

export const useProfileQuery = () => {
    const setUser = useAuthStore((state) => state.setUser);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    const query = useQuery({
        queryKey: ['userProfile'],
        queryFn: getUserProfile,
        enabled: isAuthenticated,
        select: (response) => response.data.user, // Isolate the user object
    });

    const user = query.data;

    useEffect(() => {
        if (query.isSuccess && user) {
            setUser(user);
        }
    }, [query.isSuccess, user, setUser]);

    return query;
};


