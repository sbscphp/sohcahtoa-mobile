import InitiateTransactionSheet from '@/components/InitiateTransactionSheet';
import InputField from '@/components/InputField';
import LoadingBackdrop from '@/components/LoadingBackdrop';
import { LocationItem } from '@/components/LocationSelectionSheet';
import CredentialStep from '@/components/transaction-flow/CredentialStep';
import DocumentStep from '@/components/transaction-flow/DocumentStep';
import ExchangeStep from '@/components/transaction-flow/ExchangeStep';
import MedicalBankDetailsStep from '@/components/transaction-flow/MedicalBankDetailsStep';
import TransactionLayout from '@/components/transaction-flow/TransactionLayout';
import { useCreateTransactionMutation } from '@/hooks/queries/transactions/useCreateTransactionMutation';
import { UploadedFile, useDocumentUpload } from '@/hooks/useDocumentUpload';
import { useToastStore } from '@/stores/useToastStore';
import { medicalStep0Schema, medicalStep2Schema, medicalStep3Schema } from '@/utils/validations/medical';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { z } from 'zod';

interface ValidationErrors {
    [key: string]: string | undefined;
}

const STATES: LocationItem[] = [
    { id: '1', title: 'Lagos State' },
    { id: '2', title: 'Ogun State' },
    { id: '3', title: 'Rivers State' },
    { id: '4', title: 'Kaduna State' },
    { id: '5', title: 'Enugu State' },
    { id: '6', title: 'Kano State' },
];

const CITIES: LocationItem[] = [
    { id: '1', title: 'Ajeromi Local Government' },
    { id: '2', title: 'Agege Local Government' },
    { id: '3', title: 'Alimosho Local Government' },
    { id: '4', title: 'Amuwo Odofin Local Government' },
    { id: '5', title: 'Apapa Local Government' },
    { id: '6', title: 'Badagry Local Government' },
];

const LOCATIONS: LocationItem[] = [
    { id: '1', title: 'Ajeromi Local Government', subtitle: 'Femi Areola Street, Ikeja GRA.' },
    { id: '2', title: 'Agege Local Government', subtitle: 'Femi Areola Street, Ikeja GRA.' },
    { id: '3', title: 'Ikorodu Local Government', subtitle: '23 T.O.S Benson Avenue, Ikorodu.' },
    { id: '4', title: 'Festac Local Government', subtitle: '1st Avenue, Festac Town.' },
];

export default function MedicalPaymentScreen() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const createTransaction = useCreateTransactionMutation();

    // Step 0: Credentials State
    const [bvn, setBvn] = useState('');
    const [nin, setNin] = useState('');
    const [formAId, setFormAId] = useState('');
    const [passportNumber, setPassportNumber] = useState('');

    // Step 2: Exchange State
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

    const [amountGet, setAmountGet] = useState('1'); // Placeholder
    const [amountSend, setAmountSend] = useState('1,500'); // Placeholder

    // Step 3: Bank Details State (Replacing Location)
    const [beneficiaryName, setBeneficiaryName] = useState('');
    const [beneficiaryAddress, setBeneficiaryAddress] = useState('');
    const [beneficiaryBank, setBeneficiaryBank] = useState('');
    const [routingNumber, setRoutingNumber] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [bankAddress, setBankAddress] = useState('');
    const [swiftCode, setSwiftCode] = useState('');

    // Keeping these for now if needed else where
    const [selectedState, setSelectedState] = useState<LocationItem | null>(null);
    const [selectedCity, setSelectedCity] = useState<LocationItem | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(null);

    const [initiateSheetVisible, setInitiateSheetVisible] = useState(false);
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

    const clearError = (field: string) => {
        if (validationErrors[field]) {
            setValidationErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    // Document upload files
    const [formAFile, setFormAFile] = useState<UploadedFile | null>(null);
    const [formAMeta, setFormAMeta] = useState<import('@/hooks/useDocumentUpload').UploadedMetadata | null>(null);
    const [passportFile, setPassportFile] = useState<UploadedFile | null>(null);
    const [passportMeta, setPassportMeta] = useState<import('@/hooks/useDocumentUpload').UploadedMetadata | null>(null);
    const [visaFile, setVisaFile] = useState<UploadedFile | null>(null);
    const [visaMeta, setVisaMeta] = useState<import('@/hooks/useDocumentUpload').UploadedMetadata | null>(null);

    const showToast = useToastStore(s => s.showToast);
    const { upload: uploadFile, isPending: isUploading } = useDocumentUpload({
        onSuccess: (documentType, { file, metadata }) => {
            if (documentType === 'FORM_A_DOCUMENT') { setFormAFile(file); setFormAMeta(metadata); }
            else if (documentType === 'PASSPORT') { setPassportFile(file); setPassportMeta(metadata); }
            else if (documentType === 'VISA') { setVisaFile(file); setVisaMeta(metadata); }
        },
        onError: () => showToast('Failed to upload document. Please try again.', 'error'),
    });

    // --- Configuration ---

    // Fields for Step 0
    const credentialFields = [
        { label: 'Bank Verification Number (BVN)', placeholder: 'Enter your BVN', value: bvn, onChangeText: (v: string) => { setBvn(v); clearError('bvn'); }, required: true, keyboardType: 'numeric' as const, error: validationErrors.bvn },
        { label: 'National Identification Number (NIN)', placeholder: 'Enter your NIN', value: nin, onChangeText: (v: string) => { setNin(v); clearError('nin'); }, required: true, keyboardType: 'numeric' as const, error: validationErrors.nin },
        { label: 'Form A ID', placeholder: 'Enter Form A ID', value: formAId, onChangeText: (v: string) => { setFormAId(v); clearError('formAId'); }, required: true, error: validationErrors.formAId },
        { label: 'International Passport Number', placeholder: 'Enter international passport', value: passportNumber, onChangeText: (v: string) => { setPassportNumber(v); clearError('passportNumber'); }, required: true, error: validationErrors.passportNumber },
    ];

    // Documents for Step 1
    const documentFields = [
        {
            label: 'Form A',
            onUpload: () => uploadFile('FORM_A_DOCUMENT'),
            fileName: formAFile?.name,
            required: true,
        },
        {
            label: 'International Passport',
            onUpload: () => uploadFile('PASSPORT'),
            fileName: passportFile?.name,
            required: true,
        },
        {
            label: 'Valid Visa',
            onUpload: () => uploadFile('VISA'),
            fileName: visaFile?.name,
            required: true,
            associatedInputs: (
                <View>
                    <View style={{ flex: 1 }}>
                        <InputField label='Valid Visa' required placeholder='Enter valid visa number' />
                    </View>
                </View>
            )
        },
    ];

    // --- Handlers ---

    const handleNext = () => {
        if (isUploading) {
            showToast('Please wait for files to finish uploading', 'warning');
            return;
        }
        const errors: ValidationErrors = {};

        if (currentStep === 0) {
            const result = medicalStep0Schema.safeParse({ bvn, nin, formAId, passportNumber });
            if (!result.success) {
                result.error.issues.forEach((e: z.ZodIssue) => {
                    const key = e.path[0] as string;
                    if (!errors[key]) errors[key] = e.message;
                });
            }
        }

        if (currentStep === 2) {
            const result = medicalStep2Schema.safeParse({ amount: parseFloat(amountGet.replace(/,/g, '')) });
            if (!result.success) {
                result.error.issues.forEach((e: z.ZodIssue) => {
                    if (!errors.amount) errors.amount = e.message;
                });
            }
        }

        if (currentStep === 3) {
            const result = medicalStep3Schema.safeParse({ beneficiaryName, beneficiaryAddress, beneficiaryBank, accountNumber });
            if (!result.success) {
                result.error.issues.forEach((e: z.ZodIssue) => {
                    const key = e.path[0] as string;
                    if (!errors[key]) errors[key] = e.message;
                });
            }
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        setValidationErrors({});
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        } else {
            setInitiateSheetVisible(true);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        } else {
            router.back();
        }
    };

    const handleConfirmInitiate = () => {
        const payload = {
            type: 'MEDICAL',
            currency: currencyGet.code,
            amount: parseFloat(amountGet.replace(/,/g, '')),
            purpose: 'Medical Fee Payment',
            destinationCountry: currencyGet.country,
            bvn,
            nin,
            formAId,
            documents: [
                ...(formAMeta ? [formAMeta] : []),
                ...(passportMeta ? [passportMeta] : []),
                ...(visaMeta ? [visaMeta] : []),
            ],
            beneficiaryDetails: {
                name: beneficiaryName,
                accountNumber,
                accountName: beneficiaryName,
                bankName: beneficiaryBank,
                iban: swiftCode,
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

    return (
        <>
            <LoadingBackdrop visible={isUploading || createTransaction.isPending} />
            <TransactionLayout
                title="Medical Fee"
                currentStep={currentStep}
                totalSteps={4}
                onBack={handleBack}
                onNext={handleNext}
                nextLabel={currentStep === 3 ? (beneficiaryName && accountNumber ? "Initiate Transaction Request" : "Continue") : "Continue"}
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
                        rate={`1 ${currencyGet.code} = 1500 ${currencySend.code}`}
                        onAmountGetChange={setAmountGet}
                        onAmountSendChange={setAmountSend}
                        allowedModes={['buy']}
                    />
                )}

                {currentStep === 3 && (
                    <MedicalBankDetailsStep
                        beneficiaryName={beneficiaryName}
                        setBeneficiaryName={setBeneficiaryName}
                        beneficiaryAddress={beneficiaryAddress}
                        setBeneficiaryAddress={setBeneficiaryAddress}
                        beneficiaryBank={beneficiaryBank}
                        setBeneficiaryBank={setBeneficiaryBank}
                        routingNumber={routingNumber}
                        setRoutingNumber={setRoutingNumber}
                        accountNumber={accountNumber}
                        setAccountNumber={setAccountNumber}
                        bankAddress={bankAddress}
                        setBankAddress={setBankAddress}
                        swiftCode={swiftCode}
                        setSwiftCode={setSwiftCode}
                    />
                )}

                <InitiateTransactionSheet
                    visible={initiateSheetVisible}
                    onClose={() => setInitiateSheetVisible(false)}
                    onConfirm={handleConfirmInitiate}
                    title="Initiate Medical FX request?"
                    items={[
                        {
                            title: "Verification before approval",
                            description: "Your medical documents, hospital invoice, and referral letter must be verified and approved before your request can be processed.",
                            iconType: 'verify'
                        },
                        {
                            title: "Maximum of $5,000 per quarter",
                            description: "The maximum amount you can request for foreign medical payments is $5,000 per quarter, in line with CBN guidelines.",
                            iconType: 'limit'
                        }
                    ]}
                />
            </TransactionLayout>
        </>
    );
}
