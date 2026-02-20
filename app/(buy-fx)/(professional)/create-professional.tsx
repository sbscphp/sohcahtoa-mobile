import InitiateTransactionSheet from '@/components/InitiateTransactionSheet';
import InputField from '@/components/InputField';
import BankDetailsStep from '@/components/transaction-flow/BankDetailsStep';
import CredentialStep from '@/components/transaction-flow/CredentialStep';
import DocumentStep from '@/components/transaction-flow/DocumentStep';
import ExchangeStep from '@/components/transaction-flow/ExchangeStep';
import TransactionLayout from '@/components/transaction-flow/TransactionLayout';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';



export default function ProfessionalScreen() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);

    // Step 0: Credentials State
    const [bvn, setBvn] = useState('');
    const [nin, setNin] = useState('');
    const [formAId, setFormAId] = useState('');
    const [passportNumber, setPassportNumber] = useState('');
    const [evidenceOfMembership, setEvidenceOfMembership] = useState('');
    const [invoiceNumber, setInvoiceNumber] = useState('');

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

    const [initiateSheetVisible, setInitiateSheetVisible] = useState(false);

    // --- Configuration ---

    // Fields for Step 0
    const credentialFields = [
        { label: 'Bank Verification Number (BVN)', placeholder: 'Enter your BVN', value: bvn, onChangeText: setBvn, required: true, keyboardType: 'numeric' as const },
        { label: 'National Identification Number (NIN)', placeholder: 'Enter your NIN', value: nin, onChangeText: setNin, required: true, keyboardType: 'numeric' as const },
        { label: 'Form A ID', placeholder: 'Enter Form A ID', value: formAId, onChangeText: setFormAId, required: true },
        { label: 'International Passport Number', placeholder: 'Enter international passport', value: passportNumber, onChangeText: setPassportNumber, required: true },
    ];

    // Documents for Step 1
    const documentFields = [
        {
            label: 'Evidence of Membership',
            onUpload: () => console.log('Upload Invoice'),
            required: true,
            associatedInputs: (
                <View style={{ marginBottom: 16 }}>
                    <InputField label='Evidence of Membership' placeholder='Enter evidence of membership' value={evidenceOfMembership} onChangeText={setEvidenceOfMembership} required />
                </View>
            )
        },
        {
            label: 'Invoice from Professional Body',
            onUpload: () => console.log('Upload Passport'),
            required: true,
            associatedInputs: (
                <View style={{ marginBottom: 16 }}>
                    <InputField label='Invoice from Professional Body' placeholder='Enter invoice number' value={invoiceNumber} onChangeText={setInvoiceNumber} required />
                </View>
            )
        },
    ];

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
        router.push('/(buy-fx)/(professional)/request-initiated-success');
    };

    return (
        <TransactionLayout
            title="Professional"
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
                title="Initiate Professional Transaction request?"
                items={[
                    {
                        title: "Verification before approval",
                        description: "Your supporting documents (exam registration, training invoice, or admission letter) must be verified before your request can be processed.",
                        iconType: 'verify'
                    },
                    {
                        title: "Maximum of $2,000 per quarter",
                        description: "The maximum amount allowed for professional exams or training fees is $2,000 per year, according to CBN guidelines.",
                        iconType: 'limit'
                    }
                ]}
            />
        </TransactionLayout>
    );
}
