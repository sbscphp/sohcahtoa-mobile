import { z } from 'zod';
import {
    amountStepSchema,
    bankDetailsStepSchema,
    baseCredentialSchema,
} from './shared';

/** Step 0: School fees credentials — BVN, NIN, Form A, Passport + Admission Type */
import { passportExpiryDateField, passportIssueDateField } from './shared';

export const schoolStep0Schema = baseCredentialSchema.extend({
    admissionType: z.string().min(1, 'Please select an admission type'),
    passportIssueDate: passportIssueDateField,
    passportExpiryDate: passportExpiryDateField,
});



/** Step 2: School fees amount — max $10,000 */
export const schoolStep2Schema = (isPostGrad: boolean) =>
    amountStepSchema(10000, 'School Fees');

/** Step 3: School fees uses specific bank details */
export const schoolStep3Schema = z.object({
    studentName: z.string().min(1, 'Please enter student name'),
    studentPassportNumber: z.string().min(1, 'Please enter student passport number'),
    bankAccountName: z.string().min(1, 'Please enter bank account name'),
    bankAccountAddress: z.string().min(1, 'Please enter bank account address'),
    bankAccountIban: z.string().min(1, 'Please enter bank account IBAN'),
    bankAccountSwiftCode: z.string().min(1, 'Please enter bank account swift code'),
    bankAccountNumber: z.string().min(1, 'Please enter bank account number'),
    correspondenceBankName: z.string().min(1, 'Please enter correspondence bank name'),
    correspondenceBankAddress: z.string().min(1, 'Please enter correspondence bank address'),
    correspondenceBankSwiftCode: z.string().min(1, 'Please enter correspondence bank swift code'),
});
