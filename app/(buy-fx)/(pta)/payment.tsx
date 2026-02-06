import Header from '@/components/Header';
import PrimaryButton from '@/components/PrimaryButton';
import { useRouter } from 'expo-router';
import { Copy, InfoCircle } from 'iconsax-react-nativejs';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';

export default function PaymentScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [timeLeft, setTimeLeft] = useState(1770); // 29:30 in seconds

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleBack = () => {
        router.back();
    };

    const handleSent = () => {
        router.push('/(buy-fx)/(pta)/payment-success');
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Header title="Payment" onBackPress={handleBack} />

            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Amount Section */}
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
                    <Text style={styles.amountValue}>₦ 2,466,156.00</Text>
                </View>

                {/* Account Details */}
                <Text style={styles.sectionTitle}>Account Details</Text>

                <View style={styles.detailsContainer}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Account Number</Text>
                        <View style={styles.copyRow}>
                            <Text style={styles.detailValue}>0069000592</Text>
                            <TouchableOpacity>
                                <Copy size={moderateScale(16)} color="#64748B" variant="Linear" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.separator} />

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Bank Name</Text>
                        <Text style={styles.detailValue}>Access bank PLC</Text>
                    </View>
                    <View style={styles.separator} />

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Account Name</Text>
                        <Text style={styles.detailValue}>SOHCAHTOA BDC LTD</Text>
                    </View>
                    <View style={styles.separator} />
                </View>

                {/* Timer */}
                <View style={styles.timerContainer}>
                    <Text style={styles.timerLabel}>Account Expires in</Text>
                    <Text style={styles.timerValue}>{formatTime(timeLeft)}</Text>
                </View>

                {/* Info Box */}
                <View style={styles.infoBox}>
                    <InfoCircle size={moderateScale(20)} color="#FF6813" variant="Bold" style={{ marginTop: 2 }} />
                    <Text style={styles.infoText}>
                        Once approved, 75% of your funds will be sent to your bank account or prepaid card, while the remaining 25% will be available for cash pickup at the nearest branch (passport endorsement required)
                    </Text>
                </View>

            </ScrollView>

            {/* Footer */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + moderateScale(10) }]}>
                <Text style={styles.footerLabel}>Have you send the Money?</Text>
                <PrimaryButton title="Yes, I have sent the Money" onPress={handleSent} />
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
        paddingVertical: '20@vs',
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
        fontSize: '14@ms',
        color: '#0F172A',
        fontWeight: '500',
    },
    detailValue: {
        fontSize: '14@ms',
        color: '#64748B',
        fontWeight: '400',
        textAlign: 'right',
    },
    copyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: '8@s',
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
});
