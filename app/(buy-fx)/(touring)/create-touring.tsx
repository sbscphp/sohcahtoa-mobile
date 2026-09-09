import ControlledDatePicker from '@/components/ControlledDatePicker';
import ControlledInput from '@/components/ControlledInput';
import InitiateTransactionSheet from '@/components/InitiateTransactionSheet';
import LoadingBackdrop from '@/components/LoadingBackdrop';
import CredentialStep from '@/components/transaction-flow/CredentialStep';
import DocumentStep from '@/components/transaction-flow/DocumentStep';
import ExchangeStep from '@/components/transaction-flow/ExchangeStep';
import LocationStep from '@/components/transaction-flow/LocationStep';
import TransactionLayout from '@/components/transaction-flow/TransactionLayout';
import RefundBankDetailsStep from '@/components/transaction-flow/RefundBankDetailsStep';
import { useProfileQuery } from '@/hooks/queries/auth/useProfileQuery';
import { useCreateTransactionMutation } from '@/hooks/queries/transactions/useCreateTransactionMutation';
import { useGetPickupCitiesQuery } from '@/hooks/queries/transactions/useGetPickupCitiesQuery';
import { useGetPickupPointsQuery } from '@/hooks/queries/transactions/useGetPickupPointsQuery';
import { useGetPickupStatesQuery } from '@/hooks/queries/transactions/useGetPickupStatesQuery';
import { useGetTransactionsQuery } from '@/hooks/queries/transactions/useGetTransactionsQuery';
import { buildPickupLocationPayload, formatDateToPickerFormat, getCurrencySymbol } from '@/utils/helpers';
import { UploadedFile, UploadedMetadata, useDocumentUpload } from '@/hooks/useDocumentUpload';
import { useExchangeLogic } from '@/hooks/useExchangeLogic';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToastStore } from '@/stores/useToastStore';
import { LocationItem } from '@/utils/locations';
import { touringStep0Schema, touringStep1Schema, touringStep2Schema, touringStep3Schema } from '@/utils/validations/touring';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React, { useMemo, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import { z } from 'zod';
import { useAttachBankAccountsMutation } from '@/hooks/queries/transactions/useAttachBankAccountsMutation';

import GenericSelectionSheet, { SelectionItem } from '@/components/GenericSelectionSheet';
import AddNewAccountStep from '@/components/transaction-flow/AddNewAccountStep';
import PayoutMethodStep from '@/components/transaction-flow/PayoutMethodStep';
import { useGetBanksQuery } from '@/hooks/queries/banks/useGetBanksQuery';
import { useGetSavedAccountsQuery } from '@/hooks/queries/banks/useGetSavedAccountsQuery';
import { useLookupAccountMutation } from '@/hooks/queries/banks/useResolveAccountMutation';
import { useSaveAccountMutation } from '@/hooks/queries/banks/useSaveAccountMutation';

const PAYOUT_METHODS: SelectionItem[] = [
    { id: '1', label: 'Electronic Transfer (100%)', value: 'Electronic Transfer (100%)' },
    { id: '2', label: 'Card (100%)', value: 'Card (100%)' },
    { id: '3', label: 'Card (75%) + Cash (25%)', value: 'Card (75%) + Cash (25%)' },
    { id: '4', label: 'Cash (25%) + Electronic Transfer (75%)', value: 'Cash (25%) + Electronic Transfer (75%)' },
];

const touringFormSchema = z.object({
    ...touringStep0Schema.shape,
    ...touringStep1Schema.shape,
    ...touringStep2Schema.shape,
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
    const isElectronicTransfer = data.payoutMethod?.includes('Electronic');
    const isDomiciliary = data.payoutMethod === 'Electronic Transfer (100%)' || 
                          data.payoutMethod === 'Cash (25%) + Electronic Transfer (75%)';
    const needsLocation = data.payoutMethod !== 'Electronic Transfer (100%)';

    if (isDomiciliary) {
        if (!data.domiciliaryAccountNumber) {
            ctx.addIssue({ code: "custom", message: 'Please enter domiciliary account number', path: ['domiciliaryAccountNumber'] });
        } else if (data.domiciliaryAccountNumber.length !== 10 || !/^\d+$/.test(data.domiciliaryAccountNumber)) {
            ctx.addIssue({ code: "custom", message: 'Domiciliary account number must be 10 digits', path: ['domiciliaryAccountNumber'] });
        }
        if (!data.domiciliaryBankName) {
            ctx.addIssue({ code: "custom", message: 'Please enter bank name', path: ['domiciliaryBankName'] });
        } else if (data.domiciliaryBankName.trim().length < 2) {
            ctx.addIssue({ code: "custom", message: 'Bank name must be at least 2 characters', path: ['domiciliaryBankName'] });
        }
        if (!data.domiciliaryAccountName) {
            ctx.addIssue({ code: "custom", message: 'Please enter account name', path: ['domiciliaryAccountName'] });
        } else if (data.domiciliaryAccountName.trim().length < 3 || !/^[A-Za-z\s.\-]+$/.test(data.domiciliaryAccountName)) {
            ctx.addIssue({ code: "custom", message: 'Account name must be at least 3 characters and contain only letters', path: ['domiciliaryAccountName'] });
        } else {
            const normalize = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '');
            const enteredName = normalize(data.domiciliaryAccountName);
            const touringUser = useAuthStore.getState().user;
            const registeredFirst = normalize(touringUser?.profile?.firstName || '');
            const registeredLast = normalize(touringUser?.profile?.lastName || '');
            if (
                registeredFirst && registeredLast &&
                !enteredName.includes(registeredFirst) && !enteredName.includes(registeredLast)
            ) {
                ctx.addIssue({ code: "custom", message: "Account name doesn't match your registered name. Please check and try again.", path: ['domiciliaryAccountName'] });
            }
        }
        if (!data.domiciliarySwiftCode) {
            ctx.addIssue({ code: "custom", message: 'Please enter SWIFT code', path: ['domiciliarySwiftCode'] });
        } else if (!/^[A-Za-z]{4}[A-Za-z]{2}[A-Za-z0-9]{2}([A-Za-z0-9]{3})?$/.test(data.domiciliarySwiftCode)) {
            ctx.addIssue({ code: "custom", message: 'Invalid SWIFT code format. Expected: 4 letters + 2 letters + 2 characters (+ optional 3 characters), e.g. CITIUS33 or CITIUS33XXX', path: ['domiciliarySwiftCode'] });
        }
        if (!data.domiciliaryRoutingNumber) {
            ctx.addIssue({ code: "custom", message: 'Please enter routing number', path: ['domiciliaryRoutingNumber'] });
        } else if (data.domiciliaryRoutingNumber.length !== 9 || !/^\d+$/.test(data.domiciliaryRoutingNumber)) {
            ctx.addIssue({ code: "custom", message: 'Routing number must be exactly 9 digits', path: ['domiciliaryRoutingNumber'] });
        }
        if (!data.domiciliaryBankAddress) {
            ctx.addIssue({ code: "custom", message: 'Please enter bank address', path: ['domiciliaryBankAddress'] });
        } else if (data.domiciliaryBankAddress.trim().length < 5) {
            ctx.addIssue({ code: "custom", message: 'Bank address must be at least 5 characters', path: ['domiciliaryBankAddress'] });
        }
    } else if (isElectronicTransfer) {
        if (data.customerBankCode || data.customerBankName || data.customerAccountNumber || data.customerAccountName) {
            if (!data.customerBankName) {
                ctx.addIssue({ code: "custom", message: 'Please select your bank', path: ['customerBankName'] });
            }
            if (!data.customerBankCode) {
                ctx.addIssue({ code: "custom", message: 'Please select your bank', path: ['customerBankCode'] });
            }
            if (!data.customerAccountNumber || data.customerAccountNumber.length !== 10) {
                ctx.addIssue({ code: "custom", message: 'Account number must be 10 digits', path: ['customerAccountNumber'] });
            }
            if (!data.customerAccountName) {
                ctx.addIssue({ code: "custom", message: 'Account name must be resolved', path: ['customerAccountName'] });
            }
        }
    }

    if (needsLocation) {
        if (!data.selectedState) {
            ctx.addIssue({ code: "custom", message: 'Please select a state', path: ['selectedState'] });
        }
        if (!data.selectedCity) {
            ctx.addIssue({ code: "custom", message: 'Please select a city', path: ['selectedCity'] });
        }
        if (!data.selectedLocation) {
            ctx.addIssue({ code: "custom", message: 'Please select a pickup location', path: ['selectedLocation'] });
        }
        if (!data.pickupDate) {
            ctx.addIssue({ code: "custom", message: 'Please select a pickup date', path: ['pickupDate'] });
        }
        if (!data.pickupTime) {
            ctx.addIssue({ code: "custom", message: 'Please select a pickup time', path: ['pickupTime'] });
        }
    }

    if (data.passportIssueDate && data.passportExpiryDate && data.passportIssueDate === data.passportExpiryDate) {
        ctx.addIssue({
            code: "custom",
            message: 'Passport Expiry Date cannot be the same as Passport Issue Date',
            path: ['passportExpiryDate']
        });
    }
});

type TouringFormValues = z.infer<typeof touringFormSchema>;

export default function TouringScreen() {
    const router = useRouter();
    const createTransaction = useCreateTransactionMutation();
    const attachBankAccountsMutation = useAttachBankAccountsMutation();
    const showToast = useToastStore(s => s.showToast);
    useProfileQuery();
    const user = useAuthStore(s => s.user);

    const [currentStep, setCurrentStep] = useState(0);
    const [initiateSheetVisible, setInitiateSheetVisible] = useState(false);
    const {
        control,
        handleSubmit,
        trigger,
        watch,
        setValue,
        formState: { errors }
    } = useForm<TouringFormValues>({
        resolver: zodResolver(touringFormSchema),
        defaultValues: {
            formAId: '',
            passportDocumentNumber: '',
            passportIssueDate: '',
            passportExpiryDate: '',
            amount: 0,
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
            selectedState: undefined as unknown as LocationItem,
            selectedCity: undefined as unknown as LocationItem,
            selectedLocation: undefined as unknown as LocationItem,
            pickupDate: '',
            pickupTime: '',
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
    } = useExchangeLogic({ setValue, initialAmount: '0' });

    const { data: transactionsResponse } = useGetTransactionsQuery();
    const transactions = transactionsResponse?.pages?.flatMap(p => p.data) || [];

    const watchedFields = watch() as any;

    React.useEffect(() => {
        if (transactions.length > 0) {
            let foundPassportNumber = '';
            let foundPassportIssueDate = '';
            let foundPassportExpiryDate = '';

            for (const tx of transactions) {
                const passportVal = tx.personalInfo?.passportDocumentNumber || (tx as any).passportDocumentNumber;
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

    // Dynamic Locations
    const { data: states = [] } = useGetPickupStatesQuery();
    const { data: allLocations = [] } = useGetPickupPointsQuery();

    const isElectronicTransfer = watchedFields.payoutMethod?.includes('Electronic');
    const needsLocationStep = watchedFields.payoutMethod !== 'Electronic Transfer (100%)';

    const { data: banksResponse } = useGetBanksQuery();
    const banks = useMemo(
        () => (banksResponse?.data || []).map(b => ({ id: b.code, label: b.name, value: b.code })),
        [banksResponse]
    );

    const { data: savedAccountsResponse } = useGetSavedAccountsQuery();
    const savedAccounts = useMemo(() => {
        return (savedAccountsResponse?.data || []).map((a: any) => {
            const clean = (str: string) => {
                return (str || '')
                    .toLowerCase()
                    .replace(/\b(plc|limited|ltd|bank|microfinance|mgb|mfd)\b/g, '')
                    .replace(/[^a-z0-9]/g, '')
                    .trim();
            };
            const cleanedTarget = clean(a.bankName);
            const foundBank = (banksResponse?.data || []).find((b: any) => {
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

    const [selectedSavedAccountId, setSelectedSavedAccountId] = useState<string | null>('');
    const [isAddingNewAccount, setIsAddingNewAccount] = useState(false);
    const [payoutSheetVisible, setPayoutSheetVisible] = useState(false);

    React.useEffect(() => {
        if (!isAddingNewAccount) return;
        if (watchedFields.customerAccountNumber?.length === 10 && watchedFields.customerBankCode) {
            resolveAccount.mutate({
                accountNumber: watchedFields.customerAccountNumber,
                bankName: watchedFields.customerBankName
            }, {
                onSuccess: (res) => {
                    if (res.success) {
                        setValue('customerAccountName', res.data.accountName);
                    }
                },
                onError: () => {
                    setValue('customerAccountName', '');
                    showToast('Could not resolve account name', 'error');
                }
            });
        }
    }, [watchedFields.customerAccountNumber, watchedFields.customerBankCode, isAddingNewAccount]);

    // Document upload state
    const [docs, setDocs] = useState({
        passport: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
        visa: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
        ticket: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
        receipt: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
        signature: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
    });

    const updateDoc = (key: keyof typeof docs, file: UploadedFile, metadata: UploadedMetadata) => {
        setDocs(prev => ({ ...prev, [key]: { file, meta: metadata } }));
    };

    const { upload: uploadFile, isPending: isUploading } = useDocumentUpload({
        onSuccess: (documentType, { file, metadata }) => {
            if (documentType === 'PASSPORT') updateDoc('passport', file, metadata);
            else if (documentType === 'VISA') updateDoc('visa', file, metadata);
            else if (documentType === 'RETURN_TICKET') updateDoc('ticket', file, metadata);
            else if (documentType === 'RECEIPT') updateDoc('receipt', file, metadata);
            else if (documentType === 'DIGITAL_SIGNATURE') updateDoc('signature', file, metadata);
        },
        onError: () => showToast('Failed to upload document. Please try again.', 'error'),
    });

    const credentialFields = [
        { customComponent: <ControlledInput control={control} name="formAId" label="Form A ID" placeholder="Enter Form A ID" required  maxLength={10}  /> },
        { customComponent: <ControlledInput control={control} name="passportDocumentNumber" label="International Passport Number" placeholder="Enter international passport" required maxLength={9} filterType="alphanumeric" /> },
    ];

    const documentFields = [
        {
            label: 'International Passport',
            onUpload: () => uploadFile('PASSPORT'),
            fileName: docs.passport.file?.name,
            fileUri: docs.passport.file?.uri, fileUrl: docs.passport.meta?.fileUrl,
            fileType: docs.passport.file?.type,
            required: true,
            associatedInputs: (
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1 }}>
                        <ControlledDatePicker control={control} name="passportIssueDate" label="Passport Issue Date" required maximumDate={new Date()} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <ControlledDatePicker control={control} name="passportExpiryDate" label="Passport Expiry Date" required minimumDate={new Date()} />
                    </View>
                </View>
            )
        },
        {
            label: 'Valid Visa ',
            onUpload: () => uploadFile('VISA'),
            fileName: docs.visa.file?.name,
            fileUri: docs.visa.file?.uri, fileUrl: docs.visa.meta?.fileUrl,
            fileType: docs.visa.file?.type,
            required: true,
        },
        {
            label: 'Return Ticket',
            onUpload: () => uploadFile('RETURN_TICKET'),
            fileName: docs.ticket.file?.name,
            fileUri: docs.ticket.file?.uri, fileUrl: docs.ticket.meta?.fileUrl,
            fileType: docs.ticket.file?.type,
            required: true,
        },
        {
            label: 'Receipt for Initial Naira Purchase',
            onUpload: () => uploadFile('RECEIPT'),
            fileName: docs.receipt.file?.name,
            fileUri: docs.receipt.file?.uri, fileUrl: docs.receipt.meta?.fileUrl,
            fileType: docs.receipt.file?.type,
            required: true,
        },
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
        if (isUploading) {
            showToast('Please wait for files to finish uploading', 'warning');
            return;
        }

        let isStepValid = false;

        const needsLocationStepLatest = watchedFields.payoutMethod !== 'Electronic Transfer (100%)';
        const refundStepIndex = needsLocationStepLatest ? 5 : 4;

        if (currentStep === 0) {
            isStepValid = await trigger(['formAId', 'passportDocumentNumber']);
        } else if (currentStep === 1) {
            if (!docs.passport.file || !docs.visa.file || !docs.ticket.file || !docs.receipt.file) {
                showToast('Please upload all required documents', 'error');
                return;
            }
            isStepValid = await trigger(['passportIssueDate', 'passportExpiryDate']);
        } else if (currentStep === 2) {
            isStepValid = await trigger(['amount']);
        } else if (currentStep === 3) {
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
            isStepValid = await trigger(fieldsToTrigger);
        } else if (currentStep === 4 && needsLocationStepLatest) {
            isStepValid = await trigger(['selectedState', 'selectedCity', 'selectedLocation', 'pickupDate', 'pickupTime']);
        } else if (currentStep === refundStepIndex) {
            if (isAddingNewAccount) {
                return;
            }
            isStepValid = !!selectedSavedAccountId;
        }

        if (isStepValid) {
            if (currentStep < refundStepIndex) {
                setCurrentStep(currentStep + 1);
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
            setCurrentStep(currentStep - 1);
        } else {
            router.back();
        }
    };

    const onSubmit = (data: TouringFormValues) => {
        const formatDateForApi = (dateStr: string | undefined): string => {
            if (!dateStr) return '';
            const parts = dateStr.split('/');
            if (parts.length === 3) {
                return `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
            return dateStr;
        };

        const payload = {
            type: 'TOURIST_FX',
            mode: "BUY",
            currency: currencyGet.code,
            amount: data.amount,
            purpose: 'I am Touring Nigeria',
            destinationCountry: currencyGet.country,
            formAId: data.formAId,
            passportDocumentNumber: data.passportDocumentNumber,
            passportIssueDate: data.passportIssueDate,
            passportExpiryDate: data.passportExpiryDate,
            documents: [
                ...(docs.passport.meta ? [docs.passport.meta] : []),
                ...(docs.visa.meta ? [docs.visa.meta] : []),
                ...(docs.ticket.meta ? [docs.ticket.meta] : []),
                ...(docs.receipt.meta ? [docs.receipt.meta] : []),
                
            ],
            pickupLocation: (needsLocationStep && data.selectedLocation) ? buildPickupLocationPayload({
                selectedLocation: data.selectedLocation as LocationItem,
                selectedState: data.selectedState as LocationItem,
                selectedCity: data.selectedCity as LocationItem,
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
                        pathname: '/(buy-fx)/(touring)/request-initiated-success',
                        params: { transactionId }
                    });
                }
            },
        });
    };

    const { data: filteredCities = [] } = useGetPickupCitiesQuery(watchedFields.selectedState?.title);

    const filteredLocations = useMemo(() => {
        if (!watchedFields.selectedCity) return [];
        return allLocations.filter((loc: any) => loc.metadata.city === watchedFields.selectedCity.title);
    }, [watchedFields.selectedCity, allLocations]);

    const isStep0Valid = !!(watchedFields.formAId && watchedFields.formAId.length === 10 && watchedFields.passportDocumentNumber);
    const isStep1Valid = !!(docs.passport.meta && docs.visa.meta && docs.ticket.meta && docs.receipt.meta &&
        watchedFields.passportIssueDate && watchedFields.passportExpiryDate);
    const foreignAmountStr = currencyGet.code !== 'NGN' ? amountGetStr : amountSendStr;
    const foreignAmount = parseFloat(foreignAmountStr.replace(/,/g, '')) || 0;
    const isStep2Valid = watchedFields.amount > 0 && foreignAmount <= 10000;
    const isStep3Valid = watchedFields.payoutMethod && (
        !isElectronicTransfer || (
            (watchedFields.payoutMethod?.includes('Electronic'))
            ? (watchedFields.domiciliaryAccountNumber && watchedFields.domiciliaryAccountNumber.length === 10 && watchedFields.domiciliaryBankName && watchedFields.domiciliaryAccountName && watchedFields.domiciliarySwiftCode && watchedFields.domiciliaryRoutingNumber && watchedFields.domiciliaryBankAddress)
            : true
        )
    );
    const isStep4Valid = watchedFields.selectedState && watchedFields.selectedCity && watchedFields.selectedLocation && watchedFields.pickupDate && watchedFields.pickupTime;

    const refundStepIndex = needsLocationStep ? 5 : 4;

    const isNextDisabled =
        (currentStep === 0 && !isStep0Valid) ||
        (currentStep === 1 && !isStep1Valid) ||
        (currentStep === 2 && !isStep2Valid) ||
        (currentStep === 3 && !isStep3Valid) ||
        (currentStep === 4 && needsLocationStep && !isStep4Valid);

    return (
        <View style={{ flex: 1 }}>
            <LoadingBackdrop visible={isUploading || createTransaction.isPending || saveAccountMutation.isPending || attachBankAccountsMutation.isPending} />
            <TransactionLayout
                title="Touring"
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
                        onPickupDateChange={(v: string) => setValue('pickupDate', v)}
                        pickupTime={watchedFields.pickupTime}
                        onPickupTimeChange={(v: string) => setValue('pickupTime', v)}
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

                <InitiateTransactionSheet
                    visible={initiateSheetVisible}
                    onClose={() => setInitiateSheetVisible(false)}
                    onConfirm={handleSubmit(onSubmit)}
                    title="Initiate Touring Transaction request?"
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
            </TransactionLayout>
        </View>
    );
}
