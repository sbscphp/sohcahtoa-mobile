import { useMutation } from '@tanstack/react-query';
import { lookupAccount, LookupAccountParams } from '@/services/banks';

export const useLookupAccountMutation = () => {
  return useMutation({
    mutationFn: (params: LookupAccountParams) => lookupAccount(params),
  });
};
