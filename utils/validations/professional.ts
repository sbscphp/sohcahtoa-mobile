import { amountStepSchema, bankDetailsStepSchema, baseCredentialSchema } from './shared';

/** Step 0: Professional credentials — standard BVN, NIN, Form A, Passport */
export const professionalStep0Schema = baseCredentialSchema;

/** Step 2: Professional amount — max $2,000 */
export const professionalStep2Schema = amountStepSchema(2000, 'Professional');

/** Step 3: Professional uses bank details */
export const professionalStep3Schema = bankDetailsStepSchema;
