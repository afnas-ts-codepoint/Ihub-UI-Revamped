/** @prototype index.html:L21355-L21357 */
export function durMins(duration: string | undefined): number {
  if (!duration || duration === '—') return 0;
  const value = Number.parseFloat(duration);
  if (duration.endsWith('d')) return value * 8 * 60;
  if (duration.endsWith('h')) return value * 60;
  return value;
}

/** @prototype index.html:L21357 */
export function fmtTotal(minutes: number): string {
  if (!minutes) return '—';
  if (minutes >= 8 * 60) {
    return `${String(Math.round((minutes / (8 * 60)) * 10) / 10)} d`;
  }
  if (minutes >= 60) {
    return `${String(Math.round((minutes / 60) * 10) / 10)} h`;
  }
  return `${String(minutes)} m`;
}
