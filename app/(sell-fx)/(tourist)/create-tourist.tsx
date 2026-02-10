
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
import { Pressable, Text, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';

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

export default function CreateTouristScreen() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);

    // Step 0: Credentials
    const [passportNumberInput, setPassportNumberInput] = useState('');

    // Step 1: Document Uploads & Passport Details
    const [passportIssueDate, setPassportIssueDate] = useState('');
    const [passportExpiryDate, setPassportExpiryDate] = useState('');
    const [visaNumber, setVisaNumber] = useState('');

    // Step 2: Exchange State
    const [transactionType, setTransactionType] = useState<'buy' | 'sell'>('sell');
    const [currencyGet, setCurrencyGet] = useState({
        code: 'NGN',
        country: 'Nigeria',
        currencyName: 'Naira',
        flagUrl: 'https://flagcdn.com/w80/ng.png'
    });
    const [currencySend, setCurrencySend] = useState({
        code: 'USD',
        country: 'United States',
        currencyName: 'Dollar',
        flagUrl: 'https://flagcdn.com/w80/us.png'
    });

    const [amountGet, setAmountGet] = useState('');
    const [amountSend, setAmountSend] = useState('1,500'); // Placeholder

    // Step 3: Payment Method & Location
    const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'card'>('transfer');
    const [selectedState, setSelectedState] = useState<LocationItem | null>(null);
    const [selectedCity, setSelectedCity] = useState<LocationItem | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(null);

    // Transfer Details
    const [accountName, setAccountName] = useState('');
    const [bankName, setBankName] = useState('');

    const [initiateSheetVisible, setInitiateSheetVisible] = useState(false);

    // Configuration for Step 0
    const credentialFields = [
        {
            label: 'International Passport Number',
            placeholder: 'Enter international passport number',
            value: passportNumberInput,
            onChangeText: setPassportNumberInput,
            required: true
        }
    ];

    // Configuration for Step 1
    const documentFields = [
        {
            label: 'International Passport',
            onUpload: () => console.log('Upload Passport'),
            required: true,
            associatedInputs: (
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1 }}>
                        <InputField
                            label='Passport Issue Date'
                            required
                            placeholder='dd/mm/yyyy'
                            rightIcon={Calendar}
                            value={passportIssueDate}
                            onChangeText={setPassportIssueDate}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <InputField
                            label='Passport Expiry Date'
                            required
                            placeholder='dd/mm/yyyy'
                            rightIcon={Calendar}
                            value={passportExpiryDate}
                            onChangeText={setPassportExpiryDate}
                        />
                    </View>
                </View>
            )
        },
        {
            label: 'Valid Visa',
            onUpload: () => console.log('Upload Visa'),
            required: true,
            associatedInputs: (
                <View>
                    <InputField
                        label='Valid Visa'
                        required
                        placeholder='Enter visa number'
                        value={visaNumber}
                        onChangeText={setVisaNumber}
                    />
                </View>
            )
        },
        {
            label: 'Valid Return Ticket',
            onUpload: () => console.log('Upload Ticket'),
            required: true,
            associatedInputs: (
                <View>
                    <InputField
                        label='Valid Return Ticket'
                        required
                        placeholder='Enter ticket number'
                        value={''}
                        onChangeText={() => { }}
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
        router.push('/(sell-fx)/(tourist)/success');
    };

    return (
        <TransactionLayout
            title={"Tourist"}
            currentStep={currentStep}
            totalSteps={4}
            onBack={handleBack}
            onNext={handleNext}
            nextLabel={currentStep === 3 ? "Initiate Transaction Request" : "Continue"}
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
                    rate={`1 ${currencySend.code} = 1500 ${currencyGet.code}`}
                    onAmountGetChange={setAmountGet}
                    onAmountSendChange={setAmountSend}
                    allowedModes={['sell']}
                />
            )}

            {currentStep === 3 && (
                <View style={{ gap: moderateScale(24) }}>
                    <View style={styles.toggleContainer}>
                        <Pressable
                            style={[
                                styles.toggleButton,
                                paymentMethod === 'transfer' && styles.activeToggleButton
                            ]}
                            onPress={() => setPaymentMethod('transfer')}
                        >
                            <Text style={[
                                styles.toggleText,
                                paymentMethod === 'transfer' && styles.activeToggleText
                            ]}>Transfer to Account</Text>
                        </Pressable>
                        <Pressable
                            style={[
                                styles.toggleButton,
                                paymentMethod === 'card' && styles.activeToggleButton
                            ]}
                            onPress={() => setPaymentMethod('card')}
                        >
                            <Text style={[
                                styles.toggleText,
                                paymentMethod === 'card' && styles.activeToggleText
                            ]}>Prepaid Card</Text>
                        </Pressable>
                    </View>

                    {paymentMethod === 'transfer' ? (
                        <View style={{ gap: moderateScale(16) }}>
                            <Text style={styles.sectionTitle}>Select Pick Up Point</Text>
                            <InputField
                                label="Account Name"
                                placeholder="Enter account name"
                                value={accountName}
                                onChangeText={setAccountName}
                                required
                            />
                            <InputField
                                label="Bank Name"
                                placeholder="Enter bank name"
                                value={bankName}
                                onChangeText={setBankName}
                                required
                            />
                        </View>
                    ) : (
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
                        />
                    )}
                </View>
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
                    }
                ]}
            />
        </TransactionLayout>
    );
}

const styles = ScaledSheet.create({
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: '30@ms',
        padding: '4@ms',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        height: '38@vs',
    },
    toggleButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '26@ms',
    },
    activeToggleButton: {
        backgroundColor: '#0F172A',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    toggleText: {
        fontSize: '13@ms',
        fontWeight: '500',
        color: '#64748B',
    },
    activeToggleText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#0F172A',
        // marginBottom: '16@vs', // InputField has its own spacing but section needs title spacing
    },
});

