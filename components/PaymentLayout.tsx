import Header from '@/components/Header';
import PrimaryButton from '@/components/PrimaryButton';
import { useRouter } from 'expo-router';
import { Copy, InfoCircle } from 'iconsax-react-nativejs';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import * as Clipboard from 'expo-clipboard';
import { useToastStore } from '@/stores/useToastStore';
import { useGetTransactionByIdQuery } from '@/hooks/queries/transactions/useGetTransactionByIdQuery';
import { useGetDepositInstructionsQuery } from '@/hooks/queries/transactions/useGetDepositInstructionsQuery';

interface PaymentLayoutProps {
    transactionId?: string;
    amount?: string;
    onSent: () => void;
}

export default function PaymentLayout({ transactionId, amount: initialAmount, onSent }: PaymentLayoutProps) {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const showToast = useToastStore(s => s.showToast);
    const [timeLeft, setTimeLeft] = useState(1770); 

    const { data: transactionData, isLoading: isLoadingTx } = useGetTransactionByIdQuery(transactionId || '');
    const { data: depositResponse, isLoading: isLoadingDeposit } = useGetDepositInstructionsQuery(transactionId || '');
    const depositData = depositResponse?.data;

    const displayAmount = depositData?.amount
        ? `₦ ${depositData.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : initialAmount || '...';

    const formatExpiryDate = (dateStr: string | undefined | null) => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            return date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                hour12: true
            });
        } catch (e) {
            return dateStr || '';
        }
    };

    const expiryTimeStr = depositData?.expiresAt;
    const formattedExpiryDate = formatExpiryDate(expiryTimeStr);

    useEffect(() => {
        if (!expiryTimeStr) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
            }, 1000);
            return () => clearInterval(timer);
        }

        const expiryTime = new Date(expiryTimeStr).getTime();
        const updateTimer = () => {
            const now = new Date().getTime();
            const diff = Math.floor((expiryTime - now) / 1000);
            setTimeLeft(diff > 0 ? diff : 0);
        };
        updateTimer();
        const timer = setInterval(updateTimer, 1000);
        return () => clearInterval(timer);
    }, [expiryTimeStr]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleBack = () => {
        router.back();
    };

    const handleCopy = async (text: string, label: string) => {
        if (!text) return;
        await Clipboard.setStringAsync(text);
        showToast(`${label} copied to clipboard`, 'success');
    };

    const instructionsText = depositData?.instructions?.join('\n\n') ||
        `Transfer the exact amount specified to the account number provided. Kindly use your registered name as the sender’s name.\n\nThe account is valid for single use only. Complete the transfer before ${formattedExpiryDate}.\n\nYour transaction will be automatically confirmed once the deposit is received. Do not share this account number with anyone`;

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Header title="Payment" onBackPress={handleBack} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    <View style={styles.amountContainer}>
                        <View style={styles.amountHeader}>
                            <Text style={styles.amountLabel}>Amount to Send</Text>
                            <View style={styles.currencyBadge}>
                                <Image
                                    source={{ uri: 'https://flagcdn.com/w40/ng.png' }}
                                    style={styles.flag}
                                />
                                <Text style={styles.currencyText}>Naira (₦)</Text>
                            </View>
                        </View>
                        {isLoadingDeposit ? (
                            <ActivityIndicator size="small" color="#0F172A" />
                        ) : (
                            <Text style={styles.amountValue}>{displayAmount}</Text>
                        )}
                    </View>

                    <Text style={styles.sectionTitle}>Account Details</Text>

                    <View style={styles.detailsContainer}>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Account Number</Text>
                            <View style={styles.copyRow}>
                                {isLoadingDeposit ? (
                                    <ActivityIndicator size="small" color="#64748B" />
                                ) : (
                                    <>
                                        <Text style={styles.detailValue}>{depositData?.accountNumber || '...'}</Text>
                                        <TouchableOpacity onPress={() => handleCopy(depositData?.accountNumber || '', 'Account number')}>
                                            <Copy size={moderateScale(16)} color="#64748B" variant="Linear" />
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>
                        </View>
                        <View style={styles.separator} />

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Bank Name</Text>
                            <View style={styles.copyRow}>
                                {isLoadingDeposit ? (
                                    <ActivityIndicator size="small" color="#64748B" />
                                ) : (
                                    <>
                                        <Text style={styles.detailValue}>{depositData?.bankName || '...'}</Text>
                                        <TouchableOpacity onPress={() => handleCopy(depositData?.bankName || '', 'Bank name')}>
                                            <Copy size={moderateScale(16)} color="#64748B" variant="Linear" />
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>
                        </View>
                        <View style={styles.separator} />

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Account Name</Text>
                            <View style={styles.copyRow}>
                                {isLoadingDeposit ? (
                                    <ActivityIndicator size="small" color="#64748B" />
                                ) : (
                                    <>
                                        <Text style={styles.detailValue}>{depositData?.accountName || '...'}</Text>
                                        <TouchableOpacity onPress={() => handleCopy(depositData?.accountName || '', 'Account name')}>
                                            <Copy size={moderateScale(16)} color="#64748B" variant="Linear" />
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>
                        </View>
                        <View style={styles.separator} />
                    </View>

                    {/* Timer */}
                    <View style={styles.timerContainer}>
                        <Text style={styles.timerLabel}>Account Expires in</Text>
                        <Text style={styles.timerValue}>{formatTime(timeLeft)}</Text>
                    </View>

             
                    <View style={styles.infoBox}>
                        <InfoCircle size={moderateScale(20)} color="rgba(221, 79, 5, 1)" variant="Bold" style={{ marginTop: 2 }} />
                        <Text style={styles.infoText}>
                            {instructionsText}
                        </Text>
                    </View>

                    {depositData?.warningNote && (
                        <View style={styles.warningBox}>
                            <InfoCircle size={moderateScale(18)} color="#DC2626" variant="Bold" style={{ marginTop: 2 }} />
                            <Text style={styles.warningText}>
                                {depositData.warningNote}
                            </Text>
                        </View>
                    )}

                </ScrollView>
            </KeyboardAvoidingView>

            {/* Footer */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + moderateScale(10) }]}>
                <Text style={styles.footerLabel}>Have you send the Money?</Text>
                <PrimaryButton title="Yes, I have sent the Money" onPress={onSent} />
            </View>
        </View>
    );
}

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        paddingHorizontal: '20@s',
        paddingVertical: '40@vs',
        paddingBottom: '120@vs'
    },
    amountContainer: {
        backgroundColor: '#F8F9FA',
        borderRadius: '16@ms',
        padding: '14@ms',
        alignItems: 'center',
        marginBottom: '24@vs',
    },
    amountHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: '8@s',
        marginBottom: '8@vs',
    },
    amountLabel: {
        fontSize: '14@ms',
        color: '#64748B',
    },
    currencyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: '6@s',
    },
    flag: {
        width: '16@s',
        height: '12@vs',
        borderRadius: 2,
    },
    currencyText: {
        fontSize: '14@ms',
        color: '#64748B',
        fontWeight: '500',
    },
    amountValue: {
        fontSize: '26@ms',
        fontWeight: '700',
        color: '#0F172A',
        marginTop: '4@vs',
    },
    sectionTitle: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: '12@vs',
    },
    detailsContainer: {
        marginBottom: '24@vs',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: '12@vs',
    },
    detailLabel: {
        fontSize: '12@ms',
        color: '#0F172A',
        fontWeight: '500',
    },
    detailValue: {
        fontSize: '12@ms',
        color: '#64748B',
        fontWeight: '400',
        textAlign: 'right',
    },
    copyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: '2@s',
    },
    separator: {
        height: 1,
        backgroundColor: '#F1F5F9',
    },
    timerContainer: {
        alignItems: 'center',
        marginBottom: '20@vs',
    },
    timerLabel: {
        fontSize: '14@ms',
        color: '#64748B',
        marginBottom: '8@vs',
    },
    timerValue: {
        fontSize: '18@ms',
        color: '#EF4444',
        fontWeight: '700',
    },
    infoBox: {
        flexDirection: 'row',
        gap: '10@s',
        padding: '14@ms',
        backgroundColor: '#FFFFFF',
        borderRadius: '12@ms',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    infoText: {
        flex: 1,
        fontSize: '13@ms',
        color: '#64748B',
        lineHeight: '18@ms',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: '20@s',
        paddingTop: '12@vs',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        alignItems: 'center',
        gap: '10@vs',
    },
    footerLabel: {
        fontSize: '14@ms',
        color: '#64748B',
    },
    warningBox: {
        flexDirection: 'row',
        gap: '10@s',
        padding: '14@ms',
        backgroundColor: '#FEF2F2',
        borderRadius: '12@ms',
        borderWidth: 1,
        borderColor: '#FCA5A5',
        marginTop: '16@vs',
    },
    warningText: {
        flex: 1,
        fontSize: '13@ms',
        color: '#991B1B',
        lineHeight: '18@ms',
        fontWeight: '500',
    },
});
