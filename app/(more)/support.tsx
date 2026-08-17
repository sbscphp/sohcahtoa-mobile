import GenericSelectionSheet, { SelectionItem } from '@/components/GenericSelectionSheet';
import Header from '@/components/Header';
import InputField from '@/components/InputField';
import PrimaryButton from '@/components/PrimaryButton';
import SelectField from '@/components/SelectField';
import SupportSuccessDialog from '@/components/SupportSuccessDialog';
import { useCreateSupportTicketMutation } from '@/hooks/queries/support/useCreateSupportTicketMutation';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { Messages1, Trash } from 'iconsax-react-nativejs';
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
    const [errors, setErrors] = useState<{ customerId?: string; category?: string; description?: string }>({});

    const categories: SelectionItem[] = [
        { id: '1', label: 'Issues related to transactions', value: 'TRANSACTION_ISSUE' },
        { id: '2', label: 'Problems accessing account', value: 'ACCOUNT_ACCESS' },
        { id: '3', label: 'Payment-related problems', value: 'PAYMENT_ISSUE' },
        { id: '4', label: 'Document verification issues', value: 'DOCUMENT_VERIFICATION' },
        { id: '5', label: 'Technical problems with the platform', value: 'TECHNICAL_ISSUE' },
        { id: '6', label: 'Compliance or regulatory questions', value: 'COMPLIANCE_INQUIRY' },
        { id: '7', label: 'General questions', value: 'GENERAL_INQUIRY' },
        { id: '8', label: 'Other issues', value: 'OTHER' },
    ];

    const [isSuccessDialogVisible, setSuccessDialogVisible] = useState(false);

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

    const { mutate: createSupportTicket, isPending } = useCreateSupportTicketMutation();

    const handleSubmit = () => {
        const newErrors: { customerId?: string; category?: string; description?: string } = {};

        if (!customerId.trim()) {
            newErrors.customerId = 'Please enter your Customer ID';
        }
        if (!category) {
            newErrors.category = 'Please select a category';
        }
        if (!description.trim()) {
            newErrors.description = 'Please enter a description';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});

        const payload = {
            category: category!.value,
            description,
            ...(attachment ? {
                file: {
                    uri: attachment.uri,
                    type: attachment.mimeType || 'application/octet-stream',
                    name: attachment.name
                }
            } : {})
        };

        createSupportTicket(payload, {
            onSuccess: () => {
                setSuccessDialogVisible(true);
            }
        });
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
                        Need help? Fill out this form to contact support for assistance
                    </Text>

                    <InputField
                        label="Customer ID"
                        placeholder="Enter customer id"
                        value={customerId}
                        onChangeText={(text) => {
                            setCustomerId(text);
                            if (errors.customerId) setErrors(prev => ({ ...prev, customerId: undefined }));
                        }}
                        required
                        error={errors.customerId}
                    />

                    <SelectField
                        label="Category"
                        placeholder="Select category"
                        value={category?.label}
                        onPress={() => setCategorySheetVisible(true)}
                        required
                        rightIcon={<ChevronDown size={moderateScale(20)} color="#0F172A" />}
                        error={errors.category}
                    />

                    <InputField
                        label="Description"
                        placeholder="Start typing your description"
                        value={description}
                        onChangeText={(text) => {
                            setDescription(text);
                            if (errors.description) setErrors(prev => ({ ...prev, description: undefined }));
                        }}
                        required
                        multiline
                        numberOfLines={5}
                        height={moderateScale(120)}
                        style={styles.descriptionInput}
                        wrapperStyle={styles.descriptionWrapper}
                        error={errors.description}
                    />

                    <View style={styles.attachmentContainer}>
                        <Text style={styles.label}>
                            Attachment (optional)
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
                        loading={isPending}
                        disabled={!category || !description.trim()}
                    />
                </ScrollView>
            </KeyboardAvoidingView>

            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push('/(more)/support-history')}
                activeOpacity={0.8}
            >
                <Messages1 size={moderateScale(18)} color="#FFFFFF" variant="Bold" />
            </TouchableOpacity>

            <GenericSelectionSheet
                visible={isCategorySheetVisible}
                onClose={() => setCategorySheetVisible(false)}
                title="Select Category"
                items={categories}
                selectedItem={category?.value || ''}
                onSelect={(item) => {
                    setCategory(item);
                    setCategorySheetVisible(false);
                    if (errors.category) setErrors(prev => ({ ...prev, category: undefined }));
                }}
                confirmButtonText="Confirm Selection"
            />

            <SupportSuccessDialog
                visible={isSuccessDialogVisible}
                onClose={() => {
                    setSuccessDialogVisible(false);
                    router.back();
                }}
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
    descriptionInput: {
        textAlignVertical: 'top',
        paddingTop: '12@ms',
        height: '100%',
    },
    descriptionWrapper: {
        borderRadius: '12@ms',
        alignItems: 'flex-start',
        paddingVertical: '4@vs',
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
        marginBottom: '24@vs',
        lineHeight: '20@ms'
    },
    fab: {
        position: 'absolute',
        bottom: '100@vs',
        right: '20@ms',
        width: '44@ms',
        height: '44@ms',
        borderRadius: '32@ms',
        backgroundColor: '#F97316',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#F97316',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    submitButton: {
        marginTop: '14@vs'
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
