import GenericSelectionSheet, { SelectionItem } from '@/components/GenericSelectionSheet';
import InitiateTransactionSheet from '@/components/InitiateTransactionSheet';
import InputField from '@/components/InputField';
import { LocationItem } from '@/components/LocationSelectionSheet';
import BankDetailsStep from '@/components/transaction-flow/BankDetailsStep';
import CredentialStep from '@/components/transaction-flow/CredentialStep';
import DocumentStep from '@/components/transaction-flow/DocumentStep';
import ExchangeStep from '@/components/transaction-flow/ExchangeStep';
import TransactionLayout from '@/components/transaction-flow/TransactionLayout';
import { useRouter } from 'expo-router';
import { ArrowDown2, Calendar, Teacher } from 'iconsax-react-nativejs';
import React, { useState } from 'react';
import { View } from 'react-native';

const STATES: LocationItem[] = [
    { id: '1', title: 'Lagos State' },
    { id: '2', title: 'Ogun State' },
    { id: '3', title: 'Rivers State' },
    { id: '4', title: 'Kaduna State' },
    { id: '5', title: 'Enugu State' },
    { id: '6', title: 'Kano State' },
];

const CITIES: LocationItem[] = [
    { id: '1', title: 'Ajeromi Local Government' },
    { id: '2', title: 'Agege Local Government' },
    { id: '3', title: 'Alimosho Local Government' },
    { id: '4', title: 'Amuwo Odofin Local Government' },
    { id: '5', title: 'Apapa Local Government' },
    { id: '6', title: 'Badagry Local Government' },
];

const LOCATIONS: LocationItem[] = [
    { id: '1', title: 'Ajeromi Local Government', subtitle: 'Femi Areola Street, Ikeja GRA.' },
    { id: '2', title: 'Agege Local Government', subtitle: 'Femi Areola Street, Ikeja GRA.' },
    { id: '3', title: 'Ikorodu Local Government', subtitle: '23 T.O.S Benson Avenue, Ikorodu.' },
    { id: '4', title: 'Festac Local Government', subtitle: '1st Avenue, Festac Town.' },
];

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

    // --- Configuration ---

    // Fields for Step 0
    const credentialFields = [
        { label: 'Bank Verification Number (BVN)', placeholder: 'Enter your BVN', value: bvn, onChangeText: setBvn, required: true, keyboardType: 'numeric' as const },
        { label: 'National Identification Number (NIN)', placeholder: 'Enter your NIN', value: nin, onChangeText: setNin, required: true, keyboardType: 'numeric' as const },
        { label: 'Form A ID', placeholder: 'Enter Form A ID', value: formAId, onChangeText: setFormAId, required: true },
        { label: 'International Passport', placeholder: 'Enter international passport', value: passportNumber, onChangeText: setPassportNumber, required: true },
        {
            label: 'Admission Type',
            placeholder: 'Select Admission Type',
            value: admissionType,
            onChangeText: setAdmissionType,
            required: true,
            onPress: () => setAdmissionSheetVisible(true),
            rightIcon: ArrowDown2,
            type: 'select' as const
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
                        <InputField label='Passport Issue Date' required placeholder='dd/mm/yyyy' rightIcon={Calendar} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <InputField label='Passport Expiry Date' required placeholder='dd/mm/yyyy' rightIcon={Calendar} />
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
                headerIconColor="#FF6813"
                items={ADMISSION_TYPES}
                selectedItem={admissionType}
                onSelect={(item) => setAdmissionType(item.value)}
                confirmButtonText="Select Admission Type"
            />
        </TransactionLayout>
    );
}
