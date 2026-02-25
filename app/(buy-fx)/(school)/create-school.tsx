import ControlledDatePicker from '@/components/ControlledDatePicker';
import ControlledInput from '@/components/ControlledInput';
import GenericSelectionSheet, { SelectionItem } from '@/components/GenericSelectionSheet';
import InitiateTransactionSheet from '@/components/InitiateTransactionSheet';
import LoadingBackdrop from '@/components/LoadingBackdrop';
import BankDetailsStep from '@/components/transaction-flow/BankDetailsStep';
import CredentialStep from '@/components/transaction-flow/CredentialStep';
import DocumentStep from '@/components/transaction-flow/DocumentStep';
import ExchangeStep from '@/components/transaction-flow/ExchangeStep';
import TransactionLayout from '@/components/transaction-flow/TransactionLayout';
import { useCalculateExchangeRateMutation } from '@/hooks/queries/transactions/useCalculateExchangeRateMutation';
import { useCreateTransactionMutation } from '@/hooks/queries/transactions/useCreateTransactionMutation';
import { useGetExchangeRatesQuery } from '@/hooks/queries/transactions/useGetExchangeRatesQuery';
import { useDocumentUpload } from '@/hooks/useDocumentUpload';
import { useToastStore } from '@/stores/useToastStore';
import { schoolStep0Schema, schoolStep1Schema, schoolStep2Schema, schoolStep3Schema } from '@/utils/validations/school';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { ArrowDown2, Teacher } from 'iconsax-react-nativejs';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { TouchableOpacity, View } from 'react-native';
import { z } from 'zod';

const ADMISSION_TYPES: SelectionItem[] = [
    { id: '1', label: 'Undergraduate', value: 'Undergraduate', icon: Teacher },
    { id: '2', label: 'Post-Graduate', value: 'Post-Graduate', icon: Teacher }
];

export default function SchoolFeesScreen() {
    const router = useRouter();
    const createTransaction = useCreateTransactionMutation();
    const calculateExchangeRate = useCalculateExchangeRateMutation();
    const showToast = useToastStore(s => s.showToast);

    const [currentStep, setCurrentStep] = useState(0);
    const [initiateSheetVisible, setInitiateSheetVisible] = useState(false);
    const [admissionSheetVisible, setAdmissionSheetVisible] = useState(false);

    const resolver = (data: any, context: any, options: any) => {
        const isPostGrad = data.admissionType === 'Post-Graduate';
        const dynamicSchema = z.object({
            ...schoolStep0Schema.shape,
            ...(isPostGrad ? schoolStep1Schema.shape : {
                passportIssueDate: z.string().optional(),
                passportExpiryDate: z.string().optional()
            }),
            ...schoolStep2Schema(isPostGrad).shape,
            ...schoolStep3Schema.shape
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
            passportNumber: '',
            admissionType: '',
            passportIssueDate: '',
            passportExpiryDate: '',
            amount: 0,
            bankName: '',
            accountNumber: '',
            accountName: '',
            iban: '',
        },
        mode: 'onChange'
    });

    const admissionType = watch('admissionType');
    const isPostGrad = admissionType === 'Post-Graduate';

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

    const [amountGetStr, setAmountGetStr] = useState('1');
    const [amountSendStr, setAmountSendStr] = useState('0');
    const [currentRate, setCurrentRate] = useState(0);

    const { data: exchangeRates } = useGetExchangeRatesQuery({
        fromCurrency: currencyGet.code,
        toCurrency: currencySend.code
    });

    useEffect(() => {
        if (exchangeRates?.data?.[0]?.sellRate) {
            setCurrentRate(exchangeRates.data[0].sellRate);
        }
    }, [exchangeRates]);

    const handleAmountGetChange = (amount: string) => {
        const cleanAmount = amount.replace(/,/g, '');
        setAmountGetStr(amount);
        setValue('amount', parseFloat(cleanAmount) || 0);

        if (cleanAmount && !isNaN(parseFloat(cleanAmount))) {
            calculateExchangeRate.mutate({
                fromCurrency: currencyGet.code,
                toCurrency: currencySend.code,
                amount: parseFloat(cleanAmount)
            }, {
                onSuccess: (response) => {
                    if (response.success && response.data) {
                        setAmountSendStr(response.data.convertedAmount.toLocaleString());
                        setCurrentRate(response.data.sellRate);
                    }
                }
            });
        } else {
            setAmountSendStr('0');
        }
    };

    const handleCurrencyChange = (type: 'GET' | 'SEND', currency: any) => {
        if (type === 'GET') {
            setCurrencyGet(currency);
        } else {
            setCurrencySend(currency);
        }

        const cleanAmount = amountGetStr.replace(/,/g, '');
        if (cleanAmount && !isNaN(parseFloat(cleanAmount))) {
            calculateExchangeRate.mutate({
                fromCurrency: type === 'GET' ? currency.code : currencyGet.code,
                toCurrency: type === 'SEND' ? currency.code : currencySend.code,
                amount: parseFloat(cleanAmount)
            }, {
                onSuccess: (response) => {
                    if (response.success && response.data) {
                        setAmountSendStr(response.data.convertedAmount.toLocaleString());
                        setCurrentRate(response.data.sellRate);
                    }
                }
            });
        }
    };

    // Document upload state
    const [admissionFile, setAdmissionFile] = useState<any>(null);
    const [admissionMeta, setAdmissionMeta] = useState<any>(null);
    const [invoiceFile, setInvoiceFile] = useState<any>(null);
    const [invoiceMeta, setInvoiceMeta] = useState<any>(null);
    const [passportFile, setPassportFile] = useState<any>(null);
    const [passportMeta, setPassportMeta] = useState<any>(null);
    const [resultFile, setResultFile] = useState<any>(null);
    const [resultMeta, setResultMeta] = useState<any>(null);
    const [degreeFile, setDegreeFile] = useState<any>(null);
    const [degreeMeta, setDegreeMeta] = useState<any>(null);

    const { upload: uploadFile, isPending: isUploading } = useDocumentUpload({
        onSuccess: (documentType, { file, metadata }) => {
            if (documentType === 'SCHOOL_ADMISSION') { setAdmissionFile(file); setAdmissionMeta(metadata); }
            else if (documentType === 'INVOICE') { setInvoiceFile(file); setInvoiceMeta(metadata); }
            else if (documentType === 'PASSPORT') { setPassportFile(file); setPassportMeta(metadata); }
            else if (documentType === 'RECEIPT') { setResultFile(file); setResultMeta(metadata); }
            else if (documentType === 'MEMBERSHIP_CARD') { setDegreeFile(file); setDegreeMeta(metadata); }
        },
        onError: () => showToast('Failed to upload document. Please try again.', 'error'),
    });

    const credentialFields = [
        { customComponent: <ControlledInput control={control} name="bvn" label="Bank Verification Number(BVN)" placeholder="Enter your BVN" required keyboardType="numeric" /> },
        { customComponent: <ControlledInput control={control} name="nin" label="National Identification Number(NIN)" placeholder="Enter your NIN" required keyboardType="numeric" /> },
        { customComponent: <ControlledInput control={control} name="formAId" label="Form A ID" placeholder="Enter Form A ID" required /> },
        { customComponent: <ControlledInput control={control} name="passportNumber" label="International Passport" placeholder="Enter international passport" required /> },
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
            fileName: admissionFile?.name,
            fileUri: admissionFile?.uri,
            fileType: admissionFile?.type,
            required: true,
        },
        {
            label: 'School Invoice',
            onUpload: () => uploadFile('INVOICE'),
            fileName: invoiceFile?.name,
            fileUri: invoiceFile?.uri,
            fileType: invoiceFile?.type,
            required: true,
        },
        {
            label: 'International Passport',
            onUpload: () => uploadFile('PASSPORT'),
            fileName: passportFile?.name,
            fileUri: passportFile?.uri,
            fileType: passportFile?.type,
            required: true,
        },
    ];

    const postgraduateDocuments = [
        {
            label: 'International Passport',
            onUpload: () => uploadFile('PASSPORT'),
            fileName: passportFile?.name,
            fileUri: passportFile?.uri,
            fileType: passportFile?.type,
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
            label: 'School Invoice',
            onUpload: () => uploadFile('INVOICE'),
            fileName: invoiceFile?.name,
            fileUri: invoiceFile?.uri,
            fileType: invoiceFile?.type,
            required: true,
        },
        {
            label: 'Statement Of Result',
            onUpload: () => uploadFile('RECEIPT'),
            fileName: resultFile?.name,
            fileUri: resultFile?.uri,
            fileType: resultFile?.type,
            required: true,
        },
        {
            label: 'First Degree Certificate',
            onUpload: () => uploadFile('MEMBERSHIP_CARD'),
            fileName: degreeFile?.name,
            fileUri: degreeFile?.uri,
            fileType: degreeFile?.type,
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
            isStepValid = await trigger(['bvn', 'nin', 'formAId', 'passportNumber', 'admissionType']);
        } else if (currentStep === 1) {
            const hasRequiredUgDocs = admissionFile && invoiceFile && passportFile;
            const hasRequiredPgDocs = passportFile && invoiceFile && resultFile && degreeFile;

            if (isPostGrad) {
                if (!hasRequiredPgDocs) {
                    showToast('Please upload all required documents', 'error');
                    return;
                }
                isStepValid = await trigger(['passportIssueDate', 'passportExpiryDate']);
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
            isStepValid = await trigger(['bankName', 'accountNumber', 'accountName', 'iban']);
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
            purpose: `School Fees Payment (${data.admissionType})`,
            destinationCountry: currencyGet.country,
            bvn: data.bvn,
            nin: data.nin,
            formAId: data.formAId,
            admissionType: data.admissionType,
            documents: [
                ...(admissionMeta ? [admissionMeta] : []),
                ...(invoiceMeta ? [invoiceMeta] : []),
                ...(passportMeta ? [passportMeta] : []),
                ...(resultMeta ? [resultMeta] : []),
                ...(degreeMeta ? [degreeMeta] : []),
            ],
            beneficiaryDetails: {
                name: data.accountName,
                accountNumber: data.accountNumber,
                accountName: data.accountName,
                bankName: data.bankName,
                iban: data.iban,
            },
        };

        createTransaction.mutate(payload, {
            onSuccess: (response) => {
                if (response.success) {
                    setInitiateSheetVisible(false);
                    router.push('/(buy-fx)/(school)/request-initiated-success');
                }
            },
        });
    };

    const bankName = watch('bankName');
    const accountNumber = watch('accountNumber');

    return (
        <View style={{ flex: 1 }}>
            <LoadingBackdrop visible={isUploading || createTransaction.isPending} />
            <TransactionLayout
                title={currentStep === 0 ? "School Fees Payment" : (admissionType ? `${admissionType} Fees` : "School Fees Payment")}
                currentStep={currentStep}
                totalSteps={4}
                onBack={handleBack}
                onNext={handleNext}
                nextLabel={currentStep === 3 ? (bankName && accountNumber ? "Initiate Transaction Request" : "Continue") : "Continue"}
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
                        onCurrencyGetChange={(v: any) => handleCurrencyChange('GET', v)}
                        currencySend={currencySend}
                        onCurrencySendChange={(v: any) => handleCurrencyChange('SEND', v)}
                        amountGet={amountGetStr}
                        amountSend={amountSendStr}
                        rate={`1 ${currencyGet.code} = ${currentRate.toLocaleString()} ${currencySend.code}`}
                        onAmountGetChange={handleAmountGetChange}
                        onAmountSendChange={setAmountSendStr}
                        allowedModes={['buy']}
                        error={errors.amount?.message as string | undefined}
                    />
                )}

                {currentStep === 3 && (
                    <BankDetailsStep control={control} />
                )}

                <InitiateTransactionSheet
                    visible={initiateSheetVisible}
                    onClose={() => setInitiateSheetVisible(false)}
                    onConfirm={handleSubmit(onSubmit)}
                    title={`Initiate ${admissionType} Transaction request?`}
                    items={isPostGrad ? [
                        {
                            title: "Verification before approval",
                            description: "Post-graduate tuition invoices, admission letters, and identification documents must be verified before processing.",
                            iconType: 'verify'
                        },
                        {
                            title: "Maximum of $15,000 per quarter",
                            description: "Post-graduate programs may attract higher tuition; the CBN limit is $15,000 per academic year.",
                            iconType: 'limit'
                        }
                    ] : [
                        {
                            title: "Verification before approval",
                            description: "You must upload the school admission letter, tuition invoice, and passport biodata page for verification.",
                            iconType: 'verify'
                        },
                        {
                            title: "Maximum of $10,000 per quarter",
                            description: `The maximum allowed for undergraduate foreign school fees is $10,000 per academic year.`,
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
            </TransactionLayout>
        </View>
    );
}
