import ControlledInput from '@/components/ControlledInput';
import GenericSelectionSheet, { SelectionItem } from '@/components/GenericSelectionSheet';
import InitiateTransactionSheet from '@/components/InitiateTransactionSheet';
import LoadingBackdrop from '@/components/LoadingBackdrop';
import AddNewAccountStep from '@/components/transaction-flow/AddNewAccountStep';
import CredentialStep from '@/components/transaction-flow/CredentialStep';
import DocumentStep from '@/components/transaction-flow/DocumentStep';
import ExchangeStep from '@/components/transaction-flow/ExchangeStep';
import PayoutMethodStep from '@/components/transaction-flow/PayoutMethodStep';
import ProfessionalBankDetailsStep from '@/components/transaction-flow/ProfessionalBankDetailsStep';
import TransactionLayout from '@/components/transaction-flow/TransactionLayout';
import { useProfileQuery } from '@/hooks/queries/auth/useProfileQuery';
import { useGetBanksQuery } from '@/hooks/queries/banks/useGetBanksQuery';
import { useGetSavedAccountsQuery } from '@/hooks/queries/banks/useGetSavedAccountsQuery';
import { useLookupAccountMutation } from '@/hooks/queries/banks/useResolveAccountMutation';
import { useSaveAccountMutation } from '@/hooks/queries/banks/useSaveAccountMutation';
import { useCreateTransactionMutation } from '@/hooks/queries/transactions/useCreateTransactionMutation';
import { UploadedFile, UploadedMetadata, useDocumentUpload } from '@/hooks/useDocumentUpload';
import { useExchangeLogic } from '@/hooks/useExchangeLogic';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToastStore } from '@/stores/useToastStore';
import { medicalStep0Schema, medicalStep1Schema, medicalStep2Schema, medicalStep3Schema } from '@/utils/validations/medical';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import { z } from 'zod';

const PAYOUT_METHODS: SelectionItem[] = [
    { id: '1', label: 'Electronic Transfer (100%)', value: 'Electronic Transfer (100%)' },
    { id: '2', label: 'Card (100%)', value: 'Card (100%)' },
    { id: '3', label: 'Card (75%) + Cash (25%)', value: 'Card (75%) + Cash (25%)', description: 'Maximum amount to be collected as cash is $500' },
];

const medicalFormSchema = medicalStep0Schema
    .merge(medicalStep1Schema)
    .merge(medicalStep2Schema)
    .merge(z.object({
        payoutMethod: z.string().min(1, 'Please select a payout method'),
        customerBankName: z.string().optional().or(z.literal('')),
        customerBankCode: z.string().optional().or(z.literal('')),
        customerAccountNumber: z.string().optional().or(z.literal('')),
        customerAccountName: z.string().optional().or(z.literal('')),
    }))
    .merge(medicalStep3Schema)
    .superRefine((data, ctx) => {
        const isElectronicTransfer = data.payoutMethod === 'Electronic Transfer (100%)' || data.payoutMethod === 'Electronic_Transfer';
        if (isElectronicTransfer) {
            if (!data.customerBankName) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Please select your bank',
                    path: ['customerBankName']
                });
            }
            if (!data.customerBankCode) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Please select your bank',
                    path: ['customerBankCode']
                });
            }
            if (!data.customerAccountNumber || data.customerAccountNumber.length !== 10) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Account number must be 10 digits',
                    path: ['customerAccountNumber']
                });
            }
            if (!data.customerAccountName) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Account name must be resolved',
                    path: ['customerAccountName']
                });
            }
        }
    });

type MedicalFormValues = z.infer<typeof medicalFormSchema>;

export default function MedicalPaymentScreen() {
    const router = useRouter();
    const createTransaction = useCreateTransactionMutation();
    const showToast = useToastStore(s => s.showToast);
    useProfileQuery();
    const user = useAuthStore(s => s.user);

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
        formState: { errors }
    } = useForm<MedicalFormValues>({
        resolver: zodResolver(medicalFormSchema),
        defaultValues: {
            bvn: user?.kyc?.bvn || '',
            nin: '',
            formAId: '',
            passportNumber: '',
            amount: 0,
            organizationName: '',
            beneficiaryPhone: '',
            beneficiaryEmail: '',
            beneficiaryAddress: '',
            beneficiaryCity: '',
            beneficiaryState: '',
            beneficiaryCountry: '',
            bankAccountName: '',
            bankAccountAddress: '',
            bankAccountIban: '',
            bankAccountSwiftCode: '',
            bankAccountNumber: '',
            bankName: '',
            correspondenceBankName: '',
            correspondenceBankAddress: '',
            correspondenceBankSwiftCode: '',
            paymentReference: '',
            bsbCode: '',
            routingNumber: '',
            ifscCode: '',
            purposeCode: '',
            payoutMethod: '',
            customerBankName: '',
            customerBankCode: '',
            customerAccountNumber: '',
            customerAccountName: '',
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
        calculateExchangeRate,
    } = useExchangeLogic({ setValue, initialAmount: '0', maxLimit: 5000 });

   
    const [docs, setDocs] = useState({
        passport: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
        visa: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
        returnTicket: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
        referenceLetter: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
        overseaDoctorLetter: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
    });

    const updateDoc = (key: keyof typeof docs, file: UploadedFile, metadata: UploadedMetadata) => {
        setDocs(prev => ({ ...prev, [key]: { file, meta: metadata } }));
    };

    const { upload: uploadFile, isPending: isUploading } = useDocumentUpload({
        onSuccess: (documentType, { file, metadata }) => {
            if (documentType === 'PASSPORT') updateDoc('passport', file, metadata);
            else if (documentType === 'VISA') updateDoc('visa', file, metadata);
            else if (documentType === 'RETURN_TICKET') updateDoc('returnTicket', file, metadata);
            else if (documentType === 'MEDICAL_LETTER') updateDoc('referenceLetter', file, metadata);
            else if (documentType === 'OVERSEAS_MEDICAL_LETTER') updateDoc('overseaDoctorLetter', file, metadata);
        },
        onError: () => showToast('Failed to upload document. Please try again.', 'error'),
    });

    const watchedFields = watch() as any;

    // Banks and Account Resolution
    const { data: banksResponse } = useGetBanksQuery();
    const banks = React.useMemo(() =>
        (banksResponse?.data || []).map(b => ({ id: b.code, label: b.name, value: b.code })),
        [banksResponse]);

    const { data: savedAccountsResponse } = useGetSavedAccountsQuery();
    const savedAccounts = React.useMemo(() => {
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

    const credentialFields = [
        { customComponent: <ControlledInput control={control} name="bvn" label="Bank Verification Number (BVN)" placeholder="Enter your BVN" required keyboardType="numeric" maxLength={11} filterType="numeric" disabled /> },
        { customComponent: <ControlledInput control={control} name="nin" label="National Identification Number (NIN)" placeholder="Enter your NIN" required keyboardType="numeric" maxLength={11} filterType="numeric" /> },
        { customComponent: <ControlledInput control={control} name="formAId" label="Form A ID" placeholder="Enter Form A ID" required /> },
        { customComponent: <ControlledInput control={control} name="passportNumber" label="International Passport Number" placeholder="Enter international passport" required maxLength={9} filterType="alphanumeric" /> },
    ];

    const documentFields = [
        {
            label: 'International Passport',
            onUpload: () => uploadFile('PASSPORT'),
            fileName: docs.passport.file?.name,
            fileUri: docs.passport.file?.uri, fileUrl: docs.passport.meta?.fileUrl,
            fileType: docs.passport.file?.type,
            required: true,
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
            label: 'Reference Letter (Nigerian Specialist Doctor or Hospital)',
            onUpload: () => uploadFile('MEDICAL_LETTER'),
            fileName: docs.referenceLetter.file?.name,
            fileUri: docs.referenceLetter.file?.uri, fileUrl: docs.referenceLetter.meta?.fileUrl,
            fileType: docs.referenceLetter.file?.type,
            required: true,
        },
        {
            label: 'Letter from oversea doctor stating treatment cost',
            onUpload: () => uploadFile('OVERSEAS_MEDICAL_LETTER'),
            fileName: docs.overseaDoctorLetter.file?.name,
            fileUri: docs.overseaDoctorLetter.file?.uri, fileUrl: docs.overseaDoctorLetter.meta?.fileUrl,
            fileType: docs.overseaDoctorLetter.file?.type,
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
        if (currentStep === 0) {
            isStepValid = await trigger(['bvn', 'nin', 'formAId', 'passportNumber']);
        } else if (currentStep === 1) {
            if (!docs.passport.file || !docs.visa.file || !docs.referenceLetter.file || !docs.overseaDoctorLetter.file) {
                showToast('Please upload all required documents', 'error');
                return;
            }
            isStepValid = true;
        } else if (currentStep === 2) {
            isStepValid = await trigger(['amount']);
        } else if (currentStep === 3) {
            if (isAddingNewAccount) {
                return;
            }
            const isElectronicTransfer = watchedFields.payoutMethod === 'Electronic Transfer (100%)' || watchedFields.payoutMethod === 'Electronic_Transfer';
            const fieldsToTrigger: any[] = ['payoutMethod'];
            if (isElectronicTransfer) {
                fieldsToTrigger.push('customerBankName', 'customerBankCode', 'customerAccountNumber', 'customerAccountName');
            }
            isStepValid = await trigger(fieldsToTrigger);
        } else if (currentStep === 4) {
            const beneficiaryCountry = watchedFields.beneficiaryCountry?.toLowerCase() || '';
            const isAustralia = beneficiaryCountry.includes('australia');
            const isUSA = beneficiaryCountry.includes('united states') || beneficiaryCountry.includes('usa') || beneficiaryCountry === 'canada';
            const isIndia = beneficiaryCountry.includes('india');
            const isUK = beneficiaryCountry.includes('united kingdom') || beneficiaryCountry === 'uk';

            const fieldsToTrigger = [
                'beneficiaryCountry', 'bankAccountName', 'beneficiaryAddress', 'bankName', 'bankAccountNumber',
                'bankAccountAddress', 'bankAccountSwiftCode', 'paymentReference'
            ];
            if (isAustralia) fieldsToTrigger.push('bsbCode');
            if (isUSA) fieldsToTrigger.push('routingNumber');
            if (isIndia) fieldsToTrigger.push('ifscCode', 'purposeCode');
            if (isUK) fieldsToTrigger.push('bankAccountIban');

            isStepValid = await trigger(fieldsToTrigger as any);
        }

        if (isStepValid) {
            if (currentStep < 4) {
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

    const onSubmit = (data: MedicalFormValues) => {
        const payload = {
            type: 'MEDICAL',
            currency: currencyGet.code,
            amount: data.amount,
            purpose: 'Medical Fee Payment',
            destinationCountry: currencyGet.country,
            bvn: data.bvn,
            nin: data.nin,
            formAId: data.formAId,
            passportNumber: data.passportNumber,
            payoutMethod: data.payoutMethod,
            documents: [
                ...(docs.passport.meta ? [docs.passport.meta] : []),
                ...(docs.visa.meta ? [docs.visa.meta] : []),
                ...(docs.referenceLetter.meta ? [docs.referenceLetter.meta] : []),
                ...(docs.overseaDoctorLetter.meta ? [docs.overseaDoctorLetter.meta] : []),
            ],
            beneficiaryDetails: {
                organizationName: data.organizationName,
                phone: data.beneficiaryPhone,
                email: data.beneficiaryEmail,
                address: data.beneficiaryAddress,
                city: data.beneficiaryCity,
                state: data.beneficiaryState,
                country: data.beneficiaryCountry,
                bankAccountName: data.bankAccountName,
                bankAccountAddress: data.bankAccountAddress,
                bankAccountIban: data.bankAccountIban,
                bankAccountSwiftCode: data.bankAccountSwiftCode,
                bankAccountNumber: data.bankAccountNumber,
                bankName: data.bankName,
                paymentReference: data.paymentReference,
                bsbCode: data.bsbCode,
                routingNumber: data.routingNumber,
                ifscCode: data.ifscCode,
                purposeCode: data.purposeCode,
                correspondenceBankName: data.correspondenceBankName,
                correspondenceBankAddress: data.correspondenceBankAddress,
                correspondenceBankSwiftCode: data.correspondenceBankSwiftCode,
            },
            paymentDetails: {
                bankName: data.customerBankName,
                bankCode: data.customerBankCode,
                accountNumber: data.customerAccountNumber,
                accountName: data.customerAccountName,
            }
        };

        createTransaction.mutate(payload, {
            onSuccess: (response: any) => {
                if (response.success) {
                    setInitiateSheetVisible(false);
                    router.push({
                        pathname: '/(buy-fx)/(medical)/request-initiated-success',
                        params: { transactionId: response.data?.transactionId }
                    });
                }
            },
        });
    };

    const isStep0Valid = watchedFields.bvn && watchedFields.nin && watchedFields.formAId && watchedFields.passportNumber;
    const isStep1Valid = docs.passport.meta && docs.visa.meta && docs.referenceLetter.meta && docs.overseaDoctorLetter.meta;
    const isStep2Valid = watchedFields.amount > 0;
    const isElectronicTransfer = watchedFields.payoutMethod === 'Electronic Transfer (100%)' || watchedFields.payoutMethod === 'Electronic_Transfer';
    const isStep3Valid = watchedFields.payoutMethod && (!isElectronicTransfer || (watchedFields.customerBankName && watchedFields.customerBankCode && watchedFields.customerAccountNumber && watchedFields.customerAccountName));
    const beneficiaryCountryStep4 = watchedFields.beneficiaryCountry?.toLowerCase() || '';
    const isAustralia = beneficiaryCountryStep4?.includes('australia');
    const isUSA = beneficiaryCountryStep4?.includes('united states') || beneficiaryCountryStep4?.includes('usa') || beneficiaryCountryStep4?.includes('canada');
    const isIndia = beneficiaryCountryStep4?.includes('india');
    const isUK = beneficiaryCountryStep4?.includes('united kingdom') || beneficiaryCountryStep4 === 'uk';

    const isStep4Valid = !!(
        watchedFields.beneficiaryCountry &&
        watchedFields.bankAccountName &&
        watchedFields.beneficiaryAddress &&
        watchedFields.bankName &&
        watchedFields.bankAccountNumber &&
        watchedFields.bankAccountAddress &&
        watchedFields.bankAccountSwiftCode &&
        watchedFields.paymentReference &&
        (isAustralia ? watchedFields.bsbCode : true) &&
        (isUSA ? watchedFields.routingNumber : true) &&
        (isIndia ? (watchedFields.ifscCode && watchedFields.purposeCode) : true) &&
        (isUK ? watchedFields.bankAccountIban : true)
    );

    const isNextDisabled =
        (currentStep === 0 && !isStep0Valid) ||
        (currentStep === 1 && !isStep1Valid) ||
        (currentStep === 2 && !isStep2Valid) ||
        (currentStep === 3 && !isStep3Valid) ||
        (currentStep === 4 && !isStep4Valid);

    return (
        <View style={{ flex: 1 }}>
            <LoadingBackdrop visible={isUploading || createTransaction.isPending || saveAccountMutation.isPending} />
            <TransactionLayout
                title="Medical Payment"
                currentStep={currentStep}
                totalSteps={5}
                onBack={handleBack}
                onNext={isAddingNewAccount ? handleSaveNewAccount : handleNext}
                isNextDisabled={isNextDisabled}
                nextLabel={isAddingNewAccount ? "Save" : (currentStep === 4 ? (watchedFields.organizationName ? "Initiate Transaction Request" : "Continue") : "Continue")}
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
                        error={errors.amount?.message as string | undefined}
                        isLoading={calculateExchangeRate.isPending}
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

                {currentStep === 4 && (
                    <ProfessionalBankDetailsStep control={control} watch={watch} setValue={setValue} errors={errors} />
                )}

                <InitiateTransactionSheet
                    visible={initiateSheetVisible}
                    onClose={() => setInitiateSheetVisible(false)}
                    onConfirm={handleSubmit(onSubmit)}
                    title="Initiate Medical Transaction request?"
                    loading={createTransaction.isPending}
                    items={[
                        {
                            title: "",
                            description: "Please note that the maximum you can transact is $5,000 per quarter.",
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
