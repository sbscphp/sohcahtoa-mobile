import { z } from 'zod';
import { amountStepSchema, baseCredentialSchema, locationStepSchema, passportExpiryDateField, passportIssueDateField, ticketNumberField } from './shared';

/** Step 0: PTA credentials — standard BVN, NIN, Form A, Passport */
export const ptaStep0Schema = baseCredentialSchema;

export const ptaStep1Schema = z.object({
    ticketNumber: ticketNumberField,
    passportIssueDate: passportIssueDateField,
    passportExpiryDate: passportExpiryDateField,
});

/** Step 2: PTA amount — max $4,000 */
export const ptaStep2Schema = amountStepSchema(4000, 'PTA');

/** Step 3: PTA location */
export const ptaStep3Schema = locationStepSchema;
