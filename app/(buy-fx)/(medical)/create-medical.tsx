import React, { useState } from 'react';
import { View } from 'react-native';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ControlledDatePicker from '@/components/ControlledDatePicker';
import ControlledInput from '@/components/ControlledInput';
import GenericSelectionSheet from '@/components/GenericSelectionSheet';
import InitiateTransactionSheet from '@/components/InitiateTransactionSheet';
import LoadingBackdrop from '@/components/LoadingBackdrop';
import CredentialStep from '@/components/transaction-flow/CredentialStep';
import DocumentStep from '@/components/transaction-flow/DocumentStep';
import ExchangeStep from '@/components/transaction-flow/ExchangeStep';
import HospitalBankDetailsStep from '@/components/transaction-flow/HospitalBankDetailsStep';
import TransactionLayout from '@/components/transaction-flow/TransactionLayout';
import BuyFxRefundStepSection from '@/components/buy-fx/BuyFxRefundStepSection';
import { useMedicalDocuments, buildMedicalPayload } from '@/components/buy-fx/medicalDocuments';
import { useProfileQuery } from '@/hooks/queries/auth/useProfileQuery';
import { useCreateTransactionMutation } from '@/hooks/queries/transactions/useCreateTransactionMutation';
import { useAttachBankAccountsMutation } from '@/hooks/queries/transactions/useAttachBankAccountsMutation';
import { useExchangeLogic } from '@/hooks/useExchangeLogic';
import { useBuyFxBankAccounts } from '@/hooks/useBuyFxBankAccounts';
import { usePassportAutofill } from '@/hooks/usePassportAutofill';
import { useSubmitBuyFxTransaction } from '@/hooks/useSubmitBuyFxTransaction';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToastStore } from '@/stores/useToastStore';
import { getCurrencySymbol } from '@/utils/helpers';
import { medicalStep0Schema, medicalStep1Schema, medicalStep2Schema, medicalStep3Schema } from '@/utils/validations/medical';
import { PAYOUT_METHODS_WITHOUT_CASH_SPLIT } from '@/utils/validations/buyFxPayoutValidation';
import { useRouter } from 'expo-router';

const medicalFormSchema = medicalStep0Schema
    .merge(medicalStep1Schema)
    .merge(medicalStep2Schema)
    .merge(z.object({
        payoutMethod: z.string().optional().or(z.literal('')),
        customerBankName: z.string().optional().or(z.literal('')),
        customerBankCode: z.string().optional().or(z.literal('')),
        customerAccountNumber: z.string().optional().or(z.literal('')),
        customerAccountName: z.string().optional().or(z.literal('')),
    }))
    .merge(medicalStep3Schema);

type MedicalFormValues = z.infer<typeof medicalFormSchema>;

export default function MedicalPaymentScreen() {
    const router = useRouter();
    const createTransaction = useCreateTransactionMutation();
    const attachBankAccountsMutation = useAttachBankAccountsMutation();
    const showToast = useToastStore(s => s.showToast);
    const { data: profileResponse } = useProfileQuery();
    const profile = profileResponse?.data;
    const profileBvn = profile?.bvn;
    const profileNin = profile?.nin;
    const user = useAuthStore(s => s.user);

    const [currentStep, setCurrentStep] = useState(0);
    const [initiateSheetVisible, setInitiateSheetVisible] = useState(false);
    const [payoutSheetVisible, setPayoutSheetVisible] = useState(false);

    const { control, handleSubmit, trigger, watch, setValue, formState: { errors } } = useForm<MedicalFormValues>({
        resolver: zodResolver(medicalFormSchema),
        defaultValues: {
            bvn: user?.kyc?.bvn || '', nin: user?.kyc?.nin || '', formAId: '',
            passportDocumentNumber: '', passportIssueDate: '', passportExpiryDate: '',
            amount: 0, organizationName: '', beneficiaryPhone: '', beneficiaryEmail: '',
            beneficiaryAddress: '', beneficiaryCity: '', beneficiaryState: '', beneficiaryCountry: '',
            bankAccountName: '', bankAccountAddress: '', bankAccountIban: '', bankAccountSwiftCode: '',
            bankAccountNumber: '', bankName: '', correspondenceBankName: '', correspondenceBankAddress: '',
            correspondenceBankSwiftCode: '', otherBankDetails: '', paymentReference: '', bsbCode: '',
            routingNumber: '', ifscCode: '', purposeCode: '', payoutMethod: '', customerBankName: '',
            customerBankCode: '', customerAccountNumber: '', customerAccountName: '',
        },
        mode: 'onChange',
    });

    const watchedFields = watch() as any;

    const {
        transactionType, setTransactionType,
        currencyGet, setCurrencyGet,
        currencySend, setCurrencySend,
        amountGetStr, setAmountGetStr,
        amountSendStr, setAmountSendStr,
        currentRate, rateText, calculateExchangeRate,
    } = useExchangeLogic({ setValue, initialAmount: '0', maxLimit: 5000 });

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

    const { docs, documentFields, isUploading, hasAllDocs, uploadFile } = useMedicalDocuments(control, showToast);
    const { submitTransaction } = useSubmitBuyFxTransaction({
        createTransaction, attachBankAccountsMutation,
        selectedSavedAccountId, setInitiateSheetVisible,
        successRoute: '/(buy-fx)/(medical)/request-initiated-success',
        showToast,
    });

    const isBvnDisabled = !!(profileBvn || user?.kyc?.bvn);
    const isNinDisabled = !!(profileNin || user?.kyc?.nin);

    const credentialFields = [
        { customComponent: <ControlledInput control={control} name="bvn" label="Bank Verification Number(BVN)" placeholder="Enter your BVN" required keyboardType="default" disabled={isBvnDisabled} /> },
        { customComponent: <ControlledInput control={control} name="nin" label="National Identification Number(NIN)" placeholder="Enter your NIN" required keyboardType="default" disabled={isNinDisabled} /> },
        { customComponent: <ControlledInput control={control} name="formAId" label="Form A ID" placeholder="Enter Form A ID" required maxLength={10} /> },
        { customComponent: <ControlledInput control={control} name="passportDocumentNumber" label="International Passport Number" placeholder="Enter international passport" required maxLength={9} filterType="alphanumeric" /> },
        {
            customComponent: (
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1 }}><ControlledDatePicker control={control} name="passportIssueDate" label="Passport Issue Date" required maximumDate={new Date()} /></View>
                    <View style={{ flex: 1 }}><ControlledDatePicker control={control} name="passportExpiryDate" label="Passport Expiry Date" required minimumDate={new Date()} /></View>
                </View>
            ),
        },
    ];

    const handleNext = async () => {
        let isStepValid = false;
        if (currentStep === 0) isStepValid = await trigger(Object.keys(medicalStep0Schema.shape) as any);
        else if (currentStep === 1) {
            isStepValid = await trigger(Object.keys(medicalStep1Schema.shape) as any);
            if (isStepValid && !hasAllDocs) {
                showToast('Please upload all required documents', 'error');
                return;
            }
        } else if (currentStep === 2) isStepValid = await trigger(Object.keys(medicalStep2Schema.shape) as any);
        else if (currentStep === 3) isStepValid = await trigger(Object.keys(medicalStep3Schema.shape) as any);
        else if (currentStep === 4) {
            if (isAddingNewAccount) return;
            isStepValid = !!selectedSavedAccountId;
        }

        if (isStepValid) {
            if (currentStep < 4) setCurrentStep(prev => prev + 1);
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

    const handleInitiate = (data: MedicalFormValues) => {
        const payload = buildMedicalPayload(data, docs, currencyGet);
        submitTransaction(payload);
    };

    const foreignAmount = parseFloat((currencyGet.code !== 'NGN' ? amountGetStr : amountSendStr).replace(/,/g, '')) || 0;
    const isStep2Valid = watchedFields.amount > 0 && foreignAmount <= 5000 && currentRate > 0;
    const isNewAccountValid = !!(watchedFields.customerBankName && watchedFields.customerBankCode && watchedFields.customerAccountNumber?.length === 10 && watchedFields.customerAccountName && !resolveAccount.isPending);

    const isNextDisabled = isAddingNewAccount
        ? (!isNewAccountValid || saveAccountMutation.isPending)
        : (
            (currentStep === 1 && !hasAllDocs) ||
            (currentStep === 2 && !isStep2Valid) ||
            (currentStep === 4 && !selectedSavedAccountId)
        );

    return (
        <View style={{ flex: 1 }}>
            <LoadingBackdrop visible={isUploading || createTransaction.isPending || saveAccountMutation.isPending || attachBankAccountsMutation.isPending} />
            <TransactionLayout
                title="Medical Fees"
                currentStep={currentStep}
                totalSteps={5}
                onBack={handleBack}
                onNext={isAddingNewAccount ? handleSaveNewAccount : handleNext}
                isNextDisabled={isNextDisabled}
                nextLabel={isAddingNewAccount ? "Save" : (currentStep === 4 ? "Initiate Transaction Request" : "Continue")}
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
                        allowedModes={['buy']} showLimitWarning={true}
                        error={errors.amount?.message} isLoading={calculateExchangeRate.isPending}
                    />
                )}
                {currentStep === 3 && (
                    <HospitalBankDetailsStep
                        control={control}
                        watch={watch}
                        setValue={setValue}
                        errors={errors}
                        invoiceFile={docs.invoice.file ? { ...docs.invoice.file, fileUrl: docs.invoice.meta?.fileUrl } : null}
                        onUploadInvoice={() => uploadFile('INVOICE')}
                        isUploadingInvoice={isUploading}
                    />
                )}
                {currentStep === 4 && (
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
                    { title: "Request Summary", description: `You are requesting ${getCurrencySymbol(currencyGet.code)}${amountGetStr} ${currencyGet.code.toUpperCase()}. You will pay approximately ₦${amountSendStr}`, iconType: 'info' },
                    { title: "Maximum Limit", description: `Please note that the maximum you can transact is ${getCurrencySymbol(currencyGet.code)}5,000 per quarter.`, iconType: 'limit' }
                ]}
            />

            <GenericSelectionSheet
                visible={payoutSheetVisible} onClose={() => setPayoutSheetVisible(false)}
                title="Choose a Payout Method" subtitle="Select an option below"
                items={PAYOUT_METHODS_WITHOUT_CASH_SPLIT} selectedItem={watchedFields.payoutMethod}
                onSelect={(item) => { setValue('payoutMethod', item.value); setPayoutSheetVisible(false); }}
                confirmButtonText="Select a Payout Method"
            />
        </View>
    );
}
