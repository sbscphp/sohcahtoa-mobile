import { z } from 'zod';
import {
    amountStepSchema,
    baseCredentialSchema,
} from './shared';


import { passportExpiryDateField, passportIssueDateField } from './shared';

export const schoolStep0Schema = baseCredentialSchema.extend({
    admissionType: z.string().min(1, 'Please select an admission type'),
    passportIssueDate: passportIssueDateField,
    passportExpiryDate: passportExpiryDateField,
    studentName: z.string().optional().or(z.literal('')),
    studentNin: z.string().optional().or(z.literal('')),
    studentPassportNumber: z.string().optional().or(z.literal('')),
    studentPassportIssueDate: z.string().optional().or(z.literal('')),
    studentPassportExpiryDate: z.string().optional().or(z.literal('')),
});

export const schoolStep2Schema = (isPostGrad: boolean) =>
    z.object({
        amount: z.number().positive('Please enter a valid amount'),
    });

export const schoolStep3Schema = z.object({
    beneficiaryCountry: z.string().min(1, 'Please select country/region'),
    studentName: z.string().min(1, 'Student name is required'),
    studentPassportNumber: z.string().optional().or(z.literal('')),
    schoolName: z.string().min(1, 'Please enter school name'),
    beneficiaryEmail: z.string().min(1, 'Please enter school email address').email('Please enter a valid email address'),
    beneficiaryPhone: z.string().min(1, 'Please enter school phone number'),
    beneficiaryAddress: z.string().min(1, 'Please enter school address'),
    beneficiaryCity: z.string().min(1, 'Please enter school city'),
    beneficiaryState: z.string().min(1, 'Please enter school state/province'),
    bankName: z.string().min(1, 'Please enter bank name'),
    bankAccountName: z.string().min(1, 'Please enter account name'),
    bankAccountAddress: z.string().min(1, 'Please enter bank account address'),
    bankAccountIban: z.string().optional().or(z.literal('')),
    bankAccountSwiftCode: z.string().min(1, 'Please enter SWIFT code').refine((val) => /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/i.test(val), {
        message: 'SWIFT code must be a valid 8 or 11 character BIC code',
    }),
    bankAccountNumber: z.string().min(5, 'Account number must be at least 5 digits').max(34, 'Account number is too long'),
    routingNumber: z.string().optional().or(z.literal('')).refine((val) => !val || /^\d{9}$/.test(val), {
        message: 'Routing number must be exactly 9 digits',
    }),
    paymentReference: z.string().min(1, 'Please enter payment reference / ID'),
    correspondenceBankName: z.string().optional().or(z.literal('')),
    correspondenceBankAddress: z.string().optional().or(z.literal('')),
    correspondenceBankSwiftCode: z.string().optional().or(z.literal('')),
});
