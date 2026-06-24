import { create } from 'zustand';
import { UploadedFile, UploadedMetadata } from '@/hooks/useDocumentUpload';

interface ProofOfFundsItem {
    file: UploadedFile;
    metadata: UploadedMetadata;
}

interface DeclarationStore {
    proofOfFunds: ProofOfFundsItem[];
    declarationMethod: 'initials' | 'signature' | null;
    initials: string;
    isDeclarationCompleted: boolean;
    setProofOfFunds: (files: ProofOfFundsItem[]) => void;
    setDeclarationCompleted: (completed: boolean, method: 'initials' | 'signature', initialsText?: string) => void;
    reset: () => void;
}

export const useDeclarationStore = create<DeclarationStore>((set) => ({
    proofOfFunds: [],
    declarationMethod: null,
    initials: '',
    isDeclarationCompleted: false,
    setProofOfFunds: (proofOfFunds) => set({ proofOfFunds }),
    setDeclarationCompleted: (completed, method, initialsText = '') => set({
        isDeclarationCompleted: completed,
        declarationMethod: method,
        initials: initialsText,
    }),
    reset: () => set({
        proofOfFunds: [],
        declarationMethod: null,
        initials: '',
        isDeclarationCompleted: false,
    }),
}));
