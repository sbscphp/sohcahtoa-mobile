/**
 * Shared helpers for enforcing the pickup scheduling rule:
 * combined pickup date + time must be at least `bufferMinutes`
 * (default 60) ahead of the current date/time.
 *
 * Date format: "dd/mm/yyyy" (as produced by DatePickerField).
 * Time format: "HH:mm" 24-hour (as stored by TimePickerField).
 */

export const PICKUP_BUFFER_MINUTES = 60;

export const PICKUP_TOO_SOON_MESSAGE =
    'Pickup time must be at least 1 hour from now';

function pad(n: number): string {
    return String(n).padStart(2, '0');
}

export interface ParsedPickupDate {
    day: number;
    month: number;
    year: number;
}

export function parsePickupDate(s?: string): ParsedPickupDate | null {
    if (!s) return null;
    const parts = s.split('/');
    if (parts.length !== 3) return null;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    return { day, month, year };
}

export function parsePickupTime24(s?: string): { hour: number; minute: number } | null {
    if (!s) return null;
    const parts = s.split(':');
    if (parts.length < 2) return null;
    const hour = parseInt(parts[0], 10);
    const minute = parseInt(parts[1], 10);
    if (isNaN(hour) || isNaN(minute)) return null;
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
    return { hour, minute };
}

/** Combine a dd/mm/yyyy date + HH:mm time into a local Date, or null if unparseable. */
export function buildPickupDateTime(
    dateStr?: string,
    timeStr?: string,
): Date | null {
    const d = parsePickupDate(dateStr);
    const t = parsePickupTime24(timeStr);
    if (!d || !t) return null;
    return new Date(d.year, d.month - 1, d.day, t.hour, t.minute, 0, 0);
}

/** True when both fields are present but the combined datetime is unparseable. */
export function isPickupDateTimeUnparseable(
    dateStr?: string,
    timeStr?: string,
): boolean {
    if (!dateStr || !timeStr) return false;
    return buildPickupDateTime(dateStr, timeStr) === null;
}

/**
 * Core rule: returns true when the pickup slot is selectable, i.e.
 * combined datetime >= now + bufferMinutes.
 * Returns true when either field is missing/unparseable so that
 * required-field messages take precedence (callers decide).
 */
export function isPickupDateTimeAtLeastOneHourAhead(
    dateStr?: string,
    timeStr?: string,
    bufferMinutes: number = PICKUP_BUFFER_MINUTES,
    now: Date = new Date(),
): boolean {
    const slot = buildPickupDateTime(dateStr, timeStr);
    if (!slot) return true;
    return slot.getTime() >= now.getTime() + bufferMinutes * 60_000;
}

/** Earliest selectable slot label, e.g. "02:30 PM", for error messages. */
export function getEarliestPickupTimeLabel(
    bufferMinutes: number = PICKUP_BUFFER_MINUTES,
    now: Date = new Date(),
): string {
    const earliest = new Date(now.getTime() + bufferMinutes * 60_000);
    const period = earliest.getHours() >= 12 ? 'PM' : 'AM';
    const h12 = earliest.getHours() % 12 || 12;
    return `${pad(h12)}:${pad(earliest.getMinutes())} ${period}`;
}

/** Earliest selectable 24h time parts (for picker defaulting). */
export function getEarliestPickupDate(
    bufferMinutes: number = PICKUP_BUFFER_MINUTES,
    now: Date = new Date(),
): Date {
    return new Date(now.getTime() + bufferMinutes * 60_000);
}
