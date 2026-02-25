import { z } from 'zod';
import { amountStepSchema, baseCredentialSchema, locationStepSchema } from './shared';

/** Step 0: Touring credentials — standard BVN, NIN, Form A, Passport */
export const touringStep0Schema = baseCredentialSchema;

/** Step 1: Touring documents — validates passport dates */
export const touringStep1Schema = z.object({
    passportIssueDate: z.string().min(1, 'Please select Passport Issue Date'),
    passportExpiryDate: z.string().min(1, 'Please select Passport Expiry Date'),
});

/** Step 2: Touring amount — max $4,000 */
export const touringStep2Schema = amountStepSchema(4000, 'Tourist');

/** Step 3: Touring uses a pickup location */
export const touringStep3Schema = locationStepSchema;
