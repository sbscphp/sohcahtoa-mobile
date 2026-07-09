import { z } from 'zod';
import { amountStepSchema, baseCredentialSchema, medicalBankDetailsStepSchema, passportIssueDateField, ticketNumberField, visaNumberField } from './shared';

/** Step 0: Medical credentials — standard BVN, NIN, Form A, Passport */
export const medicalStep0Schema = baseCredentialSchema;

/** Step 1: Document details */
export const medicalStep1Schema = z.object({
    passportIssueDate: passportIssueDateField,
    passportExpiryDate: z.string().min(1, 'Please select Passport Expiry Date'),
});

/** Step 2: Medical amount — max $5,000 */
export const medicalStep2Schema = amountStepSchema(5000, 'Medical FX');

import { professionalStep3BaseSchema, bankDetailsRefinement } from './professional';

/** Step 3: Medical uses beneficiary bank details */
export const medicalStep3Schema = professionalStep3BaseSchema.extend({
    memberName: z.string().optional().or(z.literal('')),
    memberNumber: z.string().optional().or(z.literal('')),
}).superRefine(bankDetailsRefinement);
