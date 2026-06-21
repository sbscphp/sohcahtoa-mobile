import ControlledDatePicker from '@/components/ControlledDatePicker';
import ControlledInput from '@/components/ControlledInput';
import GenericSelectionSheet, { SelectionItem } from '@/components/GenericSelectionSheet';
import InitiateTransactionSheet from '@/components/InitiateTransactionSheet';
import LoadingBackdrop from '@/components/LoadingBackdrop';
import SourceOfFundsSheet from '@/components/SourceOfFundsSheet';
// import AddNewAccountStep from '@/components/transaction-flow/AddNewAccountStep';
import CredentialStep from '@/components/transaction-flow/CredentialStep';
import DocumentStep from '@/components/transaction-flow/DocumentStep';
import ExchangeStep from '@/components/transaction-flow/ExchangeStep';
// import PayoutMethodStep from '@/components/transaction-flow/PayoutMethodStep';
import SchoolBankDetailsStep from '@/components/transaction-flow/SchoolBankDetailsStep';
import TransactionLayout from '@/components/transaction-flow/TransactionLayout';
import { useProfileQuery } from '@/hooks/queries/auth/useProfileQuery';
import { useGetBanksQuery } from '@/hooks/queries/banks/useGetBanksQuery';
import { useGetSavedAccountsQuery } from '@/hooks/queries/banks/useGetSavedAccountsQuery';
import { useLookupAccountMutation } from '@/hooks/queries/banks/useResolveAccountMutation';
import { useSaveAccountMutation } from '@/hooks/queries/banks/useSaveAccountMutation';
import { useCreateTransactionMutation } from '@/hooks/queries/transactions/useCreateTransactionMutation';
import { useGetTransactionsQuery } from '@/hooks/queries/transactions/useGetTransactionsQuery';
import { UploadedFile, UploadedMetadata, useDocumentUpload } from '@/hooks/useDocumentUpload';
import { useExchangeLogic } from '@/hooks/useExchangeLogic';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToastStore } from '@/stores/useToastStore';
import { schoolStep0Schema, schoolStep2Schema, schoolStep3Schema } from '@/utils/validations/school';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { ArrowDown2, Teacher } from 'iconsax-react-nativejs';
import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { TouchableOpacity, View } from 'react-native';
import { z } from 'zod';

const ADMISSION_TYPES: SelectionItem[] = [
    { id: '1', label: 'Undergraduate', value: 'Undergraduate', icon: Teacher },
    { id: '2', label: 'Post-Graduate', value: 'Post-Graduate', icon: Teacher },
    { id: '3', label: 'Others (high school, pre-school etc)', value: 'Others', icon: Teacher },

];

const PAYOUT_METHODS: SelectionItem[] = [
    { id: '1', label: 'Electronic Transfer (100%)', value: 'Electronic Transfer (100%)' },
    { id: '2', label: 'Card (100%)', value: 'Card (100%)' },
    { id: '3', label: 'Card (75%) + Cash (25%)', value: 'Card (75%) + Cash (25%)', description: 'Maximum amount to be collected as cash is $500' },
];

const formatDateToPickerFormat = (dateStr: string | undefined | null): string => {
    if (!dateStr) return '';
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        return dateStr;
    }

    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                if (parts[0].length === 4) {
                    return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
                }
                if (parts[2].length === 4) {
                    return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[2]}`;
                }
            }
            return '';
        }
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    } catch (e) {
        return '';
    }
};

export default function SchoolFeesScreen() {
    const router = useRouter();
    const createTransaction = useCreateTransactionMutation();
    const showToast = useToastStore(s => s.showToast);
    useProfileQuery();
    const user = useAuthStore(s => s.user);
    const { data: transactionsResponse } = useGetTransactionsQuery();
    const transactions = transactionsResponse?.pages?.flatMap(p => p.data) || [];

    const [currentStep, setCurrentStep] = useState(0);
    const [initiateSheetVisible, setInitiateSheetVisible] = useState(false);
    const [admissionSheetVisible, setAdmissionSheetVisible] = useState(false);
    const [showSourceOfFundsSheet, setShowSourceOfFundsSheet] = useState(false);
    const [initials, setInitials] = useState('');
    const [payoutSheetVisible, setPayoutSheetVisible] = useState(false);
    const [selectedSavedAccountId, setSelectedSavedAccountId] = useState<string | null>('');
    const [isAddingNewAccount, setIsAddingNewAccount] = useState(false);

    const resolver = (data: any, context: any, options: any) => {
        const isPostGrad = data.admissionType === 'Post-Graduate';
        const dynamicSchema = schoolStep0Schema
            .merge(schoolStep2Schema(isPostGrad))
            .merge(schoolStep3Schema)
            .superRefine((data, ctx) => {
                if (data.passportIssueDate && data.passportExpiryDate && data.passportIssueDate === data.passportExpiryDate) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: 'Passport Expiry Date cannot be the same as Passport Issue Date',
                        path: ['passportExpiryDate']
                    });
                }
            });
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
            nin: '',
            formAId: '',
            passportDocumentNumber: '',
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
            bankName: '',
            beneficiaryCountry: '',
            beneficiaryAddress: '',
            beneficiaryCity: '',
            beneficiaryState: '',
            beneficiaryEmail: '',
            paymentReference: '',
            routingNumber: '',
            ifscCode: '',
            purposeCode: '',
            bsbCode: '',
            correspondenceBankName: '',
            correspondenceBankAddress: '',
            correspondenceBankSwiftCode: '',
            payoutMethod: '',
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


    const { data: banksResponse } = useGetBanksQuery();
    const banks = useMemo(() =>
        (banksResponse?.data || []).map(b => ({ id: b.code, label: b.name, value: b.code })),
        [banksResponse]);

    const { data: savedAccountsResponse } = useGetSavedAccountsQuery();
    const savedAccounts = React.useMemo(() => {
        return (savedAccountsResponse?.data || []).map(a => {
            const clean = (str: string) => {
                return (str || '')
                    .toLowerCase()
                    .replace(/\b(plc|limited|ltd|bank|microfinance|mgb|mfd)\b/g, '')
                    .replace(/[^a-z0-9]/g, '')
                    .trim();
            };
            const cleanedTarget = clean(a.bankName);
            const foundBank = (banksResponse?.data || []).find(b => {
                const cleanedBank = clean(b.name);
                return cleanedBank === cleanedTarget || cleanedBank.includes(cleanedTarget) || cleanedTarget.includes(cleanedBank);
            });
            return {
                id: a.id,
                bankName: a.bankName,
                accountNumber: a.accountNumber,
                accountName: a.accountName,
                bankCode: foundBank?.code || ''
            };
        });
    }, [savedAccountsResponse, banksResponse]);

    const saveAccountMutation = useSaveAccountMutation();

    const resolveAccount = useLookupAccountMutation();

    React.useEffect(() => {
        if (!isAddingNewAccount) return;
        if (watchedFields.customerAccountNumber?.length === 10 && watchedFields.customerBankCode) {
            resolveAccount.mutate({
                accountNumber: watchedFields.customerAccountNumber,
                bankName: watchedFields.customerBankName
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
    }, [watchedFields.customerAccountNumber, watchedFields.customerBankCode, isAddingNewAccount]);

    React.useEffect(() => {
        if (transactions && transactions.length > 0) {
            let foundNin = '';
            let foundPassportNumber = '';
            let foundPassportIssueDate = '';
            let foundPassportExpiryDate = '';

            for (const tx of transactions) {
                const ninVal = tx.personalInfo?.nin || (tx as any).nin;
                const passportVal = tx.personalInfo?.passportDocumentNumber || tx.personalInfo?.passportDocumentNumber || (tx as any).passportDocumentNumber;
                const issueDateVal = tx.personalInfo?.passportIssueDate;
                const expiryDateVal = tx.personalInfo?.passportExpiryDate;

                if (!foundNin && ninVal) {
                    foundNin = String(ninVal);
                }
                if (!foundPassportNumber && passportVal) {
                    foundPassportNumber = String(passportVal);
                }
                if (!foundPassportIssueDate && issueDateVal) {
                    foundPassportIssueDate = String(issueDateVal);
                }
                if (!foundPassportExpiryDate && expiryDateVal) {
                    foundPassportExpiryDate = String(expiryDateVal);
                }

                if (foundNin && foundPassportNumber && foundPassportIssueDate && foundPassportExpiryDate) {
                    break;
                }
            }

            const profilePassportNumber = user?.kyc?.passportDocumentNumber || '';
            const profileNin = (user?.kyc as any)?.nin || (user as any)?.nin || '';

            const finalNin = foundNin || profileNin;
            const finalPassportNumber = foundPassportNumber || profilePassportNumber;

            if (finalNin && !watchedFields.nin) {
                setValue('nin', finalNin, { shouldValidate: true, shouldDirty: true });
            }
            if (finalPassportNumber && !watchedFields.passportDocumentNumber) {
                setValue('passportDocumentNumber', finalPassportNumber, { shouldValidate: true, shouldDirty: true });
            }
            if (foundPassportIssueDate && !watchedFields.passportIssueDate) {
                setValue('passportIssueDate', formatDateToPickerFormat(foundPassportIssueDate), { shouldValidate: true, shouldDirty: true });
            }
            if (foundPassportExpiryDate && !watchedFields.passportExpiryDate) {
                setValue('passportExpiryDate', formatDateToPickerFormat(foundPassportExpiryDate), { shouldValidate: true, shouldDirty: true });
            }
        } else {
            const profilePassportNumber = user?.kyc?.passportDocumentNumber || '';
            const profileNin = (user?.kyc as any)?.nin || (user as any)?.nin || '';

            if (profileNin && !watchedFields.nin) {
                setValue('nin', profileNin, { shouldValidate: true, shouldDirty: true });
            }
            if (profilePassportNumber && !watchedFields.passportDocumentNumber) {
                setValue('passportDocumentNumber', profilePassportNumber, { shouldValidate: true, shouldDirty: true });
            }
        }
    }, [transactions, user, setValue, watchedFields.nin, watchedFields.passportDocumentNumber, watchedFields.passportIssueDate, watchedFields.passportExpiryDate]);

    const credentialFields = [
        { customComponent: <ControlledInput control={control} name="studentName" label="Student Name" placeholder="Enter student name" required /> },
        { customComponent: <ControlledInput control={control} name="nin" label="National Identification Number(NIN)" placeholder="Enter your NIN" keyboardType="numeric" maxLength={11} filterType="numeric" disabled /> },
        { customComponent: <ControlledInput control={control} name="formAId" label="Form A ID" placeholder="Enter Form A ID" required /> },
        { customComponent: <ControlledInput control={control} name="passportDocumentNumber" label="International Passport" placeholder="Enter international passport" required maxLength={9} filterType="alphanumeric" /> },
        ...(admissionType !== 'Others' ? [
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
            }
        ] : []),
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
            required: true,
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
        {
            label: 'International Passport',
            onUpload: () => uploadFile('PASSPORT'),
            fileName: docs.passport.file?.name,
            fileUri: docs.passport.file?.uri, fileUrl: docs.passport.meta?.fileUrl,
            fileType: docs.passport.file?.type,
            required: true,
        },
    ];

    const othersDocuments = [
        {
            label: 'International Passport',
            onUpload: () => uploadFile('PASSPORT'),
            fileName: docs.passport.file?.name,
            fileUri: docs.passport.file?.uri, fileUrl: docs.passport.meta?.fileUrl,
            fileType: docs.passport.file?.type,
            required: true,
            associatedInputs: (
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
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
            label: 'Evidence of Enrollment',
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
    ];

    const documentFields = admissionType === 'Others'
        ? othersDocuments
        : isPostGrad
            ? postgraduateDocuments
            : undergraduateDocuments;

    const handleSaveNewAccount = async () => {
        const isValid = await trigger([
            'customerBankName',
            'customerBankCode',
            'customerAccountNumber',
            'customerAccountName'
        ]);

        if (isValid) {
            saveAccountMutation.mutate({
                bankName: watchedFields.customerBankName || '',
                accountNumber: watchedFields.customerAccountNumber || '',
                accountName: watchedFields.customerAccountName || '',
            }, {
                onSuccess: (res) => {
                    if (res.data?.id) {
                        setSelectedSavedAccountId(res.data.id);
                    }
                    setIsAddingNewAccount(false);
                }
            });
        }
    };

    const handleNext = async () => {
        if (isUploading) {
            showToast('Please wait for files to finish uploading', 'warning');
            return;
        }

        let isStepValid = false;
        if (currentStep === 0) {
            const fieldsToTrigger = ['studentName', 'nin', 'formAId', 'passportDocumentNumber', 'admissionType'];
            if (watchedFields.admissionType !== 'Others') {
                fieldsToTrigger.push('passportIssueDate', 'passportExpiryDate');
            }
            isStepValid = await trigger(fieldsToTrigger as any);
        } else if (currentStep === 1) {
            const hasRequiredUgDocs = docs.admission.file && docs.passport.file && docs.invoice.file;
            const hasRequiredPgDocs = docs.admission.file && docs.degree.file && docs.result.file && docs.passport.file && docs.invoice.file;

            if (watchedFields.admissionType === 'Others') {
                const hasRequiredOthersDocs = docs.passport.file && docs.admission.file && docs.invoice.file;
                if (!hasRequiredOthersDocs) {
                    showToast('Please upload all required documents', 'error');
                    return;
                }
                isStepValid = await trigger(['passportIssueDate', 'passportExpiryDate']);
            } else if (isPostGrad) {
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
            isStepValid = await trigger([
                'beneficiaryCountry',
                'studentName',
                'studentPassportNumber',
                'bankAccountName',
                'bankAccountAddress',
                'bankAccountIban',
                'bankAccountSwiftCode',
                'bankAccountNumber',
                'correspondenceBankName',
                'correspondenceBankAddress',
                'correspondenceBankSwiftCode',
            ] as any);
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

    const onSubmit = (data: any) => {
        const payload = {
            type: 'SCHOOL_FEES',
            currency: currencyGet.code,
            amount: data.amount,
            purpose: `Pay School Fees`,
            destinationCountry: currencyGet.country,
            bvn: user?.kyc?.bvn,
            nin: data.nin,
            formAId: data.formAId,
            admissionType: data.admissionType,
            passportDocumentNumber: data.passportDocumentNumber,
            passportIssueDate: data.passportIssueDate,
            passportExpiryDate: data.passportExpiryDate,
            documents: [
                ...(docs.admission.meta ? [docs.admission.meta] : []),
                ...(docs.invoice.meta ? [docs.invoice.meta] : []),
                ...(docs.passport.meta ? [docs.passport.meta] : []),
                ...(isPostGrad && docs.degree.meta ? [docs.degree.meta] : []),
                ...(isPostGrad && docs.result.meta ? [docs.result.meta] : []),
            ],
            beneficiaryDetails: {
                organizationName: '',
                studentName: data.studentName,
                studentPassportNumber: data.studentPassportNumber,
                bankAccountName: data.bankAccountName,
                bankAccountAddress: data.bankAccountAddress,
                bankAccountIban: data.bankAccountIban,
                bankAccountSwiftCode: data.bankAccountSwiftCode,
                bankAccountNumber: data.bankAccountNumber,
                bankName: data.bankName,
                country: data.beneficiaryCountry,
                address: data.beneficiaryAddress,
                email: data.beneficiaryEmail || '',
                city: data.beneficiaryCity || '',
                state: data.beneficiaryState || '',
                paymentReference: data.paymentReference,
                routingNumber: data.routingNumber,
                ifscCode: data.ifscCode,
                purposeCode: data.purposeCode,
                bsbCode: data.bsbCode,
                correspondenceBankName: data.correspondenceBankName,
                correspondenceBankAddress: data.correspondenceBankAddress,
                correspondenceBankSwiftCode: data.correspondenceBankSwiftCode,
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


    const isStep0Valid = watchedFields.studentName && watchedFields.formAId && watchedFields.passportDocumentNumber && watchedFields.admissionType && (watchedFields.admissionType === 'Others' || (watchedFields.passportIssueDate && watchedFields.passportExpiryDate));

    let isStep1Valid = false;
    if (watchedFields.admissionType === 'Post-Graduate') {
        isStep1Valid = !!(docs.admission.meta && docs.degree.meta && docs.result.meta && docs.passport.meta && docs.invoice.meta);
    } else if (watchedFields.admissionType === 'Others') {
        isStep1Valid = !!(docs.admission.meta && docs.passport.meta && docs.invoice.meta && watchedFields.passportIssueDate && watchedFields.passportExpiryDate);
    } else {
        isStep1Valid = !!(docs.admission.meta && docs.passport.meta && docs.invoice.meta);
    }

    const isStep2Valid = watchedFields.amount > 0;
    const isStep3Valid = !!(
        watchedFields.beneficiaryCountry &&
        watchedFields.studentName &&
        watchedFields.bankAccountName &&
        watchedFields.bankAccountAddress &&
        watchedFields.bankAccountSwiftCode &&
        watchedFields.bankAccountNumber
    );

    const isNextDisabled =
        (currentStep === 0 && !isStep0Valid) ||
        (currentStep === 1 && !isStep1Valid) ||
        (currentStep === 2 && !isStep2Valid) ||
        (currentStep === 3 && !isStep3Valid);

    return (
        <View style={{ flex: 1 }}>
            <LoadingBackdrop visible={isUploading || createTransaction.isPending} />
            <TransactionLayout
                title="School Fees"
                currentStep={currentStep}
                totalSteps={4}
                onBack={handleBack}
                onNext={handleNext}
                isNextDisabled={isNextDisabled}
                nextLabel={currentStep === 3 ? (watchedFields.bankAccountName && watchedFields.bankAccountNumber ? "Initiate Transaction Request" : "Continue") : "Continue"}
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
                        onLimitWarningPress={() => router.push('/proof-of-fund')}
                    />
                )}

                {currentStep === 3 && (
                    <SchoolBankDetailsStep control={control} watch={watch} setValue={setValue} errors={errors} />
                )}

                <InitiateTransactionSheet
                    visible={initiateSheetVisible}
                    loading={createTransaction.isPending}
                    onClose={() => setInitiateSheetVisible(false)}
                    onConfirm={handleSubmit(onSubmit)}
                    title={`Initiate ${admissionType} Transaction request?`}
                    items={[
                        {
                            title: "Request Summary",
                            description: `You are requesting ${currencyGet.code === 'USD' ? '$' : currencyGet.code === 'GBP' ? '£' : currencyGet.code === 'EUR' ? '€' : ''}${amountGetStr} ${currencyGet.code.toUpperCase()}. You will be sent approximately ₦${amountSendStr}`,
                            iconType: 'info'
                        },
                        {
                            title: "Maximum Limit",
                            description: "Please note that the maximum you can transact is $10,000 per quarter.",
                            iconType: 'limit'
                        }
                    ]}
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
                        // console.log('Source of Funds Declaration Submitted');
                    }}
                    customerInfo={{
                        fullName: `${user?.profile?.firstName || ''} ${user?.profile?.lastName || ''}`,
                        phoneNumber: user?.phoneNumber || '',
                        email: user?.email || '',
                        bvn: user?.kyc?.bvn || '',
                        address: user?.profile?.address || '',
                        passportDocumentNumber: watchedFields.passportDocumentNumber || user?.kyc?.passportDocumentNumber || ''
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
                    initials={initials}
                    onChangeInitials={setInitials}
                />
            </TransactionLayout>
        </View>
    );
}
