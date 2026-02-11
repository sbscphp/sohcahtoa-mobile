import TransactionDetailsView from '@/components/transaction-flow/TransactionDetailsView';
import TransactionDocsView from '@/components/transaction-flow/TransactionDocsView';
import TransactionStatusView, { TransactionStatus } from '@/components/transaction-flow/TransactionStatusView';
import TransactionViewLayout from '@/components/transaction-flow/TransactionViewLayout';
import { getDocumentAsync } from 'expo-document-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Text, TouchableOpacity } from 'react-native';

export default function ViewProfessionalScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview');

    // In a real app, this status would come from a backend or global state
    const [status, setStatus] = useState<TransactionStatus>('pending');

    // Document States
    const [utilityBillFile, setUtilityBillFile] = useState<string | null>('utility-bill.jpg');
    const [formAFile, setFormAFile] = useState<string | null>('form-a.pdf');
    const [evidenceOfMembershipFile, setEvidenceOfMembershipFile] = useState<string | null>('evidence-of-membership.pdf');

    const handleBack = () => {
        router.back();
    };

    const handleProceed = () => {
        router.push('/(buy-fx)/(professional)/payment');
    };

    const handleUpload = async (docType: 'utilityBill' | 'formA' | 'evidenceOfMembership') => {
        try {
            const result = await getDocumentAsync({
                type: ['application/pdf', 'image/*'],
                copyToCacheDirectory: true,
            });

            if (result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                const fileName = file.name;

                if (docType === 'utilityBill') setUtilityBillFile(fileName);
                else if (docType === 'formA') setFormAFile(fileName);
                else if (docType === 'evidenceOfMembership') setEvidenceOfMembershipFile(fileName);
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
        { label: 'Transaction ID', value: 'PRO-112930' },
        { label: 'Amount (₦)', value: '₦ 1,200,000' },
        { label: 'Equivalent Amount (FX)', value: '$1,000' },
        { label: 'Date Initiated', value: 'Mar 10 2026' },
    ];

    const detailsDocuments = [
        { label: 'Exam Body', value: 'CFA Institute' },
        { label: 'Exam Type', value: 'Level 1' },
        { label: 'Exam Invoice', fileName: 'exam-invoice.pdf' },
        { label: 'International Passport', fileName: 'my-passport.jpg' },
    ];

    const docsItems = [
        { label: 'Form A', fileName: formAFile, onUpload: () => handleUpload('formA'), required: true },
        { label: 'Utility Bill', fileName: utilityBillFile, onUpload: () => handleUpload('utilityBill'), required: true },
        { label: 'Evidence of Membership', fileName: evidenceOfMembershipFile, onUpload: () => handleUpload('evidenceOfMembership'), required: true },
    ];


    const getMessage = () => {
        if (status === 'approved' || status === 'awaiting_disbursement' || status === 'settled')
            return "Congratulations! Your exam payment request has been approved. Please proceed to payment.";
        if (status === 'rejected')
            return "Request rejected. Please verify the exam details and try again.";

        return "This is a message box that show the message from the SohCahToa Admin. Admin noted that the invoice is unclear.";
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

            {/* <TouchableOpacity onPress={toggleState} style={{ marginLeft: 'auto', justifyContent: 'center', marginBottom: 10 }}>
                <Text style={{ fontSize: 10, color: '#ccc' }}>DEV: {status}</Text>
            </TouchableOpacity> */}

            {activeTab === 'overview' && (
                <TransactionStatusView
                    status={status}
                    id="112930"
                    date="10 Mar 2026"
                    time="04:15 pm"
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
                    documents={docsItems}
                />
            )}

        </TransactionViewLayout>
    );
}
