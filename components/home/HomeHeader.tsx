import { LiquidGlassView, useLiquidGlassAvailable } from '@/components/ui/LiquidGlassView';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useDevicePose } from '@/hooks/useDevicePose';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
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
    const { colors, isDark } = useAppTheme();
    const canUseGlass = useLiquidGlassAvailable();
    const { isIPhoneDuo, insets } = useDevicePose();
    const rightOffset = isIPhoneDuo
        ? (insets.right > 0 ? Math.min(insets.right, moderateScale(48)) : moderateScale(42))
        : insets.right;

    const initials = user?.profile
        ? `${user.profile.firstName?.[0] ?? ''}${user.profile.lastName?.[0] ?? ''}`.toUpperCase()
        : 'U';
    const fullName = user?.profile
        ? `${user.profile.firstName} ${user.profile.lastName}`
        : 'User';

    return (
        <View style={styles.header}>
            <View style={styles.headerLeft}>
                <View style={[styles.avatar, { backgroundColor: isDark ? 'rgba(255, 107, 44, 0.18)' : '#FFF7ED' }]}>
                    <Text style={styles.avatarText}>{initials}</Text>
                </View>
                <View>
                    <Text style={[styles.greeting, { color: colors.textMuted }]}>{getGreeting()}</Text>
                    <Text style={[styles.username, { color: colors.text }]}>{fullName}</Text>
                </View>
            </View>
            <LiquidGlassView
                variant="clear"
                interactive
                borderRadius={moderateScale(20)}
                style={{ marginRight: rightOffset }}
                glassStyle={styles.notificationGlass}
            >
                <Pressable
                    onPress={onNotificationPress}
                    style={({ pressed }) => [
                        canUseGlass && styles.notificationPressableGlass,
                        !canUseGlass && pressed && { opacity: 0.7 },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel="Notifications"
                >
                    <Notification size={moderateScale(24)} color={colors.icon} variant="Linear" />
                    {unreadCount > 0 && (
                        <View style={styles.unreadBadge}>
                            <Text style={styles.unreadText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                        </View>
                    )}
                </Pressable>
            </LiquidGlassView>
        </View>
    );
}

const styles = ScaledSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: '14@s',
        marginVertical: '16@vs',
        minHeight: '56@vs',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: '12@s',
    },
    avatar: {
        width: '44@ms',
        height: '44@ms',
        borderRadius: '22@ms',
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
    notificationGlass: {
        width: '40@ms',
        height: '40@ms',
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationPressableGlass: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
