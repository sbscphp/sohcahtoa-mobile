import { amountStepSchema, baseCredentialSchema, locationStepSchema } from './shared';

/** Step 0: Touring credentials — standard BVN, NIN, Form A, Passport */
export const touringStep0Schema = baseCredentialSchema;

/** Step 2: Touring amount — max $4,000 */
export const touringStep2Schema = amountStepSchema(4000, 'Tourist');

/** Step 3: Touring uses a pickup location */
export const touringStep3Schema = locationStepSchema;
