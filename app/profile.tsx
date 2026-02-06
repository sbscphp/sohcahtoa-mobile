import Header from '@/components/Header';
import { ArrowDown2, Edit, Edit2 } from 'iconsax-react-nativejs';
import { SquarePen } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, ScaledSheet } from 'react-native-size-matters';

export default function MyProfileScreen() {
    const insets = useSafeAreaInsets();
    const userImage = require('@/assets/images/user-img-1.jpg');
    const [expanded, setExpanded] = useState(true);

    const basicDetails = [
        { label: 'Full name', value: 'Emmanuel Isreal' },
        { label: 'Gender', value: 'Male' },
        { label: 'Date of Birth', value: 'April 27 2005' },
        { label: 'BVN', value: '46**************333' },
        { label: 'NIN', value: '48**************555' },
        { label: 'Phone Number', value: '+234 90 4747 2791' },
        { label: 'Email Address', value: 'olamidesoc@gmail.com' },
        { label: 'Date Joined', value: 'December 1, 2025' },
        { label: 'Last Active', value: 'Dec 9, 2025 ; 11:00 am' },
    ];

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Header title="My Profile" />
            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>

                <View style={styles.profileCard}>
                    <View style={styles.profileHeader}>
                        <View style={styles.avatarContainer}>
                            <Image source={userImage} style={styles.avatar} />
                            <View style={styles.editIconOverlay}>
                                <SquarePen size={moderateScale(18)} color="#FFFFFF" />
                            </View>
                        </View>
                        <View style={styles.nameContainer}>
                            <Text style={styles.profileName}>Emmanuel Isreal</Text>
                            <Text style={styles.profileHandle}>Display Name</Text>
                        </View>
                        <TouchableOpacity style={styles.editBtn}>
                            <Edit2 size={moderateScale(18)} color="#FF8A65" variant="Linear" />
                        </TouchableOpacity>
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
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: '28@ms',
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
