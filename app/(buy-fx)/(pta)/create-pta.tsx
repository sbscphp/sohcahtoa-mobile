import ControlledDatePicker from '@/components/ControlledDatePicker';
import ControlledInput from '@/components/ControlledInput';
import InitiateTransactionSheet from '@/components/InitiateTransactionSheet';
import LoadingBackdrop from '@/components/LoadingBackdrop';
import CredentialStep from '@/components/transaction-flow/CredentialStep';
import DocumentStep from '@/components/transaction-flow/DocumentStep';
import ExchangeStep from '@/components/transaction-flow/ExchangeStep';
import LocationStep from '@/components/transaction-flow/LocationStep';
import GenericSelectionSheet, { SelectionItem } from '@/components/GenericSelectionSheet';
import TransactionLayout from '@/components/transaction-flow/TransactionLayout';
import { useCreateTransactionMutation } from '@/hooks/queries/transactions/useCreateTransactionMutation';
import { useProfileQuery } from '@/hooks/queries/auth/useProfileQuery';
import { useGetPickupPointsQuery } from '@/hooks/queries/transactions/useGetPickupPointsQuery';
import { useGetPickupStatesQuery } from '@/hooks/queries/transactions/useGetPickupStatesQuery';
import { useGetPickupCitiesQuery } from '@/hooks/queries/transactions/useGetPickupCitiesQuery';
import { useGetBanksQuery } from '@/hooks/queries/banks/useGetBanksQuery';
import { useResolveAccountMutation } from '@/hooks/queries/banks/useResolveAccountMutation';
import { UploadedFile, UploadedMetadata, useDocumentUpload } from '@/hooks/useDocumentUpload';
import { useExchangeLogic } from '@/hooks/useExchangeLogic';
import { useToastStore } from '@/stores/useToastStore';
import { LocationItem } from '@/utils/locations';
import { useAuthStore } from '@/stores/useAuthStore';
import { ptaStep0Schema, ptaStep1Schema, ptaStep2Schema, ptaStep3Schema } from '@/utils/validations/pta';
import { customerBankDetailsStepSchema } from '@/utils/validations/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { View, TouchableOpacity, Text } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { z } from 'zod';
import { ArrowDown2, Bank } from 'iconsax-react-nativejs';
import { Ionicons } from '@expo/vector-icons';

const PAYOUT_METHODS: SelectionItem[] = [
    { id: '1', label: 'Electronic Transfer (100%)', value: 'Electronic Transfer (100%)' },
    { id: '2', label: 'Card (100%)', value: 'Card (100%)' },
    { id: '3', label: 'Card (75%) + Cash (25%)', value: 'Card (75%) + Cash (25%)' },
];

const SAVED_ACCOUNTS = [
    { id: '1', bankName: 'Sterling Bank', accountNumber: '1234567890', accountName: 'ADEOLA ODEKU.', bankCode: '057' },
    { id: '2', bankName: 'Wema Bank', accountNumber: '4567890087', accountName: 'FEMI OLADELE', bankCode: '035' },
    { id: '3', bankName: 'Surulere Local Government', accountNumber: '96436076435', accountName: 'BOLA AWOYEMI', bankCode: '090110' }
];

const ptaFormSchema = z.object({
    ...ptaStep0Schema.shape,
    ...ptaStep1Schema.shape,
    ...ptaStep2Schema.shape,
    payoutMethod: z.string().min(1, 'Please select a payout method'),
    ...customerBankDetailsStepSchema.shape,
    ...ptaStep3Schema.shape
});

type PtaFormValues = z.infer<typeof ptaFormSchema>;

export default function PersonalTravelAllowanceScreen() {
    const router = useRouter();
    const createTransaction = useCreateTransactionMutation();
    const showToast = useToastStore(s => s.showToast);
    useProfileQuery();
    const user = useAuthStore(s => s.user);

    const [currentStep, setCurrentStep] = useState(0);
    const [initiateSheetVisible, setInitiateSheetVisible] = useState(false);
    const [payoutSheetVisible, setPayoutSheetVisible] = useState(false);
    const [selectedSavedAccountId, setSelectedSavedAccountId] = useState<string | null>('2');
    const [savedAccounts, setSavedAccounts] = useState(SAVED_ACCOUNTS);
    const [isAddingNewAccount, setIsAddingNewAccount] = useState(false);
    const [newBankSheetVisible, setNewBankSheetVisible] = useState(false);

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
            ticketNumber: '',
            passportIssueDate: '',
            passportExpiryDate: '',
            amount: 0,
            selectedState: undefined as unknown as LocationItem,
            selectedCity: undefined as unknown as LocationItem,
            selectedLocation: undefined as unknown as LocationItem,
            pickupDate: '',
            pickupTime: '',
            payoutMethod: 'Electronic Transfer (100%)',
            customerBankName: 'Wema Bank',
            customerBankCode: '035',
            customerAccountNumber: '4567890087',
            customerAccountName: 'FEMI OLADELE',
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

    // Banks and Account Resolution
    const { data: banksResponse } = useGetBanksQuery();
    const banks = useMemo(() => 
        (banksResponse?.data || []).map(b => ({ id: b.id, label: b.name, value: b.code })),
    [banksResponse]);

    const resolveAccount = useResolveAccountMutation();

    React.useEffect(() => {
        if (watchedFields.customerAccountNumber?.length === 10 && watchedFields.customerBankCode) {
            resolveAccount.mutate({
                accountNumber: watchedFields.customerAccountNumber,
                bankCode: watchedFields.customerBankCode
            }, {
                onSuccess: (res) => {
                    if (res.success) {
                        setValue('customerAccountName', res.data.accountName);
                    }
                },
                onError: () => {
                    setValue('customerAccountName', '');
                    showToast('Could not resolve account name', 'error');
                }
            });
        }
    }, [watchedFields.customerAccountNumber, watchedFields.customerBankCode]);

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
                    <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                        <View style={{ flex: 1 }}>
                            <ControlledDatePicker control={control} name="passportIssueDate" label="Passport Issue Date" required maximumDate={new Date()} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <ControlledDatePicker control={control} name="passportExpiryDate" label="Passport Expiry Date" required minimumDate={new Date()} />
                        </View>
                    </View>
                </View>
            )
        }
    ];

    const handleSaveNewAccount = async () => {
        const isValid = await trigger([
            'customerBankName',
            'customerBankCode',
            'customerAccountNumber',
            'customerAccountName'
        ]);

        if (isValid) {
            const newAcc = {
                id: Date.now().toString(),
                bankName: watchedFields.customerBankName,
                accountNumber: watchedFields.customerAccountNumber,
                accountName: watchedFields.customerAccountName,
                bankCode: watchedFields.customerBankCode
            };
            setSavedAccounts(prev => [...prev, newAcc]);
            setSelectedSavedAccountId(newAcc.id);
            setIsAddingNewAccount(false);
        }
    };

    const handleNext = async () => {
        const stepSchemas = [
            ptaStep0Schema, 
            ptaStep1Schema, 
            ptaStep2Schema, 
            z.object({ payoutMethod: z.string().min(1) }),
            ptaStep3Schema
        ];
        
        let isValid = false;
        if (currentStep === 3) {
            if (isAddingNewAccount) {
                return;
            }
            isValid = await trigger([
                'payoutMethod',
                'customerBankName',
                'customerBankCode',
                'customerAccountNumber',
                'customerAccountName'
            ]);
        } else {
            isValid = await trigger(Object.keys(stepSchemas[currentStep].shape) as any);
        }

        if (isValid) {
            if (currentStep < 4) {
                setCurrentStep(prev => prev + 1);
            } else {
                setInitiateSheetVisible(true);
            }
        }
    };

    const handleBack = () => {
        if (isAddingNewAccount) {
            setIsAddingNewAccount(false);
            return;
        }
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
            passportIssueDate: data.passportIssueDate,
            passportExpiryDate: data.passportExpiryDate,
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
            },
            payoutMethod: data.payoutMethod,
            customerBankDetails: {
                bankName: data.customerBankName,
                bankCode: data.customerBankCode,
                accountNumber: data.customerAccountNumber,
                accountName: data.customerAccountName,
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
                totalSteps={5}
                onBack={handleBack}
                onNext={isAddingNewAccount ? handleSaveNewAccount : handleNext}
                isNextDisabled={isNextDisabled}
                nextLabel={isAddingNewAccount ? "Save" : (currentStep === 4 ? (watchedFields.selectedState && watchedFields.selectedCity ? "Initiate Transaction Request" : "Continue") : "Continue")}
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
                {currentStep === 3 && !isAddingNewAccount && (
                    <View style={{ gap: moderateScale(14) }}>
                        <Text style={{ fontSize: moderateScale(16), fontWeight: '700', color: '#0F172A', marginBottom: moderateScale(4) }}>Choose your payout method</Text>
                        <TouchableOpacity onPress={() => setPayoutSheetVisible(true)} activeOpacity={0.8}>
                            <View pointerEvents="none">
                                <ControlledInput
                                    control={control}
                                    name="payoutMethod"
                                    label="Payout Method"
                                    placeholder="Select an Option"
                                    required
                                    rightIcon={ArrowDown2}
                                    editable={false}
                                />
                            </View>
                        </TouchableOpacity>

                        {/* Saved Accounts List */}
                        <View style={{ marginTop: moderateScale(8), gap: moderateScale(12) }}>
                            {savedAccounts.map((account) => {
                                const isSelected = selectedSavedAccountId === account.id;
                                return (
                                    <TouchableOpacity
                                        key={account.id}
                                        activeOpacity={0.9}
                                        onPress={() => {
                                            setSelectedSavedAccountId(account.id);
                                            setValue('customerBankName', account.bankName);
                                            setValue('customerBankCode', account.bankCode);
                                            setValue('customerAccountNumber', account.accountNumber);
                                            setValue('customerAccountName', account.accountName);
                                        }}
                                        style={{
                                            borderWidth: isSelected ? 1.5 : 1,
                                            borderColor: isSelected ? '#FF6B2C' : '#E2E8F0',
                                            backgroundColor: isSelected ? '#FFF7ED' : '#FFFFFF',
                                            borderRadius: moderateScale(12),
                                            paddingVertical: moderateScale(16),
                                            paddingHorizontal: moderateScale(16),
                                            shadowColor: isSelected ? '#FF6B2C' : 'transparent',
                                            shadowOffset: { width: 0, height: 1 },
                                            shadowOpacity: isSelected ? 0.1 : 0,
                                            shadowRadius: 2,
                                        }}
                                    >
                                        <Text style={{
                                            fontSize: moderateScale(14),
                                            fontWeight: '700',
                                            color: '#0F172A',
                                            marginBottom: moderateScale(4)
                                        }}>
                                            {account.bankName}
                                        </Text>
                                        <Text style={{
                                            fontSize: moderateScale(13),
                                            color: '#64748B',
                                            fontWeight: '500'
                                        }}>
                                            {account.accountNumber} <Text style={{ color: '#E2E8F0' }}>|</Text> {account.accountName}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* + New Account Button */}
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => {
                                setSelectedSavedAccountId(null);
                                setValue('customerBankName', '');
                                setValue('customerBankCode', '');
                                setValue('customerAccountNumber', '');
                                setValue('customerAccountName', '');
                                setIsAddingNewAccount(true);
                            }}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                alignSelf: 'flex-end',
                                marginTop: moderateScale(4),
                                paddingHorizontal: moderateScale(4),
                                paddingVertical: moderateScale(8)
                            }}
                        >
                            <Ionicons name="add" size={moderateScale(18)} color="#FF6B2C" style={{ marginRight: moderateScale(4) }} />
                            <Text style={{
                                fontSize: moderateScale(14),
                                fontWeight: '600',
                                color: '#FF6B2C'
                            }}>
                                New Account
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {currentStep === 3 && isAddingNewAccount && (
                    <View style={{ gap: moderateScale(16) }}>
                        <Text style={{ fontSize: moderateScale(18), fontWeight: '700', color: '#0F172A', marginBottom: moderateScale(8) }}>Add New Bank Account</Text>
                        
                        <TouchableOpacity onPress={() => setNewBankSheetVisible(true)} activeOpacity={0.8}>
                            <View pointerEvents="none">
                                <ControlledInput
                                    control={control}
                                    name="customerBankName"
                                    label="Bank Name"
                                    placeholder="Select Bank Name"
                                    required
                                    rightIcon={ArrowDown2}
                                    editable={false}
                                />
                            </View>
                        </TouchableOpacity>

                        <ControlledInput
                            control={control}
                            name="customerAccountName"
                            label="Account Name"
                            placeholder="Enter account name"
                            required
                        />

                        <ControlledInput
                            control={control}
                            name="customerAccountNumber"
                            label="Account Number"
                            placeholder="Enter account number"
                            required
                            keyboardType="numeric"
                            maxLength={10}
                        />

                        {resolveAccount.isPending && (
                            <Text style={{ fontSize: moderateScale(12), color: '#F97316', fontStyle: 'italic', marginTop: moderateScale(-8) }}>
                                Resolving account name...
                            </Text>
                        )}
                    </View>
                )}

                {currentStep === 4 && (
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
                        errors={{
                            state: errors.selectedState?.message as string | undefined,
                            city: errors.selectedCity?.message as string | undefined,
                            location: errors.selectedLocation?.message as string | undefined,
                            pickupDate: errors.pickupDate?.message as string | undefined,
                            pickupTime: errors.pickupTime?.message as string | undefined
                        }}
                    />
                )}
            </TransactionLayout>

            <InitiateTransactionSheet
                visible={initiateSheetVisible}
                onClose={() => setInitiateSheetVisible(false)}
                onConfirm={handleSubmit(handleInitiate)}
                loading={createTransaction.isPending}
            />

            <GenericSelectionSheet
                visible={payoutSheetVisible}
                onClose={() => setPayoutSheetVisible(false)}
                title="Choose a Payout Method"
                subtitle="Select an option below"
                items={PAYOUT_METHODS}
                selectedItem={watchedFields.payoutMethod}
                onSelect={(item) => {
                    setValue('payoutMethod', item.value);
                    setPayoutSheetVisible(false);
                }}
                confirmButtonText="Select a Payout Method"
            />

            <GenericSelectionSheet
                visible={newBankSheetVisible}
                onClose={() => setNewBankSheetVisible(false)}
                title="Select Bank"
                headerIcon={Bank}
                items={banks}
                selectedItem={watchedFields.customerBankCode}
                onSelect={(item) => {
                    setValue('customerBankName', item.label);
                    setValue('customerBankCode', item.value);
                    setNewBankSheetVisible(false);
                }}
                confirmButtonText="Select Bank"
            />
        </View>
    );
}
