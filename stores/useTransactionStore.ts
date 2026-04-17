import { LocationItem } from '@/utils/locations';
import { create } from 'zustand';

interface CurrencyData {
    code: string;
    country: string;
    currencyName: string;
    flagUrl: string;
}

interface TransactionStore {
    ptaData: {
        // Step 0: Credentials
        bvn: string;
        nin: string;
        formAId: string;
        passportNumber: string;

        // Step 1: Documents
        visaFile: any;
        visaNumber: string;
        visaMetadata?: {
            documentType: string;
            fileUrl: string;
            fileName: string;
            fileSize: number;
        };
        ticketFile: any;
        ticketNumber: string;
        ticketMetadata?: {
            documentType: string;
            fileUrl: string;
            fileName: string;
            fileSize: number;
        };
        visaUploadResponse?: any;
        ticketUploadResponse?: any;

        // Step 2: Exchange
        transactionType: 'buy' | 'sell';
        currencyGet: CurrencyData;
        currencySend: CurrencyData;
        amountGet: string;
        amountSend: string;

        // Step 3: Location
        selectedState: LocationItem | null;
        selectedCity: LocationItem | null;
        selectedLocation: LocationItem | null;
        pickupDate: string;
        pickupTime: string;

        // Meta
        transactionId?: string;
        currentRate: number;
    };
    setPtaData: (data: Partial<TransactionStore['ptaData']>) => void;
    resetPtaData: () => void;
}

export const useTransactionStore = create<TransactionStore>((set) => ({
    ptaData: {
        bvn: '',
        nin: '',
        formAId: '',
        passportNumber: '',
        visaFile: null,
        visaNumber: '',
        ticketFile: null,
        ticketNumber: '',
        transactionType: 'buy',
        currencyGet: {
            code: 'USD',
            country: 'United States',
            currencyName: 'Dollar',
            flagUrl: 'https://flagcdn.com/w80/us.png'
        },
        currencySend: {
            code: 'NGN',
            country: 'Nigeria',
            currencyName: 'Naira',
            flagUrl: 'https://flagcdn.com/w80/ng.png'
        },
        amountGet: '1',
        amountSend: '1,500',
        selectedState: null,
        selectedCity: null,
        selectedLocation: null,
        pickupDate: '',
        pickupTime: '',
        currentRate: 1500,
    },
    setPtaData: (data) => set((state) => ({
        ptaData: { ...state.ptaData, ...data }
    })),
    resetPtaData: () => set({
        ptaData: {
            bvn: '',
            nin: '',
            formAId: '',
            passportNumber: '',
            visaFile: null,
            visaNumber: '',
            ticketFile: null,
            ticketNumber: '',
            transactionType: 'buy',
            currencyGet: {
                code: 'USD',
                country: 'United States',
                currencyName: 'Dollar',
                flagUrl: 'https://flagcdn.com/w80/us.png'
            },
            currencySend: {
                code: 'NGN',
                country: 'Nigeria',
                currencyName: 'Naira',
                flagUrl: 'https://flagcdn.com/w80/ng.png'
            },
            amountGet: '1',
            amountSend: '1,500',
            selectedState: null,
            selectedCity: null,
            selectedLocation: null,
            pickupDate: '',
            pickupTime: '',
            currentRate: 1500,
        }
    }),
}));
