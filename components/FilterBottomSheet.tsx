import DatePickerField from '@/components/DatePickerField';
import { AnimatedBottomSheet } from '@/components/ui/AnimatedBottomSheet';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useDevicePose } from '@/hooks/useDevicePose';
import { TickSquare, WalletMinus } from 'iconsax-react-nativejs';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';

const STATUS_OPTIONS = [
    { label: 'Draft', value: 'DRAFT' },
    { label: 'Awaiting Verification', value: 'AWAITING_VERIFICATION' },
    { label: 'Verification In Progress', value: 'VERIFICATION_IN_PROGRESS' },
    { label: 'Verification Completed', value: 'VERIFICATION_COMPLETED' },
    { label: 'Awaiting Deposit', value: 'AWAITING_DEPOSIT' },
    { label: 'Deposit Pending', value: 'DEPOSIT_PENDING' },
    { label: 'Deposit Confirmed', value: 'DEPOSIT_CONFIRMED' },
    { label: 'Compliance Review', value: 'COMPLIANCE_REVIEW' },
    { label: 'Admin Approval Pending', value: 'ADMIN_APPROVAL_PENDING' },
    { label: 'Awaiting Refund Verification', value: 'AWAITING_REFUND_VERIFICATION' },
    { label: 'Awaiting Disbursement', value: 'AWAITING_DISBURSEMENT' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Disbursement In Progress', value: 'DISBURSEMENT_IN_PROGRESS' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'Cancelled', value: 'CANCELLED' },
];

const TYPE_OPTIONS = [
    { label: 'PTA', value: 'PTA' },
    { label: 'BTA', value: 'BTA' },
    { label: 'School Fees', value: 'SCHOOL_FEES' },
    { label: 'Medical', value: 'MEDICAL' },
    { label: 'Professional Body', value: 'PROFESSIONAL_BODY' },
    { label: 'Touring', value: 'TOURING' },
    { label: 'Resident', value: 'RESIDENT_FX' },
    { label: 'Tourist', value: 'TOURIST_FX' },
    { label: 'Expatriate', value: 'EXPATRIATE_FX' },
    { label: 'IMTO Remittance', value: 'IMTO_REMITTANCE' },
    { label: 'Cash Remittance', value: 'CASH_REMITTANCE' },
];

const GROUP_OPTIONS = [
    { label: 'Buy FX', value: 'BUY' },
    { label: 'Sell FX', value: 'SELL' },
    { label: 'Others', value: 'REMITTANCE' },
];

const CURRENCY_OPTIONS = [
    { label: 'USD', value: 'USD' },
    { label: 'GBP', value: 'GBP' },
    { label: 'EUR', value: 'EUR' },
];

interface FilterBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    onFilter: (filters: {
        startDate: string;
        endDate: string;
        status: string;
        type: string;
        group: string;
        currency: string;
    }) => void;
}

const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
    visible,
    onClose,
    onFilter
}) => {
    const { colors, isDark } = useAppTheme();
    const { isFoldedDisplay } = useDevicePose();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('');
    const [selectedCurrency, setSelectedCurrency] = useState('');

    const toggle = (setter: React.Dispatch<React.SetStateAction<string>>) => (value: string) => {
        setter((prev) => prev === value ? '' : value);
    };

    const handleFilter = () => {
        onFilter({
            startDate,
            endDate,
            status: selectedStatus,
            type: selectedType,
            group: selectedGroup,
            currency: selectedCurrency,
        });
    };

    const handleReset = () => {
        setStartDate('');
        setEndDate('');
        setSelectedStatus('');
        setSelectedType('');
        setSelectedGroup('');
        setSelectedCurrency('');
        onFilter({ startDate: '', endDate: '', status: '', type: '', group: '', currency: '' });
    };

    const renderChips = (
        options: { label: string; value: string }[],
        selected: string,
        onToggle: (value: string) => void
    ) => (
        <View style={styles.chipRow}>
            {options.map((opt) => (
                <TouchableOpacity
                    key={opt.value}
                    style={[styles.checkboxOption, { backgroundColor: colors.card }]}
                    onPress={() => onToggle(opt.value)}
                >
                    {selected === opt.value ? (
                        <TickSquare size={moderateScale(20)} color="#FF6B2C" variant="Bold" />
                    ) : (
                        <View style={[styles.checkbox, { borderColor: colors.border }]} />
                    )}
                    <Text style={[styles.optionText, { color: colors.text }]}>{opt.label}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const headerContent = (
        <View style={styles.header}>
            <View style={[styles.headerIconContainer, { backgroundColor: isDark ? 'rgba(255, 107, 44, 0.18)' : '#FFF7ED' }]}>
                <WalletMinus color="#FF6B2C" width={24} height={24} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Filter Transaction</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>Select an option below</Text>
        </View>
    );

    return (
        <AnimatedBottomSheet
            visible={visible}
            onClose={onClose}
            headerComponent={headerContent}
            sheetStyle={[styles.sheetContent, { backgroundColor: colors.surface }]}
        >
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Date Filter */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Filter by Date</Text>
                    <View style={[styles.dateRow, isFoldedDisplay && styles.dateColumn]}>
                        <View style={[styles.dateInputContainer, isFoldedDisplay && styles.dateInputContainerFull]}>
                            <DatePickerField
                                label="Start Date"
                                value={startDate}
                                onDateChange={setStartDate}
                                placeholder="DD/MM/YYYY"
                            />
                        </View>
                        <View style={[styles.dateInputContainer, isFoldedDisplay && styles.dateInputContainerFull]}>
                            <DatePickerField
                                label="End Date"
                                value={endDate}
                                onDateChange={setEndDate}
                                placeholder="DD/MM/YYYY"
                            />
                        </View>
                    </View>
                </View>

                {/* Status Filter */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Status</Text>
                    {renderChips(STATUS_OPTIONS, selectedStatus, toggle(setSelectedStatus))}
                </View>

                {/* Type Filter */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Transaction Type</Text>
                    {renderChips(TYPE_OPTIONS, selectedType, toggle(setSelectedType))}
                </View>

                {/* Group Filter */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Transaction Group</Text>
                    {renderChips(GROUP_OPTIONS, selectedGroup, toggle(setSelectedGroup))}
                </View>

                {/* Currency Filter */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>Currency</Text>
                    {renderChips(CURRENCY_OPTIONS, selectedCurrency, toggle(setSelectedCurrency))}
                </View>
            </ScrollView>

            {/* Actions */}
            <View style={styles.actions}>
                <TouchableOpacity style={styles.filterBtn} onPress={handleFilter}>
                    <Text style={styles.filterBtnText}>Apply Filter</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.closeActionBtn, { backgroundColor: isDark ? colors.surfaceHighlight : '#F1F5F9' }]}
                    onPress={handleReset}
                >
                    <Text style={[styles.closeActionBtnText, { color: colors.text }]}>Reset Filters</Text>
                </TouchableOpacity>
            </View>
        </AnimatedBottomSheet>
    );
};

const styles = ScaledSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFill,
    },
    sheetContent: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: '24@ms',
        paddingHorizontal: '20@s',
        paddingTop: '10@vs',
        paddingBottom: '24@vs',
        maxHeight: '85%',
    },
    header: {
        width: '100%',
        marginBottom: '16@vs',
    },
    headerIconContainer: {
        width: '48@ms',
        height: '48@ms',
        borderRadius: '24@ms',
        backgroundColor: '#FFF7ED',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '12@vs',
    },
    title: {
        fontSize: '17@ms',
        fontWeight: '500',
        color: '#0F172A',
        marginBottom: '4@vs',
    },
    subtitle: {
        fontSize: '13@ms',
        color: '#64748B',
    },
    section: {
        marginBottom: '24@vs',
    },
    sectionTitle: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#64748B',
        marginBottom: '12@vs',
    },
    dateRow: {
        flexDirection: 'row',
        gap: '12@s',
    },
    dateColumn: {
        flexDirection: 'column',
        gap: '12@vs',
    },
    dateInputContainer: {
        flex: 1,
    },
    dateInputContainerFull: {
        flex: 0,
        width: '100%',
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: '10@s',
    },
    checkboxOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        paddingHorizontal: '12@s',
        paddingVertical: '10@vs',
        borderRadius: '8@ms',
        gap: '8@s',
    },
    checkbox: {
        width: '20@ms',
        height: '20@ms',
        borderRadius: '6@ms',
        borderWidth: 1.5,
        borderColor: '#CBD5E1',
    },
    optionText: {
        fontSize: '14@ms',
        color: '#0F172A',
        fontWeight: '500',
    },
    actions: {
        gap: '12@vs',
        marginTop: '8@vs',
    },
    filterBtn: {
        backgroundColor: '#FF6B2C',
        borderRadius: '30@ms',
        paddingVertical: '16@vs',
        alignItems: 'center',
    },
    filterBtnText: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#FFFFFF',
    },
    closeActionBtn: {
        backgroundColor: '#F1F5F9',
        borderRadius: '30@ms',
        paddingVertical: '16@vs',
        alignItems: 'center',
    },
    closeActionBtnText: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#0F172A',
    },
});

export default FilterBottomSheet;
