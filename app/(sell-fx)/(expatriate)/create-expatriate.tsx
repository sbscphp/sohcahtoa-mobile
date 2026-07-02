import ControlledDatePicker from '@/components/ControlledDatePicker';
import ControlledInput from '@/components/ControlledInput';
import FileUpload from '@/components/FileUpload';
import GenericSelectionSheet, { SelectionItem } from '@/components/GenericSelectionSheet';
import InitiateTransactionSheet from '@/components/InitiateTransactionSheet';
import LoadingBackdrop from '@/components/LoadingBackdrop';
import AddNewAccountStep from '@/components/transaction-flow/AddNewAccountStep';
import ExchangeStep from '@/components/transaction-flow/ExchangeStep';
import LocationStep from '@/components/transaction-flow/LocationStep';
import PayoutMethodStep from '@/components/transaction-flow/PayoutMethodStep';
import TransactionLayout from '@/components/transaction-flow/TransactionLayout';
import { useProfileQuery } from '@/hooks/queries/auth/useProfileQuery';
import { useGetBanksQuery } from '@/hooks/queries/banks/useGetBanksQuery';
import { useGetSavedAccountsQuery } from '@/hooks/queries/banks/useGetSavedAccountsQuery';
import { useLookupAccountMutation } from '@/hooks/queries/banks/useResolveAccountMutation';
import { useSaveAccountMutation } from '@/hooks/queries/banks/useSaveAccountMutation';
import { useCreateTransactionMutation } from '@/hooks/queries/transactions/useCreateTransactionMutation';
import { useGetTransactionsQuery } from '@/hooks/queries/transactions/useGetTransactionsQuery';
import { useAttachBankAccountsMutation } from '@/hooks/queries/transactions/useAttachBankAccountsMutation';
import { formatDateToPickerFormat } from '@/utils/helpers';
import { UploadedFile, UploadedMetadata, useDocumentUpload } from '@/hooks/useDocumentUpload';
import { useExchangeLogic } from '@/hooks/useExchangeLogic';
import SourceOfFundsSheet from '@/components/SourceOfFundsSheet';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToastStore } from '@/stores/useToastStore';
import { useDeclarationStore } from '@/stores/useDeclarationStore';
import { LocationItem } from '@/utils/locations';
import {
    expatriateStep0Schema,
    expatriateStep1Schema,
    expatriateStep2Schema
} from '@/utils/validations/expatriate';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Text, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import { z } from 'zod';

import { useGetPickupCitiesQuery } from '@/hooks/queries/transactions/useGetPickupCitiesQuery';
import { useGetPickupPointsQuery } from '@/hooks/queries/transactions/useGetPickupPointsQuery';
import { useGetPickupStatesQuery } from '@/hooks/queries/transactions/useGetPickupStatesQuery';

const PAYOUT_METHODS: SelectionItem[] = [
    { id: '1', label: 'Electronic Transfer (to a naira acct)', value: 'Electronic Transfer' },
    { id: '2', label: 'Prepaid NGN Card', value: 'Prepaid NGN Card' }
];

const expatriateFormSchema = z.object({
    ...expatriateStep0Schema.shape,
    ...expatriateStep1Schema.shape,
    ...expatriateStep2Schema.shape,
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

    // Expatriates must provide domiciliary details for refunds
    if (!data.domiciliaryAccountNumber) {
        ctx.addIssue({ code: "custom", message: 'Please enter domiciliary account number', path: ['domiciliaryAccountNumber'] });
    } else if (data.domiciliaryAccountNumber.length !== 10 || !/^\d+$/.test(data.domiciliaryAccountNumber)) {
        ctx.addIssue({ code: "custom", message: 'Domiciliary account number must be exactly 10 digits', path: ['domiciliaryAccountNumber'] });
    }

    if (!data.domiciliaryBankName) {
        ctx.addIssue({ code: "custom", message: 'Please enter domiciliary bank name', path: ['domiciliaryBankName'] });
    } else if (data.domiciliaryBankName.trim().length < 2) {
        ctx.addIssue({ code: "custom", message: 'Please enter a valid bank name', path: ['domiciliaryBankName'] });
    }

    if (!data.domiciliaryAccountName) {
        ctx.addIssue({ code: "custom", message: 'Please enter account name', path: ['domiciliaryAccountName'] });
    } else if (data.domiciliaryAccountName.trim().length < 3 || !/^[A-Za-z\s.\-]+$/.test(data.domiciliaryAccountName)) {
        ctx.addIssue({ code: "custom", message: 'Please enter a valid account name (letters only)', path: ['domiciliaryAccountName'] });
    }

    if (!data.domiciliarySwiftCode) {
        ctx.addIssue({ code: "custom", message: 'Please enter SWIFT code', path: ['domiciliarySwiftCode'] });
    } else if (!/^[A-Za-z0-9]{8}$|^[A-Za-z0-9]{11}$/.test(data.domiciliarySwiftCode)) {
        ctx.addIssue({ code: "custom", message: 'SWIFT code must be exactly 8 or 11 alphanumeric characters', path: ['domiciliarySwiftCode'] });
    }

    if (!data.domiciliaryRoutingNumber) {
        ctx.addIssue({ code: "custom", message: 'Please enter routing number', path: ['domiciliaryRoutingNumber'] });
    } else if (data.domiciliaryRoutingNumber.length !== 9 || !/^\d+$/.test(data.domiciliaryRoutingNumber)) {
        ctx.addIssue({ code: "custom", message: 'Routing number must be exactly 9 digits', path: ['domiciliaryRoutingNumber'] });
    }

    if (!data.domiciliaryBankAddress) {
        ctx.addIssue({ code: "custom", message: 'Please enter bank address', path: ['domiciliaryBankAddress'] });
    } else if (data.domiciliaryBankAddress.trim().length < 5) {
        ctx.addIssue({ code: "custom", message: 'Please enter a valid bank address (min 5 characters)', path: ['domiciliaryBankAddress'] });
    }

    if (data.passportIssueDate && data.passportExpiryDate && data.passportIssueDate === data.passportExpiryDate) {
        ctx.addIssue({
            code: "custom",
            message: 'Passport Expiry Date cannot be the same as Passport Issue Date',
            path: ['passportExpiryDate']
        });
    }
});

type ExpatriateFormValues = z.infer<typeof expatriateFormSchema>;

export default function CreateExpatriateScreen() {
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
    } = useForm<ExpatriateFormValues>({
        resolver: zodResolver(expatriateFormSchema),
        defaultValues: {
            bvn: user?.kyc?.bvn || '',
            nin: user?.kyc?.nin || '',
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
        },
        mode: 'onChange'
    });

    const watchedFields = watch() as any;
    const isElectronicTransfer = watchedFields.payoutMethod?.includes('Electronic') || watchedFields.payoutMethod === 'Electronic Transfer';

    useEffect(() => {
        if (user?.kyc?.nin) {
            setValue('nin', user.kyc.nin);
        }
    }, [user?.kyc?.nin, setValue]);



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

    const [docs, setDocs] = useState({
        workPermit: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
        passport: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
        utility: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
        signature: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
    });

    const updateDoc = (key: keyof typeof docs, file: UploadedFile, metadata: UploadedMetadata) => {
        setDocs(prev => ({ ...prev, [key]: { file, meta: metadata } }));
    };

    const showToast = useToastStore(s => s.showToast);

    const { upload: uploadFile, isPending: isUploading } = useDocumentUpload({
        onSuccess: (documentType, { file, metadata }) => {
            if (documentType === 'WORK_PERMIT') updateDoc('workPermit', file, metadata);
            else if (documentType === 'PASSPORT') updateDoc('passport', file, metadata);
            else if (documentType === 'UTILITY_BILL') updateDoc('utility', file, metadata);
            else if (documentType === 'DIGITAL_SIGNATURE') updateDoc('signature', file, metadata);
        },
        onError: () => showToast('Failed to upload document. Please try again.', 'error'),
    });

    // Step 2: Exchange
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

    // Step 3: Pickup
    const [initiateSheetVisible, setInitiateSheetVisible] = useState(false);
    const [showSourceOfFundsSheet, setShowSourceOfFundsSheet] = useState(false);
    const [initials, setInitials] = useState('');
    const { proofOfFunds, isDeclarationCompleted } = useDeclarationStore();

    useEffect(() => {
        useDeclarationStore.getState().reset();
    }, []);

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

        if (currentStep === 0) {
            isStepValid = await trigger(['nin', 'passportDocumentNumber']);
        } else if (currentStep === 1) {
            if (!docs.workPermit.file || !docs.passport.file || !docs.utility.file) {
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

            const fieldsToTrigger: any[] = [
                'payoutMethod',
                'domiciliaryAccountNumber',
                'domiciliaryBankName',
                'domiciliaryAccountName',
                'domiciliarySwiftCode',
                'domiciliaryRoutingNumber',
                'domiciliaryBankAddress'
            ];
            if (isElectronicTransfer) {
                fieldsToTrigger.push('customerBankName', 'customerBankCode', 'customerAccountNumber', 'customerAccountName');
            }
            isStepValid = await trigger(fieldsToTrigger);
        } else if (currentStep === 4) {
            isStepValid = await trigger(['selectedState', 'selectedCity', 'selectedLocation', 'pickupDate', 'pickupTime']);
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

    const onSubmit = (data: ExpatriateFormValues) => {
        const formatDateForApi = (dateStr?: string): string => {
            if (!dateStr) return '';
            const parts = dateStr.split('/');
            if (parts.length === 3) {
                return `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
            return dateStr;
        };

        const payload: any = {
            type: 'EXPATRIATE_FX',
            mode: "SELL",
            currency: currencyGet.code,
            amount: Number(data.amount),
            purpose: 'I am a foreigner living or working in Nigeria',
            destinationCountry: currencyGet.country,
            bvn: data.bvn,
            nin: data.nin,
            passportDocumentNumber: data.passportDocumentNumber,
            passportIssueDate: data.passportIssueDate,
            passportExpiryDate: data.passportExpiryDate,
            documents: [
                ...(docs.workPermit.meta ? [docs.workPermit.meta] : []),
                ...(docs.passport.meta ? [docs.passport.meta] : []),
                ...(docs.utility.meta ? [docs.utility.meta] : []),
                ...((docs.signature.meta && useDeclarationStore.getState().declarationMethod === 'signature') ? [docs.signature.meta] : []),
                ...proofOfFunds.map(p => p.metadata),
            ],
            payoutMethod: data.payoutMethod,
            beneficiaryDetails: {
                bankName: data.customerBankName,
                bankCode: data.customerBankCode,
                accountNumber: data.customerAccountNumber,
                accountName: data.customerAccountName,
            },
            domiciliaryDetails: {
                accountNumber: data.domiciliaryAccountNumber,
                bankName: data.domiciliaryBankName,
                accountName: data.domiciliaryAccountName,
                swiftCode: data.domiciliarySwiftCode,
                routingNumber: data.domiciliaryRoutingNumber,
                bankAddress: data.domiciliaryBankAddress,
            },
            declarationMethod: useDeclarationStore.getState().declarationMethod || undefined,
            declarationInitials: useDeclarationStore.getState().declarationMethod === 'initials' ? initials : undefined,
        };

        if (!isElectronicTransfer && data.selectedLocation) {
            payload.pickupLocation = {
                name: data.selectedLocation.title,
                address: data.selectedLocation.subtitle || '',
                state: data.selectedState?.title || '',
                city: data.selectedCity?.title || '',
                scheduledPickupDate: formatDateForApi(data.pickupDate),
                scheduledPickupTime: data.pickupTime,
            };
        }

        // console.log(JSON.stringify(payload, null, 2), "PAYLOAD");

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
                        pathname: '/(sell-fx)/(expatriate)/success',
                        params: {
                            transactionId: response.data.transactionId,
                        },
                    });
                }
            },
        });
    };

    const isStep0Valid = !!watchedFields.passportDocumentNumber;
    const isStep1Valid = !!(docs.workPermit.meta && docs.passport.meta && docs.utility.meta &&
        watchedFields.passportIssueDate && watchedFields.passportExpiryDate);
    const foreignAmountStr = currencyGet.code !== 'NGN' ? amountGet : amountSend;
    const foreignAmount = parseFloat(foreignAmountStr.replace(/,/g, '')) || 0;
    const hasProofOfFunds = proofOfFunds.length > 0;
    const isStep2Valid = watchedFields.amount > 0 && (foreignAmount < 10000 || (hasProofOfFunds && isDeclarationCompleted));
    
    const isStep3Valid = watchedFields.payoutMethod &&
        (!isElectronicTransfer || (watchedFields.customerBankName && watchedFields.customerBankCode && watchedFields.customerAccountNumber && watchedFields.customerAccountName)) &&
        (watchedFields.domiciliaryAccountNumber &&
         watchedFields.domiciliaryBankName &&
         watchedFields.domiciliaryAccountName &&
         watchedFields.domiciliarySwiftCode &&
         watchedFields.domiciliaryRoutingNumber &&
         watchedFields.domiciliaryBankAddress);

    const isNextDisabled =
        (currentStep === 0 && !isStep0Valid) ||
        (currentStep === 1 && !isStep1Valid) ||
        (currentStep === 2 && !isStep2Valid) ||
        (currentStep === 3 && !isStep3Valid);

    return (
        <View style={{ flex: 1 }}>
            <LoadingBackdrop visible={isUploading || createTransaction.isPending} />
            <TransactionLayout
                title="Expatriate"
                currentStep={currentStep}
                totalSteps={4}
                onBack={handleBack}
                onNext={isAddingNewAccount ? handleSaveNewAccount : handleNext}
                isNextDisabled={isNextDisabled}
                nextLabel={isAddingNewAccount ? "Save" : (currentStep === 3 ? "Initiate Transaction Request" : "Continue")}
            >
                {currentStep === 0 && (
                    <View style={styles.container}>
                        <Text style={styles.sectionTitle}>{"Enter Bank Verification Number (BVN),National Identification Number (NIN) and International Passport"}</Text>

                        <ControlledInput
                            control={control}
                            name="bvn"
                            label="Bank Verification Number (BVN)"
                            placeholder="Enter BVN"
                            required
                            keyboardType="numeric"
                            maxLength={11}
                            filterType="numeric"
                            disabled
                        />

                        <ControlledInput
                            control={control}
                            name="nin"
                            label="National Identification Number (NIN)"
                            placeholder="Enter NIN"
                            keyboardType="numeric"
                            maxLength={11}
                            filterType="numeric"
                            disabled
                        />

                        <ControlledInput
                            control={control}
                            name="passportDocumentNumber"
                            label="International Passport Number"
                            placeholder="Enter international passport number"
                            required
                            filterType="alphanumeric"
                        />
                    </View>
                )}

                {currentStep === 1 && (
                    <View style={styles.container}>
                        <Text style={styles.sectionTitle}>Upload Relevant Documents</Text>


                        <View style={styles.documentSection}>
                            <Text style={styles.documentLabel}>
                                Work/Residence Permit <Text style={styles.required}>*</Text>
                            </Text>
                            <FileUpload
                                onUpload={() => uploadFile('WORK_PERMIT')}
                                fileName={docs.workPermit.file?.name ?? null}
                                fileUri={docs.workPermit.file?.uri ?? null} fileUrl={docs.workPermit.meta?.fileUrl ?? null}
                                fileType={docs.workPermit.file?.type ?? null}
                            />
                        </View>

                        {/* International Passport */}
                        <View style={styles.documentSection}>
                            <Text style={styles.documentLabel}>
                                International Passport <Text style={styles.required}>*</Text>
                            </Text>
                            <FileUpload
                                onUpload={() => uploadFile('PASSPORT')}
                                fileName={docs.passport.file?.name ?? null}
                                fileUri={docs.passport.file?.uri ?? null} fileUrl={docs.passport.meta?.fileUrl ?? null}
                                fileType={docs.passport.file?.type ?? null}
                            />
                            <View style={{ flexDirection: 'row', gap: moderateScale(12) }}>
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
                        </View>

                        {/* Utility Bill */}
                        <View style={styles.documentSection}>
                            <Text style={styles.documentLabel}>
                                Utility Bill (must not be more than 3 months old) <Text style={styles.required}>*</Text>
                            </Text>
                            <FileUpload
                                onUpload={() => uploadFile('UTILITY_BILL')}
                                fileName={docs.utility.file?.name ?? null}
                                fileUri={docs.utility.file?.uri ?? null} fileUrl={docs.utility.meta?.fileUrl ?? null}
                                fileType={docs.utility.file?.type ?? null}
                            />
                        </View>
                    </View>
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
                        isExpatriate={true}
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
                    title="Initiate Expatriate Transaction request?"
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
                        address: user?.profile?.address || '',
                        passportDocumentNumber: watchedFields.passportDocumentNumber || user?.kyc?.passportDocumentNumber || ''
                    }}
                    transactionDetails={{
                        type: 'Sell FX (Expatriate)',
                        currency: currencyGet.currencyName,
                        amount: `${currencyGet.code} ${amountGet}`,
                        purpose: 'Exchange'
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
    container: {
        gap: '4@vs',
    },
    sectionTitle: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: '16@vs',
    },
    documentSection: {
        marginBottom: '24@vs',
    },
    documentLabel: {
        fontSize: '12.5@ms',
        fontWeight: '400',
        color: '#475569',
        marginBottom: '8@vs',
    },
    required: {
        color: '#EF4444',
    },
});
