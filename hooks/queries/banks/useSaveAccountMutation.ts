import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveAccount, SaveAccountPayload } from '@/services/banks';
import { useToastStore } from '@/stores/useToastStore';

export const useSaveAccountMutation = () => {
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.showToast);

  return useMutation({
    mutationFn: (payload: SaveAccountPayload) => saveAccount(payload),
    onSuccess: () => {
      // Invalidate saved accounts so the list refreshes across all screens
      queryClient.invalidateQueries({ queryKey: ['savedBankAccounts'] });
    },
    onError: () => {
      showToast('Failed to save bank account. Please try again.', 'error');
    },
  });
};
