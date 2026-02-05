import TransactionDetailsView from '@/components/transaction-flow/TransactionDetailsView';
import TransactionDocsView from '@/components/transaction-flow/TransactionDocsView';
import TransactionStatusView, { TransactionStatus } from '@/components/transaction-flow/TransactionStatusView';
import TransactionViewLayout from '@/components/transaction-flow/TransactionViewLayout';
import { getDocumentAsync } from 'expo-document-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';

export default function ViewSchoolFeesScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview');

    // In a real app, this status would come from a backend or global state
    const [status, setStatus] = useState<TransactionStatus>('pending');
    const [admissionType, setAdmissionType] = useState('Undergraduate');

    // Document States
    const [invoiceFile, setInvoiceFile] = useState<string | null>('school-bill.pdf');
    const [admissionFile, setAdmissionFile] = useState<string | null>('admission-letter.pdf');
    const [passportFile, setPassportFile] = useState<string | null>('my-passport.jpg');

    const handleBack = () => {
        router.back();
    };

    const handleProceed = () => {
        router.push('/(buy-fx)/(school)/payment');
    };

    const handleUpload = async (docType: 'invoice' | 'admission' | 'passport') => {
        try {
            const result = await getDocumentAsync({
                type: ['application/pdf', 'image/*'],
                copyToCacheDirectory: true,
            });

            if (result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                const fileName = file.name;

                if (docType === 'invoice') setInvoiceFile(fileName);
                else if (docType === 'admission') setAdmissionFile(fileName);
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
        { label: 'Transaction ID', value: 'SCH-992837' },
        { label: 'Amount (₦)', value: '₦ 5,500,000' },
        { label: 'Equivalent Amount (FX)', value: '$5,000' },
        { label: 'Date Initiated', value: 'Jan 20 2026' },
        { label: 'Pickup Address', value: '3, Adeola Odeku, VI, Lagos', isRightAligned: true },
    ];

    const detailsDocuments = [
        { label: 'Student ID', value: 'STU-2025-001' },
        { label: 'Session', value: '2025/2026' },
        { label: 'School Bill', fileName: 'school-bill.pdf' },
        { label: 'Admission Letter', fileName: 'admission-letter.pdf' },
        { label: 'International Passport', fileName: 'my-passport.jpg' },
    ];

    const docsUndergraduateItems = [
        { label: 'Form A', fileName: invoiceFile, onUpload: () => handleUpload('invoice'), required: true },
        { label: 'Evidence of Admission', fileName: admissionFile, onUpload: () => handleUpload('admission'), required: true },
        { label: 'School Invoice', fileName: passportFile, onUpload: () => handleUpload('passport'), required: true },
    ];

    const docsGraduateItems = [
        { label: 'Form A', fileName: invoiceFile, onUpload: () => handleUpload('invoice'), required: true },
        { label: 'Evidence of Admission', fileName: admissionFile, onUpload: () => handleUpload('admission'), required: true },
        { label: 'Statement of Result', fileName: passportFile, onUpload: () => handleUpload('passport'), required: true },
    ];


    const getMessage = () => {
        if (status === 'approved' || status === 'awaiting_disbursement' || status === 'settled')
            return "Congratulations! Your school fees payment request has been approved. Please proceed to payment.";
        if (status === 'rejected')
            return "Request rejected. Please verify the student details and try again.";

        return "This is a message box that show the message from the SohCahToa Admin. Admin noted that the School Bill is outdated.";
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
                    id="992837"
                    date="20 Jan 2026"
                    time="10:30 am"
                    message={getMessage()}
                />
            )}

            {activeTab === 'details' && (
                <TransactionDetailsView
                    details={detailsItems}
                    documents={detailsDocuments}
                    beneficiaryDetails={[
                        { label: 'Transaction ID', value: '674AGHA6773', isRightAligned: true },
                        { label: 'Account Name', value: 'Finance International', isRightAligned: true },
                        { label: 'Account Number', value: '23456786543', isRightAligned: true },
                        { label: 'Form A', value: '27833987444', isRightAligned: true },
                    ]}
                />
            )}

            {activeTab === 'docs' && (
                <TransactionDocsView
                    status={status}
                    documents={admissionType === 'Undergraduate' ? docsUndergraduateItems : docsGraduateItems}
                />
            )}

        </TransactionViewLayout>
    );
}
