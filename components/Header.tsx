import { useRouter } from 'expo-router';
import { ArrowCircleLeft2 } from 'iconsax-react-nativejs';
import React, { ReactNode } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';

interface HeaderProps {
    title: string;
    rightIcon?: ReactNode;
    onRightPress?: () => void;
    onBackPress?: () => void;
    showBackButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, rightIcon, onRightPress, onBackPress, showBackButton = true }) => {
    const router = useRouter();

    return (
        <View style={styles.header}>
            {showBackButton ? (
                <TouchableOpacity
                    onPress={onBackPress || (() => router.back())}
                    style={styles.btn}
                    accessible={true}
                    accessibilityLabel="Go back"
                    accessibilityRole="button"
                >
                    <ArrowCircleLeft2 size={moderateScale(28)} color="#94A3B8" />
                </TouchableOpacity>
            ) : (
                <View style={{ width: moderateScale(36) }} />
            )}

            <Text style={styles.headerTitle}>{title}</Text>

            <View style={styles.rightContainer}>
                {rightIcon ? (
                    <TouchableOpacity onPress={onRightPress} style={styles.btn}>
                        {rightIcon}
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: moderateScale(24) }} />
                )}
            </View>
        </View>
    );
};

const styles = ScaledSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: '10@s',
        paddingVertical: '12@vs',
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    btn: {
        padding: '4@ms',
    },
    headerTitle: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: 'rgba(50, 49, 49, 1)',
    },
    rightContainer: {
        minWidth: '32@s',
        alignItems: 'flex-end',
    }
});

export default Header;
