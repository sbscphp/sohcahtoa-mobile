import Header from '@/components/Header';
import PrimaryButton from '@/components/PrimaryButton';
import LoadingBackdrop from '@/components/LoadingBackdrop';
import { useDocumentUpload } from '@/hooks/useDocumentUpload';
import { useToastStore } from '@/stores/useToastStore';
import { useDeclarationStore } from '@/stores/useDeclarationStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Trash } from 'iconsax-react-nativejs';
import React, { useState, useRef } from 'react';
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
    
    const initialProofOfFunds = useDeclarationStore.getState().proofOfFunds;
    const [slots, setSlots] = useState<UploadSlot[]>(() => {
        if (initialProofOfFunds.length > 0) {
            return initialProofOfFunds.map((item, idx) => ({
                id: idx.toString(),
                label: 'Proof of fund',
                file: item.file,
                metadata: item.metadata,
            }));
        }
        return [{ id: '1', label: 'Proof of fund', file: null, metadata: null }];
    });

    const addSlot = () => {
        const newId = Date.now().toString();
        setSlots(prev => [...prev, { id: newId, label: 'Proof of fund', file: null, metadata: null }]);
    };

    const uploadingIndexRef = useRef<number | null>(null);

    const { upload, isPending } = useDocumentUpload({
        onSuccess: (type, { file, metadata }) => {
            const activeIndex = uploadingIndexRef.current;
            if (activeIndex !== null) {
                setSlots(prev => prev.map((slot, idx) => 
                    idx === activeIndex ? { ...slot, file, metadata } : slot
                ));
                uploadingIndexRef.current = null;
            }
        },
        onError: () => {
            showToast('Failed to upload document', 'error');
            uploadingIndexRef.current = null;
        },
    });

    const handleUpload = (index: number) => {
        uploadingIndexRef.current = index;
        upload('PROOF_OF_FUNDS');
    };

    const handleDelete = (index: number) => {
        if (slots.length > 1) {
            setSlots(prev => prev.filter((_, idx) => idx !== index));
        } else {
            setSlots(prev => prev.map((slot, idx) => 
                idx === index ? { ...slot, file: null, metadata: null } : slot
            ));
        }
    };

    const handleAttach = () => {
        const uploadedSlots = slots.filter(s => s.file);
        if (uploadedSlots.length === 0) {
            showToast('Please upload at least one document', 'warning');
            return;
        }
        const attached = uploadedSlots.map(s => ({ file: s.file!, metadata: s.metadata! }));
        useDeclarationStore.getState().setProofOfFunds(attached);
        showToast('Documents attached successfully', 'success');
        router.back();
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <LoadingBackdrop visible={isPending} />
            <Header title="Proof of fund" />
            
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Upload Proof of Fund Document</Text>
                
                {slots.map((slot, index) => (
                    <View key={slot.id} style={styles.slotContainer}>
                        <Text style={styles.label}>
                            {slot.label} <Text style={{ color: '#D92D20' }}>*</Text>
                        </Text>
                        
                        {!slot.file ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: moderateScale(12) }}>
                                <TouchableOpacity 
                                    style={[styles.uploadBox, { flex: 1 }]} 
                                    onPress={() => handleUpload(index)}
                                    disabled={isPending}
                                >
                                    <FilePlus width={moderateScale(20)} height={moderateScale(20)} />
                                    <Text style={styles.placeholder}>Click to upload</Text>
                                </TouchableOpacity>
                                {slots.length > 1 && (
                                    <TouchableOpacity onPress={() => handleDelete(index)}>
                                        <Trash size={moderateScale(20)} color="#D92D20" variant="Outline" />
                                    </TouchableOpacity>
                                )}
                            </View>
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

                <TouchableOpacity style={styles.addMoreButton} onPress={addSlot}>
                    <Ionicons name="add-circle-outline" size={moderateScale(20)} color="#FF6813" />
                    <Text style={styles.addMoreText}>Add more input</Text>
                </TouchableOpacity>
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
    addMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: '#FF6813',
        borderStyle: 'dashed',
        borderRadius: '30@ms',
        paddingVertical: '12@vs',
        marginVertical: '10@vs',
        backgroundColor: '#FFF7ED',
    },
    addMoreText: {
        fontSize: '15@ms',
        color: '#FF6813',
        fontWeight: '600',
        marginLeft: '6@s',
    },
});
