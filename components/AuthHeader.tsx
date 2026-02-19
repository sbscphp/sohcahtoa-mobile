import { useRouter } from 'expo-router';
import { ArrowCircleLeft2 } from 'iconsax-react-nativejs';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';

interface AuthHeaderProps {
    title: string;
    showBackButton?: boolean;
    disableBackButton?: boolean;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({ title, showBackButton = true, disableBackButton = false }) => {
    const router = useRouter();

    return (
        <View style={styles.header}>
            {showBackButton ? (
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={[styles.backButton, disableBackButton && { opacity: 0.5 }]}
                    accessible={true}
                    accessibilityLabel="Go back"
                    accessibilityRole="button"
                    disabled={disableBackButton}
                >
                    <ArrowCircleLeft2 size={moderateScale(28)} color="#94A3B8" />
                </TouchableOpacity>
            ) : (
                <View style={{ width: moderateScale(28) }} />
            )}
            <Text style={styles.headerTitle}>{title}</Text>
            <View style={{ width: moderateScale(28) }} />
        </View>
    );
};



const styles = ScaledSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: '16@s',
        paddingVertical: '8@vs',
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    backButton: {
        padding: '4@ms',
    },
    headerTitle: {
        fontSize: '15@ms',
        fontWeight: '600',
        color: '#0F172A',
    },
});

export default AuthHeader;
