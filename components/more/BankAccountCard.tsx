import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import { Bank, TickCircle, Trash } from 'iconsax-react-nativejs';

interface BankAccountCardProps {
    account: {
        id: string;
        bankName: string;
        accountNumber: string;
        accountName: string;
        isDefault?: boolean;
    };
    onMakeDefault: (id: string) => void;
    onDelete: (id: string) => void;
}

export default function BankAccountCard({
    account,
    onMakeDefault,
    onDelete,
}: BankAccountCardProps) {
    return (
        <View style={[styles.accountCard, account.isDefault && styles.defaultCard]}>
            <View style={styles.cardHeader}>
                <View style={styles.bankNameWrapper}>
                    <View style={styles.bankIconContainer}>
                        <Bank size={moderateScale(20)} color="#FF6813" variant="Bold" />
                    </View>
                    <Text style={styles.bankName} numberOfLines={1}>{account.bankName}</Text>
                </View>
                {account.isDefault ? (
                    <View style={styles.defaultBadge}>
                        <TickCircle size={moderateScale(12)} color="#10B981" variant="Bold" />
                        <Text style={styles.defaultText}>Default</Text>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.makeDefaultBtn}
                        onPress={() => onMakeDefault(account.id)}
                    >
                        <Text style={styles.makeDefaultText}>Set Default</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.cardDetails}>
                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Account Number</Text>
                    <Text style={styles.detailValue}>{account.accountNumber}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Account Name</Text>
                    <Text style={styles.detailValue} numberOfLines={1}>{account.accountName}</Text>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => onDelete(account.id)}
                >
                    <Trash size={moderateScale(16)} color="#EF4444" variant="Linear" />
                    <Text style={styles.deleteBtnText}>Remove Account</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = ScaledSheet.create({
    accountCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: '16@ms',
        padding: '16@ms',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
    },
    defaultCard: {
        borderColor: '#FF6813',
        backgroundColor: '#FFFFFF',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        paddingBottom: '12@vs',
        marginBottom: '12@vs',
    },
    bankNameWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: '8@ms',
        flex: 1,
    },
    bankIconContainer: {
        width: '32@ms',
        height: '32@ms',
        borderRadius: '16@ms',
        backgroundColor: '#FFF5F1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bankName: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#0F172A',
        flex: 1,
    },
    defaultBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: '4@ms',
        backgroundColor: '#ECFDF5',
        paddingHorizontal: '8@s',
        paddingVertical: '4@vs',
        borderRadius: '12@ms',
    },
    defaultText: {
        fontSize: '11@ms',
        fontWeight: '600',
        color: '#10B981',
    },
    makeDefaultBtn: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: '10@s',
        paddingVertical: '6@vs',
        borderRadius: '20@ms',
    },
    makeDefaultText: {
        fontSize: '11@ms',
        fontWeight: '600',
        color: '#475569',
    },
    cardDetails: {
        gap: '8@vs',
        marginBottom: '12@vs',
    },
    detailItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: '12@ms',
        color: '#64748B',
    },
    detailValue: {
        fontSize: '13@ms',
        fontWeight: '600',
        color: '#0F172A',
        maxWidth: '65%',
        textAlign: 'right',
    },
    cardFooter: {
        borderTopWidth: 1,
        borderTopColor: '#F8FAFC',
        paddingTop: '10@vs',
        alignItems: 'flex-end',
    },
    deleteBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: '6@ms',
        paddingVertical: '4@vs',
        paddingHorizontal: '8@s',
    },
    deleteBtnText: {
        fontSize: '12@ms',
        fontWeight: '500',
        color: '#EF4444',
    },
});
