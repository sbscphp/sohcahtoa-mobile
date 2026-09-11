export interface CreateTransactionPayload {
    type: string;
    currency: string;
    amount: number;
    purpose: string;
    destinationCountry: string;
    bvn?: string;
    nin?: string;
    formAId?: string;
    admissionType?: string;
    passportDocumentNumber?: string;
    passportIssueDate?: string;
    passportExpiryDate?: string;
    identificationNumber?: string;
    visaNumber?: string;
    ticketNumber?: string;
    beneficiaryDetails?: {
        name?: string;
        accountNumber?: string;
        accountName?: string;
        bankName?: string;
        iban?: string;
        address?: string;
        swiftCode?: string;
        studentName?: string;
        studentPassportNumber?: string;
        bankAccountName?: string;
        bankAccountAddress?: string;
        bankAccountIban?: string;
        bankAccountSwiftCode?: string;
        bankAccountNumber?: string;
        correspondenceBankName?: string;
        correspondenceBankAddress?: string;
        correspondenceBankSwiftCode?: string;
        routingNumber?: string;
        bankAddress?: string;
    };
    documents: {
        documentType: string;
        fileUrl: string;
        fileName: string;
        fileSize: number;
    }[];
    pickupLocation?: {
        id?: string;
        locationId?: string;
        name: string;
        address: string;
        state?: string;
        city?: string;
        phoneNumber?: string;
        recipientPhone?: string;
        recipientName?: string;
        email?: string;
        recipientEmail?: string;
        scheduledPickupDate?: string;
        scheduledPickupTime?: string;
        date?: string;
        time?: string;
        amount?: number;
        currency?: string;
    };
    paymentDetails?: {
        bankName?: string;
        bankCode?: string;
        accountNumber?: string;
        accountName?: string;
    };
    bankDetails?: {
        bankName?: string;
        bankCode?: string;
        accountNumber?: string;
        accountName?: string;
    };
    refundBankDetails?: {
        bankName?: string;
        bankCode?: string;
        accountNumber?: string;
        accountName?: string;
        swiftCode?: string;
        routingNumber?: string;
        bankAddress?: string;
    };
    digitalSignature?: string;
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

export type ExportTransactionsParams = Omit<GetTransactionsParams, 'page' | 'limit'>;

export interface TransactionDocument {
    id: string;
    documentType: string;
    verificationStatus: string;
    uploadedAt: string;
}

export interface TransactionCashPickup {
    pickupLocation: string;
    status: string;
    scheduledPickupDate?: string;
    scheduledPickupTime?: string;
    pickupCity?: string;
    pickupState?: string;
    address?: string;
    amount?: number;
    currency?: string;
    pickupCode?: string;
    recipientPhone?: string;
    expiryDate?: string;
    schedulePickupDate?: string;
    schedulePickupTime?: string;
}

export interface TransactionComment {
    id: string;
    action: string;
    message: string;
    addedBy: string;
    createdAt: string;
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
    formAId?: string;
    taxClearanceNumber?: string;
    personalInfo?: {
        bvn?: string;
        nin?: string;
        admissionType?: string;
        tinNumber?: string;
        passportDocumentNumber?: string;
        passportIssueDate?: string;
        passportExpiryDate?: string;
    };
    createdAt: string;
    updatedAt: string;
    completedAt: string | null;
    rejectedAt: string | null;
    rejectionReason: string | null;
    beneficiaryDetails?: {
        name: string;
        accountNumber: string;
        accountName: string;
        bankName: string;
        iban: string;
        address?: string;
        bankAddress?: string;
        routingNumber?: string;
        swiftCode?: string;
        studentName?: string;
        studentPassportNumber?: string;
        bankAccountName?: string;
        bankAccountAddress?: string;
        bankAccountIban?: string;
        bankAccountSwiftCode?: string;
        bankAccountNumber?: string;
        correspondenceBankName?: string;
        correspondenceBankAddress?: string;
        correspondenceBankSwiftCode?: string;
    };
    paymentDetails?: {
        name: string;
        accountNumber: string;
        accountName: string;
        bankName: string;
        iban: string;
    };
    refundBankDetails?: {
        name?: string;
        accountNumber?: string;
        accountName?: string;
        bankName?: string;
        bankCode?: string;
        iban?: string;
        swiftCode?: string;
        routingNumber?: string;
        bankAddress?: string;
    };
    documents: TransactionDocument[];
    cashPickup: TransactionCashPickup | null;
    comments?: TransactionComment[];
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

export type TransactionDocumentType =
    | 'PASSPORT'
    | 'VISA'
    | 'RETURN_TICKET'
    | 'BVN'
    | 'NIN'
    | 'TIN'
    | 'FORM_A_DOCUMENT'
    | 'CORPORATE_BODY_LETTER'
    | 'PARTNER_INVITATION_LETTER'
    | 'SCHOOL_ADMISSION'
    | 'MEDICAL_LETTER'
    | 'OVERSEAS_MEDICAL_LETTER'
    | 'PROFESSIONAL_BODY_LETTER'
    | 'MEMBERSHIP_CARD'
    | 'INVOICE'
    | 'RECEIPT';

export interface UploadTransactionDocumentPayload {
    userId: string;
    transactionId?: string;
    documentType: TransactionDocumentType | string;
    document: any; // This will be the file for FormData
    metadata?: string;
}

export interface UploadTransactionDocumentResponse {
    success: boolean;
    message: string;
    data: {
        id: string;
        documentType: string;
        fileUrl: string;
        fileName: string;
        fileSize: number;
        verificationStatus: string;
        uploadedAt: string;
        metadata: any;
    };
}

export interface GetExchangeRatesParams {
    fromCurrency?: string;
    toCurrency?: string;
}

export interface ExchangeRate {
    id: string;
    fromCurrency: string;
    toCurrency: string;
    rate: number;
    buyRate: number;
    sellRate: number;
    isActive: boolean;
    updatedAt: string;
}

export interface GetExchangeRatesResponse {
    success: boolean;
    data: ExchangeRate[];
}

export interface CalculateExchangeRatePayload {
    fromCurrency: string;
    toCurrency: string;
    amount: number;
    mode?: 'buy' | 'sell';
}

export interface CalculateExchangeRateResponse {
    success: boolean;
    data: {
        fromCurrency: string;
        toCurrency: string;
        amount: number;
        sellRate: number;
        buyRate: number;
        convertedAmount: number;
        rateValidUntil: string;
    };
}

export interface PickupPoint {
    id: string;
    name: string;
    location: string;
    address: string;
    branch: string;
}

export interface GetPickupPointsResponse {
    success: boolean;
    data: PickupPoint[];
}

export interface GetTransactionByIdResponse {
    success: boolean;
    data: {
        transactionId: string;
        referenceNumber: string;
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
        formAId?: string;
        taxClearanceNumber?: string;
        personalInfo?: {
            bvn?: string;
            nin?: string;
            admissionType?: string;
            tinNumber?: string;
            passportDocumentNumber?: string;
            passportIssueDate?: string;
            passportExpiryDate?: string;
        };
        rejection?: {
            reason: string;
            rejectedAt: string;
        };
        requiredDocuments: {
            type: string;
            required?: boolean;
            uploaded?: {
                id: string;
                fileName: string;
                fileUrl: string | null;
                status: string;
                rejectionNotes?: string | null;
                uploadedAt: string;
                verifiedAt?: string | null;
                signed?: boolean;
                signatureText?: string | null;
                note?: string | null;
            };
            uploads?: {
                id: string;
                fileName: string;
                fileUrl: string | null;
                status: string;
                rejectionNotes?: string | null;
                uploadedAt: string;
                verifiedAt?: string | null;
                signed?: boolean;
                signatureText?: string | null;
                note?: string | null;
            }[];
        }[];
        beneficiaryDetails?: {
            name: string;
            accountName: string;
            accountNumber: string;
            bankName: string;
            iban: string;
            address?: string;
            bankAddress?: string;
            routingNumber?: string;
            swiftCode?: string;
            studentName?: string;
            studentPassportNumber?: string;
            bankAccountName?: string;
            bankAccountAddress?: string;
            bankAccountIban?: string;
            bankAccountSwiftCode?: string;
            bankAccountNumber?: string;
            correspondenceBankName?: string;
            correspondenceBankAddress?: string;
            correspondenceBankSwiftCode?: string;
        };
        paymentDetails?: {
            name: string;
            accountName: string;
            accountNumber: string;
            bankName: string;
            iban: string;
        };
        refundBankDetails?: {
            name?: string;
            accountNumber?: string;
            accountName?: string;
            bankName?: string;
            bankCode?: string;
            iban?: string;
            swiftCode?: string;
            routingNumber?: string;
            bankAddress?: string;
        };
        pickupLocation?: {
            amount?: number;
            currency?: string;
            name?: string;
            address?: string;
        };
        cashPickup?: any;
        prepaidCard?: any;
        steps?: any[];
        comments?: TransactionComment[];
        createdAt: string;
        updatedAt: string;
    };
}

export interface GetPickupStatesResponse {
    success: boolean;
    data: {
        states: string[];
    };
}

export interface GetPickupCitiesResponse {
    success: boolean;
    data: {
        cities: string[];
    };
}

export interface CustomRate {
    currency: string;
    rate: number;
}

export interface GetTransactionTotalsPayload {
    currency?: string;
    customRates?: CustomRate[];
}

export interface TransactionGroupTotal {
    totalAmount: number;
    currency: string;
    transactionCount: number;
}

export interface GetTransactionTotalsResponse {
    success: boolean;
    data: {
        all: TransactionGroupTotal;
        buy: TransactionGroupTotal;
        sell: TransactionGroupTotal;
        remittance: TransactionGroupTotal;
    };
}

export interface AttachBankAccountsPayload {
    transactionId: string;
    bankAccountIds: string[];
}

export interface AttachBankAccountsResponse {
    success: boolean;
    message?: string;
    data?: any;
}

export interface GetVirtualAccountResponse {
    success: boolean;
    message?: string;
    data: {
        accountNumber: string;
        bankName: string;
        accountName: string;
        expiryDate?: string;
        expiresAt?: string;
    };
}

export interface DepositInstructionsData {
    accountNumber: string;
    accountName: string;
    bankName: string;
    amount: number;
    baseAmount: number;
    feeAmount: number;
    currency: string;
    expiresAt: string;
    instructions: string[];
    warningNote: string;
}

export interface GetDepositInstructionsResponse {
    success: boolean;
    data: DepositInstructionsData;
}

export interface ReuploadTransactionDocumentPayload {
    transactionId: string;
    documentType: string;
    document: {
        uri: string;
        name: string;
        type: string;
    };
}

export interface GetTransactionReceiptResponse {
    success: boolean;
    data?: {
        receiptUrl?: string;
        url?: string;
        fileUrl?: string;
        downloadUrl?: string;
        [key: string]: any;
    };
    message?: string;
}

