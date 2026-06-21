
import ControlledDatePicker from '@/components/ControlledDatePicker';
import ControlledInput from '@/components/ControlledInput';
import InitiateTransactionSheet from '@/components/InitiateTransactionSheet';
import LoadingBackdrop from '@/components/LoadingBackdrop';
import SourceOfFundsSheet from '@/components/SourceOfFundsSheet';
import CredentialStep from '@/components/transaction-flow/CredentialStep';
import DocumentStep from '@/components/transaction-flow/DocumentStep';
import ExchangeStep from '@/components/transaction-flow/ExchangeStep';
import LocationStep from '@/components/transaction-flow/LocationStep';
import TransactionLayout from '@/components/transaction-flow/TransactionLayout';
import { useProfileQuery } from '@/hooks/queries/auth/useProfileQuery';
import { useCreateTransactionMutation } from '@/hooks/queries/transactions/useCreateTransactionMutation';
import { UploadedFile, UploadedMetadata, useDocumentUpload } from '@/hooks/useDocumentUpload';
import { useExchangeLogic } from '@/hooks/useExchangeLogic';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToastStore } from '@/stores/useToastStore';
import { LocationItem } from '@/utils/locations';
import {
    touristStep0Schema,
    touristStep1Schema,
    touristStep2Schema,
    touristStep3LocationSchema,
} from '@/utils/validations/tourist';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import { z } from 'zod';

import { useGetPickupCitiesQuery } from '@/hooks/queries/transactions/useGetPickupCitiesQuery';
import { useGetPickupPointsQuery } from '@/hooks/queries/transactions/useGetPickupPointsQuery';
import { useGetPickupStatesQuery } from '@/hooks/queries/transactions/useGetPickupStatesQuery';

const touristFormSchema = z.object({
    ...touristStep0Schema.shape,
    ...touristStep1Schema.shape,
    ...touristStep2Schema.shape,
    ...touristStep3LocationSchema.shape,
}).superRefine((data, ctx) => {
    if (data.passportIssueDate && data.passportExpiryDate && data.passportIssueDate === data.passportExpiryDate) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Passport Expiry Date cannot be the same as Passport Issue Date',
            path: ['passportExpiryDate']
        });
    }
});

type TouristFormValues = z.infer<typeof touristFormSchema>;


export default function CreateTouristScreen() {
    const router = useRouter();
    const createTransaction = useCreateTransactionMutation();
    useProfileQuery();
    const user = useAuthStore(s => s.user);
    const [currentStep, setCurrentStep] = useState(0);

    const {
        control,
        handleSubmit,
        trigger,
        watch,
        setValue,
        formState: { errors }
    } = useForm<TouristFormValues>({
        resolver: zodResolver(touristFormSchema),
        defaultValues: {
            passportDocumentNumber: '',
            passportIssueDate: '',
            passportExpiryDate: '',
            amount: 0,
            selectedState: undefined as unknown as LocationItem,
            selectedCity: undefined as unknown as LocationItem,
            selectedLocation: undefined as unknown as LocationItem,
            pickupDate: '',
            pickupTime: '',
        },
        mode: 'onChange'
    });

    // Step 1: Uploaded files
    const [docs, setDocs] = useState({
        passport: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
        visa: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
        ticket: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
        receipt: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
        signature: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
    });

    const updateDoc = (key: keyof typeof docs, file: UploadedFile, metadata: UploadedMetadata) => {
        setDocs(prev => ({ ...prev, [key]: { file, meta: metadata } }));
    };

    const showToast = useToastStore(s => s.showToast);

    const { upload: uploadFile, isPending: isUploading } = useDocumentUpload({
        onSuccess: (documentType, { file, metadata }) => {
            if (documentType === 'PASSPORT') updateDoc('passport', file, metadata);
            else if (documentType === 'VISA') updateDoc('visa', file, metadata);
            else if (documentType === 'RETURN_TICKET') updateDoc('ticket', file, metadata);
            else if (documentType === 'RECEIPT') updateDoc('receipt', file, metadata);
            else if (documentType === 'DIGITAL_SIGNATURE') updateDoc('signature', file, metadata);
        },
        onError: () => showToast('Failed to upload document. Please try again.', 'error'),
    });

    // Step 2: Exchange State
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
    } = useExchangeLogic({ setValue, initialAmount: '', initialTransactionType: 'sell' });

    // Dynamic Locations
    const { data: states = [] } = useGetPickupStatesQuery();
    const { data: allLocations = [] } = useGetPickupPointsQuery();

    const watchedFields = watch() as any;

    const { data: filteredCities = [] } = useGetPickupCitiesQuery(watchedFields.selectedState?.title);

    const filteredLocations = useMemo(() => {
        if (!watchedFields.selectedCity) return [];
        return allLocations.filter((loc: any) => loc.metadata.city === watchedFields.selectedCity.title);
    }, [watchedFields.selectedCity, allLocations]);

    const [initiateSheetVisible, setInitiateSheetVisible] = useState(false);
    const [showSourceOfFundsSheet, setShowSourceOfFundsSheet] = useState(false);
    const [initials, setInitials] = useState('');

    // Configuration for Step 0
    const credentialFields = [
        {
            customComponent: (
                <ControlledInput
                    control={control}
                    name="passportDocumentNumber"
                    label="International Passport Number"
                    placeholder="Enter international passport number"
                    required
                    maxLength={9}
                    filterType="alphanumeric"
                />
            )
        }
    ];


    const documentFields = [
        {
            label: 'International Passport',
            onUpload: () => uploadFile('PASSPORT'),
            fileName: docs.passport.file?.name,
            fileUri: docs.passport.file?.uri, fileUrl: docs.passport.meta?.fileUrl,
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
            )
        },
        {
            label: 'Valid Visa',
            onUpload: () => uploadFile('VISA'),
            fileName: docs.visa.file?.name,
            fileUri: docs.visa.file?.uri, fileUrl: docs.visa.meta?.fileUrl,
            fileType: docs.visa.file?.type,
            required: true,
        },
        {
            label: 'Return Ticket',
            onUpload: () => uploadFile('RETURN_TICKET'),
            fileName: docs.ticket.file?.name,
            fileUri: docs.ticket.file?.uri, fileUrl: docs.ticket.meta?.fileUrl,
            fileType: docs.ticket.file?.type,
            required: true,
        },
        {
            label: 'Receipt for Initial Naira Purchase',
            onUpload: () => uploadFile('RECEIPT'),
            fileName: docs.receipt.file?.name,
            fileUri: docs.receipt.file?.uri, fileUrl: docs.receipt.meta?.fileUrl,
            fileType: docs.receipt.file?.type,
            required: true,
        },
    ];

    const handleNext = async () => {
        if (isUploading) {
            showToast('Please wait for files to finish uploading', 'warning');
            return;
        }

        let isStepValid = false;

        if (currentStep === 0) {
            isStepValid = await trigger(['passportDocumentNumber']);
        } else if (currentStep === 1) {
            if (!docs.passport.file || !docs.visa.file || !docs.ticket.file || !docs.receipt.file) {
                showToast('Please upload all required documents', 'error');
                return;
            }
            isStepValid = await trigger(['passportIssueDate', 'passportExpiryDate']);
        } else if (currentStep === 2) {
            setValue('amount', parseFloat(amountSend.replace(/,/g, '')) || 0);
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

    const onSubmit = (data: TouristFormValues) => {
        const formatDateForApi = (dateStr: string): string => {
            if (!dateStr) return '';
            const parts = dateStr.split('/');
            if (parts.length === 3) {
                return `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
            return dateStr;
        };

        const payload: any = {
            type: 'TOURIST_FX',
            mode: 'SELL',
            currency: currencySend.code,
            amount: data.amount,
            purpose: 'I am touring Nigeria and want Naira',
            destinationCountry: currencySend.country,
            documents: [
                ...(docs.passport.meta ? [docs.passport.meta] : []),
                ...(docs.visa.meta ? [docs.visa.meta] : []),
                ...(docs.ticket.meta ? [docs.ticket.meta] : []),
                ...(docs.receipt.meta ? [docs.receipt.meta] : []),
            ],
            passportDocumentNumber: data.passportDocumentNumber,
            passportIssueDate: data.passportIssueDate,
            passportExpiryDate: data.passportExpiryDate,
        };

        if (data.selectedLocation) {
            payload.pickupLocation = {
                name: data.selectedLocation.title,
                address: data.selectedLocation.subtitle || '',
                state: data.selectedState?.title || '',
                city: data.selectedCity?.title || '',
                scheduledPickupDate: formatDateForApi(data.pickupDate),
                scheduledPickupTime: data.pickupTime,
            };
        }

        createTransaction.mutate(payload, {
            onSuccess: (response: any) => {
                if (response.success) {
                    setInitiateSheetVisible(false);
                    router.push({
                        pathname: '/(sell-fx)/(tourist)/success',
                        params: {
                            transactionId: response.data.transactionId,
                        },
                    });
                }
            },
        });
    };

    const isStep0Valid = !!watchedFields.passportDocumentNumber;
    const isStep1Valid = !!(docs.passport.meta && docs.visa.meta && docs.ticket.meta && docs.receipt.meta &&
        watchedFields.passportIssueDate && watchedFields.passportExpiryDate);
    const isStep2Valid = watchedFields.amount > 0;

    const isStep3Valid = !!(watchedFields.selectedState && watchedFields.selectedCity && watchedFields.selectedLocation && watchedFields.pickupDate && watchedFields.pickupTime);

    const isNextDisabled =
        (currentStep === 0 && !isStep0Valid) ||
        (currentStep === 1 && !isStep1Valid) ||
        (currentStep === 2 && !isStep2Valid) ||
        (currentStep === 3 && !isStep3Valid);

    return (
        <View style={{ flex: 1 }}>
            <LoadingBackdrop visible={isUploading || createTransaction.isPending} />
            <TransactionLayout
                title={"Tourist"}
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
                        amountGet={amountGet}
                        amountSend={amountSend}
                        rate={`1 ${currencySend.code} = ${currentRate.toLocaleString()} ${currencyGet.code}`}
                        onAmountGetChange={setAmountGet}
                        onAmountSendChange={setAmountSend}
                        allowedModes={['sell']}
                        error={errors.amount?.message as string | undefined}
                        showLimitWarning
                        onLimitWarningPress={() => router.push('/proof-of-fund')}
                        onDownloadPress={() => setShowSourceOfFundsSheet(true)}
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
                        onPickupDateChange={(v: string) => setValue('pickupDate', v)}
                        pickupTime={watchedFields.pickupTime}
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
                    title="Initiate Tourist Transaction request?"
                    loading={createTransaction.isPending}
                    items={[
                        {
                            title: "Request Summary",
                            description: `You are requesting ${currencyGet.code === 'USD' ? '$' : currencyGet.code === 'GBP' ? '£' : currencyGet.code === 'EUR' ? '€' : ''}${amountGet} ${currencyGet.code.toUpperCase()}. You will be sent approximately ₦${amountSend}`,
                            iconType: 'info'
                        }
                    ]}
                />

                <SourceOfFundsSheet
                    visible={showSourceOfFundsSheet}
                    onClose={() => setShowSourceOfFundsSheet(false)}
                    onSubmit={() => {
                        setShowSourceOfFundsSheet(false);

                        // console.log('Source of Funds Declaration Submitted');
                    }}
                    customerInfo={{
                        fullName: `${user?.profile?.firstName || ''} ${user?.profile?.lastName || ''}`,
                        phoneNumber: user?.phoneNumber || '',
                        email: user?.email || '',
                        bvn: user?.kyc?.bvn || '',
                        address: user?.profile?.address || '',
                        passportDocumentNumber: watchedFields.passportDocumentNumber || user?.kyc?.passportDocumentNumber || ''
                    }}
                    transactionDetails={{
                        type: 'Tourist',
                        currency: currencySend.currencyName,
                        amount: `${currencySend.code} ${amountSend}`,
                        purpose: 'Travel'
                    }}
                    onUploadSignature={() => uploadFile('DIGITAL_SIGNATURE')}
                    signatureFile={docs.signature.file?.name}
                    isUploadingSignature={isUploading}
                    initials={initials}
                    onChangeInitials={setInitials}
                />
            </TransactionLayout>
        </View>
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
        color: '#0F172A'
    },
});

