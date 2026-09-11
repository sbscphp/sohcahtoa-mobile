import ControlledDatePicker from '@/components/ControlledDatePicker';
import ControlledInput from '@/components/ControlledInput';
import GenericSelectionSheet, { SelectionItem } from '@/components/GenericSelectionSheet';
import InitiateTransactionSheet from '@/components/InitiateTransactionSheet';
import LoadingBackdrop from '@/components/LoadingBackdrop';
import AddNewAccountStep from '@/components/transaction-flow/AddNewAccountStep';
import CredentialStep from '@/components/transaction-flow/CredentialStep';
import DocumentStep from '@/components/transaction-flow/DocumentStep';
import ExchangeStep from '@/components/transaction-flow/ExchangeStep';
import LocationStep from '@/components/transaction-flow/LocationStep';
import PayoutMethodStep from '@/components/transaction-flow/PayoutMethodStep';
import TransactionLayout from '@/components/transaction-flow/TransactionLayout';
import RefundBankDetailsStep from '@/components/transaction-flow/RefundBankDetailsStep';
import { useProfileQuery } from '@/hooks/queries/auth/useProfileQuery';
import { useGetBanksQuery } from '@/hooks/queries/banks/useGetBanksQuery';
import { useGetSavedAccountsQuery } from '@/hooks/queries/banks/useGetSavedAccountsQuery';
import { useLookupAccountMutation } from '@/hooks/queries/banks/useResolveAccountMutation';
import { useSaveAccountMutation } from '@/hooks/queries/banks/useSaveAccountMutation';
import { useCreateTransactionMutation } from '@/hooks/queries/transactions/useCreateTransactionMutation';
import { useGetPickupCitiesQuery } from '@/hooks/queries/transactions/useGetPickupCitiesQuery';
import { useGetPickupPointsQuery } from '@/hooks/queries/transactions/useGetPickupPointsQuery';
import { useGetPickupStatesQuery } from '@/hooks/queries/transactions/useGetPickupStatesQuery';
import { useGetTransactionsQuery } from '@/hooks/queries/transactions/useGetTransactionsQuery';
import { UploadedFile, UploadedMetadata, useDocumentUpload } from '@/hooks/useDocumentUpload';
import { useExchangeLogic } from '@/hooks/useExchangeLogic';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToastStore } from '@/stores/useToastStore';
import { LocationItem } from '@/utils/locations';
import { buildPickupLocationPayload, getCurrencySymbol } from '@/utils/helpers';
import { ptaStep0Schema, ptaStep1Schema, ptaStep2Schema, ptaStep3Schema } from '@/utils/validations/pta';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { View, Text, TouchableOpacity } from 'react-native';
import { z } from 'zod';
import { Ionicons } from '@expo/vector-icons';
import { moderateScale } from 'react-native-size-matters';
import { useAttachBankAccountsMutation } from '@/hooks/queries/transactions/useAttachBankAccountsMutation';

const formatDateToPickerFormat = (dateStr: string | undefined | null): string => {
    if (!dateStr) return '';
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                if (parts[0].length === 4) return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
                if (parts[2].length === 4) return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[2]}`;
            }
            return '';
        }
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    } catch (e) {
        return '';
    }
};

const PAYOUT_METHODS: SelectionItem[] = [
    { id: '1', label: 'Electronic Transfer (100%)', value: 'Electronic Transfer (100%)' },
    { id: '2', label: 'Card (100%)', value: 'Card (100%)' },
    { id: '3', label: 'Card (75%) + Cash (25%)', value: 'Card (75%) + Cash (25%)' },
    { id: '4', label: 'Cash (25%) + Electronic Transfer (75%)', value: 'Cash (25%) + Electronic Transfer (75%)' },
];



const ptaFormSchema = z.object({
    ...ptaStep0Schema.shape,
    ...ptaStep1Schema.shape,
    ...ptaStep2Schema.shape,
    payoutMethod: z.string().min(1, 'Please select a payout method'),
    customerBankName: z.string().optional().or(z.literal('')),
    customerBankCode: z.string().optional().or(z.literal('')),
    customerAccountNumber: z.string().optional().or(z.literal('')),
    customerAccountName: z.string().optional().or(z.literal('')),
    domiciliaryAccountNumber: z.string().optional().or(z.literal('')),
    domiciliaryBankName: z.string().optional().or(z.literal('')),
    domiciliaryAccountName: z.string().optional().or(z.literal('')),
    domiciliarySwiftCode: z.string().optional().or(z.literal('')),
    domiciliaryRoutingNumber: z.string().optional().or(z.literal('')),
    domiciliaryBankAddress: z.string().optional().or(z.literal('')),
    selectedState: z.any().optional(),
    selectedCity: z.any().optional(),
    selectedLocation: z.any().optional(),
    pickupDate: z.string().optional().or(z.literal('')),
    pickupTime: z.string().optional().or(z.literal('')),
}).superRefine((data, ctx) => {
    const user = useAuthStore.getState().user;
    const profileBvn = user?.kyc?.bvn || '';
    const profileNin = (user?.kyc as any)?.nin || (user as any)?.nin || '';

    if (!profileBvn) {
        if (!data.bvn) {
            ctx.addIssue({
                code: "custom",
                message: 'BVN is required',
                path: ['bvn']
            });
        } else if (data.bvn.length !== 11 || !/^\d+$/.test(data.bvn)) {
            ctx.addIssue({
                code: "custom",
                message: 'BVN must be exactly 11 digits',
                path: ['bvn']
            });
        }
    }

    if (!profileNin) {
        if (!data.nin) {
            ctx.addIssue({
                code: "custom",
                message: 'NIN is required',
                path: ['nin']
            });
        } else if (data.nin.length !== 11 || !/^\d+$/.test(data.nin)) {
            ctx.addIssue({
                code: "custom",
                message: 'NIN must be exactly 11 digits',
                path: ['nin']
            });
        }
    }

    const isElectronicTransfer = data.payoutMethod?.includes('Electronic');
    const isDomiciliary = data.payoutMethod === 'Electronic Transfer (100%)' || 
                          data.payoutMethod === 'Cash (25%) + Electronic Transfer (75%)';
    const needsLocation = data.payoutMethod !== 'Electronic Transfer (100%)';

    if (isDomiciliary) {
        if (!data.domiciliaryAccountNumber) {
            ctx.addIssue({
                code: "custom",
                message: 'Please enter domiciliary account number',
                path: ['domiciliaryAccountNumber']
            });
        } else if (data.domiciliaryAccountNumber.length !== 10 || !/^\d+$/.test(data.domiciliaryAccountNumber)) {
            ctx.addIssue({
                code: "custom",
                message: 'Domiciliary account number must be 10 digits',
                path: ['domiciliaryAccountNumber']
            });
        }
        if (!data.domiciliaryBankName) {
            ctx.addIssue({
                code: "custom",
                message: 'Please enter bank name',
                path: ['domiciliaryBankName']
            });
        } else if (data.domiciliaryBankName.trim().length < 2) {
            ctx.addIssue({
                code: "custom",
                message: 'Bank name must be at least 2 characters',
                path: ['domiciliaryBankName']
            });
        }
        if (!data.domiciliaryAccountName) {
            ctx.addIssue({
                code: "custom",
                message: 'Please enter account name',
                path: ['domiciliaryAccountName']
            });
        } else if (data.domiciliaryAccountName.trim().length < 3 || !/^[A-Za-z\s.\-]+$/.test(data.domiciliaryAccountName)) {
            ctx.addIssue({
                code: "custom",
                message: 'Account name must be at least 3 characters and contain only letters',
                path: ['domiciliaryAccountName']
            });
        } else {
            const normalize = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');
            const enteredName = normalize(data.domiciliaryAccountName);
            const registeredFirst = normalize(user?.profile?.firstName || '');
            const registeredLast = normalize(user?.profile?.lastName || '');
            if (
                registeredFirst && registeredLast &&
                !enteredName.includes(registeredFirst) && !enteredName.includes(registeredLast)
            ) {
                ctx.addIssue({
                    code: "custom",
                    message: "Account name doesn't match your registered name. Please check and try again.",
                    path: ['domiciliaryAccountName']
                });
            }
        }
        if (!data.domiciliarySwiftCode) {
            ctx.addIssue({
                code: "custom",
                message: 'Please enter SWIFT code',
                path: ['domiciliarySwiftCode']
            });
        } else if (!/^[A-Za-z]{4}[A-Za-z]{2}[A-Za-z0-9]{2}([A-Za-z0-9]{3})?$/.test(data.domiciliarySwiftCode)) {
            ctx.addIssue({
                code: "custom",
                message: 'Invalid SWIFT code format. Expected: 4 letters + 2 letters + 2 characters (+ optional 3 characters), e.g. CITIUS33 or CITIUS33XXX',
                path: ['domiciliarySwiftCode']
            });
        }
        if (!data.domiciliaryRoutingNumber) {
            ctx.addIssue({
                code: "custom",
                message: 'Please enter routing number',
                path: ['domiciliaryRoutingNumber']
            });
        } else if (data.domiciliaryRoutingNumber.length !== 9 || !/^\d+$/.test(data.domiciliaryRoutingNumber)) {
            ctx.addIssue({
                code: "custom",
                message: 'Routing number must be exactly 9 digits',
                path: ['domiciliaryRoutingNumber']
            });
        }
        if (!data.domiciliaryBankAddress) {
            ctx.addIssue({
                code: "custom",
                message: 'Please enter bank address',
                path: ['domiciliaryBankAddress']
            });
        } else if (data.domiciliaryBankAddress.trim().length < 5) {
            ctx.addIssue({
                code: "custom",
                message: 'Bank address must be at least 5 characters',
                path: ['domiciliaryBankAddress']
            });
        }
    } else if (isElectronicTransfer) {
        if (!data.customerBankName) {
            ctx.addIssue({
                code: "custom",
                message: 'Please select your bank',
                path: ['customerBankName']
            });
        }
        if (!data.customerBankCode) {
            ctx.addIssue({
                code: "custom",
                message: 'Please select your bank',
                path: ['customerBankCode']
            });
        }
        if (!data.customerAccountNumber || data.customerAccountNumber.length !== 10) {
            ctx.addIssue({
                code: "custom",
                message: 'Account number must be 10 digits',
                path: ['customerAccountNumber']
            });
        }
        if (!data.customerAccountName) {
            ctx.addIssue({
                code: "custom",
                message: 'Account name must be resolved',
                path: ['customerAccountName']
            });
        }
    }

    if (needsLocation) {
        if (!data.selectedState) {
            ctx.addIssue({
                code: "custom",
                message: 'Please select a state',
                path: ['selectedState']
            });
        }
        if (!data.selectedCity) {
            ctx.addIssue({
                code: "custom",
                message: 'Please select a city',
                path: ['selectedCity']
            });
        }
        if (!data.selectedLocation) {
            ctx.addIssue({
                code: "custom",
                message: 'Please select a pickup location',
                path: ['selectedLocation']
            });
        }
        if (!data.pickupDate) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Please select a pickup date',
                path: ['pickupDate']
            });
        }
        if (!data.pickupTime) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Please select a pickup time',
                path: ['pickupTime']
            });
        }
    }
    if (data.passportIssueDate && data.passportExpiryDate && data.passportIssueDate === data.passportExpiryDate) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Passport Expiry Date cannot be the same as Passport Issue Date',
            path: ['passportExpiryDate']
        });
    }
});

type PtaFormValues = z.infer<typeof ptaFormSchema>;

export default function PersonalTravelAllowanceScreen() {
    const router = useRouter();
    const createTransaction = useCreateTransactionMutation();
    const attachBankAccountsMutation = useAttachBankAccountsMutation();
    const showToast = useToastStore(s => s.showToast);
    useProfileQuery();
    const user = useAuthStore(s => s.user);
    const { data: transactionsResponse } = useGetTransactionsQuery();
    const transactions = transactionsResponse?.pages?.flatMap(p => p.data) || [];

    const [currentStep, setCurrentStep] = useState(0);
    const [initiateSheetVisible, setInitiateSheetVisible] = useState(false);
    const [payoutSheetVisible, setPayoutSheetVisible] = useState(false);
    const [selectedSavedAccountId, setSelectedSavedAccountId] = useState<string | null>('');
    const [isAddingNewAccount, setIsAddingNewAccount] = useState(false);

    const {
        control,
        handleSubmit,
        trigger,
        watch,
        setValue,
        getValues,
        formState: { errors }
    } = useForm<PtaFormValues>({
        resolver: zodResolver(ptaFormSchema),
        defaultValues: {
            bvn: user?.kyc?.bvn || '',
            nin: (user?.kyc as any)?.nin || (user as any)?.nin || '',
            formAId: '',
            passportDocumentNumber: '',
            passportIssueDate: '',
            passportExpiryDate: '',
            amount: 0,
            selectedState: undefined as unknown as LocationItem,
            selectedCity: undefined as unknown as LocationItem,
            selectedLocation: undefined as unknown as LocationItem,
            pickupDate: '',
            pickupTime: '',
            payoutMethod: '',
            customerBankName: '',
            customerBankCode: '',
            customerAccountNumber: '',
            customerAccountName: '',
            domiciliaryAccountNumber: '',
            domiciliaryBankName: '',
            domiciliaryAccountName: '',
            domiciliarySwiftCode: '',
            domiciliaryRoutingNumber: '',
            domiciliaryBankAddress: '',
        },
        mode: 'onChange'
    });

    const {
        transactionType,
        setTransactionType,
        currencyGet,
        setCurrencyGet,
        currencySend,
        setCurrencySend,
        amountGetStr,
        setAmountGetStr,
        amountSendStr,
        setAmountSendStr,
        currentRate,
    } = useExchangeLogic({ setValue, initialAmount: '0', maxLimit: 4000 });

    // Dynamic Locations
    const { data: states = [] } = useGetPickupStatesQuery();
    const { data: allLocations = [] } = useGetPickupPointsQuery();

    const watchedFields = watch() as any;
    const isElectronicTransfer = watchedFields.payoutMethod?.includes('Electronic');
    const needsLocationStep = watchedFields.payoutMethod !== 'Electronic Transfer (100%)';

    const { data: filteredCities = [] } = useGetPickupCitiesQuery(watchedFields.selectedState?.title);

    const filteredLocations = useMemo(() => {
        if (!watchedFields.selectedCity) return [];
        return allLocations.filter((loc: any) => loc.metadata.city === watchedFields.selectedCity.title);
    }, [watchedFields.selectedCity, allLocations]);

    // Banks and Account Resolution
    const { data: banksResponse } = useGetBanksQuery();
    const banks = useMemo(() =>
        (banksResponse?.data || []).map(b => ({ id: b.code, label: b.name, value: b.code })),
        [banksResponse]);

    const { data: savedAccountsResponse } = useGetSavedAccountsQuery();
    const savedAccounts = useMemo(() => {
        return (savedAccountsResponse?.data || []).map(a => {
            const clean = (str: string) => {
                return (str || '')
                    .toLowerCase()
                    .replace(/\b(plc|limited|ltd|bank|microfinance|mgb|mfd)\b/g, '')
                    .replace(/[^a-z0-9]/g, '')
                    .trim();
            };
            const cleanedTarget = clean(a.bankName);
            const foundBank = (banksResponse?.data || []).find(b => {
                const cleanedBank = clean(b.name);
                return cleanedBank === cleanedTarget || cleanedBank.includes(cleanedTarget) || cleanedTarget.includes(cleanedBank);
            });
            return {
                id: a.id,
                bankName: a.bankName,
                accountNumber: a.accountNumber,
                accountName: a.accountName,
                bankCode: foundBank?.code || ''
            };
        });
    }, [savedAccountsResponse, banksResponse]);

    const saveAccountMutation = useSaveAccountMutation();

    const resolveAccount = useLookupAccountMutation();

    React.useEffect(() => {
        if (!isAddingNewAccount) return;
        if (watchedFields.customerAccountNumber?.length === 10 && watchedFields.customerBankCode) {
            resolveAccount.mutate({
                accountNumber: watchedFields.customerAccountNumber,
                bankName: watchedFields.customerBankName
            }, {
                onSuccess: (res) => {
                    if (res.success) {
                        setValue('customerAccountName', res.data.accountName, { shouldValidate: true, shouldDirty: true });
                    }
                },
                onError: () => {
                    setValue('customerAccountName', '', { shouldValidate: true, shouldDirty: true });
                    showToast('Could not resolve account name', 'error');
                }
            });
        } else {
            if (watchedFields.customerAccountName) {
                setValue('customerAccountName', '', { shouldValidate: true, shouldDirty: true });
            }
        }
    }, [watchedFields.customerAccountNumber, watchedFields.customerBankCode, isAddingNewAccount]);


    React.useEffect(() => {
        if (transactions.length > 0) {
            let foundPassportNumber = '';
            let foundPassportIssueDate = '';
            let foundPassportExpiryDate = '';

            for (const tx of transactions) {
                const passportVal = tx.personalInfo?.passportDocumentNumber || tx.personalInfo?.passportDocumentNumber || (tx as any).passportDocumentNumber;
                const issueDateVal = tx.personalInfo?.passportIssueDate;
                const expiryDateVal = tx.personalInfo?.passportExpiryDate;

                if (!foundPassportNumber && passportVal) foundPassportNumber = String(passportVal);
                if (!foundPassportIssueDate && issueDateVal) foundPassportIssueDate = String(issueDateVal);
                if (!foundPassportExpiryDate && expiryDateVal) foundPassportExpiryDate = String(expiryDateVal);

                if (foundPassportNumber && foundPassportIssueDate && foundPassportExpiryDate) break;
            }

            const profilePassportNumber = user?.kyc?.passportDocumentNumber || '';
            const finalPassportNumber = foundPassportNumber || profilePassportNumber;

            if (finalPassportNumber && !watchedFields.passportDocumentNumber) {
                setValue('passportDocumentNumber', finalPassportNumber, { shouldValidate: true, shouldDirty: true });
            }
            if (foundPassportIssueDate && !watchedFields.passportIssueDate) {
                setValue('passportIssueDate', formatDateToPickerFormat(foundPassportIssueDate), { shouldValidate: true, shouldDirty: true });
            }
            if (foundPassportExpiryDate && !watchedFields.passportExpiryDate) {
                setValue('passportExpiryDate', formatDateToPickerFormat(foundPassportExpiryDate), { shouldValidate: true, shouldDirty: true });
            }
        } else {
            const profilePassportNumber = user?.kyc?.passportDocumentNumber || '';
            if (profilePassportNumber && !watchedFields.passportDocumentNumber) {
                setValue('passportDocumentNumber', profilePassportNumber, { shouldValidate: true, shouldDirty: true });
            }
        }
    }, [transactions, user, setValue, watchedFields.passportDocumentNumber, watchedFields.passportIssueDate, watchedFields.passportExpiryDate]);


    const [docs, setDocs] = useState({
        visa: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
        returnTicket: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
        passport: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
    });

    const updateDoc = (key: keyof typeof docs, file: UploadedFile, metadata: UploadedMetadata) => {
        setDocs(prev => ({ ...prev, [key]: { file, meta: metadata } }));
    };

    const { upload: uploadFile, isPending: isUploading } = useDocumentUpload({
        onSuccess: (documentType, { file, metadata }) => {
            if (documentType === 'VISA') updateDoc('visa', file, metadata);
            else if (documentType === 'RETURN_TICKET') updateDoc('returnTicket', file, metadata);
            else if (documentType === 'PASSPORT') updateDoc('passport', file, metadata);
        },
        onError: () => showToast('Failed to upload document. Please try again.', 'error'),
    });

    const profileBvn = user?.kyc?.bvn || '';
    const profileNin = (user?.kyc as any)?.nin || (user as any)?.nin || '';
    const isBvnDisabled = !!profileBvn;
    const isNinDisabled = !!profileNin;

    const credentialFields = [
        { customComponent: <ControlledInput control={control} name="bvn" label="Bank Verification Number(BVN)" placeholder="Enter your BVN" required keyboardType="numeric" maxLength={11} filterType="numeric" disabled={isBvnDisabled} /> },
        { customComponent: <ControlledInput control={control} name="nin" label="National Identification Number(NIN)" placeholder="Enter your NIN" required={!isNinDisabled} keyboardType="numeric" maxLength={11} filterType="numeric" disabled={isNinDisabled} /> },
        { customComponent: <ControlledInput control={control} name="formAId" label="Form A ID" placeholder="Enter Form A ID" required  maxLength={10} /> },
        { customComponent: <ControlledInput control={control} name="passportDocumentNumber" label="International Passport Number" placeholder="Enter international passport" required maxLength={9} filterType="alphanumeric" /> },
        {
            customComponent: (
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 6 }}>
                    <View style={{ flex: 1 }}>
                        <ControlledDatePicker control={control} name="passportIssueDate" label="Passport Issue Date" required maximumDate={new Date()} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <ControlledDatePicker control={control} name="passportExpiryDate" label="Passport Expiry Date" required minimumDate={new Date()} />
                    </View>
                </View>
            )
        }
    ];

    const documentFields = [
        {
            label: 'Valid Visa',
            onUpload: () => uploadFile('VISA'),
            fileName: docs.visa.file?.name,
            fileUri: docs.visa.file?.uri, fileUrl: docs.visa.meta?.fileUrl,
            fileType: docs.visa.file?.type,
            required: true,
        },
        {
            label: 'Return Ticket',
            onUpload: () => uploadFile('RETURN_TICKET'),
            fileName: docs.returnTicket.file?.name,
            fileUri: docs.returnTicket.file?.uri, fileUrl: docs.returnTicket.meta?.fileUrl,
            fileType: docs.returnTicket.file?.type,
            required: true,
        },
        {
            label: 'International Passport',
            onUpload: () => uploadFile('PASSPORT'),
            fileName: docs.passport.file?.name,
            fileUri: docs.passport.file?.uri, fileUrl: docs.passport.meta?.fileUrl,
            fileType: docs.passport.file?.type,
            required: true,
        }
    ];

    const handleSaveNewAccount = async () => {
        const isValid = await trigger([
            'customerBankName',
            'customerBankCode',
            'customerAccountNumber',
            'customerAccountName'
        ]);

        if (isValid) {
            saveAccountMutation.mutate({
                bankName: watchedFields.customerBankName || '',
                accountNumber: watchedFields.customerAccountNumber || '',
                accountName: watchedFields.customerAccountName || '',
            }, {
                onSuccess: (res) => {
                    if (res.data?.id) {
                        setSelectedSavedAccountId(res.data.id);
                    }
                    setIsAddingNewAccount(false);
                }
            });
        }
    };

    const handleNext = async () => {
        const values = getValues();
        const needsLocationStepLatest = values.payoutMethod !== 'Electronic Transfer (100%)';
        const refundStepIndex = needsLocationStepLatest ? 5 : 4;

        const stepSchemas = [
            ptaStep0Schema,
            ptaStep1Schema,
            ptaStep2Schema,
            z.object({ payoutMethod: z.string().min(1) }),
            ptaStep3Schema
        ];

        let isValid = false;
        if (currentStep === 3) {
            if (isAddingNewAccount) {
                return;
            }
            const fieldsToTrigger: any[] = ['payoutMethod'];
            const isDomiciliary = watchedFields.payoutMethod === 'Electronic Transfer (100%)' || 
                                  watchedFields.payoutMethod === 'Cash (25%) + Electronic Transfer (75%)';
            if (isDomiciliary) {
                fieldsToTrigger.push(
                    'domiciliaryAccountNumber',
                    'domiciliaryBankName',
                    'domiciliaryAccountName',
                    'domiciliarySwiftCode',
                    'domiciliaryRoutingNumber',
                    'domiciliaryBankAddress'
                );
            } else if (isElectronicTransfer) {
                fieldsToTrigger.push('customerBankName', 'customerBankCode', 'customerAccountNumber', 'customerAccountName');
            }
            isValid = await trigger(fieldsToTrigger);
        } else if (currentStep === 4 && needsLocationStepLatest) {
            isValid = await trigger(Object.keys(stepSchemas[4].shape) as any);
        } else if (currentStep === refundStepIndex) {
            if (isAddingNewAccount) {
                return;
            }
            isValid = !!selectedSavedAccountId;
        } else {
            isValid = await trigger(Object.keys(stepSchemas[currentStep].shape) as any);
        }

        if (isValid) {
            if (currentStep < refundStepIndex) {
                setCurrentStep(prev => prev + 1);
            } else {
                setInitiateSheetVisible(true);
            }
        }
    };

    const handleBack = () => {
        if (isAddingNewAccount) {
            setIsAddingNewAccount(false);
            return;
        }
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        } else {
            router.back();
        }
    };

    const handleInitiate = (data: PtaFormValues) => {
        const payload = {
            type: 'PTA',
             mode: "BUY",
            currency: currencyGet.code,
            amount: data.amount,
            purpose: 'Personal Travel Allowance',
            destinationCountry: currencyGet.country,
            bvn: data.bvn,
            nin: data.nin,
            formAId: data.formAId,
            passportDocumentNumber: data.passportDocumentNumber,
            passportIssueDate: data.passportIssueDate,
            passportExpiryDate: data.passportExpiryDate,
            documents: [
                ...(docs.visa.meta ? [docs.visa.meta] : []),
                ...(docs.returnTicket.meta ? [docs.returnTicket.meta] : []),
                ...(docs.passport.meta ? [docs.passport.meta] : []),
            ],
            pickupLocation: (needsLocationStep && data.selectedLocation) ? buildPickupLocationPayload({
                selectedLocation: data.selectedLocation,
                selectedState: data.selectedState,
                selectedCity: data.selectedCity,
                pickupDate: data.pickupDate || '',
                pickupTime: data.pickupTime || '',
                amount: (data.payoutMethod === 'Card (75%) + Cash (25%)' || data.payoutMethod === 'Cash (25%) + Electronic Transfer (75%)') ? (Number(data.amount) * 0.25) : (Number(data.amount) || 0),
                currency: currencyGet.code,
            }) : undefined,
            payoutMethod: data.payoutMethod,
            beneficiaryDetails: (data.payoutMethod?.includes('Electronic')) ? {
                bankName: data.domiciliaryBankName,
                accountNumber: data.domiciliaryAccountNumber,
                accountName: data.domiciliaryAccountName,
                swiftCode: data.domiciliarySwiftCode,
                routingNumber: data.domiciliaryRoutingNumber,
                bankAddress: data.domiciliaryBankAddress,
            } : undefined,
            refundBankDetails: {
                bankName: data.customerBankName,
                bankCode: data.customerBankCode,
                accountNumber: data.customerAccountNumber,
                accountName: data.customerAccountName,
            }
        };

        createTransaction.mutate(payload, {
            onSuccess: (response: any) => {
                if (response.success) {
                    const transactionId = response.data?.transactionId;
                    if (selectedSavedAccountId && transactionId) {
                        attachBankAccountsMutation.mutate({
                            transactionId,
                            bankAccountIds: [selectedSavedAccountId],
                        });
                    }
                    setInitiateSheetVisible(false);
                    router.push({
                        pathname: '/(buy-fx)/(pta)/request-initiated-success',
                        params: { transactionId }
                    });
                }
            },
            onError: (error: any) => {
                showToast(error?.response?.data?.message || 'Failed to initiate transaction', 'error');
            }
        });
    };

    const foreignAmountStr = currencyGet.code !== 'NGN' ? amountGetStr : amountSendStr;
    const foreignAmount = parseFloat(foreignAmountStr.replace(/,/g, '')) || 0;
    const isStep2Valid = watchedFields.amount > 0 && foreignAmount <= 10000;
    const isStep3Valid = watchedFields.payoutMethod && (
        !isElectronicTransfer || (
            watchedFields.payoutMethod?.includes('Electronic')
            ? (watchedFields.domiciliaryAccountNumber && watchedFields.domiciliaryAccountNumber.length === 10 && watchedFields.domiciliaryBankName && watchedFields.domiciliaryAccountName && watchedFields.domiciliarySwiftCode && watchedFields.domiciliaryRoutingNumber && watchedFields.domiciliaryBankAddress)
            : (watchedFields.customerBankName && watchedFields.customerBankCode && watchedFields.customerAccountNumber && watchedFields.customerAccountName)
        )
    );
    const isStep4Valid = watchedFields.selectedState && watchedFields.selectedCity && watchedFields.selectedLocation && watchedFields.pickupDate && watchedFields.pickupTime;

    const refundStepIndex = needsLocationStep ? 5 : 4;

    const isNewAccountValid = !!(
        watchedFields.customerBankName &&
        watchedFields.customerBankCode &&
        watchedFields.customerAccountNumber?.length === 10 &&
        watchedFields.customerAccountName &&
        !resolveAccount.isPending
    );

    const isNextDisabled = isAddingNewAccount
        ? (!isNewAccountValid || saveAccountMutation.isPending)
        : (
            (currentStep === 1 && (!docs.visa.file || !docs.returnTicket.file || !docs.passport.file)) ||
            (currentStep === 2 && !isStep2Valid) ||
            (currentStep === 3 && !isStep3Valid) ||
            (currentStep === 4 && needsLocationStep && !isStep4Valid) ||
            (currentStep === refundStepIndex && !selectedSavedAccountId)
        );

    return (
        <View style={{ flex: 1 }}>
            <LoadingBackdrop visible={isUploading || createTransaction.isPending || saveAccountMutation.isPending || attachBankAccountsMutation.isPending} />
            <TransactionLayout
                title="Personal Travel Allowance (PTA)"
                currentStep={currentStep}
                totalSteps={needsLocationStep ? 6 : 5}
                onBack={handleBack}
                onNext={isAddingNewAccount ? handleSaveNewAccount : handleNext}
                isNextDisabled={isNextDisabled}
                nextLabel={isAddingNewAccount ? "Save" : (currentStep === refundStepIndex ? "Initiate Transaction Request" : "Continue")}
            >
                {currentStep === 0 && (
                    <CredentialStep fields={credentialFields} />
                )}
                {currentStep === 1 && (
                    <DocumentStep documents={documentFields} />
                )}
                {currentStep === 2 && (
                    <ExchangeStep
                        transactionType={transactionType}
                        onTransactionTypeChange={setTransactionType}
                        currencyGet={currencyGet}
                        onCurrencyGetChange={setCurrencyGet}
                        currencySend={currencySend}
                        onCurrencySendChange={setCurrencySend}
                        amountGet={amountGetStr}
                        amountSend={amountSendStr}
                        rate={`1 ${currencyGet.code} = ${currentRate.toLocaleString()} ${currencySend.code}`}
                        onAmountGetChange={setAmountGetStr}
                        onAmountSendChange={setAmountSendStr}
                        allowedModes={['buy']}
                        showLimitWarning={true}
                        error={errors.amount?.message}
                    />
                )}
                {currentStep === 3 && (
                    <PayoutMethodStep
                        control={control}
                        setValue={setValue}
                        setPayoutSheetVisible={setPayoutSheetVisible}
                        savedAccounts={savedAccounts}
                        selectedSavedAccountId={selectedSavedAccountId}
                        setSelectedSavedAccountId={setSelectedSavedAccountId}
                        setIsAddingNewAccount={setIsAddingNewAccount}
                    />
                )}

                {currentStep === 4 && needsLocationStep && (
                    <LocationStep
                        states={states}
                        cities={filteredCities}
                        locations={filteredLocations}
                        selectedState={watchedFields.selectedState}
                        onSelectState={(item) => {
                            setValue('selectedState', item);
                            setValue('selectedCity', undefined as unknown as LocationItem);
                            setValue('selectedLocation', undefined as unknown as LocationItem);
                        }}
                        selectedCity={watchedFields.selectedCity}
                        onSelectCity={(item) => {
                            setValue('selectedCity', item);
                            setValue('selectedLocation', undefined as unknown as LocationItem);
                        }}
                        selectedLocation={watchedFields.selectedLocation}
                        onSelectLocation={(item) => setValue('selectedLocation', item)}
                        pickupDate={watchedFields.pickupDate}
                        onPickupDateChange={(date) => setValue('pickupDate', date)}
                        pickupTime={watchedFields.pickupTime}
                        onPickupTimeChange={(time) => setValue('pickupTime', time)}
                        errors={{
                            state: errors.selectedState?.message as string | undefined,
                            city: errors.selectedCity?.message as string | undefined,
                            location: errors.selectedLocation?.message as string | undefined,
                            pickupDate: errors.pickupDate?.message as string | undefined,
                            pickupTime: errors.pickupTime?.message as string | undefined
                        }}
                    />
                )}

                {currentStep === refundStepIndex && !isAddingNewAccount && (
                    <RefundBankDetailsStep
                        savedAccounts={savedAccounts}
                        selectedSavedAccountId={selectedSavedAccountId}
                        setSelectedSavedAccountId={setSelectedSavedAccountId}
                        setValue={setValue}
                        setIsAddingNewAccount={setIsAddingNewAccount}
                    />
                )}

                {currentStep === refundStepIndex && isAddingNewAccount && (
                    <AddNewAccountStep
                        control={control}
                        setValue={setValue}
                        banks={banks}
                        isResolving={resolveAccount.isPending}
                        selectedBankCode={watchedFields.customerBankCode}
                    />
                )}
            </TransactionLayout>

            <InitiateTransactionSheet
                visible={initiateSheetVisible}
                onClose={() => setInitiateSheetVisible(false)}
                onConfirm={handleSubmit(handleInitiate)}
                loading={createTransaction.isPending}
                limitCurrencySymbol={getCurrencySymbol(currencyGet.code)}
                items={[
                    {
                        title: "Request Summary",
                        description: `You are requesting ${getCurrencySymbol(currencyGet.code)}${amountGetStr} ${currencyGet.code.toUpperCase()}. You will pay approximately ₦${amountSendStr}`,
                        iconType: 'info'
                    },
                    {
                        title: "Maximum Limit",
                        description: `Please note that the maximum you can transact is ${getCurrencySymbol(currencyGet.code)}4,000 per quarter.`,
                        iconType: 'limit'
                    }
                ]}
            />

            <GenericSelectionSheet
                visible={payoutSheetVisible}
                onClose={() => setPayoutSheetVisible(false)}
                title="Choose a Payout Method"
                subtitle="Select an option below"
                items={PAYOUT_METHODS}
                selectedItem={watchedFields.payoutMethod}
                onSelect={(item) => {
                    setValue('payoutMethod', item.value);
                    setPayoutSheetVisible(false);
                }}
                confirmButtonText="Select a Payout Method"
            />


        </View>
    );
}
