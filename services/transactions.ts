import { CalculateExchangeRatePayload, CalculateExchangeRateResponse, CreateTransactionPayload, CreateTransactionResponse, ExportTransactionsParams, GetExchangeRatesParams, GetExchangeRatesResponse, GetPickupPointsResponse, GetPickupStatesResponse, GetPickupCitiesResponse, GetTransactionByIdResponse, GetTransactionsParams, GetTransactionsResponse, GetTransactionTotalsPayload, GetTransactionTotalsResponse, UploadTransactionDocumentPayload, UploadTransactionDocumentResponse } from '@/types/api/transactions';
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
    const formData = new FormData();
    formData.append('document', payload.document);
    formData.append('userId', payload.userId);
    formData.append('documentType', payload.documentType);
    if (payload.transactionId) {
        formData.append('transactionId', payload.transactionId);
    }
    if (payload.metadata) {
        formData.append('metadata', payload.metadata);
    }

    const response = await api.post('/documents/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
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

export const getPickupStates = async (): Promise<GetPickupStatesResponse> => {
    const response = await api.get('/customer/transactions/pickup-locations/states');
    return response.data;
};

export const getPickupCities = async (state: string): Promise<GetPickupCitiesResponse> => {
    const response = await api.get('/customer/transactions/pickup-locations/cities', {
        params: { state }
    });
    return response.data;
};

export const getTransactionTotals = async (payload: GetTransactionTotalsPayload): Promise<GetTransactionTotalsResponse> => {
    const response = await api.post('/customer/transactions/totals', payload);
    return response.data;
};
