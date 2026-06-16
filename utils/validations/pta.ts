import { z } from 'zod';
import { amountStepSchema, baseCredentialSchema, locationStepSchema, passportExpiryDateField, passportIssueDateField } from './shared';

/** Step 0: PTA credentials — standard BVN, NIN (optional), Form A, Passport, plus Passport Issue & Expiry Dates */
export const ptaStep0Schema = baseCredentialSchema.omit({ nin: true }).extend({
    nin: z.string().optional(),
    passportIssueDate: passportIssueDateField,
    passportExpiryDate: passportExpiryDateField,
});

export const ptaStep1Schema = z.object({});

/** Step 2: PTA amount — max $4,000 */
export const ptaStep2Schema = amountStepSchema(4000, 'PTA');

/** Step 3: PTA location */
export const ptaStep3Schema = locationStepSchema;
