import React, { useMemo, useState, useEffect } from 'react';
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
import ProfessionalBankDetailsStep from '@/components/transaction-flow/ProfessionalBankDetailsStep';
import TransactionLayout from '@/components/transaction-flow/TransactionLayout';
import BuyFxRefundStepSection from '@/components/buy-fx/BuyFxRefundStepSection';
import { useProfessionalDocuments, buildProfessionalPayload } from '@/components/buy-fx/professionalDocuments';
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
import {
    professionalStep0Schema,
    professionalStep1Schema,
    professionalStep2Schema,
    professionalStep3Schema,
} from '@/utils/validations/professional';
import { PAYOUT_METHODS_WITHOUT_CASH_SPLIT } from '@/utils/validations/buyFxPayoutValidation';
import { useRouter } from 'expo-router';

export default function ProfessionalScreen() {
    const router = useRouter();
    const createTransaction = useCreateTransactionMutation();
    const attachBankAccountsMutation = useAttachBankAccountsMutation();
    const showToast = useToastStore(s => s.showToast);
    const { data: profileResponse } = useProfileQuery();
    const profile = profileResponse?.data;
    const profileBvn = profile?.bvn;
    const profileNin = profile?.nin;
    const user = useAuthStore(s => s.user);
    const isBvnDisabled = !!(profileBvn || user?.kyc?.bvn);
    const isNinDisabled = !!(profileNin || user?.kyc?.nin);

    const [currentStep, setCurrentStep] = useState(0);
    const [initiateSheetVisible, setInitiateSheetVisible] = useState(false);
    const [payoutSheetVisible, setPayoutSheetVisible] = useState(false);

    const resolver = useMemo(() => {
        const dynamicSchema = professionalStep0Schema
            .merge(professionalStep1Schema)
            .merge(professionalStep2Schema)
            .merge(z.object({
                payoutMethod: z.string().optional().or(z.literal('')),
                customerBankName: z.string().optional().or(z.literal('')),
                customerBankCode: z.string().optional().or(z.literal('')),
                customerAccountNumber: z.string().optional().or(z.literal('')),
                customerAccountName: z.string().optional().or(z.literal('')),
            }))
            .merge(professionalStep3Schema)
            .superRefine((data, ctx) => {
                const targetBvn = profileBvn || user?.kyc?.bvn;
                if (!targetBvn && !data.bvn) {
                    ctx.addIssue({ code: 'custom', message: 'BVN is required', path: ['bvn'] });
                }
                const targetNin = profileNin || user?.kyc?.nin;
                if (!targetNin && !data.nin) {
                    ctx.addIssue({ code: 'custom', message: 'NIN is required', path: ['nin'] });
                }
                if (data.passportIssueDate && data.passportExpiryDate && data.passportIssueDate === data.passportExpiryDate) {
                    ctx.addIssue({ code: 'custom', message: 'Passport Expiry Date cannot be the same as Passport Issue Date', path: ['passportExpiryDate'] });
                }
            });
        return zodResolver(dynamicSchema);
    }, [profileBvn, profileNin, user]);

    const { control, handleSubmit, trigger, watch, setValue, formState: { errors } } = useForm({
        resolver,
        defaultValues: {
            bvn: '', nin: '', formAId: '', passportDocumentNumber: '', passportIssueDate: '',
            passportExpiryDate: '', memberNumber: '', amount: 0, organizationName: '',
            memberName: '', beneficiaryPhone: '', beneficiaryEmail: '', beneficiaryAddress: '',
            beneficiaryCity: '', beneficiaryState: '', beneficiaryCountry: '', bankAccountName: '',
            bankAccountAddress: '', bankAccountIban: '', bankAccountSwiftCode: '', bankAccountNumber: '',
            bankName: '', correspondenceBankName: '', correspondenceBankAddress: '', correspondenceBankSwiftCode: '',
            otherBankDetails: '', payoutMethod: '', customerBankName: '', customerBankCode: '',
            customerAccountNumber: '', customerAccountName: '',
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
    } = useExchangeLogic({ setValue, initialAmount: '0', maxLimit: 2000 });

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

    const { docs, documentFields, isUploading, hasRequiredDocs, uploadFile } = useProfessionalDocuments(showToast);
    const { submitTransaction } = useSubmitBuyFxTransaction({
        createTransaction, attachBankAccountsMutation,
        selectedSavedAccountId, setInitiateSheetVisible,
        successRoute: '/(buy-fx)/(professional)/request-initiated-success',
        showToast,
    });

    useEffect(() => {
        if (user?.profile) {
            const fullName = `${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim();
            if (fullName) setValue('memberName', fullName);
        }
    }, [user, setValue]);

    useEffect(() => {
        const activeBvn = profileBvn || user?.kyc?.bvn || '';
        const activeNin = profileNin || user?.kyc?.nin || '';
        if (activeBvn && !watchedFields.bvn) setValue('bvn', activeBvn, { shouldValidate: true, shouldDirty: true });
        if (activeNin && !watchedFields.nin) setValue('nin', activeNin, { shouldValidate: true, shouldDirty: true });
    }, [profileBvn, profileNin, user, setValue, watchedFields.bvn, watchedFields.nin]);

    const credentialFields = [
        { customComponent: <ControlledInput control={control} name="bvn" label="Bank Verification Number(BVN)" placeholder="Enter your BVN" required={!isBvnDisabled} keyboardType="default" disabled={isBvnDisabled} /> },
        { customComponent: <ControlledInput control={control} name="nin" label="National Identification Number(NIN)" placeholder="Enter your NIN" required={!isNinDisabled} keyboardType="default" disabled={isNinDisabled} /> },
        { customComponent: <ControlledInput control={control} name="formAId" label="Form A ID" placeholder="Enter Form A ID" required maxLength={10} /> },
        { customComponent: <ControlledInput control={control} name="passportDocumentNumber" label="International Passport Number (Optional)" placeholder="Enter international passport number" maxLength={9} filterType="alphanumeric" /> },
        {
            customComponent: (
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1 }}><ControlledDatePicker control={control} name="passportIssueDate" label="Passport Issue Date (Optional)" maximumDate={new Date()} /></View>
                    <View style={{ flex: 1 }}><ControlledDatePicker control={control} name="passportExpiryDate" label="Passport Expiry Date (Optional)" minimumDate={new Date()} /></View>
                </View>
            ),
        },
        { customComponent: <ControlledInput control={control} name="memberNumber" label="Membership/Registration Number" placeholder="Enter registration or membership number" required /> },
    ];

    const handleNext = async () => {
        if (isUploading) {
            showToast('Please wait for files to finish uploading', 'warning');
            return;
        }

        let isStepValid = false;
        if (currentStep === 0) {
            const fields = ['bvn', 'nin', 'formAId', 'memberNumber'];
            if (watchedFields.passportDocumentNumber) fields.push('passportDocumentNumber');
            if (watchedFields.passportIssueDate) fields.push('passportIssueDate');
            if (watchedFields.passportExpiryDate) fields.push('passportExpiryDate');
            isStepValid = await trigger(fields as any);
        } else if (currentStep === 1) {
            if (!hasRequiredDocs) {
                showToast('Please upload all required documents', 'error');
                return;
            }
            isStepValid = true;
        } else if (currentStep === 2) {
            isStepValid = await trigger(['amount']);
        } else if (currentStep === 3) {
            const country = watchedFields.beneficiaryCountry?.toLowerCase();
            const fields = ['beneficiaryCountry', 'bankAccountName', 'beneficiaryAddress', 'bankName', 'bankAccountNumber', 'bankAccountAddress', 'bankAccountSwiftCode', 'paymentReference', 'organizationName'];
            if (country?.includes('australia')) fields.push('bsbCode');
            if (country?.includes('united states') || country?.includes('usa') || country?.includes('canada')) fields.push('routingNumber');
            if (country?.includes('india')) fields.push('ifscCode', 'purposeCode');
            if (country?.includes('united kingdom') || country === 'uk') fields.push('bankAccountIban');
            isStepValid = await trigger(fields as any);
        } else if (currentStep === 4) {
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
        if (currentStep > 0) setCurrentStep(currentStep - 1);
        else router.back();
    };

    const onSubmit = (data: any) => {
        const payload = buildProfessionalPayload(data, docs, currencyGet);
        submitTransaction(payload);
    };

    const foreignAmount = parseFloat((currencyGet.code !== 'NGN' ? amountGetStr : amountSendStr).replace(/,/g, '')) || 0;
    const isStep2Valid = watchedFields.amount > 0 && foreignAmount <= 2000 && currentRate > 0;
    const isNewAccountValid = !!(watchedFields.customerBankName && watchedFields.customerBankCode && watchedFields.customerAccountNumber?.length === 10 && watchedFields.customerAccountName && !resolveAccount.isPending);

    const isNextDisabled = isAddingNewAccount
        ? (!isNewAccountValid || saveAccountMutation.isPending)
        : (
            (currentStep === 1 && !hasRequiredDocs) ||
            (currentStep === 2 && !isStep2Valid) ||
            (currentStep === 4 && !selectedSavedAccountId)
        );

    return (
        <View style={{ flex: 1 }}>
            <LoadingBackdrop visible={isUploading || createTransaction.isPending || saveAccountMutation.isPending || attachBankAccountsMutation.isPending} />
            <TransactionLayout
                title="Professional Body"
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
                        error={errors.amount?.message as string | undefined} isLoading={calculateExchangeRate.isPending}
                    />
                )}
                {currentStep === 3 && (
                    <ProfessionalBankDetailsStep
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
                onConfirm={handleSubmit(onSubmit)} loading={createTransaction.isPending}
                limitCurrencySymbol={getCurrencySymbol(currencyGet.code)}
                items={[
                    { title: "Request Summary", description: `You are requesting ${getCurrencySymbol(currencyGet.code)}${amountGetStr} ${currencyGet.code.toUpperCase()}. You will pay approximately ₦${amountSendStr}`, iconType: 'info' },
                    { title: "Maximum Limit", description: `Please note that the maximum you can transact is ${getCurrencySymbol(currencyGet.code)}2,000 per quarter.`, iconType: 'limit' }
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
