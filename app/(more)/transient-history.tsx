import Header from '@/components/Header';
import { useRouter } from 'expo-router';
import { DocumentText, EmptyWallet, Export } from 'iconsax-react-nativejs';
import React, { useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, ScaledSheet } from 'react-native-size-matters';
import { useGetWalletLedgerQuery } from '@/hooks/queries/wallet/useGetWalletLedgerQuery';
import { formatCurrency, formatListDate, formatListTime, getSectionTitle } from '@/utils/helpers';
import { WalletLedgerEntry } from '@/types/api/wallet';

const groupEntriesByDate = (entries: WalletLedgerEntry[]) => {
    const groups: Record<string, WalletLedgerEntry[]> = {};
    entries.forEach((entry) => {
        const dateKey = new Date(entry.createdAt).toDateString();
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(entry);
    });
    return Object.entries(groups).map(([_, data]) => ({
        title: getSectionTitle(data[0].createdAt),
        data,
    }));
};

export default function TransientHistoryScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [page, setPage] = useState(1);
    const LIMIT = 10;

    const { data: ledgerData, isLoading } = useGetWalletLedgerQuery({ page, limit: LIMIT });

    const entries = ledgerData?.entries || [];
    const totalPages = ledgerData?.meta?.totalPages || 1;
    const currentBalance = ledgerData?.data?.balance;
    const currentCurrency = ledgerData?.data?.currency || 'NGN';

    const groups = useMemo(() => groupEntriesByDate(entries), [entries]);

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <EmptyWallet size={moderateScale(64)} color="#94A3B8" variant="Linear" />
            <Text style={styles.emptyTitle}>No Ledger Entries</Text>
            <Text style={styles.emptyDesc}>There are no transactions recorded in your wallet yet.</Text>
        </View>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Header
                title="Transient History"
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#FF6B2C" />
                    </View>
                ) : entries.length === 0 ? (
                    renderEmptyState()
                ) : (
                    <>
                        {groups.map((group, groupIdx) => (
                            <View key={groupIdx} style={styles.groupContainer}>
                                <Text style={styles.sectionHeader}>{group.title}</Text>
                                <View style={styles.listContainer}>
                                    {group.data.map((item, index) => {
                                        const isLast = index === group.data.length - 1;
                                        const isCredit = item.type === 'CREDIT';
                                        const currencySymbol = currentCurrency === 'USD' ? '$' : currentCurrency === 'EUR' ? '€' : '₦';
                                        const amountText = `${isCredit ? '+' : '-'}${formatCurrency(item.amount, currencySymbol)}`;

                                        return (
                                            <View key={item.id}>
                                                <TouchableOpacity 
                                                    style={styles.transactionItem}
                                                    activeOpacity={0.8}
                                                >
                                                    <View style={styles.iconContainer}>
                                                        <EmptyWallet 
                                                            size={moderateScale(18)} 
                                                            color={isCredit ? '#16A34A' : '#EF4444'} 
                                                            variant="Linear" 
                                                        />
                                                    </View>
                                                    <View style={styles.itemContent}>
                                                        <Text style={styles.itemTitle}>{item.description}</Text>
                                                        <Text style={styles.itemDate}>
                                                            {formatListDate(item.createdAt)} • {formatListTime(item.createdAt)}
                                                        </Text>
                                                    </View>
                                                    <View style={styles.itemRight}>
                                                        <Text style={[styles.itemAmount, { color: isCredit ? '#16A34A' : '#EF4444' }]}>
                                                            {amountText}
                                                        </Text>
                                                        <Text style={styles.itemStatus}>{item.status}</Text>
                                                    </View>
                                                </TouchableOpacity>
                                                {!isLast && <View style={styles.divider} />}
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>
                        ))}

                        {totalPages > 1 && (
                            <View style={styles.paginationContainer}>
                                <TouchableOpacity
                                    style={[styles.paginationButton, page === 1 && styles.paginationButtonDisabled]}
                                    disabled={page === 1}
                                    onPress={() => setPage(p => Math.max(1, p - 1))}
                                >
                                    <Text style={[styles.paginationButtonText, page === 1 && styles.paginationButtonTextDisabled]}>
                                        Previous
                                    </Text>
                                </TouchableOpacity>

                                <Text style={styles.paginationInfo}>
                                    Page {page} of {totalPages}
                                </Text>

                                <TouchableOpacity
                                    style={[styles.paginationButton, page === totalPages && styles.paginationButtonDisabled]}
                                    disabled={page === totalPages}
                                    onPress={() => setPage(p => Math.min(totalPages, p + 1))}
                                >
                                    <Text style={[styles.paginationButtonText, page === totalPages && styles.paginationButtonTextDisabled]}>
                                        Next
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </View>
    );
}

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    headerRightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: '8@s',
    },
    headerBtn: {
        padding: '2@ms',
    },
    scrollContent: {
        paddingHorizontal: '16@s',
        paddingBottom: '30@vs',
    },
    balanceCard: {
        marginTop: '16@vs',
        backgroundColor: '#0F172A',
        borderRadius: '16@ms',
        padding: '20@ms',
        gap: '8@vs',
    },
    balanceLabel: {
        fontSize: '13@ms',
        color: '#94A3B8',
        fontWeight: '500',
    },
    balanceAmount: {
        fontSize: '24@ms',
        fontWeight: '700',
        color: '#FFFFFF',
    },
    groupContainer: {
        marginTop: '20@vs',
    },
    sectionHeader: {
        fontSize: '15@ms',
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: '12@vs',
    },
    listContainer: {
        backgroundColor: 'rgba(247, 247, 247, 1)',
        borderRadius: '16@ms',
        paddingHorizontal: '12@s',
        paddingVertical: '4@vs',
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: '14@vs',
    },
    iconContainer: {
        width: '32@ms',
        height: '32@ms',
        borderRadius: '16@ms',
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: '12@s',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    itemContent: {
        flex: 1,
        gap: '2@vs',
        paddingRight: '8@s',
    },
    itemTitle: {
        fontSize: '13@ms',
        fontWeight: '600',
        color: '#0F172A',
        lineHeight: '18@vs',
    },
    itemDate: {
        fontSize: '11@ms',
        color: '#64748B',
    },
    itemRight: {
        alignItems: 'flex-end',
        gap: '2@vs',
    },
    itemAmount: {
        fontSize: '13.5@ms',
        fontWeight: '700',
    },
    itemStatus: {
        fontSize: '11.5@ms',
        color: '#64748B',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(226, 232, 240, 0.5)',
        marginLeft: '44@s', // offset to align with content text
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: '100@vs',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: '60@vs',
        gap: '8@vs',
    },
    emptyTitle: {
        fontSize: '16@ms',
        fontWeight: '600',
        color: '#0F172A',
        marginTop: '8@vs',
    },
    emptyDesc: {
        fontSize: '13@ms',
        color: '#64748B',
        textAlign: 'center',
        maxWidth: '250@s',
    },
    paginationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: '16@vs',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        marginTop: '20@vs',
    },
    paginationButton: {
        paddingHorizontal: '16@s',
        paddingVertical: '8@vs',
        borderRadius: '8@ms',
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    paginationButtonDisabled: {
        backgroundColor: '#F8FAFC',
        borderColor: '#F1F5F9',
    },
    paginationButtonText: {
        fontSize: '13@ms',
        fontWeight: '600',
        color: '#0F172A',
    },
    paginationButtonTextDisabled: {
        color: '#94A3B8',
    },
    paginationInfo: {
        fontSize: '13@ms',
        color: '#64748B',
        fontWeight: '500',
    },
});
