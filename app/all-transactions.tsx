import SearchEmpty from '@/assets/icons/empty-state.svg';
import FilterMailSquare from '@/assets/images/filter-mail-square.svg';
import FilterBottomSheet from '@/components/FilterBottomSheet';
import Header from '@/components/Header';
import { Refresh } from 'iconsax-react-nativejs';
import React, { useState } from 'react';
import { SectionList, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';

interface Transaction {
    id: string;
    title: string;
    date: string;
    amount: string;
    status: 'Pending' | 'More Info' | 'Declined' | 'Approved' | 'Settled';
    type: 'debit' | 'credit';
}

const DATA = [
    {
        title: 'Today',
        data: [
            { id: '1', title: 'FX purchase request subm...', date: 'Dec 8 2025 • 11 am', amount: '$200', status: 'Pending', type: 'debit' },
            { id: '2', title: 'Foreign currency sale initia...', date: 'Dec 8 2025 • 11 am', amount: '$1,000', status: 'More Info', type: 'credit' },
            { id: '3', title: 'FX purchase request subm...', date: 'Dec 8 2025 • 11 am', amount: '$500', status: 'Declined', type: 'debit' },
            { id: '4', title: 'Foreign currency purchase...', date: 'Dec 8 2025 • 11 am', amount: '$1,500', status: 'Approved', type: 'debit' },
            { id: '5', title: 'Foreign currency sale initia...', date: 'Dec 8 2025 • 11 am', amount: '$300', status: 'More Info', type: 'credit' },
            { id: '6', title: 'Foreign currency purchase...', date: 'Dec 8 2025 • 11 am', amount: '$3,000', status: 'Settled', type: 'debit' },
        ]
    },
    {
        title: 'December 8, 2025',
        data: [
            { id: '7', title: 'Foreign currency purchase...', date: 'Dec 8 2025 • 11 am', amount: '$10,243.44', status: 'Settled', type: 'debit' },
            { id: '8', title: 'FX purchase request subm...', date: 'Dec 8 2025 • 11 am', amount: '$3,000', status: 'Declined', type: 'debit' },
        ]
    },
    {
        title: 'December 7, 2025',
        data: [
            { id: '9', title: 'Foreign currency purchase...', date: 'Dec 8 2025 • 11 am', amount: '$10,243.44', status: 'Settled', type: 'debit' },
            { id: '10', title: 'FX purchase request subm...', date: 'Dec 8 2025 • 11 am', amount: '$3,000', status: 'Declined', type: 'debit' },
        ]
    },
    {
        title: 'December 6, 2025',
        data: [
            { id: '11', title: 'Foreign currency purchase...', date: 'Dec 8 2025 • 11 am', amount: '$10,243.44', status: 'Settled', type: 'debit' },
            { id: '12', title: 'FX purchase request subm...', date: 'Dec 8 2025 • 11 am', amount: '$3,000', status: 'Declined', type: 'debit' },
        ]
    },
    {
        title: 'December 5, 2025',
        data: [
            { id: '13', title: 'Foreign currency purchase...', date: 'Dec 8 2025 • 11 am', amount: '$10,243.44', status: 'Settled', type: 'debit' },
            { id: '14', title: 'FX purchase request subm...', date: 'Dec 8 2025 • 11 am', amount: '$3,000', status: 'Declined', type: 'debit' },
        ]
    },
];

export default function AllTransactionsScreen() {
    const insets = useSafeAreaInsets();
    const [filterVisible, setFilterVisible] = useState(false);
    const [filteredData, setFilteredData] = useState(DATA);

    const parseDate = (dateStr: string) => {

        const cleanDate = dateStr.split('•')[0].trim();
        return new Date(cleanDate);
    };

    const handleFilter = (filters: { startDate: string; endDate: string; statusSelected: boolean; typeSelected: boolean }) => {
        const start = new Date(filters.startDate);
        const end = new Date(filters.endDate);

        // Adjust end date to end of day
        end.setHours(23, 59, 59, 999);

        const newData = DATA.map(section => {
            const date = new Date(section.title);


            const filteredItems = section.data.filter(item => {
                const itemDate = parseDate(item.date);
                const dateInRange = itemDate >= start && itemDate <= end;

                let matchesStatus = true;
                if (filters.statusSelected) {
                    matchesStatus = item.status === 'Pending';
                }

                let matchesType = true;
                if (filters.typeSelected) {
                    matchesType = item.type === 'debit';
                }

                return dateInRange && matchesStatus && matchesType;
            });

            return {
                ...section,
                data: filteredItems
            };
        }).filter(section => section.data.length > 0);

        setFilteredData(newData);
        setFilterVisible(false);
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Pending':
                return { color: '#B54708', bg: '#FFFAEB' };
            case 'More Info':
                return { color: '#3538CD', bg: '#EEF4FF' };
            case 'Declined':
                return { color: '#B42318', bg: '#FEF3F2' };
            case 'Approved':
            case 'Settled':
                return { color: '#027A48', bg: '#ECFDF3' };
            default:
                return { color: '#344054', bg: '#F2F4F7' };
        }
    };

    const renderItem = ({ item, index, section }: { item: any; index: number; section: any }) => {
        const style = getStatusStyle(item.status);
        const isFirst = index === 0;
        const isLast = index === section.data.length - 1;

        return (
            <View style={[
                styles.transactionWrapper,
                isFirst && styles.topRadius,
                isLast && styles.bottomRadius,
                isLast && { marginBottom: moderateScale(20) },
                !isLast && { marginBottom: 0 }
            ]}>
                <View style={styles.itemContainer}>
                    <View style={styles.iconContainer}>
                        <Refresh size={moderateScale(16)} color="#64748B" />
                    </View>
                    <View style={styles.itemContent}>
                        <View style={styles.itemTopRow}>
                            <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                            <Text style={styles.itemAmount}>{item.amount}</Text>
                        </View>
                        <View style={styles.itemBottomRow}>
                            <Text style={styles.itemDate}>{item.date}</Text>
                            <View style={[styles.statusBadge, { backgroundColor: style.bg }]}>
                                <Text style={[styles.statusText, { color: style.color }]}>{item.status}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Header
                title="All Transactions"
                rightIcon={<FilterMailSquare color="rgba(152, 162, 179, 1)" />}
                onRightPress={() => setFilterVisible(true)}
            />

            {filteredData.length > 0 ? (
                <SectionList
                    sections={filteredData}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    renderSectionHeader={({ section: { title } }) => (
                        <Text style={styles.sectionHeader}>{title}</Text>
                    )}
                    contentContainerStyle={styles.listContent}
                    stickySectionHeadersEnabled={false}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconContainer}>
                        <SearchEmpty width={moderateScale(150)} height={moderateScale(120)} />
                    </View>
                    <Text style={styles.emptyTitle}>No Transaction Yet</Text>
                    <Text style={styles.emptyDesc}>
                        No transaction available. Check back later
                    </Text>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.buyButton} onPress={() => { /* Handle Buy FX */ }}>
                            <Text style={styles.buyButtonText}>Buy FX</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.sellButton} onPress={() => { /* Handle Sell FX */ }}>
                            <Text style={styles.sellButtonText}>Sell FX</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            <FilterBottomSheet
                visible={filterVisible}
                onClose={() => setFilterVisible(false)}
                onFilter={handleFilter}
            />
        </View>
    );
}

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    listContent: {
        paddingHorizontal: '16@s',
        paddingBottom: '20@vs',
    },
    sectionHeader: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#0F172A',
        marginTop: '24@vs',
        marginBottom: '12@vs',
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    transactionWrapper: {
        backgroundColor: 'rgba(245, 245, 245, 1)',
        marginHorizontal: '4@s',
        padding: '12@ms',
    },
    topRadius: {
        borderTopLeftRadius: '12@ms',
        borderTopRightRadius: '12@ms',
    },
    bottomRadius: {
        borderBottomLeftRadius: '12@ms',
        borderBottomRightRadius: '12@ms',
    },
    iconContainer: {
        width: '32@ms',
        height: '32@ms',
        borderRadius: '16@ms',
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginRight: '12@s',
    },
    itemContent: {
        flex: 1,
        gap: '4@vs',
    },
    itemTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemBottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemTitle: {
        fontSize: '14@ms',
        fontWeight: '500',
        color: '#1E293B',
        flex: 1,
        marginRight: '8@s',
    },
    itemAmount: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#0F172A',
    },
    itemDate: {
        fontSize: '12@ms',
        color: '#64748B',
    },
    statusBadge: {
        paddingHorizontal: '8@s',
        paddingVertical: '2@vs',
        borderRadius: '12@ms',
    },
    statusText: {
        fontSize: '11@ms',
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: '20@s',
        marginBottom: '90@vs',
    },
    emptyIconContainer: {
        marginBottom: '16@vs',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyTitle: {
        fontSize: '16@ms',
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: '8@vs',
    },
    emptyDesc: {
        fontSize: '14@ms',
        color: '#64748B',
        textAlign: 'center',
        marginBottom: '32@vs',
    },
    buttonContainer: {
        width: '100%',
        gap: '16@vs',
    },
    buyButton: {
        backgroundColor: '#FF6B00', // Orange color from design
        paddingVertical: '16@vs',
        borderRadius: '30@ms',
        alignItems: 'center',
        width: '100%',
    },
    buyButtonText: {
        color: '#FFFFFF',
        fontSize: '16@ms',
        fontWeight: '600',
    },
    sellButton: {
        backgroundColor: '#F8FAFC', // Light background
        paddingVertical: '16@vs',
        borderRadius: '30@ms',
        alignItems: 'center',
        width: '100%',
    },
    sellButtonText: {
        color: '#0F172A',
        fontSize: '16@ms',
        fontWeight: '600',
    },
});
