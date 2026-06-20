import LoadingBackdrop from '@/components/LoadingBackdrop';
import TransactionDetailsView from '@/components/transaction-flow/TransactionDetailsView';
import TransactionDocsView from '@/components/transaction-flow/TransactionDocsView';
import TransactionStatusView, { TransactionStatus } from '@/components/transaction-flow/TransactionStatusView';
import TransactionViewLayout from '@/components/transaction-flow/TransactionViewLayout';
import { useGetTransactionByIdQuery } from '@/hooks/queries/transactions/useGetTransactionByIdQuery';
import { useDocumentUpload } from '@/hooks/useDocumentUpload';
import { useToastStore } from '@/stores/useToastStore';
import { commonDocTypeLabels, getTransactionDocuments, formatDate, formatTime, formatTimeWithSeconds, formatCurrency } from '@/utils/helpers';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import React, { useMemo, useState, useCallback } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function ViewSchoolFeesScreen() {
    const router = useRouter();
    const { transactionId } = useLocalSearchParams<{ transactionId: string }>();
    const [activeTab, setActiveTab] = useState('overview');

    const { data: txResponse, isLoading, refetch } = useGetTransactionByIdQuery(transactionId || '');
    const tx = txResponse?.data;
    const showToast = useToastStore(s => s.showToast);

    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch])
    );

    // console.log(JSON.stringify(tx, null, 2), "TX");

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

    const detailsItems = useMemo(() => {
        if (!tx) return [];
        return [
            { label: 'Transaction ID', value: tx.referenceNumber },
            { label: 'Amount (₦)', value: formatCurrency(tx.nairaEquivalent) },
            { label: 'Equivalent Amount (FX)', value: formatCurrency(tx.foreignAmount, tx.currency === 'USD' ? '$' : tx.currency === 'GBP' ? '£' : tx.currency === 'EUR' ? '€' : tx.currency) },
            { label: 'Date Initiated', value: `${formatDate(tx.createdAt)}\n${formatTimeWithSeconds(tx.createdAt)}` },
            ...(tx.cashPickup ? [
                {
                    label: 'Pickup Location',
                    value: tx.cashPickup.pickupLocation || 'N/A',
                    isRightAligned: true
                },
                ...(tx.cashPickup.scheduledPickupDate ? [{
                    label: 'Pickup Date',
                    value: formatDate(tx.cashPickup.scheduledPickupDate),
                    isRightAligned: true
                }] : []),
                ...(tx.cashPickup.scheduledPickupTime ? [{
                    label: 'Pickup Time',
                    value: tx.cashPickup.scheduledPickupTime,
                    isRightAligned: true
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
    
    const beneficiaryItems = useMemo(() => {
        const details = (tx?.beneficiaryDetails || tx?.paymentDetails) as any;
        if (!tx || !details) return undefined;
        return [
            ...(details.studentName ? [{ label: 'Student Name', value: details.studentName }] : []),
            ...(details.studentPassportNumber ? [{ label: 'Student Passport Number', value: details.studentPassportNumber }] : []),
            ...(details.admissionNumber ? [{ label: 'Admission Number', value: details.admissionNumber }] : []),
            { label: 'Beneficiary Name', value: details.bankAccountName || details.name },
            ...(details.address ? [{ label: 'Beneficiary Address', value: details.address }] : []),
            ...(details.country ? [{ label: 'Country', value: details.country }] : []),
            { label: 'Bank Name', value: details.bankName },
            { label: 'Account Number', value: details.bankAccountNumber || details.accountNumber },
            ...(details.bankAccountAddress || details.bankAddress ? [{ label: 'Bank Address', value: details.bankAccountAddress || details.bankAddress }] : []),
            ...(details.bankAccountSwiftCode || details.swiftCode ? [{ label: 'SWIFT Code', value: details.bankAccountSwiftCode || details.swiftCode }] : []),
            ...(details.paymentReference ? [{ label: 'Payment Reference', value: details.paymentReference }] : []),
            ...(details.bankAccountIban || details.iban ? [{ label: 'IBAN', value: details.bankAccountIban || details.iban }] : []),
            ...(details.routingNumber ? [{ label: 'Routing Number', value: details.routingNumber }] : []),
            ...(details.ifscCode ? [{ label: 'IFSC Code', value: details.ifscCode }] : []),
            ...(details.purposeCode ? [{ label: 'Purpose Code', value: details.purposeCode }] : []),
            ...(details.bsbCode ? [{ label: 'BSB Code', value: details.bsbCode }] : []),
            ...(details.correspondenceBankName ? [
                { label: 'Correspondence Bank Name', value: details.correspondenceBankName },
                { label: 'Correspondence Bank Address', value: details.correspondenceBankAddress },
                { label: 'Correspondence Bank Swift Code', value: details.correspondenceBankSwiftCode },
            ] : []),
        ];
    }, [tx]);

    const docsItems = useMemo(() => {
        if (!tx) return [];
        return tx.requiredDocuments.map((d) => ({
            label: commonDocTypeLabels[d.type] || d.type.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
            fileName: d.uploaded ? d.uploaded.fileName : null,
            docStatus: d.uploaded?.status,
            required: true,
            onUpload: (!d.uploaded || (d.uploaded.status !== 'FAILED' && d.uploaded.status !== 'REJECTED'))
                ? () => uploadFile(d.type)
                : undefined,
        }));
    }, [tx, uploadFile]);
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
            items.push({ label: `${prefix}Default`, value: ba.isDefault ? 'Yes' : 'No' });
            items.push({ label: `${prefix}Verified`, value: ba.isVerified ? 'Yes' : 'No' });
        });
        return items;
    }, [tx]);



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
            {activeTab === 'overview' && (<TransactionStatusView status={status} id={tx?.referenceNumber?.slice(-6) || ''} date={tx ? formatDate(tx.createdAt) : ''} time={tx ? formatTime(tx.createdAt) : ''} message={getMessage()} comments={tx?.comments} />)}
            {activeTab === 'details' && (
                <TransactionDetailsView
                    details={detailsItems}
                    documents={detailsDocuments}
                    beneficiaryDetails={beneficiaryItems}
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
