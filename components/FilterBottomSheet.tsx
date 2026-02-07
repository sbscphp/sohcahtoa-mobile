import InputField from '@/components/InputField';
import { Calendar, CloseCircle, TickSquare, WalletMinus } from 'iconsax-react-nativejs';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';

interface FilterBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    onFilter: (filters: { startDate: string; endDate: string; statusSelected: boolean; typeSelected: boolean }) => void;
}

const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
    visible,
    onClose,
    onFilter
}) => {
    const [startDate, setStartDate] = useState('Dec 1 2025');
    const [endDate, setEndDate] = useState('Dec 9 2025');
    const [statusSelected, setStatusSelected] = useState(false);
    const [typeSelected, setTypeSelected] = useState(false);

    const handleFilter = () => {
        onFilter({ startDate, endDate, statusSelected, typeSelected });
    };

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


                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Filter by Date</Text>
                        <View style={styles.dateRow}>
                            <View style={styles.dateInputContainer}>
                                <InputField
                                    label="Start Date"
                                    value={startDate}
                                    onChangeText={setStartDate}
                                    placeholder="MMM D YYYY"
                                    rightIcon={Calendar}
                                />
                            </View>
                            <View style={styles.dateInputContainer}>
                                <InputField
                                    label="End Date"
                                    value={endDate}
                                    onChangeText={setEndDate}
                                    placeholder="MMM D YYYY"
                                    rightIcon={Calendar}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Others */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Others</Text>
                        <View style={styles.othersRow}>
                            <TouchableOpacity
                                style={styles.checkboxOption}
                                onPress={() => setStatusSelected(!statusSelected)}
                            >
                                {statusSelected ? (
                                    <TickSquare size={moderateScale(20)} color="#FF6B2C" variant="Bold" />
                                ) : (
                                    <View style={styles.checkbox} />
                                )}
                                <Text style={styles.optionText}>Status (Pending)</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.checkboxOption}
                                onPress={() => setTypeSelected(!typeSelected)}
                            >
                                {typeSelected ? (
                                    <TickSquare size={moderateScale(20)} color="#FF6B2C" variant="Bold" />
                                ) : (
                                    <View style={styles.checkbox} />
                                )}
                                <Text style={styles.optionText}>Type (Debit)</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Actions */}
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.filterBtn} onPress={handleFilter}>
                            <Text style={styles.filterBtnText}>Filter</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.closeActionBtn} onPress={onClose}>
                            <Text style={styles.closeActionBtnText}>No, Close</Text>
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
    othersRow: {
        flexDirection: 'row',
        gap: '12@s',
    },
    checkboxOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        paddingHorizontal: '12@s',
        paddingVertical: '10@vs',
        borderRadius: '8@ms',
        minWidth: '100@s',
        gap: '8@s',
    },
    checkbox: {
        width: '20@ms',
        height: '20@ms',
        borderRadius: '6@ms',
        borderWidth: 1.5,
        borderColor: '#CBD5E1',
    },
    checkboxChecked: {
        backgroundColor: '#FF6B2C',
        borderColor: '#FF6B2C',
    },
    optionText: {
        fontSize: '14@ms',
        color: '#0F172A',
        fontWeight: '500',
    },
    actions: {
        gap: '12@vs',
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
