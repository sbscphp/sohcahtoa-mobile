import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Notification } from 'iconsax-react-nativejs';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import { getGreeting } from './homeConfig';

interface HomeHeaderProps {
    user: {
        profile?: {
            firstName?: string;
            lastName?: string;
        } | null;
    } | null;
    unreadCount: number;
    onNotificationPress: () => void;
}

export default function HomeHeader({ user, unreadCount, onNotificationPress }: HomeHeaderProps) {
    const initials = user?.profile
        ? `${user.profile.firstName?.[0] ?? ''}${user.profile.lastName?.[0] ?? ''}`.toUpperCase()
        : 'U';
    const fullName = user?.profile
        ? `${user.profile.firstName} ${user.profile.lastName}`
        : 'User';

    return (
        <View style={styles.header}>
            <View style={styles.headerLeft}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials}</Text>
                </View>
                <View>
                    <Text style={styles.greeting}>{getGreeting()}</Text>
                    <Text style={styles.username}>{fullName}</Text>
                </View>
            </View>
            <TouchableOpacity onPress={onNotificationPress}>
                <Notification size={moderateScale(24)} color="#1E293B" variant="Linear" />
                {unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = ScaledSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: '14@s',
        marginVertical: '12@vs',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: '12@s',
    },
    avatar: {
        width: '40@ms',
        height: '40@ms',
        borderRadius: '20@ms',
        backgroundColor: '#FFF7ED',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#FF6B2C',
    },
    greeting: {
        fontSize: '12@ms',
        color: '#64748B',
    },
    username: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#0F172A',
    },
    unreadBadge: {
        position: 'absolute',
        top: -moderateScale(4),
        right: -moderateScale(4),
        backgroundColor: '#EF4444',
        minWidth: moderateScale(16),
        height: moderateScale(16),
        borderRadius: moderateScale(8),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
        paddingHorizontal: moderateScale(2),
    },
    unreadText: {
        color: '#FFFFFF',
        fontSize: moderateScale(9),
        fontWeight: 'bold',
    },
});
