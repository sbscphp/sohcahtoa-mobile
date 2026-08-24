import LoadingBackdrop from '@/components/LoadingBackdrop';
import TransactionDetailsView from '@/components/transaction-flow/TransactionDetailsView';
import TransactionDocsView from '@/components/transaction-flow/TransactionDocsView';
import TransactionStatusView, { TransactionStatus } from '@/components/transaction-flow/TransactionStatusView';
import TransactionViewLayout from '@/components/transaction-flow/TransactionViewLayout';
import { useGetTransactionByIdQuery } from '@/hooks/queries/transactions/useGetTransactionByIdQuery';
import { useDocumentUpload } from '@/hooks/useDocumentUpload';
import { useToastStore } from '@/stores/useToastStore';
import { commonDocTypeLabels, getTransactionDocuments, getTransactionUploadedDocs, buildTransactionDocsItems, formatDate, formatTime, formatTimeWithSeconds, formatCurrency, getCurrencySymbol, mapApiStatusToViewStatus, isPaymentRequired, getTransactionMessage } from '@/utils/helpers';
import { useLocalSearchParams, useRouter, useFocusEffect, useNavigation } from 'expo-router';
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { ActivityIndicator, View, BackHandler } from 'react-native';

export default function ViewExpatriateScreen() {
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
    console.log(JSON.stringify(tx, null, 2), "EXPAT TX");

    const { upload: uploadFile, isPending: isUploading } = useDocumentUpload({
        transactionId: transactionId || undefined,
        onSuccess: () => {},
        onError: () => showToast('Failed to upload document. Please try again.', 'error'),
    });

    const status: TransactionStatus = tx ? mapApiStatusToViewStatus(tx.status) : 'pending';
    const handleBack = () => {
        if (fromSuccess === 'true') {
            router.replace('/(tabs)');
        } else {
            router.back();
        }
    };
    const handleProceed = () => {
        router.push({
            pathname: '/(sell-fx)/(expatriate)/payment',
            params: { transactionId }
        });
    };

    const detailsItems = useMemo(() => {
        if (!tx) return [];
        return [
            { label: 'Transaction ID', value: tx.referenceNumber },
            { label: 'Amount (₦)', value: formatCurrency(tx.nairaEquivalent) },
            { label: 'Equivalent Amount (FX)', value: formatCurrency(tx.foreignAmount, getCurrencySymbol(tx.currency)) },
            { label: 'Date Initiated', value: `${formatDate(tx.createdAt)}\n${formatTimeWithSeconds(tx.createdAt)}` },
            ...((tx as any).payoutMethod ? [{
                label: 'Payout Method',
                value: (tx as any).payoutMethod
            }] : []),
            ...(tx.cashPickup ? [
                {
                    label: 'Pickup Location',
                    value: tx.cashPickup.pickupCity || tx.cashPickup.pickupLocation || 'N/A',
                },
                 {
                    label: 'Pickup Address',
                    value: tx.cashPickup.pickupAddress || tx.pickupLocation?.address,
                    isRightAligned: true,
                },
                {
                    label: 'Pickup Phone',
                    value: tx.cashPickup.pickupPhone || "N/A",
                    isRightAligned: true,
                },
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
                {
                    label: 'Scheduled Date',
                    value: (tx.cashPickup.scheduledPickupDate || tx.cashPickup.schedulePickupDate || tx.cashPickup.pickupDate || (tx as any).scheduledPickupDate || (tx as any).schedulePickupDate || (tx as any).pickupDate) ? formatDate(tx.cashPickup.scheduledPickupDate || tx.cashPickup.schedulePickupDate || tx.cashPickup.pickupDate || (tx as any).scheduledPickupDate || (tx as any).schedulePickupDate || (tx as any).pickupDate) : 'N/A',
                    isRightAligned: true,
                },
                {
                    label: 'Scheduled Time',
                    value: tx.cashPickup.scheduledPickupTime || tx.cashPickup.schedulePickupTime || tx.cashPickup.pickupTime || (tx as any).scheduledPickupTime || (tx as any).schedulePickupTime || (tx as any).pickupTime || 'N/A',
                    isRightAligned: true,
                },
            ] : []),
        ];
    }, [tx]);
    const detailsDocuments = useMemo(() => {
        if (!tx) return [];
        const docs = getTransactionDocuments(tx);
        const uploadedDocs = getTransactionUploadedDocs(tx);
        return [...docs, ...uploadedDocs];
    }, [tx]);

    const docsItems = useMemo(() => {
        return buildTransactionDocsItems(tx, uploadFile);
    }, [tx, uploadFile]);

    const beneficiaryDetailsItems = useMemo(() => {
        const details = tx?.beneficiaryDetails;
        if (!tx || !details) return undefined;
        const items: any[] = [];
        if (details.bankName) items.push({ label: 'Bank Name', value: details.bankName });
        if (details.accountName) items.push({ label: 'Account Name', value: details.accountName });
        if (details.accountNumber) items.push({ label: 'Account Number', value: details.accountNumber });
        return items.length > 0 ? items : undefined;
    }, [tx]);

    const bankAccountsItems = useMemo(() => {
        const details = tx?.refundBankDetails;
        if (!tx || !details) return undefined;
        const items: any[] = [];
        if (details.bankName) items.push({ label: 'Bank Name', value: details.bankName });
        if (details.accountName) items.push({ label: 'Account Name', value: details.accountName });
        if (details.accountNumber) items.push({ label: 'Account Number', value: details.accountNumber });
        if ('swiftCode' in details && details.swiftCode) items.push({ label: 'SWIFT Code', value: details.swiftCode });
        if ('routingNumber' in details && details.routingNumber) items.push({ label: 'Routing Number', value: details.routingNumber });
        if ('bankAddress' in details && details.bankAddress) items.push({ label: 'Bank Address', value: details.bankAddress });
        return items.length > 0 ? items : undefined;
    }, [tx]);

    const getMessage = () => getTransactionMessage(tx, 'application');
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
            showActionButton={isPaymentRequired(tx?.status) || status === 'more_info'}
            actionButtonTitle={isPaymentRequired(tx?.status) ? "Proceed to Payment" : "Resubmit Transaction Request"}
            onActionPress={handleProceed}
        >
            {activeTab === 'overview' && (<TransactionStatusView status={status} apiStatus={tx?.status} id={tx?.referenceNumber?.slice(-6) || ''} date={tx ? formatDate(tx.createdAt) : ''} time={tx ? formatTime(tx.createdAt) : ''} message={getMessage()} comments={tx?.comments} />)}
            {activeTab === 'details' && (
                <TransactionDetailsView
                    details={detailsItems}
                    documents={detailsDocuments}
                    beneficiaryDetails={beneficiaryDetailsItems}
                    bankAccountsDetails={bankAccountsItems}
                    currentStep={tx?.currentStep}
                />
            )}
            {activeTab === 'docs' && (<TransactionDocsView status={status} documents={docsItems} />)}
        </TransactionViewLayout>
        </>
    );
}
