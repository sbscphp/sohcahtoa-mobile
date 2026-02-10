import DatePickerField from '@/components/DatePickerField';
import FileUpload from '@/components/FileUpload';
import InitiateTransactionSheet from '@/components/InitiateTransactionSheet';
import InputField from '@/components/InputField';
import { LocationItem } from '@/components/LocationSelectionSheet';
import ExchangeStep from '@/components/transaction-flow/ExchangeStep';
import LocationStep from '@/components/transaction-flow/LocationStep';
import TransactionLayout from '@/components/transaction-flow/TransactionLayout';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Text, View } from 'react-native';
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

export default function CreateExpatriateScreen() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);

    // Step 0: Credentials - TIN and Form "A" ID
    const [bvnNumber, setBvnNumber] = useState('');
    const [ninNumber, setNinNumber] = useState('');
    const [passportNumber, setPassportNumber] = useState('');

    // Step 1: Document Uploads
    const [workPermitFile, setWorkPermitFile] = useState<string | null>(null);
    const [workPermitNumber, setWorkPermitNumber] = useState('');
    const [passportFile, setPassportFile] = useState<string | null>(null);
    const [passportIssueDate, setPassportIssueDate] = useState('');
    const [passportExpiryDate, setPassportExpiryDate] = useState('');
    const [utilityBillFile, setUtilityBillFile] = useState<string | null>(null);
    const [utilityBillNumber, setUtilityBillNumber] = useState('');

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
    const [amountSend, setAmountSend] = useState('1,500');

    // Step 3: Pickup Location
    const [selectedState, setSelectedState] = useState<LocationItem | null>(null);
    const [selectedCity, setSelectedCity] = useState<LocationItem | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(null);
    const [pickupDate, setPickupDate] = useState('');
    const [pickupTime, setPickupTime] = useState('');

    const [initiateSheetVisible, setInitiateSheetVisible] = useState(false);

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
        router.push('/(sell-fx)/(expatriate)/success');
    };

    return (
        <TransactionLayout
            title="Expatriate"
            currentStep={currentStep}
            totalSteps={4}
            onBack={handleBack}
            onNext={handleNext}
            nextLabel={currentStep === 3 ? "Initiate Transaction Request" : "Continue"}
        >
            {currentStep === 0 && (
                <View style={styles.container}>
                    <Text style={styles.sectionTitle}>Enter Tax Identification Number (TIN) and Form "A" ID</Text>

                    <InputField
                        label="Bank Verification Number (BVN)"
                        placeholder="Enter form A"
                        value={bvnNumber}
                        onChangeText={setBvnNumber}
                        required
                        keyboardType="numeric"
                    />

                    <InputField
                        label="National Identification Number (NIN)"
                        placeholder="Enter form A"
                        value={ninNumber}
                        onChangeText={setNinNumber}
                        required
                        keyboardType="numeric"
                    />

                    <InputField
                        label="International Passport Number"
                        placeholder="Enter international passport number"
                        value={passportNumber}
                        onChangeText={setPassportNumber}
                        required
                    />
                </View>
            )}

            {currentStep === 1 && (
                <View style={styles.container}>
                    <Text style={styles.sectionTitle}>Upload Relevant Documents</Text>

                    {/* Work Permit */}
                    <View style={styles.documentSection}>
                        <Text style={styles.documentLabel}>
                            Work Permit <Text style={styles.required}>*</Text>
                        </Text>
                        <FileUpload
                            onUpload={() => setWorkPermitFile('work_permit.pdf')}
                            fileName={workPermitFile}
                        />
                        <InputField
                            label="Work Permit"
                            placeholder="Enter work permit"
                            value={workPermitNumber}
                            onChangeText={setWorkPermitNumber}
                            required
                        />
                    </View>

                    {/* International Passport */}
                    <View style={styles.documentSection}>
                        <Text style={styles.documentLabel}>
                            International Passport <Text style={styles.required}>*</Text>
                        </Text>
                        <FileUpload
                            onUpload={() => setPassportFile('passport.pdf')}
                            fileName={passportFile}
                        />
                        <View style={{ flexDirection: 'row', gap: moderateScale(12) }}>
                            <View style={{ flex: 1 }}>
                                <DatePickerField
                                    label="Passport Issue Date"
                                    value={passportIssueDate}
                                    onDateChange={setPassportIssueDate}
                                    required
                                    maximumDate={new Date()}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <DatePickerField
                                    label="Passport Expiry Date"
                                    value={passportExpiryDate}
                                    onDateChange={setPassportExpiryDate}
                                    required
                                    minimumDate={new Date()}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Utility Bill */}
                    <View style={styles.documentSection}>
                        <Text style={styles.documentLabel}>
                            Utility Bill <Text style={styles.required}>*</Text>
                        </Text>
                        <FileUpload
                            onUpload={() => setUtilityBillFile('utility_bill.pdf')}
                            fileName={utilityBillFile}
                        />
                        <InputField
                            label="Utility Bill"
                            placeholder="Enter utility bill number"
                            value={utilityBillNumber}
                            onChangeText={setUtilityBillNumber}
                            required
                        />
                    </View>
                </View>
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
                    title="Where would you like to receive your funds?"
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
                title="Initiate Expatriate Transaction request?"
                items={[
                    {
                        title: "Verification before approval",
                        description: "Work permit documents, employer letter, and passport details must be verified before your request can be processed.",
                        iconType: 'verify'
                    }
                ]}
            />
        </TransactionLayout>
    );
}

const styles = ScaledSheet.create({
    container: {
        gap: '4@vs',
    },
    sectionTitle: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: '16@vs',
    },
    documentSection: {
        marginBottom: '24@vs',
    },
    documentLabel: {
        fontSize: '12.5@ms',
        fontWeight: '400',
        color: '#475569',
        marginBottom: '8@vs',
    },
    required: {
        color: '#EF4444',
    },
});
