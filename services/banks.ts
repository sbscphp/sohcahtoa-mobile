import api from './api';

export interface Bank {
  id: string;
  name: string;
  code: string;
}

export interface ResolveAccountPayload {
  accountNumber: string;
  bankCode: string;
}

export interface ResolveAccountResponse {
  success: boolean;
  data: {
    accountName: string;
    accountNumber: string;
    bankCode: string;
  };
}

export const getBanks = async (): Promise<{ success: boolean; data: Bank[] }> => {
  const response = await api.get('/banks');
  return response.data;
};

export const resolveAccount = async (payload: ResolveAccountPayload): Promise<ResolveAccountResponse> => {
  const response = await api.post('/banks/resolve', payload);
  return response.data;
};
