import DatePickerField from '@/components/DatePickerField';
import InitiateTransactionSheet from '@/components/InitiateTransactionSheet';
import InputField from '@/components/InputField';
import { LocationItem } from '@/components/LocationSelectionSheet';
import CredentialStep from '@/components/transaction-flow/CredentialStep';
import DocumentStep from '@/components/transaction-flow/DocumentStep';
import ExchangeStep from '@/components/transaction-flow/ExchangeStep';
import LocationStep from '@/components/transaction-flow/LocationStep';
import TransactionLayout from '@/components/transaction-flow/TransactionLayout';
import { useRouter } from 'expo-router';
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

export default function CreateResidentScreen() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);

    // Step 0: TIN Verification
    const [bvnNumber, setBvnNumber] = useState('');
    const [ninNumber, setNinNumber] = useState('');
    const [passportNumber, setPassportNumber] = useState('');

    // Step 1: Document Uploads
    const [passportIssueDate, setPassportIssueDate] = useState('');
    const [passportExpiryDate, setPassportExpiryDate] = useState('');
    const [utilityNumber, setUtilityNumber] = useState('');

    // Step 2: Exchange State
    const [transactionType, setTransactionType] = useState<'buy' | 'sell'>('sell');
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

    const [amountGet, setAmountGet] = useState('1');
    const [amountSend, setAmountSend] = useState('1,500');

    // Step 3: Pickup Location
    const [selectedState, setSelectedState] = useState<LocationItem | null>(null);
    const [selectedCity, setSelectedCity] = useState<LocationItem | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(null);
    const [pickupDate, setPickupDate] = useState('');
    const [pickupTime, setPickupTime] = useState('');

    const [initiateSheetVisible, setInitiateSheetVisible] = useState(false);

    // Configuration for Step 0: TIN Verification
    const credentialFields = [
        {
            label: 'Bank Verification Number (BVN)',
            placeholder: 'Enter BVN',
            value: bvnNumber,
            onChangeText: setBvnNumber,
            required: true,
            keyboardType: 'numeric' as const
        },
        {
            label: 'National Identification Number (NIN)',
            placeholder: 'Enter NIN',
            value: ninNumber,
            onChangeText: setNinNumber,
            required: true,
            keyboardType: 'numeric' as const
        },
        {
            label: 'International Passport Number',
            placeholder: 'Enter international passport number',
            value: passportNumber,
            onChangeText: setPassportNumber,
            required: true
        }
    ];

    // Configuration for Step 1: Document Upload
    const documentFields = [
        {
            label: 'International Passport',
            onUpload: () => console.log('Upload Passport'),
            required: true,
            associatedInputs: (
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1 }}>
                        <DatePickerField
                            label='Passport Issue Date'
                            required
                            value={passportIssueDate}
                            onDateChange={setPassportIssueDate}
                            maximumDate={new Date()}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <DatePickerField
                            label='Passport Expiry Date'
                            required
                            value={passportExpiryDate}
                            onDateChange={setPassportExpiryDate}
                            minimumDate={new Date()}
                        />
                    </View>
                </View>
            )
        },
        {
            label: 'Utility bill  (Not more than 3 months old)',
            onUpload: () => console.log('Upload Utility Bill'),
            required: true,
            associatedInputs: (
                <View>
                    <InputField
                        label='Utility Bill'
                        required
                        placeholder='Enter Utility number'
                        value={utilityNumber}
                        onChangeText={setUtilityNumber}
                    />
                </View>
            )
        }
    ];

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
        router.push('/(sell-fx)/(resident)/success');
    };

    return (
        <TransactionLayout
            title="Resident"
            currentStep={currentStep}
            totalSteps={4}
            onBack={handleBack}
            onNext={handleNext}
            nextLabel={currentStep === 3 ? "Initiate Transaction Request" : "Continue"}
        >
            {currentStep === 0 && (
                <CredentialStep
                    fields={credentialFields}
                    title="Enter Tax Identification Number (TIN)"
                />
            )}

            {currentStep === 1 && (
                <DocumentStep
                    documents={documentFields}
                    title="Upload Relevant Documents"
                />
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
    );
}
