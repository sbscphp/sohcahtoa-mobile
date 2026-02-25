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

/** Step 1: School fees documents — post-grad requires passport dates */
export const schoolStep1Schema = z.object({
    passportIssueDate: z.string().min(1, 'Please select Passport Issue Date'),
    passportExpiryDate: z.string().min(1, 'Please select Passport Expiry Date'),
});

/** Step 2: School fees amount — max $15,000 (post-grad) or $10,000 (undergrad) */
export const schoolStep2Schema = (isPostGrad: boolean) =>
    amountStepSchema(isPostGrad ? 15000 : 10000, 'School Fees');

/** Step 3: School fees uses bank details */
export const schoolStep3Schema = bankDetailsStepSchema;
