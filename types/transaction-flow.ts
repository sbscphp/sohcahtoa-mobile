export interface SavedAccount {
    id: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
    bankCode?: string;
    currency?: string;
}

export interface DomiciliaryAccount {
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    swiftCode?: string;
    routingNumber?: string;
    bankAddress?: string;
}

export interface PayoutMethodStepProps {
    control: any;
    setValue: (name: any, value: any, options?: any) => void;
    setPayoutSheetVisible: (visible: boolean) => void;
    savedAccounts: SavedAccount[];
    selectedSavedAccountId: string | null;
    setSelectedSavedAccountId: (id: string | null) => void;
    setIsAddingNewAccount: (visible: boolean) => void;
    transactionId?: string;
    isMultiSelect?: boolean;
    selectedSavedAccountIds?: string[];
    setSelectedSavedAccountIds?: (ids: string[]) => void;
    isExpatriate?: boolean;
    isSellFx?: boolean;
}

export interface RefundBankDetailsStepProps {
    savedAccounts: SavedAccount[];
    selectedSavedAccountId: string | null;
    setSelectedSavedAccountId: (id: string | null) => void;
    setValue: (name: any, value: any, options?: any) => void;
    setIsAddingNewAccount: (visible: boolean) => void;
    title?: string;
    description?: string;
    isDomiciliary?: boolean;
    domiciliaryAccount?: DomiciliaryAccount;
}
