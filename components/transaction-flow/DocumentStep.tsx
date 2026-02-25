import FileUpload from '@/components/FileUpload';
import React from 'react';
import { Text, View } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';

interface DocumentField {
    label: string;
    onUpload: () => void;
    fileName?: string | null;
    fileUri?: string | null;
    fileType?: string | null;
    required?: boolean;

    // Optional associated inputs (e.g. Passport Number, Expiry Date) below the upload
    associatedInputs?: React.ReactNode;
    error?: string;
}

interface DocumentStepProps {
    title?: string;
    documents: DocumentField[];
}

export default function DocumentStep({ title = "Upload Relevant Documents", documents }: DocumentStepProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>{title}</Text>

            {documents.map((doc, index) => (
                <View key={index} style={styles.docSection}>
                    <Text style={styles.label}>
                        {doc.label} {doc.required && <Text style={styles.required}>*</Text>}
                    </Text>

                    <FileUpload
                        onUpload={doc.onUpload}
                        fileName={doc.fileName}
                        fileUri={doc.fileUri}
                        fileType={doc.fileType}
                        title={`Upload or change here.`}
                        error={doc.error}
                    />

                    {doc.associatedInputs && (
                        <View style={styles.associatedInputs}>
                            {doc.associatedInputs}
                        </View>
                    )}
                </View>
            ))}
        </View>
    );
}

const styles = ScaledSheet.create({
    container: {
        gap: '6@vs',
    },
    sectionTitle: {
        fontSize: '13@ms',
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: '8@vs',
    },
    docSection: {
        gap: '6@vs',
    },
    label: {
        fontSize: '12.5@ms',
        color: '#475569',
    },
    required: {
        color: '#EF4444',
    },
    associatedInputs: {
        marginTop: '6@vs',
        gap: '12@vs',
    }
});
