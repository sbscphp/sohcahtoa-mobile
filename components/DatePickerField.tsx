import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'iconsax-react-nativejs';
import React, { useState } from 'react';
import { Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { moderateScale, ScaledSheet } from 'react-native-size-matters';
import PrimaryButton from './PrimaryButton';

interface DatePickerFieldProps {
    label: string;
    value: string;
    onDateChange: (date: string) => void;
    placeholder?: string;
    required?: boolean;
    minimumDate?: Date;
    maximumDate?: Date;
    error?: string;
}

const DatePickerField: React.FC<DatePickerFieldProps> = ({
    label,
    value,
    onDateChange,
    placeholder = 'dd/mm/yyyy',
    required = false,
    minimumDate,
    maximumDate,
    error
}) => {
    const [showPicker, setShowPicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
        value ? parseDate(value) : undefined
    );
    const [tempDate, setTempDate] = useState<Date | undefined>(
        value ? parseDate(value) : new Date()
    );

    // Parse dd/mm/yyyy to Date
    function parseDate(dateString: string): Date | undefined {
        if (!dateString) return undefined;
        const parts = dateString.split('/');
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
            const year = parseInt(parts[2], 10);
            return new Date(year, month, day);
        }
        return undefined;
    }

    // Format Date to dd/mm/yyyy
    function formatDate(date: Date): string {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    const handleDateChange = (event: any, date?: Date) => {
        if (Platform.OS === 'android') {
            setShowPicker(false);
            if (date) {
                setSelectedDate(date);
                setTempDate(date);
                const formattedDate = formatDate(date);
                onDateChange(formattedDate);
            }
        } else {
            // iOS - update temp date
            if (date) {
                setTempDate(date);
            }
        }
    };

    const handlePress = () => {
        setShowPicker(true);
    };

    const handleCancel = () => {
        setTempDate(selectedDate || new Date());
        setShowPicker(false);
    };

    const handleConfirm = () => {
        if (tempDate) {
            setSelectedDate(tempDate);
            const formattedDate = formatDate(tempDate);
            onDateChange(formattedDate);
        }
        setShowPicker(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>
                {label} {required && <Text style={styles.required}>*</Text>}
            </Text>
            <TouchableOpacity
                style={[
                    styles.inputWrapper,
                    error ? styles.inputError : undefined
                ]}
                onPress={handlePress}
                activeOpacity={0.7}
            >
                <Text style={[styles.input, !value && styles.placeholder]}>
                    {value || placeholder}
                </Text>
                <Calendar
                    size={moderateScale(20)}
                    color="rgba(77, 75, 75, 1)"
                    style={styles.icon}
                />
            </TouchableOpacity>
            {error && <Text style={styles.errorText}>{error}</Text>}

            {/* Bottom Sheet Modal for iOS, Native Dialog for Android */}
            {Platform.OS === 'ios' && showPicker && (
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={showPicker}
                    onRequestClose={handleCancel}
                >
                    <View style={styles.overlay}>
                        <TouchableOpacity
                            style={styles.backdrop}
                            onPress={handleCancel}
                            activeOpacity={1}
                        />

                        <View style={styles.sheetContent}>
                            <View style={styles.sheetHeader}>
                                <Text style={styles.sheetTitle}>{label}</Text>
                            </View>

                            <DateTimePicker
                                value={tempDate || new Date()}
                                mode="date"
                                display="spinner"
                                onChange={handleDateChange}
                                minimumDate={minimumDate}
                                maximumDate={maximumDate}
                                textColor="#0F172A"
                            />

                            <View style={styles.buttonContainer}>
                                <PrimaryButton
                                    title="Confirm"
                                    onPress={handleConfirm}
                                />
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={handleCancel}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}

            {/* Android Native Picker */}
            {Platform.OS === 'android' && showPicker && (
                <DateTimePicker
                    value={tempDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    minimumDate={minimumDate}
                    maximumDate={maximumDate}
                />
            )}
        </View>
    );
};

const styles = ScaledSheet.create({
    container: {
        marginBottom: '4@vs',
    },
    label: {
        fontSize: '13@ms',
        fontWeight: '500',
        color: '#334155',
        marginBottom: '8@vs',
    },
    required: {
        color: '#EF4444',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '48@vs',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: '30@ms',
        paddingHorizontal: '16@s',
        backgroundColor: '#FFFFFF',
    },
    input: {
        flex: 1,
        fontSize: '14@ms',
        color: '#0F172A',
        fontWeight: '400',
    },
    placeholder: {
        color: '#94A3B8',
    },
    icon: {
        marginLeft: '12@s',
    },
    inputError: {
        borderColor: '#EF4444',
    },
    errorText: {
        fontSize: '11@ms',
        color: '#EF4444',
        marginTop: '4@vs',
        marginLeft: '4@s',
    },
    // Bottom Sheet Styles
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
        borderTopLeftRadius: '24@ms',
        borderTopRightRadius: '24@ms',
        paddingHorizontal: '20@s',
        paddingTop: '20@vs',
        paddingBottom: '40@vs',
    },
    sheetHeader: {
        marginBottom: '16@vs',
        alignItems: 'center',
    },
    sheetTitle: {
        fontSize: '18@ms',
        fontWeight: '700',
        color: '#0F172A',
    },
    buttonContainer: {
        gap: '12@vs',
        marginTop: '24@vs',
    },
    cancelButton: {
        backgroundColor: '#F1F5F9',
        borderRadius: '30@ms',
        paddingVertical: '16@vs',
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#0F172A',
        fontSize: '14@ms',
        fontWeight: '600',
    },
});

export default DatePickerField;
