import { z } from 'zod';
import { amountStepSchema, baseCredentialSchema, locationStepSchema, passportExpiryDateField, passportIssueDateField, ticketNumberField, visaNumberField } from './shared';

/** Step 0: Touring credentials (Passport) */
export const touringStep0Schema = baseCredentialSchema;

/** Step 1: Touring documents — Visa + Ticket */
export const touringStep1Schema = z.object({
    passportIssueDate: passportIssueDateField,
    passportExpiryDate: passportExpiryDateField,
    visaNumber: visaNumberField,
    ticketNumber: ticketNumberField,
});

/** Step 2: Touring amount — max $4,000 */
export const touringStep2Schema = amountStepSchema(4000, 'Tourist');

/** Step 3: Touring uses a pickup location */
export const touringStep3Schema = locationStepSchema;
