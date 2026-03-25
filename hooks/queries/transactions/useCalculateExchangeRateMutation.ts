import { useToastStore } from '@/stores/useToastStore';
import { useMutation } from '@tanstack/react-query';
import { calculateExchangeRate } from '../../../services/transactions';
import { CalculateExchangeRatePayload, CalculateExchangeRateResponse } from '../../../types/api/transactions';

export const useCalculateExchangeRateMutation = () => {
    const showToast = useToastStore((state) => state.showToast);

    return useMutation<CalculateExchangeRateResponse, any, CalculateExchangeRatePayload>({
        mutationFn: calculateExchangeRate,
        onSuccess: (response: CalculateExchangeRateResponse) => {
            if (response.success && response.data) {
                // Not showing toast by default here as this might be called frequently on input change
                // But logging it for debugging
                console.log(response, "calculate exchange rate response");
            }
        },
        onError: (error: any) => {
            const message = error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Failed to calculate exchange rate';
            showToast(message, 'error');
            console.log(error, "error");
        },
    });
};
