import { z } from 'zod';
import { locationStepSchema, passportIssueDateField } from './shared';

/** Step 0: Expatriate credentials */
export const expatriateStep0Schema = z.object({
    bvn: z.string().optional(),
    nin: z.string().optional().or(z.literal('')),
    passportDocumentNumber: z.string().min(1, 'Please enter your International Passport Number'),
});

/** Step 1: Expatriate documents */
export const expatriateStep1Schema = z.object({
    passportIssueDate: passportIssueDateField,
    passportExpiryDate: z.string().min(1, 'Please select Passport Expiry Date'),
});

/** Step 2: Expatriate amount */
export const expatriateStep2Schema = z.object({
    amount: z.number().positive('Please enter a valid amount'),
});

/** Step 3: Expatriate pickup location */
export const expatriateStep3Schema = locationStepSchema;
