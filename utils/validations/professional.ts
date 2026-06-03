import { z } from 'zod';
import { amountStepSchema, baseCredentialSchema } from './shared';

/** Step 0: Professional credentials — standard BVN, NIN, Form A, Passport */
export const professionalStep0Schema = baseCredentialSchema;

/** Step 1: Professional documents */
export const professionalStep1Schema = z.object({});

/** Step 2: Professional amount — max $2,000 */
export const professionalStep2Schema = amountStepSchema(2000, 'Professional');

/** Step 3: Professional uses specific bank details schema */
export const professionalStep3Schema = z.object({
    beneficiaryCountry: z.string().min(1, 'Please select country/region'),
    bankAccountName: z.string().min(1, 'Please enter beneficiary name'),
    beneficiaryAddress: z.string().min(1, 'Please enter beneficiary address'),
    bankName: z.string().min(1, 'Please enter bank name'),
    bankAccountNumber: z.string().min(1, 'Please enter account number'),
    bankAccountAddress: z.string().min(1, 'Please enter bank address'),
    bankAccountSwiftCode: z.string().min(1, 'Please enter SWIFT code'),
    paymentReference: z.string().min(1, 'Please enter payment reference ID'),
    // Optional/conditional fields validated via superRefine:
    bankAccountIban: z.string().optional(),
    routingNumber: z.string().optional(),
    ifscCode: z.string().optional(),
    purposeCode: z.string().optional(),
    bsbCode: z.string().optional(),

    // Keep old fields as optional to prevent react-hook-form initialization or submission issues
    memberName: z.string().optional(),
    memberNumber: z.string().optional(),
    organizationName: z.string().optional(),
    beneficiaryPhone: z.string().optional(),
    beneficiaryEmail: z.string().optional(),
    beneficiaryCity: z.string().optional(),
    beneficiaryState: z.string().optional(),
    correspondenceBankName: z.string().optional(),
    correspondenceBankAddress: z.string().optional(),
    correspondenceBankSwiftCode: z.string().optional(),
}).superRefine((data, ctx) => {
    const country = data.beneficiaryCountry?.toLowerCase() || '';

    if (country.includes('united kingdom') || country === 'uk') {
        if (!data.bankAccountIban) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Please enter IBAN',
                path: ['bankAccountIban']
            });
        }
    } else if (country.includes('united states') || country === 'usa' || country === 'canada') {
        if (!data.routingNumber) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Please enter routing number',
                path: ['routingNumber']
            });
        }
    } else if (country.includes('india')) {
        if (!data.ifscCode) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Please enter IFSC number',
                path: ['ifscCode']
            });
        }
        if (!data.purposeCode) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Please enter purpose code',
                path: ['purposeCode']
            });
        }
    } else if (country.includes('australia')) {
        if (!data.bsbCode) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Please enter BSB code',
                path: ['bsbCode']
            });
        }
    }
});
