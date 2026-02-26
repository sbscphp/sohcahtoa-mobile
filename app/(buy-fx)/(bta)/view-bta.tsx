import TransactionDetailsView from '@/components/transaction-flow/TransactionDetailsView';
import TransactionDocsView from '@/components/transaction-flow/TransactionDocsView';
import TransactionStatusView, { TransactionStatus } from '@/components/transaction-flow/TransactionStatusView';
import TransactionViewLayout from '@/components/transaction-flow/TransactionViewLayout';
import { useGetTransactionByIdQuery } from '@/hooks/queries/transactions/useGetTransactionByIdQuery';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';


const mapApiStatusToViewStatus = (status: string): TransactionStatus => {
    const map: Record<string, TransactionStatus> = {
        'DRAFT': 'pending',
        'AWAITING_VERIFICATION': 'pending',
        'VERIFICATION_IN_PROGRESS': 'pending',
        'VERIFICATION_COMPLETED': 'pending',
        'AWAITING_DEPOSIT': 'awaiting_disbursement',
        'DEPOSIT_PENDING': 'awaiting_disbursement',
        'DEPOSIT_CONFIRMED': 'awaiting_disbursement',
        'COMPLIANCE_REVIEW': 'pending',
        'ADMIN_APPROVAL_PENDING': 'pending',
        'APPROVED': 'approved',
        'DISBURSEMENT_IN_PROGRESS': 'awaiting_disbursement',
        'COMPLETED': 'settled',
        'REJECTED': 'rejected',
        'CANCELLED': 'rejected',
    };
    return map[status] || 'pending';
};

const formatDate = (dateStr: string): string => {
    const d = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

const formatTime = (dateStr: string): string => {
    const d = new Date(dateStr);
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;
    return `${hours}:${String(minutes).padStart(2, '0')} ${ampm}`;
};

const formatCurrency = (amount: number | null | undefined, prefix: string = '₦'): string => {
    if (amount == null) return `${prefix} 0`;
    return `${prefix} ${amount.toLocaleString()}`;
};

// ── Component ────────────────────────────────────────────────────────
export default function ViewBtaScreen() {
    const router = useRouter();
    const { transactionId } = useLocalSearchParams<{ transactionId: string }>();
    console.log(transactionId, 'transactionId');
    const [activeTab, setActiveTab] = useState('overview');

    const { data: txResponse, isLoading } = useGetTransactionByIdQuery(transactionId || '');
    const tx = txResponse?.data;


    // console.log('Transaction:', tx);

    const status: TransactionStatus = tx ? mapApiStatusToViewStatus(tx.status) : 'pending';

    const handleBack = () => {
        router.back();
    };

    const handleProceed = () => {
        router.push({
            pathname: '/(buy-fx)/(bta)/payment',
            params: { transactionId }
        });
    };


    const tabs = [
        { key: 'overview', label: 'Overview' },
        { key: 'details', label: 'Transaction Details' },
        { key: 'docs', label: 'Documentation' },
    ];

    const detailsItems = useMemo(() => {
        if (!tx) return [];
        return [
            { label: 'Transaction ID', value: tx.referenceNumber },
            { label: 'Amount (₦)', value: formatCurrency(tx.nairaEquivalent) },
            { label: 'Equivalent Amount (FX)', value: formatCurrency(tx.foreignAmount, tx.currency === 'USD' ? '$' : tx.currency === 'GBP' ? '£' : tx.currency === 'EUR' ? '€' : tx.currency) },
            { label: 'Exchange Rate', value: tx.exchangeRate ? `₦${tx.exchangeRate.toLocaleString()}/$1` : 'N/A' },
            { label: 'Date Initiated', value: formatDate(tx.createdAt) },
            ...(tx.cashPickup ? [{ label: 'Pickup Address', value: tx.cashPickup.address || 'N/A', isRightAligned: true }] : []),
        ];
    }, [tx]);

    const detailsDocuments = useMemo(() => {
        if (!tx) return [];
        return tx.requiredDocuments
            .filter((doc) => doc.uploaded)
            .map((doc) => ({
                label: doc.type.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
                fileName: doc.uploaded!.fileName,
            }));
    }, [tx]);

    const docsItems = useMemo(() => {
        if (!tx) return [];
        return tx.requiredDocuments
            .filter((doc) => !!doc.uploaded)
            .map((doc) => ({
                label: doc.type.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
                fileName: doc.uploaded!.fileName,
                docStatus: doc.uploaded!.status,
                required: true,
            }));
    }, [tx]);

    const getMessage = () => {
        if (!tx) return '';
        if (status === 'approved' || status === 'awaiting_disbursement' || status === 'settled')
            return "Congratulations! Your application has been approved. Kindly proceed to make payment.";
        if (status === 'rejected')
            return tx.rejection?.reason || "Your application has been declined.";
        return `Your transaction is currently ${tx.status.replace(/_/g, ' ').toLowerCase()}. Please check back for updates.`;
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
                <ActivityIndicator size="large" color="#FF6B2C" />
            </View>
        );
    }

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
            {activeTab === 'overview' && (
                <TransactionStatusView
                    status={status}
                    id={tx?.referenceNumber?.slice(-6) || ''}
                    date={tx ? formatDate(tx.createdAt) : ''}
                    time={tx ? formatTime(tx.createdAt) : ''}
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
