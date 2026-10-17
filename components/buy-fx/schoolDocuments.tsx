import React, { useState } from 'react';
import { View } from 'react-native';
import ControlledDatePicker from '@/components/ControlledDatePicker';
import { Control } from 'react-hook-form';
import { UploadedFile, UploadedMetadata, useDocumentUpload } from '@/hooks/useDocumentUpload';
import { SelectionItem } from '@/components/GenericSelectionSheet';
import { Teacher } from 'iconsax-react-nativejs';
import { zodResolver } from '@hookform/resolvers/zod';
import { schoolStep0Schema, schoolStep2Schema, schoolStep3Schema } from '@/utils/validations/school';

export const ADMISSION_TYPES: SelectionItem[] = [
    { id: '1', label: 'Undergraduate', value: 'Undergraduate', icon: Teacher },
    { id: '2', label: 'Post-Graduate', value: 'Post-Graduate', icon: Teacher },
    { id: '3', label: 'Others (high school, pre-school etc)', value: 'Others', icon: Teacher },
];

export interface SchoolDocsState {
    admission: { file: UploadedFile | null; meta: UploadedMetadata | null };
    invoice: { file: UploadedFile | null; meta: UploadedMetadata | null };
    applicantPassport: { file: UploadedFile | null; meta: UploadedMetadata | null };
    studentPassport: { file: UploadedFile | null; meta: UploadedMetadata | null };
    result: { file: UploadedFile | null; meta: UploadedMetadata | null };
    degree: { file: UploadedFile | null; meta: UploadedMetadata | null };
    signature: { file: UploadedFile | null; meta: UploadedMetadata | null };
    bank_verification: { file: UploadedFile | null; meta: UploadedMetadata | null };
}

export function createSchoolResolver(profileBvn?: string, profileNin?: string) {
    return (data: any, context: any, options: any) => {
        const isPostGrad = data.admissionType === 'Post-Graduate';
        const dynamicSchema = schoolStep0Schema
            .merge(schoolStep2Schema(isPostGrad))
            .merge(schoolStep3Schema)
            .superRefine((val, ctx) => {
                if (!profileBvn && !val.bvn) {
                    ctx.addIssue({ code: 'custom', message: 'BVN is required', path: ['bvn'] });
                }
                if (!profileNin && !val.nin) {
                    ctx.addIssue({ code: 'custom', message: 'NIN is required', path: ['nin'] });
                }
                if (val.passportIssueDate && val.passportExpiryDate && val.passportIssueDate === val.passportExpiryDate) {
                    ctx.addIssue({ code: 'custom', message: 'Passport Expiry Date cannot be the same as Passport Issue Date', path: ['passportExpiryDate'] });
                }
                if (val.admissionType) {
                    if (!val.studentName) {
                        ctx.addIssue({ code: 'custom', message: 'Student Full Name is required', path: ['studentName'] });
                    } else if (val.studentName.trim().length < 3) {
                        ctx.addIssue({ code: 'custom', message: 'Student name must be at least 3 characters', path: ['studentName'] });
                    }
                    if (val.studentNin && (val.studentNin.length !== 11 || !/^\d+$/.test(val.studentNin))) {
                        ctx.addIssue({ code: 'custom', message: 'Student NIN must be exactly 11 digits', path: ['studentNin'] });
                    }
                    if (!val.studentPassportNumber) {
                        ctx.addIssue({ code: 'custom', message: 'Student Passport Number is required', path: ['studentPassportNumber'] });
                    } else if (!/^[A-Za-z]\d{8}$/.test(val.studentPassportNumber)) {
                        ctx.addIssue({ code: 'custom', message: 'Please enter a valid Passport Number (e.g. A12345678)', path: ['studentPassportNumber'] });
                    }
                    if (!val.studentPassportIssueDate) {
                        ctx.addIssue({ code: 'custom', message: 'Please select student Passport Issue Date', path: ['studentPassportIssueDate'] });
                    }
                    if (!val.studentPassportExpiryDate) {
                        ctx.addIssue({ code: 'custom', message: 'Please select student Passport Expiry Date', path: ['studentPassportExpiryDate'] });
                    }
                    if (val.studentPassportIssueDate && val.studentPassportExpiryDate && val.studentPassportIssueDate === val.studentPassportExpiryDate) {
                        ctx.addIssue({ code: 'custom', message: 'Student Passport Expiry Date cannot be the same as Issue Date', path: ['studentPassportExpiryDate'] });
                    }
                }
            });
        return zodResolver(dynamicSchema)(data, context, options);
    };
}

export function useSchoolDocuments(
    admissionType: string,
    isPostGrad: boolean,
    control: any,
    showToast: (msg: string, type: 'error') => void
) {
    const [uploadTarget, setUploadTarget] = useState<'applicant' | 'student' | null>(null);
    const [docs, setDocs] = useState<SchoolDocsState>({
        admission: { file: null, meta: null },
        invoice: { file: null, meta: null },
        applicantPassport: { file: null, meta: null },
        studentPassport: { file: null, meta: null },
        result: { file: null, meta: null },
        degree: { file: null, meta: null },
        signature: { file: null, meta: null },
        bank_verification: { file: null, meta: null },
    });

    const updateDoc = (key: keyof SchoolDocsState, file: UploadedFile, metadata: UploadedMetadata) => {
        setDocs(prev => ({ ...prev, [key]: { file, meta: metadata } }));
    };

    const { upload: uploadFile, isPending: isUploading } = useDocumentUpload({
        onSuccess: (documentType, { file, metadata }) => {
            if (documentType === 'SCHOOL_ADMISSION') updateDoc('admission', file, metadata);
            else if (documentType === 'INVOICE') updateDoc('invoice', file, metadata);
            else if (documentType === 'STUDENT_PASSPORT') updateDoc('studentPassport', file, metadata);
            else if (documentType === 'PASSPORT') updateDoc('applicantPassport', file, metadata);
            else if (documentType === 'RECEIPT') updateDoc('result', file, metadata);
            else if (documentType === 'MEMBERSHIP_CARD') updateDoc('degree', file, metadata);
            else if (documentType === 'DIGITAL_SIGNATURE') updateDoc('signature', file, metadata);
            else if (documentType === 'BANK_VERIFICATION') updateDoc('bank_verification', file, metadata);
        },
        onError: () => showToast('Failed to upload document. Please try again.', 'error'),
    });

    const undergraduateDocuments = [
        { label: 'Evidence of Admission', onUpload: () => uploadFile('SCHOOL_ADMISSION'), fileName: docs.admission.file?.name, fileUri: docs.admission.file?.uri, fileUrl: docs.admission.meta?.fileUrl, fileType: docs.admission.file?.type, required: true },
        { label: 'School Invoice', onUpload: () => uploadFile('INVOICE'), fileName: docs.invoice.file?.name, fileUri: docs.invoice.file?.uri, fileUrl: docs.invoice.meta?.fileUrl, fileType: docs.invoice.file?.type, required: true },
        { label: "Applicant's International Passport", onUpload: () => { setUploadTarget('applicant'); uploadFile('PASSPORT'); }, fileName: docs.applicantPassport.file?.name, fileUri: docs.applicantPassport.file?.uri, fileUrl: docs.applicantPassport.meta?.fileUrl, fileType: docs.applicantPassport.file?.type, required: false },
        { label: "Student's International Passport", onUpload: () => { setUploadTarget('student'); uploadFile('STUDENT_PASSPORT'); }, fileName: docs.studentPassport.file?.name, fileUri: docs.studentPassport.file?.uri, fileUrl: docs.studentPassport.meta?.fileUrl, fileType: docs.studentPassport.file?.type, required: true },
    ];

    const postgraduateDocuments = [
        { label: 'Evidence of Admission', onUpload: () => uploadFile('SCHOOL_ADMISSION'), fileName: docs.admission.file?.name, fileUri: docs.admission.file?.uri, fileUrl: docs.admission.meta?.fileUrl, fileType: docs.admission.file?.type, required: true },
        { label: 'School Invoice', onUpload: () => uploadFile('INVOICE'), fileName: docs.invoice.file?.name, fileUri: docs.invoice.file?.uri, fileUrl: docs.invoice.meta?.fileUrl, fileType: docs.invoice.file?.type, required: true },
        { label: 'First Degree Certificate', onUpload: () => uploadFile('MEMBERSHIP_CARD'), fileName: docs.degree.file?.name, fileUri: docs.degree.file?.uri, fileUrl: docs.degree.meta?.fileUrl, fileType: docs.degree.file?.type, required: true },
        { label: 'Statement Of Result', onUpload: () => uploadFile('RECEIPT'), fileName: docs.result.file?.name, fileUri: docs.result.file?.uri, fileUrl: docs.result.meta?.fileUrl, fileType: docs.result.file?.type, required: true },
        { label: "Applicant's International Passport", onUpload: () => { setUploadTarget('applicant'); uploadFile('PASSPORT'); }, fileName: docs.applicantPassport.file?.name, fileUri: docs.applicantPassport.file?.uri, fileUrl: docs.applicantPassport.meta?.fileUrl, fileType: docs.applicantPassport.file?.type, required: false },
        { label: "Student's International Passport", onUpload: () => { setUploadTarget('student'); uploadFile('STUDENT_PASSPORT'); }, fileName: docs.studentPassport.file?.name, fileUri: docs.studentPassport.file?.uri, fileUrl: docs.studentPassport.meta?.fileUrl, fileType: docs.studentPassport.file?.type, required: true },
    ];

    const othersDocuments = [
        {
            label: "Applicant's International Passport",
            onUpload: () => { setUploadTarget('applicant'); uploadFile('PASSPORT'); },
            fileName: docs.applicantPassport.file?.name, fileUri: docs.applicantPassport.file?.uri, fileUrl: docs.applicantPassport.meta?.fileUrl, fileType: docs.applicantPassport.file?.type, required: false,
            associatedInputs: (
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                    <View style={{ flex: 1 }}><ControlledDatePicker control={control} name="passportIssueDate" label="Passport Issue Date" required maximumDate={new Date()} /></View>
                    <View style={{ flex: 1 }}><ControlledDatePicker control={control} name="passportExpiryDate" label="Passport Expiry Date" required minimumDate={new Date()} /></View>
                </View>
            ),
        },
        { label: "Student's International Passport", onUpload: () => { setUploadTarget('student'); uploadFile('STUDENT_PASSPORT'); }, fileName: docs.studentPassport.file?.name, fileUri: docs.studentPassport.file?.uri, fileUrl: docs.studentPassport.meta?.fileUrl, fileType: docs.studentPassport.file?.type, required: true },
        { label: 'Evidence of Enrollment', onUpload: () => uploadFile('SCHOOL_ADMISSION'), fileName: docs.admission.file?.name, fileUri: docs.admission.file?.uri, fileUrl: docs.admission.meta?.fileUrl, fileType: docs.admission.file?.type, required: true },
        { label: 'School Invoice', onUpload: () => uploadFile('INVOICE'), fileName: docs.invoice.file?.name, fileUri: docs.invoice.file?.uri, fileUrl: docs.invoice.meta?.fileUrl, fileType: docs.invoice.file?.type, required: true },
    ];

    const documentFields = admissionType === 'Others' ? othersDocuments : isPostGrad ? postgraduateDocuments : undergraduateDocuments;
    const hasRequiredDocs = admissionType === 'Others'
        ? !!(docs.studentPassport.file && docs.admission.file && docs.invoice.file)
        : isPostGrad
            ? !!(docs.admission.file && docs.degree.file && docs.result.file && docs.studentPassport.file && docs.invoice.file)
            : !!(docs.admission.file && docs.studentPassport.file && docs.invoice.file);

    return { docs, documentFields, isUploading, hasRequiredDocs, uploadTarget, uploadFile };
}

export function buildSchoolPayload(data: any, docs: SchoolDocsState, currencyGet: any, isPostGrad: boolean) {
    return {
        type: 'SCHOOL_FEES',
        mode: 'BUY',
        currency: currencyGet.code,
        amount: data.amount,
        purpose: 'School Fees',
        destinationCountry: data.beneficiaryCountry,
        bvn: data.bvn,
        nin: data.nin,
        formAId: data.formAId,
        admissionType: data.admissionType,
        passportDocumentNumber: data.passportDocumentNumber,
        passportIssueDate: data.passportIssueDate,
        passportExpiryDate: data.passportExpiryDate,
        documents: [
            ...(docs.admission.meta ? [docs.admission.meta] : []),
            ...(docs.invoice.meta ? [docs.invoice.meta] : []),
            ...(docs.applicantPassport.meta ? [docs.applicantPassport.meta] : []),
            ...(docs.studentPassport.meta ? [docs.studentPassport.meta] : []),
            ...(isPostGrad && docs.degree.meta ? [docs.degree.meta] : []),
            ...(isPostGrad && docs.result.meta ? [docs.result.meta] : []),
            ...(docs.bank_verification.meta ? [docs.bank_verification.meta] : []),
        ],
        beneficiaryDetails: {
            organizationName: data.schoolName || '',
            studentName: data.studentName,
            studentNin: data.studentNin || undefined,
            studentPassportDocumentNumber: data.studentPassportNumber || undefined,
            studentPassportIssueDate: data.studentPassportIssueDate || undefined,
            studentPassportExpiryDate: data.studentPassportExpiryDate || undefined,
            bankAccountName: data.bankAccountName,
            bankAccountAddress: data.bankAccountAddress,
            bankAccountIban: data.bankAccountIban,
            bankAccountSwiftCode: data.bankAccountSwiftCode,
            bankAccountNumber: data.bankAccountNumber,
            bankName: data.bankName,
            country: data.beneficiaryCountry,
            address: data.beneficiaryAddress,
            email: data.beneficiaryEmail || '',
            phoneNumber: data.beneficiaryPhone || '',
            city: data.beneficiaryCity || '',
            state: data.beneficiaryState || '',
            paymentReference: data.paymentReference,
            routingNumber: data.routingNumber,
            ifscCode: data.ifscCode,
            purposeCode: data.purposeCode,
            bsbCode: data.bsbCode,
            otherBankDetails: data.otherBankDetails,
            correspondenceBankName: data.correspondenceBankName,
            correspondenceBankAddress: data.correspondenceBankAddress,
            correspondenceBankSwiftCode: data.correspondenceBankSwiftCode,
        },
        refundBankDetails: {
            bankName: data.customerBankName,
            bankCode: data.customerBankCode,
            accountNumber: data.customerAccountNumber,
            accountName: data.customerAccountName,
        },
    };
}
