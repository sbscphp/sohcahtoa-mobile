import LoadingBackdrop from '@/components/LoadingBackdrop';
import TransactionDetailsView from '@/components/transaction-flow/TransactionDetailsView';
import TransactionDocsView from '@/components/transaction-flow/TransactionDocsView';
import TransactionStatusView, { TransactionStatus } from '@/components/transaction-flow/TransactionStatusView';
import TransactionViewLayout from '@/components/transaction-flow/TransactionViewLayout';
import { useGetTransactionByIdQuery } from '@/hooks/queries/transactions/useGetTransactionByIdQuery';
import { useDocumentUpload } from '@/hooks/useDocumentUpload';
import { useToastStore } from '@/stores/useToastStore';
import { commonDocTypeLabels, getTransactionDocuments } from '@/utils/helpers';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function ViewSchoolFeesScreen() {
    const router = useRouter();
    const { transactionId } = useLocalSearchParams<{ transactionId: string }>();
    const [activeTab, setActiveTab] = useState('overview');

    const { data: txResponse, isLoading } = useGetTransactionByIdQuery(transactionId || '');
    const tx = txResponse?.data;
    const showToast = useToastStore(s => s.showToast);

    console.log(JSON.stringify(tx, null, 2), "TX");

    const { upload: uploadFile, isPending: isUploading } = useDocumentUpload({
        transactionId: transactionId || undefined,
        onSuccess: () => { /* query auto-invalidated by the mutation */ },
        onError: () => showToast('Failed to upload document. Please try again.', 'error'),
    });

    const mapStatus = (s: string): TransactionStatus => {
        const map: Record<string, TransactionStatus> = { 'DRAFT': 'pending', 'AWAITING_VERIFICATION': 'pending', 'VERIFICATION_IN_PROGRESS': 'pending', 'VERIFICATION_COMPLETED': 'pending', 'AWAITING_DEPOSIT': 'awaiting_disbursement', 'DEPOSIT_PENDING': 'awaiting_disbursement', 'DEPOSIT_CONFIRMED': 'awaiting_disbursement', 'COMPLIANCE_REVIEW': 'pending', 'ADMIN_APPROVAL_PENDING': 'pending', 'APPROVED': 'approved', 'DISBURSEMENT_IN_PROGRESS': 'awaiting_disbursement', 'COMPLETED': 'settled', 'REJECTED': 'rejected', 'CANCELLED': 'rejected' };
        return map[s] || 'pending';
    };
    const status: TransactionStatus = tx ? mapStatus(tx.status) : 'pending';
    const handleBack = () => { router.back(); };
    const handleProceed = () => {
        router.push({
            pathname: '/(buy-fx)/(school)/payment',
            params: { transactionId }
        });
    };
    const fmtDate = (d: string) => { const dt = new Date(d); const m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; return `${dt.getDate()} ${m[dt.getMonth()]} ${dt.getFullYear()}`; };
    const fmtTime = (d: string) => { const dt = new Date(d); let h = dt.getHours(); const min = dt.getMinutes(); const ap = h >= 12 ? 'pm' : 'am'; h = h % 12 || 12; return `${h}:${String(min).padStart(2, '0')} ${ap}`; };
    const fmtCur = (n: number | null | undefined, p = '₦') => n == null ? `${p} 0` : `${p} ${n.toLocaleString()}`;

    const detailsItems = useMemo(() => {
        if (!tx) return [];
        return [
            { label: 'Transaction ID', value: tx.referenceNumber },
            { label: 'Amount (₦)', value: fmtCur(tx.nairaEquivalent) },
            { label: 'Equivalent Amount (FX)', value: fmtCur(tx.foreignAmount, tx.currency === 'USD' ? '$' : tx.currency === 'GBP' ? '£' : tx.currency === 'EUR' ? '€' : tx.currency) },
            { label: 'Date Initiated', value: fmtDate(tx.createdAt) },
            ...(tx.cashPickup ? [{ label: 'Pickup Address', value: tx.cashPickup.address || 'N/A', isRightAligned: true }] : []),
        ];
    }, [tx]);
    const detailsDocuments = useMemo(() => {
        if (!tx) return [];
        const docs = getTransactionDocuments(tx);

        const uploadedDocs = tx.requiredDocuments.filter(d => !!d.uploaded).map(d => ({
            label: commonDocTypeLabels[d.type] || d.type.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
            fileName: d.uploaded!.fileName
        }));
        return [...docs, ...uploadedDocs];
    }, [tx]);
    
    const beneficiaryItems = useMemo(() => {
        const details = tx?.beneficiaryDetails || tx?.paymentDetails;
        if (!tx || !details) return undefined;
        return [
            { label: 'Beneficiary Name', value: details.name },
            { label: 'Account Name', value: (details as any).accountName },
            { label: 'Account Number', value: details.accountNumber },
            { label: 'Bank Name', value: details.bankName },
            { label: 'IBAN', value: details.iban },
        ];
    }, [tx]);

    const docsItems = useMemo(() => {
        if (!tx) return [];
        return tx.requiredDocuments.filter(d => !!d.uploaded).map(d => ({
            label: commonDocTypeLabels[d.type] || d.type.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
            fileName: d.uploaded!.fileName,
            docStatus: d.uploaded!.status,
            required: true,
            onUpload: d.uploaded!.status === 'FAILED' ? () => uploadFile(d.type) : undefined,
        }));
    }, [tx, uploadFile]);
    console.log(docsItems, "DOCS");
    const getMessage = () => {
        if (!tx) return '';
        if (status === 'approved' || status === 'awaiting_disbursement' || status === 'settled') return "Congratulations! Your school fees payment request has been approved. Please proceed to payment.";
        if (status === 'rejected') return tx.rejection?.reason || "Your application has been declined.";
        return `Your transaction is currently ${tx.status.replace(/_/g, ' ').toLowerCase()}. Please check back for updates.`;
    };
    if (isLoading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}><ActivityIndicator size="large" color="#FF6B2C" /></View>;


    return (
        <>
        <LoadingBackdrop visible={isUploading} />
        <TransactionViewLayout
            title="Transaction"
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tabs={[{ key: 'overview', label: 'Overview' }, { key: 'details', label: 'Transaction Details' }, { key: 'docs', label: 'Documentation' }]}
            onBack={handleBack}
            showActionButton={status !== 'pending' && status !== 'rejected' && status !== 'settled'}
            actionButtonTitle={status === 'approved' || status === 'awaiting_disbursement' ? "Proceed to Payment" : "Resubmit Request"}
            onActionPress={handleProceed}
        >
            {activeTab === 'overview' && (<TransactionStatusView status={status} id={tx?.referenceNumber?.slice(-6) || ''} date={tx ? fmtDate(tx.createdAt) : ''} time={tx ? fmtTime(tx.createdAt) : ''} message={getMessage()} comments={tx?.comments} />)}
            {activeTab === 'details' && (<TransactionDetailsView details={detailsItems} documents={detailsDocuments} beneficiaryDetails={beneficiaryItems} />)}
            {activeTab === 'docs' && (<TransactionDocsView status={status} documents={docsItems} />)}
        </TransactionViewLayout>
        </>  
    );
}
