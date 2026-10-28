import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useForm } from 'react-hook-form';
import { ArrowDown2, Teacher } from 'iconsax-react-nativejs';
import { moderateScale } from 'react-native-size-matters';
import ControlledDatePicker from '@/components/ControlledDatePicker';
import ControlledInput from '@/components/ControlledInput';
import GenericSelectionSheet from '@/components/GenericSelectionSheet';
import InitiateTransactionSheet from '@/components/InitiateTransactionSheet';
import LoadingBackdrop from '@/components/LoadingBackdrop';
import CredentialStep from '@/components/transaction-flow/CredentialStep';
import DocumentStep from '@/components/transaction-flow/DocumentStep';
import ExchangeStep from '@/components/transaction-flow/ExchangeStep';
import SchoolBankDetailsStep from '@/components/transaction-flow/SchoolBankDetailsStep';
import TransactionLayout from '@/components/transaction-flow/TransactionLayout';
import BuyFxRefundStepSection from '@/components/buy-fx/BuyFxRefundStepSection';
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
    ADMISSION_TYPES,
    createSchoolResolver,
    useSchoolDocuments,
    buildSchoolPayload,
} from '@/components/buy-fx/schoolDocuments';
import { PAYOUT_METHODS_WITHOUT_CASH_SPLIT } from '@/utils/validations/buyFxPayoutValidation';
import { useRouter } from 'expo-router';

export default function SchoolFeesScreen() {
    const router = useRouter();
    const createTransaction = useCreateTransactionMutation();
    const attachBankAccountsMutation = useAttachBankAccountsMutation();
    const showToast = useToastStore(s => s.showToast);
    const { data: profileResponse } = useProfileQuery();
    const profile = profileResponse?.data;
    const user = useAuthStore(s => s.user);

    const profileBvn = useMemo(() => profile?.bvn || user?.kyc?.bvn || '', [profile, user]);
    const profileNin = useMemo(() => profile?.nin || (user?.kyc as any)?.nin || (user as any)?.nin || '', [profile, user]);

    const [currentStep, setCurrentStep] = useState(0);
    const [initiateSheetVisible, setInitiateSheetVisible] = useState(false);
    const [admissionSheetVisible, setAdmissionSheetVisible] = useState(false);
    const [payoutSheetVisible, setPayoutSheetVisible] = useState(false);

    const { control, handleSubmit, trigger, watch, setValue, formState: { errors } } = useForm({
        resolver: createSchoolResolver(profileBvn, profileNin),
        defaultValues: {
            bvn: '', nin: '', formAId: '', passportDocumentNumber: '', admissionType: '',
            passportIssueDate: '', passportExpiryDate: '', amount: 0, studentName: '',
            studentNin: '', studentPassportNumber: '', studentPassportIssueDate: '',
            studentPassportExpiryDate: '', schoolName: '', bankAccountName: '', bankAccountAddress: '',
            bankAccountIban: '', bankAccountSwiftCode: '', bankAccountNumber: '', bankName: '',
            beneficiaryCountry: '', beneficiaryAddress: '', beneficiaryCity: '', beneficiaryState: '',
            beneficiaryEmail: '', beneficiaryPhone: '', paymentReference: '', routingNumber: '',
            ifscCode: '', purposeCode: '', bsbCode: '', otherBankDetails: '',
            correspondenceBankName: '', correspondenceBankAddress: '', correspondenceBankSwiftCode: '',
            payoutMethod: '', customerBankName: '', customerBankCode: '', customerAccountNumber: '',
            customerAccountName: '',
        },
        mode: 'onChange',
    });

    const watchedFields = watch() as any;
    const admissionType = watchedFields.admissionType;
    const isPostGrad = admissionType === 'Post-Graduate';

    const {
        transactionType, setTransactionType,
        currencyGet, setCurrencyGet,
        currencySend, setCurrencySend,
        amountGetStr, setAmountGetStr,
        amountSendStr, setAmountSendStr,
        currentRate, rateText, calculateExchangeRate,
    } = useExchangeLogic({ setValue, initialAmount: '0', maxLimit: 10000 });

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
        user, profile, setValue,
        bvn: watchedFields.bvn, nin: watchedFields.nin,
        passportDocumentNumber: watchedFields.passportDocumentNumber,
        passportIssueDate: watchedFields.passportIssueDate,
        passportExpiryDate: watchedFields.passportExpiryDate,
    });

    const { docs, documentFields, isUploading, hasRequiredDocs, uploadFile } = useSchoolDocuments(
        admissionType, isPostGrad, control, showToast
    );

    const { submitTransaction } = useSubmitBuyFxTransaction({
        createTransaction, attachBankAccountsMutation,
        selectedSavedAccountId, setInitiateSheetVisible,
        successRoute: '/(buy-fx)/(school)/request-initiated-success',
        showToast,
    });

    const credentialFields = [
        { customComponent: <ControlledInput control={control} name="bvn" label="Bank Verification Number (BVN)" placeholder="Enter BVN" required keyboardType="default" disabled={!!profileBvn} /> },
        { customComponent: <ControlledInput control={control} name="nin" label="National Identification Number (NIN)" placeholder="Enter NIN" required keyboardType="default" disabled={!!profileNin} /> },
        { customComponent: <ControlledInput control={control} name="formAId" label="Form A ID" placeholder="Enter Form A ID" required maxLength={10} /> },
        { customComponent: <ControlledInput control={control} name="passportDocumentNumber" label="International Passport Number" placeholder="Enter international passport number" required maxLength={9} filterType="alphanumeric" /> },
        ...(admissionType !== 'Others' ? [{
            customComponent: (
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1 }}><ControlledDatePicker control={control} name="passportIssueDate" label="Passport Issue Date" required maximumDate={new Date()} /></View>
                    <View style={{ flex: 1 }}><ControlledDatePicker control={control} name="passportExpiryDate" label="Passport Expiry Date" required minimumDate={new Date()} /></View>
                </View>
            ),
        }] : []),
        {
            customComponent: (
                <TouchableOpacity onPress={() => setAdmissionSheetVisible(true)} activeOpacity={0.8}>
                    <View pointerEvents="none">
                        <ControlledInput control={control} name="admissionType" label="Admission Type" placeholder="Select Admission Type" required rightIcon={ArrowDown2} editable={false} />
                    </View>
                </TouchableOpacity>
            ),
        },
        ...(admissionType ? [{
            customComponent: (
                <View style={{ marginTop: moderateScale(16), borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: moderateScale(16), gap: moderateScale(12) }}>
                    <Text style={{ fontSize: moderateScale(14), fontWeight: '700', color: '#0F172A', marginBottom: moderateScale(4) }}>Student Details</Text>
                    <ControlledInput control={control} name="studentName" label="Student Full Name" placeholder="Enter student's full name" required />
                    <ControlledInput control={control} name="studentNin" label="Student NIN (if available)" placeholder="Enter student's NIN" keyboardType="numeric" maxLength={11} filterType="numeric" />
                    <ControlledInput control={control} name="studentPassportNumber" label="Student International Passport Number" placeholder="Enter student's passport number" required maxLength={9} filterType="alphanumeric" />
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <View style={{ flex: 1 }}><ControlledDatePicker control={control} name="studentPassportIssueDate" label="Student Passport Issue Date" required maximumDate={new Date()} /></View>
                        <View style={{ flex: 1 }}><ControlledDatePicker control={control} name="studentPassportExpiryDate" label="Student Passport Expiry Date" required minimumDate={new Date()} /></View>
                    </View>
                </View>
            ),
        }] : []),
    ];

    const handleNext = async () => {
        if (isUploading) {
            showToast('Please wait for files to finish uploading', 'warning');
            return;
        }

        let isStepValid = false;
        if (currentStep === 0) {
            const fields = ['bvn', 'nin', 'formAId', 'passportDocumentNumber', 'passportIssueDate', 'passportExpiryDate', 'admissionType', 'studentName', 'studentPassportNumber', 'studentPassportIssueDate', 'studentPassportExpiryDate'];
            if (watchedFields.studentNIN) fields.push('studentNIN');
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
            const country = (watchedFields.beneficiaryCountry || '').toLowerCase();
            const fields = ['beneficiaryCountry', 'studentName', 'studentPassportNumber', 'schoolName', 'beneficiaryEmail', 'beneficiaryPhone', 'beneficiaryAddress', 'beneficiaryCity', 'beneficiaryState', 'bankName', 'bankAccountName', 'bankAccountAddress', 'bankAccountSwiftCode', 'bankAccountNumber', 'paymentReference', 'correspondenceBankName', 'correspondenceBankAddress', 'correspondenceBankSwiftCode'] as any;
            if (country.includes('australia')) fields.push('bsbCode');
            if (country.includes('united states') || country.includes('usa') || country === 'canada') fields.push('routingNumber');
            if (country.includes('india')) fields.push('ifscCode', 'purposeCode');
            if (country.includes('united kingdom') || country === 'uk') fields.push('bankAccountIban');
            isStepValid = await trigger(fields);
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
        if (currentStep > 0) setCurrentStep(prev => prev - 1);
        else router.back();
    };

    const onSubmit = (data: any) => {
        const payload = buildSchoolPayload(data, docs, currencyGet, isPostGrad);
        submitTransaction(payload);
    };

    const foreignAmount = parseFloat((currencyGet.code !== 'NGN' ? amountGetStr : amountSendStr).replace(/,/g, '')) || 0;
    const isStep2Valid = watchedFields.amount > 0 && foreignAmount <= 10000 && currentRate > 0;
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
                title="School Fees"
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
                        isSchool={true}
                    />
                )}
                {currentStep === 3 && (
                    <SchoolBankDetailsStep
                        control={control}
                        watch={watch}
                        setValue={setValue}
                        errors={errors}
                        verificationFile={docs.bank_verification.file ? { ...docs.bank_verification.file, fileUrl: docs.bank_verification.meta?.fileUrl } : null}
                        onUploadInvoice={() => uploadFile('BANK_VERIFICATION')}
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
                visible={initiateSheetVisible} loading={createTransaction.isPending}
                onClose={() => setInitiateSheetVisible(false)} onConfirm={handleSubmit(onSubmit)}
                title={`Initiate ${admissionType} Transaction request?`}
                limitCurrencySymbol={getCurrencySymbol(currencyGet.code)}
                items={[
                    { title: "Request Summary", description: `You are requesting ${getCurrencySymbol(currencyGet.code)}${amountGetStr} ${currencyGet.code.toUpperCase()}. You will pay approximately ₦${amountSendStr}`, iconType: 'info' },
                    { title: "Maximum Limit", description: `Please note that the maximum you can transact is ${getCurrencySymbol(currencyGet.code)}10,000 per quarter.`, iconType: 'limit' }
                ]}
            />

            <GenericSelectionSheet
                visible={payoutSheetVisible} onClose={() => setPayoutSheetVisible(false)}
                title="Choose a Payout Method" subtitle="Select an option below"
                items={PAYOUT_METHODS_WITHOUT_CASH_SPLIT} selectedItem={watchedFields.payoutMethod}
                onSelect={(item) => { setValue('payoutMethod', item.value); setPayoutSheetVisible(false); }}
                confirmButtonText="Select a Payout Method"
            />

            <GenericSelectionSheet
                visible={admissionSheetVisible} onClose={() => setAdmissionSheetVisible(false)}
                title="Admission Type" subtitle="Select an option below"
                headerIcon={Teacher} headerIconBg="#FFF7ED" headerIconColor="rgba(221, 79, 5, 1)"
                items={ADMISSION_TYPES} selectedItem={admissionType}
                onSelect={(item) => { setValue('admissionType', item.value); setAdmissionSheetVisible(false); }}
                confirmButtonText="Select Admission Type"
            />
        </View>
    );
}
