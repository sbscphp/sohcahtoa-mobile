import { z } from 'zod';
import {
    amountStepSchema,
    baseCredentialSchema,
} from './shared';


import { passportExpiryDateField, passportIssueDateField } from './shared';

export const schoolStep0Schema = baseCredentialSchema.omit({ bvn: true }).extend({
    admissionType: z.string().min(1, 'Please select an admission type'),
    passportIssueDate: passportIssueDateField,
    passportExpiryDate: passportExpiryDateField,
});




export const schoolStep2Schema = (isPostGrad: boolean) =>
    amountStepSchema(10000, 'School Fees');

import { professionalStep3Schema } from './professional';


export const schoolStep3Schema = professionalStep3Schema.extend({
    studentName: z.string().optional(),
    studentPassportNumber: z.string().optional(),
    admissionNumber: z.string().optional(),
});
