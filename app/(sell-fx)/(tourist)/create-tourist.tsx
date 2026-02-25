
import DatePickerField from '@/components/DatePickerField';
import InitiateTransactionSheet from '@/components/InitiateTransactionSheet';
import InputField from '@/components/InputField';
import LoadingBackdrop from '@/components/LoadingBackdrop';
import { LocationItem } from '@/components/LocationSelectionSheet';
import SourceOfFundsSheet from '@/components/SourceOfFundsSheet';
import CredentialStep from '@/components/transaction-flow/CredentialStep';
import DocumentStep from '@/components/transaction-flow/DocumentStep';
import ExchangeStep from '@/components/transaction-flow/ExchangeStep';
import LocationStep from '@/components/transaction-flow/LocationStep';
import TransactionLayout from '@/components/transaction-flow/TransactionLayout';
import { UploadedFile, useDocumentUpload } from '@/hooks/useDocumentUpload';
import { useToastStore } from '@/stores/useToastStore';
import {
    touristStep0Schema,
    touristStep1Schema,
    touristStep2Schema,
    touristStep3LocationSchema,
    touristStep3TransferSchema,
} from '@/utils/validations/tourist';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import { z } from 'zod';

interface ValidationErrors {
    [key: string]: string | undefined;
}

import { CITIES, LOCATIONS, STATES } from '@/utils/locations';

export default function CreateTouristScreen() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);

    // Step 0: Credentials
    const [passportNumberInput, setPassportNumberInput] = useState('');

    // Step 1: Uploaded files
    const [passportFile, setPassportFile] = useState<UploadedFile | null>(null);
    const [visaFile, setVisaFile] = useState<UploadedFile | null>(null);
    const [ticketFile, setTicketFile] = useState<UploadedFile | null>(null);
    // Step 1: Associated inputs
    const [passportIssueDate, setPassportIssueDate] = useState('');
    const [passportExpiryDate, setPassportExpiryDate] = useState('');
    const [visaNumber, setVisaNumber] = useState('');
    const [ticketNumber, setTicketNumber] = useState('');

    const showToast = useToastStore(s => s.showToast);

    const { upload: uploadFile, isPending: isUploading } = useDocumentUpload({
        onSuccess: (documentType, { file }) => {
            if (documentType === 'PASSPORT') setPassportFile(file);
            else if (documentType === 'VISA') setVisaFile(file);
            else if (documentType === 'RETURN_TICKET') setTicketFile(file);
        },
        onError: () => showToast('Failed to upload document. Please try again.', 'error'),
    });

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
    const [pickupDate, setPickupDate] = useState('');
    const [pickupTime, setPickupTime] = useState('');

    // Transfer Details
    const [accountName, setAccountName] = useState('');
    const [bankName, setBankName] = useState('');
    const [initiateSheetVisible, setInitiateSheetVisible] = useState(false);
    const [showSourceOfFundsSheet, setShowSourceOfFundsSheet] = useState(false);
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

    const clearError = (field: string) => {
        if (validationErrors[field]) {
            setValidationErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    // Configuration for Step 0
    const credentialFields = [
        {
            label: 'International Passport Number',
            placeholder: 'Enter international passport number',
            value: passportNumberInput,
            onChangeText: (v: string) => { setPassportNumberInput(v); clearError('passportNumber'); },
            required: true,
            error: validationErrors.passportNumber,
        }
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
                        <DatePickerField label='Passport Issue Date' required value={passportIssueDate} onDateChange={(v) => { setPassportIssueDate(v); clearError('passportIssueDate'); }} maximumDate={new Date()} error={validationErrors.passportIssueDate} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <DatePickerField label='Passport Expiry Date' required value={passportExpiryDate} onDateChange={(v) => { setPassportExpiryDate(v); clearError('passportExpiryDate'); }} minimumDate={new Date()} error={validationErrors.passportExpiryDate} />
                    </View>
                </View>
            )
        },
        {
            label: 'Valid Visa',
            onUpload: () => uploadFile('VISA'),
            fileName: visaFile?.name,
            fileUri: visaFile?.uri,
            fileType: visaFile?.type,
            required: true,
            error: validationErrors.visaNumber,
            associatedInputs: (
                <View>
                    <InputField label='Valid Visa' required placeholder='Enter visa number' value={visaNumber} onChangeText={(v) => { setVisaNumber(v); clearError('visaNumber'); }} error={validationErrors.visaNumber} />
                </View>
            )
        },
        {
            label: 'Valid Return Ticket',
            onUpload: () => uploadFile('RETURN_TICKET'),
            fileName: ticketFile?.name,
            fileUri: ticketFile?.uri,
            fileType: ticketFile?.type,
            required: true,
            error: validationErrors.ticketNumber,
            associatedInputs: (
                <View>
                    <InputField label='Valid Return Ticket' required placeholder='Enter ticket number' value={ticketNumber} onChangeText={(v) => { setTicketNumber(v); clearError('ticketNumber'); }} error={validationErrors.ticketNumber} />
                </View>
            )
        },
        {
            label: 'Receipt for Initial Naira Purchase',
            onUpload: () => uploadFile('RECEIPT'),
            fileName: ticketFile?.name,
            fileUri: ticketFile?.uri,
            fileType: ticketFile?.type,
            required: true,
            error: validationErrors.ticketNumber,
        },
    ];

    const handleNext = () => {
        if (isUploading) {
            showToast('Please wait for files to finish uploading', 'warning');
            return;
        }
        const errors: ValidationErrors = {};

        if (currentStep === 0) {
            const result = touristStep0Schema.safeParse({ passportNumber: passportNumberInput });
            if (!result.success) {
                result.error.issues.forEach((e: z.ZodIssue) => {
                    const key = e.path[0] as string;
                    if (!errors[key]) errors[key] = e.message;
                });
            }
        }

        if (currentStep === 1) {
            const result = touristStep1Schema.safeParse({ passportIssueDate, passportExpiryDate, visaNumber, ticketNumber });
            if (!result.success) {
                result.error.issues.forEach((e: z.ZodIssue) => {
                    const key = e.path[0] as string;
                    if (!errors[key]) errors[key] = e.message;
                });
            }
        }

        if (currentStep === 2) {
            const result = touristStep2Schema.safeParse({ amount: parseFloat(amountSend.replace(/,/g, '')) });
            if (!result.success) {
                result.error.issues.forEach((e: z.ZodIssue) => {
                    if (!errors.amount) errors.amount = e.message;
                });
            }
        }

        if (currentStep === 3) {
            if (paymentMethod === 'transfer') {
                const result = touristStep3TransferSchema.safeParse({ accountName, bankName });
                if (!result.success) {
                    result.error.issues.forEach((e: z.ZodIssue) => {
                        const key = e.path[0] as string;
                        if (!errors[key]) errors[key] = e.message;
                    });
                }
            } else {
                const result = touristStep3LocationSchema.safeParse({ selectedState, selectedCity, selectedLocation, pickupDate, pickupTime });
                if (!result.success) {
                    result.error.issues.forEach((e: z.ZodIssue) => {
                        const key = e.path[0] as string;
                        if (!errors[key]) errors[key] = e.message;
                    });
                }
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
        router.push('/(sell-fx)/(tourist)/success');
    };

    return (
        <>
            <LoadingBackdrop visible={isUploading} />
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
                        showLimitWarning
                        // ={parseFloat(amountSend.replace(/,/g, '')) > 10000}
                        onLimitWarningPress={() => setShowSourceOfFundsSheet(true)}
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
                                pickupDate={pickupDate}
                                onPickupDateChange={setPickupDate}
                                pickupTime={pickupTime}
                                onPickupTimeChange={setPickupTime}
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

                <SourceOfFundsSheet
                    visible={showSourceOfFundsSheet}
                    onClose={() => setShowSourceOfFundsSheet(false)}
                    onSubmit={() => {
                        setShowSourceOfFundsSheet(false);

                        console.log('Source of Funds Declaration Submitted');
                    }}
                    customerInfo={{
                        fullName: 'Feubode Gesikeme', // Placeholder
                        phoneNumber: '09042136679', // Placeholder
                        email: 'kemef@gmail.com', // Placeholder
                        bvn: '55544332278554', // Placeholder
                        address: '16a Alexandre drive', // Placeholder
                        passportNumber: passportNumberInput || '102234556777776'
                    }}
                    transactionDetails={{
                        type: 'Tourist',
                        currency: currencySend.currencyName,
                        amount: `${currencySend.code} ${amountSend}`,
                        purpose: 'Travel'
                    }}
                />
            </TransactionLayout>
        </>
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

