import React from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ArrowDown2, Eye, EyeSlash } from 'iconsax-react-nativejs';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import CurrencyDropdown, { CurrencyItem } from '@/components/CurrencyDropdown';
import { getCurrencySymbol } from '@/utils/helpers';
import { Colors } from '../../constants/theme';
import { FILTERS } from './homeConfig';

const Dot = () => (
    <View style={{
        width: moderateScale(10),
        height: moderateScale(10),
        borderRadius: moderateScale(5),
        backgroundColor: '#0F172A',
        marginHorizontal: moderateScale(2),
    }} />
);

interface HomeBalanceSectionProps {
    selectedFilter: string;
    onSelectFilter: (filter: string) => void;
    balanceLabel: string;
    balanceAmount: string;
    showBalance: boolean;
    onToggleBalance: () => void;
    selectedCurrency: CurrencyItem;
    onSelectCurrency: (currency: CurrencyItem) => void;
    currencySheetVisible: boolean;
    setCurrencySheetVisible: (visible: boolean) => void;
    isLoadingTotals: boolean;
}

export default function HomeBalanceSection({
    selectedFilter,
    onSelectFilter,
    balanceLabel,
    balanceAmount,
    showBalance,
    onToggleBalance,
    selectedCurrency,
    onSelectCurrency,
    currencySheetVisible,
    setCurrencySheetVisible,
    isLoadingTotals,
}: HomeBalanceSectionProps) {
    return (
        <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
                {FILTERS.map((filter) => (
                    <TouchableOpacity
                        key={filter}
                        style={[styles.filterChip, selectedFilter === filter && styles.filterChipActive]}
                        onPress={() => onSelectFilter(filter)}
                    >
                        <Text style={[styles.filterText, selectedFilter === filter && styles.filterTextActive]}>
                            {filter}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={styles.balanceSection}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={styles.balanceHeader}>
                        <Text style={styles.balanceLabel}>{balanceLabel}</Text>
                        <TouchableOpacity onPress={onToggleBalance}>
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
                                onSelect={(currency: CurrencyItem) => onSelectCurrency(currency)}
                                selectedCurrencyCode={selectedCurrency.code}
                                onClose={() => setCurrencySheetVisible(false)}
                            />
                        )}
                    </View>
                </View>

                <View style={styles.balanceRow}>
                    <View style={styles.currencyBadge}>
                        <Text style={styles.currencySymbol}>
                            {getCurrencySymbol(selectedCurrency.code)}
                        </Text>
                    </View>
                    {showBalance ? (
                        isLoadingTotals ? (
                            <ActivityIndicator size="small" color="#1E293B" style={{ marginLeft: moderateScale(10) }} />
                        ) : (
                            <Text style={styles.balanceAmount}>
                                {balanceAmount}
                                <Text style={styles.balanceDecimal}>.00</Text>
                            </Text>
                        )
                    ) : (
                        <View style={{ flexDirection: 'row', alignItems: 'center', height: moderateScale(38) }}>
                            <Dot /><Dot /><Dot />
                        </View>
                    )}
                </View>
            </View>
        </>
    );
}

const styles = ScaledSheet.create({
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
        gap: '4@s',
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
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    flagText: {
        fontSize: '16@ms',
        lineHeight: '16@ms',
    },
    currencyCode: {
        color: '#FFFFFF',
        fontSize: '14@ms',
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
});
