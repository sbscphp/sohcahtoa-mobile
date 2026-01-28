import { useRouter } from 'expo-router';
import { Add, ArrowDown2,WalletMinus,WalletAdd1, ArrowSwapHorizontal, Eye, EyeSlash, Notification, ImportCircle } from 'iconsax-react-nativejs';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/theme';

const ACTION_BUTTONS = [
    { title: 'Buy FX', icon: WalletAdd1, route: '/buy-fx' },
    { title: 'Sell FX', icon: WalletMinus, route: '/sell-fx' },
    { title: 'Receive money', icon:ImportCircle , route: '/receive' },
];

const TRANSACTIONS = [
    { id: '1', title: 'Personal Travel Allowance', date: 'Dec 8 2025 • 11 am', amount: '$200', status: 'Pending', type: 'debit' },
    { id: '2', title: 'Business Travel Allowance', date: 'Dec 8 2025 • 11 am', amount: '$3,000', status: 'Success', type: 'credit' },
];

export default function HomeScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [showBalance, setShowBalance] = useState(true);
    const [selectedFilter, setSelectedFilter] = useState('All');

    const FILTERS = ['All', 'FX bought', 'FX sold', 'Received FX'];

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Image
                            source={require('../../assets/images/user-img-1.jpg')}
                            style={styles.avatar}
                        />
                        <View>
                            <Text style={styles.greeting}>Good morning 🌤️</Text>
                            <Text style={styles.username}>Emmanuel Israel</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.notificationBtn}>
                        <Notification size={moderateScale(24)} color="#1E293B" variant="Linear" />
                    </TouchableOpacity>
                </View>

                {/* Filters */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
                    {FILTERS.map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            style={[styles.filterChip, selectedFilter === filter && styles.filterChipActive]}
                            onPress={() => setSelectedFilter(filter)}
                        >
                            <Text style={[styles.filterText, selectedFilter === filter && styles.filterTextActive]}>
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Balance Section */}
                <View style={styles.balanceSection}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>

                        <View style={styles.balanceHeader}>
                            <Text style={styles.balanceLabel}>Total FX units</Text>
                            <TouchableOpacity onPress={() => setShowBalance(!showBalance)}>
                                {showBalance ?
                                    <Eye size={moderateScale(18)} color="#1E293B" /> :
                                    <EyeSlash size={moderateScale(18)} color="#1E293B" />
                                }
                            </TouchableOpacity>
                        </View>

                        <View style={styles.currencySelector}>
                            <Image
                                source={require('../../assets/images/user-img-1.jpg')}
                                style={styles.flag}
                            />
                            <Text style={styles.currencyCode}>USD</Text>
                            <ArrowDown2 size={moderateScale(14)} color="#FFFFFF" />
                        </View>
                    </View>

                    <View style={styles.balanceRow}>
                        <View style={styles.currencyBadge}>
                            <Text style={styles.currencySymbol}>$</Text>
                        </View>
                        <Text style={styles.balanceAmount}>
                            {showBalance ? (
                                <>
                                    428,095
                                    <Text style={styles.balanceDecimal}>.00</Text>
                                </>
                            ) : (
                                '*******'
                            )}
                        </Text>
                    </View>
                </View>

                {/* Actions Grid */}
                <View style={styles.actionsGrid}>
                    {ACTION_BUTTONS.map((action, index) => (
                        <TouchableOpacity key={index} style={styles.actionButton}>
                            <View style={styles.actionIcon}>
                                <action.icon size={moderateScale(24)} color="#1E293B" />
                            </View>
                            <Text style={styles.actionText}>{action.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Cards Section */}
                <View style={styles.cardsSection}>
                    <Text style={styles.sectionTitle}>Cards</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsScroll}>
                        {/* Virtual Card */}
                        <View style={styles.card}>
                            <Image
                                // source={require('../../assets/images/card-bg.png')}
                                style={styles.cardBg}
                                resizeMode="cover"
                            />
                            {/* Overlay content for card would go here */}
                            <View style={styles.cardContent}>
                                <View style={styles.cardTop}>
                                    <View style={styles.chip} />
                                    <Text style={styles.cardType}>Prepaid card</Text>
                                    <Text style={styles.visaText}>VISA</Text>
                                </View>
                                <View style={styles.cardBottom}>
                                    <Text style={styles.cardNumber}>•••• 7093</Text>
                                    <View style={styles.cardDetails}>
                                        <Text style={styles.cardExpiry}>08/27</Text>
                                        <Text style={styles.cardHolder}>Emmanuel Israel</Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Add Card Button */}
                        <TouchableOpacity style={styles.addCardButton}>
                            <Add size={moderateScale(32)} color="#1E293B" />
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                {/* Recent Transactions */}
                <View style={styles.transactionsSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Transactions</Text>
                        <TouchableOpacity style={styles.seeAllBtn}>
                            <Text style={styles.seeAllText}>See all</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.transactionFilters}>
                        {/* Reusing simplified filters for transactions */}
                        <TouchableOpacity style={[styles.filterChip, styles.filterChipActive]}><Text style={styles.filterTextActive}>All</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.filterChip}><Text style={styles.filterText}>PTA</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.filterChip}><Text style={styles.filterText}>BTA</Text></TouchableOpacity>
                        <TouchableOpacity style={styles.filterChip}><Text style={styles.filterText}>Medical</Text></TouchableOpacity>

                    </View>

                    {TRANSACTIONS.map((tx) => (
                        <View key={tx.id} style={styles.transactionItem}>
                            <View style={[styles.transactionIcon, { backgroundColor: '#F8FAFC' }]}>
                                <ArrowSwapHorizontal size={moderateScale(20)} color="#64748B" />
                            </View>
                            <View style={styles.transactionInfo}>
                                <Text style={styles.transactionTitle}>{tx.title}</Text>
                                <Text style={styles.transactionDate}>{tx.date}</Text>
                            </View>
                            <View style={styles.transactionAmountContainer}>
                                <Text style={styles.transactionAmount}>{tx.amount}</Text>
                                <Text style={[styles.transactionStatus, tx.status === 'Pending' ? { color: '#D97706', backgroundColor: '#FEF3C7' } : { color: '#166534', backgroundColor: '#F0FDF4' }]}>
                                    {tx.status}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

            </ScrollView>
        </View>
    );
}

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        paddingBottom: '100@vs',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: '20@s',
        marginBottom: '20@vs',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: '12@s',
    },
    avatar: {
        width: '40@ms',
        height: '40@ms',
        borderRadius: '20@ms',
        backgroundColor: '#E2E8F0',
    },
    greeting: {
        fontSize: '12@ms',
        color: '#64748B',
    },
    username: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#0F172A',
    },
    notificationBtn: {
        padding: '4@ms',
    },
    filterContainer: {
        paddingHorizontal: '20@s',
        marginBottom: '24@vs',
    },
    filterChip: {
        paddingHorizontal: '16@s',
        paddingVertical: '6@vs',
        borderRadius: '20@ms',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginRight: '8@s',
    },
    filterChipActive: {
        backgroundColor: '#FFF7ED', // Orange-50
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
    balanceSection: {
        paddingHorizontal: '20@s',
        marginBottom: '24@vs',
    },
    balanceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: '8@s',
        marginBottom: '8@vs',
    },
    balanceLabel: {
        fontSize: '13@ms',
        color: '#64748B',
    },
    balanceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: '8@s',
    },
    currencyBadge: {
        width: '28@ms',
        height: '28@ms',
        borderRadius: '14@ms',
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    currencySymbol: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#000000',
    },
    currencySelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        paddingHorizontal: '12@s',
        paddingVertical: '6@vs',
        borderRadius: '20@ms',
        gap: '6@s',
    },
    flag: {
        width: '16@ms',
        height: '16@ms',
        borderRadius: '8@ms',
        backgroundColor: '#FFFFFF',
    },
    currencyCode: {
        color: '#FFFFFF',
        fontSize: '12@ms',
        fontWeight: '600',
    },
    balanceAmount: {
        fontSize: '32@ms',
        fontWeight: '700',
        color: '#0F172A',
    },
    balanceDecimal: {
        fontSize: '18@ms',
        fontWeight: '600',
        color: '#64748B',
    },
    actionsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
        padding: '4@s',
        gap: '16@s',
        marginBottom: '32@vs',
        marginHorizontal: '10@s',
    },
    actionButton: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: '20@ms',
        padding: '8@ms',
        borderWidth: 1,
        borderColor: '#E2E8F0', 
    },
    actionIcon: {
        marginBottom: '8@vs',
    },
    actionText: {
        fontSize: '12@ms',
        fontWeight: '500',
        color: '#0F172A',
        textAlign: 'center',
    },
    cardsSection: {
        marginBottom: '32@vs',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: '20@s',
        marginBottom: '16@vs',
    },
    sectionTitle: {
        fontSize: '16@ms',
        fontWeight: '600',
        color: '#0F172A',
        marginLeft: '20@s', // Since using padding in container usually, but here doing manually for consistency
        marginBottom: '10@vs',
    },
    cardsScroll: {
        paddingHorizontal: '20@s',
        gap: '16@s',
    },
    card: {
        width: '280@s',
        height: '160@vs',
        borderRadius: '20@ms',
        overflow: 'hidden',
        backgroundColor: '#1E293B', // Fallback
    },
    cardBg: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
    },
    cardContent: {
        flex: 1,
        padding: '20@ms',
        justifyContent: 'space-between',
    },
    cardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    chip: {
        width: '32@ms',
        height: '24@ms',
        backgroundColor: '#FCD34D', // Goldish
        borderRadius: '4@ms',
    },
    cardType: {
        color: '#FFFFFF',
        fontSize: '12@ms',
        position: 'absolute',
        left: '42@ms',
    },
    visaText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: '20@ms',
        fontStyle: 'italic',
    },
    cardBottom: {
        gap: '8@vs',
    },
    cardNumber: {
        color: '#FFFFFF',
        fontSize: '16@ms',
        fontWeight: '600',
        letterSpacing: 2,
    },
    cardDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cardExpiry: {
        color: '#FFFFFF',
        fontSize: '12@ms',
    },
    cardHolder: {
        color: '#FFFFFF',
        fontSize: '12@ms',
    },
    addCardButton: {
        width: '60@s',
        height: '160@vs',
        borderRadius: '20@ms',
        borderWidth: 1,
        borderColor: '#0F172A', // Using dashed border effect visually with image often better, but clear code logic here
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
    transactionsSection: {
        paddingHorizontal: '20@s',
    },
    seeAllBtn: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: '12@s',
        paddingVertical: '4@vs',
        borderRadius: '12@ms',
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
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: '12@vs',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    transactionIcon: {
        width: '40@ms',
        height: '40@ms',
        borderRadius: '20@ms',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: '12@s',
    },
    transactionInfo: {
        flex: 1,
    },
    transactionTitle: {
        fontSize: '14@ms',
        fontWeight: '500',
        color: '#0F172A',
        marginBottom: '2@vs',
    },
    transactionDate: {
        fontSize: '12@ms',
        color: '#64748B',
    },
    transactionAmountContainer: {
        alignItems: 'flex-end',
    },
    transactionAmount: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: '4@vs',
    },
    transactionStatus: {
        fontSize: '10@ms',
        fontWeight: '500',
        paddingHorizontal: '6@s',
        paddingVertical: '2@vs',
        borderRadius: '4@ms',
        overflow: 'hidden',
    },
});
