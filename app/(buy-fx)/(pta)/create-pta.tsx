import ControlledInput from '@/components/ControlledInput';
import InitiateTransactionSheet from '@/components/InitiateTransactionSheet';
import LoadingBackdrop from '@/components/LoadingBackdrop';
import CredentialStep from '@/components/transaction-flow/CredentialStep';
import DocumentStep from '@/components/transaction-flow/DocumentStep';
import ExchangeStep from '@/components/transaction-flow/ExchangeStep';
import LocationStep from '@/components/transaction-flow/LocationStep';
import TransactionLayout from '@/components/transaction-flow/TransactionLayout';
import { useCreateTransactionMutation } from '@/hooks/queries/transactions/useCreateTransactionMutation';
import { useProfileQuery } from '@/hooks/queries/auth/useProfileQuery';
import { useGetPickupPointsQuery } from '@/hooks/queries/transactions/useGetPickupPointsQuery';
import { useGetPickupStatesQuery } from '@/hooks/queries/transactions/useGetPickupStatesQuery';
import { useGetPickupCitiesQuery } from '@/hooks/queries/transactions/useGetPickupCitiesQuery';
import { UploadedFile, UploadedMetadata, useDocumentUpload } from '@/hooks/useDocumentUpload';
import { useExchangeLogic } from '@/hooks/useExchangeLogic';
import { useToastStore } from '@/stores/useToastStore';
import { LocationItem } from '@/utils/locations';
import { useAuthStore } from '@/stores/useAuthStore';
import { ptaStep0Schema, ptaStep1Schema, ptaStep2Schema, ptaStep3Schema } from '@/utils/validations/pta';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
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
    const showToast = useToastStore(s => s.showToast);
    useProfileQuery(); // Ensure latest user data is loaded
    const user = useAuthStore(s => s.user);

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
            bvn: user?.kyc?.bvn || '',
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

    const {
        transactionType,
        setTransactionType,
        currencyGet,
        setCurrencyGet,
        currencySend,
        setCurrencySend,
        amountGetStr,
        setAmountGetStr,
        amountSendStr,
        setAmountSendStr,
        currentRate,
    } = useExchangeLogic({ setValue, initialAmount: '0', maxLimit: 4000 });

    // Dynamic Locations
    const { data: states = [] } = useGetPickupStatesQuery();
    const { data: allLocations = [] } = useGetPickupPointsQuery();
    
    const watchedFields = watch() as any;

    const { data: filteredCities = [] } = useGetPickupCitiesQuery(watchedFields.selectedState?.title);

    const filteredLocations = useMemo(() => {
        if (!watchedFields.selectedCity) return [];
        return allLocations.filter((loc: any) => loc.metadata.city === watchedFields.selectedCity.title);
    }, [watchedFields.selectedCity, allLocations]);

    // Document upload files state
    const [docs, setDocs] = useState({
        visa: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
        ticket: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
    });

    const updateDoc = (key: keyof typeof docs, file: UploadedFile, metadata: UploadedMetadata) => {
        setDocs(prev => ({ ...prev, [key]: { file, meta: metadata } }));
    };

    const { upload: uploadFile, isPending: isUploading } = useDocumentUpload({
        onSuccess: (documentType, { file, metadata }) => {
            if (documentType === 'VISA') updateDoc('visa', file, metadata);
            else if (documentType === 'RETURN_TICKET') updateDoc('ticket', file, metadata);
        },
        onError: () => showToast('Failed to upload document. Please try again.', 'error'),
    });

    const credentialFields = [
        { customComponent: <ControlledInput control={control} name="bvn" label="Bank Verification Number(BVN)" placeholder="Enter your BVN" required keyboardType="numeric" maxLength={11} filterType="numeric" disabled /> },
        { customComponent: <ControlledInput control={control} name="nin" label="National Identification Number(NIN)" placeholder="Enter your NIN" required keyboardType="numeric" maxLength={11} filterType="numeric" /> },
        { customComponent: <ControlledInput control={control} name="formAId" label="Form A ID" placeholder="Enter Form A ID" required /> },
        { customComponent: <ControlledInput control={control} name="passportNumber" label="International Passport Number" placeholder="Enter international passport" required maxLength={9} filterType="alphanumeric" /> },
    ];

    const documentFields = [
        {
            label: 'Valid Visa',
            onUpload: () => uploadFile('VISA'),
            fileName: docs.visa.file?.name,
            fileUri: docs.visa.file?.uri, fileUrl: docs.visa.meta?.fileUrl,
            fileType: docs.visa.file?.type,
            required: true,
            associatedInputs: (
                <View>
                    <ControlledInput control={control} name="visaNumber" label="Valid Visa Number" required placeholder="Enter valid visa number" maxLength={8} filterType="alphanumeric" />
                </View>
            )
        },
        {
            label: 'Return Ticket',
            onUpload: () => uploadFile('RETURN_TICKET'),
            fileName: docs.ticket.file?.name,
            fileUri: docs.ticket.file?.uri, fileUrl: docs.ticket.meta?.fileUrl,
            fileType: docs.ticket.file?.type,
            required: true,
            associatedInputs: (
                <View>
                    <ControlledInput control={control} name="ticketNumber" label="Return Ticket Number" required placeholder="Enter return ticket number" maxLength={13} filterType="numeric" keyboardType="numeric" />
                </View>
            )
        }
    ];

    const handleNext = async () => {
        const stepSchemas = [ptaStep0Schema, ptaStep1Schema, ptaStep2Schema, ptaStep3Schema];
        const isValid = await trigger(Object.keys(stepSchemas[currentStep].shape) as any);

        if (isValid) {
            if (currentStep < 3) {
                setCurrentStep(prev => prev + 1);
            } else {
                setInitiateSheetVisible(true);
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        } else {
            router.back();
        }
    };

    const handleInitiate = (data: PtaFormValues) => {
        const payload = {
            type: 'PTA',
            currency: currencyGet.code,
            amount: data.amount,
            purpose: 'Personal Travel Allowance (PTA)',
            destinationCountry: currencyGet.country,
            bvn: data.bvn,
            nin: data.nin,
            formAId: data.formAId,
            passportNumber: data.passportNumber,
            visaNumber: data.visaNumber,
            ticketNumber: data.ticketNumber,
            documents: [
                ...(docs.visa.meta ? [docs.visa.meta] : []),
                ...(docs.ticket.meta ? [docs.ticket.meta] : []),
            ],
            pickupLocation: {
                state: data.selectedState.title,
                city: data.selectedCity.title,
                name: data.selectedLocation.title,
                address: data.selectedLocation.subtitle || '',
                locationId: data.selectedLocation.id,
                date: data.pickupDate,
                time: data.pickupTime,
            }
        };

        createTransaction.mutate(payload, {
            onSuccess: (response: any) => {
                if (response.success) {
                    setInitiateSheetVisible(false);
                    router.push({
                        pathname: '/(buy-fx)/(pta)/request-initiated-success',
                        params: { transactionId: response.data?.transactionId }
                    });
                }
            },
            onError: (error: any) => {
                showToast(error?.response?.data?.message || 'Failed to initiate transaction', 'error');
            }
        });
    };

    const isNextDisabled = currentStep === 1
        ? !docs.visa.file || !docs.ticket.file
        : false;

    return (
        <View style={{ flex: 1 }}>
            <LoadingBackdrop visible={isUploading || createTransaction.isPending} />
            <TransactionLayout
                title="Personal Travel Allowance (PTA)"
                currentStep={currentStep}
                totalSteps={4}
                onBack={handleBack}
                onNext={handleNext}
                isNextDisabled={isNextDisabled}
                nextLabel={currentStep === 3 ? (watchedFields.selectedState && watchedFields.selectedCity ? "Initiate Transaction Request" : "Continue") : "Continue"}
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
                        amountGet={amountGetStr}
                        amountSend={amountSendStr}
                        rate={`1 ${currencyGet.code} = ${currentRate.toLocaleString()} ${currencySend.code}`}
                        onAmountGetChange={setAmountGetStr}
                        onAmountSendChange={setAmountSendStr}
                        allowedModes={['buy']}
                        error={errors.amount?.message}
                    />
                )}
                {currentStep === 3 && (
                    <LocationStep
                        states={states}
                        cities={filteredCities}
                        locations={filteredLocations}
                        selectedState={watchedFields.selectedState}
                        onSelectState={(item) => {
                            setValue('selectedState', item);
                            setValue('selectedCity', undefined as unknown as LocationItem);
                            setValue('selectedLocation', undefined as unknown as LocationItem);
                        }}
                        selectedCity={watchedFields.selectedCity}
                        onSelectCity={(item) => {
                            setValue('selectedCity', item);
                            setValue('selectedLocation', undefined as unknown as LocationItem);
                        }}
                        selectedLocation={watchedFields.selectedLocation}
                        onSelectLocation={(item) => setValue('selectedLocation', item)}
                        pickupDate={watchedFields.pickupDate}
                        onPickupDateChange={(date) => setValue('pickupDate', date)}
                        pickupTime={watchedFields.pickupTime}
                        onPickupTimeChange={(time) => setValue('pickupTime', time)}
                        errors={errors as any}
                    />
                )}
            </TransactionLayout>

            <InitiateTransactionSheet
                visible={initiateSheetVisible}
                onClose={() => setInitiateSheetVisible(false)}
                onConfirm={handleSubmit(handleInitiate)}
                loading={createTransaction.isPending}
            />
        </View>
    );
}
