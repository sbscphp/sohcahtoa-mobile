import DatePickerField from '@/components/DatePickerField';
import GenericSelectionSheet, { SelectionItem } from '@/components/GenericSelectionSheet';
import InitiateTransactionSheet from '@/components/InitiateTransactionSheet';
import InputField from '@/components/InputField';
import { LocationItem } from '@/components/LocationSelectionSheet';
import BankDetailsStep from '@/components/transaction-flow/BankDetailsStep';
import CredentialStep from '@/components/transaction-flow/CredentialStep';
import DocumentStep from '@/components/transaction-flow/DocumentStep';
import ExchangeStep from '@/components/transaction-flow/ExchangeStep';
import TransactionLayout from '@/components/transaction-flow/TransactionLayout';
import { schoolStep0Schema, schoolStep1Schema, schoolStep2Schema, schoolStep3Schema } from '@/utils/validations/school';
import { useRouter } from 'expo-router';
import { ArrowDown2, Teacher } from 'iconsax-react-nativejs';
import React, { useState } from 'react';
import { View } from 'react-native';
import { z } from 'zod';

interface ValidationErrors {
    [key: string]: string | undefined;
}


const ADMISSION_TYPES: SelectionItem[] = [
    { id: '1', label: 'Undergraduate', value: 'Undergraduate', icon: Teacher },
    { id: '2', label: 'Post-Graduate', value: 'Post-Graduate', icon: Teacher }
];

export default function SchoolFeesScreen() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);

    // Step 0: Credentials State
    const [bvn, setBvn] = useState('');
    const [nin, setNin] = useState('');
    const [formAId, setFormAId] = useState('');
    const [passportNumber, setPassportNumber] = useState('');
    const [passportIssueDate, setPassportIssueDate] = useState('');
    const [passportExpiryDate, setPassportExpiryDate] = useState('');
    const [admissionType, setAdmissionType] = useState('');

    // Step 2: Exchange State
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

    const [amountGet, setAmountGet] = useState('1'); // Placeholder
    const [amountSend, setAmountSend] = useState('1,500'); // Placeholder

    // Step 3: Bank Details State (Replacing Location)
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState('');
    const [iban, setIban] = useState('');

    // Keeping these for now if needed else where, but not used in Step 3 for School
    const [selectedState, setSelectedState] = useState<LocationItem | null>(null);
    const [selectedCity, setSelectedCity] = useState<LocationItem | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(null);

    const [initiateSheetVisible, setInitiateSheetVisible] = useState(false);
    const [admissionSheetVisible, setAdmissionSheetVisible] = useState(false);
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

    const clearError = (field: string) => {
        if (validationErrors[field]) {
            setValidationErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    // --- Configuration ---

    // Fields for Step 0
    const credentialFields = [
        { label: 'Bank Verification Number (BVN)', placeholder: 'Enter your BVN', value: bvn, onChangeText: (v: string) => { setBvn(v); clearError('bvn'); }, required: true, keyboardType: 'numeric' as const, error: validationErrors.bvn },
        { label: 'National Identification Number (NIN)', placeholder: 'Enter your NIN', value: nin, onChangeText: (v: string) => { setNin(v); clearError('nin'); }, required: true, keyboardType: 'numeric' as const, error: validationErrors.nin },
        { label: 'Form A ID', placeholder: 'Enter Form A ID', value: formAId, onChangeText: (v: string) => { setFormAId(v); clearError('formAId'); }, required: true, error: validationErrors.formAId },
        { label: 'International Passport', placeholder: 'Enter international passport', value: passportNumber, onChangeText: (v: string) => { setPassportNumber(v); clearError('passportNumber'); }, required: true, error: validationErrors.passportNumber },
        {
            label: 'Admission Type',
            placeholder: 'Select Admission Type',
            value: admissionType,
            onChangeText: setAdmissionType,
            required: true,
            onPress: () => setAdmissionSheetVisible(true),
            rightIcon: ArrowDown2,
            type: 'select' as const,
            error: validationErrors.admissionType,
        },
    ];


    const undergraduateDocuments = [
        {
            label: 'Evidence of Admission',
            onUpload: () => console.log('Upload Admission'),
            required: true,
        },
        {
            label: 'School Invoice',
            onUpload: () => console.log('Upload Invoice'),
            required: true,
            associatedInputs: (
                <View>
                    <View style={{ flex: 1 }}>
                        <InputField label='School Invoice Number' required placeholder='Enter school invoice number' />
                    </View>
                </View>
            )
        },
        {
            label: 'International Passport',
            onUpload: () => console.log('Upload Passport'),
            required: true,
            associatedInputs: (
                <View>
                    <View style={{ flex: 1 }}>
                        <InputField label='International Passport Number' required placeholder='Enter international passport number' />
                    </View>
                </View>
            )
        },
    ];

    const postgraduateDocuments = [

        {
            label: 'International Passport',
            onUpload: () => console.log('Upload Passport'),
            required: true,
            associatedInputs: (
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1 }}>
                        <DatePickerField label='Passport Issue Date' value={passportIssueDate} onDateChange={setPassportIssueDate} required maximumDate={new Date()} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <DatePickerField label='Passport Expiry Date' value={passportExpiryDate} onDateChange={setPassportExpiryDate} required minimumDate={new Date()} />
                    </View>
                </View>
            )
        },
        {
            label: 'School Invoice',
            onUpload: () => console.log('Upload Invoice'),
            required: true,
            associatedInputs: (
                <View>
                    <View style={{ flex: 1 }}>
                        <InputField label='School Invoice Number' required placeholder='Enter school invoice number' />
                    </View>
                </View>
            )
        },
        {
            label: 'Statement Of Result',
            onUpload: () => console.log('Upload Statement Of Result'),
            required: true,
            associatedInputs: (
                <View>
                    <View style={{ flex: 1 }}>
                        <InputField label='Statement Of Result' required placeholder='Enter statement of number' />
                    </View>
                </View>
            )
        },
        {
            label: 'First Degree Certificate',
            onUpload: () => console.log('Upload First Degree Certificate'),
            required: true,
        },
    ]

    const documentFields = admissionType === 'Post-Graduate' ? postgraduateDocuments : undergraduateDocuments;

    // --- Handlers ---

    const handleNext = () => {
        const errors: ValidationErrors = {};

        if (currentStep === 0) {
            const result = schoolStep0Schema.safeParse({ bvn, nin, formAId, passportNumber, admissionType });
            if (!result.success) {
                result.error.issues.forEach((e: z.ZodIssue) => {
                    const key = e.path[0] as string;
                    if (!errors[key]) errors[key] = e.message;
                });
            }
        }

        if (currentStep === 1) {
            if (admissionType === 'Post-Graduate') {
                const result = schoolStep1Schema.safeParse({ passportIssueDate, passportExpiryDate });
                if (!result.success) {
                    result.error.issues.forEach((e: z.ZodIssue) => {
                        const key = e.path[0] as string;
                        if (!errors[key]) errors[key] = e.message;
                    });
                }
            }
        }
        if (currentStep === 2) {
            const isPostGrad = admissionType === 'Post-Graduate';
            const result = schoolStep2Schema(isPostGrad).safeParse({ amount: parseFloat(amountGet.replace(/,/g, '')) });
            if (!result.success) {
                result.error.issues.forEach((e: z.ZodIssue) => {
                    if (!errors.amount) errors.amount = e.message;
                });
            }
        }

        if (currentStep === 3) {
            const result = schoolStep3Schema.safeParse({ bankName, accountNumber, accountName });
            if (!result.success) {
                result.error.issues.forEach((e: z.ZodIssue) => {
                    const key = e.path[0] as string;
                    if (!errors[key]) errors[key] = e.message;
                });
            }
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        setValidationErrors({});
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        } else {
            setInitiateSheetVisible(true);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        } else {
            router.back();
        }
    };

    const handleConfirmInitiate = () => {
        setInitiateSheetVisible(false);
        router.push('/(buy-fx)/(school)/request-initiated-success');
    };

    return (
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
                    onCurrencyGetChange={setCurrencyGet}
                    currencySend={currencySend}
                    onCurrencySendChange={setCurrencySend}
                    amountGet={amountGet}
                    amountSend={amountSend}
                    rate={`1 ${currencyGet.code} = 1500 ${currencySend.code}`}
                    onAmountGetChange={setAmountGet}
                    onAmountSendChange={setAmountSend}
                    allowedModes={['buy']}
                />
            )}

            {currentStep === 3 && (
                <BankDetailsStep
                    bankName={bankName}
                    setBankName={setBankName}
                    accountNumber={accountNumber}
                    setAccountNumber={setAccountNumber}
                    accountName={accountName}
                    setAccountName={setAccountName}
                    iban={iban}
                    setIban={setIban}
                />
            )}


            <InitiateTransactionSheet
                visible={initiateSheetVisible}
                onClose={() => setInitiateSheetVisible(false)}
                onConfirm={handleConfirmInitiate}
                title={`Initiate ${admissionType} Transaction request?`}
                items={admissionType === 'Post-Graduate' ? [
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
                onSelect={(item) => setAdmissionType(item.value)}
                confirmButtonText="Select Admission Type"
            />
        </TransactionLayout>
    );
}
