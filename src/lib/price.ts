/** Backend sends duration in days; 28–31 days is shown as "per month". */
export function isMonthly(durationDays: number) {
  return durationDays >= 28 && durationDays <= 31;
}
