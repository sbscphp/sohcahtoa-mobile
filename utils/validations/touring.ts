import { z } from 'zod';
import { amountStepSchema, locationStepSchema, passportExpiryDateField, passportIssueDateField, touristCredentialSchema, visaNumberField } from './shared';

/** Step 0: Touring credentials (Passport) */
export const touringStep0Schema = touristCredentialSchema;

/** Step 1: Touring documents — Visa */
export const touringStep1Schema = z.object({
    passportIssueDate: passportIssueDateField,
    passportExpiryDate: passportExpiryDateField,
});

export const touringStep2Schema = z.object({
    amount: z.number().positive('Please enter a valid amount'),
});

/** Step 3: Touring uses a pickup location */
export const touringStep3Schema = locationStepSchema;
