import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ArrowDown2, Eye, EyeSlash } from 'iconsax-react-nativejs';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import CurrencyDropdown, { CurrencyItem } from '@/components/CurrencyDropdown';
import { getCurrencySymbol } from '@/utils/helpers';
import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';
import { FILTERS } from './homeConfig';

const Dot = ({ color = '#0F172A' }: { color?: string }) => (
    <View style={{
        width: moderateScale(10),
        height: moderateScale(10),
        borderRadius: moderateScale(5),
        backgroundColor: color,
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
    const { colors, isDark } = useAppTheme();

    return (
        <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
                {FILTERS.map((filter) => {
                    const isActive = selectedFilter === filter;
                    return (
                        <Pressable
                            key={filter}
                            style={({ pressed }) => [
                                styles.filterChip,
                                { borderColor: colors.border, backgroundColor: colors.card },
                                isActive && [
                                    styles.filterChipActive,
                                    {
                                        backgroundColor: isDark ? colors.primarySoft : '#FFF7ED',
                                        borderColor: colors.tabIconSelected,
                                    },
                                ],
                                pressed && { opacity: 0.75 },
                            ]}
                            onPress={() => onSelectFilter(filter)}
                            accessibilityRole="button"
                            accessibilityState={{ selected: isActive }}
                        >
                            <Text style={[styles.filterText, { color: colors.textMuted }, isActive && [styles.filterTextActive, { color: colors.tabIconSelected }]]}>
                                {filter}
                            </Text>
                        </Pressable>
                    );
                })}
            </ScrollView>

            <View style={styles.balanceSection}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={styles.balanceHeader}>
                        <Text style={[styles.balanceLabel, { color: colors.textMuted }]}>{balanceLabel}</Text>
                        <TouchableOpacity onPress={onToggleBalance}>
                            {showBalance ?
                                <Eye size={moderateScale(18)} color={colors.icon} variant="Bold" /> :
                                <EyeSlash size={moderateScale(18)} color={colors.icon} variant="Bold" />
                            }
                        </TouchableOpacity>
                    </View>

                    <View style={{ zIndex: 100 }}>
                        <Pressable
                            style={({ pressed }) => [
                                styles.currencySelector,
                                {
                                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(35, 35, 35, 1)',
                                    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                                    borderWidth: isDark ? 1 : 0,
                                },
                                pressed && { opacity: 0.8 },
                            ]}
                            onPress={() => setCurrencySheetVisible(!currencySheetVisible)}
                            accessibilityRole="button"
                            accessibilityLabel={`Select currency, current ${selectedCurrency.code}`}
                        >
                            <View style={styles.flagWrapper}>
                                <Text style={styles.flagText}>{selectedCurrency.flag}</Text>
                            </View>
                            <Text style={styles.currencyCode}>{selectedCurrency.code}</Text>
                            <ArrowDown2 size={moderateScale(14)} color="#FFFFFF" />
                        </Pressable>

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
                    <View
                        style={[
                            styles.currencyBadge,
                            {
                                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#EFF6FF',
                                borderColor: isDark ? 'rgba(255, 255, 255, 0.10)' : 'transparent',
                                borderWidth: isDark ? 1 : 0,
                            },
                        ]}
                    >
                        <Text style={[styles.currencySymbol, { color: colors.text }]}>
                            {getCurrencySymbol(selectedCurrency.code)}
                        </Text>
                    </View>
                    {showBalance ? (
                        isLoadingTotals ? (
                            <ActivityIndicator size="small" color={colors.text} style={{ marginLeft: moderateScale(10) }} />
                        ) : (
                            <Text style={[styles.balanceAmount, { color: colors.text }]}>
                                {balanceAmount}
                                <Text style={[styles.balanceDecimal, { color: colors.textMuted }]}>.00</Text>
                            </Text>
                        )
                    ) : (
                        <View style={{ flexDirection: 'row', alignItems: 'center', height: moderateScale(38) }}>
                            <Dot color={colors.text} /><Dot color={colors.text} /><Dot color={colors.text} />
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
