import ControlledDatePicker from '@/components/ControlledDatePicker';
import ControlledInput from '@/components/ControlledInput';
import GenericSelectionSheet, { SelectionItem } from '@/components/GenericSelectionSheet';
import InitiateTransactionSheet from '@/components/InitiateTransactionSheet';
import LoadingBackdrop from '@/components/LoadingBackdrop';
import SchoolBankDetailsStep from '@/components/transaction-flow/SchoolBankDetailsStep';
import SourceOfFundsSheet from '@/components/SourceOfFundsSheet';
import CredentialStep from '@/components/transaction-flow/CredentialStep';
import DocumentStep from '@/components/transaction-flow/DocumentStep';
import ExchangeStep from '@/components/transaction-flow/ExchangeStep';
import CustomerBankDetailsStep from '@/components/transaction-flow/CustomerBankDetailsStep';
import TransactionLayout from '@/components/transaction-flow/TransactionLayout';
import { useCreateTransactionMutation } from '@/hooks/queries/transactions/useCreateTransactionMutation';
import { useProfileQuery } from '@/hooks/queries/auth/useProfileQuery';
import { UploadedFile, UploadedMetadata, useDocumentUpload } from '@/hooks/useDocumentUpload';
import { useExchangeLogic } from '@/hooks/useExchangeLogic';
import { useGetBanksQuery } from '@/hooks/queries/banks/useGetBanksQuery';
import { useResolveAccountMutation } from '@/hooks/queries/banks/useResolveAccountMutation';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToastStore } from '@/stores/useToastStore';
import { schoolStep0Schema, schoolStep2Schema, schoolStep3Schema } from '@/utils/validations/school';
import { customerBankDetailsStepSchema } from '@/utils/validations/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { ArrowDown2, Teacher } from 'iconsax-react-nativejs';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { TouchableOpacity, View } from 'react-native';

const ADMISSION_TYPES: SelectionItem[] = [
    { id: '1', label: 'Undergraduate', value: 'Undergraduate', icon: Teacher },
    { id: '2', label: 'Post-Graduate', value: 'Post-Graduate', icon: Teacher },
    { id: '3', label: 'Others (high school, pre-school etc)', value: 'Others', icon: Teacher },

];

export default function SchoolFeesScreen() {
    const router = useRouter();
    const createTransaction = useCreateTransactionMutation();
    const showToast = useToastStore(s => s.showToast);
    useProfileQuery();
    const user = useAuthStore(s => s.user);

    const [currentStep, setCurrentStep] = useState(0);
    const [initiateSheetVisible, setInitiateSheetVisible] = useState(false);
    const [admissionSheetVisible, setAdmissionSheetVisible] = useState(false);
    const [showSourceOfFundsSheet, setShowSourceOfFundsSheet] = useState(false);

    const resolver = (data: any, context: any, options: any) => {
        const isPostGrad = data.admissionType === 'Post-Graduate';
        const dynamicSchema = schoolStep0Schema
            .merge(schoolStep2Schema(isPostGrad))
            .merge(customerBankDetailsStepSchema)
            .merge(schoolStep3Schema);
        return zodResolver(dynamicSchema)(data, context, options);
    };

    const {
        control,
        handleSubmit,
        trigger,
        watch,
        setValue,
        formState: { errors }
    } = useForm({
        resolver,
        defaultValues: {
            bvn: user?.kyc?.bvn || '',
            nin: '',
            formAId: '',
            passportNumber: '',
            admissionType: '',
            passportIssueDate: '',
            passportExpiryDate: '',
            amount: 0,
            studentName: '',
            studentPassportNumber: '',
            bankAccountName: '',
            bankAccountAddress: '',
            bankAccountIban: '',
            bankAccountSwiftCode: '',
            bankAccountNumber: '',
            correspondenceBankName: '',
            correspondenceBankAddress: '',
            correspondenceBankSwiftCode: '',
            customerBankName: '',
            customerBankCode: '',
            customerAccountNumber: '',
            customerAccountName: '',
        },
        mode: 'onChange'
    });

    const admissionType = watch('admissionType');
    const isPostGrad = admissionType === 'Post-Graduate';

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
    } = useExchangeLogic({ setValue, initialAmount: '0', maxLimit: 10000 });

    // Document upload state
    const [docs, setDocs] = useState({
        admission: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
        invoice: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
        passport: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
        result: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
        degree: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
        signature: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
    });

    const updateDoc = (key: keyof typeof docs, file: UploadedFile, metadata: UploadedMetadata) => {
        setDocs(prev => ({ ...prev, [key]: { file, meta: metadata } }));
    };

    const { upload: uploadFile, isPending: isUploading } = useDocumentUpload({
        onSuccess: (documentType, { file, metadata }) => {
            if (documentType === 'SCHOOL_ADMISSION') updateDoc('admission', file, metadata);
            else if (documentType === 'INVOICE') updateDoc('invoice', file, metadata);
            else if (documentType === 'PASSPORT') updateDoc('passport', file, metadata);
            else if (documentType === 'RECEIPT') updateDoc('result', file, metadata);
            else if (documentType === 'MEMBERSHIP_CARD') updateDoc('degree', file, metadata);
            else if (documentType === 'DIGITAL_SIGNATURE') updateDoc('signature', file, metadata);
        },
        onError: () => showToast('Failed to upload document. Please try again.', 'error'),
    });

    const watchedFields = watch() as any;

    // Banks and Account Resolution
    const { data: banksResponse } = useGetBanksQuery();
    const banks = React.useMemo(() => 
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

    const credentialFields = [
        { customComponent: <ControlledInput control={control} name="bvn" label="Bank Verification Number(BVN)" placeholder="Enter your BVN" required keyboardType="numeric" maxLength={11} filterType="numeric" disabled /> },
        { customComponent: <ControlledInput control={control} name="nin" label="National Identification Number(NIN)" placeholder="Enter your NIN" required keyboardType="numeric" maxLength={11} filterType="numeric" /> },
        { customComponent: <ControlledInput control={control} name="formAId" label="Form A ID" placeholder="Enter Form A ID" required /> },
        { customComponent: <ControlledInput control={control} name="passportNumber" label="International Passport" placeholder="Enter international passport" required maxLength={9} filterType="alphanumeric" /> },
        {
            customComponent: (
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
            customComponent: (
                <TouchableOpacity onPress={() => setAdmissionSheetVisible(true)} activeOpacity={0.8}>
                    <View pointerEvents="none">
                        <ControlledInput control={control} name="admissionType" label="Admission Type" placeholder="Select Admission Type" required rightIcon={ArrowDown2} editable={false} />
                    </View>
                </TouchableOpacity>
            )
        },
    ];

    const undergraduateDocuments = [
        {
            label: 'Evidence of Admission',
            onUpload: () => uploadFile('SCHOOL_ADMISSION'),
            fileName: docs.admission.file?.name,
            fileUri: docs.admission.file?.uri, fileUrl: docs.admission.meta?.fileUrl,
            fileType: docs.admission.file?.type,
            required: true,
        },
        {
            label: 'School Invoice',
            onUpload: () => uploadFile('INVOICE'),
            fileName: docs.invoice.file?.name,
            fileUri: docs.invoice.file?.uri, fileUrl: docs.invoice.meta?.fileUrl,
            fileType: docs.invoice.file?.type,
            required: true
        },
        {
            label: 'International Passport',
            onUpload: () => uploadFile('PASSPORT'),
            fileName: docs.passport.file?.name,
            fileUri: docs.passport.file?.uri, fileUrl: docs.passport.meta?.fileUrl,
            fileType: docs.passport.file?.type,
            required: true,
        },
    ];

    const postgraduateDocuments = [
        {
            label: 'Evidence of Admission',
            onUpload: () => uploadFile('SCHOOL_ADMISSION'),
            fileName: docs.admission.file?.name,
            fileUri: docs.admission.file?.uri, fileUrl: docs.admission.meta?.fileUrl,
            fileType: docs.admission.file?.type,
            required: true,
        },
        {
            label: 'School Invoice',
            onUpload: () => uploadFile('INVOICE'),
            fileName: docs.invoice.file?.name,
            fileUri: docs.invoice.file?.uri, fileUrl: docs.invoice.meta?.fileUrl,
            fileType: docs.invoice.file?.type,
            required: true,
        },
        {
            label: 'First Degree Certificate',
            onUpload: () => uploadFile('MEMBERSHIP_CARD'),
            fileName: docs.degree.file?.name,
            fileUri: docs.degree.file?.uri, fileUrl: docs.degree.meta?.fileUrl,
            fileType: docs.degree.file?.type,
            required: true,
        },
        {
            label: 'Statement Of Result',
            onUpload: () => uploadFile('RECEIPT'),
            fileName: docs.result.file?.name,
            fileUri: docs.result.file?.uri, fileUrl: docs.result.meta?.fileUrl,
            fileType: docs.result.file?.type,
            required: true,
        },
    ];

    const documentFields = isPostGrad ? postgraduateDocuments : undergraduateDocuments;

    const handleNext = async () => {
        if (isUploading) {
            showToast('Please wait for files to finish uploading', 'warning');
            return;
        }

        let isStepValid = false;
        if (currentStep === 0) {
            isStepValid = await trigger(['bvn', 'nin', 'formAId', 'passportNumber', 'passportIssueDate', 'passportExpiryDate', 'admissionType']);
        } else if (currentStep === 1) {
            const hasRequiredUgDocs = docs.admission.file && docs.invoice.file && docs.passport.file;
            const hasRequiredPgDocs = docs.admission.file && docs.invoice.file && docs.degree.file && docs.result.file;

            if (isPostGrad) {
                if (!hasRequiredPgDocs) {
                    showToast('Please upload all required documents', 'error');
                    return;
                }
                isStepValid = true;
            } else {
                if (!hasRequiredUgDocs) {
                    showToast('Please upload all required documents', 'error');
                    return;
                }
                isStepValid = true;
            }
        } else if (currentStep === 2) {
            isStepValid = await trigger(['amount']);
        } else if (currentStep === 3) {
            isStepValid = await trigger(['customerBankName', 'customerAccountNumber', 'customerAccountName']);
        } else if (currentStep === 4) {
            isStepValid = await trigger([
                'studentName', 
                'studentPassportNumber', 
                'bankAccountName', 
                'bankAccountAddress', 
                'bankAccountIban', 
                'bankAccountSwiftCode', 
                'bankAccountNumber', 
                'correspondenceBankName', 
                'correspondenceBankAddress', 
                'correspondenceBankSwiftCode'
            ]);
        }

        if (isStepValid) {
            if (currentStep < 4) {
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

    const onSubmit = (data: any) => {
        const payload = {
            type: 'SCHOOL_FEES',
            currency: currencyGet.code,
            amount: data.amount,
            purpose: `Pay School Fees`,
            destinationCountry: currencyGet.country,
            bvn: data.bvn,
            nin: data.nin,
            formAId: data.formAId,
            admissionType: data.admissionType,
            passportNumber: data.passportNumber,
            passportIssueDate: data.passportIssueDate,
            passportExpiryDate: data.passportExpiryDate,
            documents: isPostGrad ? [
                ...(docs.admission.meta ? [docs.admission.meta] : []),
                ...(docs.invoice.meta ? [docs.invoice.meta] : []),
                ...(docs.degree.meta ? [docs.degree.meta] : []),
                ...(docs.result.meta ? [docs.result.meta] : []),
            ] : [
                ...(docs.admission.meta ? [docs.admission.meta] : []),
                ...(docs.invoice.meta ? [docs.invoice.meta] : []),
                ...(docs.passport.meta ? [docs.passport.meta] : []),
            ],
            beneficiaryDetails: {
                studentName: data.studentName,
                studentPassportNumber: data.studentPassportNumber,
                bankAccountName: data.bankAccountName,
                bankAccountAddress: data.bankAccountAddress,
                bankAccountIban: data.bankAccountIban,
                bankAccountSwiftCode: data.bankAccountSwiftCode,
                bankAccountNumber: data.bankAccountNumber,
                correspondenceBankName: data.correspondenceBankName,
                correspondenceBankAddress: data.correspondenceBankAddress,
                correspondenceBankSwiftCode: data.correspondenceBankSwiftCode,
            },
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
                        pathname: '/(buy-fx)/(school)/request-initiated-success',
                        params: {
                            transactionId: response.data.transactionId,
                        },
                    });

                }
            },
        });
    };


    const isStep0Valid = watchedFields.bvn && watchedFields.nin && watchedFields.formAId && watchedFields.passportNumber && watchedFields.passportIssueDate && watchedFields.passportExpiryDate && watchedFields.admissionType;

    let isStep1Valid = false;
    if (watchedFields.admissionType === 'Post-Graduate') {
        isStep1Valid = !!(docs.admission.meta && docs.invoice.meta && docs.degree.meta && docs.result.meta);
    } else {
        isStep1Valid = !!(docs.admission.meta && docs.invoice.meta && docs.passport.meta);
    }

    const isStep2Valid = watchedFields.amount > 0;
    const isStep3Valid = watchedFields.customerBankName && watchedFields.customerAccountNumber && watchedFields.customerAccountName;
    const isStep4Valid = !!(
        watchedFields.studentName && 
        watchedFields.studentPassportNumber && 
        watchedFields.bankAccountName && 
        watchedFields.bankAccountAddress && 
        watchedFields.bankAccountIban && 
        watchedFields.bankAccountSwiftCode && 
        watchedFields.bankAccountNumber && 
        watchedFields.correspondenceBankName && 
        watchedFields.correspondenceBankAddress && 
        watchedFields.correspondenceBankSwiftCode
    );

    const isNextDisabled =
        (currentStep === 0 && !isStep0Valid) ||
        (currentStep === 1 && !isStep1Valid) ||
        (currentStep === 2 && !isStep2Valid) ||
        (currentStep === 3 && !isStep3Valid) ||
        (currentStep === 4 && !isStep4Valid);

    return (
        <View style={{ flex: 1 }}>
            <LoadingBackdrop visible={isUploading} />
            <TransactionLayout
                title="School Fees"
                currentStep={currentStep}
                totalSteps={5}
                onBack={handleBack}
                onNext={handleNext}
                isNextDisabled={isNextDisabled}
                nextLabel={currentStep === 4 ? (watchedFields.bankAccountName && watchedFields.bankAccountNumber ? "Initiate Transaction Request" : "Continue") : "Continue"}
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
                        error={errors.amount?.message as string | undefined}
                        showLimitWarning
                        onLimitWarningPress={() => setShowSourceOfFundsSheet(true)}
                    />
                )}

                {currentStep === 3 && (
                    <CustomerBankDetailsStep
                        control={control}
                        setValue={setValue}
                        banks={banks}
                        resolvedAccountName={watchedFields.customerAccountName}
                        isResolving={resolveAccount.isPending}
                    />
                )}

                {currentStep === 4 && (
                    <SchoolBankDetailsStep control={control} />
                )}

                <InitiateTransactionSheet
                    visible={initiateSheetVisible}
                    loading={createTransaction.isPending}
                    onClose={() => setInitiateSheetVisible(false)}
                    onConfirm={handleSubmit(onSubmit)}
                    title={`Initiate ${admissionType} Transaction request?`}
                    items={[
                        {
                            title: "",
                            description: "Please note that the maximum you can transact is $10,000 per quarter.",
                            iconType: 'limit'
                        }
                    ]}
                />

                <GenericSelectionSheet
                    visible={admissionSheetVisible}
                    onClose={() => setAdmissionSheetVisible(false)}
                    title="Admission Type"
                    subtitle="Select an option below"
                    headerIcon={Teacher}
                    headerIconBg="#FFF7ED"
                    headerIconColor="rgba(221, 79, 5, 1)"
                    items={ADMISSION_TYPES}
                    selectedItem={admissionType}
                    onSelect={(item) => {
                        setValue('admissionType', item.value);
                        setAdmissionSheetVisible(false);
                    }}
                    confirmButtonText="Select Admission Type"
                />

                <SourceOfFundsSheet
                    visible={showSourceOfFundsSheet}
                    onClose={() => setShowSourceOfFundsSheet(false)}
                    onSubmit={() => {
                        setShowSourceOfFundsSheet(false);
                        console.log('Source of Funds Declaration Submitted');
                    }}
                    customerInfo={{
                        fullName: `${user?.profile?.firstName || ''} ${user?.profile?.lastName || ''}`,
                        phoneNumber: user?.phoneNumber || '',
                        email: user?.email || '',
                        bvn: user?.kyc?.bvn || '',
                        address: user?.profile?.address || '',
                        passportNumber: watchedFields.passportNumber || user?.kyc?.passportNumber || ''
                    }}
                    transactionDetails={{
                        type: 'School Fees',
                        currency: currencyGet.currencyName,
                        amount: `${currencyGet.code} ${amountGetStr}`,
                        purpose: 'Pay School Fees'
                    }}
                    onUploadSignature={() => uploadFile('DIGITAL_SIGNATURE')}
                    signatureFile={docs.signature.file?.name}
                    isUploadingSignature={isUploading}
                />
            </TransactionLayout>
        </View>
    );
}
