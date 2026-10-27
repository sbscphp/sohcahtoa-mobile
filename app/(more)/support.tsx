import GenericSelectionSheet, { SelectionItem } from '@/components/GenericSelectionSheet';
import Header from '@/components/Header';
import InputField from '@/components/InputField';
import PrimaryButton from '@/components/PrimaryButton';
import SelectField from '@/components/SelectField';
import SupportSuccessDialog from '@/components/SupportSuccessDialog';
import { useAppTheme } from '@/context/ThemeContext';
import { useCreateSupportTicketMutation } from '@/hooks/queries/support/useCreateSupportTicketMutation';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { Messages1, Trash } from 'iconsax-react-nativejs';
import { ChevronDown } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ScaledSheet, moderateScale } from 'react-native-size-matters';
import SupportFileUpload from '@/components/more/SupportFileUpload';

export default function SupportScreen() {
    const router = useRouter();
    const { colors, isDark } = useAppTheme();
    const [category, setCategory] = useState<SelectionItem | null>(null);
    const [description, setDescription] = useState('');
    const [attachment, setAttachment] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
    const [isCategorySheetVisible, setCategorySheetVisible] = useState(false);
    const [errors, setErrors] = useState<{ category?: string; description?: string }>({});

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
        const newErrors: { category?: string; description?: string } = {};

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
                attachment: {
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
        <View style={[styles.container, { backgroundColor: colors.background }]}>
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
                    <Text style={[styles.instructionText, { color: colors.text }]}>
                        Need help? Fill out this form to contact support for assistance
                    </Text>

                    <SelectField
                        label="Category"
                        placeholder="Select category"
                        value={category?.label}
                        onPress={() => setCategorySheetVisible(true)}
                        required
                        rightIcon={<ChevronDown size={moderateScale(20)} color={colors.icon} />}
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
                        <Text style={[styles.label, { color: colors.textSecondary }]}>
                            Attachment (optional)
                        </Text>
                        <SupportFileUpload
                            onUpload={handleFilePick}
                            onRemove={handleRemoveFile}
                            file={attachment}
                        />
                    </View>

                    <Text style={[styles.noteText, { color: colors.textMuted }]}>
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
        bottom: '50@vs',
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
        marginTop: '4@vs'
    },
});
