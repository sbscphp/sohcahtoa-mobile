import FileUpload from '@/components/FileUpload';
import Header from '@/components/Header';
import PrimaryButton from '@/components/PrimaryButton';
import { useRouter } from 'expo-router';
import { Calendar, Clock, Import, SearchStatus, TickCircle } from 'iconsax-react-nativejs';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';

export default function ViewPtaScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'docs'>('overview');

    // State management: 'pending' | 'approved' | 'query' | 'rejected'
    // Defaulting to 'pending' to show the requested design implementation first
    const [status, setStatus] = useState<'pending' | 'approved' | 'query' | 'rejected'>('pending');

    const handleBack = () => {
        router.back();
    };

    const handleProceed = () => {
        // TODO: Navigate to payment
        console.log("Proceed to Payment");
    };

    // Temporary helper to toggle state for review purposes
    const toggleState = () => {
        if (status === 'pending') setStatus('approved');
        else if (status === 'approved') setStatus('query');
        else if (status === 'query') setStatus('rejected');
        else setStatus('pending');
    };

    const renderOverview = () => (
        <View style={styles.tabContent}>
            {status === 'pending' ? (
                <View style={styles.pendingContainer}>
                    <View style={styles.pendingIconContainer}>
                        <SearchStatus size={moderateScale(80)} color="#E2E8F0" variant="Bulk" />
                    </View>
                    <Text style={styles.pendingTitle}>Application is Under Review</Text>
                    <Text style={styles.pendingDesc}>
                        Your document is currently undergoing approval. You will receive a mail notification once your documents is approved.
                    </Text>
                </View>
            ) : status === 'approved' ? (
                <>
                    {/* Status Card */}
                    <View style={styles.statusCard}>
                        <View style={styles.statusHeader}>
                            <Text style={styles.statusTitle}>Request Approved</Text>
                            <Text style={styles.statusId}>ID:8833</Text>
                        </View>
                        <View style={styles.statusMetaRow}>
                            <View style={styles.metaItem}>
                                <Calendar size={moderateScale(14)} color="#16A34A" variant="Bold" />
                                <Text style={styles.metaText}>16 Nov 2025</Text>
                            </View>
                            <View style={styles.metaItem}>
                                <Clock size={moderateScale(14)} color="#16A34A" variant="Bold" />
                                <Text style={styles.metaText}>11:00 am</Text>
                            </View>
                        </View>

                        <View style={styles.messageBox}>
                            <Text style={styles.messageText}>
                                This is a message box that show the message from the SohCahToa Admin regarding the approval ofthis client transaction request. As this is approved, this customer would then be able to take an action from this point
                            </Text>
                        </View>
                    </View>

                    <View style={styles.txStatusContainer}>
                        <Text style={styles.txStatusLabel}>Transaction Status</Text>
                        <View style={styles.txStatusBadge}>
                            <Text style={styles.txStatusText}>Approved</Text>
                        </View>
                    </View>
                </>
            ) : (
                <View style={{ alignItems: 'center', padding: 20 }}>
                    <Text>State: {status} (Design Pending)</Text>
                </View>
            )}
        </View>
    );

    const renderDetails = () => (
        <View style={styles.tabContent}>
            <Text style={styles.sectionHeader}>Transaction Details</Text>

            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Transaction ID</Text>
                <Text style={styles.detailValue}>674AGHA6773</Text>
            </View>
            <View style={styles.separator} />

            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Amount (₦)</Text>
                <Text style={styles.detailValue}>₦ 1,5000,000</Text>
            </View>
            <View style={styles.separator} />

            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Equivalent Amount (FX)</Text>
                <Text style={styles.detailValue}>$1,000</Text>
            </View>
            <View style={styles.separator} />

            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date Initiated</Text>
                <Text style={styles.detailValue}>Dec 8 2025</Text>
            </View>
            <View style={styles.separator} />

            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Pickup Address</Text>
                <Text style={[styles.detailValue, { flex: 1, textAlign: 'right' }]} numberOfLines={2}>3, Adeola Odeku, VI, Lagos</Text>
            </View>

            <Text style={[styles.sectionHeader, { marginTop: moderateScale(32) }]}>Required Document</Text>

            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>BVN Number</Text>
                <Text style={styles.detailValue}>744 ********* 373</Text>
            </View>
            <View style={styles.separator} />

            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>TIN</Text>
                <Text style={styles.detailValue}>673***********344</Text>
            </View>
            <View style={styles.separator} />

            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Form A ID</Text>
                <Text style={styles.detailValue}>47743GA</Text>
            </View>
            <View style={styles.separator} />

            <View style={styles.docRow}>
                <Text style={styles.detailLabel}>Form A Document</Text>
                <View style={styles.downloadContainer}>
                    <Text style={styles.docName}>form-a-doc.pdf</Text>
                    <Import size={moderateScale(16)} color="#64748B" variant="Linear" />
                </View>
            </View>
            <View style={styles.separator} />

            <View style={styles.docRow}>
                <Text style={styles.detailLabel}>Visa</Text>
                <View style={styles.downloadContainer}>
                    <Text style={styles.docName}>my-visa.pdf</Text>
                    <Import size={moderateScale(16)} color="#64748B" variant="Linear" />
                </View>
            </View>
            <View style={styles.separator} />

            <View style={styles.docRow}>
                <Text style={styles.detailLabel}>Return Ticket</Text>
                <View style={styles.downloadContainer}>
                    <Text style={styles.docName}>my-return-ticket.pdf</Text>
                    <Import size={moderateScale(16)} color="#64748B" variant="Linear" />
                </View>
            </View>
        </View>
    );

    const renderDocs = () => (
        <View style={styles.tabContent}>

            {/* Form A */}
            <View style={styles.docCardContainer}>
                <View style={styles.docHeaderRow}>
                    <Text style={styles.docTitle}>Form A <Text style={styles.required}>*</Text></Text>
                </View>
                <FileUpload
                    onUpload={() => console.log('Change Form A')}
                    fileName="form-a-doc.pdf"
                    title="Upload Form A"
                />
                <View style={[styles.docStatusRow, { marginTop: 0 }]}>
                    <TickCircle size={moderateScale(16)} color={status === 'approved' ? "#16A34A" : "#FF6813"} variant="Bold" />
                    <Text style={status === 'approved' ? styles.docStatusTextApproved : styles.docStatusTextPending}>
                        {status === 'approved' ? 'Approved' : 'Under Review'}
                    </Text>
                </View>
            </View>

           
            <View style={styles.docCardContainer}>
                <View style={styles.docHeaderRow}>
                    <Text style={styles.docTitle}>International Passport <Text style={styles.required}>*</Text></Text>
                </View>
                <FileUpload
                    onUpload={() => console.log('Change Passport')}
                    fileName="my-passport.jpg"
                    title="Upload Passport"
                />
                <View style={[styles.docStatusRow, { marginTop: 0 }]}>
                    <TickCircle size={moderateScale(16)} color={status === 'approved' ? "#16A34A" : "#FF6813"} variant="Bold" />
                    <Text style={status === 'approved' ? styles.docStatusTextApproved : styles.docStatusTextPending}>
                        {status === 'approved' ? 'Approved' : 'Under Review'}
                    </Text>
                </View>
            </View>

           
            <View style={styles.docCardContainer}>
                <View style={styles.docHeaderRow}>
                    <Text style={styles.docTitle}>Valid Visa <Text style={styles.required}>*</Text></Text>
                </View>
                <FileUpload
                    onUpload={() => console.log('Change Visa')}
                    fileName="my-visa.pdf"
                    title="Upload Visa"
                />
                <View style={[styles.docStatusRow, { marginTop: 0 }]}>
                    <TickCircle size={moderateScale(16)} color={status === 'approved' ? "#16A34A" : "#FF6813"} variant="Bold" />
                    <Text style={status === 'approved' ? styles.docStatusTextApproved : styles.docStatusTextPending}>
                        {status === 'approved' ? 'Approved' : 'Under Review'}
                    </Text>
                </View>
            </View>

        </View>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Header title="Transaction" onBackPress={handleBack} />
            <View style={styles.tabBar}>
                <TouchableOpacity
                    style={[styles.tabItem, activeTab === 'overview' && styles.activeTabItem]}
                    onPress={() => setActiveTab('overview')}
                >
                    <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>Overview</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabItem, activeTab === 'details' && styles.activeTabItem]}
                    onPress={() => setActiveTab('details')}
                >
                    <Text style={[styles.tabText, activeTab === 'details' && styles.activeTabText]}>Transaction Details</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabItem, activeTab === 'docs' && styles.activeTabItem]}
                    onPress={() => setActiveTab('docs')}
                >
                    <Text style={[styles.tabText, activeTab === 'docs' && styles.activeTabText]}>Documentation</Text>
                </TouchableOpacity>
                {/* <TouchableOpacity onPress={toggleState} style={{ marginLeft: 'auto', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 10, color: '#ccc' }}>DEV: {status}</Text>
                </TouchableOpacity> */}
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'details' && renderDetails()}
                {activeTab === 'docs' && renderDocs()}
            </ScrollView>

            {status === 'approved' && (
                <View style={[styles.footer, { paddingBottom: insets.bottom + moderateScale(10) }]}>
                    <PrimaryButton title="Proceed to Payment" onPress={handleProceed} />
                </View>
            )}
        </View>
    );
}

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    tabBar: {
        flexDirection: 'row',
        paddingHorizontal: '16@s',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    tabItem: {
        marginRight: '30@s',
        paddingVertical: '9@vs',
    },
    activeTabItem: {
        borderBottomWidth: 2,
        borderBottomColor: '#FF6813',
    },
    tabText: {
        fontSize: '13@ms',
        color: '#64748B',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#FF6813',
        fontWeight: '600',
    },
    scrollContent: {
        paddingHorizontal: '20@s',
        paddingVertical: '20@vs',
        paddingBottom: '100@vs',
    },
    tabContent: {
        gap: '16@vs',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: '20@s',
        paddingTop: '10@vs',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },

    // Overview Styles
    statusCard: {
        backgroundColor: '#DCFCE7', // Light green
        borderRadius: '16@ms',
        padding: '16@ms',
        gap: '12@vs',
    },
    statusHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusTitle: {
        fontSize: '16@ms',
        fontWeight: '600',
        color: '#14532D',
    },
    statusId: {
        fontSize: '12@ms',
        color: '#15803D',
    },
    statusMetaRow: {
        flexDirection: 'row',
        gap: '16@s',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: '4@s',
    },
    metaText: {
        fontSize: '12@ms',
        color: '#15803D',
    },
    messageBox: {
        backgroundColor: '#FFFFFF',
        borderRadius: '8@ms',
        padding: '12@ms',
    },
    messageText: {
        fontSize: '12@ms',
        color: '#334155',
        lineHeight: '18@ms',
    },
    txStatusContainer: {
        backgroundColor: '#F8FAFC',
        borderRadius: '16@ms',
        padding: '16@ms',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    txStatusLabel: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#0F172A',
    },
    txStatusBadge: {
        backgroundColor: '#E2E8F0', 
        paddingHorizontal: '10@s',
        paddingVertical: '4@vs',
        borderRadius: '12@ms',
    },
    txStatusText: {
        fontSize: '12@ms',
        color: '#475569',
        fontWeight: '500',
    },

    // Details Styles
    sectionHeader: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: '6@vs',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        // paddingVertical: '0@vs',
    },
    docRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        // paddingVertical: '0@vs',
    },
    detailLabel: {
        fontSize: '14@ms',
        color: 'rgba(77, 75, 75, 1)',
        fontWeight: '400',
    },
    detailValue: {
        fontSize: '13@ms',
        color: 'rgba(108, 105, 105, 1)',
        fontWeight: '300',
    },
    separator: {
        height: 0.5,
        backgroundColor: 'rgba(204, 202, 202, 1)',
    },
    downloadContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: '8@s',
    },
    docName: {
        fontSize: '14@ms',
        color: '#64748B',
    },

    docCardContainer: {
        marginTop: '6@vs',
    },
    docHeaderRow: {
        flexDirection: 'row',
        marginBottom: '8@vs',
    },
    docTitle: {
        fontSize: '14@ms',
        color: '#475569',
    },
    required: {
        color: '#EF4444',
    },
    docStatusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: '6@s',
        marginTop: '8@vs',
    },
    docStatusTextApproved: {
        fontSize: '12@ms',
        color: '#16A34A',
        fontWeight: '500',
    },
    docStatusTextPending: {
        fontSize: '12@ms',
        color: '#FF6813',
        fontWeight: '500',
    },

    pendingContainer: {
        alignItems: 'center',
        paddingVertical: '40@vs',
        paddingHorizontal: '20@s',
    },
    pendingIconContainer: {
        marginBottom: '24@vs',
    },
    pendingTitle: {
        fontSize: '18@ms',
        fontWeight: '600',
        color: '#334155',
        marginBottom: '12@vs',
        textAlign: 'center',
    },
    pendingDesc: {
        fontSize: '14@ms',
        color: '#64748B',
        textAlign: 'center',
        lineHeight: '22@ms',
    },
});
