import { z } from 'zod';
import { amountStepSchema, baseCredentialSchema, medicalBankDetailsStepSchema } from './shared';

/** Step 0: Medical credentials — standard BVN, NIN, Form A, Passport */
export const medicalStep0Schema = baseCredentialSchema;

/** Step 1: Document details */
export const medicalStep1Schema = z.object({
    visaNumber: z.string().min(1, 'Please enter your Visa Number'),
    returnTicketNumber: z.string().min(1, 'Please enter your Return Ticket Number'),
});

/** Step 2: Medical amount — max $5,000 */
export const medicalStep2Schema = amountStepSchema(5000, 'Medical FX');

/** Step 3: Medical uses beneficiary bank details */
export const medicalStep3Schema = medicalBankDetailsStepSchema;
