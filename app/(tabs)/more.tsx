import Header from '@/components/Header';
import PrimaryButton from '@/components/PrimaryButton';
import { Cards, Headphone, InfoCircle, Judge, LogoutCurve, MessageQuestion, Notification, ProfileTick, ShieldSecurity } from 'iconsax-react-nativejs';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { moderateScale, ScaledSheet } from 'react-native-size-matters';

interface MenuItem {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    onPress?: () => void;
    isLogout?: boolean;
}

import { useRouter } from 'expo-router';

export default function MoreScreen() {
    const router = useRouter();
    const [logoutModalVisible, setLogoutModalVisible] = useState(false);

    const menuItems: MenuItem[] = [
        {
            icon: <ProfileTick size={moderateScale(18)} color="rgba(255, 104, 19, 1)" variant="Linear" />,
            title: 'My Profile',
            subtitle: 'Manage your profile and account details',
            onPress: () => router.push('/profile'),
        },
        {
            icon: <ShieldSecurity size={moderateScale(18)} color="rgba(255, 104, 19, 1)" variant="Linear" />,
            title: 'Security',
            subtitle: 'Update password, keep your account secure.',
        },
        {
            icon: <Cards size={moderateScale(18)} color="rgba(255, 104, 19, 1)" variant="Linear" />,
            title: 'Manage Cards',
            subtitle: 'Update or remove your payment cards',
        },
        {
            icon: <Headphone size={moderateScale(18)} color="rgba(255, 104, 19, 1)" variant="Linear" />,
            title: 'Support',
            subtitle: 'Get help with app issues',
            onPress: () => router.push('/support'),
        },
        {
            icon: <Judge size={moderateScale(18)} color="rgba(255, 104, 19, 1)" variant="Linear" />,
            title: 'Legals',
            subtitle: 'View terms, policies and compliance',
        },
        {
            icon: <MessageQuestion size={moderateScale(18)} color="rgba(255, 104, 19, 1)" variant="Linear" />,
            title: 'FAQs',
            subtitle: 'Get quick app answers about App',
            onPress: () => router.push('/faqs'),
        },
        {
            icon: <LogoutCurve size={moderateScale(18)} color="rgba(255, 104, 19, 1)" variant="Linear" />,
            title: 'Log Out',
            subtitle: 'Log out of your account',
            isLogout: true,
            onPress: () => setLogoutModalVisible(true),
        },
    ];

    return (
        <View style={styles.container}>
            <Header title="More" rightIcon={<Notification size={moderateScale(28)} color="rgba(143, 139, 139, 1)" variant="Linear" />} />

            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
                {menuItems.map((item, index) => (
                    <Pressable
                        key={index}
                        style={({ pressed }) => [
                            styles.menuItem,
                            pressed && styles.menuItemPressed
                        ]}
                        onPress={item.onPress}
                    >
                        <View style={styles.iconContainer}>
                            {item.icon}
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.itemTitle}>{item.title}</Text>
                            <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                        </View>
                    </Pressable>
                ))}

                <Text style={styles.versionText}>App Version 1.0</Text>
            </ScrollView>

            <Modal
                transparent
                visible={logoutModalVisible}
                animationType="fade"
                onRequestClose={() => setLogoutModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.warningIconContainer}>
                            <InfoCircle size={moderateScale(24)} color="rgba(255, 104, 19, 1)" variant="Bold" />
                        </View>

                        <Text style={styles.modalTitle}>Log Out</Text>
                        <Text style={styles.modalMessage}>Are you sure you want to log out?</Text>

                        <PrimaryButton
                            title="Yes, Log out"
                            onPress={() => {
                                // Perform logout logic here
                                setLogoutModalVisible(false);
                            }}
                            style={{ marginBottom: moderateScale(12) }}
                        />

                        <PrimaryButton
                            title="No, Cancel"
                            onPress={() => setLogoutModalVisible(false)}
                            style={{ backgroundColor: '#F1F5F9' }}
                            textStyle={{ color: '#0F172A' }}
                        />
                    </View>
                </View>
            </Modal>
        </View>
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
        padding: '20@ms',
        gap: '6@vs',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: '16@ms',
        paddingVertical: '8@vs',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(243, 244, 246, 1)',
        paddingBottom: '6@vs'
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
        alignSelf: 'flex-start'
    },
    warningIcon: {
        fontSize: '24@ms',
        color: '#F97316',
        fontWeight: 'bold',
    },
    modalTitle: {
        fontSize: '20@ms',
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: '8@vs',
        alignSelf: 'flex-start'
    },
    modalMessage: {
        fontSize: '16@ms',
        color: '#64748B',
        textAlign: 'left',
        marginBottom: '32@vs',
        alignSelf: 'flex-start'
    },
});
