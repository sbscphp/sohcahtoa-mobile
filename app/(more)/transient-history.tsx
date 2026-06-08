import Header from '@/components/Header';
import { useRouter } from 'expo-router';
import { DocumentText, EmptyWallet, Export } from 'iconsax-react-nativejs';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, ScaledSheet } from 'react-native-size-matters';

interface TransientTransaction {
    id: string;
    date: string;
    amount: string;
    status: string;
}

interface TransientGroup {
    title: string;
    data: TransientTransaction[];
}

export default function TransientHistoryScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const groups: TransientGroup[] = [
        {
            title: 'Today',
            data: [
                { id: '637329', date: 'Dec 10 2025 • 9 am', amount: '₦980,000.75', status: 'Balance' },
                { id: '637327', date: 'Dec 8 2025 • 11 am', amount: '₦1,892,383.56', status: 'Balance' },
                { id: '637328', date: 'Dec 9 2025 • 2 pm', amount: '₦2,450,000.00', status: 'Balance' },
                { id: '637331', date: 'Dec 12 2025 • 1 pm', amount: '₦1,250,400.00', status: 'Balance' },
                { id: '637327', date: 'Dec 8 2025 • 11 am', amount: '₦1,892,383.56', status: 'Balance' },
                { id: '637330', date: 'Dec 11 2025 • 3:30 pm', amount: '₦3,100,150.20', status: 'Balance' },
            ]
        },
        {
            title: 'May 24, 2026',
            data: [
                { id: '637330', date: 'Dec 11 2025 • 3:30 pm', amount: '₦3,100,150.20', status: 'Balance' },
                { id: '637331', date: 'Jan 5 2026 • 11 am', amount: '₦2,450,000.00', status: 'Balance' },
                { id: '637332', date: 'Feb 14 2026 • 9:15 am', amount: '₦5,780,320.50', status: 'Balance' },
            ]
        }
    ];

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Header
                title="Transient History"
                rightIcon={
                    <View style={styles.headerRightContainer}>
                        <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7}>
                            <DocumentText size={moderateScale(22)} color="#1E293B" variant="Linear" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7}>
                            <Export size={moderateScale(22)} color="#1E293B" variant="Linear" />
                        </TouchableOpacity>
                    </View>
                }
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {groups.map((group, groupIdx) => (
                    <View key={groupIdx} style={styles.groupContainer}>
                        <Text style={styles.sectionHeader}>{group.title}</Text>
                        <View style={styles.listContainer}>
                            {group.data.map((item, index) => {
                                const isLast = index === group.data.length - 1;
                                return (
                                    <View key={index}>
                                        <TouchableOpacity 
                                            style={styles.transactionItem}
                                            activeOpacity={0.8}
                                        >
                                            <View style={styles.iconContainer}>
                                                <EmptyWallet size={moderateScale(18)} color="#94A3B8" variant="Linear" />
                                            </View>
                                            <View style={styles.itemContent}>
                                                <Text style={styles.itemTitle}>ID: {item.id}</Text>
                                                <Text style={styles.itemDate}>{item.date}</Text>
                                            </View>
                                            <View style={styles.itemRight}>
                                                <Text style={styles.itemAmount}>{item.amount}</Text>
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
    },
    itemTitle: {
        fontSize: '13.5@ms',
        fontWeight: '600',
        color: '#0F172A',
    },
    itemDate: {
        fontSize: '11.5@ms',
        color: '#64748B',
    },
    itemRight: {
        alignItems: 'flex-end',
        gap: '2@vs',
    },
    itemAmount: {
        fontSize: '13.5@ms',
        fontWeight: '600',
        color: '#0F172A',
    },
    itemStatus: {
        fontSize: '11.5@ms',
        color: '#64748B',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(226, 232, 240, 0.5)',
        marginLeft: '44@s', // offset to align with content text
    }
});
