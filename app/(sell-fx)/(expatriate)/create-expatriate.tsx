import DatePickerField from '@/components/DatePickerField';
import FileUpload from '@/components/FileUpload';
import InitiateTransactionSheet from '@/components/InitiateTransactionSheet';
import InputField from '@/components/InputField';
import LoadingBackdrop from '@/components/LoadingBackdrop';
import { LocationItem } from '@/components/LocationSelectionSheet';
import ExchangeStep from '@/components/transaction-flow/ExchangeStep';
import LocationStep from '@/components/transaction-flow/LocationStep';
import TransactionLayout from '@/components/transaction-flow/TransactionLayout';
import { UploadedFile, useDocumentUpload } from '@/hooks/useDocumentUpload';
import { useToastStore } from '@/stores/useToastStore';
import {
    expatriateStep0Schema,
    expatriateStep1Schema,
    expatriateStep2Schema,
    expatriateStep3Schema,
} from '@/utils/validations/expatriate';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import { z } from 'zod';

interface ValidationErrors {
    [key: string]: string | undefined;
}

import { CITIES, LOCATIONS, STATES } from '@/utils/locations';

export default function CreateExpatriateScreen() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);

    // Step 0: Credentials
    const [bvnNumber, setBvnNumber] = useState('');
    const [ninNumber, setNinNumber] = useState('');
    const [passportNumber, setPassportNumber] = useState('');

    // Step 1: Uploaded files
    const [workPermitFile, setWorkPermitFile] = useState<UploadedFile | null>(null);
    const [passportFile, setPassportFile] = useState<UploadedFile | null>(null);
    const [utilityBillFile, setUtilityBillFile] = useState<UploadedFile | null>(null);
    // Step 1: Associated inputs
    const [workPermitNumber, setWorkPermitNumber] = useState('');
    const [passportIssueDate, setPassportIssueDate] = useState('');
    const [passportExpiryDate, setPassportExpiryDate] = useState('');
    const [utilityBillNumber, setUtilityBillNumber] = useState('');

    const showToast = useToastStore(s => s.showToast);

    const { upload: uploadFile, isPending: isUploading } = useDocumentUpload({
        onSuccess: (documentType, { file }) => {
            if (documentType === 'WORK_PERMIT') setWorkPermitFile(file);
            else if (documentType === 'PASSPORT') setPassportFile(file);
            else if (documentType === 'UTILITY_BILL') setUtilityBillFile(file);
        },
        onError: () => showToast('Failed to upload document. Please try again.', 'error'),
    });

    // Step 2: Exchange
    const [transactionType, setTransactionType] = useState<'buy' | 'sell'>('sell');
    const [currencyGet, setCurrencyGet] = useState({ code: 'NGN', country: 'Nigeria', currencyName: 'Naira', flagUrl: 'https://flagcdn.com/w80/ng.png' });
    const [currencySend, setCurrencySend] = useState({ code: 'USD', country: 'United States', currencyName: 'Dollar', flagUrl: 'https://flagcdn.com/w80/us.png' });
    const [amountGet, setAmountGet] = useState('');
    const [amountSend, setAmountSend] = useState('1,500');

    // Step 3: Pickup
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

    const handleNext = () => {
        if (isUploading) {
            showToast('Please wait for files to finish uploading', 'warning');
            return;
        }

        const errors: ValidationErrors = {};

        if (currentStep === 0) {
            const result = expatriateStep0Schema.safeParse({ bvn: bvnNumber, nin: ninNumber, passportNumber });
            if (!result.success) {
                result.error.issues.forEach((e: z.ZodIssue) => {
                    const key = e.path[0] as string;
                    if (!errors[key]) errors[key] = e.message;
                });
            }
        }

        if (currentStep === 1) {
            const result = expatriateStep1Schema.safeParse({ workPermitNumber, passportIssueDate, passportExpiryDate });
            if (!result.success) {
                result.error.issues.forEach((e: z.ZodIssue) => {
                    const key = e.path[0] as string;
                    if (!errors[key]) errors[key] = e.message;
                });
            }
        }

        if (currentStep === 2) {
            const result = expatriateStep2Schema.safeParse({ amount: parseFloat(amountSend.replace(/,/g, '')) });
            if (!result.success) {
                result.error.issues.forEach((e: z.ZodIssue) => {
                    if (!errors.amount) errors.amount = e.message;
                });
            }
        }

        if (currentStep === 3) {
            const result = expatriateStep3Schema.safeParse({ selectedState, selectedCity, selectedLocation, pickupDate, pickupTime });
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
        router.push('/(sell-fx)/(expatriate)/success');
    };

    return (
        <>
            <LoadingBackdrop visible={isUploading} />
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
                            placeholder="Enter BVN"
                            value={bvnNumber}
                            onChangeText={(v) => { setBvnNumber(v); clearError('bvn'); }}
                            required
                            keyboardType="numeric"
                            error={validationErrors.bvn}
                        />

                        <InputField
                            label="National Identification Number (NIN)"
                            placeholder="Enter NIN"
                            value={ninNumber}
                            onChangeText={(v) => { setNinNumber(v); clearError('nin'); }}
                            required
                            keyboardType="numeric"
                            error={validationErrors.nin}
                        />

                        <InputField
                            label="International Passport Number"
                            placeholder="Enter international passport number"
                            value={passportNumber}
                            onChangeText={(v) => { setPassportNumber(v); clearError('passportNumber'); }}
                            required
                            error={validationErrors.passportNumber}
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
                                onUpload={() => uploadFile('WORK_PERMIT')}
                                fileName={workPermitFile?.name ?? null}
                                fileUri={workPermitFile?.uri ?? null}
                                fileType={workPermitFile?.type ?? null}
                            />
                            <InputField
                                label="Work Permit Number"
                                placeholder="Enter work permit number"
                                value={workPermitNumber}
                                onChangeText={(v) => { setWorkPermitNumber(v); clearError('workPermitNumber'); }}
                                required
                                error={validationErrors.workPermitNumber}
                            />
                        </View>

                        {/* International Passport */}
                        <View style={styles.documentSection}>
                            <Text style={styles.documentLabel}>
                                International Passport <Text style={styles.required}>*</Text>
                            </Text>
                            <FileUpload
                                onUpload={() => uploadFile('PASSPORT')}
                                fileName={passportFile?.name ?? null}
                                fileUri={passportFile?.uri ?? null}
                                fileType={passportFile?.type ?? null}
                            />
                            <View style={{ flexDirection: 'row', gap: moderateScale(12) }}>
                                <View style={{ flex: 1 }}>
                                    <DatePickerField
                                        label="Passport Issue Date"
                                        value={passportIssueDate}
                                        onDateChange={(v) => { setPassportIssueDate(v); clearError('passportIssueDate'); }}
                                        required
                                        maximumDate={new Date()}
                                        error={validationErrors.passportIssueDate}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <DatePickerField
                                        label="Passport Expiry Date"
                                        value={passportExpiryDate}
                                        onDateChange={(v) => { setPassportExpiryDate(v); clearError('passportExpiryDate'); }}
                                        required
                                        minimumDate={new Date()}
                                        error={validationErrors.passportExpiryDate}
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
                                onUpload={() => uploadFile('UTILITY_BILL')}
                                fileName={utilityBillFile?.name ?? null}
                                fileUri={utilityBillFile?.uri ?? null}
                                fileType={utilityBillFile?.type ?? null}
                            />
                            <InputField
                                label="Utility Bill Number"
                                placeholder="Enter utility bill number"
                                value={utilityBillNumber}
                                onChangeText={(v) => { setUtilityBillNumber(v); clearError('utilityBillNumber'); }}
                                required
                                error={validationErrors.utilityBillNumber}
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
                        title="Where would you like to receive your funds?"
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
        </>
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
