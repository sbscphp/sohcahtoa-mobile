import DatePickerField from '@/components/DatePickerField';
import { CloseCircle, TickSquare, WalletMinus } from 'iconsax-react-nativejs';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';

const STATUS_OPTIONS = [
    { label: 'Draft', value: 'DRAFT' },
    { label: 'Pending', value: 'AWAITING_VERIFICATION' },
    { label: 'In Progress', value: 'VERIFICATION_IN_PROGRESS' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Declined', value: 'REJECTED' },
];

const TYPE_OPTIONS = [
    { label: 'PTA', value: 'PTA' },
    { label: 'BTA', value: 'BTA' },
];

const GROUP_OPTIONS = [
    { label: 'Buy FX', value: 'BUY' },
    { label: 'Sell FX', value: 'SELL' },
    { label: 'Receive FX', value: 'REMITTANCE' },
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
                    style={styles.checkboxOption}
                    onPress={() => onToggle(opt.value)}
                >
                    {selected === opt.value ? (
                        <TickSquare size={moderateScale(20)} color="#FF6B2C" variant="Bold" />
                    ) : (
                        <View style={styles.checkbox} />
                    )}
                    <Text style={styles.optionText}>{opt.label}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>

                <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />

                <View style={styles.sheetContent}>
                    <View style={styles.topRow}>
                        <View style={styles.headerIconContainer}>
                            <WalletMinus color="#FF6B2C" width={24} height={24} />
                        </View>
                        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                            <CloseCircle size={moderateScale(24)} color="#94A3B8" variant="Bulk" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.header}>
                        <Text style={styles.title}>Filter Transaction</Text>
                        <Text style={styles.subtitle}>Select an option below</Text>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Date Filter */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Filter by Date</Text>
                            <View style={styles.dateRow}>
                                <View style={styles.dateInputContainer}>
                                    <DatePickerField
                                        label="Start Date"
                                        value={startDate}
                                        onDateChange={setStartDate}
                                        placeholder="DD/MM/YYYY"
                                    />
                                </View>
                                <View style={styles.dateInputContainer}>
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
                            <Text style={styles.sectionTitle}>Status</Text>
                            {renderChips(STATUS_OPTIONS, selectedStatus, toggle(setSelectedStatus))}
                        </View>

                        {/* Type Filter */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Transaction Type</Text>
                            {renderChips(TYPE_OPTIONS, selectedType, toggle(setSelectedType))}
                        </View>

                        {/* Group Filter */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Transaction Group</Text>
                            {renderChips(GROUP_OPTIONS, selectedGroup, toggle(setSelectedGroup))}
                        </View>

                        {/* Currency Filter */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Currency</Text>
                            {renderChips(CURRENCY_OPTIONS, selectedCurrency, toggle(setSelectedCurrency))}
                        </View>
                    </ScrollView>

                    {/* Actions */}
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.filterBtn} onPress={handleFilter}>
                            <Text style={styles.filterBtnText}>Apply Filter</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.closeActionBtn} onPress={handleReset}>
                            <Text style={styles.closeActionBtnText}>Reset Filters</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = ScaledSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    sheetContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: '24@ms',
        paddingHorizontal: '20@s',
        paddingTop: '10@vs',
        paddingBottom: '24@vs',
        marginHorizontal: '12@s',
        marginBottom: '40@vs',
        maxHeight: '80%',
    },
    header: {
        marginBottom: '24@vs',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16@vs',
    },
    closeBtn: {
        padding: '4@ms',
    },
    headerIconContainer: {
        width: '48@ms',
        height: '48@ms',
        borderRadius: '24@ms',
        backgroundColor: '#FFF7ED',
        justifyContent: 'center',
        alignItems: 'center',
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
    dateInputContainer: {
        flex: 1,
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
