import { CreateTransactionPayload, CreateTransactionResponse, GetTransactionsParams, GetTransactionsResponse } from '@/types/api/transactions';
import api from './api';

export const createTransaction = async (payload: CreateTransactionPayload): Promise<CreateTransactionResponse> => {
    const response = await api.post('/customer/transactions', payload);
    return response.data;
};

export const getTransactions = async (params?: GetTransactionsParams): Promise<GetTransactionsResponse> => {
    const response = await api.get('/customer/transactions', { params });
    return response.data;
};
