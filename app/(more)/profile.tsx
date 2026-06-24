import Header from '@/components/Header';
import { useAuthStore } from '@/stores/useAuthStore';
import { ArrowDown2, Edit2 } from 'iconsax-react-nativejs';
import { SquarePen } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';

export default function MyProfileScreen() {
    const insets = useSafeAreaInsets();
    const user = useAuthStore((state) => state.user);
    const initials = user?.profile
        ? `${user.profile.firstName?.charAt(0) ?? ''}${user.profile.lastName?.charAt(0) ?? ''}`.toUpperCase() || '?'
        : '?';
    const [expanded, setExpanded] = useState(true);

    // console.log('User:', JSON.stringify(user, null, 2));

    const basicDetails = [
        { label: 'Full name', value: user?.profile ? `${user.profile.firstName} ${user.profile.lastName}` : 'N/A' },
        { label: 'Date of Birth', value: user?.profile?.dateOfBirth ? new Date(user.profile.dateOfBirth).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A' },
        { label: 'BVN', value: user?.kyc?.bvn || 'N/A' },
        { label: 'TIN', value: user?.kyc?.tin || user?.kyc?.tinNumber || 'N/A' },
        { label: 'Phone Number', value: user?.phoneNumber || 'N/A' },
        { label: 'Email Address', value: user?.email || 'N/A' },
        { label: 'Date Joined', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A' },
        { label: 'Last Active', value: user?.activeSessions?.length ? (() => { const lastSession = user.activeSessions[user.activeSessions.length - 1]; const d = new Date(lastSession.createdAt); const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase(); return `${date} ; ${time}`; })() : 'N/A' },
    ];

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Header title="My Profile" />
            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>

                <View style={styles.profileCard}>
                    <View style={styles.profileHeader}>
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatarCircle}>
                                <Text style={styles.avatarInitials}>{initials}</Text>
                            </View>
                        </View>
                        <View style={styles.nameContainer}>
                            <Text style={styles.profileName}>{user?.profile ? `${user.profile.firstName} ${user.profile.lastName}` : 'User'}</Text>
                            <Text style={styles.profileHandle}>{user?.role}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.detailsCard}>
                    <TouchableOpacity
                        style={styles.detailsHeader}
                        onPress={() => setExpanded(!expanded)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.detailsTitle}>Basic Details</Text>
                        <ArrowDown2
                            size={moderateScale(20)}
                            color="#292D32"
                            variant="Linear"
                        />
                    </TouchableOpacity>

                    {expanded && (
                        <View style={styles.detailsList}>
                            {basicDetails.map((item, index) => (
                                <View key={index} style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>{item.label}</Text>
                                    <Text style={styles.detailValue}>{item.value}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

            </ScrollView>
        </View>
    );
}

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    scrollContent: {
        padding: '20@ms',
        gap: '20@vs',
    },
    profileCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: '16@ms',
        padding: '10@ms',
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: '12@ms',
    },
    avatarContainer: {
        width: '56@ms',
        height: '56@ms',
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarCircle: {
        width: '100%',
        height: '100%',
        borderRadius: '28@ms',
        backgroundColor: '#6b6b6bff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitials: {
        fontSize: '20@ms',
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 1,
    },
    editIconOverlay: {
        position: 'absolute',
        width: '20@ms',
        height: '20@ms',
        borderRadius: '10@ms',
        justifyContent: 'center',
        alignItems: 'center',
        top: '18@ms',
        left: '18@ms',
    },
    nameContainer: {
        flex: 1,
    },
    profileName: {
        fontSize: '16@ms',
        fontWeight: '700',
        color: '#0F172A',
    },
    profileHandle: {
        fontSize: '13@ms',
        color: '#64748B',
        marginTop: '5@ms',
    },
    editBtn: {
        width: '32@ms',
        height: '32@ms',
        borderRadius: '16@ms',
        backgroundColor: '#FFF5F1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailsCard: {
        backgroundColor: 'rgba(241, 241, 241, 1)',
        borderRadius: '16@ms',
        padding: '16@ms',
    },
    detailsHeader: {
        marginBottom: '16@vs',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailsTitle: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#0F172A',
    },
    detailsList: {
        gap: '20@vs',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: '14@ms',
        color: 'rgba(50, 49, 49, 1)',
        fontWeight: '500',
        flex: 1,
    },
    detailValue: {
        fontSize: '13@ms',
        color: 'rgba(77, 75, 75, 1)',
        textAlign: 'right',
        flex: 1.5,
    },
});
