import { useMutation } from '@tanstack/react-query';
import { resolveAccount, ResolveAccountPayload } from '@/services/banks';

export const useResolveAccountMutation = () => {
  return useMutation({
    mutationFn: (payload: ResolveAccountPayload) => resolveAccount(payload),
  });
};
