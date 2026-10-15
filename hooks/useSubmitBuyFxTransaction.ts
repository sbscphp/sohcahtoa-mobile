import { useRouter } from 'expo-router';

interface UseSubmitBuyFxTransactionParams {
    createTransaction: any;
    attachBankAccountsMutation: any;
    selectedSavedAccountId: string | null;
    setInitiateSheetVisible: (visible: boolean) => void;
    successRoute: string;
    showToast: (message: string, type: 'success' | 'error' | 'warning') => void;
}

export function useSubmitBuyFxTransaction({
    createTransaction,
    attachBankAccountsMutation,
    selectedSavedAccountId,
    setInitiateSheetVisible,
    successRoute,
    showToast,
}: UseSubmitBuyFxTransactionParams) {
    const router = useRouter();

    const submitTransaction = (payload: any) => {
        createTransaction.mutate(payload, {
            onSuccess: (response: any) => {
                if (response.success) {
                    const transactionId = response.data?.transactionId;
                    if (selectedSavedAccountId && transactionId) {
                        attachBankAccountsMutation.mutate({
                            transactionId,
                            bankAccountIds: [selectedSavedAccountId],
                        });
                    }
                    setInitiateSheetVisible(false);
                    router.push({
                        pathname: successRoute as any,
                        params: { transactionId },
                    });
                }
            },
            onError: (error: any) => {
                showToast(error?.response?.data?.message || 'Failed to initiate transaction', 'error');
            },
        });
    };

    return { submitTransaction };
}
