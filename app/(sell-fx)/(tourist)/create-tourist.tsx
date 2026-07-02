
import ControlledDatePicker from '@/components/ControlledDatePicker';
import ControlledInput from '@/components/ControlledInput';
import InitiateTransactionSheet from '@/components/InitiateTransactionSheet';
import LoadingBackdrop from '@/components/LoadingBackdrop';
import SourceOfFundsSheet from '@/components/SourceOfFundsSheet';
import CredentialStep from '@/components/transaction-flow/CredentialStep';
import DocumentStep from '@/components/transaction-flow/DocumentStep';
import ExchangeStep from '@/components/transaction-flow/ExchangeStep';
import LocationStep from '@/components/transaction-flow/LocationStep';
import TransactionLayout from '@/components/transaction-flow/TransactionLayout';
import { useProfileQuery } from '@/hooks/queries/auth/useProfileQuery';
import { useCreateTransactionMutation } from '@/hooks/queries/transactions/useCreateTransactionMutation';
import { useGetTransactionsQuery } from '@/hooks/queries/transactions/useGetTransactionsQuery';
import { useAttachBankAccountsMutation } from '@/hooks/queries/transactions/useAttachBankAccountsMutation';
import { formatDateToPickerFormat } from '@/utils/helpers';
import { UploadedFile, UploadedMetadata, useDocumentUpload } from '@/hooks/useDocumentUpload';
import { useExchangeLogic } from '@/hooks/useExchangeLogic';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToastStore } from '@/stores/useToastStore';
import { useDeclarationStore } from '@/stores/useDeclarationStore';
import { LocationItem } from '@/utils/locations';
import {
    touristStep0Schema,
    touristStep1Schema,
    touristStep2Schema,
    touristStep3LocationSchema,
} from '@/utils/validations/tourist';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React, { useMemo, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import { z } from 'zod';

import { useGetPickupCitiesQuery } from '@/hooks/queries/transactions/useGetPickupCitiesQuery';
import { useGetPickupPointsQuery } from '@/hooks/queries/transactions/useGetPickupPointsQuery';
import { useGetPickupStatesQuery } from '@/hooks/queries/transactions/useGetPickupStatesQuery';
import AddNewAccountStep from '@/components/transaction-flow/AddNewAccountStep';
import PayoutMethodStep from '@/components/transaction-flow/PayoutMethodStep';
import { useGetBanksQuery } from '@/hooks/queries/banks/useGetBanksQuery';
import { useGetSavedAccountsQuery } from '@/hooks/queries/banks/useGetSavedAccountsQuery';
import { useLookupAccountMutation } from '@/hooks/queries/banks/useResolveAccountMutation';
import { useSaveAccountMutation } from '@/hooks/queries/banks/useSaveAccountMutation';
import GenericSelectionSheet, { SelectionItem } from '@/components/GenericSelectionSheet';

const PAYOUT_METHODS: SelectionItem[] = [
    { id: '1', label: 'Electronic Transfer (to a naira acct)', value: 'Electronic Transfer' },
    { id: '2', label: 'Prepaid NGN Card', value: 'Prepaid NGN Card' }
];

const touristFormSchema = z.object({
    ...touristStep0Schema.shape,
    ...touristStep1Schema.shape,
    ...touristStep2Schema.shape,
    payoutMethod: z.string().min(1, 'Please select a payout method'),
    customerBankName: z.string().optional().or(z.literal('')),
    customerBankCode: z.string().optional().or(z.literal('')),
    customerAccountNumber: z.string().optional().or(z.literal('')),
    customerAccountName: z.string().optional().or(z.literal('')),
}).superRefine((data, ctx) => {
    const isElectronicTransfer = data.payoutMethod?.includes('Electronic') || data.payoutMethod === 'Electronic Transfer';

    if (isElectronicTransfer) {
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

    if (data.passportIssueDate && data.passportExpiryDate && data.passportIssueDate === data.passportExpiryDate) {
        ctx.addIssue({
            code: "custom",
            message: 'Passport Expiry Date cannot be the same as Passport Issue Date',
            path: ['passportExpiryDate']
        });
    }
});

type TouristFormValues = z.infer<typeof touristFormSchema>;


export default function CreateTouristScreen() {
    const router = useRouter();
    const createTransaction = useCreateTransactionMutation();
    const attachBankAccountsMutation = useAttachBankAccountsMutation();
    useProfileQuery();
    const user = useAuthStore(s => s.user);
    const [currentStep, setCurrentStep] = useState(0);

    const {
        control,
        handleSubmit,
        trigger,
        watch,
        setValue,
        formState: { errors }
    } = useForm<TouristFormValues>({
        resolver: zodResolver(touristFormSchema),
        defaultValues: {
            passportDocumentNumber: '',
            nigerianAddress: '',
            passportIssueDate: '',
            passportExpiryDate: '',
            amount: 0,
            payoutMethod: '',
            customerBankName: '',
            customerBankCode: '',
            customerAccountNumber: '',
            customerAccountName: '',
            selectedState: undefined as unknown as LocationItem,
            selectedCity: undefined as unknown as LocationItem,
            selectedLocation: undefined as unknown as LocationItem,
            pickupDate: '',
            pickupTime: '',
        },
        mode: 'onChange'
    });

    // Step 1: Uploaded files
    const [docs, setDocs] = useState({
        passport: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
        visa: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
        ticket: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
        signature: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
    });

    const updateDoc = (key: keyof typeof docs, file: UploadedFile, metadata: UploadedMetadata) => {
        setDocs(prev => ({ ...prev, [key]: { file, meta: metadata } }));
    };

    const showToast = useToastStore(s => s.showToast);

    const { upload: uploadFile, isPending: isUploading } = useDocumentUpload({
        onSuccess: (documentType, { file, metadata }) => {
            if (documentType === 'PASSPORT') updateDoc('passport', file, metadata);
            else if (documentType === 'VISA') updateDoc('visa', file, metadata);
            else if (documentType === 'RETURN_TICKET') updateDoc('ticket', file, metadata);
            else if (documentType === 'DIGITAL_SIGNATURE') updateDoc('signature', file, metadata);
        },
        onError: () => showToast('Failed to upload document. Please try again.', 'error'),
    });

    // Step 2: Exchange State
    const {
        transactionType,
        setTransactionType,
        currencyGet,
        setCurrencyGet,
        currencySend,
        setCurrencySend,
        amountGetStr: amountGet,
        setAmountGetStr: setAmountGet,
        amountSendStr: amountSend,
        setAmountSendStr: setAmountSend,
        currentRate,
    } = useExchangeLogic({ setValue, initialAmount: '', initialTransactionType: 'sell' });

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

    const { data: banksResponse } = useGetBanksQuery();
    const banks = useMemo(
        () => (banksResponse?.data || []).map(b => ({ id: b.code, label: b.name, value: b.code })),
        [banksResponse]
    );

    const { data: savedAccountsResponse } = useGetSavedAccountsQuery();
    const savedAccounts = useMemo(() => {
        return (savedAccountsResponse?.data || []).map((a: any) => {
            const clean = (str: string) => {
                if (!str) return '';
                return str.replace(/\s+/g, ' ').trim();
            };
            return {
                id: a.id,
                bankName: clean(a.bankName),
                accountNumber: clean(a.accountNumber),
                accountName: clean(a.accountName),
                bankCode: a.bankCode || '',
            };
        });
    }, [savedAccountsResponse]);

    const saveAccountMutation = useSaveAccountMutation();
    const resolveAccount = useLookupAccountMutation();

    const [selectedSavedAccountId, setSelectedSavedAccountId] = useState<string | null>('');
    const [isAddingNewAccount, setIsAddingNewAccount] = useState(false);
    const [payoutSheetVisible, setPayoutSheetVisible] = useState(false);

    useEffect(() => {
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

    const isElectronicTransfer = watchedFields.payoutMethod?.includes('Electronic') || watchedFields.payoutMethod === 'Electronic Transfer';

    const [initiateSheetVisible, setInitiateSheetVisible] = useState(false);
    const [showSourceOfFundsSheet, setShowSourceOfFundsSheet] = useState(false);
    const [initials, setInitials] = useState('');
    const { proofOfFunds, isDeclarationCompleted } = useDeclarationStore();

    useEffect(() => {
        useDeclarationStore.getState().reset();
    }, []);

    // Configuration for Step 0
    const credentialFields = [
        {
            customComponent: (
                <ControlledInput
                    control={control}
                    name="passportDocumentNumber"
                    label="International Passport Number"
                    placeholder="Enter international passport number"
                    required
                    filterType="alphanumeric"
                />
            )
        },
        {
            customComponent: (
                <ControlledInput
                    control={control}
                    name="nigerianAddress"
                    label="Nigerian Address (temporary stay address e.g., hotel)"
                    placeholder="Enter temporary stay address"
                    required
                />
            )
        }
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
                        <ControlledDatePicker
                            control={control}
                            name="passportIssueDate"
                            label="Passport Issue Date"
                            required
                            maximumDate={new Date()}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <ControlledDatePicker
                            control={control}
                            name="passportExpiryDate"
                            label="Passport Expiry Date"
                            required
                            minimumDate={new Date()}
                        />
                    </View>
                </View>
            )
        },
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
            fileName: docs.ticket.file?.name,
            fileUri: docs.ticket.file?.uri, fileUrl: docs.ticket.meta?.fileUrl,
            fileType: docs.ticket.file?.type,
            required: true,
        },
    ];

    const handleNext = async () => {
        if (isUploading) {
            showToast('Please wait for files to finish uploading', 'warning');
            return;
        }

        let isStepValid = false;

        if (currentStep === 0) {
            isStepValid = await trigger(['passportDocumentNumber', 'nigerianAddress']);
        } else if (currentStep === 1) {
            if (!docs.passport.file || !docs.visa.file || !docs.ticket.file) {
                showToast('Please upload all required documents', 'error');
                return;
            }
            isStepValid = await trigger(['passportIssueDate', 'passportExpiryDate']);
        } else if (currentStep === 2) {
            setValue('amount', parseFloat(amountSend.replace(/,/g, '')) || 0);
            isStepValid = await trigger(['amount']);
        } else if (currentStep === 3) {
            if (isAddingNewAccount) {
                return;
            }
            const fieldsToTrigger: any[] = ['payoutMethod'];
            if (isElectronicTransfer) {
                fieldsToTrigger.push('customerBankName', 'customerBankCode', 'customerAccountNumber', 'customerAccountName');
            }
            isStepValid = await trigger(fieldsToTrigger);
        }

        if (isStepValid) {
            if (currentStep < 3) {
                setCurrentStep(currentStep + 1);
            } else {
                setInitiateSheetVisible(true);
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        } else {
            router.back();
        }
    };

    const onSubmit = (data: TouristFormValues) => {
        const formatDateForApi = (dateStr: string): string => {
            if (!dateStr) return '';
            const parts = dateStr.split('/');
            if (parts.length === 3) {
                return `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
            return dateStr;
        };

        const payload: any = {
            type: 'TOURIST_FX',
            mode: 'SELL',
            currency: currencyGet.code,
            amount: Number(data.amount),
            purpose: 'I am touring Nigeria and want Naira',
            destinationCountry: currencyGet.country,
            documents: [
                ...(docs.passport.meta ? [docs.passport.meta] : []),
                ...(docs.visa.meta ? [docs.visa.meta] : []),
                ...(docs.ticket.meta ? [docs.ticket.meta] : []),
                ...((docs.signature.meta && useDeclarationStore.getState().declarationMethod === 'signature') ? [docs.signature.meta] : []),
                ...proofOfFunds.map(p => p.metadata),
            ],
            passportDocumentNumber: data.passportDocumentNumber,
            passportIssueDate: data.passportIssueDate,
            passportExpiryDate: data.passportExpiryDate,
            nigerianAddress: data.nigerianAddress,
            payoutMethod: data.payoutMethod,
            beneficiaryDetails: {
                bankName: data.customerBankName,
                bankCode: data.customerBankCode,
                accountNumber: data.customerAccountNumber,
                accountName: data.customerAccountName,
            },
            declarationMethod: useDeclarationStore.getState().declarationMethod || undefined,
            declarationInitials: useDeclarationStore.getState().declarationMethod === 'initials' ? initials : undefined,
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
                        pathname: '/(sell-fx)/(tourist)/success',
                        params: {
                            transactionId: response.data.transactionId,
                        },
                    });
                }
            },
        });
    };

    const isStep0Valid = !!(watchedFields.passportDocumentNumber && watchedFields.nigerianAddress);
    const isStep1Valid = !!(docs.passport.meta && docs.visa.meta && docs.ticket.meta &&
        watchedFields.passportIssueDate && watchedFields.passportExpiryDate);
    const foreignAmountStr = currencyGet.code !== 'NGN' ? amountGet : amountSend;
    const foreignAmount = parseFloat(foreignAmountStr.replace(/,/g, '')) || 0;
    const hasProofOfFunds = proofOfFunds.length > 0;
    const isStep2Valid = watchedFields.amount > 0 && (foreignAmount < 10000 || (hasProofOfFunds && isDeclarationCompleted));

    const isStep3Valid = watchedFields.payoutMethod && (!isElectronicTransfer || (watchedFields.customerBankName && watchedFields.customerBankCode && watchedFields.customerAccountNumber && watchedFields.customerAccountName));

    const isNextDisabled =
        (currentStep === 0 && !isStep0Valid) ||
        (currentStep === 1 && !isStep1Valid) ||
        (currentStep === 2 && !isStep2Valid) ||
        (currentStep === 3 && !isStep3Valid);

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

    return (
        <View style={{ flex: 1 }}>
            <LoadingBackdrop visible={isUploading || createTransaction.isPending || saveAccountMutation.isPending} />
            <TransactionLayout
                title={"Tourist"}
                currentStep={currentStep}
                totalSteps={4}
                onBack={handleBack}
                onNext={isAddingNewAccount ? handleSaveNewAccount : handleNext}
                isNextDisabled={isNextDisabled}
                nextLabel={isAddingNewAccount ? "Save" : (currentStep === 3 ? "Initiate Transaction Request" : "Continue")}
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
                        amountGet={amountGet}
                        amountSend={amountSend}
                        rate={`1 ${currencySend.code} = ${currentRate.toLocaleString()} ${currencyGet.code}`}
                        onAmountGetChange={setAmountGet}
                        onAmountSendChange={setAmountSend}
                        allowedModes={['sell']}
                        error={errors.amount?.message as string | undefined}
                        showLimitWarning
                        onLimitWarningPress={() => router.push('/proof-of-fund')}
                        onDownloadPress={() => setShowSourceOfFundsSheet(true)}
                    />
                )}

                {currentStep === 3 && !isAddingNewAccount && (
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

                {currentStep === 3 && isAddingNewAccount && (
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
                    title="Initiate Tourist Transaction request?"
                    loading={createTransaction.isPending}
                    items={[
                        {
                            title: "Request Summary",
                            description: `You are selling ${currencySend.code === 'USD' ? '$' : currencySend.code === 'GBP' ? '£' : currencySend.code === 'EUR' ? '€' : ''}${amountSend}. You will be sent approximately N${amountGet}`,
                            iconType: 'info'
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

                <SourceOfFundsSheet
                    visible={showSourceOfFundsSheet}
                    onClose={() => setShowSourceOfFundsSheet(false)}
                    onSubmit={(method) => {
                        useDeclarationStore.getState().setDeclarationCompleted(true, method, initials);
                        setShowSourceOfFundsSheet(false);
                    }}
                    customerInfo={{
                        fullName: `${user?.profile?.firstName || ''} ${user?.profile?.lastName || ''}`,
                        phoneNumber: user?.phoneNumber || '',
                        email: user?.email || '',
                        bvn: user?.kyc?.bvn || '',
                        address: watchedFields.nigerianAddress || user?.profile?.address || '',
                        passportDocumentNumber: watchedFields.passportDocumentNumber || user?.kyc?.passportDocumentNumber || ''
                    }}
                    transactionDetails={{
                        type: 'Sell FX (Tourist)',
                        currency: currencyGet.currencyName,
                        amount: `${currencyGet.code} ${amountGet}`,
                        purpose: 'Travel'
                    }}
                    onUploadSignature={() => uploadFile('DIGITAL_SIGNATURE')}
                    signatureFile={docs.signature.file?.name}
                    isUploadingSignature={isUploading}
                    initials={initials}
                    onChangeInitials={setInitials}
                />
            </TransactionLayout>
        </View>
    );
}

const styles = ScaledSheet.create({
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: '30@ms',
        padding: '4@ms',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        height: '38@vs',
    },
    toggleButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '26@ms',
    },
    activeToggleButton: {
        backgroundColor: '#0F172A',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    toggleText: {
        fontSize: '13@ms',
        fontWeight: '500',
        color: '#64748B',
    },
    activeToggleText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#0F172A'
    },
});

