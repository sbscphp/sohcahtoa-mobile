import DateTimePicker from '@react-native-community/datetimepicker';
import { Clock } from 'iconsax-react-nativejs';
import React, { useState } from 'react';
import { Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { moderateScale, ScaledSheet } from 'react-native-size-matters';
import PrimaryButton from './PrimaryButton';

interface TimePickerFieldProps {
    label: string;
    value: string;
    onTimeChange: (time: string) => void;
    placeholder?: string;
    required?: boolean;
    error?: string;
}

const TimePickerField: React.FC<TimePickerFieldProps> = ({
    label,
    value,
    onTimeChange,
    placeholder = 'hh:mm',
    required = false,
    error
}) => {
    const [showPicker, setShowPicker] = useState(false);
    const [selectedTime, setSelectedTime] = useState<Date | undefined>(
        value ? parseTime(value) : undefined
    );
    const [tempTime, setTempTime] = useState<Date | undefined>(
        value ? parseTime(value) : new Date()
    );

    // Parse hh:mm to Date
    function parseTime(timeString: string): Date | undefined {
        if (!timeString) return undefined;
        const parts = timeString.split(':');
        if (parts.length >= 2) {
            const hours = parseInt(parts[0], 10);
            const minutes = parseInt(parts[1], 10);
            const date = new Date();
            date.setHours(hours);
            date.setMinutes(minutes);
            date.setSeconds(0);
            return date;
        }
        return undefined;
    }

    // Format Date to hh:mm
    function formatTime(date: Date): string {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    const handleTimeChange = (event: any, time?: Date) => {
        if (Platform.OS === 'android') {
            setShowPicker(false);
            // event.type can be 'set' (confirmed) or 'dismissed' (cancelled)
            if (event.type === 'set' && time) {
                setSelectedTime(time);
                setTempTime(time);
                onTimeChange(formatTime(time));
            }
        } else {
            // iOS — always update temp time as user scrolls
            if (time) {
                setTempTime(time);
            }
        }
    };

    const handlePress = () => {
        setShowPicker(true);
    };

    const handleCancel = () => {
        setTempTime(selectedTime || new Date());
        setShowPicker(false);
    };

    const handleConfirm = () => {
        if (tempTime) {
            setSelectedTime(tempTime);
            const formattedTime = formatTime(tempTime);
            onTimeChange(formattedTime);
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
                <Clock
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
                                value={tempTime || new Date()}
                                mode="time"
                                display="spinner"
                                onChange={handleTimeChange}
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
                    value={tempTime || new Date()}
                    mode="time"
                    display="spinner"
                    onChange={handleTimeChange}
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

export default TimePickerField;
