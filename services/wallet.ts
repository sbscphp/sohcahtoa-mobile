import { WalletLedgerParams, WalletLedgerResponse } from '@/types/api/wallet';
import api from './api';

export const getWalletLedger = async (params?: WalletLedgerParams): Promise<WalletLedgerResponse> => {
    const response = await api.get('/customer/wallet/ledger', { params });
    return response.data;
};
