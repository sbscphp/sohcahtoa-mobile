import ControlledDatePicker from '@/components/ControlledDatePicker';
import ControlledInput from '@/components/ControlledInput';
import GenericSelectionSheet, { SelectionItem } from '@/components/GenericSelectionSheet';
import InitiateTransactionSheet from '@/components/InitiateTransactionSheet';
import LoadingBackdrop from '@/components/LoadingBackdrop';
import AddNewAccountStep from '@/components/transaction-flow/AddNewAccountStep';

import { useAttachBankAccountsMutation } from '@/hooks/queries/transactions/useAttachBankAccountsMutation';
import CredentialStep from '@/components/transaction-flow/CredentialStep';
import DocumentStep from '@/components/transaction-flow/DocumentStep';
import ExchangeStep from '@/components/transaction-flow/ExchangeStep';
import ProfessionalBankDetailsStep from '@/components/transaction-flow/ProfessionalBankDetailsStep';
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
import { professionalStep0Schema, professionalStep1Schema, professionalStep2Schema, professionalStep3Schema } from '@/utils/validations/professional';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import { z } from 'zod';

const PAYOUT_METHODS: SelectionItem[] = [
    { id: '1', label: 'Electronic Transfer (100%)', value: 'Electronic Transfer (100%)' },
    { id: '2', label: 'Card (100%)', value: 'Card (100%)' },
    { id: '3', label: 'Card (75%) + Cash (25%)', value: 'Card (75%) + Cash (25%)' },
];

const professionalFormSchema = professionalStep0Schema
    .merge(professionalStep1Schema)
    .merge(professionalStep2Schema)
    .merge(z.object({
        payoutMethod: z.string().optional().or(z.literal('')),
        customerBankName: z.string().optional().or(z.literal('')),
        customerBankCode: z.string().optional().or(z.literal('')),
        customerAccountNumber: z.string().optional().or(z.literal('')),
        customerAccountName: z.string().optional().or(z.literal('')),
    }))
    .merge(professionalStep3Schema);
type ProfessionalFormValues = z.infer<typeof professionalFormSchema>;

export default function ProfessionalScreen() {
    const router = useRouter();
    const createTransaction = useCreateTransactionMutation();
    const attachBankAccountsMutation = useAttachBankAccountsMutation();
    const showToast = useToastStore(s => s.showToast);
    const { data: profileResponse } = useProfileQuery();
    const profile = profileResponse?.data;
    const profileBvn = profile?.bvn;
    const profileNin = profile?.nin;
    const user = useAuthStore(s => s.user);
    const isBvnDisabled = !!(profileBvn || user?.kyc?.bvn);
    const isNinDisabled = !!(profileNin || user?.kyc?.nin);

    const [currentStep, setCurrentStep] = useState(0);
    const [initiateSheetVisible, setInitiateSheetVisible] = useState(false);
    const [payoutSheetVisible, setPayoutSheetVisible] = useState(false);
    const [selectedSavedAccountId, setSelectedSavedAccountId] = useState<string | null>('');
    const [isAddingNewAccount, setIsAddingNewAccount] = useState(false);

    const resolver = React.useMemo(() => {
        const dynamicSchema = professionalStep0Schema
            .merge(professionalStep1Schema)
            .merge(professionalStep2Schema)
            .merge(z.object({
                payoutMethod: z.string().optional().or(z.literal('')),
                customerBankName: z.string().optional().or(z.literal('')),
                customerBankCode: z.string().optional().or(z.literal('')),
                customerAccountNumber: z.string().optional().or(z.literal('')),
                customerAccountName: z.string().optional().or(z.literal('')),
            }))
            .merge(professionalStep3Schema)
            .superRefine((data, ctx) => {
                const targetBvn = profileBvn || user?.kyc?.bvn;
                if (!targetBvn) {
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
                const targetNin = profileNin || user?.kyc?.nin;
                if (!targetNin) {
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
            });
        return zodResolver(dynamicSchema);
    }, [profileBvn, profileNin, user]);

    const {
        control,
        handleSubmit,
        trigger,
        watch,
        setValue,
        formState: { errors }
    } = useForm<ProfessionalFormValues>({
        resolver,
        defaultValues: {
            bvn: user?.kyc?.bvn || '',
            nin: user?.kyc?.nin || '',
            formAId: '',
            passportDocumentNumber: '',
            passportIssueDate: '',
            passportExpiryDate: '',
            amount: 0,
            memberName: user?.profile ? `${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim() : '',
            memberNumber: '',
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
            paymentReference: '',
            routingNumber: '',
            ifscCode: '',
            purposeCode: '',
            bsbCode: '',
            correspondenceBankName: '',
            correspondenceBankAddress: '',
            correspondenceBankSwiftCode: '',
            otherBankDetails: '',
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
    } = useExchangeLogic({ setValue, initialAmount: '0', maxLimit: 2000 });

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

    // Document upload state
    const [docs, setDocs] = useState({
        membership: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
        invoice: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
        passport: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
    });

    const updateDoc = (key: keyof typeof docs, file: UploadedFile, metadata: UploadedMetadata) => {
        setDocs(prev => ({ ...prev, [key]: { file, meta: metadata } }));
    };

    const { upload: uploadFile, isPending: isUploading } = useDocumentUpload({
        onSuccess: (documentType, { file, metadata }) => {
            if (documentType === 'MEMBERSHIP_CARD') updateDoc('membership', file, metadata);
            else if (documentType === 'INVOICE') updateDoc('invoice', file, metadata);
            else if (documentType === 'PASSPORT') updateDoc('passport', file, metadata);
        },
        onError: () => showToast('Failed to upload document. Please try again.', 'error'),
    });


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

    React.useEffect(() => {
        if (user?.profile) {
            const fullName = `${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim();
            if (fullName) {
                setValue('memberName', fullName);
            }
        }
    }, [user, setValue]);

    React.useEffect(() => {
        const activeBvn = profileBvn || user?.kyc?.bvn || '';
        const activeNin = profileNin || user?.kyc?.nin || '';

        if (activeBvn && !watchedFields.bvn) {
            setValue('bvn', activeBvn, { shouldValidate: true, shouldDirty: true });
        }
        if (activeNin && !watchedFields.nin) {
            setValue('nin', activeNin, { shouldValidate: true, shouldDirty: true });
        }
    }, [profileBvn, profileNin, user, setValue, watchedFields.bvn, watchedFields.nin]);

    const credentialFields = [
        { customComponent: <ControlledInput control={control} name="bvn" label="Bank Verification Number(BVN)" placeholder="Enter your BVN" required={!isBvnDisabled} keyboardType="numeric" maxLength={11} filterType="numeric" disabled={isBvnDisabled} /> },
        { customComponent: <ControlledInput control={control} name="nin" label="National Identification Number(NIN)" placeholder="Enter your NIN" required={!isNinDisabled} keyboardType="numeric" maxLength={11} filterType="numeric" disabled={isNinDisabled} /> },
        { customComponent: <ControlledInput control={control} name="formAId" label="Form A ID" placeholder="Enter Form A ID" required keyboardType="numeric" maxLength={10} filterType="numeric" /> },
        { customComponent: <ControlledInput control={control} name="passportDocumentNumber" label="International Passport Number (Optional)" placeholder="Enter international passport number" maxLength={9} filterType="alphanumeric" /> },
        {
            customComponent: (
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1 }}>
                        <ControlledDatePicker
                            control={control}
                            name="passportIssueDate"
                            label="Passport Issue Date (Optional)"
                            maximumDate={new Date()}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <ControlledDatePicker
                            control={control}
                            name="passportExpiryDate"
                            label="Passport Expiry Date (Optional)"
                            minimumDate={new Date()}
                        />
                    </View>
                </View>
            )
        },
        {
            customComponent: (
                <ControlledInput
                    control={control}
                    name="memberNumber"
                    label="Membership/Registration Number"
                    placeholder="Enter registration or membership number"
                    required
                />
            )
        },
    ];

    const documentFields = [
        {
            label: 'Evidence of Membership or Registration',
            onUpload: () => uploadFile('MEMBERSHIP_CARD'),
            fileName: docs.membership.file?.name,
            fileUri: docs.membership.file?.uri, fileUrl: docs.membership.meta?.fileUrl,
            fileType: docs.membership.file?.type,
            required: true,
        },
        {
            label: 'Invoice from Professional Body',
            onUpload: () => uploadFile('INVOICE'),
            fileName: docs.invoice.file?.name,
            fileUri: docs.invoice.file?.uri, fileUrl: docs.invoice.meta?.fileUrl,
            fileType: docs.invoice.file?.type,
            required: true,
        },
        {
            label: 'International Passport (optional)',
            onUpload: () => uploadFile('PASSPORT'),
            fileName: docs.passport.file?.name,
            fileUri: docs.passport.file?.uri, fileUrl: docs.passport.meta?.fileUrl,
            fileType: docs.passport.file?.type,
            required: false,
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
            const fieldsToTrigger = ['bvn', 'nin', 'formAId', 'memberNumber'];
            if (watchedFields.passportDocumentNumber) fieldsToTrigger.push('passportDocumentNumber');
            if (watchedFields.passportIssueDate) fieldsToTrigger.push('passportIssueDate');
            if (watchedFields.passportExpiryDate) fieldsToTrigger.push('passportExpiryDate');
            isStepValid = await trigger(fieldsToTrigger as any);
        } else if (currentStep === 1) {
            if (!docs.membership.file || !docs.invoice.file) {
                showToast('Please upload all required documents', 'error');
                return;
            }
            isStepValid = true;
        } else if (currentStep === 2) {
            isStepValid = await trigger(['amount']);
        } else if (currentStep === 3) {
            const beneficiaryCountry = watchedFields.beneficiaryCountry?.toLowerCase();
            const isAustralia = beneficiaryCountry?.includes('australia');
            const isUSA = beneficiaryCountry?.includes('united states') || beneficiaryCountry?.includes('usa');
            const isCanada = beneficiaryCountry?.includes('canada');
            const isIndia = beneficiaryCountry?.includes('india');
            const isUK = beneficiaryCountry?.includes('united kingdom') || beneficiaryCountry === 'uk';

            const fieldsToTrigger = [
                'beneficiaryCountry', 'bankAccountName', 'beneficiaryAddress', 'bankName', 'bankAccountNumber',
                'bankAccountAddress', 'bankAccountSwiftCode', 'paymentReference', 'organizationName'
            ];
            if (isAustralia) fieldsToTrigger.push('bsbCode');
            if (isUSA || isCanada) fieldsToTrigger.push('routingNumber');
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

    const onSubmit = (data: ProfessionalFormValues) => {
        const payload = {
            type: 'PROFESSIONAL_BODY',
             mode: "BUY",
            currency: currencyGet.code,
            amount: data.amount,
            purpose: 'Professional Fees Payment',
            destinationCountry: currencyGet.country,
            bvn: data.bvn,
            nin: data.nin,
            formAId: data.formAId,
            passportDocumentNumber: data.passportDocumentNumber,
            passportIssueDate: data.passportIssueDate,
            passportExpiryDate: data.passportExpiryDate,
            memberName: data.memberName,
            memberNumber: data.memberNumber,
            documents: [
                ...(docs.membership.meta ? [docs.membership.meta] : []),
                ...(docs.invoice.meta ? [docs.invoice.meta] : []),
                ...(docs.passport.meta ? [docs.passport.meta] : []),
            ],
            beneficiaryDetails: {
                organizationName: data.organizationName || '',
                memberName: data.memberName,
                phone: data.beneficiaryPhone || '',
                email: data.beneficiaryEmail || '',
                address: data.beneficiaryAddress,
                city: data.beneficiaryCity || '',
                state: data.beneficiaryState || '',
                country: data.beneficiaryCountry,
                bankAccountName: data.bankAccountName,
                bankAccountAddress: data.bankAccountAddress,
                bankAccountIban: data.bankAccountIban || '',
                bankAccountSwiftCode: data.bankAccountSwiftCode,
                bankAccountNumber: data.bankAccountNumber,
                bankName: data.bankName,
                paymentReference: data.paymentReference,
                routingNumber: data.routingNumber || '',
                ifscCode: data.ifscCode || '',
                purposeCode: data.purposeCode || '',
                bsbCode: data.bsbCode || '',
                correspondenceBankName: data.correspondenceBankName || '',
                correspondenceBankAddress: data.correspondenceBankAddress || '',
                correspondenceBankSwiftCode: data.correspondenceBankSwiftCode || '',
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
                        pathname: '/(buy-fx)/(professional)/request-initiated-success',
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
        watchedFields.memberNumber && watchedFields.memberNumber.trim().length > 0 &&
        (!watchedFields.passportDocumentNumber || watchedFields.passportDocumentNumber.length === 9)
    );
    const isStep1Valid = !!(docs.membership.meta && docs.invoice.meta);
    const foreignAmountStr = currencyGet.code !== 'NGN' ? amountGetStr : amountSendStr;
    const foreignAmount = parseFloat(foreignAmountStr.replace(/,/g, '')) || 0;
    const isStep2Valid = watchedFields.amount > 0 && foreignAmount <= 10000;

    const beneficiaryCountryStep4 = watchedFields.beneficiaryCountry?.toLowerCase() || '';
    const isAustralia = beneficiaryCountryStep4?.includes('australia');
    const isUSA = beneficiaryCountryStep4?.includes('united states') || beneficiaryCountryStep4?.includes('usa');
    const isCanada = beneficiaryCountryStep4?.includes('canada');
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
        watchedFields.memberName &&
        watchedFields.memberNumber &&
        (isAustralia ? watchedFields.bsbCode : true) &&
        ((isUSA || isCanada) ? watchedFields.routingNumber : true) &&
        (isIndia ? (watchedFields.ifscCode && watchedFields.purposeCode) : true) &&
        (isUK ? watchedFields.bankAccountIban : true)
    );

    const isStep4Valid = !!selectedSavedAccountId;

    const isNextDisabled =
        (currentStep === 0 && !isStep0Valid) ||
        (currentStep === 1 && !isStep1Valid) ||
        (currentStep === 2 && !isStep2Valid) ||
        (currentStep === 3 && !isStep3Valid) ||
        (currentStep === 4 && !isStep4Valid);

    return (
        <View style={{ flex: 1 }}>
            <LoadingBackdrop visible={isUploading || createTransaction.isPending || saveAccountMutation.isPending || attachBankAccountsMutation.isPending} />
            <TransactionLayout
                title="Professional Fees"
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
                        error={errors.amount?.message}
                    />
                )}

                {currentStep === 3 && (
                    <ProfessionalBankDetailsStep
                        control={control}
                        watch={watch}
                        setValue={setValue}
                        errors={errors}
                        invoiceFile={docs.invoice.file}
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
                    title="Initiate Professional Transaction request?"
                    loading={createTransaction.isPending}
                    items={[
                        {
                            title: "Request Summary",
                            description: `You are requesting ${getCurrencySymbol(currencyGet.code)}${amountGetStr} ${currencyGet.code.toUpperCase()}. You will pay approximately ₦${amountSendStr}`,
                            iconType: 'info'
                        },
                        {
                            title: "Maximum Limit",
                            description: `Please note that the maximum you can transact is ${getCurrencySymbol('USD')}2,000 per quarter.`,
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
