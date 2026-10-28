import Header from '@/components/Header';
import PrimaryButton from '@/components/PrimaryButton';
import { ThemeSelectionSheet, THEME_OPTIONS } from '@/components/ThemeSelectionSheet';
import { AnimatedTabScreen } from '@/components/ui/AnimatedTabScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '@/context/ThemeContext';
import { useLogoutMutation } from '@/hooks/queries/auth/useLogoutMutation';
import { useGetUnreadCountQuery } from '@/hooks/queries/notifications/useGetUnreadCountQuery';
import { useRouter } from 'expo-router';
import {
    Bookmark,
    Headphone,
    InfoCircle,
    Judge,
    LogoutCurve,
    MessageQuestion,
    Notification,
    ProfileTick,
    ShieldSecurity,
} from 'iconsax-react-nativejs';
import { Moon, Sun } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { moderateScale, ScaledSheet } from 'react-native-size-matters';

interface MenuItem {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    onPress?: () => void;
    isLogout?: boolean;
    rightElement?: React.ReactNode;
}

export default function MoreScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors, themeMode, isDark } = useAppTheme();
    const [logoutModalVisible, setLogoutModalVisible] = useState(false);
    const [themeSheetVisible, setThemeSheetVisible] = useState(false);
    const { mutate: logout, isPending } = useLogoutMutation();

    const { data: unreadData } = useGetUnreadCountQuery();
    const unreadCount = unreadData?.data?.count || 0;

    const currentThemeLabel =
        THEME_OPTIONS.find((opt) => opt.mode === themeMode)?.label || 'System Default';

    const menuItems: MenuItem[] = [
        {
            icon: <ProfileTick size={moderateScale(18)} color={colors.primary} variant="Linear" />,
            title: 'My Profile',
            subtitle: 'Manage your profile and account details',
            onPress: () => router.push('/profile'),
        },
        {
            icon: <ShieldSecurity size={moderateScale(18)} color={colors.primary} variant="Linear" />,
            title: 'Security',
            subtitle: 'Update password, keep your account secure.',
            onPress: () => router.push('/security/change-password'),
        },
        {
            icon: isDark ? (
                <Moon size={moderateScale(18)} color={colors.primaryLight} />
            ) : (
                <Sun size={moderateScale(18)} color={colors.primary} />
            ),
            title: 'Appearance',
            subtitle: 'Switch between Light, Dark, and System Default',
            onPress: () => setThemeSheetVisible(true),
            rightElement: (
                <View
                    style={[
                        styles.themeBadge,
                        {
                            backgroundColor: isDark ? 'rgba(255, 104, 19, 0.12)' : colors.primarySoft,
                            borderColor: isDark ? 'rgba(255, 104, 19, 0.25)' : colors.primaryBorder,
                        },
                    ]}
                >
                    <Text style={[styles.themeBadgeText, { color: isDark ? colors.primaryLight : colors.primary }]}>
                        {currentThemeLabel}
                    </Text>
                </View>
            ),
        },
        {
            icon: <Headphone size={moderateScale(18)} color={colors.primary} variant="Linear" />,
            title: 'Support',
            subtitle: 'Get help with app issues',
            onPress: () => router.push('/support'),
        },
        {
            icon: <Judge size={moderateScale(18)} color={colors.primary} variant="Linear" />,
            title: 'Legals',
            subtitle: 'View terms, policies and compliance',
            onPress: () => router.push('https://www.sohcahtoapayoutbdc.com/terms-of-use-customer'),
        },
        {
            icon: <Bookmark size={moderateScale(18)} color={colors.primary} variant="Linear" />,
            title: 'Payment history',
            subtitle: 'View and manege your payment history',
            onPress: () => router.push('/(more)/transient-history'),
        },
        {
            icon: <MessageQuestion size={moderateScale(18)} color={colors.primary} variant="Linear" />,
            title: 'FAQs',
            subtitle: 'Get quick app answers about App',
            onPress: () => router.push('/faqs'),
        },
        {
            icon: <LogoutCurve size={moderateScale(18)} color={colors.primary} variant="Linear" />,
            title: 'Log Out',
            subtitle: 'Log out of your account',
            isLogout: true,
            onPress: () => setLogoutModalVisible(true),
        },
    ];

    return (
        <AnimatedTabScreen style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
            <Header
                title="More"
                rightIcon={
                    <TouchableOpacity onPress={() => router.push('/notifications')}>
                        <Notification size={moderateScale(24)} color={colors.icon} variant="Linear" />
                        {unreadCount > 0 && (
                            <View style={[styles.unreadBadge, { borderColor: colors.surface }]}>
                                <Text style={styles.unreadText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                }
                onRightPress={() => router.push('/notifications')}
            />
            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
                {menuItems.map((item, index) => (
                    <Pressable
                        key={index}
                        style={({ pressed }) => [
                            styles.menuItem,
                            { borderBottomColor: colors.divider },
                            pressed && styles.menuItemPressed,
                        ]}
                        onPress={item.onPress}
                    >
                        <View
                            style={[
                                styles.iconContainer,
                                {
                                    backgroundColor: isDark
                                        ? 'rgba(255, 255, 255, 0.05)'
                                        : colors.primarySoft,
                                    borderColor: isDark
                                        ? 'rgba(255, 255, 255, 0.08)'
                                        : 'transparent',
                                    borderWidth: isDark ? 1 : 0,
                                },
                            ]}
                        >
                            {item.icon}
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text>
                            <Text style={[styles.itemSubtitle, { color: colors.textMuted }]}>
                                {item.subtitle}
                            </Text>
                        </View>
                        {item.rightElement}
                    </Pressable>
                ))}

                <Text style={[styles.versionText, { color: colors.textMuted }]}>App Version 1.0</Text>
            </ScrollView>

            <ThemeSelectionSheet
                visible={themeSheetVisible}
                onClose={() => setThemeSheetVisible(false)}
            />

            <Modal
                transparent
                visible={logoutModalVisible}
                animationType="fade"
                onRequestClose={() => setLogoutModalVisible(false)}
            >
                <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
                    <TouchableOpacity
                        style={[StyleSheet.absoluteFill, { backgroundColor: 'transparent' }]}
                        onPress={() => setLogoutModalVisible(false)}
                        activeOpacity={1}
                    />
                    <Animated.View
                        entering={FadeInDown.duration(200).springify().damping(24).stiffness(280)}
                        style={styles.modalWrapper}
                    >
                        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                            <View style={[styles.warningIconContainer, { backgroundColor: colors.primarySoft }]}>
                                <InfoCircle size={moderateScale(24)} color={colors.primary} variant="Bold" />
                            </View>

                            <Text style={[styles.modalTitle, { color: colors.text }]}>Log Out</Text>
                            <Text style={[styles.modalMessage, { color: colors.textMuted }]}>
                                Are you sure you want to log out?
                            </Text>

                            <PrimaryButton
                                title="Yes, Log out"
                                loading={isPending}
                                onPress={() => {
                                    logout(undefined, {
                                        onSuccess: () => {
                                            setLogoutModalVisible(false);
                                            router.replace('/(auth)/login');
                                        },
                                        onError: () => {
                                            setLogoutModalVisible(false);
                                        },
                                    });
                                }}
                                style={{ marginBottom: moderateScale(12) }}
                            />

                            <PrimaryButton
                                title="No, Cancel"
                                onPress={() => setLogoutModalVisible(false)}
                                style={{ backgroundColor: colors.buttonSecondaryBackground }}
                                textStyle={{ color: colors.buttonSecondaryText }}
                            />
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        </AnimatedTabScreen>
    );
}

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingTop: '40@vs',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: '14@s',
        paddingVertical: '16@vs',
        gap: '6@vs',
    },
    themeBadge: {
        paddingHorizontal: '10@s',
        paddingVertical: '4@vs',
        borderRadius: '12@ms',
        borderWidth: 1,
    },
    themeBadgeText: {
        fontSize: '11@ms',
        fontWeight: '600',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: '16@ms',
        paddingVertical: '8@vs',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(243, 244, 246, 1)',
        paddingBottom: '6@vs',
    },
    menuItemPressed: {
        opacity: 0.7,
    },
    iconContainer: {
        width: '40@ms',
        height: '40@ms',
        borderRadius: '24@ms',
        backgroundColor: '#FFF5F1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
        gap: '4@vs',
    },
    itemTitle: {
        fontSize: '13@ms',
        fontWeight: '600',
        color: '#0F172A',
    },
    itemSubtitle: {
        fontSize: '12@ms',
        color: 'rgba(143, 139, 139, 1)',
    },
    versionText: {
        textAlign: 'center',
        marginTop: '20@vs',
        color: '#94A3B8',
        fontSize: '13@ms',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20@ms',
    },
    modalWrapper: {
        width: '100%',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: '24@ms',
        padding: '24@ms',
        width: '100%',
        alignItems: 'center',
    },
    warningIconContainer: {
        width: '48@ms',
        height: '48@ms',
        borderRadius: '24@ms',
        backgroundColor: '#FFF5F1',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '16@vs',
        alignSelf: 'flex-start',
    },
    modalTitle: {
        fontSize: '20@ms',
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: '8@vs',
        alignSelf: 'flex-start',
    },
    modalMessage: {
        fontSize: '16@ms',
        color: '#64748B',
        textAlign: 'left',
        marginBottom: '32@vs',
        alignSelf: 'flex-start',
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
