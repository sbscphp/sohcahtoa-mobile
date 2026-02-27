import ControlledDatePicker from '@/components/ControlledDatePicker';
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
import {
    residentStep0Schema,
    residentStep1Schema,
    residentStep2Schema,
    residentStep3Schema,
} from '@/utils/validations/resident';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import { z } from 'zod';

import { CITIES, LOCATIONS, STATES } from '@/utils/locations';

const residentFormSchema = z.object({
    ...residentStep0Schema.shape,
    ...residentStep1Schema.shape,
    ...residentStep2Schema.shape,
    ...residentStep3Schema.shape
});

type ResidentFormValues = z.infer<typeof residentFormSchema>;

export default function CreateResidentScreen() {
    const router = useRouter();
    const createTransaction = useCreateTransactionMutation();
    const [currentStep, setCurrentStep] = useState(0);

    const {
        control,
        handleSubmit,
        trigger,
        watch,
        setValue,
        formState: { errors }
    } = useForm<ResidentFormValues>({
        resolver: zodResolver(residentFormSchema),
        defaultValues: {
            bvn: '',
            nin: '',
            passportNumber: '',
            passportIssueDate: '',
            passportExpiryDate: '',
            utilityNumber: '',
            amount: 0,
            selectedState: undefined as unknown as LocationItem,
            selectedCity: undefined as unknown as LocationItem,
            selectedLocation: undefined as unknown as LocationItem,
            pickupDate: '',
            pickupTime: '',
        },
        mode: 'onChange'
    });

    // Step 1 — uploaded files
    const [docs, setDocs] = useState({
        passport: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
        utility: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
    });

    const updateDoc = (key: keyof typeof docs, file: UploadedFile, metadata: UploadedMetadata) => {
        setDocs(prev => ({ ...prev, [key]: { file, meta: metadata } }));
    };

    const showToast = useToastStore(s => s.showToast);

    const { upload: uploadFile, isPending: isUploading } = useDocumentUpload({
        onSuccess: (documentType, { file, metadata }) => {
            if (documentType === 'PASSPORT') updateDoc('passport', file, metadata);
            else if (documentType === 'UTILITY_BILL') updateDoc('utility', file, metadata);
        },
        onError: () => showToast('Failed to upload document. Please try again.', 'error'),
    });

    // Step 2
    const {
        transactionType,
        setTransactionType,
        currencyGet,
        setCurrencyGet,
        currencySend,
        setCurrencySend,
        amountGetStr: amountGet,
        setAmountGetStr: setAmountGet,
        amountSendStr: amountSend,
        setAmountSendStr: setAmountSend,
        currentRate,
    } = useExchangeLogic({ setValue, initialAmount: '1' });

    const [initiateSheetVisible, setInitiateSheetVisible] = useState(false);

    const credentialFields = [
        {
            customComponent: (
                <ControlledInput
                    control={control}
                    name="bvn"
                    label="Bank Verification Number (BVN)"
                    placeholder="Enter BVN"
                    required
                    keyboardType="numeric"
                />
            )
        },
        {
            customComponent: (
                <ControlledInput
                    control={control}
                    name="nin"
                    label="National Identification Number (NIN)"
                    placeholder="Enter NIN"
                    required
                    keyboardType="numeric"
                />
            )
        },
        {
            customComponent: (
                <ControlledInput
                    control={control}
                    name="passportNumber"
                    label="International Passport Number"
                    placeholder="Enter international passport number"
                    required
                />
            )
        },
    ];

    const documentFields = [
        {
            label: 'International Passport',
            onUpload: () => uploadFile('PASSPORT'),
            fileName: docs.passport.file?.name,
            fileUri: docs.passport.file?.uri,
            fileType: docs.passport.file?.type,
            required: true,
            associatedInputs: (
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1 }}>
                        <ControlledDatePicker
                            control={control}
                            name="passportIssueDate"
                            label="Passport Issue Date"
                            required
                            maximumDate={new Date()}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <ControlledDatePicker
                            control={control}
                            name="passportExpiryDate"
                            label="Passport Expiry Date"
                            required
                            minimumDate={new Date()}
                        />
                    </View>
                </View>
            ),
        },
        {
            label: 'Utility bill  (Not more than 3 months old)',
            onUpload: () => uploadFile('UTILITY_BILL'),
            fileName: docs.utility.file?.name,
            fileUri: docs.utility.file?.uri,
            fileType: docs.utility.file?.type,
            required: true,
            associatedInputs: (
                <View>
                    <ControlledInput
                        control={control}
                        name="utilityNumber"
                        label="Utility Bill"
                        required
                        placeholder="Enter Utility number"
                    />
                </View>
            ),
        },
    ];

    const handleNext = async () => {
        if (isUploading) {
            showToast('Please wait for files to finish uploading', 'warning');
            return;
        }

        let isStepValid = false;

        if (currentStep === 0) {
            isStepValid = await trigger(['bvn', 'nin', 'passportNumber']);
        } else if (currentStep === 1) {
            if (!docs.passport.file || !docs.utility.file) {
                showToast('Please upload all required documents', 'error');
                return;
            }
            isStepValid = await trigger(['passportIssueDate', 'passportExpiryDate', 'utilityNumber']);
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

    const onSubmit = (data: ResidentFormValues) => {
        const formatDateForApi = (dateStr: string): string => {
            if (!dateStr) return '';
            const parts = dateStr.split('/');
            if (parts.length === 3) {
                return `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
            return dateStr;
        };

        const payload = {
            type: 'RESIDENT_FX',
            currency: currencyGet.code,
            amount: data.amount,
            purpose: 'I have FX and want Naira',
            destinationCountry: currencyGet.country,
            bvn: data.bvn,
            nin: data.nin,
            passportNumber: data.passportNumber,
            passportIssueDate: data.passportIssueDate,
            passportExpiryDate: data.passportExpiryDate,
            documents: [
                ...(docs.passport.meta ? [docs.passport.meta] : []),
                ...(docs.utility.meta ? [docs.utility.meta] : []),
            ],
            pickupLocation: data.selectedLocation ? {
                name: data.selectedLocation.title,
                address: data.selectedLocation.subtitle || '',
                state: data.selectedState?.title || '',
                city: data.selectedCity?.title || '',
                scheduledPickupDate: formatDateForApi(data.pickupDate),
                scheduledPickupTime: data.pickupTime,
            } : undefined,
        };

        createTransaction.mutate(payload, {
            onSuccess: (response) => {
                if (response.success) {
                    setInitiateSheetVisible(false);
                    router.push({
                        pathname: '/(sell-fx)/(resident)/success',
                        params: {
                            transactionId: response.data.transactionId,
                        },
                    });
                }
            },
        });
    };

    const selectedState = watch('selectedState');
    const selectedCity = watch('selectedCity');
    const selectedLocation = watch('selectedLocation');
    const pickupDate = watch('pickupDate');
    const pickupTime = watch('pickupTime');

    return (
        <>
            <LoadingBackdrop visible={isUploading || createTransaction.isPending} />
            <TransactionLayout
                title="Resident"
                currentStep={currentStep}
                totalSteps={4}
                onBack={handleBack}
                onNext={handleNext}
                nextLabel={currentStep === 3 ? "Initiate Transaction Request" : "Continue"}
            >
                {currentStep === 0 && (
                    <CredentialStep fields={credentialFields} title="Enter Tax Identification Number (TIN)" />
                )}

                {currentStep === 1 && (
                    <DocumentStep documents={documentFields} title="Upload Relevant Documents" />
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
                        rate={`1 ${currencyGet.code} = ${currentRate.toLocaleString()} ${currencySend.code}`}
                        onAmountGetChange={setAmountGet}
                        onAmountSendChange={setAmountSend}
                        allowedModes={['sell']}
                        error={errors.amount?.message as string | undefined}
                    />
                )}

                {currentStep === 3 && (
                    <LocationStep
                        states={STATES}
                        cities={CITIES}
                        locations={LOCATIONS}
                        selectedState={selectedState}
                        onSelectState={(item) => {
                            setValue('selectedState', item);
                            setValue('selectedCity', undefined as unknown as LocationItem);
                            setValue('selectedLocation', undefined as unknown as LocationItem);
                        }}
                        selectedCity={selectedCity}
                        onSelectCity={(item) => {
                            setValue('selectedCity', item);
                            setValue('selectedLocation', undefined as unknown as LocationItem);
                        }}
                        selectedLocation={selectedLocation}
                        onSelectLocation={(item) => setValue('selectedLocation', item)}
                        title="Select Pick Up Point"
                        pickupDate={pickupDate}
                        onPickupDateChange={(v) => setValue('pickupDate', v)}
                        pickupTime={pickupTime}
                        onPickupTimeChange={(v) => setValue('pickupTime', v)}
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
                    title="Initiate Resident Transaction request?"
                    loading={createTransaction.isPending}
                    items={[
                        {
                            title: "Verification before approval",
                            description: "You must upload your residency application letter, immigration invoice, and identification documents for verification.",
                            iconType: 'verify'
                        }
                    ]}
                />
            </TransactionLayout>
        </>
    );
}
