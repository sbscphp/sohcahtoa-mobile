import LoadingBackdrop from '@/components/LoadingBackdrop';
import TransactionDetailsView from '@/components/transaction-flow/TransactionDetailsView';
import TransactionDocsView from '@/components/transaction-flow/TransactionDocsView';
import TransactionStatusView, { TransactionStatus } from '@/components/transaction-flow/TransactionStatusView';
import TransactionViewLayout from '@/components/transaction-flow/TransactionViewLayout';
import { useGetTransactionByIdQuery } from '@/hooks/queries/transactions/useGetTransactionByIdQuery';
import { useDocumentUpload } from '@/hooks/useDocumentUpload';
import { useToastStore } from '@/stores/useToastStore';
import { commonDocTypeLabels, getTransactionDocuments, getTransactionUploadedDocs, buildTransactionDocsItems, formatDate, formatTime, formatTimeWithSeconds, formatPickupTime, formatCurrency, getCurrencySymbol, mapApiStatusToViewStatus, isPaymentRequired, getTransactionMessage } from '@/utils/helpers';
import { useLocalSearchParams, useRouter, useFocusEffect, useNavigation } from 'expo-router';
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { ActivityIndicator, View, BackHandler } from 'react-native';

export default function ViewTouringScreen() {
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

    // console.log("Transaction", JSON.stringify(tx, null, 2))

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

    // console.log(JSON.stringify(tx, null, 2), "TRANSACTION");

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
            pathname: '/(buy-fx)/(touring)/payment',
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
            ...(tx.cashPickup ? [
                {
                    label: 'Pickup Cash Amount',
                    value: formatCurrency(tx?.pickupLocation?.amount, getCurrencySymbol(tx.cashPickup.currency || tx.currency)) || 'N/A',
                },
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
                    value: formatPickupTime(tx.cashPickup.scheduledPickupTime || tx.cashPickup.schedulePickupTime || tx.cashPickup.pickupTime || (tx as any).scheduledPickupTime || (tx as any).schedulePickupTime || (tx as any).pickupTime) || 'N/A',
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
    const domiciliaryItems = useMemo(() => {
        const details = tx?.beneficiaryDetails as any;
        if (!tx || !details) return undefined;
        return [
            ...(details.accountName || details.name ? [{ label: 'Account Name', value: details.accountName || details.name }] : []),
            ...(details.accountNumber ? [{ label: 'Account Number', value: details.accountNumber }] : []),
            ...(details.bankName ? [{ label: 'Bank Name', value: details.bankName }] : []),
            ...(details.studentName ? [{ label: 'Student Name', value: details.studentName }] : []),
            ...(details.studentPassportNumber ? [{ label: 'Student Passport Number', value: details.studentPassportNumber }] : []),
            ...(details.admissionNumber ? [{ label: 'Admission Number', value: details.admissionNumber }] : []),
            ...(details.address || details.bankAddress ? [{ label: 'Bank Address', value: details.address || details.bankAddress }] : []),
            ...(details.country ? [{ label: 'Country', value: details.country }] : []),
            ...(details.swiftCode ? [{ label: 'SWIFT Code', value: details.swiftCode }] : []),
            ...(details.iban ? [{ label: 'IBAN', value: details.iban }] : []),
            ...(details.routingNumber ? [{ label: 'Routing Number', value: details.routingNumber }] : []),
            ...(details.ifscCode ? [{ label: 'IFSC Code', value: details.ifscCode }] : []),
            ...(details.purposeCode ? [{ label: 'Purpose Code', value: details.purposeCode }] : []),
            ...(details.bsbCode ? [{ label: 'BSB Code', value: details.bsbCode }] : []),
        ];
    }, [tx]);

    const refundBankItems = useMemo(() => {
        const details = (tx?.refundBankDetails || tx?.paymentDetails) as any;
        if (!tx || !details || Array.isArray(details)) return undefined;
        return [
            ...(details.bankName ? [{ label: 'Bank Name', value: details.bankName }] : []),
            ...(details.accountNumber ? [{ label: 'Account Number', value: details.accountNumber }] : []),
            ...(details.accountName ? [{ label: 'Account Name', value: details.accountName }] : []),
        ];
    }, [tx]);

    const paymentDetailsItems = useMemo(() => {
        const pdList = tx?.paymentDetails as any;
        if (!tx || !pdList || !Array.isArray(pdList)) return undefined;
        const items: any[] = [];
        pdList.forEach((pd: any, idx: number) => {
            const prefix = pdList.length > 1 ? `[Payment ${idx + 1}] ` : '';
            if (pd.amount) items.push({ label: `${prefix}Amount`, value: formatCurrency(pd.amount, pd.currency === 'NGN' ? '₦' : pd.currency) });
            if (pd.settledAmount) items.push({ label: `${prefix}Settled Amount`, value: formatCurrency(pd.settledAmount, pd.currency === 'NGN' ? '₦' : pd.currency) });
            if (pd.feeAmount) items.push({ label: `${prefix}Fee Amount`, value: formatCurrency(pd.feeAmount, pd.currency === 'NGN' ? '₦' : pd.currency) });
            if (pd.sessionId) items.push({ label: `${prefix}Session ID`, value: pd.sessionId });
            if (pd.sourceAccountName) items.push({ label: `${prefix}Source Account Name`, value: pd.sourceAccountName });
            if (pd.sourceAccountNumber) items.push({ label: `${prefix}Source Account Number`, value: pd.sourceAccountNumber });
            if (pd.sourceBankName) items.push({ label: `${prefix}Source Bank Name`, value: pd.sourceBankName });
            if (pd.tranRemarks) items.push({ label: `${prefix}Remarks`, value: pd.tranRemarks });
            if (pd.status) items.push({ label: `${prefix}Status`, value: pd.status });
            if (pd.tranDateTime) items.push({ label: `${prefix}Transaction Time`, value: `${formatDate(pd.tranDateTime)}\n${formatTime(pd.tranDateTime)}` });
        });
        return items;
    }, [tx]);

    const settlementItems = useMemo(() => {
        const setl = (tx as any)?.settlement;
        if (!tx || !setl) return undefined;
        return [
            ...(setl.amount ? [{ label: 'Amount', value: formatCurrency(setl.amount, setl.currency === 'NGN' ? '₦' : setl.currency) }] : []),
            ...(setl.paymentMethod ? [{ label: 'Payment Method', value: setl.paymentMethod.replace(/_/g, ' ') }] : []),
            ...(setl.paymentReference ? [{ label: 'Payment Reference', value: setl.paymentReference }] : []),
            ...(setl.status ? [{ label: 'Status', value: setl.status }] : []),
            ...(setl.notes ? [{ label: 'Notes', value: setl.notes }] : []),
            ...(setl.depositedAt ? [{ label: 'Deposited At', value: `${formatDate(setl.depositedAt)}\n${formatTime(setl.depositedAt)}` }] : []),
            ...(setl.confirmedAt ? [{ label: 'Confirmed At', value: `${formatDate(setl.confirmedAt)}\n${formatTime(setl.confirmedAt)}` }] : []),
        ];
    }, [tx]);

    const bankAccountsItems = useMemo(() => {
        const baList = (tx as any)?.bankAccounts;
        if (!tx || !baList || !Array.isArray(baList)) return undefined;
        const items: any[] = [];
        baList.forEach((ba: any, idx: number) => {
            const prefix = baList.length > 1 ? `[Account ${idx + 1}] ` : '';
            if (ba.bankName) items.push({ label: `${prefix}Bank Name`, value: ba.bankName });
            if (ba.accountName) items.push({ label: `${prefix}Account Name`, value: ba.accountName });
            if (ba.accountNumber) items.push({ label: `${prefix}Account Number`, value: ba.accountNumber });
        });
        return items;
    }, [tx]);

    const getMessage = () => getTransactionMessage(tx, 'touring allowance request');
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
            actionButtonTitle={isPaymentRequired(tx?.status) ? "Proceed to Payment" : "Resubmit Request"}
            onActionPress={handleProceed}
        >
            {activeTab === 'overview' && (<TransactionStatusView status={status} apiStatus={tx?.status} id={tx?.referenceNumber?.slice(-6) || ''} transactionId={tx?.transactionId || transactionId} date={tx ? formatDate(tx.createdAt) : ''} time={tx ? formatTime(tx.createdAt) : ''} message={getMessage()} comments={tx?.comments} />)}
            {activeTab === 'details' && (
                <TransactionDetailsView
                    details={detailsItems}
                    documents={detailsDocuments}
                    domiciliaryDetails={domiciliaryItems}
                    refundBankDetails={refundBankItems}
                    paymentDetails={paymentDetailsItems}
                    settlementDetails={settlementItems}
                    bankAccountsDetails={bankAccountsItems}
                    currentStep={tx?.currentStep}
                />
            )}
            {activeTab === 'docs' && (<TransactionDocsView status={status} documents={docsItems} />)}
        </TransactionViewLayout>
        </>
    );
}
