import { InfoCircle } from 'iconsax-react-nativejs';
import React, { useState } from 'react';
import { Modal, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import PrimaryButton from './PrimaryButton';

interface OtpOptionSheetProps {
    isVisible: boolean;
    onClose: () => void;
    onSelect: (option: 'phone' | 'email') => void;
}

const OtpOptionSheet: React.FC<OtpOptionSheetProps> = ({ isVisible, onClose, onSelect }) => {
    const [selectedOption, setSelectedOption] = useState<'phone' | 'email' | null>(null);

    const handleSelect = () => {
        if (selectedOption) {
            onSelect(selectedOption);
            setSelectedOption(null); // Reset for next time
        }
    };

    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.backdrop} />
            </TouchableWithoutFeedback>

            <View style={styles.mainContainer}>
                <View style={styles.sheetContainer}>
                    <View style={styles.headerIconContainer}>
                        <View style={styles.iconCircle}>
                            <InfoCircle size={moderateScale(28)} color="#FF6B2C" variant="Bold" />
                        </View>
                    </View>

                    <Text style={styles.title}>Send OTP</Text>
                    <Text style={styles.description}>
                        We need you to verify your bvn. Kindly select where you want your Otp sent
                    </Text>

                    <View style={styles.optionsContainer}>
                        <TouchableOpacity
                            style={[styles.optionCard, selectedOption === 'phone' && styles.selectedCard]}
                            onPress={() => setSelectedOption('phone')}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.optionText, selectedOption === 'phone' && styles.selectedOptionText]}>
                                Send to my Phone Number
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.optionCard, selectedOption === 'email' && styles.selectedCard]}
                            onPress={() => setSelectedOption('email')}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.optionText, selectedOption === 'email' && styles.selectedOptionText]}>
                                Send to my Email Address
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.buttonContainer}>
                        <PrimaryButton
                            title="Select option"
                            onPress={handleSelect}
                            disabled={!selectedOption}
                            style={styles.primaryButton}
                        />

                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={onClose}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.closeButtonText}>No, Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = ScaledSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    mainContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'transparent',
    },
    sheetContainer: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: '32@ms',
        borderTopRightRadius: '32@ms',
        paddingHorizontal: '24@s',
        paddingTop: '20@vs',
        paddingBottom: '32@vs',
    },
    headerIconContainer: {
        marginBottom: '16@vs',
    },
    iconCircle: {
        width: '44@ms',
        height: '44@ms',
        borderRadius: '22@ms',
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: '18@ms',
        fontWeight: '700',
        color: '#111827',
        marginBottom: '10@vs',
    },
    description: {
        fontSize: '14@ms',
        color: '#6B7280',
        lineHeight: '22@ms',
        marginBottom: '24@vs',
    },
    optionsContainer: {
        gap: '12@vs',
        marginBottom: '32@vs',
    },
    optionCard: {
        paddingVertical: '16@vs',
        paddingHorizontal: '16@s',
        borderWidth: 1,
        borderColor: '#F3F4F6',
        borderRadius: '12@ms',
        backgroundColor: '#F9FAFB',
    },
    selectedCard: {
        borderColor: '#FF6B2C',
        backgroundColor: '#FFF7F5',
    },
    optionText: {
        fontSize: '15@ms',
        color: '#374151',
        fontWeight: '500',
    },
    selectedOptionText: {
        color: '#111827',
        fontWeight: '600',
    },
    buttonContainer: {
        gap: '12@vs',
    },
    primaryButton: {
        height: '48@vs',
    },
    closeButton: {
        height: '48@vs',
        backgroundColor: '#F3F4F6',
        borderRadius: '28@ms',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: '15@ms',
        fontWeight: '600',
        color: '#374151',
    },
});

export default OtpOptionSheet;
