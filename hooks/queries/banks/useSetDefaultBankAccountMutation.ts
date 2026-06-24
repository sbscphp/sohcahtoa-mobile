import { useMutation, useQueryClient } from '@tanstack/react-query';
import { setDefaultBankAccount, SetDefaultBankAccountResponse } from '@/services/banks';
import { useToastStore } from '@/stores/useToastStore';

export const useSetDefaultBankAccountMutation = () => {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);

  return useMutation<SetDefaultBankAccountResponse, any, string>({
    mutationFn: (bankAccountId: string) => setDefaultBankAccount(bankAccountId),
    onSuccess: (response: SetDefaultBankAccountResponse) => {
      if (response.success) {
        showToast('Bank account set as default successfully.', 'success');
      }
      // Invalidate saved accounts so the list refreshes across all screens
      queryClient.invalidateQueries({ queryKey: ['savedBankAccounts'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to set bank account as default. Please try again.';
      showToast(message, 'error');
    },
  });
};
