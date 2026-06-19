import { z } from 'zod';
import { amountStepSchema, baseCredentialSchema } from './shared';

export const professionalStep0Schema = baseCredentialSchema.extend({
    passportIssueDate: z.string().min(1, 'Please select Passport Issue Date'),
    passportExpiryDate: z.string().min(1, 'Please select Passport Expiry Date'),
    memberNumber: z.string().min(1, 'Evidence of Membership or Registration number is required'),
});

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
    bankAccountNumber: z.string().min(5, 'Account number must be at least 5 digits').max(34, 'Account number is too long'),
    bankAccountAddress: z.string().min(1, 'Please enter bank address'),
    bankAccountSwiftCode: z.string().min(1, 'Please enter SWIFT code').refine((val) => /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/i.test(val), {
        message: 'SWIFT code must be a valid 8 or 11 character BIC code',
    }),
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
        } else {
            const cleanIban = data.bankAccountIban.replace(/\s/g, '');
            if (!/^GB\d{2}[A-Z]{4}\d{14}$/i.test(cleanIban)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Please enter a valid UK IBAN (exactly 22 characters, starting with GB)',
                    path: ['bankAccountIban']
                });
            }
        }
    } else if (country.includes('united states') || country === 'usa' || country === 'canada') {
        if (!data.routingNumber) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Please enter routing number',
                path: ['routingNumber']
            });
        } else if (!/^\d{9}$/.test(data.routingNumber)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Routing number must be exactly 9 digits',
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
        } else if (!/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(data.ifscCode)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Please enter a valid 11-character IFSC code (e.g. SBIN0000001)',
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
        } else if (!/^\d{3}-?\d{3}$/.test(data.bsbCode.replace(/\s/g, ''))) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'BSB code must be exactly 6 digits (e.g. 123-456 or 123456)',
                path: ['bsbCode']
            });
        }
    }
});
