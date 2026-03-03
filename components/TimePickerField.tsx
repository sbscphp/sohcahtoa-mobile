import DateTimePicker from '@react-native-community/datetimepicker';
import { Clock } from 'iconsax-react-nativejs';
import React, { useEffect, useState } from 'react';
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


function parseTime(timeString: string): Date {
    const d = new Date(2000, 0, 1);
    if (!timeString) {
        d.setHours(9, 0, 0, 0);
        return d;
    }
    const parts = timeString.split(':');
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    d.setHours(isNaN(h) ? 9 : h, isNaN(m) ? 0 : m, 0, 0);
    return d;
}

/** Date → "HH:mm" */
function formatTime(date: Date): string {
    return [
        String(date.getHours()).padStart(2, '0'),
        String(date.getMinutes()).padStart(2, '0'),
    ].join(':');
}

const TimePickerField: React.FC<TimePickerFieldProps> = ({
    label,
    value,
    onTimeChange,
    placeholder = 'hh:mm',
    required = false,
    error,
}) => {
    const [showPicker, setShowPicker] = useState(false);

    const [tempTime, setTempTime] = useState<Date>(value ? parseTime(value) : new Date());
    const [pickerKey, setPickerKey] = useState(0);

    useEffect(() => {
        if (!showPicker) {
            setTempTime(parseTime(value));
        }
    }, [value, showPicker]);

    const handleOpen = () => {
        setTempTime(parseTime(value));
        setPickerKey(k => k + 1);
        setShowPicker(true);
    };

    const handleChange = (_event: any, date?: Date) => {
        if (date) {
            setTempTime(date);
        }
    };

    const handleConfirm = () => {
        onTimeChange(formatTime(tempTime));
        setShowPicker(false);
    };

    const handleCancel = () => {
        setShowPicker(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>
                {label} {required && <Text style={styles.required}>*</Text>}
            </Text>

            <TouchableOpacity
                style={[styles.inputWrapper, error ? styles.inputError : undefined]}
                onPress={handleOpen}
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

            <Modal
                animationType="slide"
                transparent
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

                        {/*
                         * key={pickerKey} forces a clean remount each time the
                         * picker opens → Android native spinner resets to
                         * tempTimeRef.current instead of reusing stale state.
                         */}
                        <DateTimePicker
                            key={pickerKey}
                            value={tempTime}
                            mode="time"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            is24Hour={true}
                            onChange={handleChange}
                            textColor="#0F172A"
                            style={{ width: '100%' }}
                        />

                        <View style={styles.buttonContainer}>
                            <PrimaryButton title="Confirm" onPress={handleConfirm} />
                            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
        marginBottom: '4@vs',
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
