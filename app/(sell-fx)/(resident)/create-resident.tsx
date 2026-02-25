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
import { UploadedFile, useDocumentUpload } from '@/hooks/useDocumentUpload';
import { useToastStore } from '@/stores/useToastStore';
import {
    residentStep0Schema,
    residentStep1Schema,
    residentStep2Schema,
    residentStep3Schema,
} from '@/utils/validations/resident';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { z } from 'zod';

interface ValidationErrors {
    [key: string]: string | undefined;
}

import { CITIES, LOCATIONS, STATES } from '@/utils/locations';

export default function CreateResidentScreen() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);

    // Step 0
    const [bvnNumber, setBvnNumber] = useState('');
    const [ninNumber, setNinNumber] = useState('');
    const [passportNumber, setPassportNumber] = useState('');

    // Step 1 — uploaded files
    const [passportFile, setPassportFile] = useState<UploadedFile | null>(null);
    const [utilityFile, setUtilityFile] = useState<UploadedFile | null>(null);
    // Step 1 — associated inputs
    const [passportIssueDate, setPassportIssueDate] = useState('');
    const [passportExpiryDate, setPassportExpiryDate] = useState('');
    const [utilityNumber, setUtilityNumber] = useState('');

    const showToast = useToastStore(s => s.showToast);

    const { upload: uploadFile, isPending: isUploading } = useDocumentUpload({
        onSuccess: (documentType, { file }) => {
            if (documentType === 'PASSPORT') {
                setPassportFile(file);
            } else if (documentType === 'UTILITY_BILL') {
                setUtilityFile(file);
            }
        },
        onError: () => showToast('Failed to upload document. Please try again.', 'error'),
    });

    // Step 2
    const [transactionType, setTransactionType] = useState<'buy' | 'sell'>('sell');
    const [currencyGet, setCurrencyGet] = useState({ code: 'USD', country: 'United States', currencyName: 'Dollar', flagUrl: 'https://flagcdn.com/w80/us.png' });
    const [currencySend, setCurrencySend] = useState({ code: 'NGN', country: 'Nigeria', currencyName: 'Naira', flagUrl: 'https://flagcdn.com/w80/ng.png' });
    const [amountGet, setAmountGet] = useState('1');
    const [amountSend, setAmountSend] = useState('1,500');

    // Step 3
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

    const credentialFields = [
        {
            label: 'Bank Verification Number (BVN)',
            placeholder: 'Enter BVN',
            value: bvnNumber,
            onChangeText: (v: string) => { setBvnNumber(v); clearError('bvn'); },
            required: true,
            keyboardType: 'numeric' as const,
            error: validationErrors.bvn,
        },
        {
            label: 'National Identification Number (NIN)',
            placeholder: 'Enter NIN',
            value: ninNumber,
            onChangeText: (v: string) => { setNinNumber(v); clearError('nin'); },
            required: true,
            keyboardType: 'numeric' as const,
            error: validationErrors.nin,
        },
        {
            label: 'International Passport Number',
            placeholder: 'Enter international passport number',
            value: passportNumber,
            onChangeText: (v: string) => { setPassportNumber(v); clearError('passportNumber'); },
            required: true,
            error: validationErrors.passportNumber,
        },
    ];

    const documentFields = [
        {
            label: 'International Passport',
            onUpload: () => uploadFile('PASSPORT'),
            fileName: passportFile?.name,
            fileUri: passportFile?.uri,
            fileType: passportFile?.type,
            required: true,
            error: validationErrors.passportIssueDate || validationErrors.passportExpiryDate,
            associatedInputs: (
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1 }}>
                        <DatePickerField
                            label='Passport Issue Date'
                            required
                            value={passportIssueDate}
                            onDateChange={(v) => { setPassportIssueDate(v); clearError('passportIssueDate'); }}
                            maximumDate={new Date()}
                            error={validationErrors.passportIssueDate}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <DatePickerField
                            label='Passport Expiry Date'
                            required
                            value={passportExpiryDate}
                            onDateChange={(v) => { setPassportExpiryDate(v); clearError('passportExpiryDate'); }}
                            minimumDate={new Date()}
                            error={validationErrors.passportExpiryDate}
                        />
                    </View>
                </View>
            ),
        },
        {
            label: 'Utility bill  (Not more than 3 months old)',
            onUpload: () => uploadFile('UTILITY_BILL'),
            fileName: utilityFile?.name,
            fileUri: utilityFile?.uri,
            fileType: utilityFile?.type,
            required: true,
            error: validationErrors.utilityNumber,
            associatedInputs: (
                <View>
                    <InputField
                        label='Utility Bill'
                        required
                        placeholder='Enter Utility number'
                        value={utilityNumber}
                        onChangeText={(v) => { setUtilityNumber(v); clearError('utilityNumber'); }}
                        error={validationErrors.utilityNumber}
                    />
                </View>
            ),
        },
    ];

    const handleNext = () => {
        if (isUploading) {
            showToast('Please wait for files to finish uploading', 'warning');
            return;
        }

        const errors: ValidationErrors = {};

        if (currentStep === 0) {
            const result = residentStep0Schema.safeParse({ bvn: bvnNumber, nin: ninNumber, passportNumber });
            if (!result.success) {
                result.error.issues.forEach((e: z.ZodIssue) => {
                    const key = e.path[0] as string;
                    if (!errors[key]) errors[key] = e.message;
                });
            }
        }

        if (currentStep === 1) {
            const result = residentStep1Schema.safeParse({ passportIssueDate, passportExpiryDate, utilityNumber });
            if (!result.success) {
                result.error.issues.forEach((e: z.ZodIssue) => {
                    const key = e.path[0] as string;
                    if (!errors[key]) errors[key] = e.message;
                });
            }
        }

        if (currentStep === 2) {
            const result = residentStep2Schema.safeParse({ amount: parseFloat(amountGet.replace(/,/g, '')) });
            if (!result.success) {
                result.error.issues.forEach((e: z.ZodIssue) => {
                    if (!errors.amount) errors.amount = e.message;
                });
            }
        }

        if (currentStep === 3) {
            const result = residentStep3Schema.safeParse({ selectedState, selectedCity, selectedLocation, pickupDate, pickupTime });
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
        setInitiateSheetVisible(false);
        router.push('/(sell-fx)/(resident)/success');
    };

    return (
        <>
            <LoadingBackdrop visible={isUploading} />
            <TransactionLayout
                title="Resident"
                currentStep={currentStep}
                totalSteps={4}
                onBack={handleBack}
                onNext={handleNext}
                nextLabel={currentStep === 3 ? "Initiate Transaction Request" : "Continue"}
            >
                {currentStep === 0 && (
                    <CredentialStep fields={credentialFields} title="Enter Tax Identification Number (TIN)" />
                )}

                {currentStep === 1 && (
                    <DocumentStep documents={documentFields} title="Upload Relevant Documents" />
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
                        allowedModes={['sell']}
                        error={validationErrors.amount}
                    />
                )}

                {currentStep === 3 && (
                    <LocationStep
                        states={STATES}
                        cities={CITIES}
                        locations={LOCATIONS}
                        selectedState={selectedState}
                        onSelectState={(item) => { setSelectedState(item); setSelectedCity(null); setSelectedLocation(null); clearError('selectedState'); }}
                        selectedCity={selectedCity}
                        onSelectCity={(item) => { setSelectedCity(item); setSelectedLocation(null); clearError('selectedCity'); }}
                        selectedLocation={selectedLocation}
                        onSelectLocation={(item) => { setSelectedLocation(item); clearError('selectedLocation'); }}
                        title="Select Pick Up Point"
                        pickupDate={pickupDate}
                        onPickupDateChange={(v) => { setPickupDate(v); clearError('pickupDate'); }}
                        pickupTime={pickupTime}
                        onPickupTimeChange={(v) => { setPickupTime(v); clearError('pickupTime'); }}
                        errors={validationErrors}
                    />
                )}

                <InitiateTransactionSheet
                    visible={initiateSheetVisible}
                    onClose={() => setInitiateSheetVisible(false)}
                    onConfirm={handleConfirmInitiate}
                    title="Initiate Resident Transaction request?"
                    items={[
                        {
                            title: "Verification before approval",
                            description: "You must upload your residency application letter, immigration invoice, and identification documents for verification.",
                            iconType: 'verify'
                        }
                    ]}
                />
            </TransactionLayout>
        </>
    );
}
