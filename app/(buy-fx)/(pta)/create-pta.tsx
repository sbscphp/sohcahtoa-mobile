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
import { useGetPickupPointsQuery } from '@/hooks/queries/transactions/useGetPickupPointsQuery';
import { useDocumentUpload } from '@/hooks/useDocumentUpload';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToastStore } from '@/stores/useToastStore';
import { useTransactionStore } from '@/stores/useTransactionStore';
import { ptaStep0Schema, ptaStep1Schema, ptaStep2Schema, ptaStep3Schema } from '@/utils/validations/pta';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { z } from 'zod';

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
    const calculateExchangeRate = useCalculateExchangeRateMutation();

    const { upload: uploadFile, isPending: isUploading } = useDocumentUpload({
        onSuccess: (documentType, { file, metadata, response }) => {
            if (documentType === 'VISA') {
                setPtaData({ visaFile: file, visaMetadata: metadata, visaUploadResponse: response });
                clearError('visaFile');
            } else {
                setPtaData({ ticketFile: file, ticketMetadata: metadata, ticketUploadResponse: response });
                clearError('ticketFile');
            }
        },
    });

    const { data: exchangeRates } = useGetExchangeRatesQuery({
        fromCurrency: ptaData.currencyGet.code,
        toCurrency: ptaData.currencySend.code
    });

    const { data: pickupPointsData } = useGetPickupPointsQuery();

    // // Derive States from API data
    // const STATES: LocationItem[] = Array.from(
    //     new Set(pickupPointsData?.data?.map((p) => p.location))
    // ).map((location, index) => ({
    //     id: (index + 1).toString(),
    //     title: location,
    // })).filter(state => state.title);

    // // Derive Cities based on selected State
    // const CITIES: LocationItem[] = Array.from(
    //     new Set(
    //         pickupPointsData?.data
    //             ?.filter((p) => p.location === ptaData.selectedState?.title)
    //             .map((p) => p.branch)
    //     )
    // ).map((branch, index) => ({
    //     id: (index + 1).toString(),
    //     title: branch,
    // })).filter(city => city.title);

    // // Derive Locations based on selected State and City
    // const LOCATIONS: LocationItem[] = (pickupPointsData?.data || [])
    //     .filter(
    //         (p) =>
    //             p.location === ptaData.selectedState?.title &&
    //             p.branch === ptaData.selectedCity?.title
    //     )
    //     .map((p) => ({
    //         id: p.id,
    //         title: p.name,
    //         subtitle: p.address,
    //     }));

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
            onUpload: () => uploadFile('VISA'),
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
            onUpload: () => uploadFile('RETURN_TICKET'),
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
            const result = ptaStep0Schema.safeParse({
                bvn: ptaData.bvn,
                nin: ptaData.nin,
                formAId: ptaData.formAId,
                passportNumber: ptaData.passportNumber,
            });
            if (!result.success) {
                result.error.issues.forEach((e: z.ZodIssue) => {
                    const key = e.path[0] as string;
                    if (!errors[key]) errors[key] = e.message;
                });
            }
        }

        if (currentStep === 1) {
            if (isUploading) {
                showToast('Please wait for files to finish uploading', 'warning');
                return;
            }
            const result = ptaStep1Schema.safeParse({
                visaFile: ptaData.visaFile?.name ?? '',
                visaNumber: ptaData.visaNumber ?? '',
                ticketFile: ptaData.ticketFile?.name ?? '',
                ticketNumber: ptaData.ticketNumber ?? '',
            });
            if (!result.success) {
                result.error.issues.forEach((e: z.ZodIssue) => {
                    const key = e.path[0] as string;
                    if (!errors[key]) errors[key] = e.message;
                });
            }
        }

        if (currentStep === 2) {
            const result = ptaStep2Schema.safeParse({
                amount: parseFloat(ptaData.amountGet.replace(/,/g, '')),
            });
            if (!result.success) {
                result.error.issues.forEach((e: z.ZodIssue) => {
                    if (!errors.amount) errors.amount = e.message;
                });
            }
        }

        if (currentStep === 3) {
            const result = ptaStep3Schema.safeParse({
                selectedState: ptaData.selectedState,
                selectedCity: ptaData.selectedCity,
                selectedLocation: ptaData.selectedLocation,
                pickupDate: ptaData.pickupDate,
                pickupTime: ptaData.pickupTime,
            });
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
        // Convert dd/mm/yyyy to yyyy-MM-dd for the API
        const formatDateForApi = (dateStr: string): string => {
            if (!dateStr) return '';
            const parts = dateStr.split('/');
            if (parts.length === 3) {
                return `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
            return dateStr;
        };

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
                name: ptaData.selectedLocation.title,
                address: ptaData.selectedLocation.subtitle || '',
                state: ptaData.selectedState?.title || '',
                city: ptaData.selectedCity?.title || '',
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
            <LoadingBackdrop visible={isUploading} />
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
                        allowedModes={['buy']}
                        error={validationErrors.amount}
                    />
                )}

                {currentStep === 3 && (
                    <LocationStep
                        states={STATES}
                        cities={CITIES}
                        locations={LOCATIONS}
                        selectedState={ptaData.selectedState}
                        onSelectState={(v) => {
                            setPtaData({
                                selectedState: v,
                                selectedCity: null,
                                selectedLocation: null
                            });
                            clearError('state');
                        }}
                        selectedCity={ptaData.selectedCity}
                        onSelectCity={(v) => {
                            setPtaData({
                                selectedCity: v,
                                selectedLocation: null
                            });
                            clearError('city');
                        }}
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
