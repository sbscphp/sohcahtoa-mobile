import GenericSelectionSheet, { SelectionItem } from '@/components/GenericSelectionSheet';
import Header from '@/components/Header';
import InputField from '@/components/InputField';
import PrimaryButton from '@/components/PrimaryButton';
import SelectField from '@/components/SelectField';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { Trash } from 'iconsax-react-nativejs';
import { ChevronDown } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import FilePlus from '../../assets/icons/elements.svg';

const SupportFileUpload = ({
    onUpload,
    onRemove,
    file
}: {
    onUpload: () => void;
    onRemove: () => void;
    file: DocumentPicker.DocumentPickerAsset | null;
}) => {
    if (file) {

        return (
            <View style={styles.fileFilledContainer}>
                <View style={styles.fileInfo}>
                    <View style={styles.fileIconWrapper}>

                        <FilePlus width={moderateScale(20)} height={moderateScale(20)} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
                        <Text style={styles.fileSize}>{file.size ? `${(file.size / 1024).toFixed(0)} KB` : 'Unknown size'} – 100% uploaded</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={onRemove}>
                    <Trash size={moderateScale(20)} color="#F97316" variant="Linear" />
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <TouchableOpacity style={styles.fileEmptyContainer} onPress={onUpload}>
            <View style={styles.uploadIconWrapper}>
                <FilePlus width={moderateScale(20)} height={moderateScale(20)} />
            </View>
            <Text style={styles.uploadText}>Click to upload</Text>
        </TouchableOpacity>
    );
};

export default function SupportScreen() {
    const router = useRouter();
    const [customerId, setCustomerId] = useState('');
    const [category, setCategory] = useState<SelectionItem | null>(null);
    const [description, setDescription] = useState('');
    const [attachment, setAttachment] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
    const [isCategorySheetVisible, setCategorySheetVisible] = useState(false);

    const categories: SelectionItem[] = [
        { id: '1', label: 'Failed login/password reset', value: 'login_issue' },
        { id: '2', label: 'Transaction failed', value: 'transaction_failed' },
        { id: '3', label: 'Account verification pending', value: 'verification_pending' },
        { id: '4', label: 'App bugs/crashes', value: 'bug_report' },
        { id: '5', label: 'Other', value: 'other' },
    ];

    const handleFilePick = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setAttachment(result.assets[0]);
            }
        } catch (error) {
            console.error('Error picking document:', error);
            Alert.alert('Error', 'Failed to pick document');
        }
    };

    const handleRemoveFile = () => {
        setAttachment(null);
    };

    const handleSubmit = () => {
        if (!customerId.trim()) {
            Alert.alert('Validation Error', 'Please enter your Customer ID');
            return;
        }
        if (!category) {
            Alert.alert('Validation Error', 'Please select a category');
            return;
        }
        if (!description.trim()) {
            Alert.alert('Validation Error', 'Please enter a description');
            return;
        }

        // Mock submission
        console.log('Submitting Support Request:', {
            customerId,
            category: category.value,
            description,
            attachment: attachment ? attachment.name : 'None'
        });

        // Alert.alert('Success', 'Your support request has been submitted successfully.', [
        //     { text: 'OK', onPress: () => router.back() }
        // ]);
    };

    return (
        <View style={styles.container}>
            <Header title="Support" />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.instructionText}>
                        Need help? Fill out this form to contact support for assistances
                    </Text>

                    <InputField
                        label="Customer ID"
                        placeholder="Enter customer id"
                        value={customerId}
                        onChangeText={setCustomerId}
                        required
                    />

                    <SelectField
                        label="Category"
                        placeholder="Select category"
                        value={category?.label}
                        onPress={() => setCategorySheetVisible(true)}
                        required
                        rightIcon={<ChevronDown size={moderateScale(20)} color="#0F172A" />}
                    />

                    <InputField
                        label="Description"
                        placeholder="Start typing your description"
                        value={description}
                        onChangeText={setDescription}
                        required
                    />

                    <View style={styles.attachmentContainer}>
                        <Text style={styles.label}>
                            Attachment (optional) <Text style={styles.required}>*</Text>
                        </Text>
                        <SupportFileUpload
                            onUpload={handleFilePick}
                            onRemove={handleRemoveFile}
                            file={attachment}
                        />
                    </View>

                    <Text style={styles.noteText}>
                        Note: Once submitted, you can track it in support history
                    </Text>

                    <PrimaryButton
                        title="Submit Form"
                        onPress={handleSubmit}
                        style={styles.submitButton}
                    />
                </ScrollView>
            </KeyboardAvoidingView>

            <GenericSelectionSheet
                visible={isCategorySheetVisible}
                onClose={() => setCategorySheetVisible(false)}
                title="Select Category"
                items={categories}
                selectedItem={category?.value || ''}
                onSelect={(item) => {
                    setCategory(item);
                    setCategorySheetVisible(false);
                }}
                confirmButtonText="Confirm Selection"
            />
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
        paddingBottom: '40@vs',
    },
    instructionText: {
        fontSize: '15@ms',
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: '24@vs',
        lineHeight: '22@ms'
    },
    attachmentContainer: {
        marginBottom: '16@vs'
    },
    label: {
        fontSize: '15@ms',
        fontWeight: '400',
        color: '#475569',
        marginBottom: '10@vs',
    },
    required: {
        color: '#EF4444',
    },
    noteText: {
        fontSize: '13@ms',
        color: '#64748B',
        marginTop: '2@vs',
        marginBottom: '32@vs',
        lineHeight: '20@ms'
    },
    submitButton: {
        marginTop: 'auto'
    },

    fileEmptyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: '16@ms',
        borderWidth: 1,
        borderColor: '#7e7f81ff',
        borderRadius: '24@ms',
        backgroundColor: '#FFFFFF',
        height: '45@vs',
        gap: '12@s'
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
        backgroundColor: '#F1F5F9', // Light background for icon
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
    }
});
