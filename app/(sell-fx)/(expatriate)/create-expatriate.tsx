import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import InitiateTransactionSheet from '@/components/InitiateTransactionSheet';
import LoadingBackdrop from '@/components/LoadingBackdrop';
import CredentialStep from '@/components/transaction-flow/CredentialStep';
import DocumentStep from '@/components/transaction-flow/DocumentStep';
import ExchangeStep from '@/components/transaction-flow/ExchangeStep';
import TransactionLayout from '@/components/transaction-flow/TransactionLayout';
import GenericSelectionSheet from '@/components/GenericSelectionSheet';
import BuyFxLocationStepSection from '@/components/buy-fx/BuyFxLocationStepSection';
import SellFxPayoutStepSection from '@/components/sell-fx/SellFxPayoutStepSection';
import SellFxRefundStepSection from '@/components/sell-fx/SellFxRefundStepSection';
import SellFxSourceOfFundsSheet from '@/components/sell-fx/SellFxSourceOfFundsSheet';

import { useExpatriateDocuments, getExpatriateCredentialFields } from '@/components/sell-fx/expatriateDocuments';
import { PAYOUT_METHODS, sellFxPayoutFields, defaultSellFxPayoutValues, refineSellFxPayout } from '@/utils/validations/sellFxPayoutValidation';
import { buildSellFxPayload } from '@/utils/sellFxPayloads';
import { useSellFxBankAccounts } from '@/hooks/useSellFxBankAccounts';
import { useBuyFxLocations } from '@/hooks/useBuyFxLocations';
import { usePassportAutofill } from '@/hooks/usePassportAutofill';
import { useSubmitBuyFxTransaction } from '@/hooks/useSubmitBuyFxTransaction';
import { useProfileQuery } from '@/hooks/queries/auth/useProfileQuery';
import { useCreateTransactionMutation } from '@/hooks/queries/transactions/useCreateTransactionMutation';
import { useAttachBankAccountsMutation } from '@/hooks/queries/transactions/useAttachBankAccountsMutation';
import { useExchangeLogic } from '@/hooks/useExchangeLogic';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToastStore } from '@/stores/useToastStore';
import { useDeclarationStore } from '@/stores/useDeclarationStore';
import { getCurrencySymbol } from '@/utils/helpers';
import { expatriateStep0Schema, expatriateStep1Schema, expatriateStep2Schema } from '@/utils/validations/expatriate';

const expatriateFormSchema = z.object({
    ...expatriateStep0Schema.shape,
    ...expatriateStep1Schema.shape,
    ...expatriateStep2Schema.shape,
    ...sellFxPayoutFields,
}).superRefine((data, ctx) => {
    refineSellFxPayout(data, ctx);
});

type ExpatriateFormValues = z.infer<typeof expatriateFormSchema>;

export default function CreateExpatriateScreen() {
    const router = useRouter();
    const createTransaction = useCreateTransactionMutation();
    const attachBankAccountsMutation = useAttachBankAccountsMutation();
    const { data: profileResponse } = useProfileQuery();
    const profile = profileResponse?.data;

    const user = useAuthStore((state) => state.user);
    const showToast = useToastStore((state) => state.showToast);

    const profileBvn = profile?.bvn || user?.kyc?.bvn || '';
    const profileNin = profile?.nin || (user?.kyc as any)?.nin || (user as any)?.nin || '';

    const [currentStep, setCurrentStep] = useState(0);
    const [initiateSheetVisible, setInitiateSheetVisible] = useState(false);
    const [showSourceOfFundsSheet, setShowSourceOfFundsSheet] = useState(false);
    const [initials, setInitials] = useState('');
    const { proofOfFunds, isDeclarationCompleted } = useDeclarationStore();

    useEffect(() => {
        useDeclarationStore.getState().reset();
    }, []);

    const { control, handleSubmit, setValue, trigger, watch, formState: { errors } } = useForm<ExpatriateFormValues>({
        resolver: zodResolver(expatriateFormSchema) as any,
        mode: 'onChange',
        defaultValues: {
            amount: 0,
            passportDocumentNumber: user?.kyc?.passportDocumentNumber || '',
            passportIssueDate: '',
            passportExpiryDate: '',
            bvn: profileBvn,
            nin: profileNin,
            ...defaultSellFxPayoutValues,
        },
    });

    const watchedFields = watch();

    const {
        transactionType, setTransactionType,
        currencyGet, setCurrencyGet,
        currencySend, setCurrencySend,
        amountGetStr, setAmountGetStr,
        amountSendStr, setAmountSendStr,
        rateText, currentRate,
        calculateExchangeRate,
    } = useExchangeLogic({
        initialTransactionType: 'sell',
        setValue,
    });

    const {
        banks, savedAccounts, selectedSavedAccountId, setSelectedSavedAccountId,
        isAddingNewAccount, setIsAddingNewAccount, payoutSheetVisible, setPayoutSheetVisible,
        resolveAccount, saveAccountMutation, handleSaveNewAccount, handleSaveDomiciliaryAccount,
        isNewAccountValid, isNewDomiciliaryAccountValid,
    } = useSellFxBankAccounts({
        setValue, trigger,
        customerAccountNumber: watchedFields.customerAccountNumber,
        customerBankName: watchedFields.customerBankName,
        customerBankCode: watchedFields.customerBankCode,
        customerAccountName: watchedFields.customerAccountName,
        domiciliaryBankName: watchedFields.domiciliaryBankName,
        domiciliaryAccountNumber: watchedFields.domiciliaryAccountNumber,
        domiciliaryAccountName: watchedFields.domiciliaryAccountName,
        domiciliarySwiftCode: watchedFields.domiciliarySwiftCode,
        domiciliaryRoutingNumber: watchedFields.domiciliaryRoutingNumber,
        domiciliaryBankAddress: watchedFields.domiciliaryBankAddress,
    });

    const { states, filteredCities, filteredLocations } = useBuyFxLocations(
        watchedFields.selectedState,
        watchedFields.selectedCity
    );

    usePassportAutofill({
        user, setValue,
        passportDocumentNumber: watchedFields.passportDocumentNumber,
        passportIssueDate: watchedFields.passportIssueDate,
        passportExpiryDate: watchedFields.passportExpiryDate,
    });

    const { docs, documentFields, uploadFile, isUploading, hasAllDocs } = useExpatriateDocuments(control, showToast);

    const { submitTransaction } = useSubmitBuyFxTransaction({
        createTransaction, attachBankAccountsMutation,
        selectedSavedAccountId, setInitiateSheetVisible,
        successRoute: '/(sell-fx)/(expatriate)/success',
        showToast,
    });

    useEffect(() => {
        if (profileBvn && !watchedFields.bvn) setValue('bvn', profileBvn);
        if (profileNin && !watchedFields.nin) setValue('nin', profileNin);
    }, [profileBvn, profileNin, setValue, watchedFields.bvn, watchedFields.nin]);

    useEffect(() => {
        const num = parseFloat(amountGetStr.replace(/,/g, '')) || 0;
        if (num > 0 && watchedFields.amount !== num) {
            setValue('amount', num, { shouldValidate: true });
        }
    }, [amountGetStr, setValue, watchedFields.amount]);

    const credentialFields = useMemo(() => getExpatriateCredentialFields(control), [control]);

    const isElectronicTransfer = watchedFields.payoutMethod?.includes('Electronic') || watchedFields.payoutMethod === 'Electronic Transfer';
    const needsLocationStep = !isElectronicTransfer;
    const totalSteps = needsLocationStep ? 6 : 5;
    const refundStepIndex = needsLocationStep ? 5 : 4;

    const handleNext = async () => {
        if (isUploading) {
            showToast('Please wait for files to finish uploading', 'warning');
            return;
        }

        let isStepValid = false;
        if (currentStep === 0) {
            isStepValid = await trigger(['nin', 'passportDocumentNumber']);
        } else if (currentStep === 1) {
            if (!hasAllDocs) {
                showToast('Please upload all required documents', 'error');
                return;
            }
            isStepValid = await trigger(['passportIssueDate', 'passportExpiryDate']);
        } else if (currentStep === 2) {
            isStepValid = await trigger(['amount']);
        } else if (currentStep === 3) {
            if (isAddingNewAccount) return;
            const fieldsToTrigger: any[] = ['payoutMethod'];
            if (isElectronicTransfer) fieldsToTrigger.push('customerBankName', 'customerBankCode', 'customerAccountNumber', 'customerAccountName');
            isStepValid = await trigger(fieldsToTrigger);
        } else if (currentStep === 4 && needsLocationStep) {
            isStepValid = await trigger(['selectedState', 'selectedCity', 'selectedLocation', 'pickupDate', 'pickupTime']);
        } else if (currentStep === refundStepIndex) {
            if (isAddingNewAccount) return;
            isStepValid = !!(watchedFields.domiciliaryBankName && watchedFields.domiciliaryAccountNumber);
            if (!isStepValid) showToast('Please enter your domiciliary account details for refunds', 'error');
        }

        if (isStepValid) {
            if (currentStep < refundStepIndex) setCurrentStep(currentStep + 1);
            else setInitiateSheetVisible(true);
        }
    };

    const handleBack = () => {
        if (isAddingNewAccount) { setIsAddingNewAccount(false); return; }
        if (currentStep > 0) setCurrentStep(currentStep - 1);
        else router.back();
    };

    const onSubmit = (data: ExpatriateFormValues) => {
        const payload = buildSellFxPayload({
            type: 'EXPATRIATE_FX',
            purpose: 'Expatriate Selling FX',
            currencyGet,
            data,
            documents: [
                ...(docs.workPermit.meta ? [docs.workPermit.meta] : []),
                ...(docs.passport.meta ? [docs.passport.meta] : []),
                ...(docs.utility.meta ? [docs.utility.meta] : []),
                ...((docs.signature.meta && useDeclarationStore.getState().declarationMethod === 'signature') ? [docs.signature.meta] : []),
                ...proofOfFunds.map((p) => p.metadata),
            ],
            initials,
        });
        submitTransaction(payload);
    };

    const foreignAmountStr = currencyGet.code !== 'NGN' ? amountGetStr : amountSendStr;
    const foreignAmount = parseFloat(foreignAmountStr.replace(/,/g, '')) || 0;
    const hasProofOfFunds = proofOfFunds.length > 0;
    const isStep2Valid = watchedFields.amount > 0 && (foreignAmount <= 10000 || (hasProofOfFunds && isDeclarationCompleted)) && currentRate > 0;
    const isStep3Valid = watchedFields.payoutMethod && (!isElectronicTransfer || (watchedFields.customerBankName && watchedFields.customerBankCode && watchedFields.customerAccountNumber && watchedFields.customerAccountName));
    const isStep4Valid = !needsLocationStep || !!(watchedFields.selectedState && watchedFields.selectedCity && watchedFields.selectedLocation && watchedFields.pickupDate && watchedFields.pickupTime);
    const isRefundStepValid = !!(watchedFields.domiciliaryBankName && watchedFields.domiciliaryAccountNumber);

    const isNextDisabled = isAddingNewAccount
        ? (currentStep === refundStepIndex ? (!isNewDomiciliaryAccountValid || saveAccountMutation.isPending) : (!isNewAccountValid || saveAccountMutation.isPending))
        : (
            (currentStep === 0 && !watchedFields.passportDocumentNumber) ||
            (currentStep === 1 && !hasAllDocs) ||
            (currentStep === 2 && !isStep2Valid) ||
            (currentStep === 3 && !isStep3Valid) ||
            (currentStep === 4 && needsLocationStep && !isStep4Valid) ||
            (currentStep === refundStepIndex && !isRefundStepValid)
        );

    return (
        <View style={{ flex: 1 }}>
            <LoadingBackdrop visible={isUploading || createTransaction.isPending || saveAccountMutation.isPending || attachBankAccountsMutation.isPending} />
            <TransactionLayout
                title="Expatriate"
                currentStep={currentStep}
                totalSteps={totalSteps}
                onBack={handleBack}
                onNext={isAddingNewAccount ? (currentStep === refundStepIndex ? () => handleSaveDomiciliaryAccount(currencyGet.code) : handleSaveNewAccount) : handleNext}
                isNextDisabled={isNextDisabled}
                nextLabel={isAddingNewAccount ? 'Save' : (currentStep === refundStepIndex ? 'Initiate Transaction Request' : 'Continue')}
            >
                {currentStep === 0 && <CredentialStep fields={credentialFields} title="Enter BVN, NIN & Passport Number" />}
                {currentStep === 1 && <DocumentStep documents={documentFields} title="Upload Relevant Documents" />}
                {currentStep === 2 && (
                    <ExchangeStep
                        transactionType={transactionType} onTransactionTypeChange={setTransactionType}
                        currencyGet={currencyGet} onCurrencyGetChange={setCurrencyGet}
                        currencySend={currencySend} onCurrencySendChange={setCurrencySend}
                        amountGet={amountGetStr} amountSend={amountSendStr} rate={rateText}
                        onAmountGetChange={setAmountGetStr} onAmountSendChange={setAmountSendStr}
                        allowedModes={['sell']} error={errors.amount?.message as string | undefined}
                        isLoading={calculateExchangeRate.isPending} showLimitWarning
                        onLimitWarningPress={() => router.push('/proof-of-fund')}
                        onDownloadPress={() => setShowSourceOfFundsSheet(true)}
                    />
                )}
                {currentStep === 3 && (
                    <SellFxPayoutStepSection
                        isAddingNewAccount={isAddingNewAccount} control={control} setValue={setValue}
                        setPayoutSheetVisible={setPayoutSheetVisible} savedAccounts={savedAccounts}
                        selectedSavedAccountId={selectedSavedAccountId} setSelectedSavedAccountId={setSelectedSavedAccountId}
                        setIsAddingNewAccount={setIsAddingNewAccount} banks={banks}
                        isResolving={resolveAccount.isPending} selectedBankCode={watchedFields.customerBankCode}
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
                    <SellFxRefundStepSection
                        isAddingNewAccount={isAddingNewAccount} control={control} setValue={setValue}
                        savedAccounts={savedAccounts} selectedSavedAccountId={selectedSavedAccountId}
                        setSelectedSavedAccountId={setSelectedSavedAccountId} setIsAddingNewAccount={setIsAddingNewAccount}
                        domiciliaryAccount={{
                            bankName: watchedFields.domiciliaryBankName, accountNumber: watchedFields.domiciliaryAccountNumber,
                            accountName: watchedFields.domiciliaryAccountName, swiftCode: watchedFields.domiciliarySwiftCode,
                            routingNumber: watchedFields.domiciliaryRoutingNumber, bankAddress: watchedFields.domiciliaryBankAddress,
                        }}
                    />
                )}
            </TransactionLayout>
            <InitiateTransactionSheet
                visible={initiateSheetVisible} onClose={() => setInitiateSheetVisible(false)}
                onConfirm={handleSubmit(onSubmit, (err) => {
                    const first = Object.values(err)[0]?.message;
                    showToast(first ? String(first) : 'Please check required fields', 'error');
                })}
                title="Initiate Expatriate Transaction request?" loading={createTransaction.isPending}
                items={[{
                    title: 'Request Summary',
                    description: `You are selling ${getCurrencySymbol(currencyGet.code)}${amountGetStr}. You will be sent approximately ₦${amountSendStr}`,
                    iconType: 'info',
                }]}
            />
            <GenericSelectionSheet
                visible={payoutSheetVisible} onClose={() => setPayoutSheetVisible(false)}
                title="Choose a Payout Method" subtitle="Select an option below" items={PAYOUT_METHODS}
                selectedItem={watchedFields.payoutMethod}
                onSelect={(item) => { setValue('payoutMethod', item.value); setPayoutSheetVisible(false); }}
                confirmButtonText="Select a Payout Method"
            />
            <SellFxSourceOfFundsSheet
                visible={showSourceOfFundsSheet} onClose={() => setShowSourceOfFundsSheet(false)}
                user={user} passportDocumentNumber={watchedFields.passportDocumentNumber}
                transactionTypeTitle="Sell FX (Expatriate)" currencyName={currencyGet.currencyName}
                currencyCode={currencyGet.code} amountGet={amountGetStr}
                onUploadSignature={() => uploadFile('DIGITAL_SIGNATURE')}
                signatureFileName={docs.signature.file?.name} isUploadingSignature={isUploading}
                initials={initials} onChangeInitials={setInitials}
            />
        </View>
    );
}
