import Header from '@/components/Header';
import PrimaryButton from '@/components/PrimaryButton';
import ProgressBar from '@/components/ProgressBar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { InfoCircle } from 'iconsax-react-nativejs';
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';

// Placeholder icons 
const WesternUnionIcon = () => (
    <View style={styles.iconPlaceholderYellow}>
        <Text style={styles.iconTextBlack}>W</Text>
    </View>
);

export default function VerificationResultScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();

    // Params
    const status = params.status as 'verified' | 'not-verified';
    const reference = params.reference as string;
    const senderName = params.senderName as string;

    // Mock data for verified state
    const amount = "$ 5,000.00";
    const receiverName = "Adeola Aderinsola";

    const isVerified = status === 'verified';

    return (
        <View style={styles.container}>
            <Header title="Receive Funds: IMTO" />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <ProgressBar step={2} totalSteps={6} />
                    {isVerified ? (
                        <Text style={styles.sectionTitle}>Reference Details</Text>
                    ) : (
                        <Text style={styles.sectionTitle}>Reference Details</Text>
                    )}

                    <View style={styles.infoBanner}>
                        <InfoCircle size={moderateScale(20)} color="#F97316" variant="Bold" />
                        <Text style={styles.infoText}>
                            Maximum USD cash pickup is <Text style={{ fontWeight: '700' }}>$500</Text>
                        </Text>
                    </View>

                    {/* Transaction Details Card */}
                    <View style={styles.detailsContainer}>
                        <Text style={styles.detailsHeader}>Transaction Details</Text>

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Reference</Text>
                            <Text style={styles.detailValue}>{reference}</Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Senders Name</Text>
                            <Text style={styles.detailValue}>{senderName}</Text>
                        </View>

                        <View style={styles.divider} />

                        {isVerified ? (
                            <>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Amount</Text>
                                    <Text style={styles.detailValue}>{amount}</Text>
                                </View>

                                <View style={styles.divider} />

                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Receiver's Name</Text>
                                    <Text style={styles.detailValue}>{receiverName}</Text>
                                </View>

                                <View style={styles.divider} />

                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Status</Text>
                                    <View style={styles.statusBadgeVerified}>
                                        <Text style={styles.statusTextVerified}>Verified</Text>
                                    </View>
                                </View>
                            </>
                        ) : (
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Status</Text>
                                <View style={styles.statusBadgeNotVerified}>
                                    <Text style={styles.statusTextNotVerified}>Not Verified</Text>
                                </View>
                            </View>
                        )}
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>

            <View style={styles.footer}>
                {isVerified ? (
                    <PrimaryButton
                        title="Proceed to disbursement"
                        onPress={() => {
                            router.push('/(receive-fx)/receiving-options');
                        }}
                    />
                ) : (
                    <PrimaryButton
                        title="Retry"
                        onPress={() => router.back()}
                    />
                )}

            </View>
        </View>
    );
}

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingTop: '40@vs',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: '20@ms',
        paddingTop: '16@vs',
        paddingBottom: '100@vs',
    },
    sectionTitle: {
        fontSize: '16@ms',
        fontWeight: '600',
        color: '#0F172A',
        marginTop: '24@vs',
        marginBottom: '16@vs',
    },
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#94A3B8',
        borderRadius: '8@ms',
        padding: '12@ms',
        gap: '12@s',
        marginBottom: '24@vs',
    },
    infoText: {
        fontSize: '13@ms',
        color: '#64748B',
        flex: 1,
    },
    detailsContainer: {
        backgroundColor: '#F8FAFC', // Or white? Design looks clean. 
        // Actually designs usually don't have a background container for the list, 
        // but the "Transaction Details" title suggests a section. 
        // The image shows the details list just on the white background.
    },
    detailsHeader: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: '16@vs',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: '8@vs',
    },
    detailLabel: {
        fontSize: '14@ms',
        color: '#64748B',
        fontWeight: '400',
    },
    detailValue: {
        fontSize: '14@ms',
        color: '#334155',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginVertical: '8@vs',
    },
    statusBadgeVerified: {
        backgroundColor: '#DCFCE7',
        paddingHorizontal: '12@s',
        paddingVertical: '4@vs',
        borderRadius: '12@ms',
    },
    statusTextVerified: {
        color: '#166534',
        fontSize: '12@ms',
        fontWeight: '600',
    },
    statusBadgeNotVerified: {
        backgroundColor: '#FEE2E2',
        paddingHorizontal: '12@s',
        paddingVertical: '4@vs',
        borderRadius: '12@ms',
    },
    statusTextNotVerified: {
        color: '#991B1B',
        fontSize: '12@ms',
        fontWeight: '600',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '20@ms',
        paddingBottom: '30@vs',
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    iconPlaceholderYellow: {
        width: '32@ms',
        height: '32@ms',
        borderRadius: '4@ms',
        backgroundColor: '#FACC15',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '16@vs'
    },
    iconTextBlack: {
        color: '#000000',
        fontWeight: '900',
        fontSize: '18@ms',
    },
});
