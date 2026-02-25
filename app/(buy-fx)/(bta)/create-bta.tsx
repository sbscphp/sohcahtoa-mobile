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
import { useToastStore } from '@/stores/useToastStore';
import { CITIES, LOCATIONS, STATES } from '@/utils/locations';
import { btaStep0Schema, btaStep1Schema, btaStep2Schema, btaStep3Schema } from '@/utils/validations/bta';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import { z } from 'zod';

const btaFormSchema = z.object({
    ...btaStep0Schema.shape,
    ...btaStep1Schema.shape,
    ...btaStep2Schema.shape,
    ...btaStep3Schema.shape
});

type BtaFormValues = z.infer<typeof btaFormSchema>;

export default function BusinessTravelAllowanceScreen() {
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
    } = useForm<BtaFormValues>({
        resolver: zodResolver(btaFormSchema),
        defaultValues: {
            bvn: '',
            nin: '',
            formAId: '',
            tin: '',
            passportNumber: '',
            passportIssueDate: '',
            passportExpiryDate: '',
            tccNumber: '',
            amount: 1,
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

    // We manually track amount string since exchange step does lots of formatting
    const [amountGetStr, setAmountGetStr] = useState('1');
    const [amountSendStr, setAmountSendStr] = useState('1,500');

    const handleAmountChange = (val: string) => {
        setAmountGetStr(val);
        setValue('amount', parseFloat(val.replace(/,/g, '')) || 0);
    };

    // Document upload files state
    const [docs, setDocs] = useState({
        tcc: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
        passport: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
        tin: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
        visa: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
        returnTicket: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
        corporateBodyLetter: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
        partnerInvitationLetter: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
    });

    const updateDoc = (key: keyof typeof docs, file: UploadedFile, metadata: UploadedMetadata) => {
        setDocs(prev => ({ ...prev, [key]: { file, meta: metadata } }));
    };

    const { upload: uploadFile, isPending: isUploading } = useDocumentUpload({
        onSuccess: (documentType, { file, metadata }) => {
            if (documentType === 'TCC') updateDoc('tcc', file, metadata);
            else if (documentType === 'PASSPORT') updateDoc('passport', file, metadata);
            else if (documentType === 'TIN') updateDoc('tin', file, metadata);
            else if (documentType === 'VISA') updateDoc('visa', file, metadata);
            else if (documentType === 'RETURN_TICKET') updateDoc('returnTicket', file, metadata);
            else if (documentType === 'CORPORATE_BODY_LETTER') updateDoc('corporateBodyLetter', file, metadata);
            else if (documentType === 'PARTNER_INVITATION_LETTER') updateDoc('partnerInvitationLetter', file, metadata);
        },
        onError: () => showToast('Failed to upload document. Please try again.', 'error'),
    });

    const credentialFields = [
        { customComponent: <ControlledInput control={control} name="bvn" label="Bank Verification Number(BVN)" placeholder="Enter your BVN" required keyboardType="numeric" /> },
        { customComponent: <ControlledInput control={control} name="tin" label="Tax Identification Number(TIN)" placeholder="Enter your TIN" required keyboardType="numeric" /> },
        { customComponent: <ControlledInput control={control} name="nin" label="National Identification Number(NIN)" placeholder="Enter your NIN" required keyboardType="numeric" /> },
        { customComponent: <ControlledInput control={control} name="formAId" label="Form A ID" placeholder="Enter Form A ID" required /> },
        { customComponent: <ControlledInput control={control} name="passportNumber" label="International Passport Number" placeholder="Enter international passport" required /> }
    ];

    const documentFields = [
        {
            label: 'Tax Clearance Certificate (TCC)',
            onUpload: () => uploadFile('TCC'),
            fileName: docs.tcc.file?.name,
            fileUri: docs.tcc.file?.uri,
            fileType: docs.tcc.file?.type,
            required: true,
            associatedInputs: (
                <View>
                    <ControlledInput control={control} name="tccNumber" label="Tax Clearance Certificate (TCC)" required placeholder="Enter TCC number" keyboardType="numeric" />
                </View>
            )
        },
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
                        <ControlledDatePicker control={control} name="passportIssueDate" label="Passport Issue Date" required maximumDate={new Date()} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <ControlledDatePicker control={control} name="passportExpiryDate" label="Passport Expiry Date" required minimumDate={new Date()} />
                    </View>
                </View>
            )
        },
        {
            label: 'Tax Identification Number (TIN)',
            onUpload: () => uploadFile('TIN'),
            fileName: docs.tin.file?.name,
            fileUri: docs.tin.file?.uri,
            fileType: docs.tin.file?.type,
            required: true,
        },
        {
            label: 'Valid Visa',
            onUpload: () => uploadFile('VISA'),
            fileName: docs.visa.file?.name,
            fileUri: docs.visa.file?.uri,
            fileType: docs.visa.file?.type,
            required: true,
            associatedInputs: (
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <ControlledInput control={control} name="visaNumber" label="Visa Number" required placeholder="Enter visa number" keyboardType="numeric" />
                </View>
            )
        },
        {
            label: 'Return Ticket',
            onUpload: () => uploadFile('RETURN_TICKET'),
            fileName: docs.returnTicket.file?.name,
            fileUri: docs.returnTicket.file?.uri,
            fileType: docs.returnTicket.file?.type,
            required: true,
        },
        {
            label: 'Letter of Request from Corporate Body',
            onUpload: () => uploadFile('CORPORATE_BODY_LETTER'),
            fileName: docs.corporateBodyLetter.file?.name,
            fileUri: docs.corporateBodyLetter.file?.uri,
            fileType: docs.corporateBodyLetter.file?.type,
            required: true,
        },
        {
            label: 'Letter of Invitation from Partner',
            onUpload: () => uploadFile('PARTNER_INVITATION_LETTER'),
            fileName: docs.partnerInvitationLetter.file?.name,
            fileUri: docs.partnerInvitationLetter.file?.uri,
            fileType: docs.partnerInvitationLetter.file?.type,
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
            isStepValid = await trigger(['bvn', 'tin', 'nin', 'formAId', 'passportNumber']);
        } else if (currentStep === 1) {
            isStepValid = await trigger(['tccNumber', 'passportIssueDate', 'passportExpiryDate']);
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

    const onSubmit = (data: BtaFormValues) => {
        const payload = {
            type: 'BTA',
            currency: currencyGet.code,
            amount: data.amount,
            purpose: 'Business Travel Allowance (BTA)',
            destinationCountry: currencyGet.country,
            bvn: data.bvn,
            nin: data.nin,
            formAId: data.formAId,
            documents: [
                ...(docs.tcc.meta ? [docs.tcc.meta] : []),
                ...(docs.passport.meta ? [docs.passport.meta] : []),
                ...(docs.tin.meta ? [docs.tin.meta] : []),
                ...(docs.visa.meta ? [docs.visa.meta] : []),
                ...(docs.returnTicket.meta ? [docs.returnTicket.meta] : []),
                ...(docs.corporateBodyLetter.meta ? [docs.corporateBodyLetter.meta] : []),
                ...(docs.partnerInvitationLetter.meta ? [docs.partnerInvitationLetter.meta] : []),
            ],
            pickupLocation: data.selectedLocation ? {
                name: data.selectedLocation.title,
                address: data.selectedLocation.subtitle || '',
            } : undefined,
        };

        createTransaction.mutate(payload, {
            onSuccess: (response) => {
                if (response.success) {
                    setInitiateSheetVisible(false);
                    router.push({
                        pathname: '/(buy-fx)/(bta)/request-initiated-success',
                        params: { transactionId: response.data?.transactionId }
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
                title="Business Travel Allowance"
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
                        rate={`1 ${currencyGet.code} = 1500 ${currencySend.code}`}
                        onAmountGetChange={handleAmountChange}
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
                    loading={createTransaction.isPending}
                    onClose={() => setInitiateSheetVisible(false)}
                    onConfirm={handleSubmit(onSubmit)}
                    title="Initiate BTA Transaction request?"
                    items={[
                        {
                            title: "Verification before approval",
                            description: "You will be able to process your BTA once your documents are verified and approved.",
                            iconType: 'verify'
                        },
                        {
                            title: "Maximum of $5,000 per quarter",
                            description: "The maximum you can transact under BTA is $5,000 per quarter for each eligible business traveler.",
                            iconType: 'limit'
                        }
                    ]}
                />
            </TransactionLayout>
        </>
    );
}
