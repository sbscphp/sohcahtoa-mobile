import ControlledInput from '@/components/ControlledInput';
import InitiateTransactionSheet from '@/components/InitiateTransactionSheet';
import LoadingBackdrop from '@/components/LoadingBackdrop';
import { LocationItem } from '@/components/LocationSelectionSheet';
import CredentialStep from '@/components/transaction-flow/CredentialStep';
import DocumentStep from '@/components/transaction-flow/DocumentStep';
import ExchangeStep from '@/components/transaction-flow/ExchangeStep';
import LocationStep from '@/components/transaction-flow/LocationStep';
import TransactionLayout from '@/components/transaction-flow/TransactionLayout';
import { useCreateTransactionMutation } from '@/hooks/queries/transactions/useCreateTransactionMutation';
import { UploadedFile, UploadedMetadata, useDocumentUpload } from '@/hooks/useDocumentUpload';
import { useExchangeLogic } from '@/hooks/useExchangeLogic';
import { useToastStore } from '@/stores/useToastStore';
import { CITIES, LOCATIONS, STATES } from '@/utils/locations';
import { ptaStep0Schema, ptaStep1Schema, ptaStep2Schema, ptaStep3Schema } from '@/utils/validations/pta';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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
    } = useExchangeLogic({ setValue, initialAmount: '1' });

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
        { customComponent: <ControlledInput control={control} name="bvn" label="Bank Verification Number(BVN)" placeholder="Enter your BVN" required keyboardType="numeric" maxLength={11} filterType="numeric" /> },
        { customComponent: <ControlledInput control={control} name="nin" label="National Identification Number(NIN)" placeholder="Enter your NIN" required keyboardType="numeric" maxLength={11} filterType="numeric" /> },
        { customComponent: <ControlledInput control={control} name="formAId" label="Form A ID" placeholder="Enter Form A ID" required /> },
        { customComponent: <ControlledInput control={control} name="passportNumber" label="International Passport Number" placeholder="Enter international passport" required maxLength={9} filterType="alphanumeric" /> }
    ];

    const documentFields = [
        {
            label: 'Valid Visa',
            onUpload: () => uploadFile('VISA'),
            fileName: docs.visa.file?.name,
            fileUri: docs.visa.file?.uri,            fileUrl: docs.visa.meta?.fileUrl,
            fileType: docs.visa.file?.type,
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
            fileName: docs.ticket.file?.name,
            fileUri: docs.ticket.file?.uri,            fileUrl: docs.ticket.meta?.fileUrl,
            fileType: docs.ticket.file?.type,
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
            if (!docs.visa.file || !docs.ticket.file) {
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
        console.log(data, "PTA");
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
            passportNumber: data.passportNumber,
            visaNumber: data.visaNumber,
            ticketNumber: data.ticketNumber,
            documents: [
                ...(docs.visa.meta ? [docs.visa.meta] : []),
                ...(docs.ticket.meta ? [docs.ticket.meta] : [])
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
