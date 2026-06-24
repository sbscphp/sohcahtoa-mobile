import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteBankAccount, DeleteBankAccountResponse } from '@/services/banks';
import { useToastStore } from '@/stores/useToastStore';

export const useDeleteBankAccountMutation = () => {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);

  return useMutation<DeleteBankAccountResponse, any, string>({
    mutationFn: (bankAccountId: string) => deleteBankAccount(bankAccountId),
    onSuccess: (response: DeleteBankAccountResponse) => {
      if (response.success) {
        showToast(response.message || 'Bank account deleted successfully.', 'success');
      }
      // Invalidate saved accounts so the list refreshes across all screens
      queryClient.invalidateQueries({ queryKey: ['savedBankAccounts'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Failed to delete bank account. Please try again.';
      showToast(message, 'error');
    },
  });
};
