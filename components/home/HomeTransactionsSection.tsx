import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Refresh } from 'iconsax-react-nativejs';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import { Transaction } from '@/types/api/transactions';
import { formatCurrency, formatDate, formatTime, getStatusLabel, getStatusStyle, getCurrencySymbol } from '@/utils/helpers';
import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

interface HomeTransactionsSectionProps {
    transactionFilters: string[];
    selectedTxFilter: string;
    onSelectTxFilter: (filter: string) => void;
    transactions: Transaction[];
    isLoadingTransactions: boolean;
    onSeeAll: () => void;
    onTransactionPress: (tx: Transaction) => void;
}

export default function HomeTransactionsSection({
    transactionFilters,
    selectedTxFilter,
    onSelectTxFilter,
    transactions,
    isLoadingTransactions,
    onSeeAll,
    onTransactionPress,
}: HomeTransactionsSectionProps) {
    const { colors, isDark } = useAppTheme();

    return (
        <View style={styles.transactionsSection}>
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Transactions</Text>
                <TouchableOpacity style={[styles.seeAllBtn, { borderColor: colors.border }]} onPress={onSeeAll}>
                    <Text style={[styles.seeAllText, { color: colors.text }]}>See all</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.transactionFilters}
            >
                {transactionFilters.map((filter) => (
                    <TouchableOpacity
                        key={filter}
                        style={[
                            styles.filterChip,
                            { borderColor: colors.border, backgroundColor: colors.card },
                            selectedTxFilter === filter && [
                                styles.filterChipActive,
                                {
                                    backgroundColor: isDark ? colors.primarySoft : '#FFF7ED',
                                    borderColor: colors.tabIconSelected,
                                },
                            ],
                        ]}
                        onPress={() => onSelectTxFilter(filter)}
                    >
                        <Text style={[styles.filterText, { color: colors.textMuted }, selectedTxFilter === filter && [styles.filterTextActive, { color: colors.tabIconSelected }]]}>
                            {filter}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {isLoadingTransactions && (
                <View style={{ padding: moderateScale(20) }}>
                    <ActivityIndicator color="#FF6B2C" />
                </View>
            )}

            <View style={[styles.transactionList, { backgroundColor: colors.card }]}>
                {transactions.length > 0 ? (
                    transactions.map((tx: Transaction, index: number) => {
                        const statusLabel = getStatusLabel(tx.status);
                        const statusStyle = getStatusStyle(tx.status, isDark);
                        const isLast = index === transactions.length - 1;
                        return (
                            <View key={tx.id}>
                                <TouchableOpacity
                                    style={styles.transactionItem}
                                    onPress={() => onTransactionPress(tx)}
                                >
                                    <View style={[styles.transactionIcon, { backgroundColor: colors.surface }]}>
                                        <Refresh size={moderateScale(16)} color={colors.icon} />
                                    </View>
                                    <View style={styles.transactionInfo}>
                                        <Text style={[styles.transactionTitle, { color: colors.text }]} numberOfLines={2} ellipsizeMode="tail">{tx.purpose || tx.type}</Text>
                                        <Text style={[styles.transactionDate, { color: colors.textMuted }]}>{formatDate(tx.createdAt)} • {formatTime(tx.createdAt)}</Text>
                                    </View>
                                    <View style={styles.transactionAmountContainer}>
                                        <Text style={[styles.transactionAmount, { color: colors.text }]}>{formatCurrency(tx.foreignAmount, getCurrencySymbol(tx.currency))}</Text>
                                        <View style={[styles.transactionStatus, {
                                            backgroundColor: statusStyle.backgroundColor,
                                        }]}>
                                            <Text style={[styles.transactionStatusText, { color: statusStyle.color }]}>
                                                {statusLabel}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                                {!isLast && (
                                    <View style={[styles.itemDivider, { backgroundColor: isDark ? colors.border : '#E2E8F0' }]} />
                                )}
                            </View>
                        );
                    })
                ) : !isLoadingTransactions && (
                    <View style={{ padding: moderateScale(30), alignItems: 'center' }}>
                        <Text style={{ color: colors.textMuted, fontSize: moderateScale(14) }}>No transactions found</Text>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = ScaledSheet.create({
    transactionsSection: {},
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: '14@s',
        marginBottom: '10@vs',
    },
    sectionTitle: {
        fontSize: '14@ms',
        fontWeight: '400',
        color: '#0F172A',
    },
    seeAllBtn: {
        paddingHorizontal: '12@s',
        paddingVertical: '4@vs',
        borderRadius: '14@ms',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    seeAllText: {
        fontSize: '12@ms',
        fontWeight: '500',
        color: '#0F172A',
    },
    transactionFilters: {
        flexDirection: 'row',
        marginBottom: '16@vs',
        gap: '8@s',
        paddingHorizontal: '14@s',
    },
    filterChip: {
        paddingHorizontal: '10@s',
        paddingVertical: '6@vs',
        borderRadius: '20@ms',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginRight: '8@s',
    },
    filterChipActive: {
        backgroundColor: '#FFF7ED',
        borderColor: '#FFEDD5',
    },
    filterText: {
        fontSize: '12@ms',
        color: '#64748B',
    },
    filterTextActive: {
        color: Colors.light.primary,
        fontWeight: '500',
    },
    transactionList: {
        backgroundColor: 'rgba(245, 245, 245, 1)',
        borderRadius: '12@ms',
        marginHorizontal: '14@s',
        overflow: 'hidden',
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: '12@vs',
        borderRadius: '12@ms',
        paddingLeft: '10@s',
        paddingRight: '12@s',
    },
    transactionIcon: {
        width: '34@ms',
        height: '34@ms',
        borderRadius: '17@ms',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: '8@s',
    },
    transactionInfo: {
        flex: 1,
        marginRight: '8@s',
    },
    transactionTitle: {
        fontSize: '13@ms',
        fontWeight: '500',
        color: '#0F172A',
        marginBottom: '2@vs',
        lineHeight: '18@ms',
    },
    transactionDate: {
        fontSize: '11@ms',
        color: '#64748B',
    },
    transactionAmountContainer: {
        alignItems: 'flex-end',
    },
    transactionAmount: {
        fontSize: '13@ms',
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: '4@vs',
    },
    transactionStatus: {
        paddingHorizontal: '6@s',
        paddingVertical: '2@vs',
        borderRadius: '12@ms',
        overflow: 'hidden',
    },
    transactionStatusText: {
        fontSize: '9.5@ms',
        fontWeight: '600',
    },
    itemDivider: {
        height: StyleSheet.hairlineWidth,
        marginHorizontal: '10@s',
        backgroundColor: '#E2E8F0',
    },
});
