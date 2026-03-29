import ControlledDatePicker from '@/components/ControlledDatePicker';
import ControlledInput from '@/components/ControlledInput';
import FileUpload from '@/components/FileUpload';
import InitiateTransactionSheet from '@/components/InitiateTransactionSheet';
import LoadingBackdrop from '@/components/LoadingBackdrop';
import { LocationItem } from '@/utils/locations';
import ExchangeStep from '@/components/transaction-flow/ExchangeStep';
import LocationStep from '@/components/transaction-flow/LocationStep';
import TransactionLayout from '@/components/transaction-flow/TransactionLayout';
import { useCreateTransactionMutation } from '@/hooks/queries/transactions/useCreateTransactionMutation';
import { UploadedFile, UploadedMetadata, useDocumentUpload } from '@/hooks/useDocumentUpload';
import { useExchangeLogic } from '@/hooks/useExchangeLogic';
import { useToastStore } from '@/stores/useToastStore';
import {
    expatriateStep0Schema,
    expatriateStep1Schema,
    expatriateStep2Schema,
    expatriateStep3Schema,
} from '@/utils/validations/expatriate';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Text, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import { z } from 'zod';

import { useGetPickupStatesQuery } from '@/hooks/queries/transactions/useGetPickupStatesQuery';
import { useGetPickupPointsQuery } from '@/hooks/queries/transactions/useGetPickupPointsQuery';

const expatriateFormSchema = z.object({
    ...expatriateStep0Schema.shape,
    ...expatriateStep1Schema.shape,
    ...expatriateStep2Schema.shape,
    ...expatriateStep3Schema.shape
});

type ExpatriateFormValues = z.infer<typeof expatriateFormSchema>;

export default function CreateExpatriateScreen() {
    const router = useRouter();
    const createTransaction = useCreateTransactionMutation();

    // Dynamic Locations
    const { data: states = [] } = useGetPickupStatesQuery();
    const { data: allLocations = [] } = useGetPickupPointsQuery();

    const [currentStep, setCurrentStep] = useState(0);

    const {
        control,
        handleSubmit,
        trigger,
        watch,
        setValue,
        formState: { errors }
    } = useForm<ExpatriateFormValues>({
        resolver: zodResolver(expatriateFormSchema),
        defaultValues: {
            bvn: '',
            nin: '',
            passportNumber: '',
            workPermitNumber: '',
            passportIssueDate: '',
            passportExpiryDate: '',
            utilityBillNumber: '',
            amount: 0,
            selectedState: undefined as unknown as LocationItem,
            selectedCity: undefined as unknown as LocationItem,
            selectedLocation: undefined as unknown as LocationItem,
            pickupDate: '',
            pickupTime: '',
        },
        mode: 'onChange'
    });

    const watchedFields = watch() as any;

    const filteredCities = useMemo(() => {
        if (!watchedFields.selectedState) return [];
        const citiesMap = new Map<string, LocationItem>();
        allLocations.forEach((loc: any) => {
            const point = loc.metadata;
            if (point && point.location) {
                citiesMap.set(point.location, {
                    id: `city-${point.location}`,
                    title: point.location
                });
            }
        });
        return Array.from(citiesMap.values());
    }, [watchedFields.selectedState, allLocations]);

    const filteredLocations = useMemo(() => {
        if (!watchedFields.selectedCity) return [];
        return allLocations.filter((loc: any) => loc.metadata.location === watchedFields.selectedCity.title);
    }, [watchedFields.selectedCity, allLocations]);

    // Step 1: Uploaded files
    const [docs, setDocs] = useState({
        workPermit: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
        passport: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
        utility: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
    });

    const updateDoc = (key: keyof typeof docs, file: UploadedFile, metadata: UploadedMetadata) => {
        setDocs(prev => ({ ...prev, [key]: { file, meta: metadata } }));
    };

    const showToast = useToastStore(s => s.showToast);

    const { upload: uploadFile, isPending: isUploading } = useDocumentUpload({
        onSuccess: (documentType, { file, metadata }) => {
            if (documentType === 'WORK_PERMIT') updateDoc('workPermit', file, metadata);
            else if (documentType === 'PASSPORT') updateDoc('passport', file, metadata);
            else if (documentType === 'UTILITY_BILL') updateDoc('utility', file, metadata);
        },
        onError: () => showToast('Failed to upload document. Please try again.', 'error'),
    });

    // Step 2: Exchange
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

    // Step 3: Pickup
    const [initiateSheetVisible, setInitiateSheetVisible] = useState(false);

    const handleNext = async () => {
        if (isUploading) {
            showToast('Please wait for files to finish uploading', 'warning');
            return;
        }

        let isStepValid = false;

        if (currentStep === 0) {
            isStepValid = await trigger(['bvn', 'nin', 'passportNumber']);
        } else if (currentStep === 1) {
            if (!docs.workPermit.file || !docs.passport.file || !docs.utility.file) {
                showToast('Please upload all required documents', 'error');
                return;
            }
            isStepValid = await trigger(['workPermitNumber', 'passportIssueDate', 'passportExpiryDate', 'utilityBillNumber']);
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

    const onSubmit = (data: ExpatriateFormValues) => {
        const formatDateForApi = (dateStr: string): string => {
            if (!dateStr) return '';
            const parts = dateStr.split('/');
            if (parts.length === 3) {
                return `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
            return dateStr;
        };

        const payload = {
            type: 'EXPATRIATE_FX',
            currency: currencySend.code,
            amount: data.amount,
            purpose: 'I am a foreigner living or working in Nigeria',
            destinationCountry: currencySend.country,
            bvn: data.bvn,
            nin: data.nin,
            passportNumber: data.passportNumber,
            workPermitNumber: data.workPermitNumber,
            passportIssueDate: data.passportIssueDate,
            passportExpiryDate: data.passportExpiryDate,
            utilityBillNumber: data.utilityBillNumber,
            documents: [
                ...(docs.workPermit.meta ? [docs.workPermit.meta] : []),
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
            onSuccess: (response: any) => {
                if (response.success) {
                    setInitiateSheetVisible(false);
                    router.push({
                        pathname: '/(sell-fx)/(expatriate)/success',
                        params: {
                            transactionId: response.data.transactionId,
                        },
                    });
                }
            },
        });
    };

    const isStep0Valid = !!(watchedFields.bvn && watchedFields.nin && watchedFields.passportNumber);
    const isStep1Valid = !!(docs.workPermit.meta && docs.passport.meta && docs.utility.meta &&
        watchedFields.workPermitNumber && watchedFields.passportIssueDate && watchedFields.passportExpiryDate && watchedFields.utilityBillNumber);
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
                title="Expatriate"
                currentStep={currentStep}
                totalSteps={4}
                onBack={handleBack}
                onNext={handleNext}
                isNextDisabled={isNextDisabled}
                nextLabel={currentStep === 3 ? "Initiate Transaction Request" : "Continue"}
            >
                {currentStep === 0 && (
                    <View style={styles.container}>
                        <Text style={styles.sectionTitle}>Enter Tax Identification Number (TIN) and Form "A" ID</Text>

                        <ControlledInput
                            control={control}
                            name="bvn"
                            label="Bank Verification Number (BVN)"
                            placeholder="Enter BVN"
                            required
                            keyboardType="numeric"
                            maxLength={11}
                            filterType="numeric"
                        />

                        <ControlledInput
                            control={control}
                            name="nin"
                            label="National Identification Number (NIN)"
                            placeholder="Enter NIN"
                            required
                            keyboardType="numeric"
                            maxLength={11}
                            filterType="numeric"
                        />

                        <ControlledInput
                            control={control}
                            name="passportNumber"
                            label="International Passport Number"
                            placeholder="Enter international passport number"
                            required
                            maxLength={9}
                            filterType="alphanumeric"
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
                                fileName={docs.workPermit.file?.name ?? null}
                                fileUri={docs.workPermit.file?.uri ?? null} fileUrl={docs.workPermit.meta?.fileUrl ?? null}
                                fileType={docs.workPermit.file?.type ?? null}
                            />
                            <ControlledInput
                                control={control}
                                name="workPermitNumber"
                                label="Work Permit Number"
                                placeholder="Enter work permit number"
                                required
                            />
                        </View>

                        {/* International Passport */}
                        <View style={styles.documentSection}>
                            <Text style={styles.documentLabel}>
                                International Passport <Text style={styles.required}>*</Text>
                            </Text>
                            <FileUpload
                                onUpload={() => uploadFile('PASSPORT')}
                                fileName={docs.passport.file?.name ?? null}
                                fileUri={docs.passport.file?.uri ?? null} fileUrl={docs.passport.meta?.fileUrl ?? null}
                                fileType={docs.passport.file?.type ?? null}
                            />
                            <View style={{ flexDirection: 'row', gap: moderateScale(12) }}>
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
                        </View>

                        {/* Utility Bill */}
                        <View style={styles.documentSection}>
                            <Text style={styles.documentLabel}>
                                Utility Bill <Text style={styles.required}>*</Text>
                            </Text>
                            <FileUpload
                                onUpload={() => uploadFile('UTILITY_BILL')}
                                fileName={docs.utility.file?.name ?? null}
                                fileUri={docs.utility.file?.uri ?? null} fileUrl={docs.utility.meta?.fileUrl ?? null}
                                fileType={docs.utility.file?.type ?? null}
                            />
                            <ControlledInput
                                control={control}
                                name="utilityBillNumber"
                                label="Utility Bill Number"
                                placeholder="Enter utility bill number"
                                required
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
                        rate={`1 ${currencySend.code} = ${currentRate.toLocaleString()} ${currencyGet.code}`}
                        onAmountGetChange={setAmountGet}
                        onAmountSendChange={setAmountSend}
                        allowedModes={['sell']}
                        error={errors.amount?.message as string | undefined}
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
                    title="Initiate Expatriate Transaction request?"
                    loading={createTransaction.isPending}
                    items={[
                        {
                            title: "Verification before approval",
                            description: "Work permit documents, employer letter, and passport details must be verified before your request can be processed.",
                            iconType: 'verify'
                        }
                    ]}
                />
            </TransactionLayout>
        </View>
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
