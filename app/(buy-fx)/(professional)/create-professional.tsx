import ControlledInput from '@/components/ControlledInput';
import InitiateTransactionSheet from '@/components/InitiateTransactionSheet';
import LoadingBackdrop from '@/components/LoadingBackdrop';
import ProfessionalBankDetailsStep from '@/components/transaction-flow/ProfessionalBankDetailsStep';
import CustomerBankDetailsStep from '@/components/transaction-flow/CustomerBankDetailsStep';
import CredentialStep from '@/components/transaction-flow/CredentialStep';
import DocumentStep from '@/components/transaction-flow/DocumentStep';
import ExchangeStep from '@/components/transaction-flow/ExchangeStep';
import TransactionLayout from '@/components/transaction-flow/TransactionLayout';
import { useCreateTransactionMutation } from '@/hooks/queries/transactions/useCreateTransactionMutation';
import { useProfileQuery } from '@/hooks/queries/auth/useProfileQuery';
import { UploadedFile, UploadedMetadata, useDocumentUpload } from '@/hooks/useDocumentUpload';
import { useExchangeLogic } from '@/hooks/useExchangeLogic';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToastStore } from '@/stores/useToastStore';
import { useGetBanksQuery } from '@/hooks/queries/banks/useGetBanksQuery';
import { useResolveAccountMutation } from '@/hooks/queries/banks/useResolveAccountMutation';
import { professionalStep0Schema, professionalStep1Schema, professionalStep2Schema, professionalStep3Schema } from '@/utils/validations/professional';
import { customerBankDetailsStepSchema } from '@/utils/validations/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import { z } from 'zod';

const professionalFormSchema = professionalStep0Schema
    .merge(professionalStep1Schema)
    .merge(professionalStep2Schema)
    .merge(customerBankDetailsStepSchema)
    .merge(professionalStep3Schema);
type ProfessionalFormValues = z.infer<typeof professionalFormSchema>;

export default function ProfessionalScreen() {
    const router = useRouter();
    const createTransaction = useCreateTransactionMutation();
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
    } = useForm<ProfessionalFormValues>({
        resolver: zodResolver(professionalFormSchema),
        defaultValues: {
            bvn: user?.kyc?.bvn || '',
            nin: '',
            formAId: '',
            passportNumber: '',
            amount: 0,
            memberName: '',
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
            correspondenceBankName: '',
            correspondenceBankAddress: '',
            correspondenceBankSwiftCode: '',
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

    // Document upload state
    const [docs, setDocs] = useState({
        membership: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
        invoice: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
    });

    const updateDoc = (key: keyof typeof docs, file: UploadedFile, metadata: UploadedMetadata) => {
        setDocs(prev => ({ ...prev, [key]: { file, meta: metadata } }));
    };

    const { upload: uploadFile, isPending: isUploading } = useDocumentUpload({
        onSuccess: (documentType, { file, metadata }) => {
            if (documentType === 'MEMBERSHIP_CARD') updateDoc('membership', file, metadata);
            else if (documentType === 'INVOICE') updateDoc('invoice', file, metadata);
        },
        onError: () => showToast('Failed to upload document. Please try again.', 'error'),
    });

    const watchedFields = watch();

    // Banks and Account Resolution
    const { data: banksResponse } = useGetBanksQuery();
    const banks = React.useMemo(() => 
        (banksResponse?.data || []).map(b => ({ id: b.id, label: b.name, value: b.code })),
    [banksResponse]);

    const resolveAccount = useResolveAccountMutation();

    React.useEffect(() => {
        if (watchedFields.customerAccountNumber?.length === 10 && watchedFields.customerBankCode) {
            resolveAccount.mutate({
                accountNumber: watchedFields.customerAccountNumber,
                bankCode: watchedFields.customerBankCode
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
    }, [watchedFields.customerAccountNumber, watchedFields.customerBankCode]);

    const credentialFields = [
        { customComponent: <ControlledInput control={control} name="bvn" label="Bank Verification Number(BVN)" placeholder="Enter your BVN" required keyboardType="numeric" maxLength={11} filterType="numeric" disabled /> },
        { customComponent: <ControlledInput control={control} name="nin" label="National Identification Number(NIN)" placeholder="Enter your NIN" required keyboardType="numeric" maxLength={11} filterType="numeric" /> },
        { customComponent: <ControlledInput control={control} name="formAId" label="Form A ID" placeholder="Enter Form A ID" required /> },
        { customComponent: <ControlledInput control={control} name="passportNumber" label="International Passport Number" placeholder="Enter international passport" required maxLength={9} filterType="alphanumeric" /> },
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
    ];

    const handleNext = async () => {
        if (isUploading) {
            showToast('Please wait for files to finish uploading', 'warning');
            return;
        }

        let isStepValid = false;
        if (currentStep === 0) {
            isStepValid = await trigger(['bvn', 'nin', 'formAId', 'passportNumber']);
        } else if (currentStep === 1) {
            if (!docs.membership.file || !docs.invoice.file) {
                showToast('Please upload all required documents', 'error');
                return;
            }
            isStepValid = true;
        } else if (currentStep === 2) {
            isStepValid = await trigger(['amount']);
        } else if (currentStep === 3) {
            isStepValid = await trigger(['customerBankName', 'customerAccountNumber', 'customerAccountName']);
        } else if (currentStep === 4) {
            isStepValid = await trigger([
                'memberName', 'memberNumber', 'organizationName', 'beneficiaryPhone', 'beneficiaryEmail', 
                'beneficiaryAddress', 'beneficiaryCity', 'beneficiaryState', 'beneficiaryCountry',
                'bankAccountName', 'bankAccountAddress', 'bankAccountIban', 'bankAccountSwiftCode', 'bankAccountNumber'
            ]);
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
            currency: currencyGet.code,
            amount: data.amount,
            purpose: 'Professional Fees Payment',
            destinationCountry: currencyGet.country,
            bvn: data.bvn,
            nin: data.nin,
            formAId: data.formAId,
            passportNumber: data.passportNumber,
            memberName: data.memberName,
            memberNumber: data.memberNumber,
            documents: [
                ...(docs.membership.meta ? [docs.membership.meta] : []),
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
                correspondenceBankName: data.correspondenceBankName,
                correspondenceBankAddress: data.correspondenceBankAddress,
                correspondenceBankSwiftCode: data.correspondenceBankSwiftCode,
            },
            customerBankDetails: {
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
                        pathname: '/(buy-fx)/(professional)/request-initiated-success',
                        params: { transactionId: response.data?.transactionId }
                    });
                }
            },
        });
    };

    const isStep0Valid = watchedFields.bvn && watchedFields.nin && watchedFields.formAId && watchedFields.passportNumber;
    const isStep1Valid = docs.membership.meta && docs.invoice.meta;
    const isStep2Valid = watchedFields.amount > 0;
    const isStep3Valid = watchedFields.customerBankName && watchedFields.customerAccountNumber && watchedFields.customerAccountName;
    const isStep4Valid = watchedFields.memberName && watchedFields.memberNumber && 
        watchedFields.organizationName && watchedFields.beneficiaryPhone && watchedFields.beneficiaryEmail && 
        watchedFields.beneficiaryAddress && watchedFields.beneficiaryCity && watchedFields.beneficiaryState && watchedFields.beneficiaryCountry &&
        watchedFields.bankAccountName && watchedFields.bankAccountAddress && watchedFields.bankAccountIban && watchedFields.bankAccountSwiftCode && watchedFields.bankAccountNumber;

    const isNextDisabled =
        (currentStep === 0 && !isStep0Valid) ||
        (currentStep === 1 && !isStep1Valid) ||
        (currentStep === 2 && !isStep2Valid) ||
        (currentStep === 3 && !isStep3Valid) ||
        (currentStep === 4 && !isStep4Valid);

    return (
        <View style={{ flex: 1 }}>
            <LoadingBackdrop visible={isUploading} />
            <TransactionLayout
                title="Professional"
                currentStep={currentStep}
                totalSteps={5}
                onBack={handleBack}
                onNext={handleNext}
                isNextDisabled={isNextDisabled}
                nextLabel={currentStep === 4 ? (watchedFields.memberName ? "Initiate Transaction Request" : "Continue") : "Continue"}
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
                        error={errors.amount?.message}
                    />
                )}

                {currentStep === 3 && (
                    <CustomerBankDetailsStep
                        control={control}
                        setValue={setValue}
                        banks={banks}
                        resolvedAccountName={watchedFields.customerAccountName}
                        isResolving={resolveAccount.isPending}
                    />
                )}

                {currentStep === 4 && (
                    <ProfessionalBankDetailsStep control={control} />
                )}

                <InitiateTransactionSheet
                    visible={initiateSheetVisible}
                    onClose={() => setInitiateSheetVisible(false)}
                    onConfirm={handleSubmit(onSubmit)}
                    title="Initiate Professional Transaction request?"
                    loading={createTransaction.isPending}
                    items={[
                        {
                            title: "",
                            description: "Please note that the maximum you can transact is $2,000 per quarter.",
                            iconType: 'limit'
                        }
                    ]}
                />
            </TransactionLayout>
        </View>
    );
}
