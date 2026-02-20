export interface CreateTransactionPayload {
    type: string;
    currency: string;
    amount: number;
    purpose: string;
    destinationCountry: string;
    bvn: string;
    nin: string;
    formAId?: string;
    admissionType?: string;
    beneficiaryDetails?: {
        name: string;
        accountNumber: string;
        accountName: string;
        bankName: string;
        iban: string;
    };
    documents: {
        documentType: string;
        fileUrl: string;
        fileName: string;
        fileSize: number;
    }[];
    pickupLocation?: {
        id: string;
        name: string;
        address: string;
        recipientName: string;
        recipientPhone: string;
    };
}

export interface CreateTransactionResponse {
    success: boolean;
    data: {
        transactionId: string;
        referenceNumber: string;
        status: string;
        currentStep: string;
        requiredDocuments: {
            type: string;
            uploaded?: {
                id: string;
                fileName: string;
                fileUrl: string;
                status: string;
                rejectionNotes?: string;
                uploadedAt: string;
                verifiedAt?: string;
            };
        }[];
        message: string;
    };
}

export interface GetTransactionsParams {
    q?: string;
    status?: string;
    type?: string;
    group?: string;
    currency?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}

export interface TransactionDocument {
    id: string;
    documentType: string;
    verificationStatus: string;
    uploadedAt: string;
}

export interface TransactionCashPickup {
    pickupLocation: string;
    status: string;
}

export interface Transaction {
    id: string;
    referenceNumber: string;
    group: string;
    type: string;
    status: string;
    currentStep: string;
    purpose: string;
    destinationCountry: string;
    currency: string;
    foreignAmount: number;
    nairaEquivalent: number;
    exchangeRate: number;
    disbursementMethod: string;
    createdAt: string;
    updatedAt: string;
    completedAt: string | null;
    rejectedAt: string | null;
    rejectionReason: string | null;
    documents: TransactionDocument[];
    cashPickup: TransactionCashPickup | null;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface GetTransactionsResponse {
    success: boolean;
    data: Transaction[];
    pagination: PaginationMeta;
}
