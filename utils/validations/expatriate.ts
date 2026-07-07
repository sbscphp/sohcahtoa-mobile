import { z } from 'zod';
import { locationStepSchema, passportDocumentNumberField } from './shared';

/** Step 0: Expatriate credentials */
export const expatriateStep0Schema = z.object({
    bvn: z.string().optional(),
    nin: z.string().optional().or(z.literal('')),
    passportDocumentNumber: passportDocumentNumberField,
});

/** Step 1: Expatriate documents */
export const expatriateStep1Schema = z.object({
    passportIssueDate: z.string().min(1, 'Please select Passport Issue Date'),
    passportExpiryDate: z.string().min(1, 'Please select Passport Expiry Date'),
});

/** Step 2: Expatriate amount */
export const expatriateStep2Schema = z.object({
    amount: z.number().positive('Please enter a valid amount'),
});

/** Step 3: Expatriate pickup location */
export const expatriateStep3Schema = locationStepSchema;
