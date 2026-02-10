import TransactionDetailsView from '@/components/transaction-flow/TransactionDetailsView';
import TransactionDocsView from '@/components/transaction-flow/TransactionDocsView';
import TransactionStatusView, { TransactionStatus } from '@/components/transaction-flow/TransactionStatusView';
import TransactionViewLayout from '@/components/transaction-flow/TransactionViewLayout';
import { getDocumentAsync } from 'expo-document-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';

export default function ViewPtaScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview');

    // In a real app, this status would come from a backend or global state
    const [status, setStatus] = useState<TransactionStatus>('pending');

    // Document States
    const [formAFile, setFormAFile] = useState<string | null>('form-a-doc.pdf');
    const [passportFile, setPassportFile] = useState<string | null>('my-passport.jpg');
    const [visaFile, setVisaFile] = useState<string | null>('my-visa.pdf');

    const handleBack = () => {
        router.back();
    };

    const handleProceed = () => {
        router.push('/(buy-fx)/(pta)/payment');
    };

    const handleUpload = async (docType: 'forma' | 'passport' | 'visa') => {
        try {
            const result = await getDocumentAsync({
                type: ['application/pdf', 'image/*'],
                copyToCacheDirectory: true,
            });

            if (result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                const fileName = file.name;

                if (docType === 'forma') setFormAFile(fileName);
                else if (docType === 'passport') setPassportFile(fileName);
                else if (docType === 'visa') setVisaFile(fileName);
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
        { label: 'Transaction ID', value: '674AGHA6773' },
        { label: 'Amount (₦)', value: '₦ 1,500,000' },
        { label: 'Equivalent Amount (FX)', value: '$1,000' },
        { label: 'Date Initiated', value: 'Dec 8 2025' },
        { label: 'Pickup Address', value: '3, Adeola Odeku, VI, Lagos', isRightAligned: true },
    ];

    const detailsDocuments = [
        { label: 'BVN Number', value: '744 ********* 373' },
        { label: 'TIN', value: '673***********344' },
        { label: 'Form A ID', value: '47743GA' },
        { label: 'Form A Document', fileName: 'form-a-doc.pdf' },
        { label: 'Visa', fileName: 'my-visa.pdf' },
        { label: 'Return Ticket', fileName: 'my-return-ticket.pdf' },
        { label: 'Return Ticket', fileName: 'my-return-ticket.pdf' },
    ];

    const docsItems = [
        { label: 'Form A', fileName: formAFile, onUpload: () => handleUpload('forma'), required: true },
        { label: 'International Passport', fileName: passportFile, onUpload: () => handleUpload('passport'), required: true },
        { label: 'Valid Visa', fileName: visaFile, onUpload: () => handleUpload('visa'), required: true },
    ];

   
    const getMessage = () => {
        if (status === 'approved' || status === 'awaiting_disbursement' || status === 'settled')
            return "Congratulations! You application have been approved. Kindly proceed to make payment.";
        if (status === 'rejected')
            return "Your quarterly limit has been used. Please try again next quarter.";

        return "This is a message box that show the message from the SohCahToa Admin regarding the request for more information about this application from the client. For this use-case, admin noted that customer should re-upload one of their documentation as it not clear.";
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
                    id="8833"
                    date="16 Nov 2025"
                    time="11:00 am"
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
