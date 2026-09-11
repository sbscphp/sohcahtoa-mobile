import ControlledDatePicker from '@/components/ControlledDatePicker';
import ControlledInput from '@/components/ControlledInput';
import GenericSelectionSheet, { SelectionItem } from '@/components/GenericSelectionSheet';
import InitiateTransactionSheet from '@/components/InitiateTransactionSheet';
import LoadingBackdrop from '@/components/LoadingBackdrop';
import AddNewAccountStep from '@/components/transaction-flow/AddNewAccountStep';
import { Ionicons } from '@expo/vector-icons';
import { useAttachBankAccountsMutation } from '@/hooks/queries/transactions/useAttachBankAccountsMutation';
import CredentialStep from '@/components/transaction-flow/CredentialStep';
import DocumentStep from '@/components/transaction-flow/DocumentStep';
import ExchangeStep from '@/components/transaction-flow/ExchangeStep';
import HospitalBankDetailsStep from '@/components/transaction-flow/HospitalBankDetailsStep';
import TransactionLayout from '@/components/transaction-flow/TransactionLayout';
import RefundBankDetailsStep from '@/components/transaction-flow/RefundBankDetailsStep';
import { useProfileQuery } from '@/hooks/queries/auth/useProfileQuery';
import { useGetBanksQuery } from '@/hooks/queries/banks/useGetBanksQuery';
import { useGetSavedAccountsQuery } from '@/hooks/queries/banks/useGetSavedAccountsQuery';
import { useLookupAccountMutation } from '@/hooks/queries/banks/useResolveAccountMutation';
import { useSaveAccountMutation } from '@/hooks/queries/banks/useSaveAccountMutation';
import { useCreateTransactionMutation } from '@/hooks/queries/transactions/useCreateTransactionMutation';
import { useGetTransactionsQuery } from '@/hooks/queries/transactions/useGetTransactionsQuery';
import { formatDateToPickerFormat, getCurrencySymbol } from '@/utils/helpers';
import { UploadedFile, UploadedMetadata, useDocumentUpload } from '@/hooks/useDocumentUpload';
import { useExchangeLogic } from '@/hooks/useExchangeLogic';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToastStore } from '@/stores/useToastStore';
import { medicalStep0Schema, medicalStep1Schema, medicalStep2Schema, medicalStep3Schema } from '@/utils/validations/medical';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { View, Text, TouchableOpacity } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { z } from 'zod';

const PAYOUT_METHODS: SelectionItem[] = [
    { id: '1', label: 'Electronic Transfer (100%)', value: 'Electronic Transfer (100%)' },
    { id: '2', label: 'Card (100%)', value: 'Card (100%)' },
    { id: '3', label: 'Card (75%) + Cash (25%)', value: 'Card (75%) + Cash (25%)' },
];

const medicalFormSchema = medicalStep0Schema
    .merge(medicalStep1Schema)
    .merge(medicalStep2Schema)
    .merge(z.object({
        payoutMethod: z.string().optional().or(z.literal('')),
        customerBankName: z.string().optional().or(z.literal('')),
        customerBankCode: z.string().optional().or(z.literal('')),
        customerAccountNumber: z.string().optional().or(z.literal('')),
        customerAccountName: z.string().optional().or(z.literal('')),
    }))
    .merge(medicalStep3Schema);

type MedicalFormValues = z.infer<typeof medicalFormSchema>;

export default function MedicalPaymentScreen() {
    const router = useRouter();
    const createTransaction = useCreateTransactionMutation();
    const attachBankAccountsMutation = useAttachBankAccountsMutation();
    const showToast = useToastStore(s => s.showToast);
    const { data: profileResponse } = useProfileQuery();
    const profile = profileResponse?.data;
    const profileBvn = profile?.bvn;
    const profileNin = profile?.nin;
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
            nin: user?.kyc?.nin || '',
            formAId: '',
            passportDocumentNumber: '',
            passportIssueDate: '',
            passportExpiryDate: '',
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
            otherBankDetails: '',
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


    const [docs, setDocs] = useState({
        passport: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
        visa: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
        returnTicket: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
        referenceLetter: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
        overseaDoctorLetter: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
        invoice: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
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
            else if (documentType === 'INVOICE') updateDoc('invoice', file, metadata);
        },
        onError: () => showToast('Failed to upload document. Please try again.', 'error'),
    });

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

    const credentialFields = [
        { customComponent: <ControlledInput control={control} name="bvn" label="Bank Verification Number (BVN)" placeholder="Enter your BVN" required keyboardType="numeric" maxLength={11} filterType="numeric" disabled /> },
        { customComponent: <ControlledInput control={control} name="nin" label="National Identification Number" placeholder="Enter your NIN" keyboardType="numeric" maxLength={11} filterType="numeric" disabled /> },
        { customComponent: <ControlledInput control={control} name="formAId" label="Form A ID" placeholder="Enter Form A ID" required maxLength={10} /> },
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
            ),
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
            fileName: docs.returnTicket.file?.name,
            fileUri: docs.returnTicket.file?.uri, fileUrl: docs.returnTicket.meta?.fileUrl,
            fileType: docs.returnTicket.file?.type,
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
            isStepValid = await trigger(['bvn', 'nin', 'formAId', 'passportDocumentNumber']);
        } else if (currentStep === 1) {
            if (!docs.passport.file || !docs.visa.file || !docs.returnTicket.file || !docs.referenceLetter.file || !docs.overseaDoctorLetter.file) {
                showToast('Please upload all required documents', 'error');
                return;
            }
            isStepValid = await trigger(['passportIssueDate', 'passportExpiryDate']);
        } else if (currentStep === 2) {
            isStepValid = await trigger(['amount']);
        } else if (currentStep === 3) {
            const beneficiaryCountry = watchedFields.beneficiaryCountry?.toLowerCase() || '';
            const isAustralia = beneficiaryCountry.includes('australia');
            const isUSA = beneficiaryCountry.includes('united states') || beneficiaryCountry.includes('usa') || beneficiaryCountry === 'canada';
            const isIndia = beneficiaryCountry.includes('india');
            const isUK = beneficiaryCountry.includes('united kingdom') || beneficiaryCountry === 'uk';

            const fieldsToTrigger = [
                'beneficiaryCountry', 'bankAccountName', 'beneficiaryAddress', 'bankName', 'bankAccountNumber',
                'bankAccountAddress', 'bankAccountSwiftCode', 'paymentReference', 'organizationName'
            ];
            if (isAustralia) fieldsToTrigger.push('bsbCode');
            if (isUSA) fieldsToTrigger.push('routingNumber');
            if (isIndia) fieldsToTrigger.push('ifscCode', 'purposeCode');
            if (isUK) fieldsToTrigger.push('bankAccountIban');

            isStepValid = await trigger(fieldsToTrigger as any);
        } else if (currentStep === 4) {
            isStepValid = !!selectedSavedAccountId;
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
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        } else {
            router.back();
        }
    };

    const onSubmit = (data: MedicalFormValues) => {
        const payload = {
            type: 'MEDICAL',
             mode: "BUY",
            currency: currencyGet.code,
            amount: data.amount,
            purpose: 'Medical Fee Payment',
            destinationCountry: currencyGet.country,
            bvn: data.bvn,
            nin: data.nin,
            formAId: data.formAId,
            passportDocumentNumber: data.passportDocumentNumber,
            passportIssueDate: data.passportIssueDate,
            passportExpiryDate: data.passportExpiryDate,
            documents: [
                ...(docs.passport.meta ? [docs.passport.meta] : []),
                ...(docs.visa.meta ? [docs.visa.meta] : []),
                ...(docs.returnTicket.meta ? [docs.returnTicket.meta] : []),
                ...(docs.referenceLetter.meta ? [docs.referenceLetter.meta] : []),
                ...(docs.overseaDoctorLetter.meta ? [docs.overseaDoctorLetter.meta] : []),
                ...(docs.invoice.meta ? [docs.invoice.meta] : []),
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
                otherBankDetails: data.otherBankDetails,
                correspondenceBankName: data.correspondenceBankName,
                correspondenceBankAddress: data.correspondenceBankAddress,
                correspondenceBankSwiftCode: data.correspondenceBankSwiftCode,
            },
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
                        pathname: '/(buy-fx)/(medical)/request-initiated-success',
                        params: { transactionId }
                    });
                }
            },
        });
    };

    const isStep0Valid = !!(
        (profileBvn || (watchedFields.bvn && watchedFields.bvn.length === 11)) &&
        (profileNin || (watchedFields.nin && watchedFields.nin.length === 11)) &&
        watchedFields.formAId && watchedFields.formAId.length === 10 &&
        watchedFields.passportDocumentNumber && watchedFields.passportDocumentNumber.length === 9
    );
    const isStep1Valid = !!(docs.passport.meta && docs.visa.meta && docs.returnTicket.meta && docs.referenceLetter.meta && docs.overseaDoctorLetter.meta && watchedFields.passportIssueDate && watchedFields.passportExpiryDate);
    const foreignAmountStr = currencyGet.code !== 'NGN' ? amountGetStr : amountSendStr;
    const foreignAmount = parseFloat(foreignAmountStr.replace(/,/g, '')) || 0;
    const isStep2Valid = watchedFields.amount > 0 && foreignAmount <= 10000;
    const beneficiaryCountryStep4 = watchedFields.beneficiaryCountry?.toLowerCase() || '';
    const isAustralia = beneficiaryCountryStep4?.includes('australia');
    const isUSA = beneficiaryCountryStep4?.includes('united states') || beneficiaryCountryStep4?.includes('usa') || beneficiaryCountryStep4?.includes('canada');
    const isIndia = beneficiaryCountryStep4?.includes('india');
    const isUK = beneficiaryCountryStep4?.includes('united kingdom') || beneficiaryCountryStep4 === 'uk';

    const isStep3Valid = !!(
        watchedFields.beneficiaryCountry &&
        watchedFields.bankAccountName &&
        watchedFields.beneficiaryAddress &&
        watchedFields.bankName &&
        watchedFields.bankAccountNumber &&
        watchedFields.bankAccountAddress &&
        watchedFields.bankAccountSwiftCode &&
        watchedFields.paymentReference &&
        watchedFields.organizationName &&
        (isAustralia ? watchedFields.bsbCode : true) &&
        (isUSA ? watchedFields.routingNumber : true) &&
        (isIndia ? (watchedFields.ifscCode && watchedFields.purposeCode) : true) &&
        (isUK ? watchedFields.bankAccountIban : true)
    );

    const isNewAccountValid = !!(
        watchedFields.customerBankName &&
        watchedFields.customerBankCode &&
        watchedFields.customerAccountNumber?.length === 10 &&
        watchedFields.customerAccountName &&
        !resolveAccount.isPending
    );

    const isStep4Valid = !!selectedSavedAccountId;

    const isNextDisabled = isAddingNewAccount
        ? (!isNewAccountValid || saveAccountMutation.isPending)
        : (
            (currentStep === 0 && !isStep0Valid) ||
            (currentStep === 1 && !isStep1Valid) ||
            (currentStep === 2 && !isStep2Valid) ||
            (currentStep === 3 && !isStep3Valid) ||
            (currentStep === 4 && !isStep4Valid)
        );

    return (
        <View style={{ flex: 1 }}>
            <LoadingBackdrop visible={isUploading || createTransaction.isPending || saveAccountMutation.isPending || attachBankAccountsMutation.isPending} />
            <TransactionLayout
                title="Medical Payment"
                currentStep={currentStep}
                totalSteps={5}
                onBack={handleBack}
                onNext={isAddingNewAccount ? handleSaveNewAccount : handleNext}
                isNextDisabled={isNextDisabled}
                nextLabel={isAddingNewAccount ? "Save" : (currentStep === 4 ? "Initiate Transaction Request" : "Continue")}
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
                        error={errors.amount?.message as string | undefined}
                        isLoading={calculateExchangeRate.isPending}
                    />
                )}

                {currentStep === 3 && (
                    <HospitalBankDetailsStep
                        control={control}
                        watch={watch}
                        setValue={setValue}
                        errors={errors}
                        verificationFile={docs.invoice.file}
                        onUploadInvoice={() => uploadFile('INVOICE')}
                        isUploadingInvoice={isUploading}
                    />
                )}

                {currentStep === 4 && !isAddingNewAccount && (
                    <RefundBankDetailsStep
                        savedAccounts={savedAccounts}
                        selectedSavedAccountId={selectedSavedAccountId}
                        setSelectedSavedAccountId={setSelectedSavedAccountId}
                        setValue={setValue}
                        setIsAddingNewAccount={setIsAddingNewAccount}
                    />
                )}

                {currentStep === 4 && isAddingNewAccount && (
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
                    title="Initiate Medical Transaction request?"
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
                            description: `Please note that the maximum you can transact is ${getCurrencySymbol(currencyGet.code)}5,000 per quarter.`,
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
