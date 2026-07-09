import ControlledDatePicker from '@/components/ControlledDatePicker';
import ControlledInput from '@/components/ControlledInput';
import GenericSelectionSheet, { SelectionItem } from '@/components/GenericSelectionSheet';
import InitiateTransactionSheet from '@/components/InitiateTransactionSheet';
import LoadingBackdrop from '@/components/LoadingBackdrop';
import AddNewAccountStep from '@/components/transaction-flow/AddNewAccountStep';
import CredentialStep from '@/components/transaction-flow/CredentialStep';
import DocumentStep from '@/components/transaction-flow/DocumentStep';
import ExchangeStep from '@/components/transaction-flow/ExchangeStep';
import SchoolBankDetailsStep from '@/components/transaction-flow/SchoolBankDetailsStep';
import TransactionLayout from '@/components/transaction-flow/TransactionLayout';
import RefundBankDetailsStep from '@/components/transaction-flow/RefundBankDetailsStep';
import { useProfileQuery } from '@/hooks/queries/auth/useProfileQuery';
import { useGetBanksQuery } from '@/hooks/queries/banks/useGetBanksQuery';
import { useGetSavedAccountsQuery } from '@/hooks/queries/banks/useGetSavedAccountsQuery';
import { useLookupAccountMutation } from '@/hooks/queries/banks/useResolveAccountMutation';
import { useSaveAccountMutation } from '@/hooks/queries/banks/useSaveAccountMutation';
import { useCreateTransactionMutation } from '@/hooks/queries/transactions/useCreateTransactionMutation';
import { useAttachBankAccountsMutation } from '@/hooks/queries/transactions/useAttachBankAccountsMutation';
import { useGetTransactionsQuery } from '@/hooks/queries/transactions/useGetTransactionsQuery';
import { UploadedFile, UploadedMetadata, useDocumentUpload } from '@/hooks/useDocumentUpload';
import { useExchangeLogic } from '@/hooks/useExchangeLogic';
import { useAuthStore } from '@/stores/useAuthStore';
import { useToastStore } from '@/stores/useToastStore';
import { schoolStep0Schema, schoolStep2Schema, schoolStep3Schema } from '@/utils/validations/school';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { ArrowDown2, Teacher } from 'iconsax-react-nativejs';
import React, { useMemo, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { TouchableOpacity, View, Text } from 'react-native';
import { moderateScale } from 'react-native-size-matters';


const ADMISSION_TYPES: SelectionItem[] = [
    { id: '1', label: 'Undergraduate', value: 'Undergraduate', icon: Teacher },
    { id: '2', label: 'Post-Graduate', value: 'Post-Graduate', icon: Teacher },
    { id: '3', label: 'Others (high school, pre-school etc)', value: 'Others', icon: Teacher },

];

const PAYOUT_METHODS: SelectionItem[] = [
    { id: '1', label: 'Electronic Transfer (100%)', value: 'Electronic Transfer (100%)' },
    { id: '2', label: 'Card (100%)', value: 'Card (100%)' },
    { id: '3', label: 'Card (75%) + Cash (25%)', value: 'Card (75%) + Cash (25%)' },
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
    const attachBankAccountsMutation = useAttachBankAccountsMutation();
    const showToast = useToastStore(s => s.showToast);
    const { data: profileResponse } = useProfileQuery();
    const profile = profileResponse?.data;
    const user = useAuthStore(s => s.user);
    const { data: transactionsResponse } = useGetTransactionsQuery();
    const transactions = transactionsResponse?.pages?.flatMap(p => p.data) || [];

    const profileBvn = useMemo(() => profile?.bvn || user?.kyc?.bvn || '', [profile, user]);
    const profileNin = useMemo(() => {
        let foundNin = '';
        for (const tx of transactions) {
            const ninVal = tx.personalInfo?.nin || (tx as any).nin;
            if (ninVal) {
                foundNin = String(ninVal);
                break;
            }
        }
        return foundNin || profile?.nin || (user?.kyc as any)?.nin || (user as any)?.nin || '';
    }, [transactions, profile, user]);

    const [currentStep, setCurrentStep] = useState(0);
    const [initiateSheetVisible, setInitiateSheetVisible] = useState(false);
    const [admissionSheetVisible, setAdmissionSheetVisible] = useState(false);
    const [uploadTarget, setUploadTarget] = useState<'applicant' | 'student' | null>(null);

    const [payoutSheetVisible, setPayoutSheetVisible] = useState(false);
    const [selectedSavedAccountId, setSelectedSavedAccountId] = useState<string | null>('');
    const [isAddingNewAccount, setIsAddingNewAccount] = useState(false);

    const resolver = (data: any, context: any, options: any) => {
        const isPostGrad = data.admissionType === 'Post-Graduate';
        const dynamicSchema = schoolStep0Schema
            .merge(schoolStep2Schema(isPostGrad))
            .merge(schoolStep3Schema)
            .superRefine((data, ctx) => {
                if (!profileBvn) {
                    if (!data.bvn) {
                        ctx.addIssue({
                            code: "custom",
                            message: 'BVN is required',
                            path: ['bvn']
                        });
                    } else if (data.bvn.length !== 11 || !/^\d+$/.test(data.bvn)) {
                        ctx.addIssue({
                            code: "custom",
                            message: 'BVN must be exactly 11 digits',
                            path: ['bvn']
                        });
                    }
                }
                if (!profileNin) {
                    if (!data.nin) {
                        ctx.addIssue({
                            code: "custom",
                            message: 'NIN is required',
                            path: ['nin']
                        });
                    } else if (data.nin.length !== 11 || !/^\d+$/.test(data.nin)) {
                        ctx.addIssue({
                            code: "custom",
                            message: 'NIN must be exactly 11 digits',
                            path: ['nin']
                        });
                    }
                }

                if (data.passportIssueDate && data.passportExpiryDate && data.passportIssueDate === data.passportExpiryDate) {
                    ctx.addIssue({
                        code: "custom",
                        message: 'Passport Expiry Date cannot be the same as Passport Issue Date',
                        path: ['passportExpiryDate']
                    });
                }

                if (data.admissionType) {
                    if (!data.studentName) {
                        ctx.addIssue({
                            code: "custom",
                            message: 'Student Full Name is required',
                            path: ['studentName']
                        });
                    } else if (data.studentName.trim().length < 3) {
                        ctx.addIssue({
                            code: "custom",
                            message: 'Student name must be at least 3 characters',
                            path: ['studentName']
                        });
                    }

                    if (data.studentNIN) {
                        if (data.studentNIN.length !== 11 || !/^\d+$/.test(data.studentNIN)) {
                            ctx.addIssue({
                                code: "custom",
                                message: 'Student NIN must be exactly 11 digits',
                                path: ['studentNIN']
                            });
                        }
                    }

                    if (!data.studentPassportNumber) {
                        ctx.addIssue({
                            code: "custom",
                            message: 'Student Passport Number is required',
                            path: ['studentPassportNumber']
                        });
                    } else if (!/^[A-Za-z]\d{8}$/.test(data.studentPassportNumber)) {
                        ctx.addIssue({
                            code: "custom",
                            message: 'Please enter a valid Passport Number (e.g. A12345678)',
                            path: ['studentPassportNumber']
                        });
                    }
                    if (!data.studentPassportIssueDate) {
                        ctx.addIssue({
                            code: "custom",
                            message: 'Please select student Passport Issue Date',
                            path: ['studentPassportIssueDate']
                        });
                    }
                    if (!data.studentPassportExpiryDate) {
                        ctx.addIssue({
                            code: "custom",
                            message: 'Please select student Passport Expiry Date',
                            path: ['studentPassportExpiryDate']
                        });
                    }
                    if (data.studentPassportIssueDate && data.studentPassportExpiryDate && data.studentPassportIssueDate === data.studentPassportExpiryDate) {
                        ctx.addIssue({
                            code: "custom",
                            message: 'Student Passport Expiry Date cannot be the same as Issue Date',
                            path: ['studentPassportExpiryDate']
                        });
                    }
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
            bvn: '',
            nin: '',
            formAId: '',
            passportDocumentNumber: '',
            admissionType: '',
            passportIssueDate: '',
            passportExpiryDate: '',
            amount: 0,
            studentName: '',
            studentNIN: '',
            studentPassportNumber: '',
            studentPassportIssueDate: '',
            studentPassportExpiryDate: '',
            schoolName: '',
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
            beneficiaryPhone: '',
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
        applicantPassport: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
        studentPassport: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
        result: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
        degree: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
        signature: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
        bank_verification: { file: null as UploadedFile | null, meta: null as UploadedMetadata | null },
    });

    const updateDoc = (key: keyof typeof docs, file: UploadedFile, metadata: UploadedMetadata) => {
        setDocs(prev => ({ ...prev, [key]: { file, meta: metadata } }));
    };

    const { upload: uploadFile, isPending: isUploading } = useDocumentUpload({
        onSuccess: (documentType, { file, metadata }) => {
            if (documentType === 'SCHOOL_ADMISSION') updateDoc('admission', file, metadata);
            else if (documentType === 'INVOICE') updateDoc('invoice', file, metadata);
            else if (documentType === 'STUDENT_PASSPORT')
                updateDoc('studentPassport', file, metadata);
            else if (documentType === 'PASSPORT')
                updateDoc('applicantPassport', file, metadata);
            else if (documentType === 'RECEIPT') updateDoc('result', file, metadata);
            else if (documentType === 'MEMBERSHIP_CARD') updateDoc('degree', file, metadata);
            else if (documentType === 'DIGITAL_SIGNATURE') updateDoc('signature', file, metadata);
            else if (documentType === 'BANK_VERIFICATION') updateDoc('bank_verification', file, metadata);
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

            const profileBvn = profile?.bvn || user?.kyc?.bvn || '';
            const profilePassportNumber = user?.kyc?.passportDocumentNumber || '';
            const profileNin = profile?.nin || (user?.kyc as any)?.nin || (user as any)?.nin || '';

            const finalNin = foundNin || profileNin;
            const finalPassportNumber = foundPassportNumber || profilePassportNumber;

            if (profileBvn && !watchedFields.bvn) {
                setValue('bvn', profileBvn, { shouldValidate: true, shouldDirty: true });
            }
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
            const profileBvn = profile?.bvn || user?.kyc?.bvn || '';
            const profilePassportNumber = user?.kyc?.passportDocumentNumber || '';
            const profileNin = profile?.nin || (user?.kyc as any)?.nin || (user as any)?.nin || '';

            if (profileBvn && !watchedFields.bvn) {
                setValue('bvn', profileBvn, { shouldValidate: true, shouldDirty: true });
            }
            if (profileNin && !watchedFields.nin) {
                setValue('nin', profileNin, { shouldValidate: true, shouldDirty: true });
            }
            if (profilePassportNumber && !watchedFields.passportDocumentNumber) {
                setValue('passportDocumentNumber', profilePassportNumber, { shouldValidate: true, shouldDirty: true });
            }
        }
    }, [transactions, user, profile, setValue, watchedFields.bvn, watchedFields.nin, watchedFields.passportDocumentNumber, watchedFields.passportIssueDate, watchedFields.passportExpiryDate]);

    const credentialFields = [
        { customComponent: <ControlledInput control={control} name="bvn" label="Bank Verification Number (BVN)" placeholder="Enter BVN" required keyboardType="numeric" maxLength={11} filterType="numeric" disabled={!!profileBvn} /> },
        { customComponent: <ControlledInput control={control} name="nin" label="National Identification Number (NIN)" placeholder="Enter NIN" required keyboardType="numeric" maxLength={11} filterType="numeric" disabled={!!profileNin} /> },
        { customComponent: <ControlledInput control={control} name="formAId" label="Form A ID" placeholder="Enter Form A ID" required keyboardType="numeric" maxLength={10} filterType="numeric" /> },
        { customComponent: <ControlledInput control={control} name="passportDocumentNumber" label="International Passport Number" placeholder="Enter international passport number" required maxLength={9} filterType="alphanumeric" /> },
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
        ...(admissionType ? [
            {
                customComponent: (
                    <View style={{ marginTop: moderateScale(16), borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingTop: moderateScale(16), gap: moderateScale(12) }}>
                        <Text style={{ fontSize: moderateScale(14), fontWeight: '700', color: '#0F172A', marginBottom: moderateScale(4) }}>
                            Student Details
                        </Text>
                        <ControlledInput control={control} name="studentName" label="Student Full Name" placeholder="Enter student's full name" required />
                        <ControlledInput control={control} name="studentNIN" label="Student NIN (if available)" placeholder="Enter student's NIN" keyboardType="numeric" maxLength={11} filterType="numeric" />
                        <ControlledInput control={control} name="studentPassportNumber" label="Student International Passport Number" placeholder="Enter student's passport number" required maxLength={9} filterType="alphanumeric" />
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <View style={{ flex: 1 }}>
                                <ControlledDatePicker control={control} name="studentPassportIssueDate" label="Student Passport Issue Date" required maximumDate={new Date()} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <ControlledDatePicker control={control} name="studentPassportExpiryDate" label="Student Passport Expiry Date" required minimumDate={new Date()} />
                            </View>
                        </View>
                    </View>
                )
            }
        ] : [])
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
            label: "Applicant's International Passport",
            onUpload: () => {
                setUploadTarget('applicant');
                uploadFile('PASSPORT');
            },
            fileName: docs.applicantPassport.file?.name,
            fileUri: docs.applicantPassport.file?.uri, fileUrl: docs.applicantPassport.meta?.fileUrl,
            fileType: docs.applicantPassport.file?.type,
            required: false,
        },
        {
            label: "Student's International Passport",
            onUpload: () => {
                setUploadTarget('student');
                uploadFile('PASSPORT');
            },
            fileName: docs.studentPassport.file?.name,
            fileUri: docs.studentPassport.file?.uri, fileUrl: docs.studentPassport.meta?.fileUrl,
            fileType: docs.studentPassport.file?.type,
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
            label: "Applicant's International Passport",
            onUpload: () => {
                setUploadTarget('applicant');
                uploadFile('PASSPORT');
            },
            fileName: docs.applicantPassport.file?.name,
            fileUri: docs.applicantPassport.file?.uri, fileUrl: docs.applicantPassport.meta?.fileUrl,
            fileType: docs.applicantPassport.file?.type,
            required: false,
        },
        {
            label: "Student's International Passport",
            onUpload: () => {
                setUploadTarget('student');
                uploadFile('PASSPORT');
            },
            fileName: docs.studentPassport.file?.name,
            fileUri: docs.studentPassport.file?.uri, fileUrl: docs.studentPassport.meta?.fileUrl,
            fileType: docs.studentPassport.file?.type,
            required: true,
        },
    ];

    const othersDocuments = [
        {
            label: "Applicant's International Passport",
            onUpload: () => {
                setUploadTarget('applicant');
                uploadFile('PASSPORT');
            },
            fileName: docs.applicantPassport.file?.name,
            fileUri: docs.applicantPassport.file?.uri, fileUrl: docs.applicantPassport.meta?.fileUrl,
            fileType: docs.applicantPassport.file?.type,
            required: false,
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
            label: "Student's International Passport",
            onUpload: () => {
                setUploadTarget('student');
                uploadFile('PASSPORT');
            },
            fileName: docs.studentPassport.file?.name,
            fileUri: docs.studentPassport.file?.uri, fileUrl: docs.studentPassport.meta?.fileUrl,
            fileType: docs.studentPassport.file?.type,
            required: true,
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
            const fieldsToTrigger = [
                'bvn', 'nin', 'formAId',
                'passportDocumentNumber', 'passportIssueDate', 'passportExpiryDate',
                'admissionType', 'studentName',
                'studentPassportNumber', 'studentPassportIssueDate', 'studentPassportExpiryDate'
            ];
            if (watchedFields.studentNIN) {
                fieldsToTrigger.push('studentNIN');
            }
            isStepValid = await trigger(fieldsToTrigger as any);
        } else if (currentStep === 1) {
            const hasRequiredUgDocs = docs.admission.file && docs.studentPassport.file && docs.invoice.file;
            const hasRequiredPgDocs = docs.admission.file && docs.degree.file && docs.result.file && docs.studentPassport.file && docs.invoice.file;

            if (watchedFields.admissionType === 'Others') {
                const hasRequiredOthersDocs = docs.studentPassport.file && docs.admission.file && docs.invoice.file;
                if (!hasRequiredOthersDocs) {
                    showToast('Please upload all required documents', 'error');
                    return;
                }
                isStepValid = true;
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
                'schoolName',
                'beneficiaryEmail',
                'beneficiaryPhone',
                'beneficiaryAddress',
                'beneficiaryCity',
                'beneficiaryState',
                'bankName',
                'bankAccountName',
                'bankAccountAddress',
                'bankAccountIban',
                'bankAccountSwiftCode',
                'bankAccountNumber',
                'routingNumber',
                'correspondenceBankName',
                'correspondenceBankAddress',
                'correspondenceBankSwiftCode',
            ] as any);
        } else if (currentStep === 4) {
            isStepValid = !!selectedSavedAccountId;
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
             mode: "BUY",
            currency: currencyGet.code,
            amount: data.amount,
            purpose: `Pay School Fees`,
            destinationCountry: currencyGet.country,
            bvn: data.bvn || user?.kyc?.bvn,
            nin: data.nin,
            formAId: data.formAId,
            admissionType: data.admissionType,
            passportDocumentNumber: data.passportDocumentNumber,
            passportIssueDate: data.passportIssueDate,
            passportExpiryDate: data.passportExpiryDate,
            documents: [
                ...(docs.admission.meta ? [docs.admission.meta] : []),
                ...(docs.invoice.meta ? [docs.invoice.meta] : []),
                ...(docs.applicantPassport.meta ? [docs.applicantPassport.meta] : []),
                ...(docs.studentPassport.meta ? [docs.studentPassport.meta] : []),
                ...(isPostGrad && docs.degree.meta ? [docs.degree.meta] : []),
                ...(isPostGrad && docs.result.meta ? [docs.result.meta] : []),
                ...(docs.bank_verification.meta ? [docs.bank_verification.meta] : []),
                
            ],
            beneficiaryDetails: {
                organizationName: data.schoolName || '',
                studentName: data.studentName,
                studentNIN: data.studentNIN || undefined,
                studentPassportDocumentNumber: data.studentPassportNumber || undefined,
                studentPassportIssueDate: data.studentPassportIssueDate || undefined,
                studentPassportExpiryDate: data.studentPassportExpiryDate || undefined,
                bankAccountName: data.bankAccountName,
                bankAccountAddress: data.bankAccountAddress,
                bankAccountIban: data.bankAccountIban,
                bankAccountSwiftCode: data.bankAccountSwiftCode,
                bankAccountNumber: data.bankAccountNumber,
                bankName: data.bankName,
                country: data.beneficiaryCountry,
                address: data.beneficiaryAddress,
                email: data.beneficiaryEmail || '',
                phoneNumber: data.beneficiaryPhone || '',
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
            },
            refundBankDetails: {
                bankName: data.customerBankName,
                bankCode: data.customerBankCode,
                accountNumber: data.customerAccountNumber,
                accountName: data.customerAccountName,
            },
            
        };

        createTransaction.mutate(payload, {
            onSuccess: (response: any) => {
                if (response.success) {
                    const transactionId = response.data?.transactionId;
                    if (selectedSavedAccountId && transactionId) {
                        attachBankAccountsMutation.mutate({
                            transactionId,
                            bankAccountIds: [selectedSavedAccountId],
                        });
                    }
                    setInitiateSheetVisible(false);
                    router.push({
                        pathname: '/(buy-fx)/(school)/request-initiated-success',
                        params: {
                            transactionId,
                        },
                    });

                }
            },
        });
    };


    const isStep0Valid = !!(
        (profileBvn || (watchedFields.bvn && watchedFields.bvn.length === 11)) &&
        (profileNin || (watchedFields.nin && watchedFields.nin.length === 11)) &&
        watchedFields.formAId && watchedFields.formAId.length === 10 &&
        watchedFields.passportDocumentNumber && watchedFields.passportDocumentNumber.length === 9 &&
        watchedFields.passportIssueDate && watchedFields.passportExpiryDate &&
        watchedFields.admissionType &&
        watchedFields.studentName && watchedFields.studentName.trim().length >= 3
    );

    let isStep1Valid = false;
    if (watchedFields.admissionType === 'Post-Graduate') {
        isStep1Valid = !!(docs.admission.meta && docs.degree.meta && docs.result.meta && docs.studentPassport.meta && docs.invoice.meta);
    } else {
        isStep1Valid = !!(docs.admission.meta && docs.studentPassport.meta && docs.invoice.meta);
    }

    const isStep2Valid = watchedFields.amount > 0;
    const isStep3Valid = !!(
        watchedFields.beneficiaryCountry &&
        watchedFields.studentName &&
        watchedFields.schoolName &&
        watchedFields.beneficiaryEmail &&
        watchedFields.beneficiaryPhone &&
        watchedFields.beneficiaryAddress &&
        watchedFields.beneficiaryCity &&
        watchedFields.beneficiaryState &&
        watchedFields.bankName &&
        watchedFields.bankAccountName &&
        watchedFields.bankAccountAddress &&
        watchedFields.bankAccountSwiftCode &&
        watchedFields.bankAccountNumber &&
        watchedFields.paymentReference
    );

    const isStep4Valid = !!selectedSavedAccountId;

    const isNextDisabled =
        (currentStep === 0 && !isStep0Valid) ||
        (currentStep === 1 && !isStep1Valid) ||
        (currentStep === 2 && !isStep2Valid) ||
        (currentStep === 3 && !isStep3Valid) ||
        (currentStep === 4 && !isStep4Valid);

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
                        isSchool={true}
                    />
                )}

                {currentStep === 3 && (
                    <SchoolBankDetailsStep
                        control={control}
                        watch={watch}
                        setValue={setValue}
                        errors={errors}
                        verificationFile={docs.bank_verification.file}
                        onUploadInvoice={() => uploadFile('BANK_VERIFICATION')}
                        isUploadingInvoice={isUploading}
                    />
                )}

                {currentStep === 4 && !isAddingNewAccount && (
                    <RefundBankDetailsStep
                        savedAccounts={savedAccounts}
                        selectedSavedAccountId={selectedSavedAccountId}
                        setSelectedSavedAccountId={setSelectedSavedAccountId}
                        setValue={setValue}
                        setIsAddingNewAccount={setIsAddingNewAccount}
                    />
                )}

                {currentStep === 4 && isAddingNewAccount && (
                    <AddNewAccountStep
                        control={control}
                        setValue={setValue}
                        banks={banks}
                        isResolving={resolveAccount.isPending}
                        selectedBankCode={watchedFields.customerBankCode}
                    />
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
                            description: `You are requesting ${currencyGet.code === 'USD' ? '$' : currencyGet.code === 'GBP' ? '£' : currencyGet.code === 'EUR' ? '€' : ''}${amountGetStr} ${currencyGet.code.toUpperCase()}. You will pay approximately ₦${amountSendStr}`,
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

                </TransactionLayout>
        </View>
    );
}
