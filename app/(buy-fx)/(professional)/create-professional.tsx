import ControlledInput from '@/components/ControlledInput';
import InitiateTransactionSheet from '@/components/InitiateTransactionSheet';
import LoadingBackdrop from '@/components/LoadingBackdrop';
import BankDetailsStep from '@/components/transaction-flow/BankDetailsStep';
import CredentialStep from '@/components/transaction-flow/CredentialStep';
import DocumentStep from '@/components/transaction-flow/DocumentStep';
import ExchangeStep from '@/components/transaction-flow/ExchangeStep';
import TransactionLayout from '@/components/transaction-flow/TransactionLayout';
import { useCreateTransactionMutation } from '@/hooks/queries/transactions/useCreateTransactionMutation';
import { UploadedFile, UploadedMetadata, useDocumentUpload } from '@/hooks/useDocumentUpload';
import { useExchangeLogic } from '@/hooks/useExchangeLogic';
import { useToastStore } from '@/stores/useToastStore';
import { professionalStep0Schema, professionalStep1Schema, professionalStep2Schema, professionalStep3Schema } from '@/utils/validations/professional';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import { z } from 'zod';

const professionalFormSchema = z.object({
    ...professionalStep0Schema.shape,
    ...professionalStep1Schema.shape,
    ...professionalStep2Schema.shape,
    ...professionalStep3Schema.shape
});

type ProfessionalFormValues = z.infer<typeof professionalFormSchema>;

export default function ProfessionalScreen() {
    const router = useRouter();
    const createTransaction = useCreateTransactionMutation();
    const showToast = useToastStore(s => s.showToast);

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
            bvn: '',
            nin: '',
            formAId: '',
            passportNumber: '',
            evidenceOfMembership: '',
            invoiceNumber: '',
            amount: 0,
            bankName: '',
            accountNumber: '',
            accountName: '',
            iban: '',
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
    } = useExchangeLogic({ setValue, initialAmount: '1' });

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

    const credentialFields = [
        { customComponent: <ControlledInput control={control} name="bvn" label="Bank Verification Number(BVN)" placeholder="Enter your BVN" required keyboardType="numeric" /> },
        { customComponent: <ControlledInput control={control} name="nin" label="National Identification Number(NIN)" placeholder="Enter your NIN" required keyboardType="numeric" /> },
        { customComponent: <ControlledInput control={control} name="formAId" label="Form A ID" placeholder="Enter Form A ID" required /> },
        { customComponent: <ControlledInput control={control} name="passportNumber" label="International Passport Number" placeholder="Enter international passport" required /> },
    ];

    const documentFields = [
        {
            label: 'Evidence of Membership',
            onUpload: () => uploadFile('MEMBERSHIP_CARD'),
            fileName: docs.membership.file?.name,
            fileUri: docs.membership.file?.uri,            fileUrl: docs.membership.meta?.fileUrl,
            fileType: docs.membership.file?.type,
            required: true,
            associatedInputs: (
                <View>
                    <ControlledInput control={control} name="evidenceOfMembership" label="Evidence of Membership" placeholder="Enter evidence of membership" required />
                </View>
            )
        },
        {
            label: 'Invoice from Professional Body',
            onUpload: () => uploadFile('INVOICE'),
            fileName: docs.invoice.file?.name,
            fileUri: docs.invoice.file?.uri,            fileUrl: docs.invoice.meta?.fileUrl,
            fileType: docs.invoice.file?.type,
            required: true,
            associatedInputs: (
                <View>
                    <ControlledInput control={control} name="invoiceNumber" label="Invoice from Professional Body" placeholder="Enter invoice number" required />
                </View>
            )
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
            isStepValid = await trigger(['evidenceOfMembership', 'invoiceNumber']);
        } else if (currentStep === 2) {
            isStepValid = await trigger(['amount']);
        } else if (currentStep === 3) {
            isStepValid = await trigger(['bankName', 'accountNumber', 'accountName', 'iban']);
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
            evidenceOfMembership: data.evidenceOfMembership,
            invoiceNumber: data.invoiceNumber,
            documents: [
                ...(docs.membership.meta ? [docs.membership.meta] : []),
                ...(docs.invoice.meta ? [docs.invoice.meta] : []),
            ],
            paymentDetails: {
                name: data.accountName,
                accountNumber: data.accountNumber,
                accountName: data.accountName,
                bankName: data.bankName,
                iban: data.iban,
            },
        };

        createTransaction.mutate(payload, {
            onSuccess: (response) => {
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

    const bankName = watch('bankName');
    const accountNumber = watch('accountNumber');

    return (
        <View style={{ flex: 1 }}>
            <LoadingBackdrop visible={isUploading} />
            <TransactionLayout
                title="Professional"
                currentStep={currentStep}
                totalSteps={4}
                onBack={handleBack}
                onNext={handleNext}
                nextLabel={currentStep === 3 ? (bankName && accountNumber ? "Initiate Transaction Request" : "Continue") : "Continue"}
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
                    <BankDetailsStep control={control} />
                )}

                <InitiateTransactionSheet
                    visible={initiateSheetVisible}
                    onClose={() => setInitiateSheetVisible(false)}
                    onConfirm={handleSubmit(onSubmit)}
                    title="Initiate Professional Transaction request?"
                    loading={createTransaction.isPending}
                    items={[
                        {
                            title: "Verification before approval",
                            description: "Your supporting documents (exam registration, training invoice, or admission letter) must be verified before your request can be processed.",
                            iconType: 'verify'
                        },
                        {
                            title: "Maximum of $2,000 per quarter",
                            description: "The maximum amount allowed for professional exams or training fees is $2,000 per year, according to CBN guidelines.",
                            iconType: 'limit'
                        }
                    ]}
                />
            </TransactionLayout>
        </View>
    );
}
