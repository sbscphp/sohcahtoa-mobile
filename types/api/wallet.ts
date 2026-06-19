export interface WalletLedgerData {
    id: string;
    balance: number;
    currency: string;
}

export interface WalletLedgerEntry {
    id: string;
    type: 'CREDIT' | 'DEBIT';
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    description: string;
    status: string;
    transactionRef: string;
    transactionId: string | null;
    sessionId: string | null;
    createdAt: string;
}

export interface WalletLedgerMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface WalletLedgerResponse {
    success: boolean;
    data: WalletLedgerData;
    entries: WalletLedgerEntry[];
    meta: WalletLedgerMeta;
}

export interface WalletLedgerParams {
    page?: number;
    limit?: number;
}
