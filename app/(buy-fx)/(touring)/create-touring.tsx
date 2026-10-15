import React, { useState } from 'react';
import { View } from 'react-native';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ControlledInput from '@/components/ControlledInput';
import GenericSelectionSheet from '@/components/GenericSelectionSheet';
import InitiateTransactionSheet from '@/components/InitiateTransactionSheet';
import LoadingBackdrop from '@/components/LoadingBackdrop';
import CredentialStep from '@/components/transaction-flow/CredentialStep';
import DocumentStep from '@/components/transaction-flow/DocumentStep';
import ExchangeStep from '@/components/transaction-flow/ExchangeStep';
import PayoutMethodStep from '@/components/transaction-flow/PayoutMethodStep';
import TransactionLayout from '@/components/transaction-flow/TransactionLayout';
import BuyFxLocationStepSection from '@/components/buy-fx/BuyFxLocationStepSection';
import BuyFxRefundStepSection from '@/components/buy-fx/BuyFxRefundStepSection';
import { useTouringDocuments } from '@/components/buy-fx/touringDocuments';
import { useProfileQuery } from '@/hooks/queries/auth/useProfileQuery';
import { useCreateTransactionMutation } from '@/hooks/queries/transactions/useCreateTransactionMutation';
import { useAttachBankAccountsMutation } from '@/hooks/queries/transactions/useAttachBankAccountsMutation';
import { useExchangeLogic } from '@/hooks/useExchangeLogic';
import { useBuyFxBankAccounts } from '@/hooks/useBuyFxBankAccounts';
import { useBuyFxLocations } from '@/hooks/useBuyFxLocations';
import { usePassportAutofill } from '@/hooks/usePassportAutofill';
import { useSubmitBuyFxTransaction } from '@/hooks/useSubmitBuyFxTransaction';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToastStore } from '@/stores/useToastStore';
import { getCurrencySymbol } from '@/utils/helpers';
import { touringStep0Schema, touringStep1Schema, touringStep2Schema, touringStep3Schema } from '@/utils/validations/touring';
import {
    buyFxPayoutFieldsSchema,
    refineBuyFxPayoutAndLocation,
    PAYOUT_METHODS,
    defaultPayoutValues,
    isBuyFxPayoutStepValid,
    isBuyFxLocationStepValid,
} from '@/utils/validations/buyFxPayoutValidation';
import { buildBuyFxPayload } from '@/utils/buyFxPayloads';
import { useRouter } from 'expo-router';

const touringFormSchema = z.object({
    ...touringStep0Schema.shape,
    ...touringStep1Schema.shape,
    ...touringStep2Schema.shape,
    ...buyFxPayoutFieldsSchema.shape,
}).superRefine(refineBuyFxPayoutAndLocation);

type TouringFormValues = z.infer<typeof touringFormSchema>;

export default function TouringScreen() {
    const router = useRouter();
    const createTransaction = useCreateTransactionMutation();
    const attachBankAccountsMutation = useAttachBankAccountsMutation();
    const showToast = useToastStore(s => s.showToast);
    useProfileQuery();
    const user = useAuthStore(s => s.user);

    const [currentStep, setCurrentStep] = useState(0);
    const [initiateSheetVisible, setInitiateSheetVisible] = useState(false);
    const [payoutSheetVisible, setPayoutSheetVisible] = useState(false);

    const { control, handleSubmit, trigger, watch, setValue, getValues, formState: { errors } } = useForm<TouringFormValues>({
        resolver: zodResolver(touringFormSchema),
        defaultValues: {
            formAId: '',
            passportDocumentNumber: '',
            passportIssueDate: '',
            passportExpiryDate: '',
            ...defaultPayoutValues,
        },
        mode: 'onChange',
    });

    const watchedFields = watch() as any;
    const needsLocationStep = watchedFields.payoutMethod !== 'Electronic Transfer (100%)';
    const refundStepIndex = needsLocationStep ? 5 : 4;

    const {
        transactionType, setTransactionType,
        currencyGet, setCurrencyGet,
        currencySend, setCurrencySend,
        amountGetStr, setAmountGetStr,
        amountSendStr, setAmountSendStr,
        currentRate, rateText, calculateExchangeRate,
    } = useExchangeLogic({ setValue, initialAmount: '0' });

    const { states, filteredCities, filteredLocations } = useBuyFxLocations(watchedFields.selectedState, watchedFields.selectedCity);

    const {
        banks, savedAccounts,
        selectedSavedAccountId, setSelectedSavedAccountId,
        isAddingNewAccount, setIsAddingNewAccount,
        saveAccountMutation, resolveAccount, handleSaveNewAccount,
    } = useBuyFxBankAccounts({
        setValue, trigger,
        customerAccountNumber: watchedFields.customerAccountNumber,
        customerBankName: watchedFields.customerBankName,
        customerBankCode: watchedFields.customerBankCode,
        customerAccountName: watchedFields.customerAccountName,
    });

    usePassportAutofill({
        user, setValue,
        passportDocumentNumber: watchedFields.passportDocumentNumber,
        passportIssueDate: watchedFields.passportIssueDate,
        passportExpiryDate: watchedFields.passportExpiryDate,
    });

    const { docs, documentFields, isUploading, hasAllDocs } = useTouringDocuments(control, showToast);
    const { submitTransaction } = useSubmitBuyFxTransaction({
        createTransaction, attachBankAccountsMutation,
        selectedSavedAccountId, setInitiateSheetVisible,
        successRoute: '/(buy-fx)/(touring)/request-initiated-success',
        showToast,
    });

    const credentialFields = [
        { customComponent: <ControlledInput control={control} name="formAId" label="Form A ID" placeholder="Enter Form A ID" required maxLength={10} /> },
        { customComponent: <ControlledInput control={control} name="passportDocumentNumber" label="International Passport Number" placeholder="Enter international passport" required maxLength={9} filterType="alphanumeric" /> },
    ];

    const handleNext = async () => {
        const needsLocationLatest = getValues().payoutMethod !== 'Electronic Transfer (100%)';
        const refundStep = needsLocationLatest ? 5 : 4;
        let isValid = false;

        if (currentStep === 0) isValid = await trigger(Object.keys(touringStep0Schema.shape) as any);
        else if (currentStep === 1) {
            isValid = await trigger(Object.keys(touringStep1Schema.shape) as any);
            if (isValid && !hasAllDocs) {
                showToast('Please upload all required documents', 'error');
                return;
            }
        } else if (currentStep === 2) isValid = await trigger(Object.keys(touringStep2Schema.shape) as any);
        else if (currentStep === 3) {
            if (isAddingNewAccount) return;
            const fields: any[] = ['payoutMethod'];
            const isDom = watchedFields.payoutMethod === 'Electronic Transfer (100%)' || watchedFields.payoutMethod === 'Cash (25%) + Electronic Transfer (75%)';
            if (isDom) fields.push('domiciliaryAccountNumber', 'domiciliaryBankName', 'domiciliaryAccountName', 'domiciliarySwiftCode', 'domiciliaryRoutingNumber', 'domiciliaryBankAddress');
            else if (watchedFields.payoutMethod?.includes('Electronic')) fields.push('customerBankName', 'customerBankCode', 'customerAccountNumber', 'customerAccountName');
            isValid = await trigger(fields);
        } else if (currentStep === 4 && needsLocationLatest) {
            isValid = await trigger(Object.keys(touringStep3Schema.shape) as any);
        } else if (currentStep === refundStep) {
            if (isAddingNewAccount) return;
            isValid = !!selectedSavedAccountId;
        }

        if (isValid) {
            if (currentStep < refundStep) setCurrentStep(prev => prev + 1);
            else setInitiateSheetVisible(true);
        }
    };

    const handleBack = () => {
        if (isAddingNewAccount) {
            setIsAddingNewAccount(false);
            return;
        }
        if (currentStep > 0) setCurrentStep(prev => prev - 1);
        else router.back();
    };

    const handleInitiate = (data: TouringFormValues) => {
        const payload = buildBuyFxPayload({
            type: 'TOURING', purpose: 'Touring Allowance',
            currency: currencyGet.code, country: currencyGet.country,
            amount: data.amount, formAId: data.formAId,
            passportDocumentNumber: data.passportDocumentNumber,
            passportIssueDate: data.passportIssueDate, passportExpiryDate: data.passportExpiryDate,
            documents: [
                ...(docs.passport.meta ? [docs.passport.meta] : []),
                ...(docs.visa.meta ? [docs.visa.meta] : []),
                ...(docs.ticket.meta ? [docs.ticket.meta] : []),
                ...(docs.receipt.meta ? [docs.receipt.meta] : []),
                ...(docs.signature.meta ? [docs.signature.meta] : []),
            ],
            payoutMethod: data.payoutMethod, needsLocationStep, data,
        });
        submitTransaction(payload);
    };

    const foreignAmount = parseFloat((currencyGet.code !== 'NGN' ? amountGetStr : amountSendStr).replace(/,/g, '')) || 0;
    const isStep2Valid = watchedFields.amount > 0 && foreignAmount > 0 && currentRate > 0;
    const isNewAccountValid = !!(watchedFields.customerBankName && watchedFields.customerBankCode && watchedFields.customerAccountNumber?.length === 10 && watchedFields.customerAccountName && !resolveAccount.isPending);

    const isNextDisabled = isAddingNewAccount
        ? (!isNewAccountValid || saveAccountMutation.isPending)
        : (
            (currentStep === 1 && !hasAllDocs) ||
            (currentStep === 2 && !isStep2Valid) ||
            (currentStep === 3 && !isBuyFxPayoutStepValid(watchedFields)) ||
            (currentStep === 4 && needsLocationStep && !isBuyFxLocationStepValid(watchedFields)) ||
            (currentStep === refundStepIndex && !selectedSavedAccountId)
        );

    return (
        <View style={{ flex: 1 }}>
            <LoadingBackdrop visible={isUploading || createTransaction.isPending || saveAccountMutation.isPending || attachBankAccountsMutation.isPending} />
            <TransactionLayout
                title="Touring (Buy FX)"
                currentStep={currentStep}
                totalSteps={needsLocationStep ? 6 : 5}
                onBack={handleBack}
                onNext={isAddingNewAccount ? handleSaveNewAccount : handleNext}
                isNextDisabled={isNextDisabled}
                nextLabel={isAddingNewAccount ? "Save" : (currentStep === refundStepIndex ? "Initiate Transaction Request" : "Continue")}
            >
                {currentStep === 0 && <CredentialStep fields={credentialFields} />}
                {currentStep === 1 && <DocumentStep documents={documentFields} />}
                {currentStep === 2 && (
                    <ExchangeStep
                        transactionType={transactionType} onTransactionTypeChange={setTransactionType}
                        currencyGet={currencyGet} onCurrencyGetChange={setCurrencyGet}
                        currencySend={currencySend} onCurrencySendChange={setCurrencySend}
                        amountGet={amountGetStr} amountSend={amountSendStr} rate={rateText}
                        onAmountGetChange={setAmountGetStr} onAmountSendChange={setAmountSendStr}
                        allowedModes={['buy']} showLimitWarning={false}
                        error={errors.amount?.message} isLoading={calculateExchangeRate.isPending}
                    />
                )}
                {currentStep === 3 && (
                    <PayoutMethodStep
                        control={control} setValue={setValue}
                        setPayoutSheetVisible={setPayoutSheetVisible}
                        savedAccounts={savedAccounts}
                        selectedSavedAccountId={selectedSavedAccountId}
                        setSelectedSavedAccountId={setSelectedSavedAccountId}
                        setIsAddingNewAccount={setIsAddingNewAccount}
                        banks={banks}
                    />
                )}
                {currentStep === 4 && needsLocationStep && (
                    <BuyFxLocationStepSection
                        states={states} cities={filteredCities} locations={filteredLocations}
                        selectedState={watchedFields.selectedState} selectedCity={watchedFields.selectedCity}
                        selectedLocation={watchedFields.selectedLocation} pickupDate={watchedFields.pickupDate}
                        pickupTime={watchedFields.pickupTime} setValue={setValue} errors={errors}
                    />
                )}
                {currentStep === refundStepIndex && (
                    <BuyFxRefundStepSection
                        isAddingNewAccount={isAddingNewAccount} savedAccounts={savedAccounts}
                        selectedSavedAccountId={selectedSavedAccountId} setSelectedSavedAccountId={setSelectedSavedAccountId}
                        setValue={setValue} setIsAddingNewAccount={setIsAddingNewAccount}
                        control={control} banks={banks} isResolving={resolveAccount.isPending}
                        selectedBankCode={watchedFields.customerBankCode}
                    />
                )}
            </TransactionLayout>

            <InitiateTransactionSheet
                visible={initiateSheetVisible} onClose={() => setInitiateSheetVisible(false)}
                onConfirm={handleSubmit(handleInitiate)} loading={createTransaction.isPending}
                limitCurrencySymbol={getCurrencySymbol(currencyGet.code)}
                items={[
                    { title: "Request Summary", description: `You are requesting ${getCurrencySymbol(currencyGet.code)}${amountGetStr} ${currencyGet.code.toUpperCase()}. You will pay approximately ₦${amountSendStr}`, iconType: 'info' }
                ]}
            />

            <GenericSelectionSheet
                visible={payoutSheetVisible} onClose={() => setPayoutSheetVisible(false)}
                title="Choose a Payout Method" subtitle="Select an option below"
                items={PAYOUT_METHODS} selectedItem={watchedFields.payoutMethod}
                onSelect={(item) => { setValue('payoutMethod', item.value, { shouldValidate: true, shouldDirty: true }); setPayoutSheetVisible(false); }}
                confirmButtonText="Select a Payout Method"
            />
        </View>
    );
}
