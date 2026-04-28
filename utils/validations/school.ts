import { z } from 'zod';
import {
    amountStepSchema,
    bankDetailsStepSchema,
    baseCredentialSchema,
} from './shared';

/** Step 0: School fees credentials — BVN, NIN, Form A, Passport + Admission Type */
export const schoolStep0Schema = baseCredentialSchema.extend({
    admissionType: z.string().min(1, 'Please select an admission type'),
});

/** Step 1: School fees documents */
import { invoiceNumberField, passportExpiryDateField, passportIssueDateField } from './shared';

export const schoolStep1Schema = z.object({
    invoiceNumber: invoiceNumberField,
    passportIssueDate: passportIssueDateField,
    passportExpiryDate: passportExpiryDateField,
});

/** Step 2: School fees amount — max $15,000 (post-grad) or $10,000 (undergrad) */
export const schoolStep2Schema = (isPostGrad: boolean) =>
    amountStepSchema(4000, 'School Fees');

/** Step 3: School fees uses bank details */
export const schoolStep3Schema = bankDetailsStepSchema;
