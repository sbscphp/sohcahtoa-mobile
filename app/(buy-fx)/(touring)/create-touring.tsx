import DatePickerField from '@/components/DatePickerField';
import InitiateTransactionSheet from '@/components/InitiateTransactionSheet';
import InputField from '@/components/InputField';
import { LocationItem } from '@/components/LocationSelectionSheet';
import CredentialStep from '@/components/transaction-flow/CredentialStep';
import DocumentStep from '@/components/transaction-flow/DocumentStep';
import ExchangeStep from '@/components/transaction-flow/ExchangeStep';
import LocationStep from '@/components/transaction-flow/LocationStep';
import TransactionLayout from '@/components/transaction-flow/TransactionLayout';
import { touringStep0Schema, touringStep2Schema, touringStep3Schema } from '@/utils/validations/touring';
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

export default function TouringScreen() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);

    // Step 0: Credentials State
    const [bvn, setBvn] = useState('');
    const [nin, setNin] = useState('');
    const [formAId, setFormAId] = useState('');
    const [passportNumber, setPassportNumber] = useState('');
    const [passportIssueDate, setPassportIssueDate] = useState('');
    const [passportExpiryDate, setPassportExpiryDate] = useState('');

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

    // --- Configuration ---

    // Fields for Step 0
    const credentialFields = [
        { label: 'Bank Verification Number (BVN)', placeholder: 'Enter your BVN', value: bvn, onChangeText: (v: string) => { setBvn(v); clearError('bvn'); }, required: true, keyboardType: 'numeric' as const, error: validationErrors.bvn },
        { label: 'National Identification Number (NIN)', placeholder: 'Enter your NIN', value: nin, onChangeText: (v: string) => { setNin(v); clearError('nin'); }, required: true, keyboardType: 'numeric' as const, error: validationErrors.nin },
        { label: 'Form A ID', placeholder: 'Enter Form A ID', value: formAId, onChangeText: (v: string) => { setFormAId(v); clearError('formAId'); }, required: true, error: validationErrors.formAId },
        { label: 'International Passport Number', placeholder: 'Enter international passport number', value: passportNumber, onChangeText: (v: string) => { setPassportNumber(v); clearError('passportNumber'); }, required: true, error: validationErrors.passportNumber },
    ];

    // Documents for Step 1
    const documentFields = [
        {
            label: 'International Passport',
            onUpload: () => console.log('Upload Passport'),
            required: true,
            associatedInputs: (
                <View>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <View style={{ flex: 1 }}>
                            <DatePickerField label='Passport Issue Date' value={passportIssueDate} onDateChange={setPassportIssueDate} required maximumDate={new Date()} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <DatePickerField label='Passport Expiry Date' value={passportExpiryDate} onDateChange={setPassportExpiryDate} required minimumDate={new Date()} />
                        </View>
                    </View>
                </View>
            )
        },
        {
            label: 'Valid Visa',
            onUpload: () => console.log('Upload Visa'),
            required: true,
            associatedInputs: (
                <InputField label="Valid Visa Number" placeholder="Enter valid visa number" required />
            )
        },
        {
            label: 'Return Ticket',
            onUpload: () => console.log('Upload Ticket'),
            required: true,
            associatedInputs: (
                <InputField label="Return Ticket Number" placeholder="Enter return ticket number" required />
            )
        }
    ];

    // --- Handlers ---

    const handleNext = () => {
        const errors: ValidationErrors = {};

        if (currentStep === 0) {
            const result = touringStep0Schema.safeParse({ bvn, nin, formAId, passportNumber });
            if (!result.success) {
                result.error.issues.forEach((e: z.ZodIssue) => {
                    const key = e.path[0] as string;
                    if (!errors[key]) errors[key] = e.message;
                });
            }
        }

        if (currentStep === 2) {
            const result = touringStep2Schema.safeParse({ amount: parseFloat(amountGet.replace(/,/g, '')) });
            if (!result.success) {
                result.error.issues.forEach((e: z.ZodIssue) => {
                    if (!errors.amount) errors.amount = e.message;
                });
            }
        }

        if (currentStep === 3) {
            const result = touringStep3Schema.safeParse({ selectedState, selectedCity, selectedLocation, pickupDate, pickupTime });
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
        router.push('/(buy-fx)/(touring)/request-initiated-success');
    };

    return (
        <TransactionLayout
            title="Tourist"
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
                    title="Select Pick Up Point"
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
                title="Initiate Tourist Transaction request?"
                items={[
                    {
                        title: "Verification before approval",
                        description: "Your travel documents (passport, visa, and return ticket) must be verified before your tourist FX request can be approved.",
                        iconType: 'verify'
                    },
                    {
                        title: "Maximum of $4,000 per quarter",
                        description: "The maximum you can transact is $4,000 per quarter.",
                        iconType: 'limit'
                    }
                ]}
            />
        </TransactionLayout>
    );
}
