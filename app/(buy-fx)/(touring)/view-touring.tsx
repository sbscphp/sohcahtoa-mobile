import TransactionDetailsView from '@/components/transaction-flow/TransactionDetailsView';
import TransactionDocsView from '@/components/transaction-flow/TransactionDocsView';
import TransactionStatusView, { TransactionStatus } from '@/components/transaction-flow/TransactionStatusView';
import TransactionViewLayout from '@/components/transaction-flow/TransactionViewLayout';
import { getDocumentAsync } from 'expo-document-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';

export default function ViewTouringScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview');

    // In a real app, this status would come from a backend or global state
    const [status, setStatus] = useState<TransactionStatus>('pending');

    // Document States
    const [passportFile, setPassportFile] = useState<string | null>('my-passport.jpg');
    const [visaFile, setVisaFile] = useState<string | null>('my-visa.pdf');
    const [ticketFile, setTicketFile] = useState<string | null>('my-return-ticket.pdf');

    const handleBack = () => {
        router.back();
    };

    const handleProceed = () => {
        router.push('/(buy-fx)/(touring)/payment');
    };

    const handleUpload = async (docType: 'passport' | 'visa' | 'ticket') => {
        try {
            const result = await getDocumentAsync({
                type: ['application/pdf', 'image/*'],
                copyToCacheDirectory: true,
            });

            if (result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                const fileName = file.name;

                if (docType === 'passport') setPassportFile(fileName);
                else if (docType === 'visa') setVisaFile(fileName);
                else if (docType === 'ticket') setTicketFile(fileName);
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
        { label: 'Transaction ID', value: 'TOR-223344' },
        { label: 'Amount (₦)', value: '₦ 3,000,000' },
        { label: 'Equivalent Amount (FX)', value: '$2,500' },
        { label: 'Date Initiated', value: 'Apr 5 2026' },

    ];

    const detailsDocuments = [
        { label: 'BVN Number', value: '22*******566' },
        { label: 'Form A ID', value: '2234223344' },
        { label: 'Utility Bill', fileName: 'my-utility-bill.pdf' },
        { label: 'International Passport', fileName: 'my-.jpg' },
        { label: 'Evidence of Membership', fileName: 'my-doc.pdf' },
        { label: 'Invoice from Professional Body', fileName: 'my-doc.pdf' },
    ];

    const docsItems = [
        {label: 'Valid Visa', fileName: visaFile, onUpload: () => handleUpload('visa'), required: true },
        { label: 'Valid Return Ticket', fileName: ticketFile, onUpload: () => handleUpload('ticket'), required: true },
    ];


    const getMessage = () => {
        if (status === 'approved' || status === 'awaiting_disbursement' || status === 'settled')
            return "Congratulations! Your touring allowanced request has been approved. Please proceed to payment.";
        if (status === 'rejected')
            return "Request rejected. Personal Travel Allowance limit reached.";

        return "This is a message box that show the message from the SohCahToa Admin. Admin noted that the visa has expired.";
    };

    return (
        <TransactionViewLayout
            title="Transaction"
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tabs={tabs}
            onBack={handleBack}
            showActionButton={status !== 'pending' && status !== 'rejected' && status !== 'settled'}
            actionButtonTitle={status === 'approved' || status === 'awaiting_disbursement' ? "Proceed to Payment" : "Resubmit Request"}
            onActionPress={handleProceed}
        >

            <TouchableOpacity onPress={toggleState} style={{ marginLeft: 'auto', justifyContent: 'center', marginBottom: 10 }}>
                <Text style={{ fontSize: 10, color: '#ccc' }}>DEV: {status}</Text>
            </TouchableOpacity>

            {activeTab === 'overview' && (
                <TransactionStatusView
                    status={status}
                    id="223344"
                    date="05 Apr 2026"
                    time="09:00 am"
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
