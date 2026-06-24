import { z } from 'zod';
import {
    amountStepSchema,
    baseCredentialSchema,
    locationStepSchema,
    passportExpiryDateField,
    passportIssueDateField,
    tinField,
} from './shared';

/** Step 0: BTA credentials — standard + TIN */
export const btaStep0Schema = baseCredentialSchema.extend({
    tinNumber: tinField,
});

/** Step 1: BTA document details */
export const btaStep1Schema = z.object({
    passportIssueDate: passportIssueDateField,
    passportExpiryDate: passportExpiryDateField,
});

/** Step 2: BTA amount */
export const btaStep2Schema = amountStepSchema(5000, 'BTA');

/** Step 3: BTA location/collection */
export const btaStep3Schema = locationStepSchema;
