import TransactionDetailsView from '@/components/transaction-flow/TransactionDetailsView';
import TransactionDocsView from '@/components/transaction-flow/TransactionDocsView';
import TransactionStatusView, { TransactionStatus } from '@/components/transaction-flow/TransactionStatusView';
import TransactionViewLayout from '@/components/transaction-flow/TransactionViewLayout';
import { getDocumentAsync } from 'expo-document-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';

export default function ViewMedicalPaymentScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview');

    // In a real app, this status would come from a backend or global state
    const [status, setStatus] = useState<TransactionStatus>('pending');

    // Document States
    const [passportFile, setPassportFile] = useState<string | null>('my-passport.jpg');
    const [formAFile, setFormAFile] = useState<string | null>('form-a.pdf');
    const [returnTicketFile, setReturnTicketFile] = useState<string | null>('return-ticket.pdf');

    const handleBack = () => {
        router.back();
    };

    const handleProceed = () => {
        router.push('/(buy-fx)/(medical)/payment');
    };

    const handleUpload = async (docType: 'formA' | 'returnTicket' | 'passport') => {
        try {
            const result = await getDocumentAsync({
                type: ['application/pdf', 'image/*'],
                copyToCacheDirectory: true,
            });

            if (result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                const fileName = file.name;

                if (docType === 'formA') setFormAFile(fileName);
                else if (docType === 'returnTicket') setReturnTicketFile(fileName);
                else if (docType === 'passport') setPassportFile(fileName);
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
        { label: 'Transaction ID', value: 'MED-773829' },
        { label: 'Amount (₦)', value: '₦ 8,500,000' },
        { label: 'Equivalent Amount (FX)', value: '$8,000' },
        { label: 'Date Initiated', value: 'Feb 2 2026' },

    ];

    const detailsDocuments = [
        { label: 'Hospital Name', value: 'St. Mary Hospital' },
        { label: 'Patient Name', value: 'John Doe' },
        { label: 'Medical Bill', fileName: 'medical-bill.pdf' },
        { label: 'Medical Report', fileName: 'medical-report.pdf' },
        { label: 'International Passport', fileName: 'my-passport.jpg' },
    ];

    const docsItems = [
        { label: 'Form A', fileName: formAFile, onUpload: () => handleUpload('formA'), required: true },
        { label: 'International Passport', fileName: passportFile, onUpload: () => handleUpload('passport'), required: true },
        { label: 'Return Ticket', fileName: returnTicketFile, onUpload: () => handleUpload('returnTicket'), required: true },
    ];


    const getMessage = () => {
        if (status === 'approved' || status === 'awaiting_disbursement' || status === 'settled')
            return "Congratulations! Your medical payment request has been approved. Please proceed to payment.";
        if (status === 'rejected')
            return "Request rejected. Please verify the hospital details and try again.";

        return "This is a message box that show the message from the SohCahToa Admin. Admin noted that the medical report is not certified.";
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
                    id="773829"
                    date="02 Feb 2026"
                    time="02:30 pm"
                    message={getMessage()}
                />
            )}

            {activeTab === 'details' && (
                <TransactionDetailsView
                    details={detailsItems}
                    documents={detailsDocuments}
                    beneficiaryDetails={[
                        { label: 'Account Name', value: 'Finance International', isRightAligned: true },
                        { label: 'Account Number', value: '23456786543', isRightAligned: true },
                        { label: 'Sort Code', value: '27833987444', isRightAligned: true },
                    ]}
                    paymentDetails={[
                        { label: 'Transaction ID', value: '674AGHA6773', isRightAligned: true },
                        { label: 'Transaction Date', value: '17 Nov 2025', isRightAligned: true },
                    ]}
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
