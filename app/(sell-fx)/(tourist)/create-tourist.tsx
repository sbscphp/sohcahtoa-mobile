
import ControlledDatePicker from '@/components/ControlledDatePicker';
import ControlledInput from '@/components/ControlledInput';
import InitiateTransactionSheet from '@/components/InitiateTransactionSheet';
import LoadingBackdrop from '@/components/LoadingBackdrop';
import { LocationItem } from '@/components/LocationSelectionSheet';
import SourceOfFundsSheet from '@/components/SourceOfFundsSheet';
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
    touristStep0Schema,
    touristStep1Schema,
    touristStep2Schema,
    touristStep3LocationSchema,
    touristStep3TransferSchema,
} from '@/utils/validations/tourist';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Pressable, Text, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import { z } from 'zod';

import { CITIES, LOCATIONS, STATES } from '@/utils/locations';

const touristFormSchema = z.object({
    ...touristStep0Schema.shape,
    ...touristStep1Schema.shape,
    ...touristStep2Schema.shape,
    ...touristStep3TransferSchema.shape,
    ...touristStep3LocationSchema.shape,
});

type TouristFormValues = z.infer<typeof touristFormSchema>;


export default function CreateTouristScreen() {
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
    } = useForm<TouristFormValues>({
        resolver: zodResolver(touristFormSchema),
        defaultValues: {
            passportNumber: '',
            passportIssueDate: '',
            passportExpiryDate: '',
            visaNumber: '',
            ticketNumber: '',
            amount: 0,
            accountName: '',
            bankName: '',
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
    } = useExchangeLogic({ setValue, initialAmount: '' });

    // Step 3: Payment Method
    const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'card'>('transfer');

    const [initiateSheetVisible, setInitiateSheetVisible] = useState(false);
    const [showSourceOfFundsSheet, setShowSourceOfFundsSheet] = useState(false);

    // Configuration for Step 0
    const credentialFields = [
        {
            customComponent: (
                <ControlledInput
                    control={control}
                    name="passportNumber"
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
            fileUri: docs.passport.file?.uri,            fileUrl: docs.passport.meta?.fileUrl,
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
            fileUri: docs.visa.file?.uri,            fileUrl: docs.visa.meta?.fileUrl,
            fileType: docs.visa.file?.type,
            required: true,
            associatedInputs: (
                <View>
                    <ControlledInput
                        control={control}
                        name="visaNumber"
                        label="Valid Visa"
                        placeholder="Enter visa number"
                        required
                    />
                </View>
            )
        },
        {
            label: 'Valid Return Ticket',
            onUpload: () => uploadFile('RETURN_TICKET'),
            fileName: docs.ticket.file?.name,
            fileUri: docs.ticket.file?.uri,            fileUrl: docs.ticket.meta?.fileUrl,
            fileType: docs.ticket.file?.type,
            required: true,
            associatedInputs: (
                <View>
                    <ControlledInput
                        control={control}
                        name="ticketNumber"
                        label="Valid Return Ticket"
                        placeholder="Enter ticket number"
                        required
                    />
                </View>
            )
        },
        {
            label: 'Receipt for Initial Naira Purchase',
            onUpload: () => uploadFile('RECEIPT'),
            fileName: docs.receipt.file?.name,
            fileUri: docs.receipt.file?.uri,            fileUrl: docs.receipt.meta?.fileUrl,
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
            isStepValid = await trigger(['passportNumber']);
        } else if (currentStep === 1) {
            if (!docs.passport.file || !docs.visa.file || !docs.ticket.file || !docs.receipt.file) {
                showToast('Please upload all required documents', 'error');
                return;
            }
            isStepValid = await trigger(['passportIssueDate', 'passportExpiryDate', 'visaNumber', 'ticketNumber']);
        } else if (currentStep === 2) {
            setValue('amount', parseFloat(amountSend.replace(/,/g, '')) || 0);
            isStepValid = await trigger(['amount']);
        } else if (currentStep === 3) {
            if (paymentMethod === 'transfer') {
                isStepValid = await trigger(['accountName', 'bankName']);
            } else {
                isStepValid = await trigger(['selectedState', 'selectedCity', 'selectedLocation', 'pickupDate', 'pickupTime']);
            }
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
            identificationNumber: data.passportNumber,
            passportIssueDate: data.passportIssueDate,
            passportExpiryDate: data.passportExpiryDate,
            visaNumber: data.visaNumber,
            ticketNumber: data.ticketNumber,
        };

        if (paymentMethod === 'transfer') {
            payload.beneficiaryDetails = {
                name: data.accountName,
                accountNumber: '',
                accountName: data.accountName,
                bankName: data.bankName,
                iban: '',
            };
        } else {
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
        }

        createTransaction.mutate(payload, {
            onSuccess: (response) => {
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

    const selectedState = watch('selectedState');
    const selectedCity = watch('selectedCity');
    const selectedLocation = watch('selectedLocation');
    const pickupDate = watch('pickupDate');
    const pickupTime = watch('pickupTime');

    return (
        <>
            <LoadingBackdrop visible={isUploading || createTransaction.isPending} />
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
                        rate={`1 ${currencySend.code} = ${currentRate.toLocaleString()} ${currencyGet.code}`}
                        onAmountGetChange={setAmountGet}
                        onAmountSendChange={setAmountSend}
                        allowedModes={['sell']}
                        error={errors.amount?.message as string | undefined}
                        showLimitWarning
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
                                <ControlledInput
                                    control={control}
                                    name="accountName"
                                    label="Account Name"
                                    placeholder="Enter account name"
                                    required
                                />
                                <ControlledInput
                                    control={control}
                                    name="bankName"
                                    label="Bank Name"
                                    placeholder="Enter bank name"
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
                    </View>
                )}

                <InitiateTransactionSheet
                    visible={initiateSheetVisible}
                    onClose={() => setInitiateSheetVisible(false)}
                    onConfirm={handleSubmit(onSubmit)}
                    title="Initiate Tourist Transaction request?"
                    loading={createTransaction.isPending}
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
                        passportNumber: watch('passportNumber') || '102234556777776'
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

