import api from './api';

export interface Bank {
  code: string;
  name: string;
}

export interface SavedBankAccount {
  id: string;
  userId: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  bankCode?: string;
  swiftCode?: string;
  routingNumber?: string;
  bankAddress?: string;
  currency?: string;
  isVerified: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetBanksParams {
  q?: string;
}

export interface GetBanksResponse {
  success: boolean;
  data: Bank[];
}

export interface LookupAccountParams {
  bankName: string;
  accountNumber: string;
}

export interface LookupAccountResponse {
  success: boolean;
  data: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    simulated?: boolean;
  };
}

export const getBanks = async (params?: GetBanksParams): Promise<GetBanksResponse> => {
  const response = await api.get('/customer/bank-accounts/banks', { params });
  return response.data;
};

export const lookupAccount = async (params: LookupAccountParams): Promise<LookupAccountResponse> => {
  const response = await api.get('/customer/bank-accounts/lookup', { params });
  return response.data;
};

export interface GetSavedAccountsResponse {
  success: boolean;
  data: SavedBankAccount[];
}

export interface SaveAccountPayload {
  bankName: string;
  accountNumber: string;
  accountName: string;
  swiftCode?: string;
  routingNumber?: string;
  bankAddress?: string;
  currency?: string;
}

export interface SaveAccountResponse {
  success: boolean;
  data: SavedBankAccount;
}

export const getSavedAccounts = async (): Promise<GetSavedAccountsResponse> => {
  const response = await api.get('/customer/bank-accounts');
  return response.data;
};

export const saveAccount = async (payload: SaveAccountPayload): Promise<SaveAccountResponse> => {
  const response = await api.post('/customer/bank-accounts', payload);
  return response.data;
};

export interface SetDefaultBankAccountResponse {
  success: boolean;
  data: SavedBankAccount;
}

export const setDefaultBankAccount = async (bankAccountId: string): Promise<SetDefaultBankAccountResponse> => {
  const response = await api.patch(`/customer/bank-accounts/${bankAccountId}/default`);
  return response.data;
};

export interface DeleteBankAccountResponse {
  success: boolean;
  message?: string;
}

export const deleteBankAccount = async (bankAccountId: string): Promise<DeleteBankAccountResponse> => {
  const response = await api.delete(`/customer/bank-accounts/${bankAccountId}`);
  return response.data;
};
