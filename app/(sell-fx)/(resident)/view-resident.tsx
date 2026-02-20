import TransactionDetailsView from '@/components/transaction-flow/TransactionDetailsView';
import TransactionDocsView from '@/components/transaction-flow/TransactionDocsView';
import TransactionStatusView, { TransactionStatus } from '@/components/transaction-flow/TransactionStatusView';
import TransactionViewLayout from '@/components/transaction-flow/TransactionViewLayout';
import { getDocumentAsync } from 'expo-document-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';

export default function ViewResidentScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview');

    // In a real app, this status would come from a backend or global state
    const [status, setStatus] = useState<TransactionStatus>('pending');

    // Document States
    const [passportFile, setPassportFile] = useState<string | null>('passport.pdf');
    const [utilityBillFile, setUtilityBillFile] = useState<string | null>('utility-bill.pdf');

    const handleBack = () => {
        router.back();
    };

    const handleProceed = () => {
        // Navigate to payment screen for approved transactions
        router.push('/(sell-fx)/(resident)/payment');
    };

    const handleUpload = async (docType: 'passport' | 'utility') => {
        try {
            const result = await getDocumentAsync({
                type: ['application/pdf', 'image/*'],
                copyToCacheDirectory: true,
            });

            if (result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                const fileName = file.name;

                if (docType === 'passport') setPassportFile(fileName);
                else if (docType === 'utility') setUtilityBillFile(fileName);
            }
        } catch (error) {
            console.error("Error picking document:", error);
        }
    };

    const toggleState = () => {
        if (status === 'pending') setStatus('approved');
        else if (status === 'approved') setStatus('more_info');
        else if (status === 'more_info') setStatus('rejected');
        else if (status === 'rejected') setStatus('awaiting_disbursement');
        else if (status === 'awaiting_disbursement') setStatus('settled');
        else setStatus('pending');
    };

    const tabs = [
        { key: 'overview', label: 'Overview' },
        { key: 'details', label: 'Transaction Details' },
        { key: 'docs', label: 'Documentation' },
    ];

    const detailsItems = [
        { label: 'Transaction ID', value: 'RES-994821' },
        { label: 'Amount (₦)', value: '₦ 1,500,000' },
        { label: 'Equivalent Amount (FX)', value: '$1,000' },
        { label: 'Date Initiated', value: 'Feb 9 2026' },
        { label: 'Pickup Point', value: 'Femi Areola Street, Ikeja GRA.', isRightAligned: true },
    ];

    const detailsDocuments = [
        { label: 'International Passport', fileName: 'passport.pdf' },
        { label: 'Utility Bill', fileName: 'utility-bill.pdf' },
    ];

    const docsItems = [
        { label: 'International Passport', fileName: passportFile, onUpload: () => handleUpload('passport'), required: true },
        { label: 'Utility Bill (Not more than 3 months old)', fileName: utilityBillFile, onUpload: () => handleUpload('utility'), required: true },
    ];

    const getMessage = () => {
        if (status === 'approved' || status === 'awaiting_disbursement' || status === 'settled')
            return "Congratulations! Your application has been approved. Kindly proceed to complete the transaction.";
        if (status === 'rejected')
            return "Your request has been declined. Please check the requirements and try again.";

        return "This is a message box that shows the message from the SohCahToa Admin regarding the request for more information about this application. Admin noted that the documents are unclear.";
    };

    return (
        <TransactionViewLayout
            title="Transaction"
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tabs={tabs}
            onBack={handleBack}
            showActionButton={status !== 'pending' && status !== 'rejected' && status !== 'settled'}
            actionButtonTitle={status === 'approved' || status === 'awaiting_disbursement' ? "Proceed to Payment" : "Resubmit Transaction Request"}
            onActionPress={handleProceed}
        >

            {/* <TouchableOpacity onPress={toggleState} style={{ marginLeft: 'auto', justifyContent: 'center', marginBottom: 10 }}>
                <Text style={{ fontSize: 10, color: '#ccc' }}>DEV: {status}</Text>
            </TouchableOpacity> */}

            {activeTab === 'overview' && (
                <TransactionStatusView
                    status={status}
                    id="994821"
                    date="9 Feb 2026"
                    time="9:15 pm"
                    message={getMessage()}
                />
            )}

            {activeTab === 'details' && (
                <TransactionDetailsView
                    details={detailsItems}
                    documents={detailsDocuments}
                />
            )}

            {activeTab === 'docs' && (
                <TransactionDocsView
                    status={status}
                    documents={docsItems}
                />
            )}

        </TransactionViewLayout>
    );
}
