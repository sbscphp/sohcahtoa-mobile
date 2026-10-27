import AnimatedBottomSheet from '@/components/ui/AnimatedBottomSheet';
import { useAppTheme } from '@/hooks/useAppTheme';
import { InfoCircle } from 'iconsax-react-nativejs';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import PrimaryButton from './PrimaryButton';

interface OtpOptionSheetProps {
    isVisible: boolean;
    onClose: () => void;
    onSelect: (option: 'phone' | 'email') => void;
    loading: boolean;
}

const OtpOptionSheet: React.FC<OtpOptionSheetProps> = ({ isVisible, onClose, onSelect, loading }) => {
    const { colors, isDark } = useAppTheme();
    const [selectedOption, setSelectedOption] = useState<'phone' | 'email' | null>(null);

    const handleSelect = () => {
        if (selectedOption) {
            onSelect(selectedOption);
            setSelectedOption(null);
        }
    };

    return (
        <AnimatedBottomSheet
            visible={isVisible}
            onClose={onClose}
            sheetStyle={[styles.sheetContainer, { backgroundColor: colors.surface }]}
        >
            <View style={styles.headerIconContainer}>
                <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(255, 107, 44, 0.18)' : '#F8F9FA' }]}>
                    <InfoCircle size={moderateScale(28)} color="#FF6B2C" variant="Bold" />
                </View>
            </View>

            <Text style={[styles.title, { color: colors.text }]}>Send OTP</Text>
            <Text style={[styles.description, { color: colors.textMuted }]}>
                We need you to verify your bvn. Kindly select where you want your Otp sent
            </Text>

            <View style={styles.optionsContainer}>
                <TouchableOpacity
                    style={[
                        styles.optionCard,
                        { backgroundColor: colors.card, borderColor: colors.border },
                        selectedOption === 'phone' && [
                            styles.selectedCard,
                            {
                                borderColor: colors.primary,
                                backgroundColor: isDark ? 'rgba(255, 107, 44, 0.12)' : '#FFF7F5',
                            },
                        ],
                    ]}
                    onPress={() => setSelectedOption('phone')}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.optionText, { color: colors.text }, selectedOption === 'phone' && [styles.selectedOptionText, { color: colors.text }]]}>
                        Send to my Phone Number
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.optionCard,
                        { backgroundColor: colors.card, borderColor: colors.border },
                        selectedOption === 'email' && [
                            styles.selectedCard,
                            {
                                borderColor: colors.primary,
                                backgroundColor: isDark ? 'rgba(255, 107, 44, 0.12)' : '#FFF7F5',
                            },
                        ],
                    ]}
                    onPress={() => setSelectedOption('email')}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.optionText, { color: colors.text }, selectedOption === 'email' && [styles.selectedOptionText, { color: colors.text }]]}>
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
                    loading={loading}
                />

                <TouchableOpacity
                    style={[styles.closeButton, { backgroundColor: isDark ? colors.surfaceHighlight : '#F3F4F6' }]}
                    onPress={onClose}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.closeButtonText, { color: colors.text }]}>No, Close</Text>
                </TouchableOpacity>
            </View>
        </AnimatedBottomSheet>
    );
};

const styles = ScaledSheet.create({
    sheetContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: '30@ms',
        paddingHorizontal: '24@s',
        paddingTop: '14@vs',
        paddingBottom: '32@vs',
        marginBottom: '28@vs',
        marginHorizontal: '12@s',
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
