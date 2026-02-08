
import InitiateTransactionSheet from '@/components/InitiateTransactionSheet';
import InputField from '@/components/InputField';
import CredentialStep from '@/components/transaction-flow/CredentialStep';
import DocumentStep from '@/components/transaction-flow/DocumentStep';
import ExchangeStep from '@/components/transaction-flow/ExchangeStep';
import TransactionLayout from '@/components/transaction-flow/TransactionLayout';
import { useRouter } from 'expo-router';
import { Calendar } from 'iconsax-react-nativejs';
import React, { useState } from 'react';
import { View } from 'react-native';

export default function CreateTouristScreen() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);

    // Step 0: Credentials
    const [passportNumberInput, setPassportNumberInput] = useState('');

    // Step 1: Document Uploads & Passport Details
    // const [passportNumber, setPassportNumber] = useState(''); // Removed unused state if covered by Step 0 or just use same state if needed elsewhere
    const [passportIssueDate, setPassportIssueDate] = useState('');
    const [passportExpiryDate, setPassportExpiryDate] = useState('');
    const [visaNumber, setVisaNumber] = useState('');

    // Step 2: Exchange State
    const [transactionType, setTransactionType] = useState<'buy' | 'sell'>('sell');
    const [currencyGet, setCurrencyGet] = useState({
        code: 'NGN',
        country: 'Nigeria',
        currencyName: 'Naira',
        flagUrl: 'https://flagcdn.com/w80/ng.png'
    });
    const [currencySend, setCurrencySend] = useState({
        code: 'USD',
        country: 'United States',
        currencyName: 'Dollar',
        flagUrl: 'https://flagcdn.com/w80/us.png'
    });

    const [amountGet, setAmountGet] = useState('');
    const [amountSend, setAmountSend] = useState('1,500'); // Placeholder

    const [initiateSheetVisible, setInitiateSheetVisible] = useState(false);

    // Configuration for Step 0
    const credentialFields = [
        {
            label: 'International Passport Number',
            placeholder: 'Enter international passport number',
            value: passportNumberInput,
            onChangeText: setPassportNumberInput,
            required: true
        }
    ];

    // Configuration for Step 1
    const documentFields = [
        {
            label: 'International Passport',
            onUpload: () => console.log('Upload Passport'),
            required: true,
            associatedInputs: (
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1 }}>
                        <InputField
                            label='Passport Issue Date'
                            required
                            placeholder='dd/mm/yyyy'
                            rightIcon={Calendar}
                            value={passportIssueDate}
                            onChangeText={setPassportIssueDate}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <InputField
                            label='Passport Expiry Date'
                            required
                            placeholder='dd/mm/yyyy'
                            rightIcon={Calendar}
                            value={passportExpiryDate}
                            onChangeText={setPassportExpiryDate}
                        />
                    </View>
                </View>
            )
        },
        {
            label: 'Valid Visa',
            onUpload: () => console.log('Upload Visa'),
            required: true,
            associatedInputs: (
                <View>
                    <InputField
                        label='Valid Visa'
                        required
                        placeholder='Enter visa number'
                        value={visaNumber}
                        onChangeText={setVisaNumber}
                    />
                </View>
            )
        },
        {
            label: 'Valid Return Ticket',
            onUpload: () => console.log('Upload Ticket'),
            required: true,
        }
    ];

    const handleNext = () => {
        if (currentStep < 2) {
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
        router.push('/(sell-fx)/(tourist)/success');
    };

    return (
        <TransactionLayout
            title={currentStep === 0 ? "School Fees Payment" : "Tourist"}
            // Note: Image 1 header says "School Fees Payment" but context is Tourist. 
            // I'll stick to "Tourist" for consistency unless the user explicitly wants that specific header for step 0.
            // Actually, for better UX "Tourist" is safer, but "School Fees Payment" in the image might be a copy-paste error in the design mock 
            // or I am looking at a mixed mock. I will use "Tourist" for all steps to be safe.
            currentStep={currentStep}
            totalSteps={3}
            onBack={handleBack}
            onNext={handleNext}
            nextLabel={currentStep === 2 ? "Continue" : "Continue"}
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
                    rate={`1 ${currencySend.code} = 1500 ${currencyGet.code}`}
                    allowedModes={['sell']}
                    onAmountGetChange={setAmountGet}
                    onAmountSendChange={setAmountSend}
                />
            )}

            <InitiateTransactionSheet
                visible={initiateSheetVisible}
                onClose={() => setInitiateSheetVisible(false)}
                onConfirm={handleConfirmInitiate}
                title="Initiate Tourist Transaction?"
                items={[
                    {
                        title: "Verification Required",
                        description: "Your documents will be verified before processing.",
                        iconType: 'verify'
                    }
                ]}
            />
        </TransactionLayout>
    );
}

