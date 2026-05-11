import { z } from 'zod';
import { amountStepSchema, baseCredentialSchema, professionalBankDetailsStepSchema } from './shared';

/** Step 0: Professional credentials — standard BVN, NIN, Form A, Passport */
export const professionalStep0Schema = baseCredentialSchema;

/** Step 1: Professional documents */
export const professionalStep1Schema = z.object({});

/** Step 2: Professional amount — max $2,000 */
export const professionalStep2Schema = amountStepSchema(2000, 'Professional');

/** Step 3: Professional uses specific bank details schema */
export const professionalStep3Schema = professionalBankDetailsStepSchema;
