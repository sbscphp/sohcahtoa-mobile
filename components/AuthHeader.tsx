import { useRouter } from 'expo-router';
import { ArrowCircleLeft } from 'iconsax-react-nativejs';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';

interface AuthHeaderProps {
    title: string;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({ title }) => {
    const router = useRouter();

    return (
        <View style={styles.header}>
            <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backButton}
                accessible={true}
                accessibilityLabel="Go back"
                accessibilityRole="button"
            >
                <ArrowCircleLeft size={moderateScale(28)} color="#94A3B8" />
            </TouchableOpacity>
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
