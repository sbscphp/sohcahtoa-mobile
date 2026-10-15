import TransactionDetailsView from '@/components/transaction-flow/TransactionDetailsView';
import TransactionStatusView, { TransactionStatus } from '@/components/transaction-flow/TransactionStatusView';
import TransactionViewLayout from '@/components/transaction-flow/TransactionViewLayout';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Text, TouchableOpacity, BackHandler } from 'react-native';

export default function ViewReceiveFxScreen() {
    const router = useRouter();
    const { fromSuccess } = useLocalSearchParams<{ fromSuccess?: string }>();
    const [activeTab, setActiveTab] = useState('overview');

    const navigation = useNavigation();

    useEffect(() => {
        if (fromSuccess === 'true') {
            navigation.setOptions({
                gestureEnabled: false,
            });
            const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
                return true;
            });
            return () => backHandler.remove();
        }
    }, [navigation, fromSuccess]);

    // In a real app, this status would come from a backend or global state
    const [status, setStatus] = useState<TransactionStatus>('pending');

    const handleBack = () => {
        if (fromSuccess === 'true') {
            router.replace('/(tabs)');
        } else {
            router.back();
        }
    };

    const handleProceed = () => {
        // Navigate to payment or next step
        router.push('/(receive-fx)/disbursement-options');
    };

    const toggleState = () => {
        if (status === 'pending') setStatus('approved');
        else setStatus('pending');
    };

    const tabs = [
        { key: 'overview', label: 'Overview' },
        { key: 'details', label: 'Transaction Details' },
    ];

    const detailsItems = [
        { label: 'Transaction Reference ID', value: '99033GHA67833' },
        { label: 'Transaction Date', value: '25 Jun 2025' },
        { label: 'Transaction Time', value: '11:00 W.A.T' },
        { label: 'Transfer From', value: 'Adewale Ayoola', secondaryValue: 'Bank of America' },
        { label: 'Transfer Via', value: 'Money Gram', secondaryValue: 'ID:9022' },
        { label: 'Transaction Value', value: '€ 72,290.22' },
        { label: 'Receiver\'s Name', value: 'Adeola Aderinsola' },
        { label: 'Purpose of Transfer', value: 'Family Reason' },
        { label: 'Remark', value: 'Kindly use this money to start a business as we agreed', isRightAligned: true },
    ];


    const disbursementDetails = {
        paymentInfo: [
            { label: 'USD Cash Received', value: '$ 500' },
            { label: 'Amount Received in NGN', value: 'NGN 400,000.00' },
            { label: 'Exchange Rate', value: '₦ 1,600 / $' },
            { label: 'Total Amount', value: '₦ 1,200,000' },
            { label: 'Bank Name', value: 'UBA Bank' },
            { label: 'Account Name', value: 'Adeola Aderinsola' },
            { label: 'Account Number', value: '2223334355' },
        ],
        status: 'Pending',
        statusColor: '#FEF3C7',
    };

    const getMessage = () => {
        if (status === 'approved')
            return "This is a message box that show the message from the SohCahToa Admin regarding the approval of this client transaction request. As this is approved, this customer would then be able to take an action from this point";
        if (status === 'refunded')
            return "This transaction has been refunded. The funds have been returned to your original account.";

        return "Your document is currently undergoing approval. You will receive a mail notification once your documents is approved.";
    };

    return (
        <TransactionViewLayout
            title="Transaction"
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tabs={tabs}
            onBack={handleBack}
            showActionButton={status === 'approved'}
            actionButtonTitle="Proceed to Payment"
            onActionPress={handleProceed}
        >
            {/* <TouchableOpacity onPress={toggleState} style={{ marginLeft: 'auto', justifyContent: 'center', marginBottom: 10 }}>
                <Text style={{ fontSize: 10, color: '#ccc' }}>DEV: {status}</Text>
            </TouchableOpacity> */}

            {activeTab === 'overview' && (
                <TransactionStatusView
                    status={status}
                    id="8833"
                    date="16 Nov 2025"
                    time="11:00 am"
                    message={getMessage()}
                />
            )}

            {activeTab === 'details' && (
                <TransactionDetailsView
                    details={detailsItems}
                    disbursementDetails={disbursementDetails}
                />
            )}

        </TransactionViewLayout>
    );
}
