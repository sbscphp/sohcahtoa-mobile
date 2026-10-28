import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import { Trash } from 'iconsax-react-nativejs';
import * as DocumentPicker from 'expo-document-picker';
import FilePlus from '../../assets/icons/elements.svg';
import { useAppTheme } from '@/hooks/useAppTheme';

interface SupportFileUploadProps {
    onUpload: () => void;
    onRemove: () => void;
    file: DocumentPicker.DocumentPickerAsset | null;
}

export default function SupportFileUpload({
    onUpload,
    onRemove,
    file,
}: SupportFileUploadProps) {
    const { colors, isDark } = useAppTheme();

    if (file) {
        return (
            <View style={[styles.fileFilledContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.fileInfo}>
                    <View style={[styles.fileIconWrapper, { backgroundColor: isDark ? colors.surfaceHighlight : '#F1F5F9' }]}>
                        <FilePlus width={moderateScale(20)} height={moderateScale(20)} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.fileName, { color: colors.text }]} numberOfLines={1}>{file.name}</Text>
                        <Text style={[styles.fileSize, { color: colors.textMuted }]}>
                            {file.size ? `${(file.size / 1024).toFixed(0)} KB` : 'Unknown size'} – 100% uploaded
                        </Text>
                    </View>
                </View>
                <TouchableOpacity onPress={onRemove}>
                    <Trash size={moderateScale(20)} color="#F97316" variant="Linear" />
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <TouchableOpacity style={[styles.fileEmptyContainer, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]} onPress={onUpload}>
            <View style={styles.uploadIconWrapper}>
                <FilePlus width={moderateScale(20)} height={moderateScale(20)} />
            </View>
            <Text style={[styles.uploadText, { color: colors.textMuted }]}>Click to upload</Text>
        </TouchableOpacity>
    );
}

const styles = ScaledSheet.create({
    fileEmptyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: '16@ms',
        borderWidth: 1,
        borderColor: '#7e7f81ff',
        borderRadius: '24@ms',
        backgroundColor: '#FFFFFF',
        height: '45@vs',
        gap: '12@s',
    },
    uploadIconWrapper: {
        width: '24@ms',
        height: '24@ms',
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadText: {
        fontSize: '14@ms',
        color: '#94A3B8',
        fontWeight: '400',
    },
    fileFilledContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12@ms',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: '16@ms',
        backgroundColor: '#FFFFFF',
        height: '60@vs',
    },
    fileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: '12@s',
        flex: 1,
    },
    fileIconWrapper: {
        width: '32@ms',
        height: '32@ms',
        backgroundColor: '#F1F5F9',
        borderRadius: '8@ms',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fileName: {
        fontSize: '14@ms',
        color: '#0F172A',
        fontWeight: '500',
    },
    fileSize: {
        fontSize: '12@ms',
        color: '#64748B',
    },
});
