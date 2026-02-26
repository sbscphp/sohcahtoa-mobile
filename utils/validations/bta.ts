import { z } from 'zod';
import {
    amountStepSchema,
    bvnField,
    formAIdField,
    locationStepSchema,
    ninField,
    passportNumberField,
    tinField,
} from './shared';

/** Step 0: BTA credentials — adds TIN on top of the base set */
export const btaStep0Schema = z.object({
    bvn: bvnField,
    tin: tinField,
    nin: ninField,
    formAId: formAIdField,
    passportNumber: passportNumberField,
});

/** Step 1: BTA documents */
export const btaStep1Schema = z.object({
    tccNumber: z.string().min(1, 'Please enter your TCC number'),
    passportIssueDate: z.string().min(1, 'Please select Passport Issue Date'),
    passportExpiryDate: z.string().min(1, 'Please select Passport Expiry Date'),
    visaNumber: z.string().min(1, 'Please enter your visa number'),
});

/** Step 2: BTA amount — max $5,000 */
export const btaStep2Schema = amountStepSchema(5000, 'BTA');

/** Step 3: BTA uses a pickup location */
export const btaStep3Schema = locationStepSchema;
