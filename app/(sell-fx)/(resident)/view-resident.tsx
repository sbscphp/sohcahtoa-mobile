import LoadingBackdrop from '@/components/LoadingBackdrop';
import TransactionDetailsView from '@/components/transaction-flow/TransactionDetailsView';
import TransactionDocsView from '@/components/transaction-flow/TransactionDocsView';
import TransactionStatusView, { TransactionStatus } from '@/components/transaction-flow/TransactionStatusView';
import TransactionViewLayout from '@/components/transaction-flow/TransactionViewLayout';
import { useGetTransactionByIdQuery } from '@/hooks/queries/transactions/useGetTransactionByIdQuery';
import { useDocumentUpload } from '@/hooks/useDocumentUpload';
import { useToastStore } from '@/stores/useToastStore';
import { commonDocTypeLabels, getTransactionDocuments, formatDate, formatTime, formatTimeWithSeconds, formatCurrency } from '@/utils/helpers';
import { useLocalSearchParams, useRouter, useFocusEffect, useNavigation } from 'expo-router';
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { ActivityIndicator, View, BackHandler } from 'react-native';

export default function ViewResidentScreen() {
    const router = useRouter();
    const { transactionId, fromSuccess } = useLocalSearchParams<{ transactionId: string, fromSuccess?: string }>();
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

    const { data: txResponse, isLoading, refetch } = useGetTransactionByIdQuery(transactionId || '');
    const tx = txResponse?.data;
    const showToast = useToastStore(s => s.showToast);

    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch])
    );

    const { upload: uploadFile, isPending: isUploading } = useDocumentUpload({
        transactionId: transactionId || undefined,
        onSuccess: () => {},
        onError: () => showToast('Failed to upload document. Please try again.', 'error'),
    });

    const mapStatus = (s: string): TransactionStatus => {
        const map: Record<string, TransactionStatus> = { 'DRAFT': 'pending', 'AWAITING_VERIFICATION': 'pending', 'VERIFICATION_IN_PROGRESS': 'pending', 'VERIFICATION_COMPLETED': 'pending', 'AWAITING_DEPOSIT': 'awaiting_disbursement', 'DEPOSIT_PENDING': 'awaiting_disbursement', 'DEPOSIT_CONFIRMED': 'awaiting_disbursement', 'COMPLIANCE_REVIEW': 'pending', 'ADMIN_APPROVAL_PENDING': 'pending', 'APPROVED': 'approved', 'DISBURSEMENT_IN_PROGRESS': 'awaiting_disbursement', 'COMPLETED': 'settled', 'REJECTED': 'rejected', 'CANCELLED': 'rejected' };
        return map[s] || 'pending';
    };
    const status: TransactionStatus = tx ? mapStatus(tx.status) : 'pending';
    const handleBack = () => {
        if (fromSuccess === 'true') {
            router.replace('/(tabs)');
        } else {
            router.back();
        }
    };
    const handleProceed = () => {
        router.push({
            pathname: '/(sell-fx)/(resident)/payment',
            params: { transactionId }
        });
    };

    const detailsItems = useMemo(() => {
        if (!tx) return [];
        return [
            { label: 'Transaction ID', value: tx.referenceNumber },
            { label: 'Amount (₦)', value: formatCurrency(tx.nairaEquivalent) },
            { label: 'Equivalent Amount (FX)', value: formatCurrency(tx.foreignAmount, tx.currency === 'USD' ? '$' : tx.currency === 'GBP' ? '£' : tx.currency === 'EUR' ? '€' : tx.currency) },
            { label: 'Date Initiated', value: `${formatDate(tx.createdAt)}\n${formatTimeWithSeconds(tx.createdAt)}` },
            ...(tx.cashPickup ? [
                {
                    label: 'Pickup Cash Amount',
                    value: formatCurrency(tx.cashPickup.amount, (tx.cashPickup.currency || tx.currency) === 'USD' ? '$' : (tx.cashPickup.currency || tx.currency) === 'GBP' ? '£' : (tx.cashPickup.currency || tx.currency) === 'EUR' ? '€' : (tx.cashPickup.currency || tx.currency)) || 'N/A',
                },
                {
                    label: 'Pickup Status',
                    value: tx.cashPickup.status?.replace(/_/g, ' ') || 'N/A',
                },
                {
                    label: 'Pickup Location',
                    value: tx.cashPickup.pickupLocation || 'N/A',
                },
                ...(tx.cashPickup.pickupCity ? [{
                    label: 'Pickup City',
                    value: tx.cashPickup.pickupCity,
                    isRightAligned: true,
                }] : []),
                ...(tx.cashPickup.pickupState ? [{
                    label: 'Pickup State',
                    value: tx.cashPickup.pickupState,
                    isRightAligned: true,
                }] : []),
                ...(tx.cashPickup.pickupCode ? [{
                    label: 'Pickup Code',
                    value: tx.cashPickup.pickupCode,
                }] : []),
                ...(tx.cashPickup.recipientPhone ? [{
                    label: 'Recipient Phone',
                    value: tx.cashPickup.recipientPhone,
                    isRightAligned: true,
                }] : []),
                ...((tx.cashPickup.scheduledPickupDate || tx.cashPickup.schedulePickupDate) ? [{
                    label: 'Pickup Date',
                    value: formatDate(tx.cashPickup.scheduledPickupDate || tx.cashPickup.schedulePickupDate),
                    isRightAligned: true,
                }] : []),
                ...((tx.cashPickup.scheduledPickupTime || tx.cashPickup.schedulePickupTime) ? [{
                    label: 'Pickup Time',
                    value: tx.cashPickup.scheduledPickupTime || tx.cashPickup.schedulePickupTime,
                    isRightAligned: true,
                }] : []),
            ] : []),
        ];
    }, [tx]);

    const detailsDocuments = useMemo(() => {
        if (!tx) return [];
        const docs = getTransactionDocuments(tx);

        const uploadedDocs = tx.requiredDocuments.filter(d => !!d.uploaded).map(d => ({
            label: commonDocTypeLabels[d.type] || d.type.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
            fileName: d.uploaded!.fileName,
            fileUrl: d.uploaded!.fileUrl,
        }));
        return [...docs, ...uploadedDocs];
    }, [tx]);

    const docsItems = useMemo(() => {
        if (!tx) return [];
        return tx.requiredDocuments.map((d) => ({
            label: commonDocTypeLabels[d.type] || d.type.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
            fileName: d.uploaded ? d.uploaded.fileName : null,
            docStatus: d.uploaded?.status,
            required: true,
            onUpload: (!d.uploaded || d.uploaded.status === 'REQUIRES_MANUAL_REVIEW')
                ? () => uploadFile(d.type, d.uploaded?.status === 'REQUIRES_MANUAL_REVIEW')
                : undefined,
        }));
    }, [tx, uploadFile]);

    const bankAccountsItems = useMemo(() => {
        const details = tx?.beneficiaryDetails;
        if (!tx || !details) return undefined;
        const items: any[] = [];
        if (details.bankName) items.push({ label: 'Bank Name', value: details.bankName });
        if (details.accountName) items.push({ label: 'Account Name', value: details.accountName });
        if (details.accountNumber) items.push({ label: 'Account Number', value: details.accountNumber });
        return items.length > 0 ? items : undefined;
    }, [tx]);

    const getMessage = () => {
        if (!tx) return '';
        if (status === 'approved' || status === 'awaiting_disbursement' || status === 'settled') return "Congratulations! Your application has been approved. Kindly proceed to complete the transaction.";
        if (status === 'rejected') return tx.rejection?.reason || "Your request has been declined.";
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
            actionButtonTitle={status === 'approved' || status === 'awaiting_disbursement' ? "Proceed to Payment" : "Resubmit Transaction Request"}
            onActionPress={handleProceed}
        >
            {activeTab === 'overview' && (<TransactionStatusView status={status} id={tx?.referenceNumber?.slice(-6) || ''} date={tx ? formatDate(tx.createdAt) : ''} time={tx ? formatTime(tx.createdAt) : ''} message={getMessage()} comments={tx?.comments} />)}
            {activeTab === 'details' && (
                <TransactionDetailsView
                    details={detailsItems}
                    documents={detailsDocuments}
                    bankAccountsDetails={bankAccountsItems}
                    currentStep={tx?.currentStep}
                />
            )}
            {activeTab === 'docs' && (<TransactionDocsView status={status} documents={docsItems} />)}
        </TransactionViewLayout>
        </>
    );
}
