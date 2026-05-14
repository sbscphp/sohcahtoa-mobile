import Header from '@/components/Header';
import PrimaryButton from '@/components/PrimaryButton';
import { useDocumentUpload } from '@/hooks/useDocumentUpload';
import { useToastStore } from '@/stores/useToastStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Trash } from 'iconsax-react-nativejs';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import FilePlus from '@/assets/icons/elements.svg';

interface UploadSlot {
    id: string;
    label: string;
    file: any | null;
    metadata: any | null;
}

export default function ProofOfFundScreen() {
    const router = useRouter();
    const showToast = useToastStore(s => s.showToast);
    
    const [slots, setSlots] = useState<UploadSlot[]>([
        { id: '1', label: 'Proof of fund', file: null, metadata: null },
        { id: '2', label: 'Proof of fund', file: null, metadata: null },
        { id: '3', label: 'Proof of fund', file: null, metadata: null },
    ]);

    const { upload, isPending } = useDocumentUpload({
        onSuccess: (type, { file, metadata }) => {
            const slotIndex = parseInt(type);
            setSlots(prev => prev.map((slot, idx) => 
                idx === slotIndex ? { ...slot, file, metadata } : slot
            ));
        },
        onError: () => showToast('Failed to upload document', 'error'),
    });

    const handleUpload = (index: number) => {
        upload(index.toString() as any);
    };

    const handleDelete = (index: number) => {
        setSlots(prev => prev.map((slot, idx) => 
            idx === index ? { ...slot, file: null, metadata: null } : slot
        ));
    };

    const handleAttach = () => {
        const uploadedCount = slots.filter(s => s.file).length;
        if (uploadedCount === 0) {
            showToast('Please upload at least one document', 'warning');
            return;
        }
        showToast('Documents attached successfully', 'success');
        router.back();
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <Header title="Proof of fund" />
            
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Upload Proof of Fund Document</Text>
                
                {slots.map((slot, index) => (
                    <View key={slot.id} style={styles.slotContainer}>
                        <Text style={styles.label}>
                            {slot.label} <Text style={{ color: '#D92D20' }}>*</Text>
                        </Text>
                        
                        {!slot.file ? (
                            <TouchableOpacity 
                                style={styles.uploadBox} 
                                onPress={() => handleUpload(index)}
                                disabled={isPending}
                            >
                                <FilePlus width={moderateScale(20)} height={moderateScale(20)} />
                                <Text style={styles.placeholder}>Click to upload</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.fileBox}>
                                <View style={styles.fileInfo}>
                                    <View style={styles.iconCircle}>
                                        <Ionicons name="document-text-outline" size={moderateScale(20)} color="#64748B" />
                                    </View>
                                    <View style={{ flex: 1, marginLeft: moderateScale(12) }}>
                                        <Text style={styles.fileName} numberOfLines={1}>{slot.file.name}</Text>
                                        <Text style={styles.fileSize}>200 KB – 100% uploaded</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => handleDelete(index)}>
                                        <Trash size={moderateScale(20)} color="#D92D20" variant="Outline" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>
                ))}
            </ScrollView>

            <View style={styles.footer}>
                <PrimaryButton 
                    title="Attach Document" 
                    onPress={handleAttach} 
                    disabled={slots.every(s => !s.file)}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        padding: '20@ms',
    },
    title: {
        fontSize: '18@ms',
        fontWeight: '700',
        color: '#101828',
        marginBottom: '24@vs',
    },
    slotContainer: {
        marginBottom: '20@vs',
    },
    label: {
        fontSize: '14@ms',
        fontWeight: '500',
        color: '#344054',
        marginBottom: '8@vs',
    },
    uploadBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#D0D5DD',
        borderRadius: '30@ms',
        paddingVertical: '12@vs',
        paddingHorizontal: '16@s',
        height: '46@vs',
    },
    placeholder: {
        fontSize: '16@ms',
        color: '#98A2B3',
        marginLeft: '12@s',
    },
    fileBox: {
        borderWidth: 1,
        borderColor: '#D0D5DD',
        borderRadius: '30@ms',
        paddingVertical: '12@vs',
        paddingHorizontal: '16@s',
        height: '46@vs',
        justifyContent: 'center',
    },
    fileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconCircle: {
        width: '32@ms',
        height: '32@ms',
        borderRadius: '16@ms',
        backgroundColor: '#F9FAFB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fileName: {
        fontSize: '14@ms',
        fontWeight: '500',
        color: '#344054',
    },
    fileSize: {
        fontSize: '12@ms',
        color: '#667085',
    },
    footer: {
        padding: '20@ms',
        paddingBottom: '30@vs',
    },
});
