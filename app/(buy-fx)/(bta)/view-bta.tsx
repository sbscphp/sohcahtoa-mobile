import LoadingBackdrop from '@/components/LoadingBackdrop';
import TransactionDetailsView from '@/components/transaction-flow/TransactionDetailsView';
import TransactionDocsView from '@/components/transaction-flow/TransactionDocsView';
import TransactionStatusView, { TransactionStatus } from '@/components/transaction-flow/TransactionStatusView';
import TransactionViewLayout from '@/components/transaction-flow/TransactionViewLayout';
import { useGetTransactionByIdQuery } from '@/hooks/queries/transactions/useGetTransactionByIdQuery';
import { useDocumentUpload } from '@/hooks/useDocumentUpload';
import { useToastStore } from '@/stores/useToastStore';
import { commonDocTypeLabels, formatCurrency, formatDate, formatTime, formatTimeWithSeconds, getTransactionDocuments, mapApiStatusToViewStatus } from '@/utils/helpers';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';


export default function ViewBtaScreen() {
    const router = useRouter();
    const { transactionId } = useLocalSearchParams<{ transactionId: string }>();
    // console.log(transactionId, 'transactionId');
    const [activeTab, setActiveTab] = useState('overview');

    const { data: txResponse, isLoading } = useGetTransactionByIdQuery(transactionId || '');
    const tx = txResponse?.data;
    const showToast = useToastStore(s => s.showToast);

    const { upload: uploadFile, isPending: isUploading } = useDocumentUpload({
        transactionId: transactionId || undefined,
        onSuccess: () => {},
        onError: () => showToast('Failed to upload document. Please try again.', 'error'),
    });


    // console.log(JSON.stringify(tx, null, 2), 'TRANSACTION');

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
            { label: 'Date Initiated', value: `${formatDate(tx.createdAt)}\n${formatTimeWithSeconds(tx.createdAt)}` },
            ...(tx.cashPickup ? [{
                label: 'Pickup Address',
                value: [tx.cashPickup.pickupLocation, tx.cashPickup.pickupCity, tx.cashPickup.pickupState].filter(Boolean).join(', ') || 'N/A',
                isRightAligned: true
            }] : []),
        ];
    }, [tx]);

    const detailsDocuments = useMemo(() => {
        if (!tx) return [];

        const docs = getTransactionDocuments(tx);

        const uploadedDocs = tx.requiredDocuments
            .filter((doc) => doc.uploaded)
            .map((doc) => ({
                label: commonDocTypeLabels[doc.type] || doc.type.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
                fileName: doc.uploaded!.fileName,
            }));

        return [...docs, ...uploadedDocs];
    }, [tx]);

    const docsItems = useMemo(() => {
        if (!tx) return [];
        return tx.requiredDocuments
            .filter((doc) => !!doc.uploaded)
            .map((doc) => ({
                label: commonDocTypeLabels[doc.type] || doc.type.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
                fileName: doc.uploaded!.fileName,
                docStatus: doc.uploaded!.status,
                required: true,
                onUpload: doc.uploaded!.status === 'FAILED' ? () => uploadFile(doc.type) : undefined,
            }));
    }, [tx, uploadFile]);

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
        <>
        <LoadingBackdrop visible={isUploading} />
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
                    comments={tx?.comments}
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
        </>
    );
}
