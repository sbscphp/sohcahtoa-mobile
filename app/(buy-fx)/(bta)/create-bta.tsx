import InitiateTransactionSheet from '@/components/InitiateTransactionSheet';
import InputField from '@/components/InputField';
import { LocationItem } from '@/components/LocationSelectionSheet';
import CredentialStep from '@/components/transaction-flow/CredentialStep';
import DocumentStep from '@/components/transaction-flow/DocumentStep';
import ExchangeStep from '@/components/transaction-flow/ExchangeStep';
import LocationStep from '@/components/transaction-flow/LocationStep';
import TransactionLayout from '@/components/transaction-flow/TransactionLayout';
import { useRouter } from 'expo-router';
import { Calendar } from 'iconsax-react-nativejs';
import React, { useState } from 'react';
import { View } from 'react-native';

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

    // Step 0: Credentials State
    const [bvn, setBvn] = useState('');
    const [nin, setNin] = useState('');
    const [formAId, setFormAId] = useState('');
    const [tin, setTin] = useState('');
    const [passportNumber, setPassportNumber] = useState('');
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

    const [initiateSheetVisible, setInitiateSheetVisible] = useState(false);

    // --- Configuration ---

    // Fields for Step 0
    const credentialFields = [
        { label: 'Bank Verification Number(BVN)', placeholder: 'Enter your BVN', value: bvn, onChangeText: setBvn, required: true, keyboardType: 'numeric' as const },
        { label: 'Tax Identification Number(TIN)', placeholder: 'Enter your TIN', value: tin, onChangeText: setTin, required: true, keyboardType: 'numeric' as const },
        { label: 'National Identification Number(NIN)', placeholder: 'Enter your NIN', value: nin, onChangeText: setNin, required: true, keyboardType: 'numeric' as const },
        { label: 'Form A ID', placeholder: 'Enter Form A ID', value: formAId, onChangeText: setFormAId, required: true, keyboardType: 'numeric' as const },
        { label: 'International Passport Number', placeholder: 'Enter international passport', value: passportNumber, onChangeText: setPassportNumber, required: true },
    ];

    // Documents for Step 1
    const documentFields = [
        {
            label: 'Tax Clearance Certificate (TCC)',
            onUpload: () => console.log('Upload Letter'),
            required: true,
            associatedInputs: (
                <View>
                    <InputField label='Tax Clearance Certificate (TCC)' required placeholder='Enter TCC number' value={tccNumber} onChangeText={setTccNumber} keyboardType='numeric' />
                </View>
            )
        },
        {
            label: 'International Passport',
            onUpload: () => console.log('Upload Passport'),
            required: true,
            associatedInputs: (
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1 }}>
                        <InputField label='Passport Issue Date' required placeholder='dd/mm/yyyy' rightIcon={Calendar} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <InputField label='Passport Expiry Date' required placeholder='dd/mm/yyyy' rightIcon={Calendar} />
                    </View>
                </View>
            )
        },
        {
            label: 'Tax Identification Number (TIN)',
            onUpload: () => console.log('Upload Letter'),
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
        router.push('/(buy-fx)/(bta)/request-initiated-success');
    };

    return (
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
    );
}
