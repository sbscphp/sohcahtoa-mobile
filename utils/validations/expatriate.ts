import { z } from 'zod';
import { locationStepSchema, utilityNumberField, workPermitNumberField } from './shared';

/** Step 0: Expatriate credentials */
export const expatriateStep0Schema = z.object({
    bvn: z.string().optional(),
    nin: z.string().length(11, 'Please enter a valid 11-digit NIN').regex(/^\d+$/, 'NIN must contain only digits'),
    passportNumber: z.string().regex(/^[A-Za-z]\d{8}$/, 'Please enter a valid International Passport Number'),
});

/** Step 1: Expatriate documents */
export const expatriateStep1Schema = z.object({
    workPermitNumber: workPermitNumberField,
    passportIssueDate: z.string().min(1, 'Please select Passport Issue Date'),
    passportExpiryDate: z.string().min(1, 'Please select Passport Expiry Date'),
    utilityBillNumber: utilityNumberField,
});

/** Step 2: Expatriate amount */
export const expatriateStep2Schema = z.object({
    amount: z.number().positive('Please enter a valid amount'),
});

/** Step 3: Expatriate pickup location */
export const expatriateStep3Schema = locationStepSchema;
