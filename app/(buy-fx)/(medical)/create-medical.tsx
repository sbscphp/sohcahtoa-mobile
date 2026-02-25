import ControlledInput from '@/components/ControlledInput';
import InitiateTransactionSheet from '@/components/InitiateTransactionSheet';
import LoadingBackdrop from '@/components/LoadingBackdrop';
import CredentialStep from '@/components/transaction-flow/CredentialStep';
import DocumentStep from '@/components/transaction-flow/DocumentStep';
import ExchangeStep from '@/components/transaction-flow/ExchangeStep';
import MedicalBankDetailsStep from '@/components/transaction-flow/MedicalBankDetailsStep';
import TransactionLayout from '@/components/transaction-flow/TransactionLayout';
import { useCalculateExchangeRateMutation } from '@/hooks/queries/transactions/useCalculateExchangeRateMutation';
import { useCreateTransactionMutation } from '@/hooks/queries/transactions/useCreateTransactionMutation';
import { useGetExchangeRatesQuery } from '@/hooks/queries/transactions/useGetExchangeRatesQuery';
import { useDocumentUpload } from '@/hooks/useDocumentUpload';
import { useToastStore } from '@/stores/useToastStore';
import { medicalStep0Schema, medicalStep2Schema, medicalStep3Schema } from '@/utils/validations/medical';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import { z } from 'zod';

const medicalFormSchema = z.object({
    ...medicalStep0Schema.shape,
    ...medicalStep2Schema.shape,
    ...medicalStep3Schema.shape
});

type MedicalFormValues = z.infer<typeof medicalFormSchema>;

export default function MedicalPaymentScreen() {
    const router = useRouter();
    const createTransaction = useCreateTransactionMutation();
    const calculateExchangeRate = useCalculateExchangeRateMutation();
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
    } = useForm<MedicalFormValues>({
        resolver: zodResolver(medicalFormSchema),
        defaultValues: {
            bvn: '',
            nin: '',
            formAId: '',
            passportNumber: '',
            amount: 0,
            beneficiaryName: '',
            beneficiaryAddress: '',
            beneficiaryBank: '',
            routingNumber: '',
            accountNumber: '',
            bankAddress: '',
            swiftCode: '',
        },
        mode: 'onChange'
    });

    const [transactionType, setTransactionType] = useState<'buy' | 'sell'>('buy');
    const [currencyGet, setCurrencyGet] = useState({
        code: 'USD',
        country: 'United States',
        currencyName: 'Dollar',
        flagUrl: 'https://flagcdn.com/w80/us.png'
    });
    const [currencySend, setCurrencySend] = useState({
        code: 'NGN',
        country: 'Nigeria',
        currencyName: 'Naira',
        flagUrl: 'https://flagcdn.com/w80/ng.png'
    });

    const [amountGetStr, setAmountGetStr] = useState('1');
    const [amountSendStr, setAmountSendStr] = useState('0');
    const [currentRate, setCurrentRate] = useState(0);

    const { data: exchangeRates } = useGetExchangeRatesQuery({
        fromCurrency: currencyGet.code,
        toCurrency: currencySend.code
    });

    useEffect(() => {
        if (exchangeRates?.data?.[0]?.sellRate) {
            setCurrentRate(exchangeRates.data[0].sellRate);
        }
    }, [exchangeRates]);

    const handleAmountGetChange = (amount: string) => {
        const cleanAmount = amount.replace(/,/g, '');
        setAmountGetStr(amount);
        setValue('amount', parseFloat(cleanAmount) || 0);

        if (cleanAmount && !isNaN(parseFloat(cleanAmount))) {
            calculateExchangeRate.mutate({
                fromCurrency: currencyGet.code,
                toCurrency: currencySend.code,
                amount: parseFloat(cleanAmount)
            }, {
                onSuccess: (response) => {
                    if (response.success && response.data) {
                        setAmountSendStr(response.data.convertedAmount.toLocaleString());
                        setCurrentRate(response.data.sellRate);
                    }
                }
            });
        } else {
            setAmountSendStr('0');
        }
    };

    const handleCurrencyChange = (type: 'GET' | 'SEND', currency: any) => {
        if (type === 'GET') {
            setCurrencyGet(currency);
        } else {
            setCurrencySend(currency);
        }

        const cleanAmount = amountGetStr.replace(/,/g, '');
        if (cleanAmount && !isNaN(parseFloat(cleanAmount))) {
            calculateExchangeRate.mutate({
                fromCurrency: type === 'GET' ? currency.code : currencyGet.code,
                toCurrency: type === 'SEND' ? currency.code : currencySend.code,
                amount: parseFloat(cleanAmount)
            }, {
                onSuccess: (response) => {
                    if (response.success && response.data) {
                        setAmountSendStr(response.data.convertedAmount.toLocaleString());
                        setCurrentRate(response.data.sellRate);
                    }
                }
            });
        }
    };

    // Document upload state
    const [formAFile, setFormAFile] = useState<any>(null);
    const [formAMeta, setFormAMeta] = useState<any>(null);
    const [passportFile, setPassportFile] = useState<any>(null);
    const [passportMeta, setPassportMeta] = useState<any>(null);
    const [visaFile, setVisaFile] = useState<any>(null);
    const [visaMeta, setVisaMeta] = useState<any>(null);
    const [returnTicketFile, setReturnTicketFile] = useState<any>(null);
    const [returnTicketMeta, setReturnTicketMeta] = useState<any>(null);
    const [referenceLetterFile, setReferenceLetterFile] = useState<any>(null);
    const [referenceLetterMeta, setReferenceLetterMeta] = useState<any>(null);
    const [overseaDoctorLetterFile, setOverseaDoctorLetterFile] = useState<any>(null);
    const [overseaDoctorLetterMeta, setOverseaDoctorLetterMeta] = useState<any>(null);

    const { upload: uploadFile, isPending: isUploading } = useDocumentUpload({
        onSuccess: (documentType, { file, metadata }) => {
            if (documentType === 'FORM_A_DOCUMENT') { setFormAFile(file); setFormAMeta(metadata); }
            else if (documentType === 'PASSPORT') { setPassportFile(file); setPassportMeta(metadata); }
            else if (documentType === 'VISA') { setVisaFile(file); setVisaMeta(metadata); }
            else if (documentType === 'RETURN_TICKET') { setReturnTicketFile(file); setReturnTicketMeta(metadata); }
            else if (documentType === 'MEDICAL_LETTER') { setReferenceLetterFile(file); setReferenceLetterMeta(metadata); }
            else if (documentType === 'OVERSEAS_MEDICAL_LETTER') { setOverseaDoctorLetterFile(file); setOverseaDoctorLetterMeta(metadata); }
        },
        onError: () => showToast('Failed to upload document. Please try again.', 'error'),
    });

    const credentialFields = [
        { customComponent: <ControlledInput control={control} name="bvn" label="Bank Verification Number (BVN)" placeholder="Enter your BVN" required keyboardType="numeric" /> },
        { customComponent: <ControlledInput control={control} name="nin" label="National Identification Number (NIN)" placeholder="Enter your NIN" required keyboardType="numeric" /> },
        { customComponent: <ControlledInput control={control} name="formAId" label="Form A ID" placeholder="Enter Form A ID" required /> },
        { customComponent: <ControlledInput control={control} name="passportNumber" label="International Passport Number" placeholder="Enter international passport" required /> },
    ];

    const documentFields = [
        {
            label: 'Form A',
            onUpload: () => uploadFile('FORM_A_DOCUMENT'),
            fileName: formAFile?.name,
            fileUri: formAFile?.uri,
            fileType: formAFile?.type,
            required: true,
        },
        {
            label: 'International Passport',
            onUpload: () => uploadFile('PASSPORT'),
            fileName: passportFile?.name,
            fileUri: passportFile?.uri,
            fileType: passportFile?.type,
            required: true,
        },
        {
            label: 'Valid Visa',
            onUpload: () => uploadFile('VISA'),
            fileName: visaFile?.name,
            fileUri: visaFile?.uri,
            fileType: visaFile?.type,
            required: true,
        },
        {
            label: 'Return Ticket',
            onUpload: () => uploadFile('RETURN_TICKET'),
            fileName: returnTicketFile?.name,
            fileUri: returnTicketFile?.uri,
            fileType: returnTicketFile?.type,
            required: true,
        },
        {
            label: 'Reference Letter',
            onUpload: () => uploadFile('MEDICAL_LETTER'),
            fileName: referenceLetterFile?.name,
            fileUri: referenceLetterFile?.uri,
            fileType: referenceLetterFile?.type,
            required: true,
        },
        {
            label: 'Oversea Doctor Letter',
            onUpload: () => uploadFile('OVERSEAS_MEDICAL_LETTER'),
            fileName: overseaDoctorLetterFile?.name,
            fileUri: overseaDoctorLetterFile?.uri,
            fileType: overseaDoctorLetterFile?.type,
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
            if (!formAFile || !passportFile || !visaFile || !returnTicketFile || !referenceLetterFile || !overseaDoctorLetterFile) {
                showToast('Please upload all required documents', 'error');
                return;
            }
            isStepValid = true; // No extra fields in step 1 schema for medical natively, just files
        } else if (currentStep === 2) {
            isStepValid = await trigger(['amount']);
        } else if (currentStep === 3) {
            isStepValid = await trigger(['beneficiaryName', 'beneficiaryAddress', 'beneficiaryBank', 'routingNumber', 'accountNumber', 'bankAddress', 'swiftCode']);
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
            documents: [
                ...(formAMeta ? [formAMeta] : []),
                ...(passportMeta ? [passportMeta] : []),
                ...(visaMeta ? [visaMeta] : []),
                ...(returnTicketMeta ? [returnTicketMeta] : []),
                ...(referenceLetterMeta ? [referenceLetterMeta] : []),
                ...(overseaDoctorLetterMeta ? [overseaDoctorLetterMeta] : []),
            ],
            beneficiaryDetails: {
                name: data.beneficiaryName,
                address: data.beneficiaryAddress,
                swiftCode: data.swiftCode,
                routingNumber: data.routingNumber,
                bankAddress: data.bankAddress,
                accountNumber: data.accountNumber,
                accountName: data.beneficiaryName,
                bankName: data.beneficiaryBank,
                iban: '',
            },
        };

        createTransaction.mutate(payload, {
            onSuccess: (response) => {
                if (response.success) {
                    setInitiateSheetVisible(false);
                    router.push('/(buy-fx)/(medical)/request-initiated-success');
                }
            },
        });
    };

    const beneficiaryName = watch('beneficiaryName');

    return (
        <View style={{ flex: 1 }}>
            <LoadingBackdrop visible={isUploading || createTransaction.isPending} />
            <TransactionLayout
                title="Medical Payment"
                currentStep={currentStep}
                totalSteps={4}
                onBack={handleBack}
                onNext={handleNext}
                nextLabel={currentStep === 3 ? (beneficiaryName ? "Initiate Transaction Request" : "Continue") : "Continue"}
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
                        onCurrencyGetChange={(v: any) => handleCurrencyChange('GET', v)}
                        currencySend={currencySend}
                        onCurrencySendChange={(v: any) => handleCurrencyChange('SEND', v)}
                        amountGet={amountGetStr}
                        amountSend={amountSendStr}
                        rate={`1 ${currencyGet.code} = ${currentRate.toLocaleString()} ${currencySend.code}`}
                        onAmountGetChange={handleAmountGetChange}
                        onAmountSendChange={setAmountSendStr}
                        allowedModes={['buy']}
                        error={errors.amount?.message as string | undefined}
                    />
                )}

                {currentStep === 3 && (
                    <MedicalBankDetailsStep control={control} />
                )}

                <InitiateTransactionSheet
                    visible={initiateSheetVisible}
                    onClose={() => setInitiateSheetVisible(false)}
                    onConfirm={handleSubmit(onSubmit)}
                    title="Initiate Medical Transaction request?"
                    loading={createTransaction.isPending}
                    items={[
                        {
                            title: "Verification before approval",
                            description: "Your supporting documents must be verified before your request can be processed.",
                            iconType: 'verify'
                        },
                        {
                            title: "Required medical documentation",
                            description: "A reference letter from a recognized Nigerian hospital and an acceptance letter from the overseas hospital are mandatory.",
                            iconType: 'limit' // Placeholder icon logic
                        }
                    ]}
                />
            </TransactionLayout>
        </View>
    );
}
