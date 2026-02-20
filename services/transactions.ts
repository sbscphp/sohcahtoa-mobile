import { CalculateExchangeRatePayload, CalculateExchangeRateResponse, CreateTransactionPayload, CreateTransactionResponse, ExportTransactionsParams, GetExchangeRatesParams, GetExchangeRatesResponse, GetPickupPointsResponse, GetTransactionByIdResponse, GetTransactionsParams, GetTransactionsResponse, UploadTransactionDocumentPayload, UploadTransactionDocumentResponse } from '@/types/api/transactions';
import api from './api';

export const createTransaction = async (payload: CreateTransactionPayload): Promise<CreateTransactionResponse> => {
    const response = await api.post('/customer/transactions', payload);
    return response.data;
};

export const getTransactions = async (params?: GetTransactionsParams): Promise<GetTransactionsResponse> => {
    const response = await api.get('/customer/transactions', { params });
    return response.data;
};

export const exportTransactions = async (params?: ExportTransactionsParams): Promise<Blob> => {
    const response = await api.get('/customer/transactions/export', {
        params,
        responseType: 'blob'
    });
    return response.data;
};

export const uploadTransactionDocument = async (payload: UploadTransactionDocumentPayload): Promise<UploadTransactionDocumentResponse> => {
    const { transactionId, ...rest } = payload;
    const response = await api.post(`/customer/transactions/${transactionId}/documents`, rest);
    return response.data;
};

export const getExchangeRates = async (params?: GetExchangeRatesParams): Promise<GetExchangeRatesResponse> => {
    const response = await api.get('/customer/transactions/rates', { params });
    return response.data;
};

export const calculateExchangeRate = async (payload: CalculateExchangeRatePayload): Promise<CalculateExchangeRateResponse> => {
    const response = await api.post('/customer/transactions/rates/calculate', payload);
    return response.data;
};

export const getPickupPoints = async (): Promise<GetPickupPointsResponse> => {
    const response = await api.get('/customer/transactions/pickup-points');
    return response.data;
};

export const getTransactionById = async (transactionId: string): Promise<GetTransactionByIdResponse> => {
    const response = await api.get(`/customer/transactions/${transactionId}`);
    return response.data;
};
