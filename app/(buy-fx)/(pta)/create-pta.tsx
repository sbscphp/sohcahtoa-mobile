import InitiateTransactionSheet from '@/components/InitiateTransactionSheet';
import InputField from '@/components/InputField';
import LoadingBackdrop from '@/components/LoadingBackdrop';
import { LocationItem } from '@/components/LocationSelectionSheet';
import CredentialStep from '@/components/transaction-flow/CredentialStep';
import DocumentStep from '@/components/transaction-flow/DocumentStep';
import ExchangeStep from '@/components/transaction-flow/ExchangeStep';
import LocationStep from '@/components/transaction-flow/LocationStep';
import TransactionLayout from '@/components/transaction-flow/TransactionLayout';
import { useCalculateExchangeRateMutation } from '@/hooks/queries/transactions/useCalculateExchangeRateMutation';
import { useCreateTransactionMutation } from '@/hooks/queries/transactions/useCreateTransactionMutation';
import { useGetExchangeRatesQuery } from '@/hooks/queries/transactions/useGetExchangeRatesQuery';
import { useUploadTransactionDocumentMutation } from '@/hooks/queries/transactions/useUploadTransactionDocumentMutation';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToastStore } from '@/stores/useToastStore';
import { useTransactionStore } from '@/stores/useTransactionStore';
import * as DocumentPicker from 'expo-document-picker';
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

interface ValidationErrors {
    [key: string]: string | undefined;
}

export default function PersonalTravelAllowanceScreen() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);

    const { ptaData, setPtaData, resetPtaData } = useTransactionStore();
    const user = useAuthStore((state) => state.user);
    const createTransaction = useCreateTransactionMutation();
    const uploadDocument = useUploadTransactionDocumentMutation();
    const calculateExchangeRate = useCalculateExchangeRateMutation();

    const { data: exchangeRates } = useGetExchangeRatesQuery({
        fromCurrency: ptaData.currencyGet.code,
        toCurrency: ptaData.currencySend.code
    });

    React.useEffect(() => {
        if (exchangeRates?.data?.[0]?.sellRate) {
            setPtaData({ currentRate: exchangeRates.data[0].sellRate });
        }
    }, [exchangeRates, setPtaData]);

    const [initiateSheetVisible, setInitiateSheetVisible] = useState(false);
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
    const showToast = useToastStore((state) => state.showToast);

    const clearError = (field: string) => {
        if (validationErrors[field]) {
            setValidationErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const credentialFields = [
        { label: 'Bank Verification Number', placeholder: 'Enter your BVN', value: ptaData.bvn, onChangeText: (v: string) => { setPtaData({ bvn: v }); clearError('bvn'); }, required: true, keyboardType: 'numeric' as const, error: validationErrors.bvn },
        { label: 'National Identification Number', placeholder: 'Enter your NIN', value: ptaData.nin, onChangeText: (v: string) => { setPtaData({ nin: v }); clearError('nin'); }, required: true, keyboardType: 'numeric' as const, error: validationErrors.nin },
        { label: 'Form A ID', placeholder: 'Enter form A ID', value: ptaData.formAId, onChangeText: (v: string) => { setPtaData({ formAId: v }); clearError('formAId'); }, required: true, error: validationErrors.formAId },
        { label: 'International Passport Number', placeholder: 'Enter international passport', value: ptaData.passportNumber, onChangeText: (v: string) => { setPtaData({ passportNumber: v }); clearError('passportNumber'); }, required: true, error: validationErrors.passportNumber },
    ];

    // console.log('ptaData', ptaData);

    const handleFileUpload = async (type: 'VISA' | 'RETURN_TICKET') => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/*'],
                copyToCacheDirectory: true,
            });

            if (result.canceled || !result.assets || result.assets.length === 0) return;

            const asset = result.assets[0];

            if (!user?.id) {
                console.error('User ID not found');
                return;
            }

            uploadDocument.mutate({
                userId: user?.id,
                documentType: type,
                document: {
                    uri: asset.uri,
                    name: asset.name,
                    type: asset.mimeType || 'application/octet-stream'
                }
            }, {
                onSuccess: (response) => {
                    const uploaded = response.data;
                    console.log('uploaded', uploaded);
                    if (uploaded) {
                        const file = {
                            uri: asset.uri,
                            name: asset.name,
                            type: asset.mimeType || 'application/octet-stream',
                            size: asset.size || 0
                        };

                        const metadata = {
                            documentType: type,
                            fileUrl: uploaded.fileUrl,
                            fileName: uploaded.fileName,
                            fileSize: uploaded.fileSize || asset.size || 0
                        };

                        if (type === 'VISA') {
                            setPtaData({
                                visaFile: file,
                                visaMetadata: metadata,
                                visaUploadResponse: response
                            });
                            clearError('visaFile');
                        } else {
                            setPtaData({
                                ticketFile: file,
                                ticketMetadata: metadata,
                                ticketUploadResponse: response
                            });
                            clearError('ticketFile');
                        }
                    }
                }
            });

        } catch (error) {
            console.error('Error picking document:', error);
        }
    };

    const handleAmountGetChange = (amount: string) => {
        const cleanAmount = amount.replace(/,/g, '');
        setPtaData({ amountGet: amount });
        clearError('amount');

        if (cleanAmount && !isNaN(parseFloat(cleanAmount))) {
            calculateExchangeRate.mutate({
                fromCurrency: ptaData.currencyGet.code,
                toCurrency: ptaData.currencySend.code,
                amount: parseFloat(cleanAmount)
            }, {
                onSuccess: (response) => {
                    if (response.success && response.data) {
                        setPtaData({
                            amountSend: response.data.convertedAmount.toLocaleString(),
                            currentRate: response.data.sellRate
                        });
                    }
                }
            });
        } else {
            setPtaData({ amountSend: '0' });
        }
    };

    const handleCurrencyChange = (type: 'GET' | 'SEND', currency: any) => {
        const newPtaData = { ...ptaData };
        if (type === 'GET') {
            newPtaData.currencyGet = currency;
        } else {
            newPtaData.currencySend = currency;
        }
        setPtaData(newPtaData);

        const cleanAmount = ptaData.amountGet.replace(/,/g, '');
        if (cleanAmount && !isNaN(parseFloat(cleanAmount))) {
            calculateExchangeRate.mutate({
                fromCurrency: newPtaData.currencyGet.code,
                toCurrency: newPtaData.currencySend.code,
                amount: parseFloat(cleanAmount)
            }, {
                onSuccess: (response) => {
                    if (response.success && response.data) {
                        setPtaData({
                            amountSend: response.data.convertedAmount.toLocaleString(),
                            currentRate: response.data.sellRate
                        });
                    }
                }
            });
        }
    };

    // Step 2: Exchange Data
    const exchangeRateText = `1 ${ptaData.currencyGet.code} = ${ptaData.currentRate.toLocaleString()} ${ptaData.currencySend.code}`;

    // Documents for Step 1
    const documentFields = [
        {
            label: 'Valid Visa',
            onUpload: () => handleFileUpload('VISA'),
            fileName: ptaData.visaFile?.name,
            required: true,
            error: validationErrors.visaFile,
            associatedInputs: (
                <InputField
                    label="Valid Visa Number"
                    placeholder="Enter valid visa number"
                    required
                    value={ptaData.visaNumber}
                    onChangeText={(v) => { setPtaData({ visaNumber: v }); clearError('visaNumber'); }}
                    error={validationErrors.visaNumber}
                />
            )
        },
        {
            label: 'Return Ticket',
            onUpload: () => handleFileUpload('RETURN_TICKET'),
            fileName: ptaData.ticketFile?.name,
            required: true,
            error: validationErrors.ticketFile,
            associatedInputs: (
                <InputField
                    label="Return Ticket Number"
                    placeholder="Enter return ticket number"
                    required
                    value={ptaData.ticketNumber}
                    onChangeText={(v) => { setPtaData({ ticketNumber: v }); clearError('ticketNumber'); }}
                    error={validationErrors.ticketNumber}
                />
            )
        }
    ];

    // --- Handlers ---

    const handleNext = () => {
        const errors: ValidationErrors = {};

        if (currentStep === 0) {
            if (!ptaData.bvn || ptaData.bvn.length !== 11) {
                errors.bvn = 'Please enter a valid 11-digit BVN';
            }
            if (!ptaData.nin || ptaData.nin.length !== 11) {
                errors.nin = 'Please enter a valid 11-digit NIN';
            }
            if (!ptaData.formAId) {
                errors.formAId = 'Please enter your Form A ID';
            }
            if (!ptaData.passportNumber) {
                errors.passportNumber = 'Please enter your International Passport Number';
            }
        }

        if (currentStep === 1) {
            if (uploadDocument.isPending) {
                showToast('Please wait for files to finish uploading', 'warning');
                return;
            }
            // if (!ptaData.visaMetadata) {
            //     errors.visaFile = 'Please upload a valid Visa';
            // }
            // if (!ptaData.visaNumber) {
            //     errors.visaNumber = 'Please enter your Visa Number';
            // }
            // if (!ptaData.ticketMetadata) {
            //     errors.ticketFile = 'Please upload your Return Ticket';
            // }
            // if (!ptaData.ticketNumber) {
            //     errors.ticketNumber = 'Please enter your Return Ticket Number';
            // }
        }

        if (currentStep === 2) {
            const amount = parseFloat(ptaData.amountGet.replace(/,/g, ''));
            if (!amount || amount <= 0) {
                errors.amount = 'Please enter a valid amount';
            } else if (amount > 4000) {
                errors.amount = 'Maximum amount for PTA is $4,000 per quarter';
            }
        }

        if (currentStep === 3) {
            if (!ptaData.selectedState) errors.state = 'Please select a state';
            if (!ptaData.selectedCity) errors.city = 'Please select a city';
            if (!ptaData.selectedLocation) errors.location = 'Please select a pickup location';
            if (!ptaData.pickupDate) errors.pickupDate = 'Please select a pickup date';
            if (!ptaData.pickupTime) errors.pickupTime = 'Please select a pickup time';
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
            type: 'PTA',
            currency: ptaData.currencyGet.code,
            amount: parseFloat(ptaData.amountGet.replace(/,/g, '')),
            purpose: 'I am going on a Vacation (PTA)',
            destinationCountry: ptaData.currencyGet.country,
            bvn: ptaData.bvn,
            nin: ptaData.nin,
            formAId: ptaData.formAId,
            documents: [
                ...(ptaData.visaMetadata ? [ptaData.visaMetadata] : []),
                ...(ptaData.ticketMetadata ? [ptaData.ticketMetadata] : [])
            ],
            pickupLocation: ptaData.selectedLocation ? {
                id: ptaData.selectedLocation.id,
                name: ptaData.selectedLocation.title,
                address: ptaData.selectedLocation.subtitle || '',

            } : undefined
        };

        createTransaction.mutate(payload, {
            onSuccess: (response) => {
                if (response.success) {
                    setInitiateSheetVisible(false);
                    resetPtaData();
                    router.push('/(buy-fx)/(pta)/request-initiated-success');
                }
            }
        });
    };

    return (
        <View style={{ flex: 1 }}>
            <LoadingBackdrop visible={uploadDocument.isPending} />
            <TransactionLayout
                title="Personal Travel Allowance"
                currentStep={currentStep}
                totalSteps={4}
                onBack={handleBack}
                onNext={handleNext}
                nextLabel={currentStep === 3 ? (ptaData.selectedState && ptaData.selectedCity ? "Initiate Transaction Request" : "Continue") : "Continue"}
            >
                {currentStep === 0 && (
                    <CredentialStep fields={credentialFields} />
                )}

                {currentStep === 1 && (
                    <DocumentStep documents={documentFields} />
                )}

                {currentStep === 2 && (
                    <ExchangeStep
                        transactionType={ptaData.transactionType}
                        onTransactionTypeChange={(v) => setPtaData({ transactionType: v })}
                        currencyGet={ptaData.currencyGet}
                        onCurrencyGetChange={(v: any) => handleCurrencyChange('GET', v)}
                        currencySend={ptaData.currencySend}
                        onCurrencySendChange={(v: any) => handleCurrencyChange('SEND', v)}
                        amountGet={ptaData.amountGet}
                        amountSend={ptaData.amountSend}
                        rate={exchangeRateText}
                        onAmountGetChange={handleAmountGetChange}
                        onAmountSendChange={(v) => setPtaData({ amountSend: v })}
                        error={validationErrors.amount}
                    />
                )}

                {currentStep === 3 && (
                    <LocationStep
                        states={STATES}
                        cities={CITIES}
                        locations={LOCATIONS}
                        selectedState={ptaData.selectedState}
                        onSelectState={(v) => { setPtaData({ selectedState: v }); clearError('state'); }}
                        selectedCity={ptaData.selectedCity}
                        onSelectCity={(v) => { setPtaData({ selectedCity: v }); clearError('city'); }}
                        selectedLocation={ptaData.selectedLocation}
                        onSelectLocation={(v) => { setPtaData({ selectedLocation: v }); clearError('location'); }}
                        pickupDate={ptaData.pickupDate}
                        onPickupDateChange={(v) => { setPtaData({ pickupDate: v }); clearError('pickupDate'); }}
                        pickupTime={ptaData.pickupTime}
                        onPickupTimeChange={(v) => { setPtaData({ pickupTime: v }); clearError('pickupTime'); }}
                        errors={{
                            state: validationErrors.state,
                            city: validationErrors.city,
                            location: validationErrors.location,
                            pickupDate: validationErrors.pickupDate,
                            pickupTime: validationErrors.pickupTime
                        }}
                    />
                )}

                <InitiateTransactionSheet
                    visible={initiateSheetVisible}
                    onClose={() => setInitiateSheetVisible(false)}
                    onConfirm={handleConfirmInitiate}
                    title="Initiate PTA Transaction request?"
                    loading={createTransaction.isPending}
                    items={[
                        {
                            title: "Verification before approval",
                            description: "You will be able to process your PTA once your documents are verified and approved.",
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
        </View>
    );
}
