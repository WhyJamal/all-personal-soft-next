/** Payment terms a customer can buy in one go, in months (one month = one plan period, normally 30 days).
 *  The backend accepts the same list — keep both in sync (plans.models.ALLOWED_MONTHS). */
export const PERIODS = [1, 3, 6, 12, 24] as const;
export type Period = (typeof PERIODS)[number];

export const isPeriod = (n: unknown): n is Period => PERIODS.includes(n as Period);
