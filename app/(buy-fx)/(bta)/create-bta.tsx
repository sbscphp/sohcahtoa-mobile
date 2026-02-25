import DatePickerField from '@/components/DatePickerField';
import InitiateTransactionSheet from '@/components/InitiateTransactionSheet';
import InputField from '@/components/InputField';
import LoadingBackdrop from '@/components/LoadingBackdrop';
import { LocationItem } from '@/components/LocationSelectionSheet';
import CredentialStep from '@/components/transaction-flow/CredentialStep';
import DocumentStep from '@/components/transaction-flow/DocumentStep';
import ExchangeStep from '@/components/transaction-flow/ExchangeStep';
import LocationStep from '@/components/transaction-flow/LocationStep';
import TransactionLayout from '@/components/transaction-flow/TransactionLayout';
import { useCreateTransactionMutation } from '@/hooks/queries/transactions/useCreateTransactionMutation';
import { UploadedFile, useDocumentUpload } from '@/hooks/useDocumentUpload';
import { useToastStore } from '@/stores/useToastStore';
import { btaStep0Schema, btaStep1Schema, btaStep2Schema, btaStep3Schema } from '@/utils/validations/bta';
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

export default function BusinessTravelAllowanceScreen() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const createTransaction = useCreateTransactionMutation();

    // Step 0: Credentials State
    const [bvn, setBvn] = useState('');
    const [nin, setNin] = useState('');
    const [formAId, setFormAId] = useState('');
    const [tin, setTin] = useState('');
    const [passportNumber, setPassportNumber] = useState('');
    const [passportIssueDate, setPassportIssueDate] = useState('');
    const [passportExpiryDate, setPassportExpiryDate] = useState('');
    const [tccNumber, setTccNumber] = useState('');

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

    // Step 3: Location State
    const [selectedState, setSelectedState] = useState<LocationItem | null>(null);
    const [selectedCity, setSelectedCity] = useState<LocationItem | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(null);
    const [pickupDate, setPickupDate] = useState('');
    const [pickupTime, setPickupTime] = useState('');

    const [initiateSheetVisible, setInitiateSheetVisible] = useState(false);
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

    const clearError = (field: string) => {
        if (validationErrors[field]) {
            setValidationErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    // Document upload files
    const [tccFile, setTccFile] = useState<UploadedFile | null>(null);
    const [tccMeta, setTccMeta] = useState<import('@/hooks/useDocumentUpload').UploadedMetadata | null>(null);
    const [passportFile, setPassportFile] = useState<UploadedFile | null>(null);
    const [passportMeta, setPassportMeta] = useState<import('@/hooks/useDocumentUpload').UploadedMetadata | null>(null);
    const [tinFile, setTinFile] = useState<UploadedFile | null>(null);
    const [tinMeta, setTinMeta] = useState<import('@/hooks/useDocumentUpload').UploadedMetadata | null>(null);

    const showToast = useToastStore(s => s.showToast);
    const { upload: uploadFile, isPending: isUploading } = useDocumentUpload({
        onSuccess: (documentType, { file, metadata }) => {
            if (documentType === 'TCC') { setTccFile(file); setTccMeta(metadata); }
            else if (documentType === 'PASSPORT') { setPassportFile(file); setPassportMeta(metadata); }
            else if (documentType === 'TIN') { setTinFile(file); setTinMeta(metadata); }
        },
        onError: () => showToast('Failed to upload document. Please try again.', 'error'),
    });

    // --- Configuration ---

    // Fields for Step 0
    const credentialFields = [
        { label: 'Bank Verification Number(BVN)', placeholder: 'Enter your BVN', value: bvn, onChangeText: (v: string) => { setBvn(v); clearError('bvn'); }, required: true, keyboardType: 'numeric' as const, error: validationErrors.bvn },
        { label: 'Tax Identification Number(TIN)', placeholder: 'Enter your TIN', value: tin, onChangeText: (v: string) => { setTin(v); clearError('tin'); }, required: true, keyboardType: 'numeric' as const, error: validationErrors.tin },

        { label: 'National Identification Number(NIN)', placeholder: 'Enter your NIN', value: nin, onChangeText: (v: string) => { setNin(v); clearError('nin'); }, required: true, keyboardType: 'numeric' as const, error: validationErrors.nin },
        { label: 'Form A ID', placeholder: 'Enter Form A ID', value: formAId, onChangeText: (v: string) => { setFormAId(v); clearError('formAId'); }, required: true, keyboardType: 'numeric' as const, error: validationErrors.formAId },
        { label: 'International Passport Number', placeholder: 'Enter international passport', value: passportNumber, onChangeText: (v: string) => { setPassportNumber(v); clearError('passportNumber'); }, required: true, error: validationErrors.passportNumber },
    ];

    // Documents for Step 1
    const documentFields = [
        {
            label: 'Tax Clearance Certificate (TCC)',
            onUpload: () => uploadFile('TCC'),
            fileName: tccFile?.name,
            required: true,
            associatedInputs: (
                <View>
                    <InputField label='Tax Clearance Certificate (TCC)' required placeholder='Enter TCC number' value={tccNumber} onChangeText={setTccNumber} keyboardType='numeric' />
                </View>
            )
        },
        {
            label: 'International Passport',
            onUpload: () => uploadFile('PASSPORT'),
            fileName: passportFile?.name,
            required: true,
            associatedInputs: (
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1 }}>
                        <DatePickerField label='Passport Issue Date' value={passportIssueDate} onDateChange={setPassportIssueDate} required maximumDate={new Date()} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <DatePickerField label='Passport Expiry Date' value={passportExpiryDate} onDateChange={setPassportExpiryDate} required minimumDate={new Date()} />
                    </View>
                </View>
            )
        },
        {
            label: 'Tax Identification Number (TIN)',
            onUpload: () => uploadFile('TIN'),
            fileName: tinFile?.name,
            required: true,
            associatedInputs: (
                <View>
                    <InputField label='Tax Identification Number (TIN)' required placeholder='Enter TIN number' value={tccNumber} onChangeText={setTccNumber} keyboardType='numeric' />
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
            const result = btaStep0Schema.safeParse({ bvn, tin, nin, formAId, passportNumber });
            if (!result.success) {
                result.error.issues.forEach((e: z.ZodIssue) => {
                    const key = e.path[0] as string;
                    if (!errors[key]) errors[key] = e.message;
                });
            }
        }

        if (currentStep === 1) {
            const result = btaStep1Schema.safeParse({ tccNumber, passportIssueDate, passportExpiryDate });
            if (!result.success) {
                result.error.issues.forEach((e: z.ZodIssue) => {
                    const key = e.path[0] as string;
                    if (!errors[key]) errors[key] = e.message;
                });
            }
        }
        if (currentStep === 2) {
            const result = btaStep2Schema.safeParse({ amount: parseFloat(amountGet.replace(/,/g, '')) });
            if (!result.success) {
                result.error.issues.forEach((e: z.ZodIssue) => {
                    if (!errors.amount) errors.amount = e.message;
                });
            }
        }

        if (currentStep === 3) {
            const result = btaStep3Schema.safeParse({ selectedState, selectedCity, selectedLocation, pickupDate, pickupTime });
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
        const formatDateForApi = (dateStr: string): string => {
            if (!dateStr) return '';
            const parts = dateStr.split('/');
            if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
            return dateStr;
        };

        const payload = {
            type: 'BTA',
            currency: currencyGet.code,
            amount: parseFloat(amountGet.replace(/,/g, '')),
            purpose: 'Business Travel Allowance (BTA)',
            destinationCountry: currencyGet.country,
            bvn,
            nin,
            formAId,
            documents: [
                ...(tccMeta ? [tccMeta] : []),
                ...(passportMeta ? [passportMeta] : []),
                ...(tinMeta ? [tinMeta] : []),
            ],
            pickupLocation: selectedLocation ? {
                name: selectedLocation.title,
                address: selectedLocation.subtitle || '',
            } : undefined,
        };

        createTransaction.mutate(payload, {
            onSuccess: (response) => {
                if (response.success) {
                    setInitiateSheetVisible(false);
                    router.push('/(buy-fx)/(bta)/request-initiated-success');
                }
            },
        });
    };

    return (
        <>
            <LoadingBackdrop visible={isUploading || createTransaction.isPending} />
            <TransactionLayout
                title="Business Travel Allowance"
                currentStep={currentStep}
                totalSteps={4}
                onBack={handleBack}
                onNext={handleNext}
                nextLabel={currentStep === 3 ? (selectedState && selectedCity ? "Initiate Transaction Request" : "Continue") : "Continue"}
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
                    <LocationStep
                        states={STATES}
                        cities={CITIES}
                        locations={LOCATIONS}
                        selectedState={selectedState}
                        onSelectState={(item) => {
                            setSelectedState(item);
                            setSelectedCity(null);
                            setSelectedLocation(null);
                        }}
                        selectedCity={selectedCity}
                        onSelectCity={(item) => {
                            setSelectedCity(item);
                            setSelectedLocation(null);
                        }}
                        selectedLocation={selectedLocation}
                        onSelectLocation={setSelectedLocation}
                        pickupDate={pickupDate}
                        onPickupDateChange={setPickupDate}
                        pickupTime={pickupTime}
                        onPickupTimeChange={setPickupTime}
                    />
                )}

                <InitiateTransactionSheet
                    visible={initiateSheetVisible}
                    onClose={() => setInitiateSheetVisible(false)}
                    onConfirm={handleConfirmInitiate}
                    title="Initiate BTA Transaction request?"
                    items={[
                        {
                            title: "Verification before approval",
                            description: "You will be able to process your BTA once your documents are verified and approved.",
                            iconType: 'verify'
                        },
                        {
                            title: "Maximum of $5,000 per quarter",
                            description: "The maximum you can transact under BTA is $5,000 per quarter for each eligible business traveler.",
                            iconType: 'limit'
                        }
                    ]}
                />
            </TransactionLayout>
        </>
    );
}
