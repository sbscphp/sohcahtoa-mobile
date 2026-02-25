import { Ionicons } from '@expo/vector-icons';
import { DocumentUpload, Folder } from 'iconsax-react-nativejs';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';

interface FileUploadProps {
    onUpload: () => void;
    fileName?: string | null;
    title?: string;
    subtitle?: string;
    status?: 'default' | 'approved' | 'pending' | 'error';
    error?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
    onUpload,
    fileName,
    title = 'Upload or change here.',
    subtitle = 'PDF, PNG, IMG, JPG Supported. Max. size: 20 MB',
    status = 'default',
    error,
}) => {
    const getContainerBorderColor = () => {
        switch (status) {
            case 'approved': return '#86EFAC';
            case 'error': return '#FCA5A5';
            case 'pending': return '#FDBA74';
            default: return error ? '#EF4444' : '#E2E8F0';
        }
    };

    const getPreviewBorderColor = () => {
        switch (status) {
            case 'approved': return '#86EFAC';
            case 'pending': return '#7c807eff';
            case 'error': return '#FCA5A5';
            default: return '#7c807eff';
        }
    };

    if (!fileName) {
        return (
            <View>
                <TouchableOpacity style={[styles.uploadContainer, { borderColor: getContainerBorderColor() }]} onPress={onUpload}>
                    <View style={styles.uploadTextContainer}>
                        <View style={styles.uploadTitleRow}>
                            <View style={styles.uploadIconContainer}>
                                <DocumentUpload size={moderateScale(20)} color="#64748B" />
                            </View>
                            <View>
                                <Text style={styles.uploadTitle}>{title}</Text>
                                <Text style={styles.uploadSubtitle}>{subtitle}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.browseButton}>
                        <Folder size={moderateScale(16)} color="#0F172A" style={{ gap: 4 }} />
                        <Text style={styles.browseText}>Browse</Text>
                    </View>
                </TouchableOpacity>
                {error && <Text style={styles.errorText}>{error}</Text>}
            </View>
        );
    }

    return (
        <View>
            <View style={[styles.previewContainer, { borderColor: getPreviewBorderColor() }]}>
                <View style={styles.previewImagePlaceholder}>
                    <Ionicons name="document-text-outline" size={moderateScale(48)} color="#898d8bff" />
                    <Text style={styles.fileNameText} numberOfLines={1}>{fileName}</Text>
                </View>

                <TouchableOpacity style={styles.changeButton} onPress={onUpload}>
                    <Text style={styles.changeButtonText}>Change</Text>
                </TouchableOpacity>
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = ScaledSheet.create({
    uploadContainer: {
        backgroundColor: 'rgba(241, 241, 241, 1)',
        borderRadius: '12@ms',
        borderWidth: 3,
        borderColor: 'rgba(228, 228, 231, 1)',
        borderStyle: 'dashed',
        padding: '16@ms',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '12@vs',
        marginBottom: '16@vs'
    },
    uploadIconContainer: {
        width: '40@ms',
        height: '40@ms',
        borderRadius: '24@ms',
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: '12@s',
    },
    uploadTextContainer: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    uploadTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: '4@vs',
    },
    uploadTitle: {
        fontSize: '13@ms',
        fontWeight: '500',
        color: '#0F172A',
        marginBottom: '4@vs',
    },
    uploadSubtitle: {
        fontSize: '12@ms',
        color: '#64748B',
        lineHeight: '18@ms',
        width: '90%',
    },
    browseButton: {
        backgroundColor: '#FFFFFF',
        paddingVertical: '10@vs',
        paddingHorizontal: '18@s',
        borderRadius: '20@ms',
        alignSelf: 'flex-end',
        flexDirection: 'row',
        alignItems: 'center',
        gap:8
    },
    browseText: {
        fontSize: '13@ms',
        fontWeight: '600',
        color: '#0F172A',
    },
    previewContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: '16@ms',
        borderWidth: 2,
        borderColor: '#7c807eff',
        borderStyle: 'dashed',
        height: '120@vs',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
        marginBottom: '16@vs'
    },
    previewImagePlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffffff',
        paddingHorizontal: '16@s',
        borderRadius: '16@ms',
    },
    fileNameText: {
        marginTop: 8,
        color: '#121312ff',
        fontSize: '14@ms',
        textAlign: 'center'
    },
    changeButton: {
        position: 'absolute',
        bottom: '16@vs',
        right: '16@s',
        backgroundColor: '#FFFFFF',
        paddingVertical: '8@vs',
        paddingHorizontal: '20@s',
        borderRadius: '20@ms',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    changeButtonText: {
        fontSize: '14@ms',
        fontWeight: '600',
        color: '#0F172A',
    },
    errorText: {
        fontSize: '11@ms',
        color: '#EF4444',
        marginTop: '-10@vs',
        marginBottom: '10@vs',
        marginLeft: '4@s',
    },
});

export default FileUpload;
