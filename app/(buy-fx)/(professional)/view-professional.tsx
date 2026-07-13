import LoadingBackdrop from '@/components/LoadingBackdrop';
import TransactionDetailsView from '@/components/transaction-flow/TransactionDetailsView';
import TransactionDocsView from '@/components/transaction-flow/TransactionDocsView';
import TransactionStatusView, { TransactionStatus } from '@/components/transaction-flow/TransactionStatusView';
import TransactionViewLayout from '@/components/transaction-flow/TransactionViewLayout';
import { useGetTransactionByIdQuery } from '@/hooks/queries/transactions/useGetTransactionByIdQuery';
import { useDocumentUpload } from '@/hooks/useDocumentUpload';
import { useToastStore } from '@/stores/useToastStore';
import { commonDocTypeLabels, formatCurrency, formatDate, formatTime, formatTimeWithSeconds, getTransactionDocuments, getCurrencySymbol } from '@/utils/helpers';
import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, BackHandler, View } from 'react-native';

export default function ViewProfessionalScreen() {
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

    // console.log(JSON.stringify(tx, null, 2), "PROFESSIONAL");

    const { upload: uploadFile, isPending: isUploading } = useDocumentUpload({
        transactionId: transactionId || undefined,
        onSuccess: () => { },
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
            pathname: '/(buy-fx)/(professional)/payment',
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
                    label: 'Pickup Location',
                    value: tx.cashPickup.pickupLocation || 'N/A',
                    isRightAligned: true
                },
                ...((tx.cashPickup.scheduledPickupDate || tx.cashPickup.schedulePickupDate) ? [{
                    label: 'Pickup Date',
                    value: formatDate(tx.cashPickup.scheduledPickupDate || tx.cashPickup.schedulePickupDate),
                    isRightAligned: true
                }] : []),
                ...((tx.cashPickup.scheduledPickupTime || tx.cashPickup.schedulePickupTime) ? [{
                    label: 'Pickup Time',
                    value: tx.cashPickup.scheduledPickupTime || tx.cashPickup.schedulePickupTime,
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

    const getVal = (primaryVal: any, ...keys: string[]): any => {
        if (primaryVal !== undefined && primaryVal !== null && primaryVal !== '') {
            return primaryVal;
        }
        if (tx?.steps && Array.isArray(tx.steps)) {
            for (const step of tx.steps) {
                if (step.data && typeof step.data === 'object') {
                    for (const key of keys) {
                        const keyParts = key.split('.');
                        let current = step.data;
                        for (const k of keyParts) {
                            if (current && typeof current === 'object') {
                                current = current[k];
                            } else {
                                current = undefined;
                                break;
                            }
                        }
                        if (current !== undefined && current !== null && current !== '') {
                            return current;
                        }
                    }
                }
            }
        }
        return undefined;
    };

    const beneficiaryItems = useMemo(() => {
        if (!tx) return undefined;

        const memberNumber = getVal((tx as any).memberNumber || (tx.personalInfo as any)?.memberNumber, 'memberNumber');
        const organizationName = getVal((tx.beneficiaryDetails as any)?.organizationName, 'organizationName', 'beneficiaryDetails.organizationName');
        const bankAccountName = getVal((tx.beneficiaryDetails as any)?.bankAccountName, 'bankAccountName', 'beneficiaryDetails.bankAccountName');
        const beneficiaryAddress = getVal((tx.beneficiaryDetails as any)?.address || (tx.beneficiaryDetails as any)?.beneficiaryAddress, 'address', 'beneficiaryDetails.address', 'beneficiaryAddress', 'beneficiaryDetails.beneficiaryAddress');
        const country = getVal((tx.beneficiaryDetails as any)?.country || (tx.beneficiaryDetails as any)?.beneficiaryCountry, 'country', 'beneficiaryDetails.country', 'beneficiaryCountry', 'beneficiaryDetails.beneficiaryCountry');
        const bankName = getVal((tx.beneficiaryDetails as any)?.bankName, 'bankName', 'beneficiaryDetails.bankName');
        const bankAccountNumber = getVal((tx.beneficiaryDetails as any)?.bankAccountNumber || (tx.beneficiaryDetails as any)?.accountNumber, 'bankAccountNumber', 'beneficiaryDetails.bankAccountNumber', 'accountNumber', 'beneficiaryDetails.accountNumber');
        const bankAccountAddress = getVal((tx.beneficiaryDetails as any)?.bankAccountAddress || (tx.beneficiaryDetails as any)?.bankAddress, 'bankAccountAddress', 'beneficiaryDetails.bankAccountAddress', 'bankAddress', 'beneficiaryDetails.bankAddress');
        const bankAccountSwiftCode = getVal((tx.beneficiaryDetails as any)?.bankAccountSwiftCode || (tx.beneficiaryDetails as any)?.swiftCode, 'bankAccountSwiftCode', 'beneficiaryDetails.bankAccountSwiftCode', 'swiftCode', 'beneficiaryDetails.swiftCode');
        const paymentReference = getVal((tx.beneficiaryDetails as any)?.paymentReference, 'paymentReference', 'beneficiaryDetails.paymentReference');
        const bankAccountIban = getVal((tx.beneficiaryDetails as any)?.bankAccountIban || (tx.beneficiaryDetails as any)?.iban, 'bankAccountIban', 'beneficiaryDetails.bankAccountIban', 'iban', 'beneficiaryDetails.iban');
        const routingNumber = getVal((tx.beneficiaryDetails as any)?.routingNumber, 'routingNumber', 'beneficiaryDetails.routingNumber');
        const ifscCode = getVal((tx.beneficiaryDetails as any)?.ifscCode, 'ifscCode', 'beneficiaryDetails.ifscCode');
        const purposeCode = getVal((tx.beneficiaryDetails as any)?.purposeCode, 'purposeCode', 'beneficiaryDetails.purposeCode');
        const bsbCode = getVal((tx.beneficiaryDetails as any)?.bsbCode, 'bsbCode', 'beneficiaryDetails.bsbCode');

        const correspondenceBankName = getVal((tx.beneficiaryDetails as any)?.correspondenceBankName, 'correspondenceBankName', 'beneficiaryDetails.correspondenceBankName');
        const correspondenceBankAddress = getVal((tx.beneficiaryDetails as any)?.correspondenceBankAddress, 'correspondenceBankAddress', 'beneficiaryDetails.correspondenceBankAddress');
        const correspondenceBankSwiftCode = getVal((tx.beneficiaryDetails as any)?.correspondenceBankSwiftCode, 'correspondenceBankSwiftCode', 'beneficiaryDetails.correspondenceBankSwiftCode');

        return [
            ...(memberNumber ? [{ label: 'Membership / Registration Number', value: memberNumber }] : []),
            ...(organizationName ? [{ label: 'Organization Name', value: organizationName }] : []),
            ...(bankAccountName ? [{ label: 'Beneficiary Name', value: bankAccountName }] : []),
            ...(beneficiaryAddress ? [{ label: 'Beneficiary Address', value: beneficiaryAddress }] : []),
            ...(country ? [{ label: 'Country', value: country }] : []),
            ...(bankName ? [{ label: 'Bank Name', value: bankName }] : []),
            ...(bankAccountNumber ? [{ label: 'Account Number', value: bankAccountNumber }] : []),
            ...(bankAccountAddress ? [{ label: 'Bank Address', value: bankAccountAddress }] : []),
            ...(bankAccountSwiftCode ? [{ label: 'SWIFT Code', value: bankAccountSwiftCode }] : []),
            ...(paymentReference ? [{ label: 'Payment Reference / ID', value: paymentReference }] : []),
            ...(bankAccountIban ? [{ label: 'IBAN', value: bankAccountIban }] : []),
            ...(routingNumber ? [{ label: 'Routing Number', value: routingNumber }] : []),
            ...(ifscCode ? [{ label: 'IFSC Code', value: ifscCode }] : []),
            ...(purposeCode ? [{ label: 'Purpose Code', value: purposeCode }] : []),
            ...(bsbCode ? [{ label: 'BSB Code', value: bsbCode }] : []),

            ...(correspondenceBankName ? [{ label: 'Correspondence Bank Name', value: correspondenceBankName }] : []),
            ...(correspondenceBankAddress ? [{ label: 'Correspondence Bank Address', value: correspondenceBankAddress }] : []),
            ...(correspondenceBankSwiftCode ? [{ label: 'Correspondence Bank SWIFT', value: correspondenceBankSwiftCode }] : []),
        ];
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

    const getMessage = () => {
        if (!tx) return '';
        if (status === 'approved' || status === 'awaiting_disbursement' || status === 'settled') return "Congratulations! Your exam payment request has been approved. Please proceed to payment.";
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
