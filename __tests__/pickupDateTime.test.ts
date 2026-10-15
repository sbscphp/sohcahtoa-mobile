import { locationStepSchema } from '@/utils/validations/shared';
import {
    getEarliestPickupTimeLabel,
    isPickupDateTimeAtLeastOneHourAhead,
} from '@/utils/pickupDateTime';

const pad = (n: number) => String(n).padStart(2, '0');
const fmtDate = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
const fmtTime = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

describe('pickup 1-hour minimum', () => {
    const now = new Date();
    const today = fmtDate(now);
    const tomorrow = fmtDate(new Date(now.getTime() + 86_400_000));

    it('rejects past and within-1hr times for today', () => {
        expect(
            isPickupDateTimeAtLeastOneHourAhead(today, fmtTime(new Date(now.getTime() - 60_000))),
        ).toBe(false);
        expect(
            isPickupDateTimeAtLeastOneHourAhead(today, fmtTime(new Date(now.getTime() + 30 * 60_000))),
        ).toBe(false);
    });

    it('accepts times 61+ min ahead today and any time tomorrow', () => {
        expect(
            isPickupDateTimeAtLeastOneHourAhead(today, fmtTime(new Date(now.getTime() + 61 * 60_000))),
        ).toBe(true);
        expect(isPickupDateTimeAtLeastOneHourAhead(tomorrow, '00:01')).toBe(true);
    });

    it('locationStepSchema flags too-soon pickupTime', () => {
        const base = {
            selectedState: { id: '1' },
            selectedCity: { id: '2' },
            selectedLocation: { id: '3' },
            pickupDate: today,
        };
        const bad = locationStepSchema.safeParse({
            ...base,
            pickupTime: fmtTime(new Date(now.getTime() + 10 * 60_000)),
        });
        expect(bad.success).toBe(false);
        if (!bad.success) {
            expect(bad.error.issues[0].path).toEqual(['pickupTime']);
        }
        const good = locationStepSchema.safeParse({
            ...base,
            pickupTime: fmtTime(new Date(now.getTime() + 61 * 60_000)),
        });
        expect(good.success).toBe(true);
    });

    it('exposes an earliest-slot label', () => {
        expect(getEarliestPickupTimeLabel()).toMatch(/\d{2}:\d{2} (AM|PM)/);
    });
});
