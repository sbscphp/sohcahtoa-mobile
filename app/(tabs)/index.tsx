import ActionSelectionSheet from '@/components/ActionSelectionSheet';
import CurrencyDropdown, { CurrencyItem } from '@/components/CurrencyDropdown';
import VirtualCard from '@/components/VirtualCard';
import { useRouter } from 'expo-router';
import { Add, ArrowDown2, Bank, Buildings, Eye, EyeSlash, Hospital, ImportCircle, Map1, Notification, People, Refresh, Teacher, User, WalletAdd1, WalletMinus } from 'iconsax-react-nativejs';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/theme';

const ACTION_BUTTONS = [
    { title: 'Buy FX', icon: WalletAdd1, type: 'buy' },
    { title: 'Sell FX', icon: WalletMinus, type: 'sell' },
    { title: 'Receive money', icon: ImportCircle, type: 'receive' },
];

const Dot = () => (
    <View style={{
        width: moderateScale(10),
        height: moderateScale(10),
        borderRadius: moderateScale(5),
        backgroundColor: '#0F172A',
        marginHorizontal: moderateScale(2),
    }} />
);

const TRANSACTIONS = [
    { id: '1', title: 'Personal Travel Allowance', date: 'Dec 8 2025 • 11 am', amount: '$200', status: 'Pending', type: 'debit' },
    { id: '2', title: 'Business Travel Allowance', date: 'Dec 8 2025 • 11 am', amount: '$3,000', status: 'Success', type: 'credit' },
    { id: '3', title: 'Medical Allowance', date: 'Dec 8 2025 • 11 am', amount: '$1,000', status: 'Pending', type: 'debit' },
    { id: '4', title: 'Medical Allowance', date: 'Dec 8 2025 • 11 am', amount: '$1,000', status: 'Pending', type: 'debit' },
    { id: '5', title: 'Medical Allowance', date: 'Dec 8 2025 • 11 am', amount: '$1,000', status: 'Pending', type: 'debit' },
];

export default function HomeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [showBalance, setShowBalance] = useState(true);
    const [selectedFilter, setSelectedFilter] = useState('All');
    const [transactionFilters, setTransactionFilters] = useState(['All', 'PTA', 'BTA', 'Medical']);
    const [selectedTxFilter, setSelectedTxFilter] = useState('All');
    const [actionSheetType, setActionSheetType] = useState<'buy' | 'sell' | 'receive' | null>(null);
    const [currencySheetVisible, setCurrencySheetVisible] = useState(false);
    const [selectedCurrency, setSelectedCurrency] = useState<CurrencyItem>({ id: '4', code: 'USD', flag: '🇺🇸' });

    const handleActionPress = (action: string) => {
        // console.log('Selected action:', action);
        if (action === 'vacation') {
            setActionSheetType(null); 
            router.push('/(buy-fx)/(pta)/create-pta');
        } else if (action === 'business') {
            setActionSheetType(null); 
            router.push('/(buy-fx)/(bta)/create-bta');
        } else if (action === 'school') {
            setActionSheetType(null); 
            router.push('/(buy-fx)/(school)/create-school');
        } else if (action === 'medical') {
            setActionSheetType(null); 
            router.push('/(buy-fx)/(medical)/create-medical');
        } else if (action === 'professional') {
            setActionSheetType(null); 
            router.push('/(buy-fx)/(professional)/create-professional');
        } else if (action === 'touring') {
            setActionSheetType(null); 
            router.push('/(buy-fx)/(touring)/create-touring');
        } else {
            setActionSheetType(null);
        }
    };

    const handleTopFilterChange = (filter: string) => {
        setSelectedFilter(filter);
        if (filter === 'FX bought') {
            setTransactionFilters(['All', 'PTA', 'BTA', 'Medical']);
            setSelectedTxFilter('PTA');
        } else if (filter === 'FX sold') {
            setTransactionFilters(['All', 'Resident', 'Tourist', 'Expatriate']);
            setSelectedTxFilter('Resident');
        } else if (filter === 'Received FX') {
            setTransactionFilters(['All', 'IMTO']);
            setSelectedTxFilter('All');
        } else {
            setTransactionFilters(['All', 'PTA', 'BTA', 'Medical']);
            setSelectedTxFilter('All');
        }
    };

    const getSheetConfig = () => {
        switch (actionSheetType) {
            case 'buy':
                return {
                    title: 'Buy FX',
                    headerIcon: <WalletMinus size={moderateScale(24)} color="#FF6B2C" />,
                    actions: [
                        { id: '1', title: 'I am going on a Vacation (PTA)', subtitle: 'Buy FX to cover your travel and accommodation', icon: <User size={moderateScale(20)} color="#FF6B2C" variant="Bulk" />, onPress: () => handleActionPress('vacation') },
                        { id: '2', title: 'I am travelling for business (BTA)', subtitle: 'Buy FX to cover your business trip abroad', icon: <Bank size={moderateScale(20)} color="#FF6B2C" variant="Bulk" />, onPress: () => handleActionPress('business') },
                        { id: '3', title: 'Pay School Fees', subtitle: 'Pay tuition for undergraduate & postgraduate studies.', icon: <Teacher size={moderateScale(20)} color="#FF6B2C" variant="Bulk" />, onPress: () => handleActionPress('school') },
                        { id: '4', title: 'Seek Medical Treatment', subtitle: 'Pay for medical treatment or hospital bills abroad', icon: <Hospital size={moderateScale(20)} color="#FF6B2C" variant="Bulk" />, onPress: () => handleActionPress('medical') },
                        { id: '5', title: 'Pay a Professional Body', subtitle: 'E.g International membership fee', icon: <People size={moderateScale(24)} color="#FF6B2C" variant="Bulk" />, onPress: () => handleActionPress('professional') },
                        { id: '6', title: 'I am Touring Nigeria', subtitle: 'Buy FX to cover your travel, accommodation', icon: <Map1 size={moderateScale(20)} color="#FF6B2C" variant="Bulk" />, onPress: () => handleActionPress('touring') },
                    ]
                };
            case 'sell':
                return {
                    title: 'Sell FX',
                    headerIcon: <WalletAdd1 size={moderateScale(24)} color="#FF6B2C" />,
                    actions: [
                        { id: '1', title: 'Resident', subtitle: 'I have FX and want Naira', icon: <User size={moderateScale(20)} color="#FF6B2C" variant="Bulk" />, onPress: () => handleActionPress('resident') },
                        { id: '2', title: 'I am Touring Nigeria', subtitle: 'I am touring Nigeria and want Naira', icon: <Map1 size={moderateScale(20)} color="#FF6B2C" variant="Bulk" />, onPress: () => handleActionPress('touring_inbound') },
                        { id: '3', title: 'Expatriate; I am a foreigner who works in Nigeria', subtitle: 'I am a foreigner living or working in Nigeria', icon: <Buildings size={moderateScale(20)} color="#FF6B2C" variant="Bulk" />, onPress: () => handleActionPress('expatriate') },
                    ]
                };
            case 'receive':
                return {
                    title: 'Receive FX',
                    headerIcon: <WalletAdd1 size={moderateScale(24)} color="#FF6B2C" />,
                    actions: [
                        { id: '1', title: 'Receive Money from Abroad', subtitle: 'Receive international transfer and fund money from relatives, business and associates', icon: <User size={moderateScale(20)} color="#FF6B2C" variant="Bulk" />, onPress: () => handleActionPress('receive_abroad') },
                    ]
                };
            default:
                return null;
        }
    };

    const activeConfig = getSheetConfig();


    const FILTERS = ['All', 'FX bought', 'FX sold', 'Received FX'];

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
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
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
                    {FILTERS.map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            style={[styles.filterChip, selectedFilter === filter && styles.filterChipActive]}
                            onPress={() => handleTopFilterChange(filter)}
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
                                    <Eye size={moderateScale(18)} color="#1E293B" variant="Bold" /> :
                                    <EyeSlash size={moderateScale(18)} color="#1E293B" variant="Bold" />
                                }
                            </TouchableOpacity>
                        </View>

                        <View style={{ zIndex: 100 }}>
                            <TouchableOpacity
                                style={styles.currencySelector}
                                onPress={() => setCurrencySheetVisible(!currencySheetVisible)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.flagWrapper}>
                                    <Text style={styles.flagText}>{selectedCurrency.flag}</Text>
                                </View>
                                <Text style={styles.currencyCode}>{selectedCurrency.code}</Text>
                                <ArrowDown2 size={moderateScale(14)} color="#FFFFFF" />
                            </TouchableOpacity>

                            {currencySheetVisible && (
                                <CurrencyDropdown
                                    onSelect={(currency) => setSelectedCurrency(currency)}
                                    selectedCurrencyCode={selectedCurrency.code}
                                    onClose={() => setCurrencySheetVisible(false)}
                                />
                            )}
                        </View>
                    </View>

                    <View style={styles.balanceRow}>
                        <View style={styles.currencyBadge}>
                            <Text style={styles.currencySymbol}>
                                {selectedCurrency.code === 'NGN' ? '₦' :
                                    selectedCurrency.code === 'GHS' ? '₵' :
                                        selectedCurrency.code === 'KES' ? 'KSh' :
                                            selectedCurrency.code === 'USD' ? '$' :
                                                selectedCurrency.code === 'GBP' ? '£' :
                                                    selectedCurrency.code === 'SEK' ? 'kr' : '$'}
                            </Text>
                        </View>
                        {showBalance ? (
                            <Text style={styles.balanceAmount}>
                                428,095
                                <Text style={styles.balanceDecimal}>.00</Text>
                            </Text>
                        ) : (
                            <View style={{ flexDirection: 'row', alignItems: 'center', height: moderateScale(38) }}>
                                <Dot /><Dot /><Dot />
                            </View>
                        )}
                    </View>
                </View>

                {/* Actions Grid */}
                <View style={styles.actionsGrid}>
                    {ACTION_BUTTONS.map((action, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.actionButton}
                            onPress={() => setActionSheetType(action.type as any)}
                        >
                            <View style={styles.actionIcon}>
                                <action.icon size={moderateScale(24)} color="#1E293B" />
                            </View>
                            <Text style={styles.actionText}>{action.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={styles.divider} />
                {/* Cards Section */}
                <View style={styles.cardsSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Cards</Text>
                        <Text style={styles.seeAllBtn}>Manage Cards</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsScroll}>

                        <View style={styles.card}>
                            <VirtualCard
                                name="Emmanuel Israel"
                                last4Digits="7093"
                                expiry="08/27"
                            />
                        </View>

                        <TouchableOpacity style={styles.addCardButton}>
                            <Add size={moderateScale(26)} color="#1E293B" />
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                {/* Recent Transactions */}
                <View style={styles.transactionsSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Transactions</Text>
                        <TouchableOpacity style={styles.seeAllBtn} onPress={() => router.push('/all-transactions')}>
                            <Text style={styles.seeAllText}>See all</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.transactionFilters}>
                        {transactionFilters.map((filter) => (
                            <TouchableOpacity
                                key={filter}
                                style={[styles.filterChip, selectedTxFilter === filter && styles.filterChipActive]}
                                onPress={() => setSelectedTxFilter(filter)}
                            >
                                <Text style={[styles.filterText, selectedTxFilter === filter && styles.filterTextActive]}>
                                    {filter}
                                </Text>
                            </TouchableOpacity>
                        ))}

                    </View>
                    <View style={styles.transactionList}>
                        {TRANSACTIONS.map((tx) => (
                            <View key={tx.id} style={styles.transactionItem}>
                                <View style={[styles.transactionIcon, { backgroundColor: '#F8FAFC' }]}>
                                    <Refresh size={moderateScale(16)} color="#64748B" />
                                </View>
                                <View style={styles.transactionInfo}>
                                    <Text style={styles.transactionTitle}>{tx.title}</Text>
                                    <Text style={styles.transactionDate}>{tx.date}</Text>
                                </View>
                                <View style={styles.transactionAmountContainer}>
                                    <Text style={styles.transactionAmount}>{tx.amount}</Text>
                                    <Text style={[styles.transactionStatus, tx.status === 'Pending' ? { color: 'rgba(181, 71, 8, 1)', backgroundColor: 'rgba(255, 250, 235, 1)' } : { color: '#166534', backgroundColor: '#F0FDF4' }]}>
                                        {tx.status}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

            </ScrollView>

            {activeConfig && (
                <ActionSelectionSheet
                    visible={!!actionSheetType}
                    onClose={() => setActionSheetType(null)}
                    title={activeConfig.title}
                    headerIcon={activeConfig.headerIcon}
                    actions={activeConfig.actions}
                />
            )}


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
        paddingHorizontal: '10@s',
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
        paddingHorizontal: '10@s',
        marginBottom: '24@vs',
    },
    filterChip: {
        paddingHorizontal: '10@s',
        paddingVertical: '6@vs',
        borderRadius: '20@ms',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginRight: '8@s',
    },
    transactionList: {
        backgroundColor: 'rgba(245, 245, 245, 1)',
        borderRadius: '12@ms',
        marginHorizontal: '10@s',
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
    balanceSection: {
        paddingHorizontal: '10@s',
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
        backgroundColor: 'rgba(35, 35, 35, 1)',
        paddingHorizontal: '12@s',
        paddingVertical: '8@vs',
        borderRadius: '24@ms',
        gap: '6@s',
    },
    flagWrapper: {
        width: '24@ms',
        height: '24@ms',
        borderRadius: '12@ms',
        // backgroundColor: '#000000ff',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    flagText: {
        fontSize: '12@ms',
        lineHeight: '16@ms',
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
        marginBottom: '10@vs',
        marginHorizontal: '10@s',
    },
    divider: {
        width: '100%',
        height: '1@ms',
        backgroundColor: '#E2E8F0',
        marginVertical: '20@s',
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
        marginBottom: '20@vs',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: '10@s',
        marginBottom: '10@vs',
    },
    sectionTitle: {
        fontSize: '14@ms',
        fontWeight: '400',
        color: '#0F172A',
    },
    cardsScroll: {
        paddingHorizontal: '10@s',
        gap: '12@s',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        width: '275@s',
        height: '125@vs',
        borderRadius: '20@ms',
        overflow: 'hidden',
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
        width: '49@s',
        height: '125@vs',
        borderRadius: '15@ms',
        borderWidth: 1,
        borderColor: '#0F172A',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
    transactionsSection: {
        // paddingHorizontal: '15@s',
    },
    seeAllBtn: {
        paddingHorizontal: '12@s',
        paddingVertical: '4@vs',
        borderRadius: '12@ms',
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
        paddingHorizontal: '10@s',
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: '12@vs',
        borderRadius: '12@ms',
        paddingHorizontal: '15@s',
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
        fontSize: '12@ms',
        fontWeight: '600',
        paddingHorizontal: '6@s',
        paddingVertical: '4@vs',
        borderRadius: '12@ms',
        overflow: 'hidden',
    },
});
