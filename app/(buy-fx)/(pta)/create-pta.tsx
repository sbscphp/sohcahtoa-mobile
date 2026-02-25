import ControlledInput from '@/components/ControlledInput';
import InitiateTransactionSheet from '@/components/InitiateTransactionSheet';
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
import { useDocumentUpload } from '@/hooks/useDocumentUpload';
import { useToastStore } from '@/stores/useToastStore';
import { CITIES, LOCATIONS, STATES } from '@/utils/locations';
import { ptaStep0Schema, ptaStep1Schema, ptaStep2Schema, ptaStep3Schema } from '@/utils/validations/pta';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import { z } from 'zod';

const ptaFormSchema = z.object({
    ...ptaStep0Schema.shape,
    ...ptaStep1Schema.shape,
    ...ptaStep2Schema.shape,
    ...ptaStep3Schema.shape
});

type PtaFormValues = z.infer<typeof ptaFormSchema>;

export default function PersonalTravelAllowanceScreen() {
    const router = useRouter();
    const createTransaction = useCreateTransactionMutation();
    const calculateExchangeRate = useCalculateExchangeRateMutation();
    const showToast = useToastStore(s => s.showToast);

    const [currentStep, setCurrentStep] = useState(0);
    const [initiateSheetVisible, setInitiateSheetVisible] = useState(false);

    const {
        control,
        handleSubmit,
        trigger,
        watch,
        setValue,
        formState: { errors }
    } = useForm<PtaFormValues>({
        resolver: zodResolver(ptaFormSchema),
        defaultValues: {
            bvn: '',
            nin: '',
            formAId: '',
            passportNumber: '',
            visaNumber: '',
            ticketNumber: '',
            amount: 0,
            selectedState: undefined as unknown as LocationItem,
            selectedCity: undefined as unknown as LocationItem,
            selectedLocation: undefined as unknown as LocationItem,
            pickupDate: '',
            pickupTime: '',
        },
        mode: 'onChange'
    });

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

    const [amountGetStr, setAmountGetStr] = useState('1');
    const [amountSendStr, setAmountSendStr] = useState('0');
    const [currentRate, setCurrentRate] = useState(0);

    // Document upload files state
    const [visaFile, setVisaFile] = useState<any>(null);
    const [visaMetadata, setVisaMetadata] = useState<any>(null);
    const [ticketFile, setTicketFile] = useState<any>(null);
    const [ticketMetadata, setTicketMetadata] = useState<any>(null);

    const { upload: uploadFile, isPending: isUploading } = useDocumentUpload({
        onSuccess: (documentType, { file, metadata }) => {
            if (documentType === 'VISA') {
                setVisaFile(file);
                setVisaMetadata(metadata);
            } else if (documentType === 'RETURN_TICKET') {
                setTicketFile(file);
                setTicketMetadata(metadata);
            }
        },
        onError: () => showToast('Failed to upload document. Please try again.', 'error'),
    });

    const { data: exchangeRates } = useGetExchangeRatesQuery({
        fromCurrency: currencyGet.code,
        toCurrency: currencySend.code
    });

    useEffect(() => {
        if (exchangeRates?.data?.[0]?.sellRate) {
            setCurrentRate(exchangeRates.data[0].sellRate);
        }
    }, [exchangeRates]);

    const handleAmountGetChange = (amount: string) => {
        const cleanAmount = amount.replace(/,/g, '');
        setAmountGetStr(amount);
        setValue('amount', parseFloat(cleanAmount) || 0);

        if (cleanAmount && !isNaN(parseFloat(cleanAmount))) {
            calculateExchangeRate.mutate({
                fromCurrency: currencyGet.code,
                toCurrency: currencySend.code,
                amount: parseFloat(cleanAmount)
            }, {
                onSuccess: (response) => {
                    if (response.success && response.data) {
                        setAmountSendStr(response.data.convertedAmount.toLocaleString());
                        setCurrentRate(response.data.sellRate);
                    }
                }
            });
        } else {
            setAmountSendStr('0');
        }
    };

    const handleCurrencyChange = (type: 'GET' | 'SEND', currency: any) => {
        if (type === 'GET') {
            setCurrencyGet(currency);
        } else {
            setCurrencySend(currency);
        }

        const cleanAmount = amountGetStr.replace(/,/g, '');
        if (cleanAmount && !isNaN(parseFloat(cleanAmount))) {
            calculateExchangeRate.mutate({
                fromCurrency: type === 'GET' ? currency.code : currencyGet.code,
                toCurrency: type === 'SEND' ? currency.code : currencySend.code,
                amount: parseFloat(cleanAmount)
            }, {
                onSuccess: (response) => {
                    if (response.success && response.data) {
                        setAmountSendStr(response.data.convertedAmount.toLocaleString());
                        setCurrentRate(response.data.sellRate);
                    }
                }
            });
        }
    };

    const credentialFields = [
        { customComponent: <ControlledInput control={control} name="bvn" label="Bank Verification Number(BVN)" placeholder="Enter your BVN" required keyboardType="numeric" /> },
        { customComponent: <ControlledInput control={control} name="nin" label="National Identification Number(NIN)" placeholder="Enter your NIN" required keyboardType="numeric" /> },
        { customComponent: <ControlledInput control={control} name="formAId" label="Form A ID" placeholder="Enter Form A ID" required /> },
        { customComponent: <ControlledInput control={control} name="passportNumber" label="International Passport Number" placeholder="Enter international passport" required /> }
    ];

    const documentFields = [
        {
            label: 'Valid Visa',
            onUpload: () => uploadFile('VISA'),
            fileName: visaFile?.name,
            fileUri: visaFile?.uri,
            fileType: visaFile?.type,
            required: true,
            associatedInputs: (
                <View>
                    <ControlledInput control={control} name="visaNumber" label="Valid Visa Number" required placeholder="Enter valid visa number" keyboardType="numeric" />
                </View>
            )
        },
        {
            label: 'Return Ticket',
            onUpload: () => uploadFile('RETURN_TICKET'),
            fileName: ticketFile?.name,
            fileUri: ticketFile?.uri,
            fileType: ticketFile?.type,
            required: true,
            associatedInputs: (
                <View>
                    <ControlledInput control={control} name="ticketNumber" label="Return Ticket Number" required placeholder="Enter return ticket number" />
                </View>
            )
        }
    ];

    const handleNext = async () => {
        if (isUploading) {
            showToast('Please wait for files to finish uploading', 'warning');
            return;
        }

        let isStepValid = false;

        if (currentStep === 0) {
            isStepValid = await trigger(['bvn', 'nin', 'formAId', 'passportNumber']);
        } else if (currentStep === 1) {
            if (!visaFile || !ticketFile) {
                showToast('Please upload all required documents (Visa and Return Ticket)', 'error');
                return;
            }
            isStepValid = await trigger(['visaNumber', 'ticketNumber']);
        } else if (currentStep === 2) {
            isStepValid = await trigger(['amount']);
        } else if (currentStep === 3) {
            isStepValid = await trigger(['selectedState', 'selectedCity', 'selectedLocation', 'pickupDate', 'pickupTime']);
        }

        if (isStepValid) {
            if (currentStep < 3) {
                setCurrentStep(currentStep + 1);
            } else {
                setInitiateSheetVisible(true);
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        } else {
            router.back();
        }
    };

    const onSubmit = (data: PtaFormValues) => {
        console.log(data,"PTA");
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
            currency: currencyGet.code,
            amount: data.amount,
            purpose: 'I am going on a Vacation (PTA)',
            destinationCountry: currencyGet.country,
            bvn: data.bvn,
            nin: data.nin,
            formAId: data.formAId,
            documents: [
                ...(visaMetadata ? [visaMetadata] : []),
                ...(ticketMetadata ? [ticketMetadata] : [])
            ],
            pickupLocation: data.selectedLocation ? {
                name: data.selectedLocation.title,
                address: data.selectedLocation.subtitle || '',
                state: data.selectedState?.title || '',
                city: data.selectedCity?.title || '',
                scheduledPickupDate: formatDateForApi(data.pickupDate),
                scheduledPickupTime: data.pickupTime,
            } : undefined
        };

        createTransaction.mutate(payload, {
            onSuccess: (response) => {
                if (response.success) {
                    setInitiateSheetVisible(false);
                    router.push({
                        pathname: '/(buy-fx)/(pta)/request-initiated-success',
                        params: { transactionId: response.data?.transactionId }
                    });
                }
            }
        });
    };

    const selectedState = watch('selectedState');
    const selectedCity = watch('selectedCity');
    const selectedLocation = watch('selectedLocation');
    const pickupDate = watch('pickupDate');
    const pickupTime = watch('pickupTime');

    return (
        <View style={{ flex: 1 }}>
            <LoadingBackdrop visible={isUploading} />
            <TransactionLayout
                title="Personal Travel Allowance"
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
                        onCurrencyGetChange={(v: any) => handleCurrencyChange('GET', v)}
                        currencySend={currencySend}
                        onCurrencySendChange={(v: any) => handleCurrencyChange('SEND', v)}
                        amountGet={amountGetStr}
                        amountSend={amountSendStr}
                        rate={`1 ${currencyGet.code} = ${currentRate.toLocaleString()} ${currencySend.code}`}
                        onAmountGetChange={handleAmountGetChange}
                        onAmountSendChange={setAmountSendStr}
                        allowedModes={['buy']}
                        error={errors.amount?.message}
                    />
                )}

                {currentStep === 3 && (
                    <LocationStep
                        states={STATES}
                        cities={CITIES}
                        locations={LOCATIONS}
                        selectedState={selectedState}
                        onSelectState={(v) => {
                            setValue('selectedState', v);
                            setValue('selectedCity', undefined as unknown as LocationItem);
                            setValue('selectedLocation', undefined as unknown as LocationItem);
                        }}
                        selectedCity={selectedCity}
                        onSelectCity={(v) => {
                            setValue('selectedCity', v);
                            setValue('selectedLocation', undefined as unknown as LocationItem);
                        }}
                        selectedLocation={selectedLocation}
                        onSelectLocation={(v) => setValue('selectedLocation', v)}
                        pickupDate={pickupDate}
                        onPickupDateChange={(v: string) => setValue('pickupDate', v)}
                        pickupTime={pickupTime}
                        onPickupTimeChange={(v: string) => setValue('pickupTime', v)}
                        errors={{
                            state: errors.selectedState?.message as string | undefined,
                            city: errors.selectedCity?.message as string | undefined,
                            location: errors.selectedLocation?.message as string | undefined,
                            pickupDate: errors.pickupDate?.message as string | undefined,
                            pickupTime: errors.pickupTime?.message as string | undefined
                        }}
                    />
                )}

                <InitiateTransactionSheet
                    visible={initiateSheetVisible}
                    onClose={() => setInitiateSheetVisible(false)}
                    onConfirm={handleSubmit(onSubmit)}
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
